const KEY_FACTS = [
  { value: '15-20', unit: 'min', label: 'To submit result' },
  { value: '2', unit: 'shots', label: 'Proof required' },
  { value: '60', unit: 'sec', label: 'To dispute' },
  { value: '<24', unit: 'hrs', label: 'Review target' },
];

const RULES = [
  {
    title: 'Use your linked account',
    body: 'Play only with the in-game UID and username you verified on ProveIt. A mismatch can get you disqualified.',
  },
  {
    title: 'Funds lock when both press Start',
    body: 'Once both players press Start, the wager is locked in escrow. There is no cancelling after that.',
  },
  {
    title: 'Submit your result in time',
    body: 'You have 15-20 minutes after funds lock. If neither player submits, the match is marked abandoned and both players are refunded.',
  },
  {
    title: 'Upload 2 screenshots as proof',
    body: 'Add your final result screen and your match history, then tap Won or Lost. Your opponent has about 60 seconds to dispute with their own proof. If only the winner submits valid proof, they still get paid.',
  },
  {
    title: 'Disputes go to manual review',
    body: 'If both players claim the win, our team reviews the proof. Target is under 24 hours, and funds stay in escrow until it is resolved.',
  },
  {
    title: 'No fake proof or no-shows',
    body: 'Fake submissions, lost disputes and repeated abandoned matches lead to a warning, then suspension, then a ban.',
  },
  {
    title: 'No collusion',
    body: 'Wash-trading or throwing matches is flagged. Repeat matches between the same two accounts are capped, and withdrawals can be delayed on flagged accounts.',
  },
  {
    title: 'Play fair',
    body: 'Cheating and third-party tools are banned. Spotted a cheater? Report them from their profile. Reports are tracked as a pattern across matches.',
  },
];

const LADDER = [
  { label: 'Warning', style: 'bg-amber-50 text-amber-700 border-amber-200' },
  { label: 'Suspension', style: 'bg-orange-50 text-orange-700 border-orange-200' },
  { label: 'Ban', style: 'bg-red-50 text-red-700 border-red-200' },
];

export default function MatchRules({ onNavigate }: { onNavigate: (s: string) => void }) {
  return (
    <div className="min-h-screen bg-[#F4F7F9] text-gray-900 p-6 lg:p-8 flex flex-col items-center">
      <div className="max-w-[720px] w-full flex flex-col gap-6">

        <div>
          <button
            onClick={() => onNavigate('active-match')}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-900 text-sm font-bold transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Match Rules
          </button>
        </div>

        {/* Hero */}
        <div className="bg-gray-900 text-white rounded-[32px] p-6 lg:p-8 shadow-md relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-green-500/20 blur-3xl" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-green-400 bg-green-500/10 border border-green-500/30 px-3 py-1 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Fair Play
            </span>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
              Play fair. Get paid.
            </h1>
            <p className="text-sm text-gray-300 mt-2 leading-relaxed">
              These rules protect every wager on ProveIt. Read them once and you're set.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
            {KEY_FACTS.map((f) => (
              <div key={f.label} className="bg-white/5 border border-white/5 rounded-2xl p-3 text-center">
                <p className="text-xl font-black text-green-400 leading-none" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                  {f.value}<span className="text-[10px] text-green-300/80 ml-1 font-bold uppercase">{f.unit}</span>
                </p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1.5">{f.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Rules */}
        <div className="flex flex-col gap-3">
          {RULES.map((r, i) => (
            <div key={r.title} className="bg-white rounded-[20px] p-5 border border-gray-100 shadow-sm flex gap-4">
              <div
                className="w-9 h-9 rounded-xl bg-green-50 text-[#16A34A] border border-green-100 flex items-center justify-center text-sm font-black shrink-0"
                style={{ fontFamily: 'Chakra Petch, sans-serif' }}
              >
                {i + 1}
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-gray-900 text-sm" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{r.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed mt-1">{r.body}</p>

                {r.title === 'No fake proof or no-shows' && (
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {LADDER.map((l, idx) => (
                      <div key={l.label} className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${l.style}`}>{l.label}</span>
                        {idx < LADDER.length - 1 && <span className="text-gray-300 text-xs">→</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="p-4 rounded-2xl bg-green-50 border border-green-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-green-600 text-white flex items-center justify-center shrink-0 text-sm font-black">✓</div>
          <div>
            <p className="text-xs font-bold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Stay Fair. Win Together.</p>
            <p className="text-[11px] text-gray-600">Follow the rules and keep the community clean.</p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('active-match')}
          className="w-full py-3.5 rounded-xl font-bold text-white text-sm bg-[#16A34A] hover:bg-[#15803d] transition-all shadow-md"
          style={{ fontFamily: 'Chakra Petch, sans-serif' }}
        >
          Got it, back to match
        </button>

      </div>
    </div>
  );
}