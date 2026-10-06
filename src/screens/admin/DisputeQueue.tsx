import { useState } from 'react';
import { Avatar, Button, Card, GameBadge, IconSearch, IconFilter, IconAlertTriangle, IconClock, IconChevronRight } from '../../components/ui';
import { matches, type Match, type GameType } from '../../data';

const disputed = matches.filter(m => m.status === 'disputed');

type PriorityFilter = 'All' | 'critical' | 'urgent' | 'normal';
type GameFilter = 'All' | GameType;
type CountryFilter = 'All' | 'GH' | 'NG';

function priorityOf(m: Match): 'critical' | 'urgent' | 'normal' {
  const hrs = m.timeWaiting ? parseFloat(m.timeWaiting) : 0;
  if (hrs >= 6) return 'critical';
  if (hrs >= 2) return 'urgent';
  return 'normal';
}

function TimeWaitingBadge({ time, priority }: { time: string; priority: 'critical' | 'urgent' | 'normal' }) {
  const color = priority === 'critical' ? 'text-red-300' : priority === 'urgent' ? 'text-amber-300' : 'text-green-300';
  const bg = priority === 'critical' ? 'bg-red-500/15 border-red-500/30' : priority === 'urgent' ? 'bg-amber-500/15 border-amber-500/30' : 'bg-green-500/15 border-green-500/30';
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${bg} ${color} font-bold text-xs w-fit`} style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
      <IconClock size={12} />
      {time}
    </div>
  );
}

export default function AdminDisputeQueue({ onNavigate }: { onNavigate: (s: string, id?: string) => void }) {
  const [search, setSearch] = useState('');
  const [gameFilter, setGameFilter] = useState<GameFilter>('All');
  const [countryFilter, setCountryFilter] = useState<CountryFilter>('All');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('All');
  const [page, setPage] = useState(1);

  const rows = disputed
    .map(m => ({ match: m, priority: priorityOf(m) }))
    .filter(({ match: m, priority }) => {
      const q = search.toLowerCase();
      if (q && !m.id.toLowerCase().includes(q) && !m.playerA.username.toLowerCase().includes(q) && !(m.playerB?.username.toLowerCase().includes(q))) return false;
      if (gameFilter !== 'All' && m.game !== gameFilter) return false;
      if (countryFilter !== 'All' && m.playerA.country !== countryFilter) return false;
      if (priorityFilter !== 'All' && priority !== priorityFilter) return false;
      return true;
    })
    .sort((a, b) => (parseFloat(b.match.timeWaiting ?? '0') - parseFloat(a.match.timeWaiting ?? '0')));

  const ROWS_PER_PAGE = 8;
  const totalPages = Math.ceil(rows.length / ROWS_PER_PAGE) || 1;
  const pageRows = rows.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
  const criticalCount = rows.filter(r => r.priority === 'critical').length;
  const gamesInPlay = Array.from(new Set(disputed.map(m => m.game)));

  const selectCls = 'text-sm font-bold border border-gray-200 rounded-xl px-3 py-2.5 bg-white text-gray-700 outline-none focus:border-green-500 cursor-pointer hover:border-gray-300 transition-colors';

  return (
    <div className="min-h-screen bg-[#F4F7F9] flex flex-col gap-6 animate-fade-up">
      {/* HERO */}
      <div className="bg-[#0A1A24] rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden shadow-md">
        <div className="absolute -top-16 -right-10 w-64 h-64 bg-red-600 rounded-full blur-[90px] opacity-30 pointer-events-none" />
        <div className="absolute -bottom-24 left-10 w-56 h-56 bg-[#115E59] rounded-full blur-[90px] opacity-30 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-400 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Needs review
            </p>
            <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Dispute Queue</h1>
            <p className="text-sm text-gray-400 mt-1">Sorted by time waiting — oldest first.</p>
          </div>
          {criticalCount > 0 && (
            <Button variant="danger" size="sm" onClick={() => { const first = rows.find(r => r.priority === 'critical'); if (first) onNavigate('admin-dispute-resolution', first.match.id); }}>
              <IconAlertTriangle size={16} />
              Resolve Critical ({criticalCount})
            </Button>
          )}
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-3 mt-6">
          {[
            { label: 'Total Pending', value: rows.length, tone: 'text-white' },
            { label: 'Critical (>6h)', value: criticalCount, tone: 'text-red-400' },
            { label: 'Urgent (2-6h)', value: rows.filter(r => r.priority === 'urgent').length, tone: 'text-amber-300' },
          ].map(s => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{s.label}</p>
              <p className={`text-2xl font-black tabular ${s.tone}`} style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FILTERS */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 min-w-[180px] flex-1 max-w-xs focus-within:border-green-500 transition-colors">
            <IconSearch size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search match ID, player..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="flex-1 bg-transparent outline-none text-base sm:text-sm text-gray-700 placeholder-gray-400"
            />
          </div>
          <select value={gameFilter} onChange={e => { setGameFilter(e.target.value as GameFilter); setPage(1); }} className={selectCls}>
            <option value="All">All Games</option>
            {gamesInPlay.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select value={countryFilter} onChange={e => { setCountryFilter(e.target.value as CountryFilter); setPage(1); }} className={selectCls}>
            {(['All', 'GH', 'NG'] as CountryFilter[]).map(c => <option key={c} value={c}>{c === 'All' ? 'All Countries' : c === 'GH' ? '🇬🇭 Ghana' : '🇳🇬 Nigeria'}</option>)}
          </select>
          <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value as PriorityFilter); setPage(1); }} className={selectCls}>
            <option value="All">All Priorities</option>
            <option value="critical">Critical (&gt;6h)</option>
            <option value="urgent">Urgent (2-6h)</option>
            <option value="normal">Normal (&lt;2h)</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto no-scroll">
          <table className="data-table w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Match ID</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Game</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Wager</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Players</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider max-w-[200px]">Reason</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Waiting</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageRows.map(({ match: m, priority }) => (
                <tr key={m.id} className={priority === 'critical' ? 'bg-red-50/60 hover:bg-red-50' : priority === 'urgent' ? 'bg-amber-50/60 hover:bg-amber-50' : 'hover:bg-gray-50'}>
                  <td className="px-4 py-3"><span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{m.id}</span></td>
                  <td className="px-4 py-3"><GameBadge game={m.game} /></td>
                  <td className="px-4 py-3 text-right"><span className="text-sm font-black tabular text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{m.currency} {m.wagerAmount.toLocaleString()}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Avatar name={m.playerA.name} country={m.playerA.country} color={m.playerA.color} size="sm" />
                      <span className="text-xs text-gray-400 mx-1">vs</span>
                      {m.playerB && <Avatar name={m.playerB.name} country={m.playerB.country} color={m.playerB.color} size="sm" />}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{m.playerA.username} vs {m.playerB?.username ?? '—'}</div>
                  </td>
                  <td className="px-4 py-3 max-w-[200px]"><p className="text-xs text-gray-700 truncate" title={m.disputeReason}>{m.disputeReason}</p></td>
                  <td className="px-4 py-3"><TimeWaitingBadge time={m.timeWaiting ?? '—'} priority={priority} /></td>
                  <td className="px-4 py-3"><Button variant="primary" size="sm" onClick={() => onNavigate('admin-dispute-resolution', m.id)}>Review</Button></td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">No disputes match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500">Showing {rows.length === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1}–{Math.min(page * ROWS_PER_PAGE, rows.length)} of <span className="font-bold text-gray-700">{rows.length}</span> disputes</p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next <IconChevronRight size={14} /></Button>
          </div>
        </div>
      </Card>
    </div>
  );
}