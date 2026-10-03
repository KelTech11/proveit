import { useState, useRef, useEffect } from 'react';
import { Avatar, IconUpload, IconCheck, IconClock, IconAlertTriangle } from '../components/ui';
import { me, players, matches } from '../data';
import { GAME_DETAILS, DEFAULT_DRAFT, calcPayout, type MatchDraft } from './CreateMatch';

const opponent = players[1]; // EmkaBeast

const MATCH_WINDOW_SECONDS = 20 * 60; // 20 min soft window — purely informational

type Claim = null | 'won' | 'lost';

import { useProfile } from '../profile';

export default function ActiveMatch({ onNavigate, matchDraft, onWin, onNotify, onLose }: { onNavigate: (s: string) => void; matchDraft: MatchDraft | null; onWin: (amount: number) => void; onNotify: (type: 'match_invite' | 'dispute_alert', title: string, body: string) => void; onLose: () => void }) {
  const { profile: me } = useProfile();
  const draft = matchDraft ?? DEFAULT_DRAFT;
  const gameMeta = GAME_DETAILS[draft.game];
  const { winnings } = calcPayout(draft.wager);
  const money = (n: number) => `GHS ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const MIN_SHOTS = 2;
  const MAX_SHOTS = 2;
  const [shots, setShots] = useState<{ file: File; url: string }[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploaded = shots.length >= MIN_SHOTS;

  const [myClaim, setMyClaim] = useState<Claim>(null);
  // Mock opponent behavior for the demo — in real backend this comes from the server
  const [opponentClaim, setOpponentClaim] = useState<Claim>(null);

  const [videoFile, setVideoFile] = useState<{ file: File; name: string } | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [secondsLeft, setSecondsLeft] = useState(MATCH_WINDOW_SECONDS);
  useEffect(() => {
    const t = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const timeUp = secondsLeft === 0;

  const isDisputed = myClaim === 'won' && opponentClaim === 'won';

  const handleFiles = (list: FileList | null | undefined) => {
    if (!list) return;
    const room = MAX_SHOTS - shots.length;
    const valid = Array.from(list)
      .filter((f) => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024)
      .slice(0, room);
    setShots((prev) => [...prev, ...valid.map((f) => ({ file: f, url: URL.createObjectURL(f) }))]);
  };

  const handleRemove = (i: number) => {
    URL.revokeObjectURL(shots[i].url);
    setShots((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleVideoFile = (list: FileList | null | undefined) => {
    const f = list?.[0];
    if (!f || !f.type.startsWith('video/')) return;
    setVideoFile({ file: f, name: f.name });
  };

  // Demo-only: simulate the opponent also submitting a claim a few seconds after you do,
  // so the "waiting / dispute" states are visible without a real backend.
  useEffect(() => {
    if (myClaim && !opponentClaim) {
      const t = setTimeout(() => {
        // In this mock, the opponent also claims "won" 70% of the time to surface the dispute flow
        const result: Claim = Math.random() < 0.7 ? 'won' : 'lost';
        setOpponentClaim(result);
        if (myClaim === 'won' && result === 'won') {
          onNotify('dispute_alert', 'Dispute opened', 'Both players claimed a win. Upload your screen recording for review.');
        } else {
          onNotify('match_invite', 'Opponent responded', `${opponent.username} reported ${result === 'won' ? 'a win' : 'a loss'}.`);
        }
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [myClaim, opponentClaim]);

  return (
    <div className="min-h-screen bg-[#F4F7F9] text-gray-900 font-sans p-6 lg:p-8 flex flex-col items-center selection:bg-green-200">
      
      <div className="max-w-[1200px] w-full flex flex-col gap-6">
        
        <div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-900 text-sm font-bold transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Active Match
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* HERO MATCH CARD */}
            <div className="bg-gray-900 rounded-[32px] p-6 lg:p-8 relative overflow-hidden shadow-md text-white flex flex-col">
              
              <div className="absolute inset-0 z-0 opacity-40">
                <img 
                  src={gameMeta.coverUrl} 
                  alt="" 
                  className="w-full h-full object-cover blur-sm scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
              </div>

              <div className="relative z-10 flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-white p-1 mb-2 shadow-lg border border-white/20 overflow-hidden">
                  <img 
                    src={gameMeta.coverUrl} 
                    alt={gameMeta.title} 
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <h2 className="text-xl font-black tracking-tight" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{gameMeta.title}</h2>
                <p className="text-xs font-bold text-amber-400 tracking-widest uppercase mb-1">{draft.mode}</p>
                <p className="text-xs text-gray-300 font-semibold">{draft.mode} <span className="text-gray-500">•</span> {gameMeta.genre}</p>
              </div>

              {/* Players vs Opponent — now with UID shown */}
              <div className="relative z-10 grid grid-cols-3 items-start gap-2 mb-8">
                
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-2">
                    <Avatar color={me.color} country={me.country} name={me.name} size="lg" />
                  </div>
                  <h3 className="font-bold text-sm truncate w-full" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>You</h3>
                  <div className="flex items-center gap-1 text-[11px] text-purple-300 mt-1 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-800/50">
                    Ghana
                  </div>
                  <p className="text-[10px] text-gray-400 font-mono mt-1.5">UID: {draft.uid || '—'}</p>
                </div>

                <div className="flex flex-col items-center justify-center pt-4">
                  <span className="text-3xl font-black italic text-white/80 tracking-tighter" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>VS</span>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-2">
                    <Avatar color={opponent.color} country={opponent.country} name={opponent.name} size="lg" />
                  </div>
                  <h3 className="font-bold text-sm truncate w-full" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{opponent.username}</h3>
                  <div className="flex items-center gap-1 text-[11px] text-purple-300 mt-1 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-800/50">
                    Nigeria
                  </div>
                  <p className="text-[10px] text-gray-400 font-mono mt-1.5">UID: 5537-1182</p>
                </div>

              </div>

              <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10 text-center">
                <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Prize Pool</p>
                  <p className="text-sm font-black text-green-400 tabular" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{money(winnings)}</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-3 border border-white/5 col-span-2 order-first sm:col-span-1 sm:order-none">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Performance</p>
                  <p className="text-sm font-black text-white tabular flex items-center justify-center gap-1.5 whitespace-nowrap" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                    <span>1 Win / 2 Played</span>
                    <span className="text-[10px] bg-green-600 px-1.5 py-0.5 rounded text-white">50%</span>
                  </p>
                </div>
                <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Game Mode</p>
                  <p className="text-sm font-black text-white tabular truncate" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{draft.mode}</p>
                </div>
              </div>

            </div>

            {/* OPPONENT STATUS CARD */}
            <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
              <h3 className="font-black text-gray-900 text-base mb-4" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Match Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">You</p>
                  {!myClaim && <span className="text-xs font-bold text-gray-500">Not submitted yet</span>}
                  {myClaim === 'won' && <span className="text-xs font-black text-green-600 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500"/>Claimed Won</span>}
                  {myClaim === 'lost' && <span className="text-xs font-black text-gray-500 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-400"/>Reported Lost</span>}
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{opponent.username}</p>
                  {!opponentClaim && myClaim && <span className="text-xs font-bold text-amber-600 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"/>Waiting to respond</span>}
                  {!opponentClaim && !myClaim && <span className="text-xs font-bold text-gray-400">Not submitted yet</span>}
                  {opponentClaim === 'won' && <span className="text-xs font-black text-green-600 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500"/>Claimed Won</span>}
                  {opponentClaim === 'lost' && <span className="text-xs font-black text-gray-500 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-400"/>Reported Lost</span>}
                </div>
              </div>

              {isDisputed && (
                <div className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3">
                  <IconAlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-red-700">Both players claimed a win</p>
                    <p className="text-[11px] text-red-600 mt-0.5">This match is now in dispute. Upload your full screen recording below — it goes to manual review, target turnaround under 24 hours.</p>
                  </div>
                </div>
              )}

              {myClaim === 'won' && opponentClaim === 'lost' && (
                <div className="mt-4 p-4 rounded-2xl bg-green-50 border border-green-100 flex items-center gap-3">
                  <IconCheck size={18} className="text-green-600 shrink-0" />
                  <p className="text-xs font-bold text-green-700">Your opponent confirmed your win. Payout is being processed.</p>
                </div>
              )}
            </div>

            {/* MATCH DETAILS CARD */}
            <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
              <h3 className="font-black text-gray-900 text-base mb-4" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Match Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-xs font-bold text-gray-500">Opponent</span>
                  <span className="text-xs font-bold text-gray-900">{opponent.username}</span>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-xs font-bold text-gray-500">Region</span>
                  <span className="text-xs font-bold text-gray-900 flex items-center gap-1">🇳🇬 NG</span>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-xs font-bold text-gray-500">Status</span>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">Verified Pro</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 flex flex-col gap-2">
                <button onClick={() => onNavigate('profile')} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors text-xs font-bold text-gray-700">
                  <span className="flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> View Opponent Profile</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                </button>

                <button onClick={() => onNavigate('rules')} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors text-xs font-bold text-gray-700">
                  <span className="flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> Match Rules</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              </div>

              <div className="mt-6 p-4 rounded-2xl bg-green-50 border border-green-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-green-600 text-white flex items-center justify-center shrink-0">
                  <IconCheck size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Stay Fair. Win Together.</p>
                  <p className="text-[11px] text-gray-600">Follow the rules and keep the community clean.</p>
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: TIMER, UPLOAD & TIMELINE */}
          <div className="flex flex-col gap-6">
            
            {/* Timer Banner — live countdown, soft deadline only */}
            <div className={`rounded-[24px] p-5 shadow-sm flex items-center justify-between text-white transition-colors ${timeUp ? 'bg-red-900' : 'bg-gray-900'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${timeUp ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                  <IconClock size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{timeUp ? 'Overtime' : 'Time Remaining'}</p>
                  <p className={`text-xl font-black tabular ${timeUp ? 'text-red-400' : 'text-green-400'}`} style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                    {timeUp ? `+${mm}:${ss}` : `${mm}:${ss}`}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border ${timeUp ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
                {timeUp ? 'Please finish up' : 'In Progress'}
              </span>
            </div>

            {/* UPLOAD EVIDENCE CARD */}
            <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
              <h3 className="font-black text-gray-900 text-sm mb-3" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Upload Screenshot Evidence</h3>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
              />
              <div className="flex items-start justify-between gap-3 mb-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                <p className="text-[11px] text-gray-600 leading-snug">
                  <span className="font-bold text-gray-900">One screenshot proves a moment. Two prove a match.</span>{' '}
                  Add your final result screen + your match history.
                </p>
                <span className={`text-[10px] font-black px-2 py-1 rounded-full shrink-0 ${uploaded ? 'bg-green-600 text-white' : 'bg-amber-200 text-amber-800'}`}>
                  {shots.length}/{MIN_SHOTS}
                </span>
              </div>
              
              {shots.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {shots.map((s, i) => (
                    <div key={s.url} className="relative h-28 rounded-xl overflow-hidden border border-gray-200 bg-gray-900">
                      <img src={s.url} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover" />
                      <span className="absolute top-1.5 left-1.5 text-[10px] font-black bg-black/60 text-white px-1.5 py-0.5 rounded">{i + 1}</span>
                      <button
                        onClick={() => handleRemove(i)}
                        aria-label="Remove screenshot"
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white text-xs font-bold flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {shots.length < MAX_SHOTS && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={() => setDragging(true)}
                  onDragOver={(e) => e.preventDefault()}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
                  className={`w-full rounded-2xl border-2 border-dashed p-6 flex flex-col items-center gap-2 transition-all ${
                    dragging ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50/50 hover:border-green-400 hover:bg-green-50/30'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-400 mb-1">
                    <IconUpload size={24} className="text-[#16A34A]" />
                  </div>
                  <p className="text-xs font-bold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                    {shots.length === 0 ? 'Tap to upload or drag & drop' : 'Add another screenshot'}
                  </p>
                  <p className="text-[10px] text-gray-400">PNG, JPG up to 10MB</p>
                </button>
              )}
            </div>

            {/* WON / LOST TAP — only shows once evidence is uploaded */}
            {uploaded && !myClaim && (
              <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
                <h3 className="font-black text-gray-900 text-sm mb-1" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>What was the result?</h3>
                <p className="text-[11px] text-gray-500 mb-4">Be honest — your opponent gets to respond, and false claims get flagged.</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMyClaim('won')}
                    className="py-4 rounded-2xl bg-green-50 border-2 border-green-200 hover:border-green-400 transition-colors flex flex-col items-center gap-1.5"
                  >
                    <span className="text-2xl">🏆</span>
                    <span className="text-xs font-black text-green-700">I Won</span>
                  </button>
                  <button
                    onClick={() => { setMyClaim('lost'); onLose(); onNavigate('lost'); }}
                    className="py-4 rounded-2xl bg-gray-50 border-2 border-gray-200 hover:border-gray-400 transition-colors flex flex-col items-center gap-1.5"
                  >
                    <span className="text-2xl">🤝</span>
                    <span className="text-xs font-black text-gray-600">I Lost</span>
                  </button>
                </div>
              </div>
            )}

            {/* DISPUTE VIDEO UPLOAD — only appears if both claim won */}
            {isDisputed && (
              <div className="bg-white rounded-[24px] p-6 border-2 border-red-200 shadow-sm">
                <h3 className="font-black text-red-700 text-sm mb-1" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Dispute Review — Upload Full Video</h3>
                <p className="text-[11px] text-gray-500 mb-4">Both players claimed a win. Upload your full screen recording as final evidence for manual review.</p>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => { handleVideoFile(e.target.files); e.target.value = ''; }}
                />
                {videoFile ? (
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-green-50 border border-green-100">
                    <span className="text-xs font-bold text-green-700 truncate">{videoFile.name}</span>
                    <button onClick={() => setVideoFile(null)} className="text-xs font-bold text-gray-400 hover:text-red-500 shrink-0 ml-2">Remove</button>
                  </div>
                ) : (
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full rounded-2xl border-2 border-dashed border-red-200 bg-red-50/50 hover:border-red-400 hover:bg-red-50 p-6 flex flex-col items-center gap-2 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-red-400 mb-1">
                      <IconUpload size={24} />
                    </div>
                    <p className="text-xs font-bold text-gray-900">Tap to upload screen recording</p>
                    <p className="text-[10px] text-gray-400">MP4, MOV up to 200MB</p>
                  </button>
                )}
                <button
                  disabled={!videoFile}
                  onClick={() => {
                    onNotify('dispute_alert', 'Dispute under review', 'Your recording was submitted. Escrow is held while we review. Target: under 24 hours.');
                    onNavigate('dispute');
                  }}
                  className={`w-full mt-4 py-3 rounded-xl font-bold text-white text-sm transition-colors ${videoFile ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                  Submit for Manual Review
                </button>
              </div>
            )}

            {/* MATCH PROGRESS TIMELINE CARD */}
            <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-gray-900 text-sm" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Match Progress</h3>

              </div>

              <div className="flex flex-col gap-4 relative pl-2 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs shrink-0"><IconCheck size={12} /></div>
                    <span className="text-xs font-bold text-gray-900">Match Started</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold">00:12</span>
                </div>

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs shrink-0"><IconCheck size={12} /></div>
                    <span className="text-xs font-bold text-gray-900">Game in Progress</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold">00:05:22</span>
                </div>

                <div className={`flex items-center justify-between relative z-10 ${uploaded ? '' : 'opacity-40'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${uploaded ? 'bg-green-600 text-white' : 'border-2 border-gray-300 bg-white'}`}>
                      {uploaded && <IconCheck size={12} />}
                    </div>
                    <span className={`text-xs font-bold ${uploaded ? 'text-gray-900' : 'text-gray-500'}`}>Upload Screenshot</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold">{uploaded ? 'Done' : '—'}</span>
                </div>

                <div className={`flex items-center justify-between relative z-10 ${opponentClaim ? '' : 'opacity-40'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${opponentClaim ? 'bg-green-600 text-white' : 'border-2 border-gray-300 bg-white'}`}>
                      {opponentClaim && <IconCheck size={12} />}
                    </div>
                    <span className={`text-xs font-bold ${opponentClaim ? 'text-gray-900' : 'text-gray-500'}`}>Opponent Confirmed</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold">{opponentClaim ? 'Done' : '—'}</span>
                </div>

                <div className="flex items-center justify-between relative z-10 opacity-40">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-white shrink-0" />
                    <span className="text-xs font-bold text-gray-500">Result Payout</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold">—</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* --- BOTTOM SUBMIT BAR --- */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <IconAlertTriangle size={16} className="text-amber-500" />
            <span>Something wrong? <button onClick={() => onNavigate('dispute')} className="text-red-600 font-bold hover:underline">Raise a dispute</button></span>
          </div>

          <button
            disabled={!(uploaded && myClaim === 'won' && opponentClaim === 'lost')}
            onClick={() => {
              onWin(winnings);
              onNavigate('result');
            }}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white text-sm transition-all shadow-md ${
              uploaded && myClaim === 'won' && opponentClaim === 'lost' ? 'bg-[#16A34A] hover:bg-[#15803d]' : 'bg-gray-300 cursor-not-allowed shadow-none'
            }`}
            style={{ fontFamily: 'Chakra Petch, sans-serif' }}
          >
            Claim Win Payout →
          </button>
        </div>

      </div>
    </div>
  );
}