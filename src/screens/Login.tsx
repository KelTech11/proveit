import { useState } from 'react';
import logo from '../assets/proveit-logo.png';
import { Button, Input } from '../components/ui';
import ForgotPassword from './ForgotPassword';
import { checkLogin } from '../account';

export default function Login({ onNavigate }: { onNavigate: (s: string) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [tried, setTried] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [busy, setBusy] = useState(false);

  const errors: Record<string, string> = {};
  if (username.length < 3) errors.username = 'Enter your username';
  if (!password) errors.password = 'Enter your password';

  const signIn = async () => {
    if (Object.keys(errors).length === 0) {
      if (busy) return;
      setBusy(true);
      setLoginError('');
      const result = await checkLogin(username, password);
      setBusy(false);
      if (result === 'ok') {
        // Restart on the dashboard so this account's saved profile loads
        try {
          sessionStorage.setItem('proveit_screen', 'dashboard');
          localStorage.setItem('proveit_signed_in', '1');
        } catch {}
        window.location.reload();
        return;
      }
      setLoginError(
        result === 'offline'
          ? "Can't reach the server. Make sure the backend is running."
          : 'Wrong username or password.'
      );
      return;
    }
    setTried(true);
    setTimeout(() => {
      const el = document.querySelector('.border-red-400') as HTMLElement | null;
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (el.querySelector('input') as HTMLElement | null)?.focus({ preventScroll: true });
    }, 60);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 pt-8 pb-4">
        <div className="bg-black rounded-full px-3 py-2 flex items-center">
          <img src={logo} alt="ProveIt" className="h-7 w-auto" />
        </div>
        <span
          className="text-xl font-bold text-gray-900"
          style={{ fontFamily: 'Chakra Petch, sans-serif' }}
        >
          Prove<span className="text-green-600">It</span>
        </span>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-start justify-center px-6 pt-8 pb-10">
        <div
          className="w-full max-w-sm animate-fade-up"
          onKeyDown={e => { if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') signIn(); }}
        >
          {/* Headline */}
          <div className="mb-8">
            <h1
              className="text-4xl font-bold text-gray-900 leading-tight mb-2"
              style={{ fontFamily: 'Chakra Petch, sans-serif', fontSize: '2.25rem' }}
            >
              You dey claim?<br />
              <span className="text-green-600">Prove am.</span>
            </h1>
            <p className="text-gray-500 text-base mt-3" style={{ fontFamily: 'Inter, sans-serif' }}>
              P2P skill gaming, secured by escrow
            </p>
          </div>

          {/* Username input */}
          <div className="mb-4">
            <Input
              label="Username"
              type="text"
              value={username}
              onChange={v => setUsername(v.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20))}
              placeholder="Enter your username"
              autoComplete="username"
              error={tried ? errors.username : undefined}
            />
          </div>

          {/* Password input */}
          <div className="mb-2">
            <Input
              label="Password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
              placeholder="Enter your password"
              autoComplete="current-password"
              error={tried ? errors.password : undefined}
              suffix={<button type="button" onClick={() => setShowPw(s => !s)} className="text-xs font-semibold text-gray-500 hover:text-gray-800">{showPw ? 'Hide' : 'Show'}</button>}
            />
          </div>

          {/* Forgot password */}
          <div className="text-right mb-6">
            <button
              type="button"
              onClick={() => setShowForgot(true)}
              className="text-sm text-green-600 font-semibold hover:text-green-700 transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Forgot Password?
            </button>
          </div>

          {loginError && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5">
              <p className="text-xs font-semibold text-red-700" style={{ fontFamily: 'Inter, sans-serif' }}>{loginError}</p>
            </div>
          )}

          {/* Sign in button */}
          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={signIn}
              disabled={busy}
            >
              {busy ? 'Signing in...' : 'Sign In'}
            </Button>

            <Button
              variant="ghost"
              size="lg"
              fullWidth
              onClick={() => onNavigate('create-account')}
            >
              Create Account
            </Button>
          </div>

          {/* Terms */}
          <p
            className="text-center text-xs text-gray-400 mt-6"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            By signing in you agree to our{' '}
            <span className="text-green-600 underline cursor-pointer">Terms of Service</span>
            {' '}and{' '}
            <span className="text-green-600 underline cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </main>

      {showForgot && <ForgotPassword onClose={() => setShowForgot(false)} />}
    </div>
  );
}