import { useState, useEffect } from 'react';
import { useProfile } from '../profile';

// 1. IMPORTING YOUR EXACT LOCAL IMAGES
import fcMobileCover from '../assets/fc-mobile.jpg';
import codmCover from '../assets/codm.jpg';
import freeFireCover from '../assets/freefire.jpg'; 

// --- Game Data specifically tailored to match the design ---
export type GameType = 'CODM' | 'FC Mobile' | 'eFootball' | 'Free Fire' | 'PUBG Mobile';

export type MatchDraft = { game: GameType; mode: string; wager: number; uid: string; username: string };

export const DEFAULT_DRAFT: MatchDraft = { game: 'CODM', mode: '1v1', wager: 225, uid: '', username: '' };

export const GAME_DETAILS: Record<GameType, { genre: string, genreColor: string, modes: string, coverUrl: string, title: string }> = {
  'CODM': {
    title: 'Call of Duty: Mobile',
    genre: 'FPS',
    genreColor: 'text-green-600 bg-green-50',
    coverUrl: codmCover, 
    modes: '1v1 / 2v2 / BR'
  },
  'FC Mobile': {
    title: 'FC Mobile',
    genre: 'SPORTS',
    genreColor: 'text-blue-600 bg-blue-50',
    coverUrl: fcMobileCover, 
    modes: 'H2H / VS Attack'
  },
  'eFootball': {
    title: 'eFootball™',
    genre: 'SPORTS',
    genreColor: 'text-blue-600 bg-blue-50',
    coverUrl: 'https://gamingonphone.com/wp-content/uploads/2025/09/eFootball-2026-Yu-Gi-Oh-Collaboration-Neymar-France-cover.jpg', 
    modes: 'League Match'
  },
  'Free Fire': {
    title: 'Free Fire',
    genre: 'BATTLE ROYALE',
    genreColor: 'text-orange-500 bg-orange-50',
    coverUrl: freeFireCover,
    modes: 'Solo / Squad'
  },
  'PUBG Mobile': {
    title: 'PUBG Mobile',
    genre: 'BATTLE ROYALE',
    genreColor: 'text-orange-500 bg-orange-50',
    coverUrl: 'https://static0.xdaimages.com/wordpress/wp-content/uploads/2018/06/pubg.jpg?w=1200&h=675&fit=crop', 
    modes: 'Squad / Duo'
  }
};

const GAMES = Object.keys(GAME_DETAILS) as GameType[];
const HERO_SLIDES = GAMES.map(g => GAME_DETAILS[g].coverUrl);

const CURRENCY = 'GHS';
const PLATFORM_FEE = 0.10; // 10% of the full pot
export const FEE_FREE_PERIOD = false; // true = first-7-days case
export const calcPayout = (wager: number) => {
  const pot = wager * 2;
  const fee = FEE_FREE_PERIOD ? 0 : pot * PLATFORM_FEE;
  return { pot, fee, winnings: pot - fee };
};
const WAGER_PRESETS = [20, 50, 100, 200, 500];
const MIN_WAGER = 10;
const MIN_UID_LENGTH = 6;

export const GAME_FIELDS: Record<GameType, { uidLabel: string; uidHint: string; nameLabel: string }> = {
  'CODM': {
    uidLabel: 'CODM Player UID',
    uidHint: 'Tap your profile in CODM and copy the UID under your name.',
    nameLabel: 'CODM username',
  },
  'FC Mobile': {
    uidLabel: 'FC Mobile UID',
    uidHint: 'Find it on your FC Mobile profile page.',
    nameLabel: 'FC Mobile username',
  },
  'eFootball': {
    uidLabel: 'eFootball User ID',
    uidHint: 'Find it on your eFootball profile screen.',
    nameLabel: 'eFootball username',
  },
  'Free Fire': {
    uidLabel: 'Free Fire UID',
    uidHint: 'Tap your avatar in Free Fire. The UID sits under your name.',
    nameLabel: 'Free Fire nickname',
  },
  'PUBG Mobile': {
    uidLabel: 'PUBG Mobile Character ID',
    uidHint: 'Open your profile. The ID sits under your name.',
    nameLabel: 'PUBG Mobile nickname',
  },
};

export default function CreateMatch({ onNavigate, onMatchCreated, onJoinCode }: { onNavigate: (s: string) => void; onMatchCreated: (d: MatchDraft) => void; onJoinCode: (code: string) => void }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mode, setMode] = useState('');
  const [wager, setWager] = useState(0);
  const [matchType, setMatchType] = useState<'open' | 'private'>('private');
  const [gameUid, setGameUid] = useState('');
  const [gameName, setGameName] = useState('');
  const [rules, setRules] = useState('');
  const [copied, setCopied] = useState(false);
  const [hasShared, setHasShared] = useState(false);
  const [showShareWarning, setShowShareWarning] = useState(false);
  const [joinInput, setJoinInput] = useState('');
  const [inviteCode] = useState(() => Math.random().toString(36).slice(2, 8).toUpperCase());
  const { profile } = useProfile();

  useEffect(() => {
    const t = setTimeout(() => setHeroIndex(i => (i + 1) % HERO_SLIDES.length), 4000);
    return () => clearTimeout(t);
  }, [heroIndex]);

  useEffect(() => {
    setGameUid(selectedGame ? profile.linkedGames[selectedGame] ?? '' : '');
    setGameName('');
  }, [selectedGame]);

  const q = searchQuery.trim().toLowerCase();
  const searchMatches = q
    ? GAMES.filter(g => {
        const title = GAME_DETAILS[g].title.toLowerCase();
        return (
          title.startsWith(q) ||
          title.split(/[\s:™]+/).some(word => word.startsWith(q)) ||
          g.toLowerCase().startsWith(q)
        );
      })
    : [];

  const modeOptions = selectedGame ? GAME_DETAILS[selectedGame].modes.split(' / ') : [];
  const activeMode = modeOptions.includes(mode) ? mode : '';
  const pot = wager * 2;
  const fee = pot * PLATFORM_FEE;
  const winnerGets = pot - fee;
  const canContinueWager = !!activeMode && wager >= MIN_WAGER;
  const money = (n: number) =>
    `${CURRENCY} ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const fields = selectedGame ? GAME_FIELDS[selectedGame] : null;
  const canCreate = gameUid.trim().length >= MIN_UID_LENGTH && gameName.trim().length >= 2;
  const CURRENCY = profile.currency;
  const [linkTime, setLinkTime] = useState(0);
  useEffect(() => {
    if (step === 4) setLinkTime(Date.now());
  }, [step]);
  const encodedMatch = selectedGame
    ? encodeURIComponent(btoa(JSON.stringify({ g: selectedGame, m: activeMode, w: wager, t: linkTime })))
    : inviteCode;
  const inviteLink = `https://proveit-six.vercel.app/join/${encodedMatch}`;
  const inviteMessage = selectedGame
    ? `Yo! I'm challenging you to ${GAME_DETAILS[selectedGame].title} on ProveIt. ${money(wager)} each, winner takes the pot. This link works for 10 minutes: ${inviteLink}`
    : '';
  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(inviteMessage)}`;

  const copyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(inviteLink);
      } else {
        const ta = document.createElement('textarea');
        ta.value = inviteLink;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setHasShared(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-sans flex flex-col selection:bg-green-200">
      
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap');
        `}
      </style>

      <div className="max-w-[1440px] w-full mx-auto flex-1 flex flex-col lg:flex-row">
        
        <aside className="hidden lg:flex w-64 shrink-0 flex-col gap-2 p-6 border-r border-gray-100 bg-[#F8FAFC]">
          <button onClick={() => onNavigate('dashboard')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 font-bold text-sm transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            Home
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 text-[#16A34A] font-bold text-sm transition-colors">
            <span className="bg-[#16A34A] text-white p-0.5 rounded-md shrink-0 shadow-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </span>
            Create Match
          </button>
          <button onClick={() => onNavigate('matches')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 font-bold text-sm transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
            My Matches
          </button>
          <button onClick={() => onNavigate('payout')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 font-bold text-sm transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
            Wallet
          </button>

          <button onClick={() => onNavigate('leaderboard')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 font-bold text-sm transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 15V3"/><path d="m8 7 4-4 4 4"/><path d="M20 21H4v-4h16v4Z"/></svg>
            Leaderboard
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 font-bold text-sm transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Community <span className="ml-auto text-[9px] font-black uppercase tracking-wider bg-gray-100 text-gray-400 px-2 py-0.5 rounded">Soon</span>
          </button>

          <div className="bg-[#04111d] rounded-2xl p-5 mt-auto relative overflow-hidden shadow-lg border border-gray-800 text-white">
            <div className="absolute top-[-10px] right-[-10px] opacity-20">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M12 12h.01"></path><path d="M17 12h.01"></path><path d="M7 12h.01"></path></svg>
            </div>
            <h3 className="font-black text-lg mb-1 leading-tight tracking-tight">Play. Compete.<br/>Win.</h3>
            <p className="text-[10px] text-gray-400 font-medium mb-4">Skill-based gaming.<br/>Real players. Real rewards.</p>
            <button className="w-6 h-6 rounded-full bg-[#16A34A] hover:bg-[#15803d] flex items-center justify-center transition-colors shadow-sm">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </aside>

        <main className="flex-1 p-6 lg:p-10 lg:pl-12 flex flex-col gap-8 max-w-6xl">
          
          <div
            className="bg-gray-900 rounded-[28px] p-8 lg:p-10 relative overflow-hidden flex flex-col justify-center min-h-[220px] shadow-sm"
            style={step === 1 ? undefined : { display: 'none' }}
            onTouchStart={e => setTouchStartX(e.touches[0].clientX)}
            onTouchEnd={e => {
              if (touchStartX === null) return;
              const diff = e.changedTouches[0].clientX - touchStartX;
              if (Math.abs(diff) > 40) {
                setHeroIndex(i => diff < 0 ? (i + 1) % HERO_SLIDES.length : (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
              }
              setTouchStartX(null);
            }}
          >
             <div
               className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
               style={{ transform: `translateX(-${heroIndex * 100}%)` }}
             >
               {HERO_SLIDES.map((src, i) => (
                 <img key={i} src={src} alt="" className="w-full h-full object-cover shrink-0" />
               ))}
             </div>

             <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20 pointer-events-none"></div>

             <div className="relative z-10 max-w-full lg:max-w-[60%]">
                <p className="text-[#22C55E] text-[10px] font-black uppercase tracking-widest mb-2">CREATE MATCH</p>
                <h1 className="text-4xl lg:text-5xl font-black text-white mb-3 tracking-tight" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                  Choose Your Game
                </h1>
                <p className="text-gray-200 font-medium text-sm max-w-sm leading-relaxed">
                  Select a game, set the rules, and find players to start your match. It's that simple.
                </p>
             </div>

             <div className="absolute bottom-4 right-6 z-10 flex items-center gap-1.5">
               {HERO_SLIDES.map((_, i) => (
                 <button
                   key={i}
                   onClick={() => setHeroIndex(i)}
                   aria-label={`Show slide ${i + 1}`}
                   className={`h-1.5 rounded-full transition-all ${i === heroIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`}
                 />
               ))}
             </div>
          </div>

          {step === 1 && (
            <div className="animate-fade-up">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M12 12h.01"></path><path d="M17 12h.01"></path><path d="M7 12h.01"></path></svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                      Choose Your Game
                    </h2>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      Pick a game to create your match and start playing with other skilled players.
                    </p>
                  </div>
                </div>

                <div className="relative w-full sm:w-64">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  </span>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                    onFocus={() => setSearchOpen(true)}
                    onBlur={() => setSearchOpen(false)}
                    placeholder="Search games..." 
                    className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-base sm:text-sm outline-none focus:border-[#16A34A] transition-colors shadow-sm"
                  />

                  {searchOpen && q && (
                    <div
                      onMouseDown={e => e.preventDefault()}
                      className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-30"
                    >
                      {searchMatches.length > 0 ? (
                        searchMatches.map(game => {
                          const meta = GAME_DETAILS[game];
                          return (
                            <button
                              key={game}
                              onClick={() => {
                                setSelectedGame(game);
                                setSearchQuery(meta.title);
                                setSearchOpen(false);
                                (document.activeElement as HTMLElement | null)?.blur();
                                setTimeout(() => {
                                  document
                                    .getElementById(`game-card-${game}`)
                                    ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }, 250);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-green-50 transition-colors text-left"
                            >
                              <img src={meta.coverUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{meta.title}</p>
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black tracking-widest uppercase ${meta.genreColor}`}>
                                  {meta.genre}
                                </span>
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <p className="px-4 py-3 text-sm text-gray-500">No games found</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {GAMES.map(game => {
                  const meta = GAME_DETAILS[game];
                  const isSelected = selectedGame === game;
                  
                  return (
                    <div
                      key={game}
                      id={`game-card-${game}`}
                      onClick={() => setSelectedGame(game)}
                      className={`group flex flex-col bg-white rounded-[20px] overflow-hidden cursor-pointer transition-all border-2 ${
                        isSelected ? 'border-[#16A34A] shadow-md ring-4 ring-green-50' : 'border-transparent shadow-sm hover:shadow-md'
                      }`}
                    >
                      <div className="h-36 w-full relative overflow-hidden bg-gray-100">
                        <img 
                          src={meta.coverUrl} 
                          alt={meta.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        {isSelected && (
                          <div className="absolute top-3 right-3 bg-[#16A34A] text-white w-6 h-6 rounded-md flex items-center justify-center shadow-sm z-10 animate-fade-in">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex flex-col border-t border-gray-100 flex-1">
                        <h3 className="font-black text-gray-900 text-sm mb-3">
                          {meta.title}
                        </h3>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase ${meta.genreColor}`}>
                              {meta.genre}
                            </span>
                            <div className="flex items-center gap-1 text-gray-500">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                              <span className="text-[11px] font-semibold">{meta.modes}</span>
                            </div>
                          </div>
                          
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${isSelected ? 'text-[#16A34A]' : 'text-gray-400 group-hover:text-gray-900'}`}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="flex flex-col bg-[#0f172a] rounded-[20px] overflow-hidden border-2 border-transparent shadow-sm p-6 items-center justify-center text-center min-h-[220px] cursor-default select-none">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white/50 mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M12 12h.01"></path><path d="M17 12h.01"></path><path d="M7 12h.01"></path></svg>
                  </div>
                  <h3 className="font-bold text-white text-sm">More Games Coming Soon</h3>
                  <p className="text-xs text-gray-400 mt-1">We're adding more titles</p>
                  <span className="mt-3 px-3 py-1 rounded-full bg-[#16A34A]/20 text-[#22C55E] text-[10px] font-black uppercase tracking-widest">
                    Coming Soon
                  </span>
                </div>

              </div>

              <div className="mt-8 bg-green-50 border border-green-100 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#16A34A] shrink-0 shadow-sm border border-green-100">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Got an invite link?</h4>
                    <p className="text-xs text-gray-600 mt-0.5">Paste the link or code your friend sent you to join their match.</p>
                  </div>
                </div>

                <div className="flex w-full lg:w-auto gap-2">
                  <input
                    type="text"
                    value={joinInput}
                    onChange={e => setJoinInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && joinInput.trim().length >= 4) {
                        onJoinCode(joinInput.trim());
                        onNavigate('join');
                      }
                    }}
                    placeholder="Paste link or code"
                    className="flex-1 lg:w-60 bg-white border border-green-200 rounded-xl px-4 py-2.5 text-base sm:text-sm outline-none focus:border-[#16A34A] transition-colors"
                  />
                  <button
                    disabled={joinInput.trim().length < 4}
                    onClick={() => {
                      onJoinCode(joinInput.trim());
                      onNavigate('join');
                    }}
                    className={`whitespace-nowrap flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-colors shadow-sm ${
                      joinInput.trim().length < 4
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                        : 'bg-[#16A34A] hover:bg-[#15803d] text-white'
                    }`}
                  >
                    Join
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  disabled={!selectedGame}
                  onClick={() => setStep(2)}
                  className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white transition-all shadow-md ${
                    !selectedGame
                      ? 'bg-gray-300 cursor-not-allowed shadow-none'
                      : 'bg-[#16A34A] hover:bg-[#15803d] hover:shadow-lg hover:-translate-y-0.5'
                  }`}
                  style={{ fontFamily: 'Chakra Petch, sans-serif' }}
                >
                  Continue <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>

            </div>
          )}

          {step > 1 && selectedGame && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm animate-fade-up">

              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#16A34A]">Step {step} of 4</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{GAME_DETAILS[selectedGame].title}</p>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full mb-6 overflow-hidden">
                <div className="h-full bg-[#16A34A] rounded-full transition-all" style={{ width: `${(step / 4) * 100}%` }} />
              </div>

              {step === 2 && (
                <div>
                  <h2 className="text-2xl font-black text-gray-900 mb-1" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                    Set your wager
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">Pick a mode and how much each player puts in. Winner takes the pot.</p>

                  <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">Game mode</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {modeOptions.map(m => (
                      <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-colors ${
                          activeMode === m ? 'border-[#16A34A] bg-green-50 text-[#16A34A]' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">Wager per player ({CURRENCY})</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {WAGER_PRESETS.map(p => (
                      <button
                        key={p}
                        onClick={() => setWager(p)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-colors ${
                          wager === p ? 'border-[#16A34A] bg-green-50 text-[#16A34A]' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={wager || ''}
                    onChange={e => setWager(Math.max(0, Number(e.target.value)))}
                    placeholder={`Custom amount (min ${MIN_WAGER})`}
                    className="w-full sm:w-64 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-base sm:text-sm outline-none focus:border-[#16A34A] transition-colors"
                  />
                  {wager > 0 && wager < MIN_WAGER && (
                    <p className="text-xs text-red-500 mt-2">Minimum wager is {money(MIN_WAGER)}.</p>
                  )}

                  <div className="mt-6 rounded-2xl bg-gray-50 border border-gray-100 p-4 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600"><span>Your stake</span><span className="font-bold text-gray-900">{money(wager)}</span></div>
                    <div className="flex justify-between text-gray-600"><span>Opponent stake</span><span className="font-bold text-gray-900">{money(wager)}</span></div>
                    <div className="flex justify-between text-gray-600 border-t border-gray-200 pt-2"><span>Total pot</span><span className="font-bold text-gray-900">{money(pot)}</span></div>
                    <div className="flex justify-between text-gray-600"><span>Platform fee ({PLATFORM_FEE * 100}%)</span><span className="font-bold text-gray-900">- {money(fee)}</span></div>
                    <div className="flex justify-between border-t border-gray-200 pt-2"><span className="font-bold text-gray-900">Winner receives</span><span className="font-black text-[#16A34A]">{money(winnerGets)}</span></div>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-3">Funds only lock in escrow once both players press Start.</p>

                  <div className="mt-6 flex items-center justify-between gap-3">
                    <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200">
                      Go Back
                    </button>
                    <button
                      disabled={!canContinueWager}
                      onClick={() => setStep(3)}
                      className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all shadow-md ${
                        canContinueWager ? 'bg-[#16A34A] hover:bg-[#15803d]' : 'bg-gray-300 cursor-not-allowed shadow-none'
                      }`}
                    >
                      Continue <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="text-2xl font-black text-gray-900 mb-1" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                    Find your opponent
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">Send your challenge straight to a friend.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    <div
                      aria-disabled="true"
                      className="text-left p-4 rounded-2xl border-2 border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed select-none"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-black text-gray-900 text-sm">Open Match</p>
                        <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                          Coming Soon
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Shows up in the lobbies so any verified player can accept.</p>
                    </div>
                    <button
                      onClick={() => setMatchType('private')}
                      className={`text-left p-4 rounded-2xl border-2 transition-colors ${
                        matchType === 'private' ? 'border-[#16A34A] bg-green-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-black text-gray-900 text-sm mb-1">Private Match</p>
                      <p className="text-xs text-gray-500">You get a link to send to a friend. Only they can join.</p>
                    </button>
                  </div>

                  {fields && (
                    <div className="mb-6">
                      <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">
                        Your {GAME_DETAILS[selectedGame].title} details
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">{fields.uidLabel}</label>
                          <input
                            type="text"
                            value={gameUid}
                            onChange={e => setGameUid(selectedGame === 'CODM' ? e.target.value.replace(/\D/g, '') : e.target.value)}
                            inputMode={selectedGame === 'CODM' ? 'numeric' : 'text'}
                            placeholder="Enter your UID"
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-base sm:text-sm outline-none focus:border-[#16A34A] transition-colors"
                          />
                          <p className="text-[11px] text-gray-400 mt-1">{fields.uidHint}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">{fields.nameLabel}</label>
                          <input
                            type="text"
                            value={gameName}
                            onChange={e => setGameName(e.target.value)}
                            placeholder="Exactly as it shows in the game"
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-base sm:text-sm outline-none focus:border-[#16A34A] transition-colors"
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Match rules <span className="text-gray-400 font-medium">(optional)</span>
                        </label>
                        <textarea
                          rows={2}
                          value={rules}
                          onChange={e => setRules(e.target.value)}
                          placeholder="e.g. Agreed map, time limit, or score to win"
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-base sm:text-sm outline-none focus:border-[#16A34A] transition-colors resize-none"
                        />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-2">Your ID is saved with the match so it can be checked if there's a dispute.</p>
                    </div>
                  )}

                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600"><span>Game</span><span className="font-bold text-gray-900">{GAME_DETAILS[selectedGame].title}</span></div>
                    <div className="flex justify-between text-gray-600"><span>Mode</span><span className="font-bold text-gray-900">{activeMode}</span></div>
                    <div className="flex justify-between text-gray-600"><span>Wager per player</span><span className="font-bold text-gray-900">{money(wager)}</span></div>
                    <div className="flex justify-between border-t border-gray-200 pt-2"><span className="font-bold text-gray-900">Winner receives</span><span className="font-black text-[#16A34A]">{money(winnerGets)}</span></div>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-3">
                    <button onClick={() => setStep(2)} className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200">
                      Go Back
                    </button>
                    <button
                      disabled={!canCreate}
                      onClick={() => setStep(4)}
                      className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all shadow-md ${
                        canCreate ? 'bg-[#16A34A] hover:bg-[#15803d]' : 'bg-gray-300 cursor-not-allowed shadow-none'
                      }`}
                    >
                      Create Private Match
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-9 h-9 rounded-full bg-green-50 border border-green-100 flex items-center justify-center text-[#16A34A] shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                      Match created
                    </h2>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">Send this link to your friend. Only they can join this match.</p>

                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 flex items-center gap-2 mb-3">
                    <p className="flex-1 min-w-0 truncate text-sm font-bold text-gray-900">{inviteLink}</p>
                    <button
                      onClick={copyLink}
                      className="shrink-0 px-4 py-2 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setHasShared(true)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#1ebe5b] text-white font-bold text-sm transition-colors"
                  >
                    Share on WhatsApp
                  </a>

                  <div className="mt-6 rounded-2xl bg-gray-50 border border-gray-100 p-4 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600"><span>Game</span><span className="font-bold text-gray-900">{GAME_DETAILS[selectedGame].title}</span></div>
                    <div className="flex justify-between text-gray-600"><span>Your ID</span><span className="font-bold text-gray-900">{gameUid}</span></div>
                    <div className="flex justify-between text-gray-600"><span>Wager per player</span><span className="font-bold text-gray-900">{money(wager)}</span></div>
                    <div className="flex justify-between border-t border-gray-200 pt-2"><span className="font-bold text-gray-900">Winner receives</span><span className="font-black text-[#16A34A]">{money(winnerGets)}</span></div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    Waiting for your opponent to accept...
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2">You'll both see each other's profile in the lobby. Your wager only locks in escrow once both players press Start.</p>

                  {showShareWarning && (
                    <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                      <span className="text-xl shrink-0">⚠️</span>
                      <div className="flex-1">
                        <p className="text-sm font-black text-amber-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>You haven't shared the link yet</p>
                        <p className="text-xs text-amber-800 mt-0.5 mb-3">If your friend doesn't have the link, they can't join. Copy it or send it on WhatsApp first — or continue if you've already sent it another way.</p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={copyLink}
                            className="px-4 py-2 rounded-lg bg-white border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 transition-colors"
                          >
                            Copy Link
                          </button>
                          <button
                            onClick={() => {
                              if (selectedGame) {
                                onMatchCreated({ game: selectedGame, mode: activeMode, wager, uid: gameUid.trim(), username: gameName.trim() });
                              }
                              onNavigate('match-lobby');
                            }}
                            className="px-4 py-2 rounded-lg bg-gray-900 text-white text-xs font-bold hover:bg-black transition-colors"
                          >
                            I already shared it — continue
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => {
                        if (!hasShared) {
                          setShowShareWarning(true);
                          return;
                        }
                        if (selectedGame) {
                          onMatchCreated({ game: selectedGame, mode: activeMode, wager, uid: gameUid.trim(), username: gameName.trim() });
                        }
                        onNavigate('match-lobby');
                      }}
                      className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-[#16A34A] hover:bg-[#15803d] transition-all shadow-md"
                    >
                      Go to Match Lobby
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-auto pt-6 flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            <span>ProveIt</span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span>Play Fair. Win Together.</span>
          </div>
          
        </main>
      </div>
    </div>
  );
}