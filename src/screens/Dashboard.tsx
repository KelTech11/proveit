import { Avatar } from '../components/ui';
import { me, matches, formatCurrency } from '../data';

// Custom clean game icons to prevent black boxes
const GameIcon = ({ game }: { game: string }) => {
  const isFC = game.includes('FC Mobile');
  return (
    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-gray-100 overflow-hidden bg-black">
      {isFC ? (
        <img 
          src="https://play-lh.googleusercontent.com/uT1JkXWK9pv1DWWOuVebnsbATHMZmhG4LUDkvoXne9H2MDF1im00_-U4taZPifIBpJ47sA0i8IoCh5aEVuUG5JI=s0-br30" 
          alt="EA SPORTS FC Mobile" 
          className="w-full h-full object-cover transform scale-110"
        />
      ) : (
        <img 
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSK24uXiHO3HHYAZ8wAVoelfRPLVLNbvqgwvbwhmXGSLw&s" 
          alt="CODM" 
          className="w-full h-full object-cover transform scale-110"
        />
      )}
    </div>
  );
};

import { useProfile } from '../profile';

export default function Dashboard({ onNavigate, balance, locked, unread, verified, disputeActive, stats }: { onNavigate: (s: string) => void; balance: number; locked: number; unread: number; verified: boolean; disputeActive: boolean; stats: { wins: number; losses: number; streak: number; xp: number } }) {
  const { profile: me } = useProfile();
  const winCount = stats.wins; 
  const totalPlayed = stats.wins + stats.losses;
  const winRate = totalPlayed ? Math.round((winCount / totalPlayed) * 100) : 0;

  // SVG Circumference calculation for Wallet
  const circumference = 100;
  const strokeDashoffset = circumference - (winRate / 100) * circumference;

  return (
    <div className="min-h-screen bg-[#F4F7F9] text-gray-900 font-sans flex flex-col overflow-hidden selection:bg-green-200">
      
      {/* Inject custom script font for the "Meets" text */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;900&display=swap');
        `}
      </style>

      {/* --- MAIN LAYOUT --- */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* --- LEFT SIDEBAR --- */}
        <aside className="w-[240px] bg-white border-r border-gray-100 hidden md:flex flex-col justify-between overflow-y-auto z-10">
          <div className="p-4 space-y-1 mt-4">
            <button onClick={() => onNavigate('dashboard')} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-green-50 text-[#16A34A] font-bold text-sm transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
              Home
            </button>
            <button onClick={() => onNavigate('create-match')} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-bold text-sm transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              Create Match
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-bold text-sm transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
              My Matches <span className="ml-auto text-[9px] font-black uppercase tracking-wider bg-gray-100 text-gray-400 px-2 py-0.5 rounded">Soon</span>
            </button>
            <button onClick={() => onNavigate('payout')} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-bold text-sm transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              Wallet
            </button>
            <button onClick={() => onNavigate('leaderboard')} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-bold text-sm transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 15V3"/><path d="m8 7 4-4 4 4"/><path d="M20 21H4v-4h16v4Z"/></svg>
              Leaderboard
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-bold text-sm transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Community <span className="ml-auto text-[9px] font-black uppercase tracking-wider bg-gray-100 text-gray-400 px-2 py-0.5 rounded">Soon</span>
            </button>
          </div>

          <div className="p-4">
            <div className="bg-[#042F2E] rounded-3xl p-5 text-white relative overflow-hidden shadow-lg">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#115E59] rounded-full blur-2xl opacity-50"></div>
              <h3 className="font-black text-xl mb-1 leading-tight tracking-tight relative z-10">Play.<br/>Compete.<br/>Win.</h3>
              <p className="text-[10px] text-gray-300 font-medium mb-4 relative z-10">Skill-based gaming.<br/>Real players. Real rewards.</p>
              <button className="w-8 h-8 rounded-full bg-[#16A34A] hover:bg-[#15803d] flex items-center justify-center transition-colors relative z-10 shadow-md">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
            <p className="text-[10px] text-gray-400 font-medium text-center mt-4">ProveIt • Play Fair. Win Together.</p>
          </div>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1200px] mx-auto space-y-6">
            {!verified && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-start gap-3">
                <span className="text-xl">⏳</span>
                <div>
                  <p className="text-sm font-black text-amber-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Verification pending</p>
                  <p className="text-xs text-amber-800 mt-0.5">We're reviewing your ID. Until you're approved you can't create or join matches or withdraw.</p>
                </div>
              </div>
            )}

            {disputeActive && (
              <button
                onClick={() => onNavigate('dispute')}
                className="w-full text-left bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 hover:bg-red-100 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">🛡️</span>
                  <div>
                    <p className="text-sm font-black text-red-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Dispute under review</p>
                    <p className="text-xs text-red-800 mt-0.5">{me.currency} {locked.toFixed(2)} is locked until a decision is made. You'll get an email the moment it's resolved.</p>
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-400 shrink-0"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            )}
            
            {/* ROW 1: Hero, Wallet, Platform Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* HERO BANNER (Spans 6 cols) */}
              <div className="lg:col-span-6 bg-gradient-to-br from-[#e8f5e9] to-[#dcfce7] rounded-3xl p-8 relative overflow-hidden flex flex-col justify-center min-h-[220px] shadow-sm border border-green-100">
                <div className="relative z-10 max-w-[65%]">
                  <p className="text-[#16A34A] text-xs font-black uppercase tracking-widest mb-1">Welcome back, {me.name.split(' ')[0]} 👑</p>
                  <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-[1.1] mb-3 tracking-tight" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                    Ready for your next match?
                  </h1>
                  <p className="text-sm text-gray-700 font-medium mb-6">Compete, win rewards, and climb the leaderboard.</p>
                  <button onClick={() => onNavigate('create-match')} className="px-6 py-3 rounded-xl bg-[#16A34A] hover:bg-[#15803d] text-white font-bold text-sm shadow-md transition-transform hover:-translate-y-0.5 flex items-center gap-2 w-fit">
                    Create Match 
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>
                
                {/* Right side graphics */}
                <div className="absolute right-0 top-0 bottom-0 w-[45%] pointer-events-none">
                  <div className="absolute right-[-20%] top-1/2 -translate-y-1/2 w-64 opacity-90 drop-shadow-2xl">
                    <svg viewBox="0 0 400 300" fill="none" className="w-full h-full transform -rotate-12 scale-110">
                      <path d="M70 120 C70 90, 110 70, 150 80 C180 88, 220 88, 250 80 C290 70, 330 90, 330 120 C330 150, 340 210, 300 240 C270 262, 240 220, 230 200 C220 180, 180 180, 170 200 C160 220, 130 262, 100 240 C60 210, 70 150, 70 120 Z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="4" />
                      <circle cx="116" cy="128" r="8" fill="#94a3b8" />
                      <circle cx="284" cy="116" r="6" fill="#cbd5e1"/>
                      <circle cx="304" cy="128" r="6" fill="#cbd5e1"/>
                      <circle cx="284" cy="140" r="6" fill="#cbd5e1"/>
                      <circle cx="264" cy="128" r="6" fill="#cbd5e1"/>
                      <circle cx="150" cy="170" r="22" fill="#e2e8f0" />
                      <circle cx="250" cy="170" r="22" fill="#e2e8f0" />
                    </svg>
                  </div>
                  <div className="absolute top-8 right-8 transform rotate-12 z-20">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" className="mb-1 mx-auto"><path d="M2 16l4-12 6 5 6-5 4 12z"></path></svg>
                    <p className="text-white text-xl font-black leading-none drop-shadow-md text-center" style={{ fontFamily: "'Caveat', cursive", transform: 'rotate(-8deg)' }}>
                      Skill<br/>Meets<br/>Reward
                    </p>
                  </div>
                </div>
              </div>

              {/* WALLET CARD (Spans 3 cols) */}
              <div className="lg:col-span-3 bg-[#0A1A24] rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-between shadow-md">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#16A34A] rounded-full blur-[60px] opacity-20 pointer-events-none"></div>
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                      <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Available Balance</span>
                    </div>
                    <span className="text-[9px] font-black bg-[#16A34A] text-white px-2 py-1 rounded uppercase tracking-widest shadow-sm">
                      {me.currency} Wallet
                    </span>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black tracking-tighter" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{Math.floor(balance).toLocaleString('en-US')}<span className="text-xl text-gray-400">.{balance.toFixed(2).split('.')[1]}</span></span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{me.currency}</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 mt-2 bg-white/5 border border-white/10 px-2.5 py-1 rounded text-[10px] text-gray-400 font-semibold">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      {me.currency} {locked.toFixed(2)} locked in escrow
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 shrink-0">
                      <svg className="w-full h-full -scale-x-100" viewBox="0 0 36 36">
                        <path className="text-white/10" stroke="currentColor" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="text-[#16A34A]" strokeDasharray="100, 100" strokeDashoffset={strokeDashoffset} stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black">{winRate}%</div>
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Performance</p>
                      <p className="text-xs font-bold text-white">{winCount} Wins / {totalPlayed} Played</p>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full pt-1">
                    <button onClick={() => onNavigate('deposit')} className="flex-1 py-2 rounded-lg border border-gray-600 hover:bg-white/5 text-white font-bold text-[11px] uppercase tracking-wider transition-colors">
                      Deposit
                    </button>
                    <button onClick={() => onNavigate('payout')} className="flex-1 py-2 rounded-lg bg-[#16A34A] hover:bg-[#15803d] text-white font-bold text-[11px] uppercase tracking-wider transition-colors">
                      Withdraw
                    </button>
                  </div>
                </div>
              </div>

              {/* PLATFORM LIVE FEED (Spans 3 cols) */}
              <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
                <div className="absolute -right-12 -top-12 w-32 h-32 bg-green-50 rounded-full blur-2xl"></div>
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse"></span>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Platform Live Feed</h4>
                  </div>
                  <p className="text-3xl font-black text-gray-900 mb-2 tracking-tight" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                    GHS 480K
                  </p>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed pr-4">Total funds securely locked in escrow across Ghana & Nigeria.</p>
                </div>
                
                <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
                  <span className="text-[11px] font-bold text-gray-500">Matches Settled</span>
                  <span className="text-sm font-black text-gray-900 flex items-center gap-1">2,340 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
                </div>
              </div>

            </div>

            {/* ROW 2: Account Overview & Trending Lobbies */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* ACCOUNT OVERVIEW (Spans 4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    Account Overview
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${verified ? 'text-[#16A34A] bg-green-50' : 'text-amber-700 bg-amber-100'}`}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    {verified ? 'Verified Pro' : 'Pending'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Username</p>
                      <p className="text-sm font-black text-gray-900">{me.username}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Region</p>
                      <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5"><span className="text-base leading-none border border-gray-100 rounded-sm">{me.country === 'GH' ? '🇬🇭' : '🇳🇬'}</span> {me.country}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                      <span className={`text-[10px] font-bold flex items-center gap-1 w-fit ${verified ? 'text-[#16A34A]' : 'text-amber-600'}`}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                        {verified ? 'Verified Pro' : 'Under review'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-l border-gray-100 pl-6">
                    <p className="text-[10px] font-bold text-gray-900 uppercase tracking-wider mb-3">Quick Links</p>
                    <div className="space-y-2">
                      <button onClick={() => onNavigate('notifications')} className="w-full flex items-center justify-between text-xs font-bold text-gray-600 hover:text-gray-900 py-1 transition-colors">
                        <span className="flex items-center gap-1.5"><div className="w-6 h-6 rounded-md bg-green-50 text-[#16A34A] flex items-center justify-center"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div> Notifications{unread > 0 ? ` (${unread})` : ''}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* TRENDING LOBBIES (Spans 8 cols) */}
              <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-black text-gray-900 flex items-center gap-2" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                    <span className="text-red-500">🔥</span> Trending Live Lobbies
                  </h3>
                  <button className="text-xs font-bold text-[#16A34A] hover:underline flex items-center gap-1">
                    View all <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Lobby Card 1 */}
                  <div className="border border-gray-100 rounded-2xl p-4 hover:border-gray-300 transition-colors bg-gray-50/50">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <GameIcon game="Call of Duty: Mobile" />
                        <div>
                          <p className="text-sm font-black text-gray-900">CODM 1v1 Killhouse</p>
                          <p className="text-[11px] text-gray-500 font-semibold">Challenger vs Host</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#16A34A] bg-green-50 px-2 py-1 rounded flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse"></span> Live
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-gray-100 pt-3 mb-3">
                      <div className="flex items-center gap-4 text-[11px] font-bold text-gray-500">
                        <span className="flex items-center gap-1.5"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> 1v1</span>
                        <span className="flex items-center gap-1.5"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> BR</span>
                      </div>
                      <span className="text-[11px] font-bold text-[#16A34A] flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> 12/16
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-base font-black text-gray-900">GHS 450.00</span>
                      <button onClick={() => onNavigate('join')} className="px-5 py-1.5 rounded-lg bg-[#16A34A] hover:bg-[#15803d] text-white text-[11px] font-bold uppercase tracking-wider transition-colors">
                        Join
                      </button>
                    </div>
                  </div>

                  {/* Lobby Card 2 */}
                  <div className="border border-gray-100 rounded-2xl p-4 hover:border-gray-300 transition-colors bg-gray-50/50">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <GameIcon game="FC Mobile" />
                        <div>
                          <p className="text-sm font-black text-gray-900">FC Mobile 1v1</p>
                          <p className="text-[11px] text-gray-500 font-semibold">Quick Match • H2H</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#16A34A] bg-green-50 px-2 py-1 rounded flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse"></span> Live
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-gray-100 pt-3 mb-3">
                      <div className="flex items-center gap-4 text-[11px] font-bold text-gray-500">
                        <span className="flex items-center gap-1.5"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> 1v1</span>
                        <span className="flex items-center gap-1.5"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg> Sports</span>
                      </div>
                      <span className="text-[11px] font-bold text-[#16A34A] flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> 8/16
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-base font-black text-gray-900">GHS 300.00</span>
                      <button className="px-5 py-1.5 rounded-lg bg-[#16A34A] hover:bg-[#15803d] text-white text-[11px] font-bold uppercase tracking-wider transition-colors">
                        Join
                      </button>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* ROW 3: Stats, Active Battles, Quick Action */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
              
              {/* YOUR STATS (Spans 4 cols) */}
              <div className="lg:col-span-4 bg-[#011C2B] rounded-3xl p-6 text-white relative overflow-hidden shadow-sm flex flex-col justify-between">
                <div className="absolute right-0 top-0 opacity-10 transform scale-150 translate-x-4 -translate-y-4">
                  <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M2 16l4-12 6 5 6-5 4 12z"></path></svg>
                </div>
                
                <div className="relative z-10 mb-8">
                  <h3 className="text-base font-black flex items-center gap-2 mb-1" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                    Your Stats
                  </h3>
                  <p className="text-[11px] text-gray-400 font-medium">Keep playing. Keep climbing.</p>
                </div>

                <div className="grid grid-cols-4 gap-4 relative z-10 border-t border-white/10 pt-4 mt-auto">
                  <div className="text-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" className="mx-auto mb-2"><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                    <p className="text-xl font-black">{winCount}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Wins</p>
                  </div>
                  <div className="text-center border-l border-white/10">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2.5" className="mx-auto mb-2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    <p className="text-xl font-black">{totalPlayed}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Played</p>
                  </div>
                  <div className="text-center border-l border-white/10">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2.5" className="mx-auto mb-2"><path d="M12 2c0 0-4 7-4 12a4 4 0 0 0 8 0c0-5-4-12-4-12z"/></svg>
                    <p className="text-xl font-black">{stats.streak}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase leading-tight">Current Streak</p>
                  </div>
                  <div className="text-center border-l border-white/10">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2.5" className="mx-auto mb-2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    <p className="text-xl font-black">{stats.xp.toLocaleString('en-US')}</p>
                    
                    <p className="text-[9px] text-gray-400 font-bold uppercase leading-tight">Total XP</p>
                  </div>
                </div>
              </div>

              {/* MY ACTIVE BATTLES (Spans 4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-black text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                    My Active Battles
                  </h3>
                  <button className="text-xs font-bold text-[#16A34A] hover:underline flex items-center gap-1">
                    See all <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Battle 1 */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-50 cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <GameIcon game="Call of Duty: Mobile" />
                      <div>
                        <p className="text-xs font-black text-gray-900 group-hover:text-[#16A34A] transition-colors">CODM</p>
                        <p className="text-sm font-black text-gray-900">vs EmkaBeast</p>
                        <p className="text-[10px] text-gray-500 font-semibold mt-0.5">1v1 • Killhouse</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex text-[9px] font-black uppercase tracking-widest text-[#16A34A] mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse mr-1 mt-0.5"></span> Live
                      </span>
                      <p className="text-sm font-black text-gray-900">GHS 450.00</p>
                    </div>
                  </div>

                  {/* Battle 2 */}
                  <div className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <GameIcon game="FC Mobile" />
                      <div>
                        <p className="text-xs font-black text-gray-900 group-hover:text-[#16A34A] transition-colors">FC Mobile</p>
                        <p className="text-sm font-black text-gray-900">vs TundeSniper</p>
                        <p className="text-[10px] text-gray-500 font-semibold mt-0.5">1v1 • H2H</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex text-[9px] font-black uppercase tracking-widest text-amber-500 mb-1">
                        Pending
                      </span>
                      <p className="text-sm font-black text-gray-900">GHS 250.00</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* QUICK ACTION & TOURNAMENTS (Spans 4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                
                {/* Quick Action */}
                <div className="bg-white rounded-[20px] border border-gray-100 p-5 shadow-sm flex-1">
                  <h3 className="text-sm font-black text-gray-900 flex items-center gap-2 mb-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    Quick Action
                  </h3>
                  <p className="text-[11px] text-gray-500 font-semibold mb-4">Jump into the action now.</p>
                  <button onClick={() => onNavigate('create-match')} className="w-full py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803d] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm">
                    Create Match <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>

                {/* Upcoming Tournaments */}
                <div className="bg-white rounded-[20px] border border-gray-100 p-5 shadow-sm flex-1 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor"><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 flex items-center gap-2 mb-1 relative z-10">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                      Upcoming Tournaments
                    </h3>
                    <p className="text-[11px] text-gray-500 font-semibold relative z-10">Big prizes. Real players.</p>
                  </div>
                  <button className="text-[11px] font-bold text-[#16A34A] hover:underline flex items-center gap-1 w-fit mt-4 relative z-10">
                    View tournaments <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                  
                  {/* Floating Trophy Graphic for detail */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-green-50 rounded-full flex items-center justify-center border border-green-100 z-10">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2"><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </main>
      </div>

    </div>
  );
}