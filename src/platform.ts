import { matches, players, formatCurrency } from './data';
import { toGhs } from './currency';
import { calcPayout } from './screens/CreateMatch';
import type { MatchRecord } from './App';

export type LiveState = {
  locked: number; // in the user's currency
  currency: string;
  username: string;
  country: string;
  stats: { wins: number; losses: number; streak: number; xp: number };
  disputeActive: boolean;
  verified: boolean;
  history?: MatchRecord[];
};

const MIN = 60000;
const ts = (iso: string) => new Date(iso).getTime();

// The demo matches in data.ts are dated Sep 2025. Shift them so the newest one reads "3 minutes ago".
const ANCHOR = Math.max(...matches.map(m => ts(m.resolvedAt ?? m.createdAt)));
export const seedTime = (iso: string) => Date.now() - 3 * MIN - (ANCHOR - ts(iso));

export function ago(t: number) {
  const min = Math.floor((Date.now() - t) / MIN);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

export function platformStats(live: LiveState) {
  const history = live.history ?? [];

  // Escrow: both stakes are held for every live or disputed match
  const inEscrow = matches.filter(m => m.status === 'live' || m.status === 'disputed');
  const seedEscrow = inEscrow.reduce((s, m) => s + toGhs(m.wagerAmount, m.currency) * 2, 0);
  const escrowGhs = seedEscrow + toGhs(live.locked, live.currency) * 2;
  const escrowCount = inEscrow.length + (live.locked > 0 ? 1 : 0);

  // Disputes
  const seedDisputes = matches.filter(m => m.status === 'disputed');
  const pendingDisputes = seedDisputes.length + (live.disputeActive ? 1 : 0);
  const oldestWait =
    [...seedDisputes].sort((a, b) => parseFloat(b.timeWaiting ?? '0') - parseFloat(a.timeWaiting ?? '0'))[0]?.timeWaiting ?? null;

  // KYC queue: basic-tier players awaiting full verification, plus your account if it's pending
  const kycQueue = players.filter(p => p.kycTier === 'basic').length + (live.verified ? 0 : 1);

  // Settled matches
  const dayAgo = Date.now() - 24 * 60 * MIN;
  const seedSettled = matches.filter(m => m.status === 'completed');
  const settled = seedSettled.length + live.stats.wins + live.stats.losses;
  const settled24 =
    seedSettled.filter(m => seedTime(m.resolvedAt ?? m.createdAt) >= dayAgo).length +
    history.filter(h => ts(h.date) >= dayAgo).length;

  // Match volume, last 7 days
  const d0 = new Date();
  const today0 = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate()).getTime();
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const start = today0 - (6 - i) * 86400000;
    const end = start + 86400000;
    const inDay = (t: number) => t >= start && t < end;
    return {
      day: new Date(start).toLocaleDateString('en-US', { weekday: 'short' }),
      matches:
        matches.filter(m => inDay(seedTime(m.createdAt))).length +
        history.filter(h => inDay(ts(h.date))).length,
    };
  });

  // Recent activity
  const events: { id: string; icon: string; text: string; at: number }[] = [];
  matches.forEach(m => {
    const a = m.playerA.username;
    const b = m.playerB?.username ?? '—';
    if (m.status === 'completed' && m.winner) {
      events.push({ id: `${m.id}-r`, icon: '✅', at: seedTime(m.resolvedAt ?? m.createdAt), text: `Match ${m.id} resolved — ${m.winner.username} wins ${formatCurrency(calcPayout(m.wagerAmount).winnings, m.currency)}` });
    } else if (m.status === 'disputed') {
      events.push({ id: `${m.id}-d`, icon: '🚨', at: seedTime(m.createdAt), text: `Dispute raised — ${m.id}, ${m.game}, ${formatCurrency(m.wagerAmount, m.currency)}` });
    } else if (m.status === 'live') {
      events.push({ id: `${m.id}-l`, icon: '🎮', at: seedTime(m.createdAt), text: `Match ${m.id} live — ${a} vs ${b}, ${m.game}` });
    } else if (m.status === 'pending') {
      events.push({ id: `${m.id}-p`, icon: '🕒', at: seedTime(m.createdAt), text: `Match ${m.id} open — ${a} waiting for an opponent` });
    } else if (m.status === 'cancelled') {
      events.push({ id: `${m.id}-c`, icon: '❌', at: seedTime(m.createdAt), text: `Match ${m.id} cancelled — ${a} vs ${b}` });
    }
  });
  history.forEach(h =>
    events.push({
      id: h.id,
      icon: h.result === 'won' ? '✅' : '📉',
      at: ts(h.date),
      text: `${live.username} ${h.result === 'won' ? 'won' : 'lost'} ${live.currency} ${h.amount.toFixed(2)} — ${h.game} ${h.mode}`,
    })
  );
  if (live.disputeActive) events.push({ id: 'live-dispute', icon: '🚨', at: Date.now(), text: `Dispute raised — ${live.username}, under review` });
  if (!live.verified) events.push({ id: 'live-kyc', icon: '🆔', at: Date.now(), text: `KYC submitted — ${live.username}, ${live.country}` });
  if (live.locked > 0) events.push({ id: 'live-lock', icon: '🔒', at: Date.now() - 1, text: `Escrow locked — ${live.username}, ${live.currency} ${live.locked.toFixed(2)}` });

  const activity = events
    .sort((x, y) => y.at - x.at)
    .slice(0, 8)
    .map(e => ({ ...e, time: ago(e.at) }));

  return { escrowGhs, escrowCount, pendingDisputes, oldestWait, kycQueue, settled, settled24, chartData, activity };
}