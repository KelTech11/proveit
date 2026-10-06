import { useState } from 'react';
import { Badge, Button, Card, Avatar, GameBadge, IconAlertTriangle, IconCheck, IconFlag, IconArrowRight, IconClock } from '../../components/ui';
import { matches } from '../../data';

type Verdict = 'playerA' | 'playerB' | 'refund' | 'flag' | null;

export default function AdminDisputeResolution({ onNavigate, matchId }: { onNavigate: (s: string, id?: string) => void; matchId: string | null }) {
  const match = matches.find(m => m.id === matchId) ?? matches.find(m => m.status === 'disputed');
  const [pendingVerdict, setPendingVerdict] = useState<Verdict>(null);
  const [adminNote, setAdminNote] = useState('');
  const [resolved, setResolved] = useState(false);
  const [resolvedVerdict, setResolvedVerdict] = useState<Verdict>(null);
  const [evidenceAValid, setEvidenceAValid] = useState(false);
  const [evidenceBValid, setEvidenceBValid] = useState(false);

  if (!match) {
    return (
      <div className="min-h-screen bg-[#F4F7F9] flex items-center justify-center p-6">
        <Card className="p-8 max-w-md w-full text-center">
          <p className="text-sm text-gray-500">No dispute selected. Go back to the queue and choose one to review.</p>
          <Button variant="primary" className="mt-4" onClick={() => onNavigate('admin-dispute-queue')}>Back to Queue</Button>
        </Card>
      </div>
    );
  }

  const { playerA, playerB } = match;
  const wager = `${match.currency} ${match.wagerAmount.toLocaleString()}`;

  const handleConfirm = () => {
    setResolvedVerdict(pendingVerdict);
    setResolved(true);
    setPendingVerdict(null);
  };

  if (resolved) {
    return (
      <div className="min-h-screen bg-[#F4F7F9] flex items-center justify-center p-6 animate-fade-up">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <IconCheck size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Dispute Resolved</h2>
          <p className="text-sm text-gray-500 mb-6">
            {resolvedVerdict === 'playerA' && `${playerA.username} declared the winner. ${wager} released from escrow.`}
            {resolvedVerdict === 'playerB' && playerB && `${playerB.username} declared the winner. ${wager} released from escrow.`}
            {resolvedVerdict === 'refund' && `Both players refunded ${match.currency} ${(match.wagerAmount / 2).toLocaleString()} each.`}
            {resolvedVerdict === 'flag' && 'Account flagged for fraud review.'}
          </p>
          {adminNote && (
            <div className="text-left bg-gray-50 rounded-lg p-3 mb-6">
              <p className="text-xs font-bold text-gray-500 mb-1">Admin Note</p>
              <p className="text-sm text-gray-700">{adminNote}</p>
            </div>
          )}
          <Button variant="primary" fullWidth onClick={() => onNavigate('admin-dispute-queue')}>Back to Queue <IconArrowRight size={16} /></Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F9] pb-24 animate-fade-up">
      <div className="bg-[#0A1A24] rounded-3xl p-5 md:p-6 text-white relative overflow-hidden shadow-md mb-6">
        <div className="absolute -top-16 -right-10 w-56 h-56 bg-red-600 rounded-full blur-[90px] opacity-30 pointer-events-none" />
        <div className="relative z-10 flex items-center gap-3 flex-wrap">
          <button onClick={() => onNavigate('admin-dispute-queue')} className="text-sm text-gray-300 hover:text-white transition-colors">← Back</button>
          <div className="w-px h-5 bg-white/20" />
          <h1 className="text-base font-black" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Dispute {match.id}</h1>
          <Badge variant="disputed">Under Review</Badge>
          <div className="flex items-center gap-1.5 text-amber-300 ml-auto">
            <IconClock size={14} />
            <span className="text-xs font-bold">{match.timeWaiting ?? '—'} waiting</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-4">
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Match Details</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><p className="text-xs text-gray-400 mb-1">Match ID</p><span className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{match.id}</span></div>
              <div><p className="text-xs text-gray-400 mb-1">Game</p><GameBadge game={match.game} /></div>
              <div><p className="text-xs text-gray-400 mb-1">Mode</p><p className="text-sm text-gray-700">{match.gameMode}</p></div>
              <div><p className="text-xs text-gray-400 mb-1">Created</p><p className="text-sm text-gray-700">{new Date(match.createdAt).toLocaleString()}</p></div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-400 mb-1">Wager in Escrow</p>
              <p className="text-3xl font-black tabular text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{wager}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <Avatar name={playerA.name} country={playerA.country} color={playerA.color} size="sm" />
                <div><p className="text-sm font-bold text-gray-800">{playerA.username}</p><p className="text-xs text-gray-400">{playerA.country === 'GH' ? '🇬🇭 Ghana' : '🇳🇬 Nigeria'}</p></div>
              </div>
              <span className="text-xs font-black text-gray-400 px-3 py-1 bg-gray-100 rounded-full">VS</span>
              {playerB && (
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <div className="text-right"><p className="text-sm font-bold text-gray-800">{playerB.username}</p><p className="text-xs text-gray-400">{playerB.country === 'GH' ? '🇬🇭 Ghana' : '🇳🇬 Nigeria'}</p></div>
                  <Avatar name={playerB.name} country={playerB.country} color={playerB.color} size="sm" />
                </div>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Dispute Info</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs font-bold text-amber-700 mb-1">Reason</p>
              <p className="text-sm text-gray-800">{match.disputeReason ?? 'No reason provided'}</p>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-base font-black text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Evidence</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: playerA.username, valid: evidenceAValid, set: setEvidenceAValid, color: 'green' },
              ...(playerB ? [{ label: playerB.username, valid: evidenceBValid, set: setEvidenceBValid, color: 'amber' }] : []),
            ].map(p => (
              <div key={p.label} className="space-y-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${p.color === 'green' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                  {p.label}'s submission
                </span>
                <div className={`rounded-xl overflow-hidden border-2 ${p.color === 'green' ? 'border-green-500' : 'border-amber-400'} aspect-video flex items-center justify-center bg-gray-900`}>
                  <p className="text-xs text-gray-400">Evidence under review</p>
                </div>
                <button
                  onClick={() => p.set(v => !v)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors w-full ${p.valid ? 'bg-green-100 text-green-700 border-green-300' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                >
                  {p.valid ? <><IconCheck size={12} className="inline mr-1" />Marked Valid</> : 'Mark as Valid'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] px-4 md:px-6 py-4 z-20">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-3">
          <Button variant="primary" size="sm" onClick={() => setPendingVerdict('playerA')} className="glow-green"><IconCheck size={16} />{playerA.username} Wins</Button>
          {playerB && <Button variant="primary" size="sm" onClick={() => setPendingVerdict('playerB')} className="glow-green"><IconCheck size={16} />{playerB.username} Wins</Button>}
          <Button variant="ghost" size="sm" onClick={() => setPendingVerdict('refund')}>Cancel & Refund Both</Button>
          <Button variant="danger" size="sm" onClick={() => setPendingVerdict('flag')} className="ml-auto"><IconFlag size={16} />Flag for Fraud</Button>
        </div>
      </div>

      {pendingVerdict && (
        <div className="fixed inset-0 z-30 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-up">
            <h3 className="text-base font-black text-gray-900 mb-1" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Confirm Verdict</h3>
            <p className="text-sm text-gray-500 mb-4">
              {pendingVerdict === 'playerA' && `${playerA.username} wins. ${wager} released from escrow.`}
              {pendingVerdict === 'playerB' && playerB && `${playerB.username} wins. ${wager} released from escrow.`}
              {pendingVerdict === 'refund' && 'Both players will receive a full refund.'}
              {pendingVerdict === 'flag' && 'This dispute will be escalated to the fraud team.'}
            </p>
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-600 mb-2">Add admin note (optional)</label>
              <textarea
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                placeholder="Document your reasoning..."
                rows={3}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" size="sm" fullWidth onClick={() => { setPendingVerdict(null); setAdminNote(''); }}>Cancel</Button>
              <Button variant={pendingVerdict === 'flag' ? 'danger' : 'primary'} size="sm" fullWidth onClick={handleConfirm}><IconCheck size={16} />Confirm</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}