import React, { useState, useEffect } from 'react';
import logo from '../assets/proveit-logo.png';
import { useProfile } from '../profile';
import { fromGhs } from '../currency';

const OPEN_CHALLENGES = [
  { id: 1, game: 'FC Mobile', mode: 'H2H • 90 mins', player: 'Kofi_King', ghs: 450, winRate: '68%', avatar: '🇬🇭' },
  { id: 2, game: 'CODM', mode: '1v1 Killhouse', player: 'GhostNaija', ghs: 220, winRate: '72%', avatar: '🇳🇬' },
  { id: 3, game: 'FC Mobile', mode: 'H2H • 90 mins', player: 'StarBoy_99', ghs: 90, winRate: '54%', avatar: '🇳🇬' },
  { id: 4, game: 'CODM', mode: 'Frontline • Crash', player: 'AccraSniper', ghs: 200, winRate: '61%', avatar: '🇬🇭' },
];

const liveFeeds = (fmt: (g: number) => string) => [
  `Chidi_B just won ${fmt(440)} in CODM`,
  `Kwame_Pro just withdrew ${fmt(1200)}`,
  `New FC Mobile high-roller lobby opened: ${fmt(1000)}`,
];

// Swapped the 2nd and 4th links for entirely new, stable Unsplash IDs
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200", // Esports Arena
  "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1200", // NEW: Neon Controller
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200", // RGB Setup
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200", // NEW: Retro Neon Console
  "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1200"  // Arcade Room
];

export default function Home({ onNavigate }: { onNavigate: (s: string) => void }) {
  const { profile } = useProfile();
  const cur = profile.currency;
  const fmt = (g: number) =>
    `${cur} ${fromGhs(g, cur).toLocaleString('en-US', cur === 'GHS' ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : undefined)}`;
  const feeds = liveFeeds(fmt);
  useEffect(() => {
    const styleId = 'proveit-marquee-keyframes';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);
  const [activeTab, setActiveTab] = useState('all');
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prevIndex) => (prevIndex + 1) % HERO_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-gray-900 selection:bg-green-200 selection:text-green-900 font-sans pb-20">
      
      {/* Light Sticky Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm px-4 sm:px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center overflow-hidden shadow-sm">
            <img src={logo} alt="ProveIt" className="w-full h-full object-cover" />
          </div>
          <span className="text-2xl font-black tracking-tight" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
            <span className="text-gray-900">Prove</span><span className="text-[#16A34A]">It</span>
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('login')} className="hidden sm:block text-sm font-bold text-gray-600 hover:text-[#16A34A] transition-colors">
            Log In
          </button>
          <button onClick={() => onNavigate('login')} className="px-6 py-2.5 rounded-lg bg-[#16A34A] hover:bg-[#15803d] text-white text-sm font-bold shadow-[0_4px_14px_rgba(22,163,74,0.3)] transition-all uppercase tracking-wide" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
            Sign Up
          </button>
        </div>
      </header>

      {/* Live Action Ticker */}
      <div className="w-full bg-gray-900 text-white border-b border-gray-800 py-2.5 overflow-hidden flex items-center shadow-inner">
        <div className="flex animate-[marquee_20s_linear_infinite] whitespace-nowrap">
          {[...feeds, ...feeds].map((feed, i) => (
            <span key={i} className="text-xs font-semibold mx-8 flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              {feed}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-28 space-y-8">
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Live Lobbies</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200 transition-all text-left group">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 rounded-full bg-blue-500"></div>
                    <span className="font-bold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>FC Mobile</span>
                  </div>
                  <span className="text-xs font-bold text-green-700 bg-green-200/50 px-2 py-1 rounded">1.2k Live</span>
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-lg bg-white border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-all text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 rounded-full bg-orange-500"></div>
                    <span className="font-bold text-gray-600 group-hover:text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>CODM</span>
                  </div>
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">856 Live</span>
                </button>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-br from-green-50 to-white border border-green-200 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-2" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>ProveIt Pro</h4>
              <p className="text-xs text-gray-600 mb-4 leading-relaxed">Join the verified league for higher wager limits and zero withdrawal fees.</p>
              <button className="w-full py-2.5 bg-white rounded-lg text-xs font-bold text-[#16A34A] border border-[#16A34A] hover:bg-[#16A34A] hover:text-white transition-colors">Get Verified</button>
            </div>
          </div>
        </aside>

        {/* Center Main Content */}
        <main className="flex-1">
          {/* HERO SECTION */}
          <div className="relative rounded-2xl overflow-hidden mb-8 bg-white border border-gray-200 shadow-xl min-h-[420px] flex items-center">
            
            <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[70%] z-0">
              {HERO_IMAGES.map((img, idx) => (
                <div 
                  key={idx}
                  className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out ${currentImage === idx ? 'opacity-100' : 'opacity-0'}`}
                  style={{ backgroundImage: `url(${img})` }}
                ></div>
              ))}
              <div className="absolute inset-y-0 left-0 w-[50%] bg-gradient-to-r from-white via-white/80 to-transparent"></div>
            </div>
            
            <div className="relative z-20 p-6 sm:p-10 w-full sm:w-[60%]">
              <div className="inline-block px-3 py-1 mb-4 rounded-full bg-green-100 border border-green-200 text-xs font-bold tracking-wide text-green-800">
                ⚡ 100% SECURE ESCROW
              </div>
              <h1 className="text-4xl sm:text-6xl font-black text-gray-900 mb-3 tracking-tight leading-tight" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                You dey claim? <br/>
                <span className="text-[#16A34A]">
                  Prove am.
                </span>
              </h1>
              <p className="text-gray-800 text-sm sm:text-base font-semibold mb-8 max-w-md" style={{ fontFamily: 'Inter, sans-serif' }}>
                The premier skill-based wagering arena. Lock your funds in escrow, defeat your opponent, and withdraw cash instantly.
              </p>
              <button onClick={() => onNavigate('login')} className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#16A34A] hover:bg-[#15803d] text-white font-black shadow-[0_4px_20px_rgba(22,163,74,0.4)] transition-all hover:-translate-y-0.5 uppercase tracking-wider text-sm" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                Create Wager
              </button>
            </div>
          </div>

          {/* Action Tabs */}
          <div className="flex gap-2 border-b border-gray-300 mb-6 overflow-x-auto pb-px scrollbar-hide">
            {['all', 'fc_mobile', 'codm', 'high_roller'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-bold transition-all whitespace-nowrap border-b-2 ${activeTab === tab ? 'text-[#16A34A] border-[#16A34A] bg-white' : 'text-gray-500 border-transparent hover:text-gray-800 hover:bg-gray-50'}`}
                style={{ fontFamily: 'Chakra Petch, sans-serif' }}
              >
                {tab === 'all' ? 'All Open Matches' : tab === 'high_roller' ? 'High Rollers 💰' : tab.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>

          {/* Match Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {OPEN_CHALLENGES.map(challenge => (
              <div key={challenge.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[#16A34A] hover:shadow-lg transition-all group relative overflow-hidden flex flex-col justify-between">
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded mb-2 inline-block">
                        {challenge.game} • {challenge.mode}
                      </span>
                      <h4 className="font-bold text-gray-900 text-xl flex items-center gap-2 mt-1" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                        {challenge.player} <span className="text-base">{challenge.avatar}</span>
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 font-medium">Win Rate: <span className={parseInt(challenge.winRate) > 65 ? 'text-green-600 font-bold' : 'text-gray-600'}>{challenge.winRate}</span></p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">To Win</p>
                      <p className="text-2xl font-black text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{fmt(challenge.ghs)}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => onNavigate('login')}
                    className="w-full bg-gray-50 hover:bg-[#16A34A] text-gray-700 hover:text-white py-3 rounded-lg font-bold transition-colors uppercase tracking-widest text-xs border border-gray-200 group-hover:border-transparent"
                    style={{ fontFamily: 'Chakra Petch, sans-serif' }}
                  >
                    Accept Challenge
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center pb-8">
             <button onClick={() => onNavigate('login')} className="text-gray-500 font-bold hover:text-[#16A34A] transition-colors text-sm" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
               Log in to view all 142 open challenges &rarr;
             </button>
          </div>
        </main>
      </div>
    </div>
  );
}