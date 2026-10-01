import { useMemo } from 'react';
import { DEFAULT_DRAFT, GAME_DETAILS, FEE_FREE_PERIOD, calcPayout, type MatchDraft } from './CreateMatch';

export default function MatchResult({ onNavigate, matchDraft }: { onNavigate: (s: string) => void; matchDraft: MatchDraft | null }) {
  const draft = matchDraft ?? DEFAULT_DRAFT;
  const game = GAME_DETAILS[draft.game];
  const { pot, fee, winnings } = calcPayout(draft.wager);
  const money = (n: number) =>
    `GHS ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const confetti = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 1.5,
        duration: 2.5 + Math.random() * 2,
        size: 6 + Math.random() * 6,
        color: ['#16A34A', '#22C55E', '#FBBF24', '#3B82F6', '#EC4899'][i % 5],
      })),
    []
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] relative overflow-hidden flex items-center justify-center p-4">
      <style>{`@keyframes confetti-fall { to { transform: translateY(110vh) rotate(540deg); opacity: 0.8; } }`}</style>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {confetti.map((c, i) => (
          <span
            key={i}
            className="absolute rounded-sm"
            style={{
              left: `${c.left}%`,
              top: -20,
              width: c.size,
              height: c.size * 1.6,
              background: c.color,
              animation: `confetti-fall ${c.duration}s ${c.delay}s linear forwards`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-xl p-6 sm:p-8 flex flex-col items-center text-center animate-fade-up">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-[#16A34A] flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M6 14l5.5 5.5L22 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <p className="text-[11px] font-black uppercase tracking-widest text-[#16A34A] mb-1">You won!</p>
        <h1 className="text-3xl font-black text-gray-900 mb-1" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
          Congratulations!
        </h1>
        <p className="text-sm text-gray-500 mb-5">
          {game.title} <span className="text-gray-300">•</span> {draft.mode}
        </p>

        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">You won</p>
        <p className="text-5xl font-black text-[#16A34A] tabular mb-6" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
          {money(winnings)}
        </p>

        <div className="w-full rounded-2xl bg-gray-50 border border-gray-100 p-4 space-y-2 text-sm mb-6">
          <div className="flex justify-between text-gray-600"><span>Total pot</span><span className="font-bold text-gray-900">{money(pot)}</span></div>
          <div className="flex justify-between text-gray-600">
            <span>Platform fee ({FEE_FREE_PERIOD ? 'waived' : '10%'})</span>
            <span className="font-bold text-gray-900">- {money(fee)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2">
            <span className="font-bold text-gray-900">Added to your balance</span>
            <span className="font-black text-[#16A34A]">{money(winnings)}</span>
          </div>
        </div>

        <button
          onClick={() => onNavigate('payout')}
          className="w-full px-6 py-3.5 rounded-xl bg-[#16A34A] hover:bg-[#15803d] text-white font-bold text-sm shadow-md transition-colors mb-3"
          style={{ fontFamily: 'Chakra Petch, sans-serif' }}
        >
          Withdraw Winnings
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