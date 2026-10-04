import { useState } from 'react';
import { me } from '../data';
import { useProfile } from '../profile';
import { fromGhs } from '../currency';
import jokerBanner from '../assets/joker_white.jpg';

type Row = {
  name: string;
  username: string;
  country: 'GH' | 'NG';
  wins: number;
  played: number;
  all: number;
  week: number;
  streak: number;
  isMe?: boolean;
};

const ROWS: Row[] = [
  { name: 'EmkaBeast', username: 'emka_beast', country: 'NG', wins: 142, played: 168, all: 18450, week: 1240, streak: 7 },
  { name: 'TundeSniper', username: 'tunde_sn1per', country: 'NG', wins: 128, played: 161, all: 15920, week: 980, streak: 4 },
  { name: 'KofiKing', username: 'kofi_king', country: 'GH', wins: 119, played: 150, all: 14210, week: 1410, streak: 9 },
  { name: 'AdaGamer', username: 'ada_gamer', country: 'NG', wins: 97, played: 131, all: 11380, week: 640, streak: 2 },
  { name: 'YawStrike', username: 'yaw_strike', country: 'GH', wins: 88, played: 120, all: 9760, week: 720, streak: 3 },
  { name: me.name, username: me.username, country: 'GH', wins: 87, played: 110, all: 8940, week: 860, streak: 5, isMe: true },
  { name: 'ChidiX', username: 'chidi_x', country: 'NG', wins: 76, played: 109, all: 7410, week: 410, streak: 1 },
  { name: 'AkuaPro', username: 'akua_pro', country: 'GH', wins: 64, played: 95, all: 6120, week: 530, streak: 2 },
  { name: 'Obinna7', username: 'obinna_7', country: 'NG', wins: 58, played: 90, all: 5380, week: 290, streak: 0 },
  { name: 'NanaBlitz', username: 'nana_blitz', country: 'GH', wins: 51, played: 84, all: 4650, week: 350, streak: 1 },
];

const GRADIENTS = [
  'linear-gradient(135deg,#16A34A,#4ADE80)',
  'linear-gradient(135deg,#3B82F6,#60A5FA)',
  'linear-gradient(135deg,#8B5CF6,#C084FC)',
  'linear-gradient(135deg,#F59E0B,#FCD34D)',
  'linear-gradient(135deg,#EC4899,#F9A8D4)',
  'linear-gradient(135deg,#06B6D4,#67E8F9)',
  'linear-gradient(135deg,#EF4444,#FCA5A5)',
  'linear-gradient(135deg,#84CC16,#BEF264)',
  'linear-gradient(135deg,#6366F1,#A5B4FC)',
  'linear-gradient(135deg,#14B8A6,#5EEAD4)',
];

const TIERS: Record<number, { color: string; label: string; glow: string }> = {
  1: { color: '#FBBF24', label: 'CHAMPION', glow: '0 0 40px rgba(251,191,36,0.35)' },
  2: { color: '#CBD5E1', label: 'ELITE', glow: '0 0 30px rgba(203,213,225,0.2)' },
  3: { color: '#FB923C', label: 'PRO', glow: '0 0 30px rgba(251,146,60,0.25)' },
};

type Period = 'WEEK' | 'ALL';
type Filter = 'ALL' | 'GH' | 'NG';

function Badge({ name, idx, size, ring }: { name: string; idx: number; size: number; ring?: string }) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-black shrink-0"
      style={{
        width: size,
        height: size,
        background: GRADIENTS[idx % GRADIENTS.length],
        fontFamily: 'Chakra Petch, sans-serif',
        fontSize: size * 0.42,
        boxShadow: ring ? `0 0 0 3px #07090D, 0 0 0 5px ${ring}` : undefined,
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function Leaderboard({ onNavigate }: { onNavigate: (s: string) => void }) {
  const { profile } = useProfile();
  const cur = profile.currency;
  const show = (n: number) => fromGhs(n, cur).toLocaleString('en-US');
  const [period, setPeriod] = useState<Period>('WEEK');
  const [filter, setFilter] = useState<Filter>('ALL');

  const value = (r: Row) => (period === 'ALL' ? r.all : r.week);

  const ranked = ROWS
    .map((r, i) => ({ ...r, color: i }))
    .filter(r => filter === 'ALL' || r.country === filter)
    .sort((a, b) => value(b) - value(a))
    .map((r, i) => ({ ...r, rank: i + 1 }));

  const podium = ranked.slice(0, 3);
  const podiumOrder = [podium[1], podium[0], podium[2]].filter(Boolean);
  const mine = ranked.find(r => r.isMe);
  const totalPaid = ranked.reduce((s, r) => s + value(r), 0);

  return (
    <div className="min-h-screen bg-[#07090D] text-white font-sans p-2 sm:p-4 lg:p-6 flex flex-col items-center pb-28">
      <div className="max-w-[1000px] w-full space-y-4 sm:space-y-6">

        {/* HERO */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 min-h-[200px] sm:min-h-[260px] flex flex-col justify-end p-5 sm:p-8">
          <img src={jokerBanner} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090D] via-[#07090D]/60 to-[#07090D]/20 pointer-events-none" />
          <div className="absolute -top-16 -right-10 w-72 h-72 bg-[#16A34A] rounded-full blur-3xl opacity-30 pointer-events-none" />
          <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-[#FBBF24] rounded-full blur-3xl opacity-10 pointer-events-none" />

          <button
            onClick={() => onNavigate('back')}
            className="absolute top-4 left-4 sm:top-6 sm:left-8 z-10 text-xs font-bold text-gray-300 hover:text-white bg-black/40 backdrop-blur px-3 py-1.5 rounded-full border border-white/10 transition-colors"
          >
            ← Back
          </button>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#16A34A]/20 border border-[#16A34A]/40 text-[#4ADE80] text-[9px] sm:text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" /> Season 1 · Ghana & Nigeria
            </div>
            <h1 className="text-4xl sm:text-6xl font-black leading-none tracking-tight" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
              HALL OF <span className="text-[#4ADE80]">FAME</span>
            </h1>
            <p className="text-gray-300 text-xs sm:text-sm font-medium mt-2">Win matches. Earn rank. Get paid.</p>
          </div>
        </div>

        {/* STATS STRIP */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {[
            { label: 'Players', val: ranked.length.toString() },
            { label: period === 'WEEK' ? 'Won this week' : 'Won all-time', val: `${cur} ${show(totalPaid)}` },
            { label: 'Top streak', val: `${Math.max(...ranked.map(r => r.streak))} 🔥` },
          ].map(s => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-3 text-center">
              <p className="text-sm sm:text-xl font-black" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{s.val}</p>
              <p className="text-[9px] sm:text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex bg-white/5 border border-white/10 rounded-full p-1">
            {(['WEEK', 'ALL'] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all ${period === p ? 'bg-[#16A34A] text-white shadow-[0_0_16px_rgba(22,163,74,0.5)]' : 'text-gray-400 hover:text-white'}`}
                style={{ fontFamily: 'Chakra Petch, sans-serif' }}
              >
                {p === 'WEEK' ? 'This Week' : 'All-Time'}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {(['ALL', 'GH', 'NG'] as Filter[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold border transition-all ${filter === f ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-white/15 hover:border-white/40'}`}
                style={{ fontFamily: 'Chakra Petch, sans-serif' }}
              >
                {f === 'ALL' ? 'All' : f === 'GH' ? '🇬🇭 Ghana' : '🇳🇬 Nigeria'}
              </button>
            ))}
          </div>
        </div>

        {/* PODIUM */}
        <div className="grid grid-cols-3 gap-2 sm:gap-5 items-end pt-4">
          {podiumOrder.map(p => {
            const t = TIERS[p.rank];
            const first = p.rank === 1;
            return (
              <div
                key={p.username}
                className={`relative rounded-2xl sm:rounded-3xl border overflow-hidden flex flex-col items-center text-center px-2 sm:px-4 ${first ? 'pt-8 pb-6 sm:pb-8' : 'pt-6 pb-4 sm:pb-6'}`}
                style={{
                  borderColor: `${t.color}66`,
                  boxShadow: t.glow,
                  background: `linear-gradient(180deg, ${t.color}26 0%, rgba(255,255,255,0.03) 60%)`,
                }}
              >
                <span
                  className="absolute -bottom-4 -right-1 text-[90px] sm:text-[140px] font-black leading-none select-none pointer-events-none"
                  style={{ color: t.color, opacity: 0.08, fontFamily: 'Chakra Petch, sans-serif' }}
                >
                  {p.rank}
                </span>

                {first && (
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="#FBBF24" className="absolute top-1.5 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]">
                    <path d="M2 16l4-12 6 5 6-5 4 12z" />
                  </svg>
                )}

                <Badge name={p.name} idx={p.color} size={first ? 72 : 54} ring={t.color} />
                <p className="font-black text-xs sm:text-lg mt-3 truncate max-w-full" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{p.name}</p>
                <span className="text-[8px] sm:text-[10px] font-black tracking-[0.2em] mt-0.5" style={{ color: t.color }}>{t.label}</span>
                <p className="mt-2 text-sm sm:text-2xl font-black text-white" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                  <span className="hidden sm:inline text-xs text-gray-400 mr-1">{cur}</span>{show(value(p))}
                </p>
                <p className="text-[9px] sm:text-xs text-gray-400 font-semibold mt-1">
                  {p.wins}W · {Math.round((p.wins / p.played) * 100)}% · {p.country}
                </p>
              </div>
            );
          })}
        </div>

        {/* LIST */}
        <div className="space-y-2">
          {ranked.slice(3).map(p => (
            <div
              key={p.username}
              className={`relative flex items-center gap-3 sm:gap-4 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-3 border transition-colors ${
                p.isMe
                  ? 'bg-[#16A34A]/10 border-[#16A34A]/60 shadow-[0_0_24px_rgba(22,163,74,0.2)]'
                  : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
              }`}
            >
              <span className="w-8 text-center font-black text-base sm:text-lg text-gray-500" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                {p.rank}
              </span>
              <Badge name={p.name} idx={p.color} size={40} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold truncate flex items-center gap-1.5">
                  {p.name}
                  {p.isMe && <span className="text-[9px] font-black bg-[#16A34A] text-white px-1.5 py-0.5 rounded uppercase tracking-wider">You</span>}
                  {p.streak >= 3 && <span className="text-[10px]">🔥{p.streak}</span>}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="h-1.5 w-full max-w-[140px] bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#16A34A] to-[#4ADE80] rounded-full" style={{ width: `${Math.round((p.wins / p.played) * 100)}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold">{Math.round((p.wins / p.played) * 100)}%</span>
                  <span className="hidden sm:inline text-[10px] text-gray-500 font-semibold">@{p.username} · {p.country}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm sm:text-base font-black text-[#4ADE80]" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                  {cur} {show(value(p))}
                </p>
                <p className="text-[10px] text-gray-500 font-semibold">{p.wins} wins</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* YOUR RANK, pinned */}
      {mine && (
        <div className="fixed bottom-20 sm:bottom-4 left-0 right-0 z-30 px-3 pointer-events-none">
          <div className="max-w-[1000px] mx-auto pointer-events-auto bg-[#0B1A10]/95 backdrop-blur border border-[#16A34A]/60 shadow-[0_0_30px_rgba(22,163,74,0.35)] rounded-2xl px-4 py-3 flex items-center gap-3">
            <span className="text-2xl font-black text-[#4ADE80]" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>#{mine.rank}</span>
            <Badge name={mine.name} idx={mine.color} size={36} ring="#16A34A" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold truncate">Your rank</p>
              <p className="text-[11px] text-gray-400 font-medium truncate">
                {mine.rank === 1 ? "You're on top. Defend it." : `${show(value(ranked[mine.rank - 2]) - value(mine))} ${cur} to pass ${ranked[mine.rank - 2].name}`}
              </p>
            </div>
            <button
              onClick={() => onNavigate('create-match')}
              className="px-4 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803d] text-white text-xs font-bold shadow-md transition-colors"
              style={{ fontFamily: 'Chakra Petch, sans-serif' }}
            >
              Play →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}