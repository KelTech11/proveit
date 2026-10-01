import { useState } from 'react';
import {
  Avatar, Badge, Button, Card, GameBadge,
  IconShield, IconCheck, IconFlag, IconArrowRight, IconUser, IconAlertTriangle,
} from '../../components/ui';
import { players, formatCurrency } from '../../data';

const user = players[1]; // EmkaBeast, NG

const matchHistory = [
  { id: 'M-7839', game: 'FC Mobile' as const, wager: 'NGN 25,000', opponent: 'TundeSniper', result: 'won', date: '25 Sep 2025' },
  { id: 'M-7821', game: 'eFootball' as const, wager: 'NGN 50,000', opponent: 'SeunPro', result: 'disputed', date: '24 Sep 2025' },
  { id: 'M-7812', game: 'CODM' as const, wager: 'NGN 15,000', opponent: 'KwameGOAT', result: 'lost', date: '23 Sep 2025' },
  { id: 'M-7795', game: 'FC Mobile' as const, wager: 'NGN 30,000', opponent: 'AbenaElite', result: 'won', date: '22 Sep 2025' },
  { id: 'M-7781', game: 'Tekken 8' as const, wager: 'NGN 10,000', opponent: 'TundeSniper', result: 'won', date: '21 Sep 2025' },
  { id: 'M-7742', game: 'CODM' as const, wager: 'NGN 20,000', opponent: 'SeunPro', result: 'lost', date: '19 Sep 2025' },
];

export default function AdminUserProfile({ onNavigate }: { onNavigate: (s: string) => void }) {
  const [adminNote, setAdminNote] = useState(
    'Account reviewed 15 Jan 2024. Clean record. High-volume player. Flag for review if disputes exceed 5.'
  );
  const [noteDraft, setNoteDraft] = useState(adminNote);
  const [noteSaved, setNoteSaved] = useState(false);

  const handleSaveNote = () => {
    setAdminNote(noteDraft);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const resultBadge = (result: string) => {
    if (result === 'won') return <Badge variant="won">Won</Badge>;
    if (result === 'lost') return <Badge variant="lost">Lost</Badge>;
    return <Badge variant="disputed">Disputed</Badge>;
  };

  const resultAmount = (result: string, wager: string) => {
    if (result === 'won') return <span className="text-green-600 text-sm font-semibold tabular" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>+{wager}</span>;
    if (result === 'lost') return <span className="text-red-500 text-sm tabular" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>-{wager}</span>;
    return <span className="text-amber-500 text-sm tabular" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{wager}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 animate-fade-up">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button
          onClick={() => onNavigate('overview')}
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          ←
        </button>
        <div className="flex items-center gap-1.5 text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
          <button onClick={() => onNavigate('overview')} className="hover:text-gray-700">Users</button>
          <span>/</span>
          <span className="text-gray-900 font-semibold">EmkaBeast</span>
        </div>
        <div className="ml-auto flex gap-2 flex-wrap">
          <Button variant="ghost" size="sm">
            Send Message
          </Button>
          <Button variant="danger" size="sm">
            Suspend Account
          </Button>
        </div>
      </div>

      {/* Profile header */}
      <Card className="p-5 mb-4">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <Avatar name={user.name} country={user.country} color={user.color} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                  {user.name}
                </h1>
                <p className="text-sm text-gray-500 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>@{user.username}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="verified">
                    <IconShield size={12} />
                    KYC Verified
                  </Badge>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200"
                    style={{ fontFamily: 'Inter, sans-serif' }}>
                    Risk: Low
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>Country</p>
                <p className="font-medium text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>🇳🇬 Nigeria</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>Joined</p>
                <p className="font-medium text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>Feb 8, 2024</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>Phone</p>
                <p className="font-medium text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>{user.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>Rating</p>
                <p className="font-medium text-gray-800" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                  {user.rating.toLocaleString()} ⭐
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Card className="p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em' }}>
            Total Wagered
          </p>
          <p className="text-lg font-bold tabular text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
            {formatCurrency(user.totalVolume, user.currency)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em' }}>
            Matches Won
          </p>
          <p className="text-lg font-bold text-green-600 tabular" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
            {user.wins}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em' }}>
            Matches Lost
          </p>
          <p className="text-lg font-bold text-red-500 tabular" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
            {user.losses}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em' }}>
            Disputes Filed
          </p>
          <p className="text-lg font-bold text-amber-500 tabular" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>3</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
        {/* Left: match history + KYC */}
        <div className="space-y-4">
          {/* Match History */}
          <Card className="overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                Match History
              </h2>
            </div>
            <div className="overflow-x-auto no-scroll">
              <table className="data-table w-full text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Match ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Game</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Wager</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Opponent</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Result</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {matchHistory.map(m => (
                    <tr
                      key={m.id}
                      className={`transition-colors ${
                        m.result === 'won' ? 'hover:bg-green-50' :
                        m.result === 'lost' ? 'hover:bg-red-50' :
                        'hover:bg-amber-50'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{m.id}</span>
                      </td>
                      <td className="px-4 py-3"><GameBadge game={m.game} /></td>
                      <td className="px-4 py-3 text-right">{resultAmount(m.result, m.wager)}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">{m.opponent}</span>
                      </td>
                      <td className="px-4 py-3">{resultBadge(m.result)}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-400">{m.date}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* KYC Review */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                KYC Documents
              </h2>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-green-600" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                <IconCheck size={16} />
                Verified
              </span>
            </div>

            <div className="space-y-4">
              {/* NIN Card */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <IconUser size={16} className="text-gray-500" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>National ID Card</p>
                      <p className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>Submitted 15 Jan 2024</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="verified">Approved</Badge>
                    <button className="text-xs font-semibold text-green-600 hover:text-green-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-green-50 transition-colors"
                      style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                      View <IconArrowRight size={12} />
                    </button>
                  </div>
                </div>
                {/* Fake document preview */}
                <div className="p-4" style={{ background: '#0F172A' }}>
                  <div className="max-w-xs mx-auto">
                    <div className="text-center mb-3">
                      <p className="text-xs font-bold text-green-400 tracking-widest" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                        FEDERAL REPUBLIC OF NIGERIA
                      </p>
                      <p className="text-[10px] text-gray-400 tracking-widest mt-0.5" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                        NATIONAL IDENTITY CARD
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-12 h-14 bg-gray-700 rounded-md flex items-center justify-center shrink-0">
                        <IconUser size={20} className="text-gray-500" />
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <div>
                          <p className="text-[9px] text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>Full Name</p>
                          <p className="text-xs font-semibold text-white" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>CHUKWUEMEKA OBI</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>NIN</p>
                          <p className="text-xs font-mono text-white tracking-widest">*** *** **** 5892</p>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                            <IconCheck size={10} className="text-white" />
                          </span>
                          <span className="text-[9px] text-green-400 font-semibold" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>VERIFIED</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selfie */}
              <div className="flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <IconCheck size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Selfie Verification</p>
                    <p className="text-xs text-green-600 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Face match: 98.4% confidence</p>
                  </div>
                </div>
                <Badge variant="verified">Passed</Badge>
              </div>

              {/* BVN */}
              <div className="flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <IconCheck size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>BVN Verification</p>
                    <p className="text-xs text-green-600 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>BVN verified with GTBank</p>
                  </div>
                </div>
                <Badge variant="verified">Verified</Badge>
              </div>
            </div>

            {/* KYC Admin actions */}
            <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t border-gray-100">
              <Button variant="primary" size="sm">
                <IconShield size={16} />
                Upgrade KYC Tier
              </Button>
              <Button variant="ghost" size="sm">
                Request Re-submission
              </Button>
              <Button variant="danger" size="sm">
                <IconFlag size={16} />
                Flag Account
              </Button>
            </div>
          </Card>
        </div>

        {/* Right: Admin notes + risk */}
        <div className="space-y-4">
          {/* Risk Overview */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
              Risk Overview
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>Risk Level</span>
                <span className="text-xs font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Low</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>Fraud Score</span>
                <span className="text-sm font-bold tabular text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>12 / 100</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '12%' }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>Disputes / 100 matches</span>
                <span className="text-sm font-bold tabular text-amber-600" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>3.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>Win Rate</span>
                <span className="text-sm font-bold tabular text-green-600" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                  {Math.round((user.wins / (user.wins + user.losses)) * 100)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>Account Status</span>
                <Badge variant="verified">Active</Badge>
              </div>
            </div>
          </Card>

          {/* Admin Notes */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                Admin Notes
              </h2>
              {noteSaved && (
                <span className="flex items-center gap-1 text-xs text-green-600 font-semibold" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                  <IconCheck size={12} /> Saved
                </span>
              )}
            </div>

            {/* Existing note */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
              <p className="text-xs font-semibold text-amber-700 mb-1" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                Note from 15 Jan 2024
              </p>
              <p className="text-xs text-gray-700 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                {adminNote}
              </p>
            </div>

            <textarea
              value={noteDraft}
              onChange={e => setNoteDraft(e.target.value)}
              placeholder="Add an admin note..."
              rows={4}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none text-gray-800 placeholder-gray-400 mb-3"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={handleSaveNote}
              disabled={noteDraft === adminNote}
            >
              <IconCheck size={16} />
              Save Note
            </Button>
          </Card>

          {/* Quick Links */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
              Quick Links
            </h2>
            <div className="space-y-2">
              {[
                { label: 'View all matches', screen: 'match-feed' },
                { label: 'View open disputes', screen: 'dispute-queue' },
                { label: 'Transaction history', screen: 'overview' },
              ].map(link => (
                <button
                  key={link.screen}
                  onClick={() => onNavigate(link.screen)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 text-sm text-gray-700 font-medium"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {link.label}
                  <IconArrowRight size={14} className="text-gray-400" />
                </button>
              ))}
            </div>
          </Card>

          {/* Warning banner if disputes >= threshold */}
          <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
            <IconAlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700" style={{ fontFamily: 'Inter, sans-serif' }}>
              Player has <span className="font-semibold">3 disputes</span>. Monitor closely — flag for review if disputes reach 5.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
