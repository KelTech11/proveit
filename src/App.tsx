import { useState, useEffect, lazy, Suspense } from 'react';
import { me } from './data';
import type { Notification } from './data';
import { Avatar, IconWallet, IconGamepad, IconBell, IconSettings, IconGrid, IconList, IconAlertTriangle, IconUser, IconShield, IconSearch, IconLogout, IconTrophy } from './components/ui';
import logo from './assets/proveit-logo.png';
import type { MatchDraft } from './screens/CreateMatch';

// Consumer screens
const Home = lazy(() => import('./screens/Home'));
const Login = lazy(() => import('./screens/Login'));
const CreateAccount = lazy(() => import('./screens/CreateAccount'));
const Dashboard = lazy(() => import('./screens/Dashboard'));
const CreateMatch = lazy(() => import('./screens/CreateMatch'));
const MatchLobby = lazy(() => import('./screens/MatchLobby'));
const ActiveMatch = lazy(() => import('./screens/ActiveMatch'));
const Dispute = lazy(() => import('./screens/Dispute'));
const Payout = lazy(() => import('./screens/Payout'));
const Settings = lazy(() => import('./screens/Settings'));
const Notifications = lazy(() => import('./screens/Notifications'));
const OpponentProfile = lazy(() => import('./screens/OpponentProfile'));
const MatchRules = lazy(() => import('./screens/MatchRules'));
const MatchResult = lazy(() => import('./screens/MatchResult'));
const MatchLost = lazy(() => import('./screens/MatchLost'));
const Leaderboard = lazy(() => import('./screens/Leaderboard'));
const Deposit = lazy(() => import('./screens/Deposit'));
const JoinMatch = lazy(() => import('./screens/JoinMatch'));

// Admin screens
const AdminOverview = lazy(() => import('./screens/admin/Overview'));
const AdminMatchFeed = lazy(() => import('./screens/admin/MatchFeed'));
const AdminDisputeQueue = lazy(() => import('./screens/admin/DisputeQueue'));
const AdminDisputeResolution = lazy(() => import('./screens/admin/DisputeResolution'));
const AdminUserProfile = lazy(() => import('./screens/admin/UserProfile'));

type ConsumerScreen = 'home' | 'login' | 'create-account' | 'dashboard' | 'create-match' | 'match-lobby' | 'active-match' | 'dispute' | 'payout' | 'settings' | 'notifications' | 'profile' | 'rules' | 'result' | 'lost' | 'locked' | 'deposit' | 'leaderboard' | 'join';
type AdminScreen = 'admin-overview' | 'admin-match-feed' | 'admin-dispute-queue' | 'admin-dispute-resolution' | 'admin-user-profile';
type Screen = ConsumerScreen | AdminScreen;

const ADMIN_SCREENS: Screen[] = ['admin-overview', 'admin-match-feed', 'admin-dispute-queue', 'admin-dispute-resolution', 'admin-user-profile']
const isAdmin = (s: Screen) => ADMIN_SCREENS.includes(s);

const CONSUMER_NAV = [
  { id: 'dashboard', label: 'Home', icon: IconGrid },
  { id: 'leaderboard', label: 'Ranks', icon: IconTrophy },
  { id: 'notifications', label: 'Alerts', icon: IconBell },
] as const;

const ADMIN_NAV = [
  { id: 'admin-overview', label: 'Overview', icon: IconGrid },
  { id: 'admin-match-feed', label: 'Match Feed', icon: IconList },
  { id: 'admin-dispute-queue', label: 'Disputes', icon: IconAlertTriangle },
  { id: 'admin-dispute-resolution', label: 'Resolution', icon: IconShield },
  { id: 'admin-user-profile', label: 'Users / KYC', icon: IconUser },
] as const;

const DEMO_SCREENS: { label: string; id: Screen }[] = [
  { label: 'Create Account', id: 'create-account' },
  { label: 'Login', id: 'login' },
  { label: 'Dashboard', id: 'dashboard' },
  { label: 'Create Match', id: 'create-match' },
  { label: 'Match Lobby ⚡', id: 'match-lobby' },
  { label: 'Active Match', id: 'active-match' },
  { label: 'Dispute', id: 'dispute' },
  { label: 'Match Result 🎉', id: 'result' },
  { label: 'Match Lost', id: 'lost' },
  { label: 'Payout', id: 'payout' },
  { label: 'Join Match', id: 'join' },
  { label: 'Leaderboard 🏆', id: 'leaderboard' },
  { label: 'Settings', id: 'settings' },
  { label: 'Notifications', id: 'notifications' },
  { label: '── Admin ──', id: 'admin-overview' },
  { label: 'Admin Home', id: 'admin-overview' },
  { label: 'Match Feed', id: 'admin-match-feed' },
  { label: 'Dispute Queue', id: 'admin-dispute-queue' },
  { label: 'Dispute Resolution ⚡', id: 'admin-dispute-resolution' },
  { label: 'KYC Review', id: 'admin-user-profile' },
];

function NotifToast({ toast, onOpen, onClose }: { toast: Notification; onOpen: () => void; onClose: () => void }) {
  const icon = toast.type === 'payout' ? '💰' : toast.type === 'dispute_alert' ? '⚠️' : toast.type === 'kyc' ? '🛡️' : '🎮';
  return (
    <div
      className="fixed top-0 inset-x-0 z-[60] flex justify-center px-3 pointer-events-none"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
    >
      <style>{`@keyframes toast-drop { from { transform: translateY(-140%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
      <div
        onClick={onOpen}
        role="button"
        className="pointer-events-auto w-full max-w-sm bg-gray-900/95 backdrop-blur text-white rounded-2xl shadow-2xl border border-white/10 px-4 py-3 flex items-start gap-3 cursor-pointer"
        style={{ animation: 'toast-drop 0.4s ease-out' }}
      >
        <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center text-lg shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>ProveIt · now</p>
            <button
              onClick={e => { e.stopPropagation(); onClose(); }}
              className="text-gray-500 hover:text-white text-sm leading-none"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
          <p className="text-sm font-bold truncate" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{toast.title}</p>
          <p className="text-xs text-gray-300 leading-snug" style={{ fontFamily: 'Inter, sans-serif' }}>{toast.body}</p>
        </div>
      </div>
    </div>
  );
}

function VerificationGate({ onNavigate }: { onNavigate: (s: string) => void }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="max-w-sm w-full bg-white border border-amber-200 rounded-3xl shadow-sm p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4 text-2xl">🔒</div>
        <h2 className="text-xl font-black text-gray-900 mb-1" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Verification pending</h2>
        <p className="text-sm text-gray-500 mb-5" style={{ fontFamily: 'Inter, sans-serif' }}>
          We're still reviewing your ID. You can create or join matches and withdraw as soon as you're approved. This usually takes a few hours.
        </p>
        <button
          onClick={() => onNavigate('back')}
          className="w-full px-6 py-3 rounded-xl bg-[#16A34A] hover:bg-[#15803d] text-white font-bold text-sm transition-colors"
          style={{ fontFamily: 'Chakra Petch, sans-serif' }}
        >
          Go back
        </button>
      </div>
    </div>
  );
}

function SplashScreen({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const [started, setStarted] = useState(false);

  const start = () => {
    if (started) return;
    setStarted(true);
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const c = new AC();
      c.resume();
      const t = c.currentTime;
      const tone = (f1: number, f2: number, at: number, dur: number, type: OscillatorType, vol: number) => {
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = type;
        o.frequency.setValueAtTime(f1, t + at);
        o.frequency.exponentialRampToValueAtTime(f2, t + at + dur);
        g.gain.setValueAtTime(0.0001, t + at);
        g.gain.exponentialRampToValueAtTime(vol, t + at + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, t + at + dur);
        o.connect(g);
        g.connect(c.destination);
        o.start(t + at);
        o.stop(t + at + dur + 0.05);
      };
      tone(120, 600, 0, 0.8, 'sawtooth', 0.08);
      tone(660, 660, 0.85, 0.5, 'sine', 0.2);
      tone(990, 990, 1.0, 0.7, 'sine', 0.15);
      setTimeout(() => c.close().catch(() => {}), 3000);
    } catch {}
  };

  useEffect(() => {
    if (!started) return;
    const a = setTimeout(() => setLeaving(true), 1900);
    const b = setTimeout(onDone, 2400);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [started]);

  if (!started) {
    return (
      <div
        onClick={start}
        className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center cursor-pointer select-none"
      >
        <img src={logo} alt="ProveIt" className="h-20 w-auto max-w-[70vw] object-contain" />
        <p
          className="mt-8 text-sm text-gray-400 tracking-widest uppercase animate-pulse"
          style={{ fontFamily: 'Chakra Petch, sans-serif' }}
        >
          Tap to enter
        </p>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center"
      style={{ opacity: leaving ? 0 : 1, transition: 'opacity 0.5s ease' }}
    >
      <style>{`
        @keyframes splash-logo { from { opacity: 0; transform: scale(0.6); filter: blur(8px); } to { opacity: 1; transform: scale(1); filter: blur(0); } }
        @keyframes splash-glow { 0%, 100% { opacity: 0.25; transform: scale(1); } 50% { opacity: 0.55; transform: scale(1.15); } }
        @keyframes splash-text { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes splash-bar { from { width: 0; } to { width: 120px; } }
      `}</style>

      <div className="relative flex items-center justify-center">
        <div
          className="absolute w-56 h-56 rounded-full bg-green-500 blur-3xl"
          style={{ animation: 'splash-glow 1.8s ease-in-out infinite' }}
        />
        <img
          src={logo}
          alt="ProveIt"
          className="relative h-20 w-auto max-w-[70vw] object-contain"
          style={{ animation: 'splash-logo 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) both' }}
        />
      </div>

      <p
        className="relative mt-6 text-3xl font-bold text-white tracking-wide"
        style={{ fontFamily: 'Chakra Petch, sans-serif', animation: 'splash-text 0.6s ease-out 0.7s both' }}
      >
        Prove<span className="text-green-500">It</span>
      </p>

      <div
        className="relative mt-3 h-[3px] rounded-full bg-green-500"
        style={{ animation: 'splash-bar 0.7s ease-out 1s both' }}
      />
    </div>
  );
}

function ScreenFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>Loading...</p>
      </div>
    </div>
  );
}

function DemoNav({ current, onChange, verified, onToggleVerified }: { current: Screen; onChange: (s: Screen) => void; verified: boolean; onToggleVerified: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-20 right-4 z-50 sm:bottom-4">
      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-fade-up">
          <div className="p-2 border-b border-gray-700">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2" style={{ fontFamily: 'Inter, sans-serif' }}>Demo — Screen Select</p>
          </div>
          <button
            onClick={() => { onToggleVerified(); setOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm text-amber-300 hover:bg-gray-800 border-b border-gray-700"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {verified ? '🔒 Set account to pending' : '✅ Approve account'}
          </button>
          <div className="max-h-80 overflow-y-auto no-scroll py-1">
            {DEMO_SCREENS.map((item, i) =>
              item.label.startsWith('──') ? (
                <div key={i} className="px-3 py-1.5 text-xs text-gray-500 font-semibold border-t border-gray-700 mt-1 pt-2" style={{ fontFamily: 'Inter, sans-serif' }}>{item.label}</div>
              ) : (
                <button
                  key={i}
                  onClick={() => { onChange(item.id); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors rounded ${current === item.id ? 'text-green-400 bg-green-900/30' : 'text-gray-300 hover:bg-gray-800'}`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {item.label}
                </button>
              )
            )}
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-xl border border-gray-700 shadow-lg text-xs font-semibold hover:bg-gray-800 transition-colors"
        style={{ fontFamily: 'Chakra Petch, sans-serif' }}
      >
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-dot" />
        Demo
      </button>
    </div>
  );
}

function ConsumerLayout({ screen, onNavigate, matchDraft, onMatchCreated, balance, locked, onWin, onWithdraw, onLock, onDeposit, verified, onSignedUp, notifs, onMarkRead, onMarkAllRead, joinCode, onJoinCode, onJoined, onNotify, onLose, disputeActive, setDisputeActive, stats }: { screen: ConsumerScreen; onNavigate: (s: string) => void; matchDraft: MatchDraft | null; onMatchCreated: (d: MatchDraft) => void; balance: number; locked: number; onWin: (amount: number) => void; onWithdraw: (amount: number) => void; onLock: (amount: number) => void; onDeposit: (amount: number) => void; verified: boolean; onSignedUp: () => void; notifs: Notification[]; onMarkRead: (id: string) => void; onMarkAllRead: () => void; joinCode: string; onJoinCode: (code: string) => void; onJoined: (d: MatchDraft) => void; onNotify: (type: Notification['type'], title: string, body: string) => void; onLose: () => void; disputeActive: boolean; setDisputeActive: (v: boolean) => void; stats: { wins: number; losses: number; streak: number; xp: number } }) {
  const isLobby = screen === 'match-lobby';

  return (
    <div className="flex flex-col min-h-screen" style={{ background: isLobby ? '#050a05' : '#FAFAFA' }}>
      {/* Desktop top nav */}
      {screen !== 'login' && screen !== 'home' && screen !== 'create-account' && (
        <header className="hidden sm:flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-black flex items-center justify-center overflow-hidden shrink-0">
              <img src={logo} alt="ProveIt" className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Prove<span className="text-green-600">It</span></span>
          </div>
          <nav className="flex items-center gap-1">
            {CONSUMER_NAV.map(item => {
              const Icon = item.icon;
              const active = screen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id as Screen)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <Icon size={16} className={active ? 'text-green-600' : 'text-gray-500'} />
                  {item.label}
                </button>
              );
            })}
            <button
              onClick={() => onNavigate('create-match')}
              className="ml-3 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors glow-green"
              style={{ fontFamily: 'Chakra Petch, sans-serif' }}
            >
              + New Match
            </button>
            <div className="ml-3 pl-3 border-l border-gray-200">
              <button onClick={() => onNavigate('settings')} aria-label="Account">
                <Avatar name={me.name} country={me.country} color={me.color} size="sm" />
              </button>
            </div>
          </nav>
        </header>
      )}

      {/* Mobile top header */}
      {screen !== 'login' && screen !== 'home' && screen !== 'create-account' && (
        <header className="flex sm:hidden items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center overflow-hidden shrink-0">
              <img src={logo} alt="ProveIt" className="w-full h-full object-cover" />
            </div>
            <span className="text-base font-bold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Prove<span className="text-green-600">It</span></span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('create-match')}
              className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition-colors"
              style={{ fontFamily: 'Chakra Petch, sans-serif' }}
            >
              + New Match
            </button>
            <button onClick={() => onNavigate('settings')} aria-label="Account">
              <Avatar name={me.name} country={me.country} color={me.color} size="sm" />
            </button>
          </div>
        </header>
      )}

      {/* Screen content */}
      <main className={`flex-1 ${screen !== 'login' && screen !== 'home' && screen !== 'create-account' && screen !== 'match-lobby' ? 'pb-20 sm:pb-0' : ''}`}>
        <Suspense fallback={<ScreenFallback />}>
          {screen === 'home' && <Home onNavigate={onNavigate} />}
          {screen === 'login' && <Login onNavigate={onNavigate} />}
          {screen === 'create-account' && <CreateAccount onNavigate={onNavigate} onSignedUp={onSignedUp} />}
          {screen === 'dashboard' && <Dashboard onNavigate={onNavigate} balance={balance} locked={locked} unread={notifs.filter(n => !n.read).length} verified={verified} disputeActive={disputeActive} stats={stats} />}
          {screen === 'create-match' && <CreateMatch onNavigate={onNavigate} onMatchCreated={onMatchCreated} onJoinCode={onJoinCode} />}
          {screen === 'match-lobby' && <MatchLobby onNavigate={onNavigate} matchDraft={matchDraft} onLock={onLock} onNotify={onNotify} />}
          {screen === 'active-match' && <ActiveMatch onNavigate={onNavigate} matchDraft={matchDraft} onWin={onWin} onNotify={onNotify} onLose={onLose} />}
          {screen === 'dispute' && <Dispute onNavigate={onNavigate} matchDraft={matchDraft} onDisputeStatusChange={setDisputeActive} />}
          {screen === 'payout' && <Payout onNavigate={onNavigate} balance={balance} onWithdraw={onWithdraw} />}
          {screen === 'deposit' && <Deposit onNavigate={onNavigate} balance={balance} onDeposit={onDeposit} />}
          {screen === 'settings' && <Settings onNavigate={onNavigate} />}
          {screen === 'notifications' && <Notifications onNavigate={onNavigate} notifications={notifs} onMarkRead={onMarkRead} onMarkAllRead={onMarkAllRead} />}
          {screen === 'profile' && <OpponentProfile onNavigate={onNavigate} />}
          {screen === 'rules' && <MatchRules onNavigate={onNavigate} />}
          {screen === 'result' && <MatchResult onNavigate={onNavigate} matchDraft={matchDraft} />}
          {screen === 'lost' && <MatchLost onNavigate={onNavigate} matchDraft={matchDraft} />}
          {screen === 'leaderboard' && <Leaderboard onNavigate={onNavigate} />}
          {screen === 'locked' && <VerificationGate onNavigate={onNavigate} />}
          {screen === 'join' && <JoinMatch onNavigate={onNavigate} code={joinCode} onJoined={onJoined} />}
        </Suspense>
      </main>

      {/* Mobile bottom tab bar */}
      {screen !== 'login' && screen !== 'home' && screen !== 'create-account' && screen !== 'match-lobby' && (
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex">
          {CONSUMER_NAV.map(item => {
            const Icon = item.icon;
            const active = screen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as Screen)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                  active ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}

function AdminLayout({ screen, onNavigate }: { screen: AdminScreen; onNavigate: (s: string) => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen" style={{ background: '#F3F4F6' }}>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-40 flex flex-col transition-all duration-200 ${sidebarOpen ? 'w-56' : 'w-16'}`}
        style={{ background: '#111827' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-black border border-green-600/50 flex items-center justify-center overflow-hidden shrink-0">
            <img src={logo} alt="ProveIt" className="w-full h-full object-cover" />
          </div>
          {sidebarOpen && (
            <div>
              <p className="text-white text-sm font-bold leading-tight" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>ProveIt</p>
              <p className="text-green-500 text-xs font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Admin Console</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2">
          <p className={`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ${sidebarOpen ? 'px-2' : 'hidden'}`} style={{ fontFamily: 'Inter, sans-serif' }}>Operations</p>
          {ADMIN_NAV.map(item => {
            const Icon = item.icon;
            const active = screen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as Screen)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors text-sm sidebar-text ${
                  active
                    ? 'bg-green-600/20 text-green-400'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon size={16} className={active ? 'text-green-400 shrink-0' : 'text-gray-500 shrink-0'} />
                {sidebarOpen && <span>{item.label}</span>}
                {active && sidebarOpen && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/10">
          {sidebarOpen ? (
            <div className="flex items-center gap-2 px-2 py-2">
              <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white font-semibold" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>A</div>
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold truncate" style={{ fontFamily: 'Inter, sans-serif' }}>Admin User</p>
                <p className="text-gray-500 text-xs truncate" style={{ fontFamily: 'Inter, sans-serif' }}>admin@proveit.gg</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white font-semibold">A</div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="mt-2 w-full flex items-center justify-center gap-2 py-1.5 px-2 rounded text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors text-xs"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {sidebarOpen ? '← Collapse' : '→'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${sidebarOpen ? 'ml-56' : 'ml-16'}`}>
        {/* Top utility bar */}
        <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="search"
                placeholder="Search matches, players, disputes..."
                className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 w-72"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
              <svg className="absolute left-2.5 top-2.5 text-gray-400" width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M10 2a6 6 0 016 6v3l1.5 2.5H2.5L4 11V8a6 6 0 016-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M8 16a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
            </button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs text-white font-semibold" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>AD</div>
              <span className="text-sm font-medium text-gray-700 hidden md:block" style={{ fontFamily: 'Inter, sans-serif' }}>Admin</span>
            </div>
          </div>
        </header>

        {/* Screen content */}
        <main className="flex-1 p-6">
          <Suspense fallback={<ScreenFallback />}>
            {screen === 'admin-overview' && <AdminOverview onNavigate={onNavigate} />}
            {screen === 'admin-match-feed' && <AdminMatchFeed onNavigate={onNavigate} />}
            {screen === 'admin-dispute-queue' && <AdminDisputeQueue onNavigate={onNavigate} />}
            {screen === 'admin-dispute-resolution' && <AdminDisputeResolution onNavigate={onNavigate} />}
            {screen === 'admin-user-profile' && <AdminUserProfile onNavigate={onNavigate} />}
          </Suspense>
        </main>

        {/* Switch to consumer view link */}
        <div className="px-6 pb-4">
          <button
            onClick={() => onNavigate('dashboard')}
            className="text-xs text-gray-400 hover:text-green-500 transition-colors"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            ← Switch to Consumer App
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(() => {
    try { return !sessionStorage.getItem('proveit_splash_seen'); } catch { return true; }
  });
  const [screen, setScreen] = useState<Screen>(() => {
    try {
      const path = window.location.pathname;
      if (path.startsWith('/join/')) return 'join';
    } catch {}
    try { return (sessionStorage.getItem('proveit_screen') as Screen) || 'home'; } catch { return 'home'; }
  });
  const [joinCode, setJoinCode] = useState(() => {
    try {
      const path = window.location.pathname;
      if (path.startsWith('/join/')) return path.replace('/join/', '');
    } catch {}
    return '';
  });
  const [prevScreen, setPrevScreen] = useState<Screen>('dashboard');
  const [matchDraft, setMatchDraft] = useState<MatchDraft | null>(null);
  const [balance, setBalance] = useState(2840);
  const [locked, setLocked] = useState(0);
  const [verified, setVerified] = useState(true);
  const [disputeActive, setDisputeActive] = useState(false);
  const [stats, setStats] = useState({ wins: 0, losses: 0, streak: 0, xp: 0 });
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [toast, setToast] = useState<Notification | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    try { sessionStorage.setItem('proveit_screen', screen); } catch {}
    try {
      if (screen !== 'join' && window.location.pathname.startsWith('/join/')) {
        window.history.replaceState(null, '', '/');
      }
    } catch {}
  }, [screen]);

  const addNotif = (type: Notification['type'], title: string, body: string) => {
    const n = { id: `n-${Date.now()}`, type, title, body, time: 'Just now', read: false, matchId: 'M-7842' } as Notification;
    setNotifs(prev => [n, ...prev]);
    setToast(n);
  };
  const markRead = (id: string) => setNotifs(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));

  const admin = isAdmin(screen);

  const navigate = (s: string) => {
    if (s === 'back') {
      setScreen(prevScreen);
      return;
    }
    setPrevScreen(screen === 'locked' ? prevScreen : screen);
    if (!verified && ['create-match', 'join', 'payout'].includes(s)) {
      setScreen('locked');
      return;
    }
    setScreen(s as Screen);
  };

  return (
    <>
      {showSplash && <SplashScreen onDone={() => { try { sessionStorage.setItem('proveit_splash_seen', '1'); } catch {} setShowSplash(false); }} />}
      {admin ? (
        <AdminLayout screen={screen as AdminScreen} onNavigate={navigate} />
      ) : (
        <ConsumerLayout
          screen={screen as ConsumerScreen}
          onNavigate={navigate}
          matchDraft={matchDraft}
          disputeActive={disputeActive}
          setDisputeActive={setDisputeActive}
          stats={stats}
          onMatchCreated={(d) => { setMatchDraft(d); addNotif('match_invite', 'Match created', `${d.game} ${d.mode}, GHS ${d.wager.toFixed(2)} wager. Invite link is ready.`); }}
          balance={balance}
          locked={locked}
          onWin={(w) => { setBalance(b => b + w); setLocked(0); setStats(s => ({ wins: s.wins + 1, losses: s.losses, streak: s.streak + 1, xp: s.xp + 100 })); addNotif('payout', 'You won!', `GHS ${w.toFixed(2)} was added to your balance.`); }}
          onWithdraw={(a) => { setBalance(b => b - a); addNotif('payout', 'Withdrawal requested', `GHS ${a.toFixed(2)} is on its way to your account.`); }}
          onLock={(a) => { setBalance(b => b - a); setLocked(l => l + a); addNotif('match_invite', 'Funds locked in escrow', `GHS ${a.toFixed(2)} is locked. Match is starting.`); }}
          notifs={notifs}
          onMarkRead={markRead}
          onMarkAllRead={markAllRead}
          verified={verified}
          onSignedUp={() => { setVerified(false); addNotif('kyc', 'ID under review', "We're checking your documents. This usually takes a few hours."); }}
          onDeposit={(a) => { setBalance(b => b + a); addNotif('payout', 'Deposit successful', `GHS ${a.toFixed(2)} was added to your wallet.`); }}
          joinCode={joinCode}
          onJoinCode={setJoinCode}
          onNotify={addNotif}
          onLose={() => { setLocked(0); setStats(s => ({ ...s, losses: s.losses + 1, streak: 0, xp: s.xp + 25 })); addNotif('match_invite', 'Match lost', 'Your stake was released to your opponent. Good game!'); }}
          onJoined={(d) => { setMatchDraft(d); addNotif('match_invite', 'Match joined', `${d.game} ${d.mode}, GHS ${d.wager.toFixed(2)} wager. You're in the lobby.`); }}
        />
      )}
      {toast && (
        <NotifToast
          key={toast.id}
          toast={toast}
          onOpen={() => { markRead(toast.id); setToast(null); navigate('notifications'); }}
          onClose={() => setToast(null)}
        />
      )}
      <DemoNav
        current={screen}
        onChange={navigate}
        verified={verified}
        onToggleVerified={() => {
          if (verified) setVerified(false);
          else { setVerified(true); addNotif('kyc', 'ID approved', 'Your identity is verified. You can now create and join matches, and withdraw.'); }
        }}
      />
    </>
  );
}
