import { useState } from 'react';
import {
  Avatar, Badge, Button, Card, GameBadge,
  IconSearch, IconFilter, IconAlertTriangle, IconClock, IconChevronRight,
} from '../../components/ui';
import { matches } from '../../data';

interface DisputeRow {
  id: string;
  game: string;
  wager: string;
  playerA: string;
  playerBName: string;
  playerAColor: string;
  playerBColor: string;
  playerACountry: 'GH' | 'NG';
  playerBCountry: 'GH' | 'NG';
  reason: string;
  timeWaiting: string;
  priority: 'critical' | 'urgent' | 'normal';
}

const extraDisputes: DisputeRow[] = [
  {
    id: 'M-7801',
    game: 'CODM',
    wager: 'NGN 50,000',
    playerA: 'EmkaBeast',
    playerBName: 'SeunPro',
    playerAColor: '#7C3AED',
    playerBColor: '#059669',
    playerACountry: 'NG',
    playerBCountry: 'NG',
    reason: 'Disconnect mid-match',
    timeWaiting: '7h 12m',
    priority: 'critical',
  },
  {
    id: 'M-7756',
    game: 'FC Mobile',
    wager: 'GHS 500',
    playerA: 'KwameGOAT',
    playerBName: 'AmaFire',
    playerAColor: '#1D4ED8',
    playerBColor: '#0891B2',
    playerACountry: 'GH',
    playerBCountry: 'GH',
    reason: 'Screenshot timestamp mismatch',
    timeWaiting: '4h 33m',
    priority: 'urgent',
  },
  {
    id: 'M-7821',
    game: 'eFootball',
    wager: 'NGN 50,000',
    playerA: 'EmkaBeast',
    playerBName: 'SeunPro',
    playerAColor: '#7C3AED',
    playerBColor: '#059669',
    playerACountry: 'NG',
    playerBCountry: 'NG',
    reason: 'Both claim 3-2 win',
    timeWaiting: '5h 48m',
    priority: 'urgent',
  },
  {
    id: 'M-7835',
    game: 'CODM',
    wager: 'GHS 200',
    playerA: 'AbenaElite',
    playerBName: 'AmaFire',
    playerAColor: '#DC2626',
    playerBColor: '#0891B2',
    playerACountry: 'GH',
    playerBCountry: 'GH',
    reason: 'Conflicting screenshots',
    timeWaiting: '2h 14m',
    priority: 'normal',
  },
];

// Merge real disputed matches into the queue
const realDisputes: DisputeRow[] = matches
  .filter(m => m.status === 'disputed')
  .filter(m => !extraDisputes.some(e => e.id === m.id))
  .map(m => ({
    id: m.id,
    game: m.game,
    wager: `${m.currency} ${m.wagerAmount.toLocaleString()}`,
    playerA: m.playerA.username,
    playerBName: m.playerB?.username ?? '—',
    playerAColor: m.playerA.color,
    playerBColor: m.playerB?.color ?? '#888',
    playerACountry: m.playerA.country,
    playerBCountry: (m.playerB?.country ?? 'GH') as 'GH' | 'NG',
    reason: m.disputeReason ?? 'No reason provided',
    timeWaiting: m.timeWaiting ?? '—',
    priority: 'normal' as const,
  }));

const allDisputes: DisputeRow[] = [...extraDisputes, ...realDisputes].sort((a, b) => {
  const order = { critical: 0, urgent: 1, normal: 2 };
  return order[a.priority] - order[b.priority];
});

type PriorityFilter = 'All' | 'critical' | 'urgent' | 'normal';
type GameFilter = 'All' | 'CODM' | 'FC Mobile' | 'eFootball' | 'Tekken 8';
type CountryFilter = 'All' | 'GH' | 'NG';

function TimeWaitingBadge({ time, priority }: { time: string; priority: 'critical' | 'urgent' | 'normal' }) {
  const color = priority === 'critical' ? 'text-red-600' : priority === 'urgent' ? 'text-amber-600' : 'text-green-600';
  const bg = priority === 'critical' ? 'bg-red-50' : priority === 'urgent' ? 'bg-amber-50' : 'bg-green-50';
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${bg} ${color} font-semibold text-xs w-fit`}
      style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
      <IconClock size={12} />
      {time}
    </div>
  );
}

export default function AdminDisputeQueue({ onNavigate }: { onNavigate: (s: string) => void }) {
  const [search, setSearch] = useState('');
  const [gameFilter, setGameFilter] = useState<GameFilter>('All');
  const [countryFilter, setCountryFilter] = useState<CountryFilter>('All');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('All');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = allDisputes.filter(d => {
    if (search && !d.id.toLowerCase().includes(search.toLowerCase()) &&
      !d.playerA.toLowerCase().includes(search.toLowerCase()) &&
      !d.playerBName.toLowerCase().includes(search.toLowerCase())) return false;
    if (gameFilter !== 'All' && d.game !== gameFilter) return false;
    if (countryFilter !== 'All' && d.playerACountry !== countryFilter) return false;
    if (priorityFilter !== 'All' && d.priority !== priorityFilter) return false;
    return true;
  });

  const ROWS_PER_PAGE = 8;
  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE) || 1;
  const pageRows = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const toggleRow = (id: string) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === pageRows.length) setSelectedRows(new Set());
    else setSelectedRows(new Set(pageRows.map(d => d.id)));
  };

  const criticalCount = allDisputes.filter(d => d.priority === 'critical').length;

  const rowBg = (priority: DisputeRow['priority'], selected: boolean) => {
    if (selected) return 'bg-green-50';
    if (priority === 'critical') return 'bg-red-50 hover:bg-red-100';
    if (priority === 'urgent') return 'bg-amber-50 hover:bg-amber-100';
    return 'hover:bg-gray-50';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
              Dispute Queue
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold border border-amber-200"
              style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse-dot" />
              42 Pending
            </span>
          </div>
          <p className="text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
            Sorted by time waiting — oldest first
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="danger"
            size="sm"
            onClick={() => onNavigate('admin-dispute-resolution')}
          >
            <IconAlertTriangle size={16} />
            Resolve All Critical ({criticalCount})
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <Card className="p-3 mb-4">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 min-w-[180px] flex-1 max-w-xs focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-colors">
            <IconSearch size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search match ID, player..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>

          <div className="flex items-center gap-1.5">
            <IconFilter size={14} className="text-gray-400" />
            <select
              value={gameFilter}
              onChange={e => { setGameFilter(e.target.value as GameFilter); setCurrentPage(1); }}
              className="text-sm border border-gray-200 rounded-lg px-2 py-2 bg-white text-gray-700 outline-none focus:border-green-500 cursor-pointer"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {(['All', 'CODM', 'FC Mobile', 'eFootball', 'Tekken 8'] as GameFilter[]).map(g => (
                <option key={g} value={g}>{g === 'All' ? 'All Games' : g}</option>
              ))}
            </select>
          </div>

          <select
            value={countryFilter}
            onChange={e => { setCountryFilter(e.target.value as CountryFilter); setCurrentPage(1); }}
            className="text-sm border border-gray-200 rounded-lg px-2 py-2 bg-white text-gray-700 outline-none focus:border-green-500 cursor-pointer"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {(['All', 'GH', 'NG'] as CountryFilter[]).map(c => (
              <option key={c} value={c}>{c === 'All' ? 'All Countries' : c === 'GH' ? '🇬🇭 Ghana' : '🇳🇬 Nigeria'}</option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={e => { setPriorityFilter(e.target.value as PriorityFilter); setCurrentPage(1); }}
            className="text-sm border border-gray-200 rounded-lg px-2 py-2 bg-white text-gray-700 outline-none focus:border-green-500 cursor-pointer"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <option value="All">All Priorities</option>
            <option value="critical">Critical (&gt;6h)</option>
            <option value="urgent">Urgent (2-6h)</option>
            <option value="normal">Normal (&lt;2h)</option>
          </select>
        </div>
      </Card>

      {/* Priority legend */}
      <div className="flex gap-4 mb-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
          <span className="w-3 h-3 rounded-sm bg-red-100 border border-red-200 inline-block" />
          Critical — waiting &gt;6h
        </div>
        <div className="flex items-center gap-1.5 text-xs text-amber-600" style={{ fontFamily: 'Inter, sans-serif' }}>
          <span className="w-3 h-3 rounded-sm bg-amber-100 border border-amber-200 inline-block" />
          Urgent — 2-6h
        </div>
        <div className="flex items-center gap-1.5 text-xs text-green-600" style={{ fontFamily: 'Inter, sans-serif' }}>
          <span className="w-3 h-3 rounded-sm bg-white border border-gray-200 inline-block" />
          Normal — &lt;2h
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden shadow-sm">
        <div className="overflow-x-auto no-scroll">
          <table className="data-table w-full text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === pageRows.length && pageRows.length > 0}
                    onChange={toggleAll}
                    className="w-4 h-4 accent-green-600 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Match ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Game</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Wager</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Players</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider max-w-[200px]">Dispute Reason</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Time Waiting ↕
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageRows.map(d => (
                <tr
                  key={d.id}
                  className={`transition-colors ${rowBg(d.priority, selectedRows.has(d.id))}`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(d.id)}
                      onChange={() => toggleRow(d.id)}
                      className="w-4 h-4 accent-green-600 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                      {d.id}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <GameBadge game={d.game as any} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-semibold tabular text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                      {d.wager}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Avatar name={d.playerA} country={d.playerACountry} color={d.playerAColor} size="sm" />
                      <span className="text-xs text-gray-500 mx-1">vs</span>
                      <Avatar name={d.playerBName} country={d.playerBCountry} color={d.playerBColor} size="sm" />
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {d.playerA} vs {d.playerBName}
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <p className="text-xs text-gray-700 truncate" title={d.reason} style={{ fontFamily: 'Inter, sans-serif' }}>
                      {d.reason.length > 40 ? d.reason.slice(0, 40) + '…' : d.reason}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <TimeWaitingBadge time={d.timeWaiting} priority={d.priority} />
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onNavigate('admin-dispute-resolution')}
                    >
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                    No disputes match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(currentPage * ROWS_PER_PAGE, filtered.length)} of{' '}
            <span className="font-semibold text-gray-700">42</span> disputes
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Next <IconChevronRight size={14} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
