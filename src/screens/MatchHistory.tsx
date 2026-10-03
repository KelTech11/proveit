import { useState } from 'react';
import { GAME_DETAILS } from './CreateMatch';
import type { MatchRecord } from '../App';

type Filter = 'all' | 'won' | 'lost';

const money = (n: number) =>
  `GHS ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  if (sameDay) return `Today, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function MatchHistory({
  onNavigate,
  history,
  stats,
}: {
  onNavigate: (s: string) => void;
  history: MatchRecord[];
  stats: { wins: number; losses: number; streak: number; xp: number };
}) {
  const [filter, setFilter] = useState<Filter>('all');

  const played = stats.wins + stats.losses;
  const winRate = played > 0 ? Math.round((stats.wins / played) * 100) : 0;
  const netAmount = history.reduce((sum, m) => sum + (m.result === 'won' ? m.amount : -m.amount), 0);

  const filtered = history.filter(m => filter === 'all' || m.result === filter);

  return (
    <div className="min-h-screen bg-[#F4F7F9] text-gray-900 font-sans p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="max-w-[800px] w-full flex flex-col gap-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
            My Matches
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Every match you've played on ProveIt.</p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          {[
            { label: 'Played', val: played.toString() },
            { label: 'Win Rate', val: `${winRate}%` },
            { label: 'Streak', val: stats.streak.toString() },
            { label: 'Net', val: `${netAmount >= 0 ? '+' : ''}${money(netAmount)}` },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-100 rounded-xl sm:rounded-2xl px-2 sm:px-4 py-3 text-center shadow-sm overflow-hidden">
              <p
                className={`text-xs sm:text-lg font-black truncate ${s.label === 'Net' ? (netAmount >= 0 ? 'text-[#16A34A]' : 'text-red-500') : 'text-gray-900'}`}
                style={{ fontFamily: 'Chakra Petch, sans-serif' }}
              >
                {s.val}
              </p>
              <p className="text-[9px] sm:text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex bg-white border border-gray-100 rounded-full p-1 w-fit shadow-sm">
          {(['all', 'won', 'lost'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all capitalize ${
                filter === f ? 'bg-[#16A34A] text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
              style={{ fontFamily: 'Chakra Petch, sans-serif' }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Match list */}
        {filtered.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-3xl mb-4">🎮</div>
            <h3 className="text-lg font-black text-gray-900 mb-1" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
              {history.length === 0 ? 'No matches yet' : `No ${filter} matches`}
            </h3>
            <p className="text-sm text-gray-500 mb-5 max-w-xs">
              {history.length === 0
                ? "Once you finish a match, it'll show up here with your result and earnings."
                : 'Try a different filter to see other matches.'}
            </p>
            {history.length === 0 && (
              <button
                onClick={() => onNavigate('create-match')}
                className="px-6 py-3 rounded-xl bg-[#16A34A] hover:bg-[#15803d] text-white font-bold text-sm transition-colors"
                style={{ fontFamily: 'Chakra Petch, sans-serif' }}
              >
                Create Your First Match
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(m => {
              const meta = GAME_DETAILS[m.game];
              const won = m.result === 'won';
              return (
                <div
                  key={m.id}
                  className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-900">
                    <img src={meta.coverUrl} alt={meta.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-gray-900 truncate">{meta.title}</p>
                      <span
                        className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 ${
                          won ? 'bg-green-50 text-[#16A34A]' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {won ? 'Won' : 'Lost'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
                      {m.mode} <span className="mx-1">•</span> {formatDate(m.date)}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className={`text-sm font-black ${won ? 'text-[#16A34A]' : 'text-red-500'}`} style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                      {won ? '+' : '-'}{money(m.amount)}
                    </p>
                    <p className="text-[10px] text-gray-400 font-semibold">Stake: {money(m.wager)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}