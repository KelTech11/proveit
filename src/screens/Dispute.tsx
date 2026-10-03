import { useState } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  GameBadge,
  IconAlertTriangle,
  IconCheck,
  IconShield,
  IconClock,
} from '../components/ui';
import { me, players, formatCurrency } from '../data';
import { GAME_DETAILS, DEFAULT_DRAFT, type MatchDraft } from './CreateMatch';

const opponent = players[2]; // AbenaElite
const baseMatch = {
  id: 'M-7835',
  game: 'CODM' as const,
  gameMode: '1v1 Killhouse',
  wagerAmount: 225.00,
  currency: 'GHS' as const,
  timeSubmitted: '47 min ago',
};

export default function Dispute({ onNavigate, matchDraft }: { onNavigate: (s: string) => void; matchDraft: MatchDraft | null }) {
  const draft = matchDraft ?? DEFAULT_DRAFT;
  const game = GAME_DETAILS[draft.game];
  const match = { ...baseMatch, game: draft.game, gameMode: draft.mode, wagerAmount: draft.wager };

  return (
    <div className="min-h-screen bg-[#F4F7F9] text-gray-900 font-sans p-6 lg:p-8 flex flex-col items-center selection:bg-green-200">
      
      {/* --- CONTENT WRAPPER --- */}
      <div className="max-w-[1200px] w-full flex flex-col gap-6">
        
        {/* --- PAGE HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Disputes</h1>
            </div>
            <p className="text-gray-500 font-semibold text-sm">Fair reviews. Real evidence. Better matches.</p>
          </div>
          
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-start gap-3 max-w-sm">
            <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <IconCheck size={14} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-green-900 mb-0.5" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>You're protected!</h4>
              <p className="text-[11px] text-green-800/80 leading-relaxed font-medium">Our dispute system ensures fair play and secure payouts for all players.</p>
            </div>
          </div>
        </div>

        {/* --- TABS --- */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-4 overflow-x-auto hide-scrollbar">
          <button className="bg-[#16A34A] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2 whitespace-nowrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            Active (2)
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse ml-1" />
          </button>
          <button className="bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2 whitespace-nowrap transition-colors">
            <IconCheck size={16} /> Resolved
          </button>
          <button className="bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2 whitespace-nowrap transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> All
          </button>
        </div>

        {/* --- DISPUTE LIST --- */}
        <div className="flex flex-col gap-6">
          
          {/* PRIMARY ACTIVE DISPUTE CARD */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 flex flex-col xl:flex-row overflow-hidden">
            
            {/* Left Main Section */}
            <div className="flex-1 p-6 lg:p-8 flex flex-col">
              
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-black text-gray-900 text-lg" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Dispute #{match.id}</h3>
                      <span className="bg-red-50 text-red-600 border border-red-100 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">Under Review</span>
                    </div>
                    <p className="text-xs text-gray-500 font-semibold">Created {match.timeSubmitted} <span className="mx-1.5">•</span> Call of Duty: Mobile</p>
                  </div>
                </div>
                <button className="text-xs font-bold text-gray-900 hover:text-[#16A34A] flex items-center gap-1 transition-colors self-start sm:self-auto border border-gray-200 sm:border-transparent px-3 py-1.5 sm:p-0 rounded-lg sm:rounded-none bg-gray-50 sm:bg-transparent">
                  View Details <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>

              {/* Match Versus Row */}
              <div className="flex items-center justify-between mb-8 px-2 sm:px-6">
                <div className="flex items-center gap-3 w-1/3">
                  <div className="relative shrink-0">
                    <Avatar color={me.color} country={me.country} name={me.name} size="md" />
                  </div>
                  <div className="min-w-0 hidden sm:block">
                    <p className="font-bold text-gray-900 text-sm truncate" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{me.name}</p>
                    <p className="text-xs text-gray-400 font-semibold">You</p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center w-1/3 shrink-0">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">VS</span>
                  <span className="font-black text-[#16A34A] text-lg sm:text-xl tabular" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>GHS {match.wagerAmount.toFixed(2)}</span>
                  <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mt-0.5">1v1</span>
                </div>

                <div className="flex items-center justify-end gap-3 w-1/3 text-right">
                  <div className="min-w-0 hidden sm:block">
                    <p className="text-xs text-gray-400 font-semibold mb-0.5">Submitted 42 min ago</p>
                    <p className="font-bold text-gray-900 text-sm truncate" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{opponent.username}</p>
                    <p className="text-xs text-gray-400 font-semibold">Opponent</p>
                  </div>
                  <div className="relative shrink-0">
                    <Avatar color={opponent.color} country={opponent.country} name={opponent.name} size="md" />
                  </div>
                </div>
              </div>

              {/* Evidence Video Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-auto">
                
                {/* Your Evidence */}
                <div>
                  <p className="text-[11px] font-black text-[#16A34A] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22V8M5 12H2a10 10 0 0 0 20 0h-3"/></svg> Your Evidence
                  </p>
                  <div className="bg-white border border-gray-200 rounded-2xl p-2.5 flex items-center gap-4 shadow-sm hover:border-green-300 transition-colors group cursor-pointer">
                    <div className="w-24 sm:w-32 aspect-video bg-gray-900 rounded-xl relative overflow-hidden shrink-0">
                      <img src="https://preview.redd.it/new-codm-app-store-logo-v0-leozc027n4vg1.jpg?width=640&crop=smart&auto=webp&s=6130d7db8d35a0cc4aee316dffff8b4889eca7db" alt="Evidence" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/40">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" className="ml-0.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        </div>
                      </div>
                      <span className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">09:14</span>
                    </div>
                    <div className="min-w-0 pr-2">
                      <p className="text-sm font-bold text-gray-900 truncate mb-0.5" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Gameplay Recording</p>
                      <p className="text-[10px] text-gray-500 font-medium truncate mb-2">Call of Duty: Mobile</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> 4.2 MB</span>
                        <span className="text-[9px] font-bold text-green-700 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded flex items-center gap-1"><IconCheck size={10} /> Verified</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Opponent Evidence */}
                <div>
                  <p className="text-[11px] font-black text-red-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg> {opponent.username}'s Evidence
                  </p>
                  <div className="bg-red-50/30 border border-red-100 rounded-2xl p-2.5 flex items-center gap-4 shadow-sm hover:border-red-300 transition-colors group cursor-pointer">
                    <div className="w-24 sm:w-32 aspect-video bg-gray-900 rounded-xl relative overflow-hidden shrink-0">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" className="ml-0.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        </div>
                      </div>
                      <span className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">09:21</span>
                    </div>
                    <div className="min-w-0 pr-2">
                      <p className="text-sm font-bold text-gray-900 truncate mb-0.5" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Gameplay Recording</p>
                      <p className="text-[10px] text-gray-500 font-medium truncate mb-2">Call of Duty: Mobile</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-bold text-gray-400 bg-white border border-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> 3.8 MB</span>
                        <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-1"><IconCheck size={10} /> Pending Review</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Status Note */}
              <div className="mt-6 flex items-center gap-2 bg-blue-50/50 border border-blue-100 p-3 rounded-xl">
                <IconShield size={16} className="text-blue-500 shrink-0" />
                <p className="text-[11px] font-semibold text-blue-900">Both players have submitted evidence. Please wait for our team to review.</p>
              </div>

            </div>

            {/* Right Side Panel (Status Details) */}
            <div className="w-full xl:w-[280px] border-t xl:border-t-0 xl:border-l border-gray-100 bg-gray-50/30 p-6 flex flex-col gap-6">
              
              <div>
                <div className="flex items-center gap-2 mb-2 text-gray-500">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  <p className="text-xs font-bold uppercase tracking-wider">Dispute Reason</p>
                </div>
                <p className="text-sm font-bold text-gray-900 mb-1" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Match result mismatch</p>
                <p className="text-[11px] text-gray-500 font-medium">Winner claims the result is fake.</p>
              </div>

              <div className="h-px bg-gray-200" />

              <div>
                <div className="flex items-center gap-2 mb-2 text-gray-500">
                  <IconClock size={16} />
                  <p className="text-xs font-bold uppercase tracking-wider">Status</p>
                </div>
                <p className="text-sm font-bold text-gray-900 mb-1" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Under Review</p>
                <p className="text-[11px] text-gray-500 font-medium">Our team is checking the evidence.</p>
              </div>

              <div className="h-px bg-gray-200" />

              <div>
                <div className="flex items-center gap-2 mb-2 text-gray-500">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  <p className="text-xs font-bold uppercase tracking-wider">Time Remaining</p>
                </div>
                <p className="text-lg font-black text-gray-900 mb-1 tabular" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>1d 12h 34m</p>
                <p className="text-[11px] text-gray-500 font-medium">to reach a decision</p>
              </div>

            </div>

          </div>

          {/* SECONDARY PENDING DISPUTE CARD */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 flex flex-col xl:flex-row overflow-hidden opacity-75 hover:opacity-100 transition-opacity">
            
            {/* Left Main Section */}
            <div className="flex-1 p-6 flex flex-col justify-center">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                <div className="flex items-start sm:items-center gap-3 w-full sm:w-1/3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-black text-gray-900 text-base truncate" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Dispute #M-7812</h3>
                      <span className="bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">Waiting for Opponent</span>
                    </div>
                    <p className="text-[11px] text-gray-500 font-semibold truncate">Created 2 hours ago <span className="mx-1">•</span> FC Mobile</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-center w-full sm:w-1/3 px-4 sm:px-0">
                  <div className="flex items-center gap-2">
                    <Avatar color={me.color} country={me.country} name="DarkRider" size="sm" />
                    <div className="hidden sm:block">
                      <p className="font-bold text-gray-900 text-[11px] truncate" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>DarkRider</p>
                      <p className="text-[9px] text-gray-400 font-semibold">You</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center px-4">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">VS</span>
                    <span className="font-black text-[#16A34A] text-sm tabular" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>GHS 150.00</span>
                    <span className="text-[9px] text-gray-500 font-semibold uppercase tracking-widest mt-0.5">1v1</span>
                  </div>

                  <div className="flex items-center gap-2 text-right">
                    <div className="hidden sm:block">
                      <p className="font-bold text-gray-900 text-[11px] truncate" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Opponent</p>
                      <p className="text-[9px] text-gray-400 font-semibold">KobbyFifa</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold relative shrink-0">
                      KF
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-white border border-gray-200 rounded-full flex items-center justify-center text-[6px]">🇬🇭</span>
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-1/3 flex justify-end">
                  <button className="text-[11px] font-bold text-gray-900 hover:text-[#16A34A] flex items-center gap-1 transition-colors border border-gray-200 sm:border-transparent px-3 py-1.5 sm:p-0 rounded-lg sm:rounded-none bg-gray-50 sm:bg-transparent">
                    View Details <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>

              </div>

              {/* Status Note (Bottom of left section) */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-start gap-3">
                <IconClock size={16} className="text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-gray-900 mb-0.5">Waiting for opponent to submit evidence</p>
                  <p className="text-[10px] text-gray-500 font-medium">The match result has been reported. We're waiting for the other player to upload their proof.</p>
                </div>
              </div>
            </div>

            {/* Right Side Panel (Status Details) */}
            <div className="w-full xl:w-[280px] border-t xl:border-t-0 xl:border-l border-gray-100 bg-gray-50/30 p-6 flex flex-col justify-center">
              <div>
                <div className="flex items-center gap-2 mb-1.5 text-gray-500">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  <p className="text-[11px] font-bold uppercase tracking-wider">Time Remaining</p>
                </div>
                <p className="text-base font-black text-gray-900 mb-0.5 tabular" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>23h 17m</p>
                <p className="text-[10px] text-gray-500 font-medium">to submit evidence</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}