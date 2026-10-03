import { useState, useEffect, useRef } from 'react';
import logo from '../assets/proveit-logo.png';
import { Button, Input, PhoneInput } from '../components/ui';
import { type Country } from '../data';

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const DRAFT_KEY = 'proveit_signup_draft';
const loadDraft = () => {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}'); } catch { return {}; }
};

export default function CreateAccount({ onNavigate, onSignedUp }: { onNavigate: (s: string) => void; onSignedUp: () => void }) {
  const [draft] = useState<any>(loadDraft);
  const [step, setStep] = useState<Step>(Math.min(Number(draft.step) || 1, 4) as Step);

  // Step 1
  const [fullName, setFullName] = useState<string>(draft.fullName || '');
  const [username, setUsername] = useState<string>(draft.username || '');
  const [email, setEmail] = useState<string>(draft.email || '');
  const [country, setCountry] = useState<Country>(draft.country === 'NG' ? 'NG' : 'GH');
  const [phone, setPhone] = useState<string>(draft.phone || '');

  // Step 2
  const [otp, setOtp] = useState('');

  // Step 3
  const [isAdult, setIsAdult] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [underageBlocked, setUnderageBlocked] = useState(false);

  // Step 4
  const [idType, setIdType] = useState(draft.country === 'NG' ? 'nin' : 'ghana_card');
  const [idNumber, setIdNumber] = useState(draft.country === 'NG' ? '' : 'GHA-');
  const [idFrontUploaded, setIdFrontUploaded] = useState(false);
  const [idBackUploaded, setIdBackUploaded] = useState(false);
  const [selfieUploaded, setSelfieUploaded] = useState(false);

  // Step 5
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 6
  const [selectedGame, setSelectedGame] = useState('codm');
  const [gameUid, setGameUid] = useState('');
  const [gameScreenshotUploaded, setGameScreenshotUploaded] = useState(false);

  // Step 7 (submitted state)
  const [submitted, setSubmitted] = useState(!!draft.submitted);

  const [tried, setTried] = useState(false);
  const next = () => { setTried(false); setStep(s => Math.min(s + 1, 7) as Step); };
  const back = () => { setTried(false); setStep(s => Math.max(s - 1, 1) as Step); };

  const [previews, setPreviews] = useState<Record<string, string>>({});

  const firstName = (fullName.trim().split(/\s+/)[0] || '').replace(/^./, c => c.toUpperCase());
  const phoneLen = country === 'GH' ? 9 : 10;
  const dialCode = country === 'GH' ? '+233' : '+234';
  const phoneDigits = phone.replace(/\D/g, '');
  const phoneValid =
    phoneDigits.length === phoneLen &&
    (country === 'GH' ? /^[25]/ : /^[789]/).test(phoneDigits);
  const canStep1 =
    fullName.trim().split(/\s+/).filter(w => w.length >= 2).length >= 2 &&
    /^[a-z][a-z0-9_]{2,19}$/.test(username) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) &&
    phoneValid;
  const canStep2 = /^\d{6}$/.test(otp.trim());

  const formatId = (type: string, raw: string) => {
    const v = raw.toUpperCase();
    if (type === 'ghana_card') {
      const digits = v.replace(/^GHA/, '').replace(/\D/g, '').slice(0, 10);
      return 'GHA-' + digits.slice(0, 9) + (digits.length > 9 ? '-' + digits[9] : '');
    }
    if (type === 'nin') return v.replace(/\D/g, '').slice(0, 11);
    if (type === 'nhis') return v.replace(/\D/g, '').slice(0, 12);
    if (type === 'voters_id') return v.replace(/\D/g, '').slice(0, 10);
    return v.replace(/[^A-Z0-9]/g, '').slice(0, 9);
  };
  const idValid =
    idType === 'ghana_card' ? /^GHA-\d{9}-\d$/.test(idNumber)
    : idType === 'nin' ? /^\d{11}$/.test(idNumber)
    : idType === 'voters_id' ? /^\d{10}$/.test(idNumber)
    : idType === 'nhis' ? /^\d{8,12}$/.test(idNumber)
    : /^[A-Z0-9]{6,9}$/.test(idNumber);
  const passwordValid = password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);

  const [showPw, setShowPw] = useState(false);
  const [resendIn, setResendIn] = useState(45);
  const pwScore = [
    password.length >= 8,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
  const pwLabel = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'][pwScore];

  useEffect(() => {
    if (step === 2) setResendIn(45);
  }, [step]);
  useEffect(() => {
    if (step !== 2 || resendIn <= 0) return;
    const t = setTimeout(() => setResendIn(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, resendIn]);

  const e1: Record<string, string> = {};
  if (fullName.trim().split(/\s+/).filter(w => w.length >= 2).length < 2) e1.fullName = 'Enter your first and last name';
  if (!username) e1.username = 'Choose a username';
  else if (!/^[a-z][a-z0-9_]{2,19}$/.test(username)) e1.username = 'Use 3-20 lowercase letters, numbers or underscore, starting with a letter';
  if (!email.trim()) e1.email = 'Enter your email address';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) e1.email = 'Enter a valid email, like name@gmail.com';
  if (!phone) e1.phone = 'Enter your phone number';
  else if (!phoneValid) e1.phone = country === 'GH' ? 'Enter 9 digits after +233, starting with 2 or 5' : 'Enter 10 digits after +234, starting with 7, 8 or 9';

  const e2: Record<string, string> = {};
  if (!/^\d{6}$/.test(otp.trim())) e2.otp = 'Enter the 6-digit code we sent you';

  const e3: Record<string, string> = {};
  if (!agreedTerms) e3.terms = 'You need to agree to continue';

  const e4: Record<string, string> = {};
  if (!idValid) {
    e4.idNumber =
      idType === 'ghana_card' ? 'Enter your full Ghana Card number, like GHA-123456789-0'
      : idType === 'nin' ? 'NIN must be 11 digits'
      : idType === 'voters_id' ? 'Voter ID must be 10 digits'
      : idType === 'nhis' ? 'Enter your NHIS number (8 to 12 digits)'
      : 'Enter your passport number (6 to 9 letters or numbers)';
  }
  if (!idFrontUploaded) e4.front = idType === 'passport' ? 'Upload the photo page of your passport' : 'Upload the front of your ID';
  if (idType === 'ghana_card' && !idBackUploaded) e4.back = 'Upload the back of your Ghana Card';
  if (!selfieUploaded) e4.selfie = 'Take a selfie to continue';
  const upErr = (label: string) => (label === 'Front of ID' ? e4.front : label === 'Back of ID' ? e4.back : e4.selfie);

  const e5: Record<string, string> = {};
  if (!passwordValid) e5.password = 'Use at least 8 characters, with a letter and a number';
  if (!confirmPassword) e5.confirm = 'Re-enter your password';
  else if (password !== confirmPassword) e5.confirm = "Passwords don't match";

  const e6: Record<string, string> = {};
  if (gameUid.length < 6) e6.uid = 'Enter your in-game UID (at least 6 characters)';
  else if (selectedGame === 'codm' && !/^\d+$/.test(gameUid)) e6.uid = 'CODM UIDs are numbers only';
  if (!gameScreenshotUploaded) e6.shot = 'Upload a screenshot of your in-game profile';

  const goToFirstError = () => {
    setTimeout(() => {
      const el = document.querySelector('.border-red-400, .field-error') as HTMLElement | null;
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const target = el.matches('input, select') ? el : el.querySelector('input, select');
      (target as HTMLElement | null)?.focus({ preventScroll: true });
    }, 60);
  };
  const attempt = (errs: Record<string, string>, go: () => void) => {
    if (Object.keys(errs).length === 0) { go(); return; }
    setTried(true);
    goToFirstError();
  };

  const prevCountry = useRef(country);
  useEffect(() => {
    if (prevCountry.current === country) return;
    prevCountry.current = country;
    setPhone('');
    setIdType(country === 'GH' ? 'ghana_card' : 'nin');
    setIdNumber(country === 'GH' ? 'GHA-' : '');
  }, [country]);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, fullName, username, email, country, phone, submitted }));
    } catch {}
  }, [step, fullName, username, email, country, phone, submitted]);

  const pickImage = (key: string, setDone: (v: boolean) => void, capture?: 'user' | 'environment') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    if (capture) input.setAttribute('capture', capture);
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file || !file.type.startsWith('image/')) return;
      setPreviews(p => ({ ...p, [key]: URL.createObjectURL(file) }));
      setDone(true);
    };
    input.click();
  };

  const handleEligibilityNext = () => {
    if (!isAdult) {
      setUnderageBlocked(true);
      return;
    }
    next();
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
          Application Submitted
        </h1>
        <p className="text-gray-500 text-sm max-w-sm mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
          Your account is created and under review. You can look around, but you can't create or
          join matches or withdraw until verification is complete. This usually takes a few hours,
          and we'll notify you by email.
        </p>
        <Button variant="primary" size="lg" onClick={() => { try { localStorage.removeItem(DRAFT_KEY); } catch {} onSignedUp(); onNavigate('dashboard'); }}>
          Go to my account
        </Button>
      </div>
    );
  }

  if (underageBlocked) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
          Age Requirement Not Met
        </h1>
        <p className="text-gray-500 text-sm max-w-sm mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
          ProveIt is only available to users aged 18 and above. You cannot create an account at this time.
        </p>
        <Button variant="ghost" size="lg" onClick={() => onNavigate('home')}>
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 pt-8 pb-4">
        <div className="bg-black rounded-full px-3 py-2 flex items-center">
          <img src={logo} alt="ProveIt" className="h-7 w-auto" />
        </div>
        <span className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
          Prove<span className="text-green-600">It</span>
        </span>
      </header>

      {/* Progress indicator */}
      <div className="px-6 mb-2">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
            Step {step} of 7
          </p>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-600 transition-all duration-300"
            style={{ width: `${(step / 7) * 100}%` }}
          />
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 flex items-start justify-center px-6 pt-6 pb-10">
        <div className="w-full max-w-sm">

          {/* STEP 1 — Basic info */}
          {step === 1 && (
            <div className="animate-fade-up">
              <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                Let's get started
              </h1>
              <p className="text-gray-500 text-sm mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                Tell us a bit about yourself
              </p>

              <div className="mb-4">
                <Input label="Full Name" type="text" value={fullName} onChange={v => setFullName(v.replace(/[^A-Za-z\u00C0-\u024F\s'.-]/g, '').replace(/\s{2,}/g, ' ').slice(0, 60))} placeholder="First and last name" autoComplete="name" error={tried ? e1.fullName : undefined} />
              </div>
              <div className="mb-4">
                <Input label="Username" type="text" value={username} onChange={v => setUsername(v.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20))} placeholder="Choose a username" autoComplete="username" error={tried ? e1.username : undefined} />
                <p className="text-xs text-gray-400 mt-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Lowercase letters, numbers and underscore. 3 to 20 characters, starting with a letter.
                </p>
              </div>

              <div className="mb-4">
                <Input label="Email Address" type="email" value={email} onChange={v => setEmail(v.toLowerCase().replace(/\s/g, ''))} placeholder="Enter your email" autoComplete="email" inputMode="email" error={tried ? e1.email : undefined} />
                <p className="text-xs text-gray-400 mt-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                  We'll send your verification result to this email once your account is reviewed
                </p>
              </div>

              <div className="mb-5">
                <label className="text-sm font-medium text-gray-700 mb-2 block" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Select Country
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCountry('GH')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all ${
                      country === 'GH' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                    style={{ fontFamily: 'Chakra Petch, sans-serif' }}
                  >
                    <span className="text-xl">🇬🇭</span>
                    Ghana
                  </button>
                  <button
                    onClick={() => setCountry('NG')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all ${
                      country === 'NG' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                    style={{ fontFamily: 'Chakra Petch, sans-serif' }}
                  >
                    <span className="text-xl">🇳🇬</span>
                    Nigeria
                  </button>
                </div>
              </div>

              <div className="mb-8">
                <PhoneInput value={phone} onChange={v => setPhone(v.replace(/\D/g, '').replace(/^0+/, '').slice(0, phoneLen))} country={country} onCountryChange={setCountry} />
                {tried && e1.phone && (
                  <p className="field-error text-xs text-red-500 mt-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>{e1.phone}</p>
                )}
              </div>

              <Button variant="primary" size="lg" fullWidth onClick={() => attempt(e1, next)}>
                Next
              </Button>
            </div>
          )}

          {/* STEP 2 — Phone verification */}
          {step === 2 && (
            <div className="animate-fade-up">
              <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                Welcome{firstName ? <>, <span className="text-green-600">{firstName}</span></> : ''} 👋
              </h1>
              <p className="text-gray-500 text-sm mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                Let's verify your phone. We sent a code to {phone ? `${dialCode} ${phone}` : 'your number'}
              </p>

              <div className="mb-4">
                <Input label="Verification Code" type="tel" value={otp} onChange={v => setOtp(v.replace(/\D/g, '').slice(0, 6))} placeholder="Enter 6-digit code" autoComplete="one-time-code" inputMode="numeric" error={tried ? e2.otp : undefined} />
              </div>

              <p className="text-sm text-gray-500 mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
                Didn't get it?{' '}
                {resendIn > 0 ? (
                  <span className="text-gray-400 font-semibold">Resend in 0:{String(resendIn).padStart(2, '0')}</span>
                ) : (
                  <button type="button" onClick={() => setResendIn(45)} className="text-green-600 font-semibold hover:text-green-700">Resend code</button>
                )}
              </p>

              <div className="flex gap-3">
                <Button variant="ghost" size="lg" onClick={back}>Back</Button>
                <Button variant="primary" size="lg" fullWidth onClick={() => attempt(e2, next)}>Next</Button>
              </div>
            </div>
          )}

          {/* STEP 3 — Eligibility */}
          {step === 3 && (
            <div className="animate-fade-up">
              <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                Eligibility
              </h1>
              <p className="text-gray-500 text-sm mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                A few things we need to confirm
              </p>

              <label className="flex items-start gap-3 mb-4 p-4 rounded-xl border border-gray-200 cursor-pointer hover:border-green-300 transition-colors">
                <input
                  type="checkbox"
                  checked={isAdult}
                  onChange={e => setIsAdult(e.target.checked)}
                  className="mt-0.5 accent-green-600 w-4 h-4"
                />
                <span className="text-sm text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                  I confirm that I am 18 years of age or older
                </span>
              </label>

              <label className={`flex items-start gap-3 mb-8 p-4 rounded-xl border cursor-pointer transition-colors ${tried && e3.terms ? 'border-red-400 bg-red-50 field-error' : 'border-gray-200 hover:border-green-300'}`}>
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={e => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 accent-green-600 w-4 h-4"
                />
                <span className="text-sm text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                  I agree to the{' '}
                  <span className="text-green-600 underline">Terms of Service</span> and{' '}
                  <span className="text-green-600 underline">Privacy Policy</span>
                  {tried && e3.terms && <span className="block text-xs text-red-500 mt-1">{e3.terms}</span>}
                </span>
              </label>

              <div className="flex gap-3">
                <Button variant="ghost" size="lg" onClick={back}>Back</Button>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => attempt(e3, handleEligibilityNext)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4 — KYC */}
          {step === 4 && (
            <div className="animate-fade-up">
              <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                Verify your identity
              </h1>
              <p className="text-gray-500 text-sm mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                We need to confirm who you are
              </p>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block" style={{ fontFamily: 'Inter, sans-serif' }}>
                  ID Type
                </label>
                <select
                  value={idType}
                  onChange={e => {
                    setIdType(e.target.value);
                    setIdNumber(e.target.value === 'ghana_card' ? 'GHA-' : '');
                    setIdFrontUploaded(false);
                    setIdBackUploaded(false);
                    setPreviews(p => ({ ...p, 'Front of ID': '', 'Back of ID': '' }));
                  }}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm font-medium focus:border-green-500 focus:outline-none"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {country === 'GH' ? (
                    <>
                      <option value="ghana_card">Ghana Card</option>
                      <option value="voters_id">Voter ID</option>
                      <option value="passport">Passport</option>
                      <option value="nhis">NHIS ID</option>
                    </>
                  ) : (
                    <>
                      <option value="nin">NIN</option>
                      <option value="passport">Passport</option>
                    </>
                  )}
                </select>
              </div>

              <div className="mb-5">
                <Input
                  label="ID Number"
                  type="text"
                  value={idNumber}
                  onChange={v => setIdNumber(formatId(idType, v))}
                  error={tried ? e4.idNumber : undefined}
                  placeholder={idType === 'ghana_card' ? 'GHA-000000000-0' : idType === 'nin' ? '11-digit NIN' : 'Enter your ID number'}
                />
              </div>

              {/* Upload buttons */}
              {[
                { label: 'Front of ID', done: idFrontUploaded, setDone: setIdFrontUploaded },
                { label: 'Back of ID', done: idBackUploaded, setDone: setIdBackUploaded, onlyFor: 'ghana_card' },
                { label: 'Selfie (Liveness Check)', done: selfieUploaded, setDone: setSelfieUploaded },
              ].filter(item => !item.onlyFor || item.onlyFor === idType).map(item => (
                <button
                  key={item.label}
                  onClick={() => pickImage(item.label, item.setDone, item.label.startsWith('Selfie') ? 'user' : undefined)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 mb-3 transition-all ${
                    item.done ? 'border-green-500 bg-green-50' : tried && upErr(item.label) ? 'border-dashed border-red-400 bg-red-50' : 'border-dashed border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.done ? 'bg-green-600' : 'bg-gray-100'}`}>
                    {previews[item.label] ? (
                      <img src={previews[item.label]} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : item.done ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="13" r="4" stroke="#6B7280" strokeWidth="2" />
                      </svg>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {item.done ? 'Captured' : tried && upErr(item.label) ? <span className="text-red-500 font-semibold">{upErr(item.label)}</span> : 'Tap to open camera'}
                    </p>
                  </div>
                </button>
              ))}

              <div className="flex gap-3 mt-5">
                <Button variant="ghost" size="lg" onClick={back}>Back</Button>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => attempt(e4, next)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5 — Password */}
          {step === 5 && (
            <div className="animate-fade-up">
              <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                Secure your account
              </h1>
              <p className="text-gray-500 text-sm mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                Create a strong password
              </p>

              <div className="mb-4">
                <Input
                  label="Create Password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={setPassword}
                  placeholder="Enter a password"
                  autoComplete="new-password"
                  error={tried ? e5.password : undefined}
                  suffix={<button type="button" onClick={() => setShowPw(s => !s)} className="text-xs font-semibold text-gray-500 hover:text-gray-800">{showPw ? 'Hide' : 'Show'}</button>}
                />
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= pwScore ? (pwScore <= 1 ? 'bg-red-500' : pwScore === 2 ? 'bg-amber-500' : pwScore === 3 ? 'bg-lime-500' : 'bg-green-600') : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <p className="text-xs mt-1 text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>{pwLabel}</p>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                  At least 8 characters, with a letter and a number.
                </p>
              </div>
              <div className="mb-8">
                <Input
                  label="Confirm Password"
                  type={showPw ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  error={(tried || confirmPassword) && e5.confirm ? e5.confirm : undefined}
                  suffix={<button type="button" onClick={() => setShowPw(s => !s)} className="text-xs font-semibold text-gray-500 hover:text-gray-800">{showPw ? 'Hide' : 'Show'}</button>}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" size="lg" onClick={back}>Back</Button>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => attempt(e5, next)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* STEP 6 — Game linking */}
          {step === 6 && (
            <div className="animate-fade-up">
              <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                Link your game
              </h1>
              <p className="text-gray-500 text-sm mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                Connect the game you'll be playing on
              </p>

              <div className="flex gap-2 mb-5">
                <button
                  onClick={() => setSelectedGame('codm')}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all ${
                    selectedGame === 'codm' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'
                  }`}
                  style={{ fontFamily: 'Chakra Petch, sans-serif' }}
                >
                  CODM
                </button>
                <button
                  onClick={() => setSelectedGame('fc_mobile')}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all ${
                    selectedGame === 'fc_mobile' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'
                  }`}
                  style={{ fontFamily: 'Chakra Petch, sans-serif' }}
                >
                  FC Mobile
                </button>
              </div>

              <div className="mb-4">
                <Input label="In-Game UID" type="text" value={gameUid} onChange={v => setGameUid(selectedGame === 'codm' ? v.replace(/\D/g, '') : v)} placeholder="Enter your game UID" autoComplete="off" inputMode={selectedGame === 'codm' ? 'numeric' : 'text'} error={tried ? e6.uid : undefined} />
              </div>

              <button
                onClick={() => pickImage('game', setGameScreenshotUploaded)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 mb-6 transition-all ${
                  gameScreenshotUploaded ? 'border-green-500 bg-green-50' : tried && e6.shot ? 'border-dashed border-red-400 bg-red-50' : 'border-dashed border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${gameScreenshotUploaded ? 'bg-green-600' : 'bg-gray-100'}`}>
                  {previews['game'] ? (
                    <img src={previews['game']} alt="" className="w-full h-full object-cover rounded-lg" />
                  ) : gameScreenshotUploaded ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="13" r="4" stroke="#6B7280" strokeWidth="2" />
                    </svg>
                  )}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                    Username Screenshot
                  </p>
                  <p className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {gameScreenshotUploaded ? 'Uploaded' : tried && e6.shot ? <span className="text-red-500 font-semibold">{e6.shot}</span> : 'Tap to upload'}
                  </p>
                </div>
              </button>

              <div className="flex gap-3">
                <Button variant="ghost" size="lg" onClick={back}>Back</Button>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => attempt(e6, next)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* STEP 7 — Review & Submit */}
          {step === 7 && (
            <div className="animate-fade-up">
              <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                Review your details
              </h1>
              <p className="text-gray-500 text-sm mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                Make sure everything looks right before submitting
              </p>

              <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 mb-6">
                {[
                  { label: 'Full Name', value: fullName || '—' },
                  { label: 'Username', value: username || '—' },
                  { label: 'Email', value: email || '—' },
                  { label: 'Country', value: country === 'GH' ? 'Ghana' : 'Nigeria' },
                  { label: 'Phone', value: phone ? `${dialCode} ${phone}` : '—' },
                  { label: 'ID Type', value: idType.replace('_', ' ').toUpperCase() },
                  { label: 'ID Number', value: idNumber || '—' },
                  { label: 'Game', value: selectedGame === 'codm' ? 'CODM' : 'FC Mobile' },
                  { label: 'Game UID', value: gameUid || '—' },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between px-4 py-3">
                    <span className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>{row.label}</span>
                    <span className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{row.value}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-400 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                By submitting, your documents will be reviewed for identity verification.
                This usually takes a few hours.
              </p>

              <div className="flex gap-3">
                <Button variant="ghost" size="lg" onClick={back}>Back</Button>
                <Button variant="primary" size="lg" fullWidth onClick={handleSubmit}>
                  Submit
                </Button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}