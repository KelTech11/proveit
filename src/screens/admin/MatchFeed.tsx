import { useState } from 'react';
import {
  Avatar, Badge, Button, Card, GameBadge,
  IconSearch, IconFilter, IconUpload, IconArrowRight, IconChevronRight,
} from '../../components/ui';
import { matches, formatCurrency, type Match } from '../../data';

type GameFilter = 'All' | 'CODM' | 'FC Mobile' | 'eFootball' | 'Tekken 8';
type StatusFilter = 'All' | 'live' | 'completed' | 'disputed' | 'pending' | 'cancelled';
type CountryFilter = 'All' | 'GH' | 'NG';

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

const ROWS_PER_PAGE = 8;

export default function AdminMatchFeed({ onNavigate }: { onNavigate: (s: string) => void }) {
  const [search, setSearch] = useState('');
  const [gameFilter, setGameFilter] = useState<GameFilter>('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [countryFilter, setCountryFilter] = useState<CountryFilter>('All');
  const [dateRange, setDateRange] = useState('Last 7 days');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'id' | 'amount' | 'created'>('created');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered: Match[] = matches.filter((m) => {
    if (search && !m.id.toLowerCase().includes(search.toLowerCase()) &&
      !m.playerA.username.toLowerCase().includes(search.toLowerCase()) &&
      !(m.playerB?.username.toLowerCase().includes(search.toLowerCase()))) return false;
    if (gameFilter !== 'All' && m.game !== gameFilter) return false;
    if (statusFilter !== 'All' && m.status !== statusFilter) return false;
    if (countryFilter !== 'All' && m.playerA.country !== countryFilter) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'id') cmp = a.id.localeCompare(b.id);
    else if (sortBy === 'amount') cmp = a.wagerAmount - b.wagerAmount;
    else cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalPages = Math.ceil(sorted.length / ROWS_PER_PAGE) || 1;
  const pageRows = sorted.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const toggleSort = (col: 'id' | 'amount' | 'created') => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const toggleRow = (id: string) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === pageRows.length) setSelectedRows(new Set());
    else setSelectedRows(new Set(pageRows.map(m => m.id)));
  };

  const SortArrow = ({ col }: { col: 'id' | 'amount' | 'created' }) => (
    <span className={`ml-1 text-gray-400 ${sortBy === col ? 'text-green-600' : ''}`}>
      {sortBy === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  const statusBadge = (status: Match['status']) => {
    const map: Record<Match['status'], 'live' | 'completed' | 'disputed' | 'pending' | 'cancelled'> = {
      live: 'live', completed: 'completed', disputed: 'disputed', pending: 'pending', cancelled: 'cancelled',
    };
    return <Badge variant={map[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
            Global Match Feed
          </h1>
          <p className="text-sm text-gray-500 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
            2,340 total matches <span className="text-green-600 font-semibold">• 156 live</span>
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => {}}>
          <IconUpload size={16} />
          Export CSV
        </Button>
      </div>

      {/* Filter bar */}
      <Card className="p-3 mb-4">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Search */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 min-w-[200px] flex-1 max-w-xs focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-colors">
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

          {/* Game filter */}
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

          {/* Date range */}
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-2 bg-white text-gray-700 outline-none focus:border-green-500 cursor-pointer"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {['Last 7 days', 'Last 30 days', 'Last 90 days', 'All time'].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Country */}
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

          {/* Status */}
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value as StatusFilter); setCurrentPage(1); }}
            className="text-sm border border-gray-200 rounded-lg px-2 py-2 bg-white text-gray-700 outline-none focus:border-green-500 cursor-pointer"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {(['All', 'live', 'completed', 'disputed', 'pending', 'cancelled'] as StatusFilter[]).map(s => (
              <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Bulk actions bar */}
      {selectedRows.size > 0 && (
        <div className="flex items-center gap-3 mb-3 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg">
          <span className="text-sm font-semibold text-green-800" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
            {selectedRows.size} selected
          </span>
          <span className="text-green-400">—</span>
          <button className="text-sm text-red-500 hover:text-red-700 font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
            Refund All
          </button>
          <button className="text-sm text-gray-600 hover:text-gray-800 font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
            Export
          </button>
          <button
            className="ml-auto text-xs text-gray-400 hover:text-gray-600"
            onClick={() => setSelectedRows(new Set())}
          >
            Clear
          </button>
        </div>
      )}

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
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700"
                  onClick={() => toggleSort('id')}
                >
                  Match ID <SortArrow col="id" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Game</th>
                <th
                  className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700"
                  onClick={() => toggleSort('amount')}
                >
                  Wager <SortArrow col="amount" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Player A</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Player B</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700"
                  onClick={() => toggleSort('created')}
                >
                  Created <SortArrow col="created" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageRows.map((match) => (
                <tr
                  key={match.id}
                  className={`transition-colors group ${
                    selectedRows.has(match.id) ? 'bg-green-50' :
                    match.status === 'disputed' ? 'bg-amber-50 hover:bg-amber-100' :
                    'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(match.id)}
                      onChange={() => toggleRow(match.id)}
                      className="w-4 h-4 accent-green-600 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded"
                    >
                      {match.id}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <GameBadge game={match.game} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className="text-sm font-semibold tabular text-gray-900"
                      style={{ fontFamily: 'Chakra Petch, sans-serif' }}
                    >
                      {formatCurrency(match.wagerAmount, match.currency)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={match.playerA.name} country={match.playerA.country} color={match.playerA.color} size="sm" />
                      <span className="text-sm font-medium text-gray-800">{match.playerA.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {match.playerB ? (
                      <div className="flex items-center gap-2">
                        <Avatar name={match.playerB.name} country={match.playerB.country} color={match.playerB.color} size="sm" />
                        <span className="text-sm font-medium text-gray-800">{match.playerB.username}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">Awaiting...</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{statusBadge(match.status)}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {relativeTime(match.createdAt)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="text-xs font-semibold text-green-600 hover:text-green-700 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-green-50 transition-colors"
                      onClick={() => onNavigate(match.status === 'disputed' ? 'dispute-resolution' : 'match-detail')}
                      style={{ fontFamily: 'Chakra Petch, sans-serif' }}
                    >
                      View <IconArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                    No matches match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(currentPage * ROWS_PER_PAGE, filtered.length)} of{' '}
            <span className="font-semibold text-gray-700">2,340</span> matches
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
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-7 h-7 rounded-md text-xs font-semibold transition-colors ${
                    currentPage === p
                      ? 'bg-green-600 text-white'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  style={{ fontFamily: 'Chakra Petch, sans-serif' }}
                >
                  {p}
                </button>
              ))}
              {totalPages > 5 && <span className="text-gray-400 text-xs px-1">…</span>}
            </div>
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
