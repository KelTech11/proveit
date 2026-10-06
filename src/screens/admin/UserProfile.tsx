import { useState } from 'react';
import { Avatar, Badge, Button, Card, GameBadge, IconShield, IconCheck, IconFlag, IconArrowRight, IconAlertTriangle } from '../../components/ui';
import { players, matches, formatCurrency } from '../../data';

export default function AdminUserProfile({ onNavigate, userId }: { onNavigate: (s: string, id?: string) => void; userId: string | null }) {
  const user = players.find(p => p.id === userId) ?? players[0];
  const userMatches = matches.filter(m => m.playerA.id === user.id || m.playerB?.id === user.id);
  const disputesFiled = userMatches.filter(m => m.status === 'disputed').length;
  const winRate = user.wins + user.losses > 0 ? Math.round((user.wins / (user.wins + user.losses)) * 100) : 0;

  const [adminNote, setAdminNote] = useState('No prior notes on this account.');
  const [noteDraft, setNoteDraft] = useState(adminNote);
  const [noteSaved, setNoteSaved] = useState(false);

  const handleSaveNote = () => {
    setAdminNote(noteDraft);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const resultOf = (m: typeof matches[number]) => {
    if (m.status === 'disputed') return 'disputed';
    if (m.status !== 'completed' || !m.winner) return 'pending';
    return m.winner.id === user.id ? 'won' : 'lost';
  };
  const opponentOf = (m: typeof matches[number]) => (m.playerA.id === user.id ? m.playerB : m.playerA);

  const resultBadge = (r: string) => r === 'won' ? <Badge variant="won">Won</Badge> : r === 'lost' ? <Badge variant="lost">Lost</Badge> : r === 'disputed' ? <Badge variant="disputed">Disputed</Badge> : <Badge variant="pending">Pending</Badge>;
  const resultAmount = (r: string, wager: string) => {
    if (r === 'won') return <span className="text-green-600 text-sm font-bold tabular" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>+{wager}</span>;
    if (r === 'lost') return <span className="text-red-500 text-sm tabular" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>-{wager}</span>;
    return <span className="text-amber-500 text-sm tabular" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{wager}</span>;
  };

  return (
    <div className="min-h-screen bg-[#F4F7F9] animate-fade-up">
      <div className="bg-[#0A1A24] rounded-3xl p-5 md:p-6 text-white relative overflow-hidden shadow-md mb-6">
        <div className="absolute -top-16 -right-10 w-64 h-64 bg-[#16A34A] rounded-full blur-[90px] opacity-30 pointer-events-none" />
        <div className="relative z-10 flex items-center gap-3 mb-4 flex-wrap">
          <button onClick={() => onNavigate('admin-overview')} className="text-sm text-gray-300 hover:text-white transition-colors">←</button>
          <div className="flex items-center gap-1.5 text-sm text-gray-400">
            <button onClick={() => onNavigate('admin-overview')} className="hover:text-white">Users</button>
            <span>/</span>
            <span className="text-white font-bold">{user.username}</span>
          </div>
          <div className="ml-auto flex gap-2 flex-wrap">
            <Button variant="ghost" size="sm">Send Message</Button>
            <Button variant="danger" size="sm">Suspend Account</Button>
          </div>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row gap-5 items-start">
          <Avatar name={user.name} country={user.country} color={user.color} size="xl" />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{user.name}</h1>
            <p className="text-sm text-gray-400 mb-2">@{user.username}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant={user.kycTier === 'verified' ? 'verified' : user.kycTier === 'basic' ? 'pending' : 'lost'}>
                <IconShield size={12} />
                {user.kycTier === 'verified' ? 'KYC Verified' : user.kycTier === 'basic' ? 'KYC Basic' : 'KYC Not Started'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div><p className="text-xs text-gray-400 mb-0.5">Country</p><p className="font-medium">{user.country === 'GH' ? '🇬🇭 Ghana' : '🇳🇬 Nigeria'}</p></div>
              <div><p className="text-xs text-gray-400 mb-0.5">Joined</p><p className="font-medium">{new Date(user.joinedAt).toLocaleDateString()}</p></div>
              <div><p className="text-xs text-gray-400 mb-0.5">Phone</p><p className="font-medium">{user.phone}</p></div>
              <div><p className="text-xs text-gray-400 mb-0.5">Rating</p><p className="font-medium" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{user.rating.toLocaleString()} ⭐</p></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Wagered', value: formatCurrency(user.totalVolume, user.currency), tone: 'text-gray-900' },
          { label: 'Matches Won', value: user.wins, tone: 'text-green-600' },
          { label: 'Matches Lost', value: user.losses, tone: 'text-red-500' },
          { label: 'Disputes Filed', value: disputesFiled, tone: 'text-amber-500' },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{s.label}</p>
            <p className={`text-lg font-black tabular ${s.tone}`} style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Match History</h2>
            </div>
            <div className="overflow-x-auto no-scroll">
              <table className="data-table w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Match ID</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Game</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Wager</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Opponent</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Result</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {userMatches.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">No matches yet.</td></tr>
                  )}
                  {userMatches.map(m => {
                    const r = resultOf(m);
                    const opp = opponentOf(m);
                    const wager = `${m.currency} ${m.wagerAmount.toLocaleString()}`;
                    return (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3"><span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{m.id}</span></td>
                        <td className="px-4 py-3"><GameBadge game={m.game} /></td>
                        <td className="px-4 py-3 text-right">{resultAmount(r, wager)}</td>
                        <td className="px-4 py-3"><span className="text-sm text-gray-700">{opp?.username ?? '—'}</span></td>
                        <td className="px-4 py-3">{resultBadge(r)}</td>
                        <td className="px-4 py-3"><span className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleDateString()}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>KYC Status</h2>
              <span className={`flex items-center gap-1.5 text-sm font-bold ${user.kycTier === 'verified' ? 'text-green-600' : user.kycTier === 'basic' ? 'text-amber-600' : 'text-gray-400'}`}>
                <IconCheck size={16} />
                {user.kycTier === 'verified' ? 'Verified' : user.kycTier === 'basic' ? 'Basic tier' : 'Not submitted'}
              </span>
            </div>
            {user.kycTier === 'none' ? (
              <p className="text-sm text-gray-500">This user has not submitted any ID or verification documents yet.</p>
            ) : (
              <p className="text-sm text-gray-500">Documents on file: Phone OTP, Government ID{user.kycTier === 'verified' ? ', Selfie liveness check' : ''}.</p>
            )}
            <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t border-gray-100">
              <Button variant="primary" size="sm"><IconShield size={16} />Upgrade KYC Tier</Button>
              <Button variant="ghost" size="sm">Request Re-submission</Button>
              <Button variant="danger" size="sm"><IconFlag size={16} />Flag Account</Button>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Risk Overview</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><span className="text-xs text-gray-500">Disputes / matches</span><span className={`text-sm font-bold tabular ${disputesFiled > 2 ? 'text-amber-600' : 'text-gray-900'}`} style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{userMatches.length ? Math.round((disputesFiled / userMatches.length) * 100) : 0}%</span></div>
              <div className="flex items-center justify-between"><span className="text-xs text-gray-500">Win Rate</span><span className="text-sm font-bold tabular text-green-600" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{winRate}%</span></div>
              <div className="flex items-center justify-between"><span className="text-xs text-gray-500">Account Status</span><Badge variant="verified">Active</Badge></div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Admin Notes</h2>
              {noteSaved && <span className="flex items-center gap-1 text-xs text-green-600 font-bold"><IconCheck size={12} /> Saved</span>}
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
              <p className="text-xs text-gray-700 leading-relaxed">{adminNote}</p>
            </div>
            <textarea
              value={noteDraft}
              onChange={e => setNoteDraft(e.target.value)}
              placeholder="Add an admin note..."
              rows={4}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none mb-3"
            />
            <Button variant="primary" size="sm" fullWidth onClick={handleSaveNote} disabled={noteDraft === adminNote}><IconCheck size={16} />Save Note</Button>
          </Card>

          {disputesFiled >= 3 && (
            <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
              <IconAlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">Player has <span className="font-bold">{disputesFiled} disputes</span>. Monitor closely.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}