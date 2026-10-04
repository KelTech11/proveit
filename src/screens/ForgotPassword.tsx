import { useState, useRef, useEffect, type KeyboardEvent } from 'react';

type Step = 'identify' | 'code' | 'reset' | 'done';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;
const MIN_PASSWORD = 8;

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const phoneDigits = (v: string) => v.replace(/\D/g, '');
const isPhone = (v: string) => {
  if (v.includes('@')) return false;
  let d = phoneDigits(v);
  if (d.length === 12 && d.startsWith('233')) d = d.slice(3);
  else if (d.length === 13 && d.startsWith('234')) d = d.slice(3);
  else d = d.replace(/^0/, '');
  return /^[25]\d{8}$/.test(d) || /^[789]\d{9}$/.test(d);
};

const maskEmail = (v: string) => {
  const [name, domain] = v.trim().split('@');
  return `${name.slice(0, 2)}${'•'.repeat(Math.max(1, name.length - 2))}@${domain}`;
};
const maskPhone = (v: string) => `•••• ••• ${phoneDigits(v).slice(-3)}`;

export default function ForgotPassword({ onClose, initialValue = '' }: { onClose: () => void; initialValue?: string }) {
  const [step, setStep] = useState<Step>('identify');
  const [identifier, setIdentifier] = useState(initialValue);
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [seconds, setSeconds] = useState(0);
  const [sending, setSending] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const viaEmail = identifier.includes('@');
  const validIdentifier = isEmail(identifier) || isPhone(identifier);
  const codeFull = code.every(d => d !== '');
  const pwLongEnough = password.length >= MIN_PASSWORD && /[A-Za-z]/.test(password) && /\d/.test(password);
  const pwMatch = password === confirm;
  const pwOk = pwLongEnough && pwMatch;

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const resetCode = () => {
    setCode(Array(CODE_LENGTH).fill(''));
    setSeconds(RESEND_SECONDS);
    setTimeout(() => inputs.current[0]?.focus(), 50);
  };

  const sendCode = () => {
    if (!validIdentifier || sending) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setStep('code');
      resetCode();
    }, 900);
  };

  const handleCodeChange = (i: number, value: string) => {
    let digits = value.replace(/\D/g, '');
    if (!digits) {
      setCode(prev => { const next = [...prev]; next[i] = ''; return next; });
      return;
    }
    // Box already had a digit and user typed another: keep only the new one
    if (digits.length === 2 && code[i]) digits = digits.slice(-1);
    setCode(prev => {
      const next = [...prev];
      digits.slice(0, CODE_LENGTH - i).split('').forEach((d, k) => { next[i + k] = d; });
      return next;
    });
    inputs.current[Math.min(i + digits.length, CODE_LENGTH - 1)]?.focus();
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) {
      setCode(prev => { const next = [...prev]; next[i - 1] = ''; return next; });
      inputs.current[i - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && i > 0) inputs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < CODE_LENGTH - 1) inputs.current[i + 1]?.focus();
    if (e.key === 'Enter' && codeFull) setStep('reset');
  };

  const inputClass =
    'w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus:border-[#16A34A] transition-colors';
  const primaryBtn = (enabled: boolean) =>
    `w-full px-6 py-3.5 rounded-xl font-bold text-sm text-white transition-all shadow-md ${
      enabled ? 'bg-[#16A34A] hover:bg-[#15803d]' : 'bg-gray-300 cursor-not-allowed shadow-none'
    }`;

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 animate-fade-up max-h-[92vh] overflow-y-auto"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)' }}
      >
        {/* Top row */}
        <div className="flex items-center justify-between mb-4">
          {step === 'code' || step === 'reset' ? (
            <button
              onClick={() => setStep(step === 'reset' ? 'code' : 'identify')}
              className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
            >
              ← Back
            </button>
          ) : (
            <span />
          )}
          {step !== 'done' && (
            <div className="flex items-center gap-1.5">
              {(['identify', 'code', 'reset'] as Step[]).map(s => (
                <span
                  key={s}
                  className={`h-1.5 rounded-full transition-all ${step === s ? 'w-5 bg-[#16A34A]' : 'w-1.5 bg-gray-200'}`}
                />
              ))}
            </div>
          )}
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-700 text-lg leading-none">
            ✕
          </button>
        </div>

        {/* STEP 1: identify */}
        {step === 'identify' && (
          <div>
            <div className="w-14 h-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center text-2xl mb-4">🔑</div>
            <h2 className="text-2xl font-black text-gray-900 mb-1" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
              Forgot password?
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Enter the email or phone number linked to your account and we'll send you a 6-digit code.
            </p>

            <label className="block text-xs font-bold text-gray-700 mb-1">Email or phone number</label>
            <input
              type="text"
              autoFocus
              autoComplete="username"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendCode(); }}
              placeholder="you@email.com or +233 20 000 0000"
              className={inputClass}
            />

            <button disabled={!validIdentifier || sending} onClick={sendCode} className={`${primaryBtn(validIdentifier && !sending)} mt-5`} style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
              {sending ? 'Sending...' : 'Send code'}
            </button>
          </div>
        )}

        {/* STEP 2: code */}
        {step === 'code' && (
          <div>
            <div className="w-14 h-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center text-2xl mb-4">
              {viaEmail ? '✉️' : '💬'}
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-1" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
              Enter the code
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              We sent a 6-digit code to your {viaEmail ? 'email' : 'phone'}{' '}
              <span className="font-bold text-gray-900">{viaEmail ? maskEmail(identifier) : maskPhone(identifier)}</span>.
            </p>

            <div className="flex justify-center gap-2 sm:gap-3 mb-4">
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete={i === 0 ? 'one-time-code' : 'off'}
                  value={digit}
                  onChange={e => handleCodeChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onFocus={e => e.target.select()}
                  aria-label={`Digit ${i + 1}`}
                  className={`w-11 h-14 sm:w-12 text-center text-2xl font-black rounded-xl border-2 outline-none transition-colors ${
                    digit ? 'border-[#16A34A] bg-green-50 text-gray-900' : 'border-gray-200 bg-white focus:border-[#16A34A]'
                  }`}
                  style={{ fontFamily: 'Chakra Petch, sans-serif' }}
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-xs mb-5">
              <button onClick={() => setStep('identify')} className="font-bold text-gray-500 hover:text-gray-900">
                Wrong {viaEmail ? 'email' : 'number'}? Change
              </button>
              {seconds > 0 ? (
                <span className="text-gray-400 font-semibold">Resend in 0:{String(seconds).padStart(2, '0')}</span>
              ) : (
                <button onClick={resetCode} className="font-bold text-[#16A34A] hover:underline">Resend code</button>
              )}
            </div>

            <button disabled={!codeFull} onClick={() => setStep('reset')} className={primaryBtn(codeFull)} style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
              Verify
            </button>
            <p className="text-[11px] text-gray-400 text-center mt-3">Demo mode: no real message is sent. Enter any 6 digits.</p>
          </div>
        )}

        {/* STEP 3: new password */}
        {step === 'reset' && (
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-1" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
              Create new password
            </h2>
            <p className="text-sm text-gray-500 mb-5">Use at least {MIN_PASSWORD} characters, with a letter and a number.</p>

            <label className="block text-xs font-bold text-gray-700 mb-1">New password</label>
            <input
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={inputClass}
            />
            {password && !pwLongEnough && (
              <p className="text-xs text-red-500 mt-1">At least {MIN_PASSWORD} characters, with a letter and a number.</p>
            )}

            <label className="block text-xs font-bold text-gray-700 mb-1 mt-3">Confirm password</label>
            <input
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && pwOk) setStep('done'); }}
              className={inputClass}
            />
            {confirm && !pwMatch && <p className="text-xs text-red-500 mt-1">Passwords don't match.</p>}

            <button onClick={() => setShowPw(s => !s)} className="text-xs font-bold text-gray-500 hover:text-gray-900 mt-3">
              {showPw ? 'Hide passwords' : 'Show passwords'}
            </button>

            <button disabled={!pwOk} onClick={() => setStep('done')} className={`${primaryBtn(pwOk)} mt-5`} style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
              Update password
            </button>
          </div>
        )}

        {/* STEP 4: done */}
        {step === 'done' && (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <div className="w-10 h-10 rounded-full bg-[#16A34A] flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
                  <path d="M6 14l5.5 5.5L22 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-1" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
              Password updated
            </h2>
            <p className="text-sm text-gray-500 mb-6">You can now log in with your new password.</p>
            <button onClick={onClose} className={primaryBtn(true)} style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
              Back to login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}