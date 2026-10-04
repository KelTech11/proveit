import { useState, useEffect } from 'react';
import { ProfileAvatar as Avatar } from '../avatars';
import { me, players, matches } from '../data';
import { GAME_DETAILS, FEE_FREE_PERIOD, calcPayout, type MatchDraft } from './CreateMatch';
import jokerBanner from '../assets/joker_white.jpg';

const match = matches[0];
const opponent = players[1];

const DEFAULT_DRAFT: MatchDraft = { game: 'CODM', mode: '1v1', wager: 225, uid: '', username: '' };

import { useProfile } from '../profile';

export default function MatchLobby({ onNavigate, matchDraft, onLock, onNotify, stats }: { onNavigate: (s: string) => void; matchDraft: MatchDraft | null; onLock: (amount: number) => void; onNotify: (type: 'match_invite', title: string, body: string) => void; stats: { wins: number; losses: number; streak: number; xp: number } }) {
  const { profile: me } = useProfile();
  const draft = matchDraft ?? DEFAULT_DRAFT;
  const game = GAME_DETAILS[draft.game];
  const pot = draft.wager * 2;
  const { winnings } = calcPayout(draft.wager);

  const [started, setStarted] = useState(false);
  const [oppReady, setOppReady] = useState(false);
  const [locked, setLocked] = useState(false);
  const [chatText, setChatText] = useState('');
  const [chatMsgs, setChatMsgs] = useState<string[]>([]);
  const [matchId] = useState(() => `M-${Math.floor(1000 + Math.random() * 9000)}`);
  const [ping, setPing] = useState<number | null>(null);
  const PING_OFFSET = 60; // site ping runs ~60 ms higher than in-game ping
  const signalBars = ping === null ? 0 : ping <= 50 ? 4 : ping <= 80 ? 3 : ping <= 120 ? 2 : 1;
  const signalBg = signalBars >= 3 ? 'bg-[#16A34A]' : signalBars === 2 ? 'bg-amber-400' : 'bg-red-500';
  const signalText = signalBars >= 3 ? 'text-[#16A34A]' : signalBars === 2 ? 'text-amber-500' : 'text-red-500';

  useEffect(() => {
    let cancelled = false;
    const measure = () => {
      const t0 = performance.now();
      fetch('/', { method: 'HEAD', cache: 'no-store' })
        .then(() => { if (!cancelled) setPing(Math.max(10, Math.round(performance.now() - t0) - PING_OFFSET)); })
        .catch(() => { if (!cancelled) setPing(null); });
    };
    measure();
    const id = setInterval(measure, 2000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const sendChat = () => {
    const t = chatText.trim();
    if (!t) return;
    setChatMsgs(m => [...m, t]);
    setChatText('');
  };

  // Demo: opponent presses Start 2s after you
  useEffect(() => {
    if (!started) return;
    const t = setTimeout(() => {
      setOppReady(true);
      onNotify('match_invite', 'Opponent is ready', `${opponent.username} pressed Start. Funds are locking now.`);
    }, 2000);
    return () => clearTimeout(t);
  }, [started]);

  // Both ready: lock funds, then enter the match
  useEffect(() => {
    if (!started || !oppReady) return;
    onLock(draft.wager);
    setLocked(true);
    const t = setTimeout(() => onNavigate('active-match'), 1800);
    return () => clearTimeout(t);
  }, [started, oppReady]);

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap');
        `}
      </style>

      <div className="min-h-screen bg-[#F4F7F9] text-gray-900 font-sans p-2 sm:p-4 lg:p-6 flex flex-col items-center selection:bg-green-200 overflow-x-hidden">
        
        {/* --- HERO BANNER --- */}
        <div className="max-w-[1400px] w-full bg-[#0B0B0F] rounded-2xl sm:rounded-3xl relative overflow-hidden flex flex-col justify-center min-h-[180px] sm:min-h-[240px] mb-4 sm:mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.25)] border border-gray-800">
          
          <img src={jokerBanner} alt="" className="absolute inset-0 w-full h-full object-cover object-center opacity-60 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/60 pointer-events-none" />

          {/* Right Side: Custom Typography Graphic */}
          <div className="hidden md:flex absolute right-0 top-0 bottom-0 w-1/3 items-center justify-center pr-12 pointer-events-none">
            <svg className="absolute right-0 top-1/2 -translate-y-1/2 h-[180%] text-white opacity-[0.06] z-0" viewBox="0 0 100 100" fill="currentColor">
              <path d="M10 0 h50 c25 0, 40 15, 40 35 c0 20, -15 35, -40 35 h-20 v30 h-30 z M40 45 c10 0, 15 -5, 15 -10 c0 -5, -5 -10, -15 -10 h-10 v20 z" />
            </svg>
            
            <div className="flex flex-col items-center transform rotate-12 relative z-10 drop-shadow-md">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-1 text-white">
                <path d="M2 20h20M5 20V9l4 4 3-8 3 8 4-4v11" />
                <path d="M12 4l-1-2 1-1 1 1-1 2z" fill="#16A34A" stroke="none" />
              </svg>
              <span className="text-[28px] leading-[0.8] font-black uppercase text-white tracking-widest" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Skill</span>
              <span className="text-[44px] leading-[0.5] text-[#16A34A] -ml-6 z-10 drop-shadow-sm" style={{ fontFamily: "'Caveat', cursive", transform: 'rotate(-8deg)' }}>Meets</span>
              <span className="text-[28px] leading-[0.8] font-black uppercase text-white tracking-widest mt-2" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Reward</span>
              <div className="w-12 h-1 bg-[#16A34A] mt-3 ml-8 rounded-full" />
            </div>
          </div>

          <div className="relative z-10 w-full flex justify-center md:justify-start md:pl-16 text-center md:text-left px-4">
            <div>
              <p className="text-[#4ADE80] text-[9px] sm:text-[11px] font-black uppercase tracking-widest mb-1.5 sm:mb-2">P2P Wager Gaming Platform</p>
              <h1 className="text-[24px] sm:text-[44px] font-black text-white mb-1 sm:mb-2 tracking-tight leading-none drop-shadow-lg" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                Match Lobby
              </h1>
              <p className="text-gray-200 font-medium text-xs sm:text-sm">
                You and your opponent are set! Get ready to play.
              </p>
            </div>
          </div>
        </div>

        {/* --- MAIN LOBBY CARD --- */}
        <div className="max-w-[1400px] w-full bg-white rounded-2xl sm:rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 flex flex-col overflow-hidden">
          
          <div className="p-2 sm:p-6 lg:p-8 grid grid-cols-[1fr_auto_1fr] gap-1.5 sm:gap-6 lg:gap-12 items-stretch">
            
            {/* PLAYER 1 CARD */}
            <div className="relative rounded-xl sm:rounded-3xl p-2 sm:p-6 flex flex-col justify-between overflow-hidden border-2 border-blue-300 bg-blue-50 shadow-[0_10px_30px_rgba(59,130,246,0.25)] transition-transform hover:-translate-y-1 duration-300">
              <svg
                className="absolute inset-0 w-full h-full z-0 pointer-events-none"
                viewBox="0 0 400 500"
                preserveAspectRatio="xMidYMid slice"
                fill="none"
              >
                <defs>
                  <filter id="p1-paint" x="-20%" y="-20%" width="140%" height="140%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="4" result="n" />
                    <feDisplacementMap in="SourceGraphic" in2="n" scale="20" />
                  </filter>
                  <linearGradient id="p1-sky" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#DBEAFE" />
                    <stop offset="0.6" stopColor="#BFDBFE" />
                    <stop offset="1" stopColor="#E0F2FE" />
                  </linearGradient>
                </defs>
                <rect width="400" height="500" fill="url(#p1-sky)" />
                <g filter="url(#p1-paint)">
                  <path d="M-40 400 C80 320 160 440 260 360 C330 305 380 320 460 250 L460 540 L-40 540 Z" fill="#93C5FD" />
                  <path d="M-40 440 C90 380 180 480 290 405 C350 365 400 375 460 325 L460 540 L-40 540 Z" fill="#60A5FA" />
                  <path d="M-40 480 C100 430 190 520 300 450 C360 415 410 425 460 390 L460 540 L-40 540 Z" fill="#3B82F6" />
                  <path d="M-30 70 C60 10 150 80 240 25 C300 -8 360 5 440 -25 L440 -40 L-30 -40 Z" fill="#60A5FA" opacity="0.7" />
                  <path d="M20 160 L150 120" stroke="#3B82F6" strokeWidth="10" strokeLinecap="round" opacity="0.35" />
                  <path d="M0 200 L120 168" stroke="#06B6D4" strokeWidth="8" strokeLinecap="round" opacity="0.4" />
                  <path d="M30 240 L100 220" stroke="#3B82F6" strokeWidth="6" strokeLinecap="round" opacity="0.3" />
                </g>
                <path d="M315 30 L262 150 L300 150 L268 270 L355 122 L312 122 L345 30 Z" fill="#FDE047" stroke="#F59E0B" strokeWidth="3" strokeLinejoin="round" opacity="0.85" />
                <circle cx="70" cy="330" r="7" fill="#3B82F6" opacity="0.5" />
                <circle cx="95" cy="350" r="3.5" fill="#1D4ED8" opacity="0.5" />
                <circle cx="350" cy="300" r="5" fill="#06B6D4" opacity="0.55" />
                <circle cx="372" cy="322" r="2.5" fill="#3B82F6" opacity="0.5" />
                <circle cx="40" cy="60" r="4" fill="#1D4ED8" opacity="0.4" />
              </svg>
              
              <div className="relative z-10">
                <div className="flex justify-center sm:justify-between items-start mb-2 sm:mb-6">
                  <span className="bg-[#3B82F6] text-white text-[7px] sm:text-[11px] font-black px-2 sm:px-4 py-0.5 sm:py-1.5 rounded-full tracking-widest shadow-sm">
                    P1<span className="hidden sm:inline"> LAYER</span>
                  </span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#FBBF24" stroke="none" className="drop-shadow-sm hidden sm:block"><path d="M2 16l4-12 6 5 6-5 4 12z"/></svg>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1 sm:gap-4 mb-2 sm:mb-8">
                  <div className="relative shrink-0 scale-[0.6] sm:scale-100 origin-top">
                    <Avatar color={me.color} country={me.country} name={me.name} size="lg" />
                  </div>
                  <div className="min-w-0 w-full flex flex-col items-center sm:items-start -mt-2 sm:mt-0">
                    <h3 className="font-bold text-gray-900 text-[10px] sm:text-lg flex items-center justify-center sm:justify-start gap-1 sm:gap-1.5 truncate w-full" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                      <span className="truncate">{me.name}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#16A34A" stroke="none" className="shrink-0 hidden sm:block"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    </h3>
                    <p className="text-[#3B82F6] text-xs sm:text-sm font-semibold mb-1 truncate w-full hidden sm:block">@{me.username}</p>
                    <p className="text-gray-500 text-xs flex items-center gap-1.5 font-medium hidden sm:flex">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {me.country === 'GH' ? 'Ghana' : 'Nigeria'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex flex-col items-center sm:items-start gap-1.5 sm:gap-4 mt-auto">
                <div className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 text-[#F59E0B]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="sm:w-5 sm:h-5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                  <span className="font-bold text-[10px] sm:text-[18px] tabular" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>2,340</span>
                  <span className="bg-gray-100 text-gray-500 text-[7px] sm:text-[10px] font-black px-1 sm:px-2 py-0.5 rounded ml-0.5 sm:ml-1">GH</span>
                </div>

                <div className={`inline-flex items-center justify-center gap-1 sm:gap-2 ${started ? 'bg-green-50/80 border border-green-200/60 text-[#16A34A]' : 'bg-amber-50/80 border border-amber-200/60 text-[#D97706]'} text-[7px] sm:text-[11px] font-black px-2 sm:px-4 py-1 sm:py-2 rounded-full w-full sm:w-fit tracking-widest uppercase`}>
                  <span className={`w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full animate-pulse ${started ? 'bg-[#16A34A] shadow-[0_0_8px_rgba(22,163,74,0.6)]' : 'bg-[#D97706]'}`} /> 
                  <span className="hidden sm:inline">{started ? 'READY' : 'WAITING'}</span><span className="sm:hidden">{started ? 'RDY' : 'WAIT'}</span>
                </div>
              </div>
            </div>

            {/* CENTER: VS & Game Details */}
            <div className="flex flex-col items-center justify-center py-2 sm:py-4 px-1 w-full max-w-[280px] mx-auto">
              
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-4 mb-2 sm:mb-10 w-full justify-center">
                <div className="w-[32px] h-[32px] sm:w-[80px] sm:h-[80px] rounded-md sm:rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-gray-100 overflow-hidden">
                  <img 
                    src={game.coverUrl} 
                    alt={game.title} 
                    className="w-full h-full object-cover scale-[1.15]"
                  />
                </div>
                
                <div className="hidden sm:flex flex-col justify-center py-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Game</p>
                    <span className={`px-2 py-0.5 ${game.genreColor} text-[9px] font-black rounded tracking-widest uppercase`}>{game.genre}</span>
                  </div>
                  <h4 className="font-black text-gray-900 leading-tight mb-1.5 sm:mb-2.5 text-xs sm:text-base" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{game.title}</h4>
                  <div className="text-gray-500 text-[9px] sm:text-[11px] font-semibold space-y-1 sm:space-y-1.5">
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      {game.modes}
                    </div>
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                      Global / Regional
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center w-full mb-3 sm:mb-10 relative">
                <div className="flex-1 h-[1px] sm:h-[2px] bg-gradient-to-r from-transparent via-green-300 to-[#16A34A]" />
                <div className="absolute left-1/2 -translate-x-1/2 w-8 h-8 sm:w-16 h-16 bg-green-100 rounded-full blur-xl z-0" />
                <span className="px-1.5 sm:px-6 text-[14px] sm:text-[48px] font-black italic text-gray-900 tracking-tighter relative z-10 drop-shadow-sm" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>VS</span>
                <div className="flex-1 h-[1px] sm:h-[2px] bg-gradient-to-l from-transparent via-green-300 to-[#16A34A]" />
              </div>

              <div className="text-center w-full">
                <div className="flex items-center justify-center gap-1 sm:gap-1.5 mb-1 sm:mb-2 text-[#16A34A] text-[6px] sm:text-[11px] font-black uppercase tracking-widest">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="hidden sm:block"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                  PRIZE POOL
                </div>
                <div className="flex items-center justify-center gap-1 sm:gap-4">
                  <div className="h-[1px] sm:h-[2px] bg-[#16A34A] w-2 sm:w-6 opacity-30 rounded-full" />
                  <p className="text-[12px] sm:text-[32px] font-black text-[#16A34A] tabular tracking-tighter drop-shadow-sm whitespace-nowrap" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                    <span className="hidden sm:inline">{me.currency} </span>{Number.isInteger(pot) ? pot : pot.toFixed(2)}<span className="hidden sm:inline">{Number.isInteger(pot) ? '.00' : ''}</span>
                  </p>
                  <div className="h-[1px] sm:h-[2px] bg-[#16A34A] w-2 sm:w-6 opacity-30 rounded-full" />
                </div>
                
                <div className="mt-2 sm:mt-5 mx-auto inline-flex items-center justify-center gap-1 sm:gap-2.5 bg-[#09090B] text-white px-2 py-1 sm:px-5 sm:py-2.5 rounded-md sm:rounded-xl text-[7px] sm:text-xs font-bold shadow-lg border border-gray-800 whitespace-nowrap">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="hidden sm:block"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  {draft.mode}
                </div>
              </div>
            </div>

            {/* PLAYER 2 CARD */}
            <div className="relative rounded-xl sm:rounded-3xl p-2 sm:p-6 flex flex-col justify-between overflow-hidden border-2 border-purple-300 bg-purple-50 shadow-[0_10px_30px_rgba(139,92,246,0.25)] transition-transform hover:-translate-y-1 duration-300">
              <svg
                className="absolute inset-0 w-full h-full z-0 pointer-events-none"
                viewBox="0 0 400 500"
                preserveAspectRatio="xMidYMid slice"
                fill="none"
              >
                <defs>
                  <filter id="p2-paint" x="-20%" y="-20%" width="140%" height="140%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="3" seed="9" result="n" />
                    <feDisplacementMap in="SourceGraphic" in2="n" scale="24" />
                  </filter>
                  <linearGradient id="p2-sky" x1="1" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#EDE9FE" />
                    <stop offset="0.55" stopColor="#DDD6FE" />
                    <stop offset="1" stopColor="#FBCFE8" />
                  </linearGradient>
                </defs>
                <rect width="400" height="500" fill="url(#p2-sky)" />
                <g filter="url(#p2-paint)">
                  <path d="M-30 380 C60 300 140 420 230 340 C300 280 360 300 440 220 L440 540 L-30 540 Z" fill="#C4B5FD" />
                  <path d="M-30 430 C80 370 170 470 270 395 C340 345 390 360 440 310 L440 540 L-30 540 Z" fill="#A78BFA" />
                  <path d="M-30 480 C90 430 180 520 290 450 C350 410 400 425 440 385 L440 540 L-30 540 Z" fill="#8B5CF6" />
                  <path d="M440 40 C360 90 300 30 220 90 C160 135 90 100 -20 150 L-20 -40 L440 -40 Z" fill="#F9A8D4" opacity="0.6" />
                  <path d="M440 110 C380 140 330 110 270 150" stroke="#EC4899" strokeWidth="12" strokeLinecap="round" opacity="0.3" />
                  <path d="M430 150 C390 175 350 155 310 185" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" opacity="0.35" />
                </g>
                <path d="M70 60 A46 46 0 1 0 118 130 A36 36 0 1 1 70 60 Z" fill="#FDE68A" stroke="#F59E0B" strokeWidth="2.5" opacity="0.9" />
                <path d="M300 70 L306 92 L328 98 L306 104 L300 126 L294 104 L272 98 L294 92 Z" fill="#FFFFFF" stroke="#C4B5FD" strokeWidth="2" opacity="0.95" />
                <path d="M350 200 L353 210 L363 213 L353 216 L350 226 L347 216 L337 213 L347 210 Z" fill="#FFFFFF" opacity="0.9" />
                <path d="M60 230 L63 240 L73 243 L63 246 L60 256 L57 246 L47 243 L57 240 Z" fill="#FFFFFF" opacity="0.9" />
                <circle cx="330" cy="320" r="7" fill="#8B5CF6" opacity="0.45" />
                <circle cx="352" cy="342" r="3.5" fill="#EC4899" opacity="0.5" />
                <circle cx="60" cy="310" r="5" fill="#EC4899" opacity="0.45" />
                <circle cx="82" cy="330" r="2.5" fill="#8B5CF6" opacity="0.5" />
              </svg>
              
              <div className="relative z-10">
                <div className="flex justify-center sm:justify-between items-start mb-2 sm:mb-6">
                  <span className="bg-[#8B5CF6] text-white text-[7px] sm:text-[11px] font-black px-2 sm:px-4 py-0.5 sm:py-1.5 rounded-full tracking-widest shadow-sm">
                    P2<span className="hidden sm:inline"> LAYER</span>
                  </span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#FBBF24" stroke="none" className="drop-shadow-sm hidden sm:block"><path d="M2 16l4-12 6 5 6-5 4 12z"/></svg>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1 sm:gap-4 mb-2 sm:mb-8">
                  <div className="relative shrink-0 scale-[0.6] sm:scale-100 origin-top">
                    <Avatar color={opponent.color} country={opponent.country} name={opponent.name} size="lg" />
                  </div>
                  <div className="min-w-0 w-full flex flex-col items-center sm:items-start -mt-2 sm:mt-0">
                    <h3 className="font-bold text-gray-900 text-[10px] sm:text-lg truncate w-full" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                      {opponent.name}
                    </h3>
                    <p className="text-[#8B5CF6] text-xs sm:text-sm font-semibold mb-1 truncate w-full hidden sm:block">@{opponent.username}</p>
                    <p className="text-gray-500 text-xs flex items-center gap-1.5 font-medium hidden sm:flex">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      Nigeria
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex flex-col items-center sm:items-start gap-1.5 sm:gap-4 mt-auto">
                <div className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 text-[#F59E0B]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="sm:w-5 sm:h-5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                  <span className="font-bold text-[10px] sm:text-[18px] tabular" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>2,180</span>
                  <span className="bg-gray-100 text-gray-500 text-[7px] sm:text-[10px] font-black px-1 sm:px-2 py-0.5 rounded ml-0.5 sm:ml-1">NG</span>
                </div>

                <div className={`inline-flex items-center justify-center gap-1 sm:gap-2 ${oppReady ? 'bg-green-50/80 border border-green-200/60 text-[#16A34A]' : 'bg-amber-50/80 border border-amber-200/60 text-[#D97706]'} text-[7px] sm:text-[11px] font-black px-2 sm:px-4 py-1 sm:py-2 rounded-full w-full sm:w-fit tracking-widest uppercase`}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="hidden sm:block"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> 
                  <span className="hidden sm:inline">{oppReady ? 'READY' : 'WAITING'}</span><span className="sm:hidden">{oppReady ? 'RDY' : 'WAIT'}</span>
                </div>
              </div>
            </div>

          </div>

          {/* STATS ROW */}
          <div className="border-t border-gray-100 bg-gray-50/50 py-4 sm:py-6 px-4 sm:px-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-200/80">
            <div className="flex items-center justify-center gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#84cc16" strokeWidth="2.5" className="sm:w-6 sm:h-6"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <div>
                <p className="font-black text-gray-900 text-sm sm:text-lg tabular" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{stats.wins}W / {stats.losses}L</p>
                <p className="text-gray-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mt-0.5">Win / Loss Record</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-4 pt-4 md:pt-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center shrink-0 relative">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#16A34A" stroke="none" className="sm:w-6 sm:h-6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" className="absolute sm:w-3 sm:h-3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <p className="font-black text-gray-900 text-sm sm:text-lg tabular" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>0W / 0L</p>
                <p className="text-gray-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mt-0.5">Record vs Opponent</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-4 pt-4 md:pt-0">
              <div className="flex items-end gap-1 h-6 sm:h-8 shrink-0">
                 {['h-2 sm:h-3', 'h-3 sm:h-4', 'h-4 sm:h-6', 'h-6 sm:h-8'].map((h, i) => (
                   <div
                     key={i}
                     className={`w-1.5 sm:w-2 ${h} rounded-sm transition-all duration-500 ${i < signalBars ? signalBg : 'bg-gray-200'}`}
                   />
                 ))}
              </div>
              <div>
                <p className="text-gray-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-0.5">Your Connection</p>
                <p className={`font-black text-sm sm:text-lg tabular ${signalText}`} style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{ping !== null ? `${ping} ms` : '...'}</p>
              </div>
            </div>
          </div>

          {/* ESCROW */}
          <div className="border-t border-gray-200 bg-green-50/60 px-4 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#16A34A] text-white flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-gray-900">
                  {locked
                    ? 'Funds locked in escrow. Starting match...'
                    : started
                      ? 'Waiting for opponent to press Start...'
                      : `${me.currency} ${draft.wager.toFixed(2)} locks in escrow once both players press Start`}
                </p>
                <p className="text-[11px] sm:text-xs text-gray-600">
                  Winner receives {me.currency} {winnings.toFixed(2)}. {FEE_FREE_PERIOD ? 'Platform fee waived, your first 7 days are fee-free.' : '10% platform fee applies.'} No cancelling once funds are locked.
                </p>
              </div>
            </div>
            {draft.uid && (
              <div className="shrink-0 bg-white border border-gray-200 rounded-xl px-3 py-2 text-[11px] sm:text-xs text-gray-500 font-semibold">
                Your {draft.game} ID: <span className="font-black text-gray-900">{draft.uid}</span>
              </div>
            )}
          </div>

          {/* BOTTOM ACTION BAR */}
          <div className="border-t border-gray-200 bg-white p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
            
            <div className="flex items-center gap-5 w-full md:w-auto flex-1">
              <div className="flex items-center gap-2 sm:gap-3 shrink-0 bg-gray-50 border border-gray-200 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow-sm w-full sm:w-auto justify-center sm:justify-start">
                <span className="bg-green-800 text-white text-[8px] sm:text-[10px] font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md flex items-center gap-1.5 uppercase tracking-widest">
                  <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-[#a3e635] animate-pulse" /> Live
                </span>
                <span className="text-gray-500 text-xs sm:text-sm font-bold">Match {matchId}</span>
              </div>
              
              <div className="flex-1 max-w-sm relative hidden sm:block">
                {chatMsgs.length > 0 && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-2xl shadow-lg p-3 flex flex-col gap-1.5">
                    {chatMsgs.map((m, i) => (
                      <div key={i} className="self-end max-w-[85%] bg-[#16A34A] text-white text-xs font-medium px-3 py-1.5 rounded-2xl rounded-br-sm break-words">{m}</div>
                    ))}
                  </div>
                )}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <input
                  type="text"
                  value={chatText}
                  onChange={e => setChatText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') sendChat(); }}
                  placeholder="Type a message..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-12 pr-14 text-sm font-medium outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-green-100 transition-all"
                />
                <button
                  onClick={sendChat}
                  disabled={!chatText.trim()}
                  aria-label="Send message"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-[#16A34A] hover:bg-[#15803d] text-white flex items-center justify-center transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>

            <div className="flex flex-row items-center gap-2 sm:gap-3 w-full md:w-auto">
              <button
                onClick={() => onNavigate('dashboard')}
                disabled={started}
                className="flex-1 md:flex-none px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-[#27272A] hover:bg-black text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Chakra Petch, sans-serif' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="sm:w-[18px] sm:h-[18px]"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Decline
              </button>
              <button
                onClick={() => setStarted(true)}
                disabled={started}
                className="flex-1 md:flex-none px-4 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-[#16A34A] hover:bg-[#15803d] text-white font-bold text-xs sm:text-sm transition-transform hover:-translate-y-0.5 shadow-[0_8px_20px_rgba(22,163,74,0.3)] flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                style={{ fontFamily: 'Chakra Petch, sans-serif' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="sm:w-[18px] sm:h-[18px]"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                {locked ? 'Funds locked...' : started ? 'Waiting for opponent...' : <>Start <span className="hidden sm:inline">Match</span> →</>}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}