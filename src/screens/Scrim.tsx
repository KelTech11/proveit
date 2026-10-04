import { useState, useEffect, useRef } from 'react';
import { useProfile } from '../profile';
import { fromGhs } from '../currency';
import { GAME_DETAILS, FEE_FREE_PERIOD, calcPayout } from './CreateMatch';

type Phase = 'setup' | 'lobby' | 'series' | 'result';
type Outcome = 'won' | 'lost' | 'refund';
type Side = 'us' | 'them';
type Claim = null | 'won' | 'lost';
type Player = { name: string; uid: string };

const MODES = ['Hardpoint', 'Search & Destroy', 'Control'];
const STARTERS = 5;
const MAX_SUBS = 3;
const MIN_UID_LENGTH = 6;
const STAKE_PRESETS_GHS = [100, 200, 500, 1000, 2000];
const MIN_STAKE_GHS = 50;
const CLAN_KEY = 'proveit_clan';

const RIVALS = {
  GH: { clan: 'Accra Titans', master: 'AbenaElite', players: ['Kofi', 'Yaw', 'Kwesi', 'Nii', 'Selorm'] },
  NG: { clan: 'Lagos Legion', master: 'TundeSniper', players: ['Emeka', 'Chidi', 'Seun', 'Bola', 'Dayo'] },
};

const emptyPlayers = (n: number): Player[] => Array.from({ length: n }, () => ({ name: '', uid: '' }));
const patch = (list: Player[], i: number, change: Partial<Player>): Player[] =>
  list.map((x, k) => (k === i ? { ...x, ...change } : x));

const loadClan = (): { name: string; starters: Player[]; subs: Player[] } => {
  try {
    const c = JSON.parse(localStorage.getItem(CLAN_KEY) || 'null');
    if (c && typeof c.name === 'string' && Array.isArray(c.starters) && Array.isArray(c.subs)) {
      return {
        name: c.name,
        starters: emptyPlayers(STARTERS).map((p, i) => ({ ...p, ...(c.starters[i] || {}) })),
        subs: emptyPlayers(MAX_SUBS).map((p, i) => ({ ...p, ...(c.subs[i] || {}) })),
      };
    }
  } catch {}
  return { name: '', starters: emptyPlayers(STARTERS), subs: emptyPlayers(MAX_SUBS) };
};

function Banner({ cover, eyebrow, title, sub, onBack }: { cover: string; eyebrow: string; title: string; sub: string; onBack?: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#0B0B0F] border border-gray-800 shadow-lg p-5 sm:p-8 min-h-[170px] sm:min-h-[210px] flex flex-col justify-end">
      <img src={cover} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20 pointer-events-none" />
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-4 left-4 z-10 text-xs font-bold text-gray-200 hover:text-white bg-black/40 backdrop-blur px-3 py-1.5 rounded-full border border-white/10 transition-colors"
        >
          ← Back
        </button>
      )}
      <div className="relative z-10">
        <p className="text-[#4ADE80] text-[10px] sm:text-[11px] font-black uppercase tracking-widest mb-1">{eyebrow}</p>
        <h1 className="text-3xl sm:text-5xl font-black text-white leading-none" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{title}</h1>
        <p className="text-gray-300 text-xs sm:text-sm font-medium mt-2">{sub}</p>
      </div>
    </div>
  );
}

function Roster({ title, tag, tagClass, players, accent }: { title: string; tag: string; tagClass: string; players: Player[]; accent: string }) {
  return (
    <div className={`rounded-2xl border-2 ${accent} bg-white p-4`}>
      <div className="flex items-center justify-between mb-3 gap-2">
        <p className="font-black text-gray-900 text-sm truncate" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{title}</p>
        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 ${tagClass}`}>{tag}</span>
      </div>
      <div className="space-y-1.5">
        {players.map((p, i) => (
          <div key={i} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-1.5">
            <span className="font-bold text-gray-800 truncate">{p.name.trim() || `Player ${i + 1}`}</span>
            <span className="font-mono text-gray-400 shrink-0 ml-2">{p.uid}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Scrim({
  onNavigate,
  balance,
  onLock,
  onScrimEnd,
  onNotify,
}: {
  onNavigate: (s: string) => void;
  balance: number;
  onLock: (amount: number) => void;
  onScrimEnd: (result: Outcome, stake: number, payout: number) => void;
  onNotify: (type: 'match_invite' | 'dispute_alert' | 'payout', title: string, body: string) => void;
}) {
  const { profile } = useProfile();
  const cur = profile.currency;
  const rival = profile.country === 'NG' ? RIVALS.NG : RIVALS.GH;
  const rivalRoster: Player[] = rival.players.map((n, i) => ({ name: n, uid: String(61827400 + i * 1319) }));
  const cover = GAME_DETAILS.CODM.coverUrl;
  const money = (n: number) => `${cur} ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const presets = STAKE_PRESETS_GHS.map(p => fromGhs(p, cur));
  const minStake = fromGhs(MIN_STAKE_GHS, cur);

  // ---------- setup ----------
  const [saved] = useState(loadClan);
  const [phase, setPhase] = useState<Phase>('setup');
  const [clanName, setClanName] = useState(saved.name);
  const [starters, setStarters] = useState<Player[]>(saved.starters);
  const [subs, setSubs] = useState<Player[]>(saved.subs);
  const [stake, setStake] = useState(0);

  const { pot, fee, winnings } = calcPayout(stake);
  const startersOk = starters.every(p => p.uid.trim().length >= MIN_UID_LENGTH);
  const subsOk = subs.every(p => (!p.uid.trim() && !p.name.trim()) || p.uid.trim().length >= MIN_UID_LENGTH);
  const filledSubs = subs.filter(p => p.uid.trim().length >= MIN_UID_LENGTH);
  const allUids = [...starters, ...filledSubs].map(p => p.uid.trim());
  const hasDuplicate = new Set(allUids).size !== allUids.length;
  const lowStake = stake > 0 && stake < minStake;
  const overBalance = stake > balance;
  const canCreate = clanName.trim().length >= 2 && startersOk && subsOk && !hasDuplicate && stake >= minStake && !overBalance;

  // ---------- lobby ----------
  const [active, setActive] = useState<Player[]>([]);
  const [bench, setBench] = useState<Player[]>([]);
  const [accepted, setAccepted] = useState(false);
  const [started, setStarted] = useState(false);
  const [oppReady, setOppReady] = useState(false);
  const [locked, setLocked] = useState(false);

  // ---------- series ----------
  const [results, setResults] = useState<(Side | null)[]>([null, null, null]);
  const [claim, setClaim] = useState<Claim>(null);
  const [oppClaim, setOppClaim] = useState<Claim>(null);
  const [shot, setShot] = useState<{ url: string; name: string } | null>(null);
  const [videoName, setVideoName] = useState<string | null>(null);
  const [disputeStage, setDisputeStage] = useState<'none' | 'review'>('none');
  const [swapFrom, setSwapFrom] = useState<number | null>(null);
  const [postpone, setPostpone] = useState<null | 'asked' | 'declined'>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const shotInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const ended = useRef(false);

  const usWins = results.filter(r => r === 'us').length;
  const themWins = results.filter(r => r === 'them').length;
  const gameIdx = results.findIndex(r => r === null);
  const seriesOver = usWins >= 2 || themWins >= 2;
  const conflict = claim === 'won' && oppClaim === 'won';
  const label = (p: Player) => p.name.trim() || p.uid;

  const createScrim = () => {
    try {
      localStorage.setItem(CLAN_KEY, JSON.stringify({ name: clanName.trim(), starters, subs }));
    } catch {}
    setActive(starters.map(p => ({ name: p.name.trim(), uid: p.uid.trim() })));
    setBench(filledSubs.map(p => ({ name: p.name.trim(), uid: p.uid.trim() })));
    setPhase('lobby');
  };

  const finish = (o: Outcome) => {
    if (ended.current) return;
    ended.current = true;
    onScrimEnd(o, stake, o === 'won' ? winnings : 0);
    setOutcome(o);
    setPhase('result');
  };

  const settleGame = (idx: number, side: Side) => {
    setResults(r => r.map((v, i) => (i === idx ? side : v)));
    setClaim(null);
    setOppClaim(null);
    setDisputeStage('none');
    setVideoName(null);
    if (shot) URL.revokeObjectURL(shot.url);
    setShot(null);
    onNotify('match_invite', `Game ${idx + 1} confirmed`, `${MODES[idx]}: ${side === 'us' ? clanName.trim() : rival.clan} won.`);
  };

  const handleShot = (list: FileList | null | undefined) => {
    const f = list?.[0];
    if (!f || !f.type.startsWith('image/') || f.size > 10 * 1024 * 1024) return;
    if (shot) URL.revokeObjectURL(shot.url);
    setShot({ url: URL.createObjectURL(f), name: f.name });
  };

  const doSwap = (activeIdx: number) => {
    if (swapFrom === null) return;
    const incoming = bench[swapFrom];
    const outgoing = active[activeIdx];
    setActive(a => a.map((p, i) => (i === activeIdx ? incoming : p)));
    setBench(b => b.map((p, i) => (i === swapFrom ? outgoing : p)));
    setSwapFrom(null);
  };

  // Lobby: opposing clan master accepts
  useEffect(() => {
    if (phase !== 'lobby') return;
    const t = setTimeout(() => setAccepted(true), 2500);
    return () => clearTimeout(t);
  }, [phase]);

  // Lobby: opposing clan master presses Start 2s after you
  useEffect(() => {
    if (!started) return;
    const t = setTimeout(() => {
      setOppReady(true);
      onNotify('match_invite', 'Opposing clan is ready', `${rival.master} pressed Start for ${rival.clan}. Funds are locking now.`);
    }, 2000);
    return () => clearTimeout(t);
  }, [started]);

  // Lobby: both ready, so lock funds and begin the series
  useEffect(() => {
    if (!started || !oppReady) return;
    onLock(stake);
    setLocked(true);
    const t = setTimeout(() => setPhase('series'), 1800);
    return () => clearTimeout(t);
  }, [started, oppReady]);

  // Series: the opposing clan master responds to your claim (demo)
  useEffect(() => {
    if (!claim || oppClaim) return;
    const t = setTimeout(() => {
      const opp: 'won' | 'lost' = claim === 'won' ? (Math.random() < 0.7 ? 'lost' : 'won') : 'won';
      setOppClaim(opp);
      if (claim === 'won' && opp === 'won') {
        onNotify('dispute_alert', 'Game disputed', 'Both clan masters claimed the win. Upload your screen recording for review.');
      }
    }, 3000);
    return () => clearTimeout(t);
  }, [claim, oppClaim]);

  // Series: both clan masters agree, so the game is confirmed
  useEffect(() => {
    if (!claim || !oppClaim || conflict || gameIdx < 0) return;
    const t = setTimeout(() => settleGame(gameIdx, claim === 'won' ? 'us' : 'them'), 1200);
    return () => clearTimeout(t);
  }, [claim, oppClaim]);

  // Series: a disputed game is decided by manual review (demo)
  useEffect(() => {
    if (disputeStage !== 'review' || gameIdx < 0) return;
    const t = setTimeout(() => settleGame(gameIdx, Math.random() < 0.5 ? 'us' : 'them'), 5000);
    return () => clearTimeout(t);
  }, [disputeStage]);

  // Series: first clan to 2 wins takes the pot
  useEffect(() => {
    if (phase !== 'series' || !seriesOver) return;
    const t = setTimeout(() => finish(usWins >= 2 ? 'won' : 'lost'), 1800);
    return () => clearTimeout(t);
  }, [phase, seriesOver]);

  // Series: postponement needs both clan masters to agree
  useEffect(() => {
    if (postpone !== 'asked') return;
    const t = setTimeout(() => {
      if (Math.random() < 0.6) {
        finish('refund');
      } else {
        setPostpone('declined');
        onNotify('match_invite', 'Postponement declined', `${rival.master} wants to keep playing. The series continues.`);
      }
    }, 3000);
    return () => clearTimeout(t);
  }, [postpone]);

  const shell = 'min-h-screen bg-[#F4F7F9] text-gray-900 font-sans p-3 sm:p-6 flex flex-col items-center';
  const card = 'bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6';
  const inputCls = 'w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-base sm:text-sm outline-none focus:border-[#16A34A] transition-colors';
  const heading = { fontFamily: 'Chakra Petch, sans-serif' } as const;

  // ================= SETUP =================
  if (phase === 'setup') {
    return (
      <div className={shell}>
        <div className="max-w-[760px] w-full space-y-4 sm:space-y-6">
          <Banner
            cover={cover}
            eyebrow="Call of Duty: Mobile · 5v5"
            title="Clan Scrim"
            sub="Face another clan. Three modes. First to 2 wins takes the pot."
            onBack={() => onNavigate('back')}
          />

          <div className={card}>
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">Clan name</p>
            <input type="text" value={clanName} onChange={e => setClanName(e.target.value)} placeholder="e.g. Kumasi Kings" className={inputCls} />
            <p className="text-[11px] text-gray-400 mt-2">You're the clan master. You fund the stake, submit results and receive any winnings.</p>
          </div>

          <div className={card}>
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">Stake per clan ({cur})</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {presets.map(p => (
                <button
                  key={p}
                  onClick={() => setStake(p)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-colors ${
                    stake === p ? 'border-[#16A34A] bg-green-50 text-[#16A34A]' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {p.toLocaleString('en-US')}
                </button>
              ))}
            </div>
            <input
              type="number"
              inputMode="numeric"
              value={stake || ''}
              onChange={e => setStake(Math.max(0, Number(e.target.value)))}
              placeholder={`Custom amount (min ${minStake})`}
              className={`${inputCls} sm:w-64`}
            />
            {lowStake && <p className="text-xs text-red-500 mt-2">Minimum stake is {money(minStake)}.</p>}
            {overBalance && (
              <p className="text-xs text-red-500 mt-2">
                That's more than your balance ({money(balance)}).{' '}
                <button onClick={() => onNavigate('deposit')} className="font-bold underline">Deposit funds</button>
              </p>
            )}

            <div className="mt-4 rounded-2xl bg-gray-50 border border-gray-100 p-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Your stake</span><span className="font-bold text-gray-900">{money(stake)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Opposing clan stake</span><span className="font-bold text-gray-900">{money(stake)}</span></div>
              <div className="flex justify-between text-gray-600 border-t border-gray-200 pt-2"><span>Total pot</span><span className="font-bold text-gray-900">{money(pot)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Platform fee ({FEE_FREE_PERIOD ? 'waived' : '10%'})</span><span className="font-bold text-gray-900">- {money(fee)}</span></div>
              <div className="flex justify-between border-t border-gray-200 pt-2"><span className="font-bold text-gray-900">Winning clan receives</span><span className="font-black text-[#16A34A]">{money(winnings)}</span></div>
            </div>
          </div>

          <div className={card}>
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3">Starting five (CODM UIDs)</p>
            <div className="space-y-2">
              {starters.map((p, i) => (
                <div key={i} className="grid grid-cols-2 gap-2">
                  <input type="text" value={p.name} onChange={e => setStarters(patch(starters, i, { name: e.target.value }))} placeholder={`Player ${i + 1} name (optional)`} className={inputCls} />
                  <input type="text" inputMode="numeric" value={p.uid} onChange={e => setStarters(patch(starters, i, { uid: e.target.value.replace(/\D/g, '') }))} placeholder="UID" className={inputCls} />
                </div>
              ))}
            </div>

            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mt-5 mb-1">Substitutes (up to {MAX_SUBS})</p>
            <p className="text-[11px] text-gray-400 mb-3">You can swap a sub in between games.</p>
            <div className="space-y-2">
              {subs.map((p, i) => (
                <div key={i} className="grid grid-cols-2 gap-2">
                  <input type="text" value={p.name} onChange={e => setSubs(patch(subs, i, { name: e.target.value }))} placeholder={`Sub ${i + 1} name (optional)`} className={inputCls} />
                  <input type="text" inputMode="numeric" value={p.uid} onChange={e => setSubs(patch(subs, i, { uid: e.target.value.replace(/\D/g, '') }))} placeholder="UID" className={inputCls} />
                </div>
              ))}
            </div>
            {hasDuplicate && <p className="text-xs text-red-500 mt-3">Each player needs a different UID.</p>}
            <p className="text-[11px] text-gray-400 mt-3">Players don't need ProveIt accounts. Your clan is saved in this browser for next time.</p>
          </div>

          <div className={card}>
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3">Format and rules</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {MODES.map((m, i) => (
                <span key={m} className="px-3 py-1.5 rounded-xl bg-gray-900 text-white text-xs font-bold">Game {i + 1}: {m}</span>
              ))}
            </div>
            <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-4">
              <li>First clan to win 2 games takes the pot. If it's 2-0, game 3 isn't played.</li>
              <li>Each game needs a final scoreboard screenshot. Conflicting claims go to review with a screen recording.</li>
              <li>If a clan master leaves mid-series, the other clan wins the pot.</li>
              <li>If both clan masters agree to postpone (for example a network issue), both are refunded.</li>
              <li>Funds lock in escrow only when both clan masters press Start. Same-country scrims only.</li>
            </ul>
          </div>

          <button
            disabled={!canCreate}
            onClick={createScrim}
            className={`w-full px-8 py-3.5 rounded-xl font-bold text-sm text-white transition-all shadow-md ${
              canCreate ? 'bg-[#16A34A] hover:bg-[#15803d] hover:-translate-y-0.5' : 'bg-gray-300 cursor-not-allowed shadow-none'
            }`}
            style={heading}
          >
            Create scrim and find opponent →
          </button>
        </div>
      </div>
    );
  }

  // ================= LOBBY =================
  if (phase === 'lobby') {
    return (
      <div className={shell}>
        <div className="max-w-[900px] w-full space-y-4 sm:space-y-6">
          <Banner cover={cover} eyebrow="Scrim lobby" title={`${clanName.trim()} vs ${rival.clan}`} sub={`${money(stake)} each. Winning clan receives ${money(winnings)}.`} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Roster title={clanName.trim()} tag={started ? 'Ready' : 'Waiting'} tagClass={started ? 'bg-green-50 text-[#16A34A]' : 'bg-amber-50 text-amber-600'} players={active} accent="border-blue-300" />
            {accepted ? (
              <Roster title={rival.clan} tag={oppReady ? 'Ready' : 'Waiting'} tagClass={oppReady ? 'bg-green-50 text-[#16A34A]' : 'bg-amber-50 text-amber-600'} players={rivalRoster} accent="border-purple-300" />
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-6 flex flex-col items-center justify-center text-center">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse mb-3" />
                <p className="text-sm font-black text-gray-900" style={heading}>Finding an opposing clan...</p>
                <p className="text-xs text-gray-500 mt-1">Waiting for a clan master to accept your challenge.</p>
              </div>
            )}
          </div>

          {bench.length > 0 && (
            <p className="text-xs text-gray-500 text-center">Your subs: {bench.map(label).join(', ')}</p>
          )}

          <div className="rounded-2xl bg-green-50/60 border border-green-100 px-4 py-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#16A34A] text-white flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-900">
                {locked
                  ? 'Funds locked in escrow. Starting the series...'
                  : started
                    ? 'Waiting for the opposing clan master to press Start...'
                    : `${money(stake)} locks in escrow once both clan masters press Start`}
              </p>
              <p className="text-[11px] sm:text-xs text-gray-600">No cancelling once funds are locked. Leaving mid-series is a forfeit.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('back')}
              disabled={started}
              className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl bg-[#27272A] hover:bg-black text-white font-bold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={heading}
            >
              Cancel
            </button>
            <button
              onClick={() => setStarted(true)}
              disabled={!accepted || started}
              className="flex-1 px-8 py-3.5 rounded-xl bg-[#16A34A] hover:bg-[#15803d] text-white font-bold text-sm shadow-md transition-colors disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
              style={heading}
            >
              {locked ? 'Funds locked...' : started ? 'Waiting for opponent...' : accepted ? 'Start scrim →' : 'Waiting for opponent'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= SERIES =================
  if (phase === 'series') {
    const current = gameIdx >= 0 && !seriesOver ? gameIdx : -1;
    return (
      <div className={shell}>
        <div className="max-w-[900px] w-full space-y-4 sm:space-y-6">
          <Banner
            cover={cover}
            eyebrow={`Live series · ${money(stake)} each`}
            title={`${usWins} – ${themWins}`}
            sub={`${clanName.trim()} vs ${rival.clan}. First to 2 wins takes ${money(winnings)}.`}
          />

          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {MODES.map((m, i) => {
              const r = results[i];
              const isCurrent = i === current;
              const badge =
                r === 'us' ? { t: 'We won', c: 'bg-green-50 text-[#16A34A]' }
                : r === 'them' ? { t: 'They won', c: 'bg-red-50 text-red-500' }
                : isCurrent ? { t: 'In play', c: 'bg-amber-50 text-amber-600' }
                : seriesOver ? { t: 'Not needed', c: 'bg-gray-100 text-gray-400' }
                : { t: 'Up next', c: 'bg-gray-100 text-gray-500' };
              return (
                <div key={m} className={`rounded-2xl border-2 bg-white p-3 sm:p-4 text-center ${isCurrent ? 'border-[#16A34A]' : 'border-gray-100'}`}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Game {i + 1}</p>
                  <p className="text-xs sm:text-sm font-black text-gray-900 mt-1" style={heading}>{m}</p>
                  <span className={`inline-block mt-2 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${badge.c}`}>{badge.t}</span>
                </div>
              );
            })}
          </div>

          {seriesOver && (
            <div className="rounded-2xl bg-green-50 border border-green-200 px-4 py-4 text-center">
              <p className="text-sm font-black text-gray-900" style={heading}>
                {usWins >= 2 ? `${clanName.trim()} takes the series` : `${rival.clan} takes the series`}
              </p>
              <p className="text-xs text-gray-600 mt-1">Settling the pot...</p>
            </div>
          )}

          {current >= 0 && (
            <div className={card}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-gray-900 text-base" style={heading}>Game {current + 1}: {MODES[current]}</h3>
                <span className="text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">In play</span>
              </div>

              <input ref={shotInput} type="file" accept="image/png,image/jpeg" className="hidden" onChange={e => { handleShot(e.target.files); e.target.value = ''; }} />
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">Final scoreboard screenshot</p>
              {shot ? (
                <div className="relative h-32 rounded-xl overflow-hidden border border-gray-200 bg-gray-900 mb-4">
                  <img src={shot.url} alt="Scoreboard" className="w-full h-full object-cover" />
                  {!claim && (
                    <button
                      onClick={() => { URL.revokeObjectURL(shot.url); setShot(null); }}
                      aria-label="Remove screenshot"
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white text-xs font-bold flex items-center justify-center"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => shotInput.current?.click()}
                  className="w-full rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 hover:border-green-400 hover:bg-green-50/30 p-6 flex flex-col items-center gap-1 transition-all mb-4"
                >
                  <p className="text-xs font-bold text-gray-900" style={heading}>Tap to upload the scoreboard</p>
                  <p className="text-[10px] text-gray-400">PNG, JPG up to 10MB</p>
                </button>
              )}

              {shot && !claim && (
                <div>
                  <p className="text-sm font-black text-gray-900 mb-1" style={heading}>What was the result?</p>
                  <p className="text-[11px] text-gray-500 mb-3">The opposing clan master gets to respond. False claims get flagged.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setClaim('won')} className="py-4 rounded-2xl bg-green-50 border-2 border-green-200 hover:border-green-400 transition-colors flex flex-col items-center gap-1">
                      <span className="text-2xl">🏆</span>
                      <span className="text-xs font-black text-green-700">We won</span>
                    </button>
                    <button onClick={() => setClaim('lost')} className="py-4 rounded-2xl bg-gray-50 border-2 border-gray-200 hover:border-gray-400 transition-colors flex flex-col items-center gap-1">
                      <span className="text-2xl">🤝</span>
                      <span className="text-xs font-black text-gray-600">We lost</span>
                    </button>
                  </div>
                </div>
              )}

              {claim && (
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{clanName.trim()}</p>
                    <span className="text-xs font-black text-gray-700">{claim === 'won' ? 'Claimed the win' : 'Reported a loss'}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{rival.clan}</p>
                    {!oppClaim ? (
                      <span className="text-xs font-bold text-amber-600 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />Waiting to respond</span>
                    ) : (
                      <span className="text-xs font-black text-gray-700">{oppClaim === 'won' ? 'Claimed the win' : 'Reported a loss'}</span>
                    )}
                  </div>
                </div>
              )}

              {conflict && disputeStage === 'none' && (
                <div className="mt-4 rounded-2xl border-2 border-red-200 p-4">
                  <p className="text-sm font-black text-red-700 mb-1" style={heading}>Both clan masters claimed the win</p>
                  <p className="text-[11px] text-gray-500 mb-3">Upload your full screen recording of this game. It goes to manual review and the pot stays in escrow.</p>
                  <input ref={videoInput} type="file" accept="video/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f && f.type.startsWith('video/')) setVideoName(f.name); e.target.value = ''; }} />
                  {videoName ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-100 mb-3">
                      <span className="text-xs font-bold text-green-700 truncate">{videoName}</span>
                      <button onClick={() => setVideoName(null)} className="text-xs font-bold text-gray-400 hover:text-red-500 shrink-0 ml-2">Remove</button>
                    </div>
                  ) : (
                    <button onClick={() => videoInput.current?.click()} className="w-full rounded-2xl border-2 border-dashed border-red-200 bg-red-50/50 hover:border-red-400 p-5 mb-3 text-xs font-bold text-gray-900">
                      Tap to upload screen recording
                    </button>
                  )}
                  <button
                    disabled={!videoName}
                    onClick={() => {
                      setDisputeStage('review');
                      onNotify('dispute_alert', 'Dispute under review', 'Your recording was submitted. The pot is held while we review this game.');
                    }}
                    className={`w-full py-3 rounded-xl font-bold text-white text-sm transition-colors ${videoName ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-300 cursor-not-allowed'}`}
                  >
                    Submit for manual review
                  </button>
                </div>
              )}

              {conflict && disputeStage === 'review' && (
                <div className="mt-4 rounded-2xl bg-blue-50 border border-blue-100 px-4 py-3">
                  <p className="text-xs font-black text-blue-900 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />Game {current + 1} is under review</p>
                  <p className="text-[11px] text-blue-800/80 mt-1">The pot is held in escrow. The series continues once our team decides.</p>
                </div>
              )}
            </div>
          )}

          {current >= 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={card}>
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3">Your lineup</p>
                <div className="space-y-1.5">
                  {active.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-1.5">
                      <span className="font-bold text-gray-800 truncate">{label(p)}</span>
                      <span className="font-mono text-gray-400 shrink-0 ml-2">{p.uid}</span>
                    </div>
                  ))}
                </div>
                {bench.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">Subs</p>
                    <div className="space-y-1.5">
                      {bench.map((p, i) => (
                        <div key={i} className="flex items-center justify-between text-xs bg-amber-50/60 rounded-lg px-3 py-1.5">
                          <span className="font-bold text-gray-800 truncate">{label(p)}</span>
                          {!claim && (
                            <button onClick={() => setSwapFrom(swapFrom === i ? null : i)} className="text-[11px] font-black text-[#16A34A] shrink-0 ml-2">
                              {swapFrom === i ? 'Cancel' : 'Swap in'}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {swapFrom !== null && !claim && (
                      <div className="mt-3 rounded-xl border border-green-200 bg-green-50/50 p-3">
                        <p className="text-[11px] font-bold text-gray-700 mb-2">Swap {label(bench[swapFrom])} in for:</p>
                        <div className="flex flex-wrap gap-2">
                          {active.map((p, i) => (
                            <button key={i} onClick={() => doSwap(i)} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-[#16A34A] text-xs font-bold text-gray-700">
                              {label(p)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className={card}>
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3">Series controls</p>
                {postpone === 'asked' && (
                  <p className="text-xs font-bold text-amber-600 flex items-center gap-2 mb-3"><span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />Waiting for {rival.master} to agree to postpone...</p>
                )}
                {postpone === 'declined' && (
                  <p className="text-xs font-bold text-gray-500 mb-3">{rival.master} declined. The series continues.</p>
                )}
                <button
                  disabled={!!claim || postpone === 'asked'}
                  onClick={() => setPostpone('asked')}
                  className="w-full py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mb-2"
                >
                  Request postponement (both must agree)
                </button>
                {!confirmLeave ? (
                  <button onClick={() => setConfirmLeave(true)} className="w-full py-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-xs font-bold text-red-600 transition-colors">
                    Leave series (forfeit)
                  </button>
                ) : (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3">
                    <p className="text-[11px] font-bold text-red-700 mb-2">Leaving counts as a forfeit. {rival.clan} wins the pot.</p>
                    <div className="flex gap-2">
                      <button onClick={() => setConfirmLeave(false)} className="flex-1 py-2 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-700">Stay</button>
                      <button onClick={() => finish('lost')} className="flex-1 py-2 rounded-lg bg-red-600 text-white text-xs font-bold">Forfeit</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ================= RESULT =================
  const won = outcome === 'won';
  const refund = outcome === 'refund';
  return (
    <div className={shell}>
      <div className="max-w-[560px] w-full space-y-4 sm:space-y-6">
        <Banner
          cover={cover}
          eyebrow={refund ? 'Scrim postponed' : won ? 'Series won' : 'Series over'}
          title={refund ? 'Refunded' : won ? 'Victory!' : 'Good series'}
          sub={refund ? 'Both clan masters agreed to postpone.' : `${clanName.trim()} ${usWins} – ${themWins} ${rival.clan}`}
        />
        <div className={card}>
          <div className="space-y-2 text-sm">
            {won && (
              <>
                <div className="flex justify-between text-gray-600"><span>Total pot</span><span className="font-bold text-gray-900">{money(pot)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Platform fee ({FEE_FREE_PERIOD ? 'waived' : '10%'})</span><span className="font-bold text-gray-900">- {money(fee)}</span></div>
                <div className="flex justify-between border-t border-gray-200 pt-2"><span className="font-bold text-gray-900">Added to your wallet</span><span className="font-black text-[#16A34A]">{money(winnings)}</span></div>
              </>
            )}
            {!won && !refund && (
              <>
                <div className="flex justify-between text-gray-600"><span>Your stake</span><span className="font-bold text-gray-900">{money(stake)}</span></div>
                <div className="flex justify-between border-t border-gray-200 pt-2 text-gray-600"><span>Released to {rival.clan}</span><span className="font-bold text-gray-900">{money(stake)}</span></div>
              </>
            )}
            {refund && (
              <div className="flex justify-between"><span className="font-bold text-gray-900">Refunded to your wallet</span><span className="font-black text-[#16A34A]">{money(stake)}</span></div>
            )}
          </div>
          <p className="text-[11px] text-gray-400 mt-3">
            {won ? 'Share the winnings with your clan however you agreed.' : refund ? 'Nothing was lost. Reschedule whenever both clans are ready.' : 'Your next win is one series away.'}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => onNavigate('dashboard')} className="flex-1 px-6 py-3.5 rounded-xl bg-[#16A34A] hover:bg-[#15803d] text-white font-bold text-sm shadow-md transition-colors" style={heading}>
            Back to Home
          </button>
          {!refund && (
            <button onClick={() => onNavigate('matches')} className="flex-1 px-6 py-3.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition-colors" style={heading}>
              My Matches
            </button>
          )}
        </div>
      </div>
    </div>
  );
}