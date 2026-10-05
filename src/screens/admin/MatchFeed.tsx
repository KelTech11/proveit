import { useState } from 'react';
import { Avatar, GameBadge, IconSearch, IconArrowRight, IconChevronRight } from '../../components/ui';
import { matches, formatCurrency, type Match } from '../../data';

type GameFilter = 'All' | 'CODM' | 'FC Mobile' | 'eFootball' | 'Tekken 8';
type StatusFilter = 'All' | Match['status'];
type CountryFilter = 'All' | 'GH' | 'NG';
type SortKey = 'created' | 'amount';

const ROWS_PER_PAGE = 6;

const STATUS_STYLE: Record<Match['status'], { chip: string; dot: string; label: string }> = {
  live: { chip: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500 animate-pulse', label: 'Live' },
  completed: { chip: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500', label: 'Completed' },
  disputed: { chip: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500 animate-pulse', label: 'Disputed' },
  pending: { chip: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'Pending' },
  cancelled: { chip: 'bg-gray-100 text-gray-500 border-gray-200', dot: 'bg-gray-400', label: 'Cancelled' },
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

export default function AdminMatchFeed({ onNavigate }: { onNavigate: (s: string) => void }) {
  const [search, setSearch] = useState('');
  const [gameFilter, setGameFilter] = useState<GameFilter>('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [countryFilter, setCountryFilter] = useState<CountryFilter>('All');
  const [sortBy, setSortBy] = useState<SortKey>('created');
  const [page, setPage] = useState(1);

  const count = (s: Match['status']) => matches.filter(m => m.status === s).length;

  const filtered = matches
    .filter(m => {
      const q = search.toLowerCase();
      if (q && !m.id.toLowerCase().includes(q) && !m.playerA.username.toLowerCase().includes(q) && !(m.playerB?.username.toLowerCase().includes(q))) return false;
      if (gameFilter !== 'All' && m.game !== gameFilter) return false;
      if (statusFilter !== 'All' && m.status !== statusFilter) return false;
      if (countryFilter !== 'All' && m.playerA.country !== countryFilter) return false;
      return true;
    })
    .sort((a, b) => sortBy === 'amount'
      ? b.wagerAmount - a.wagerAmount
      : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE) || 1;
  const rows = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const reset = () => setPage(1);
  const selectCls = 'text-sm font-bold border border-gray-200 rounded-xl px-3 py-2.5 bg-white text-gray-700 outline-none focus:border-green-500 cursor-pointer hover:border-gray-300 transition-colors';

  const stats = [
    { label: 'Total Matches', value: '2,340', sub: '+187 this week', tone: 'text-white' },
    { label: 'Live Now', value: '156', sub: 'in progress', tone: 'text-green-400', live: true },
    { label: 'In Dispute', value: String(count('disputed') + 40), sub: 'need review', tone: 'text-red-400' },
    { label: 'Escrow Volume', value: 'GHS 480K', sub: '+12.4%', tone: 'text-amber-300' },
  ];

  const tabs: { id: StatusFilter; label: string }[] = [
    { id: 'All', label: 'All' },
    { id: 'live', label: 'Live' },
    { id: 'disputed', label: 'Disputed' },
    { id: 'completed', label: 'Completed' },
    { id: 'pending', label: 'Pending' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7F9] flex flex-col gap-6 animate-fade-up">
      {/* HERO */}
      <div className="bg-[#0A1A24] rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden shadow-md">
        <div className="anim-glow absolute -top-16 -right-10 w-64 h-64 bg-[#16A34A] rounded-full blur-[90px] pointer-events-none" />
        <div className="anim-glow absolute -bottom-24 left-10 w-56 h-56 bg-[#115E59] rounded-full blur-[90px] pointer-events-none" style={{ animationDelay: '2s' }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-400 mb-2">
              <span className="w-2 h-2 rounded-full bg-green-500 anim-live-ring" /> Live platform feed
            </p>
            <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Global Match Feed</h1>
            <p className="text-sm text-gray-400 mt-1">Every wager across Ghana & Nigeria, in real time.</p>
          </div>
          <button className="sheen-host w-fit px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803d] text-white text-sm font-bold shadow-md transition-transform hover:-translate-y-0.5">
            Export CSV
          </button>
        </div>

        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <div key={s.label} className="anim-row bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur hover:bg-white/10 transition-colors" style={{ animationDelay: `${i * 80}ms` }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 flex items-center gap-1.5">
                {s.live && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}{s.label}
              </p>
              <p className={`text-2xl font-black tabular ${s.tone}`} style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{s.value}</p>
              <p className="text-[11px] text-gray-500 font-semibold mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm flex flex-col gap-4">
        <div className="flex gap-2 overflow-x-auto no-scroll">
          {tabs.map(t => {
            const active = statusFilter === t.id;
            const n = t.id === 'All' ? matches.length : count(t.id as Match['status']);
            return (
              <button
                key={t.id}
                onClick={() => { setStatusFilter(t.id); reset(); }}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all ${active ? 'bg-[#16A34A] text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
              >
                {t.label} <span className={`ml-1 ${active ? 'text-green-100' : 'text-gray-400'}`}>{n}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 min-w-[200px] flex-1 max-w-sm focus-within:border-green-500 focus-within:bg-white transition-colors">
            <IconSearch size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search match ID or player..."
              value={search}
              onChange={e => { setSearch(e.target.value); reset(); }}
              className="flex-1 bg-transparent outline-none text-base sm:text-sm text-gray-700 placeholder-gray-400"
            />
          </div>
          <select value={gameFilter} onChange={e => { setGameFilter(e.target.value as GameFilter); reset(); }} className={selectCls}>
            {(['All', 'CODM', 'FC Mobile', 'eFootball', 'Tekken 8'] as GameFilter[]).map(g => <option key={g} value={g}>{g === 'All' ? 'All Games' : g}</option>)}
          </select>
          <select value={countryFilter} onChange={e => { setCountryFilter(e.target.value as CountryFilter); reset(); }} className={selectCls}>
            {(['All', 'GH', 'NG'] as CountryFilter[]).map(c => <option key={c} value={c}>{c === 'All' ? 'All Countries' : c === 'GH' ? '🇬🇭 Ghana' : '🇳🇬 Nigeria'}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as SortKey)} className={selectCls}>
            <option value="created">Newest first</option>
            <option value="amount">Biggest wager</option>
          </select>
        </div>
      </div>

      {/* MATCH CARDS */}
      <div className="flex flex-col gap-3">
        {rows.map((m, i) => {
          const st = STATUS_STYLE[m.status];
          const disputed = m.status === 'disputed';
          return (
            <div
              key={`${m.id}-${page}-${statusFilter}`}
              className={`anim-row hover-lift group bg-white rounded-3xl border p-4 sm:p-5 shadow-sm flex flex-col lg:flex-row lg:items-center gap-4 ${disputed ? 'border-red-200 bg-gradient-to-r from-red-50/60 to-white' : 'border-gray-100'}`}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="flex items-center gap-3 lg:w-[210px] shrink-0">
                <GameBadge game={m.game} />
                <div className="min-w-0">
                  <p className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded w-fit">{m.id}</p>
                  <p className="text-[11px] text-gray-400 font-semibold mt-1 truncate">{m.gameMode}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Avatar name={m.playerA.name} country={m.playerA.country} color={m.playerA.color} size="sm" />
                  <span className="text-sm font-black text-gray-900 truncate">{m.playerA.username}</span>
                </div>
                <span className="text-[10px] font-black italic text-gray-300 shrink-0" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>VS</span>
                <div className="flex items-center gap-2 min-w-0 flex-1 justify-end sm:justify-start">
                  {m.playerB ? (
                    <>
                      <Avatar name={m.playerB.name} country={m.playerB.country} color={m.playerB.color} size="sm" />
                      <span className="text-sm font-black text-gray-900 truncate">{m.playerB.username}</span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-400 italic animate-pulse">Awaiting opponent…</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between lg:justify-end gap-4 lg:gap-6">
                <div className="lg:text-right">
                  <p className="text-base font-black text-gray-900 tabular" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{formatCurrency(m.wagerAmount, m.currency)}</p>
                  <p className="text-[11px] text-gray-400 font-semibold">{relativeTime(m.createdAt)}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-black ${st.chip}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} /> {st.label}
                </span>
                <button
                  onClick={() => onNavigate(disputed ? 'dispute-resolution' : 'match-feed')}
                  className="w-9 h-9 rounded-full bg-gray-50 group-hover:bg-[#16A34A] group-hover:text-white text-gray-500 flex items-center justify-center transition-all group-hover:translate-x-1"
                  aria-label="View match"
                >
                  <IconArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}

        {rows.length === 0 && (
          <div className="anim-pop bg-white rounded-3xl border border-gray-100 py-16 text-center">
            <div className="text-4xl mb-2">🎮</div>
            <p className="text-sm font-black text-gray-900">No matches found</p>
            <p className="text-xs text-gray-500">Try clearing a filter.</p>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-4 py-3 shadow-sm">
        <p className="text-xs text-gray-500 font-semibold">
          Showing {filtered.length === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1}–{Math.min(page * ROWS_PER_PAGE, filtered.length)} of <span className="font-black text-gray-800">{filtered.length}</span> (demo data)
        </p>
        <div className="flex items-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 rounded-xl text-xs font-black bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Previous</button>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-xl text-xs font-black bg-[#16A34A] text-white hover:bg-[#15803d] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1">
            Next <IconChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
