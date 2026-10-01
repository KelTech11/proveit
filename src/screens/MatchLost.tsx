import { DEFAULT_DRAFT, GAME_DETAILS, type MatchDraft } from './CreateMatch';

export default function MatchLost({ onNavigate, matchDraft }: { onNavigate: (s: string) => void; matchDraft: MatchDraft | null }) {
  const draft = matchDraft ?? DEFAULT_DRAFT;
  const game = GAME_DETAILS[draft.game];
  const money = (n: number) =>
    `GHS ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-xl p-6 sm:p-8 flex flex-col items-center text-center animate-fade-up">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-4xl">🤝</div>

        <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1">Match over</p>
        <h1 className="text-3xl font-black text-gray-900 mb-1" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
          Good game
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          {game.title} <span className="text-gray-300">•</span> {draft.mode}
        </p>

        <div className="w-full rounded-2xl bg-gray-50 border border-gray-100 p-4 space-y-2 text-sm mb-6">
          <div className="flex justify-between text-gray-600">
            <span>Your stake</span>
            <span className="font-bold text-gray-900">{money(draft.wager)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2 text-gray-600">
            <span>Released to opponent</span>
            <span className="font-bold text-gray-900">{money(draft.wager)}</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-6">
          You reported a loss, so the escrow has been released to your opponent. Your next win is one match away.
        </p>

        <button
          onClick={() => onNavigate('create-match')}
          className="w-full px-6 py-3.5 rounded-xl bg-[#16A34A] hover:bg-[#15803d] text-white font-bold text-sm shadow-md transition-colors mb-3"
          style={{ fontFamily: 'Chakra Petch, sans-serif' }}
        >
          Play Again
        </button>
        <button
          onClick={() => onNavigate('dashboard')}
          className="w-full px-6 py-3.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition-colors"
          style={{ fontFamily: 'Chakra Petch, sans-serif' }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}