import { useState } from 'react';

// Free access key from https://web3forms.com (emailed to you). Safe to keep in public code.
const WEB3FORMS_KEY = '34040a14-fc86-4d28-9cb7-16b662648459';

const TYPES = [
  { id: 'Bug', emoji: '🐞' },
  { id: 'Idea', emoji: '💡' },
  { id: 'Liked', emoji: '👍' },
  { id: 'Other', emoji: '💬' },
];

const prettyScreen = (s: string) => s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

export default function FeedbackButton({ screen }: { screen: string }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('Idea');
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);

  if (screen.startsWith('admin-')) return null;

  const keySet = /^[0-9a-f-]{20,}$/i.test(WEB3FORMS_KEY);
  const compact = screen === 'match-lobby' || screen === 'active-match';
  const canSend = keySet && text.trim().length >= 3 && !sending;

  const send = async () => {
    if (!canSend) return;
    setSending(true);
    setFailed(false);
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `ProveIt feedback: ${type} (${prettyScreen(screen)})`,
          from_name: 'ProveIt Feedback',
          type,
          screen: prettyScreen(screen),
          message: text.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
        setText('');
      } else {
        setFailed(true);
      }
    } catch {
      setFailed(true);
    }
    setSending(false);
  };

  const close = () => {
    setOpen(false);
    setSent(false);
    setFailed(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Send feedback"
        className={`fixed bottom-20 left-4 sm:bottom-4 z-50 flex items-center gap-2 rounded-full bg-[#16A34A] hover:bg-[#15803d] text-white shadow-lg transition-colors ${
          compact ? 'w-10 h-10 justify-center' : 'px-4 py-2.5'
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {!compact && (
          <span className="text-xs font-bold" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Feedback</span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />

          <div
            className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 animate-fade-up max-h-[92vh] overflow-y-auto"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                  Send feedback
                </h2>
                <p className="text-sm text-gray-500 mt-1">Tell us what's broken, confusing, or missing. It goes straight to the team.</p>
              </div>
              <button onClick={close} aria-label="Close" className="text-gray-400 hover:text-gray-700 text-lg leading-none ml-3">
                ✕
              </button>
            </div>

            {sent ? (
              <div className="text-center py-4">
                <style>{`
                  @keyframes fb-pop { 0% { transform: scale(0); } 100% { transform: scale(1); } }
                  @keyframes fb-draw { to { stroke-dashoffset: 0; } }
                  @keyframes fb-ring { 0% { transform: scale(0.8); opacity: 0.8; } 100% { transform: scale(1.7); opacity: 0; } }
                  @keyframes fb-burst {
                    0% { transform: translate(-50%, -50%) scale(0.3); opacity: 1; }
                    100% { transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) rotate(220deg) scale(1); opacity: 0; }
                  }
                  @keyframes fb-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                `}</style>

                <div className="relative w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <span className="absolute inset-0 rounded-full border-2 border-green-500" style={{ animation: 'fb-ring 1s ease-out 0.3s both' }} />
                  {Array.from({ length: 14 }).map((_, i) => {
                    const a = (i / 14) * Math.PI * 2;
                    const d = 62 + (i % 3) * 16;
                    return (
                      <span
                        key={i}
                        className="absolute left-1/2 top-1/2 w-2 h-2 rounded-sm"
                        style={{
                          background: ['#16A34A', '#22C55E', '#F59E0B', '#3B82F6', '#EC4899'][i % 5],
                          '--x': `${Math.cos(a) * d}px`,
                          '--y': `${Math.sin(a) * d}px`,
                          animation: 'fb-burst 0.9s ease-out 0.3s both',
                        } as React.CSSProperties}
                      />
                    );
                  })}
                  <div
                    className="relative w-16 h-16 rounded-full bg-[#16A34A] flex items-center justify-center shadow-lg"
                    style={{ animation: 'fb-pop 0.5s cubic-bezier(0.2, 0.9, 0.3, 1.4) both' }}
                  >
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" style={{ strokeDasharray: 24, strokeDashoffset: 24, animation: 'fb-draw 0.45s ease-out 0.35s forwards' }} />
                    </svg>
                  </div>
                </div>

                <p
                  className="text-xl font-black text-gray-900 mb-1"
                  style={{ fontFamily: 'Chakra Petch, sans-serif', animation: 'fb-rise 0.5s ease-out 0.55s both' }}
                >
                  Feedback sent! 🎉
                </p>
                <p className="text-sm text-gray-600 mb-1" style={{ animation: 'fb-rise 0.5s ease-out 0.7s both' }}>
                  {type === 'Bug'
                    ? "Thanks for spotting that. We'll look into it."
                    : type === 'Idea'
                    ? "Love the idea. We'll think it through."
                    : type === 'Liked'
                    ? "Glad you're enjoying ProveIt!"
                    : 'Thanks for reaching out.'}
                </p>
                <p className="text-xs text-gray-400 mb-5" style={{ animation: 'fb-rise 0.5s ease-out 0.85s both' }}>
                  We read every message. You're helping us build ProveIt.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSent(false)}
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition-colors"
                  >
                    Write another
                  </button>
                  <button
                    onClick={close}
                    className="flex-1 px-4 py-3 rounded-xl bg-[#16A34A] hover:bg-[#15803d] text-white font-bold text-sm transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">What kind?</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {TYPES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setType(t.id)}
                      className={`px-3 py-2 rounded-xl text-sm font-bold border-2 transition-colors ${
                        type === t.id ? 'border-[#16A34A] bg-green-50 text-[#16A34A]' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {t.emoji} {t.id}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={4}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Write your feedback here..."
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus:border-[#16A34A] transition-colors resize-none"
                />
                <p className="text-[11px] text-gray-400 mt-1">We'll include the screen you're on: {prettyScreen(screen)}.</p>

                {!keySet && (
                  <p className="text-[11px] text-red-500 mt-2">Feedback isn't set up yet.</p>
                )}
                {failed && (
                  <p className="text-[11px] text-red-500 mt-2">Couldn't send. Check your connection and try again.</p>
                )}

                <button
                  disabled={!canSend}
                  onClick={send}
                  className={`w-full mt-4 px-6 py-3.5 rounded-xl font-bold text-sm text-white transition-all shadow-md ${
                    canSend ? 'bg-[#16A34A] hover:bg-[#15803d]' : 'bg-gray-300 cursor-not-allowed shadow-none'
                  }`}
                  style={{ fontFamily: 'Chakra Petch, sans-serif' }}
                >
                  {sending ? 'Sending...' : 'Send feedback'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}