import { useState } from 'react';
import logo from '../assets/proveit-logo.png';
import { Button, Input, PhoneInput } from '../components/ui';
import { type Country } from '../data';

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export default function CreateAccount({ onNavigate, onSignedUp }: { onNavigate: (s: string) => void; onSignedUp: () => void }) {
  const [step, setStep] = useState<Step>(1);

  // Step 1
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState<Country>('GH');
  const [phone, setPhone] = useState('');

  // Step 2
  const [otp, setOtp] = useState('');

  // Step 3
  const [isAdult, setIsAdult] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [underageBlocked, setUnderageBlocked] = useState(false);

  // Step 4
  const [idType, setIdType] = useState('ghana_card');
  const [idNumber, setIdNumber] = useState('');
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
  const [submitted, setSubmitted] = useState(false);

  const next = () => setStep(s => Math.min(s + 1, 7) as Step);
  const back = () => setStep(s => Math.max(s - 1, 1) as Step);

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
        <Button variant="primary" size="lg" onClick={() => { onSignedUp(); onNavigate('dashboard'); }}>
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
                <Input label="Full Name" type="text" value={fullName} onChange={setFullName} placeholder="Enter your full name" />
              </div>
              <div className="mb-4">
                <Input label="Username" type="text" value={username} onChange={setUsername} placeholder="Choose a username" />
              </div>

              <div className="mb-4">
                <Input label="Email Address" type="email" value={email} onChange={setEmail} placeholder="Enter your email" />
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
                <PhoneInput value={phone} onChange={setPhone} country={country} onCountryChange={setCountry} />
              </div>

              <Button variant="primary" size="lg" fullWidth onClick={next}>
                Next
              </Button>
            </div>
          )}

          {/* STEP 2 — Phone verification */}
          {step === 2 && (
            <div className="animate-fade-up">
              <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                Verify your phone
              </h1>
              <p className="text-gray-500 text-sm mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                We sent a code to {phone || 'your number'}
              </p>

              <div className="mb-4">
                <Input label="Verification Code" type="text" value={otp} onChange={setOtp} placeholder="Enter 6-digit code" />
              </div>

              <p className="text-sm text-gray-500 mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
                Didn't get it?{' '}
                <span className="text-green-600 font-semibold cursor-pointer hover:text-green-700">Resend code</span>
              </p>

              <div className="flex gap-3">
                <Button variant="ghost" size="lg" onClick={back}>Back</Button>
                <Button variant="primary" size="lg" fullWidth onClick={next}>Next</Button>
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

              <label className="flex items-start gap-3 mb-8 p-4 rounded-xl border border-gray-200 cursor-pointer hover:border-green-300 transition-colors">
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
                </span>
              </label>

              <div className="flex gap-3">
                <Button variant="ghost" size="lg" onClick={back}>Back</Button>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleEligibilityNext}
                  disabled={!agreedTerms}
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
                  onChange={e => setIdType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm font-medium focus:border-green-500 focus:outline-none"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {country === 'GH' ? (
                    <>
                      <option value="ghana_card">Ghana Card</option>
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
                <Input label="ID Number" type="text" value={idNumber} onChange={setIdNumber} placeholder="Enter your ID number" />
              </div>

              {/* Upload buttons */}
              {[
                { label: 'Front of ID', done: idFrontUploaded, setDone: setIdFrontUploaded },
                { label: 'Back of ID', done: idBackUploaded, setDone: setIdBackUploaded },
                { label: 'Selfie (Liveness Check)', done: selfieUploaded, setDone: setSelfieUploaded },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => item.setDone(true)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 mb-3 transition-all ${
                    item.done ? 'border-green-500 bg-green-50' : 'border-dashed border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.done ? 'bg-green-600' : 'bg-gray-100'}`}>
                    {item.done ? (
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
                      {item.done ? 'Captured' : 'Tap to open camera'}
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
                  onClick={next}
                  disabled={!idNumber || !idFrontUploaded || !selfieUploaded}
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
                <Input label="Create Password" type="password" value={password} onChange={setPassword} placeholder="Enter a password" />
              </div>
              <div className="mb-8">
                <Input label="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Re-enter your password" />
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" size="lg" onClick={back}>Back</Button>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={next}
                  disabled={!password || password !== confirmPassword}
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
                <Input label="In-Game UID" type="text" value={gameUid} onChange={setGameUid} placeholder="Enter your game UID" />
              </div>

              <button
                onClick={() => setGameScreenshotUploaded(true)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 mb-6 transition-all ${
                  gameScreenshotUploaded ? 'border-green-500 bg-green-50' : 'border-dashed border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${gameScreenshotUploaded ? 'bg-green-600' : 'bg-gray-100'}`}>
                  {gameScreenshotUploaded ? (
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
                    {gameScreenshotUploaded ? 'Uploaded' : 'Tap to upload'}
                  </p>
                </div>
              </button>

              <div className="flex gap-3">
                <Button variant="ghost" size="lg" onClick={back}>Back</Button>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={next}
                  disabled={!gameUid || !gameScreenshotUploaded}
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
                  { label: 'Phone', value: phone || '—' },
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