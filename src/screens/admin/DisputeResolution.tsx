import { useState } from 'react';
import {
  Avatar, Badge, Button, Card, GameBadge,
  IconAlertTriangle, IconClock, IconCheck, IconX, IconFlag, IconArrowRight,
} from '../../components/ui';
import { matches, players } from '../../data';

const dispute = matches.find(m => m.id === 'M-7835')!;
const playerA = players[2]; // AbenaElite
const playerB = players[4]; // AmaFire

const chatMessages = [
  { id: 1, player: 'A', text: 'I won 4-2 look at my screenshot', time: '09:02' },
  { id: 2, player: 'B', text: 'That screenshot is from a different match', time: '09:04' },
  { id: 3, player: 'A', text: "No it's not, the timestamp is right there", time: '09:06' },
  { id: 4, player: 'B', text: "The lobby ID doesn't match", time: '09:08' },
  { id: 5, player: 'A', text: "Call the admin it doesn't matter", time: '09:09' },
  { id: 6, player: 'B', text: 'I have video proof as well', time: '09:11' },
  { id: 7, player: 'A', text: 'Go ahead and send it then', time: '09:13' },
  { id: 8, player: 'B', text: 'Video uploaded to dispute thread', time: '09:15' },
];

type Verdict = 'playerA' | 'playerB' | 'refund' | 'flag' | null;

export default function AdminDisputeResolution({ onNavigate }: { onNavigate: (s: string) => void }) {
  const [pendingVerdict, setPendingVerdict] = useState<Verdict>(null);
  const [adminNote, setAdminNote] = useState('');
  const [resolved, setResolved] = useState(false);
  const [resolvedVerdict, setResolvedVerdict] = useState<Verdict>(null);
  const [markedA, setMarkedA] = useState(false);
  const [markedB, setMarkedB] = useState(false);

  const handleConfirm = () => {
    setResolvedVerdict(pendingVerdict);
    setResolved(true);
    setPendingVerdict(null);
  };

  if (resolved) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6 animate-fade-up">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <IconCheck size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
            Dispute Resolved
          </h2>
          <p className="text-sm text-gray-500 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
            {resolvedVerdict === 'playerA' && 'AbenaElite has been declared the winner. GHS 200 will be credited.'}
            {resolvedVerdict === 'playerB' && 'AmaFire has been declared the winner. GHS 200 will be credited.'}
            {resolvedVerdict === 'refund' && 'Both players will receive a full refund of GHS 100 each.'}
            {resolvedVerdict === null && 'Account flagged for fraud review.'}
          </p>
          {adminNote && (
            <div className="text-left bg-gray-50 rounded-lg p-3 mb-6">
              <p className="text-xs font-semibold text-gray-500 mb-1" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Admin Note</p>
              <p className="text-sm text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>{adminNote}</p>
            </div>
          )}
          <Button variant="primary" fullWidth onClick={() => onNavigate('dispute-queue')}>
            Back to Queue <IconArrowRight size={16} />
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-24 animate-fade-up">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => onNavigate('dispute-queue')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            ← Back
          </button>
          <div className="w-px h-5 bg-gray-200" />
          <h1 className="text-base font-bold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
            Dispute M-7835
          </h1>
          <Badge variant="disputed">Under Review</Badge>
          <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-md" style={{ fontFamily: 'Inter, sans-serif' }}>
            Priority: Normal
          </span>
          <div className="flex items-center gap-1.5 text-amber-600 ml-auto">
            <IconClock size={14} />
            <span className="text-xs font-semibold" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>2h 14m waiting</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-4">
          {/* Left column */}
          <div className="space-y-4">
            {/* Match Details */}
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                Match Details
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Match ID</p>
                  <span className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded">M-7835</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Game</p>
                  <GameBadge game="CODM" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Mode</p>
                  <p className="text-sm text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>Hardpoint Search</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Created</p>
                  <p className="text-sm text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>25 Sep 2025, 09:00</p>
                </div>
              </div>

              {/* Wager */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-xs text-gray-400 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Wager in Escrow</p>
                <p className="text-3xl font-bold tabular text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                  GHS 200.00
                </p>
              </div>

              {/* Players VS */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <Avatar name={playerA.name} country={playerA.country} color={playerA.color} size="sm" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{playerA.username}</p>
                    <p className="text-xs text-gray-400">🇬🇭 Ghana</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-400 px-3 py-1 bg-gray-100 rounded-full">VS</span>
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{playerB.username}</p>
                    <p className="text-xs text-gray-400">🇬🇭 Ghana</p>
                  </div>
                  <Avatar name={playerB.name} country={playerB.country} color={playerB.color} size="sm" />
                </div>
              </div>
            </Card>

            {/* Dispute Info */}
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                Dispute Info
              </h2>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                <p className="text-xs font-semibold text-amber-700 mb-1" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Dispute Reason</p>
                <p className="text-sm text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Both players claim victory. Screenshot evidence conflicting.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Avatar name={playerA.name} country={playerA.country} color={playerA.color} size="sm" />
                <p className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Submitted by <span className="font-semibold text-gray-700">AbenaElite</span> · 2h 14m ago
                </p>
              </div>
            </Card>

            {/* Chat History */}
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                Player Communication Log
              </h2>
              <div className="space-y-2 max-h-64 overflow-y-auto no-scroll pr-1">
                {chatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${msg.player === 'B' ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar
                      name={msg.player === 'A' ? playerA.name : playerB.name}
                      country={msg.player === 'A' ? playerA.country : playerB.country}
                      color={msg.player === 'A' ? playerA.color : playerB.color}
                      size="sm"
                    />
                    <div className={`max-w-[75%] rounded-xl px-3 py-2 ${
                      msg.player === 'A' ? 'bg-blue-50 border border-blue-100' : 'bg-gray-100 border border-gray-200'
                    }`}>
                      <p className="text-xs text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>{msg.text}</p>
                      <p className={`text-[10px] text-gray-400 mt-0.5 ${msg.player === 'B' ? 'text-left' : 'text-right'}`}
                        style={{ fontFamily: 'Inter, sans-serif' }}>{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
              Evidence Comparison
            </h2>

            {/* Evidence side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Player A Evidence */}
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold border border-green-200"
                  style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                  AbenaElite's Screenshot
                </span>

                {/* Fake screenshot */}
                <div
                  className="rounded-xl overflow-hidden border-2 border-green-500 aspect-video flex flex-col"
                  style={{ background: '#0A0A0A' }}
                >
                  <div className="px-3 py-1.5 flex items-center justify-between" style={{ background: '#1A1A1A' }}>
                    <span className="text-xs font-bold" style={{ color: '#FF6B00', fontFamily: 'Chakra Petch, sans-serif' }}>
                      CODM • Hardpoint
                    </span>
                    <span className="text-xs text-gray-500" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>BO3</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center gap-1">
                    <p className="text-xs font-bold tracking-widest" style={{ color: '#FFD700', fontFamily: 'Chakra Petch, sans-serif' }}>
                      VICTORY
                    </p>
                    <p className="text-2xl font-bold text-white tabular" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>250 pts</p>
                    <div className="flex items-center gap-1 mt-1">
                      {markedA && <span className="text-green-400 text-xs">✓ Marked valid</span>}
                    </div>
                  </div>
                  <div className="px-3 py-1.5 text-center" style={{ background: '#111' }}>
                    <p className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                      KwameGOAT • Sgt. Asante
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <span className="font-semibold">Timestamp:</span> 25 Sep 2025 09:14:22
                </p>
                <button
                  onClick={() => setMarkedA(v => !v)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors w-full ${
                    markedA
                      ? 'bg-green-100 text-green-700 border-green-300'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                  style={{ fontFamily: 'Chakra Petch, sans-serif' }}
                >
                  {markedA ? <><IconCheck size={12} className="inline mr-1" />Marked Valid</> : 'Mark as Valid'}
                </button>
              </div>

              {/* Player B Evidence */}
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold border border-amber-200"
                  style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                  AmaFire's Screenshot
                </span>

                <div
                  className="rounded-xl overflow-hidden border-2 border-amber-400 aspect-video flex flex-col"
                  style={{ background: '#0A0A0A' }}
                >
                  <div className="px-3 py-1.5 flex items-center justify-between" style={{ background: '#1A1A1A' }}>
                    <span className="text-xs font-bold" style={{ color: '#FF6B00', fontFamily: 'Chakra Petch, sans-serif' }}>
                      CODM • Hardpoint
                    </span>
                    <span className="text-xs text-gray-500" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>BO3</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center gap-1">
                    <p className="text-xs font-bold tracking-widest" style={{ color: '#FFD700', fontFamily: 'Chakra Petch, sans-serif' }}>
                      VICTORY
                    </p>
                    <p className="text-2xl font-bold text-white tabular" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>187 pts</p>
                    <div className="flex items-center gap-1 mt-1">
                      {markedB && <span className="text-green-400 text-xs">✓ Marked valid</span>}
                    </div>
                  </div>
                  <div className="px-3 py-1.5 text-center" style={{ background: '#111' }}>
                    <p className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                      AmaFire • Fire Squad
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <span className="font-semibold">Timestamp:</span> 25 Sep 2025 09:28:47
                </p>
                <button
                  onClick={() => setMarkedB(v => !v)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors w-full ${
                    markedB
                      ? 'bg-green-100 text-green-700 border-green-300'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                  style={{ fontFamily: 'Chakra Petch, sans-serif' }}
                >
                  {markedB ? <><IconCheck size={12} className="inline mr-1" />Marked Valid</> : 'Mark as Valid'}
                </button>
              </div>
            </div>

            {/* Timestamp alert */}
            <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <IconAlertTriangle size={18} className="text-red-500 shrink-0" />
              <p className="text-xs font-bold text-red-700 uppercase tracking-wide" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                TIMESTAMPS DIFFER BY 14 MINUTES
              </p>
            </div>

            {/* Admin analysis notes */}
            <Card className="p-4">
              <h3 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                Admin Analysis
              </h3>
              <div className="space-y-2 text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>
                <div className="flex items-start gap-2">
                  <IconX size={12} className="text-red-500 mt-0.5 shrink-0" />
                  <p className="text-gray-600">Lobby IDs in screenshots do not match (L-4429 vs L-4401)</p>
                </div>
                <div className="flex items-start gap-2">
                  <IconX size={12} className="text-red-500 mt-0.5 shrink-0" />
                  <p className="text-gray-600">14-minute timestamp discrepancy indicates different match sessions</p>
                </div>
                <div className="flex items-start gap-2">
                  <IconCheck size={12} className="text-green-500 mt-0.5 shrink-0" />
                  <p className="text-gray-600">Both players have clean dispute history (&lt;3 disputes)</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Floating verdict bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] px-4 md:px-6 py-4 z-20">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setPendingVerdict('playerA')}
            className="glow-green"
          >
            <IconCheck size={16} />
            AbenaElite Wins
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setPendingVerdict('playerB')}
            className="glow-green"
          >
            <IconCheck size={16} />
            AmaFire Wins
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPendingVerdict('refund')}
          >
            Cancel & Refund Both
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setPendingVerdict('flag')}
            className="ml-auto"
          >
            <IconFlag size={16} />
            Flag for Fraud
          </Button>
        </div>
      </div>

      {/* Confirmation dialog */}
      {pendingVerdict && (
        <div className="fixed inset-0 z-30 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-up">
            <h3 className="text-base font-bold text-gray-900 mb-1" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
              Confirm Verdict
            </h3>
            <p className="text-sm text-gray-500 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              {pendingVerdict === 'playerA' && 'You are declaring AbenaElite the winner. GHS 200 will be released from escrow.'}
              {pendingVerdict === 'playerB' && 'You are declaring AmaFire the winner. GHS 200 will be released from escrow.'}
              {pendingVerdict === 'refund' && 'Both players will receive a full refund. Escrow will be cancelled.'}
              {pendingVerdict === 'flag' && 'This dispute will be escalated to the fraud review team.'}
            </p>

            {/* Verdict summary badge */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-4 text-sm font-semibold ${
              pendingVerdict === 'playerA' || pendingVerdict === 'playerB' ? 'bg-green-50 text-green-700' :
              pendingVerdict === 'refund' ? 'bg-gray-100 text-gray-700' :
              'bg-red-50 text-red-700'
            }`} style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
              {pendingVerdict === 'playerA' && <><IconCheck size={16} /> AbenaElite declared winner</>}
              {pendingVerdict === 'playerB' && <><IconCheck size={16} /> AmaFire declared winner</>}
              {pendingVerdict === 'refund' && <>Cancel & refund both parties</>}
              {pendingVerdict === 'flag' && <><IconFlag size={16} /> Flag for fraud review</>}
            </div>

            {/* Admin note */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-600 mb-2" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                Add admin note (optional)
              </label>
              <textarea
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                placeholder="Document your reasoning..."
                rows={3}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none text-gray-800 placeholder-gray-400"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                onClick={() => { setPendingVerdict(null); setAdminNote(''); }}
              >
                Cancel
              </Button>
              <Button
                variant={pendingVerdict === 'flag' ? 'danger' : 'primary'}
                size="sm"
                fullWidth
                onClick={handleConfirm}
              >
                <IconCheck size={16} />
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
