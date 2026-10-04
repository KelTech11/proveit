import { useState } from 'react';
import { Avatar } from '../components/ui';
import { players } from '../data';
import { GAME_DETAILS, GAME_FIELDS, calcPayout, type MatchDraft, type GameType } from './CreateMatch';

const host = players[1];

// Fallback only used if the link's code can't be decoded (e.g. a malformed or test link)
const DEMO = { game: 'CODM' as const, mode: '1v1', wager: 100 };

const money = (n: number) =>
  `GHS ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function decodeMatchCode(raw: string): { game: GameType; mode: string; wager: number } {
  try {
    const cleaned = raw.trim().split('/').filter(Boolean).pop() || '';
    const parsed = JSON.parse(atob(decodeURIComponent(cleaned)));
    if (parsed.g in GAME_DETAILS && typeof parsed.w === 'number' && parsed.w > 0) {
      return { game: parsed.g, mode: parsed.m || GAME_DETAILS[parsed.g as GameType].modes.split(' / ')[0], wager: parsed.w };
    }
  } catch {}
  return DEMO;
}

import { useProfile } from '../profile';

export default function JoinMatch({
  onNavigate,
  code,
  onJoined,
}: {
  onNavigate: (s: string) => void;
  code: string;
  onJoined: (d: MatchDraft) => void;
}) {
  const { profile } = useProfile();
  const match = decodeMatchCode(code);
  const [uid, setUid] = useState(profile.linkedGames[match.game] ?? '');
  const [name, setName] = useState('');

  const money = (n: number) =>
    `${profile.currency} ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Only real invite links work, and only for 10 minutes
  let expired = false;
  let invalid = !code.trim();
  if (code.trim()) {
    try {
      const cleaned = code.trim().split('/').filter(Boolean).pop() || '';
      const parsed = JSON.parse(atob(decodeURIComponent(cleaned)));
      if (parsed && typeof parsed.w === 'number' && parsed.g in GAME_DETAILS) {
        expired = !parsed.t || Date.now() - Number(parsed.t) > 10 * 60 * 1000;
      } else {
        invalid = true;
      }
    } catch {
      invalid = true;
    }
  }

  if (expired || invalid) {
    return (
      <div className="min-h-screen bg-[#F4F7F9] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-5 text-3xl">{invalid ? '🔗' : '⏱️'}</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
          {invalid ? 'Invalid invite link' : 'This link has expired'}
        </h1>
        <p className="text-gray-500 text-sm max-w-sm mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
          {invalid
            ? "That isn't a valid ProveIt invite link. Check it and try again, or ask your friend to send it again."
            : 'Match invite links only work for 10 minutes. Ask your friend to send you a new one.'}
        </p>
        <button
          onClick={() => onNavigate(invalid ? 'back' : 'home')}
          className="px-8 py-3.5 rounded-xl bg-[#16A34A] hover:bg-[#15803d] text-white font-bold text-sm transition-colors"
          style={{ fontFamily: 'Chakra Petch, sans-serif' }}
        >
          {invalid ? 'Try again' : 'Back to ProveIt'}
        </button>
      </div>
    );
  }
  let linkCurrency = '';
  try {
    const cleaned = code.trim().split('/').filter(Boolean).pop() || '';
    linkCurrency = String(JSON.parse(atob(decodeURIComponent(cleaned))).c || '');
  } catch {}

  if (linkCurrency && linkCurrency !== profile.currency) {
    return (
      <div className="min-h-screen bg-[#F4F7F9] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-5 text-3xl">💱</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
          This match is in {linkCurrency}
        </h1>
        <p className="text-gray-500 text-sm max-w-sm mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
          Your wallet is in {profile.currency}. For now you can only join matches played in your own currency.
        </p>
        <button
          onClick={() => onNavigate('back')}
          className="px-8 py-3.5 rounded-xl bg-[#16A34A] hover:bg-[#15803d] text-white font-bold text-sm transition-colors"
          style={{ fontFamily: 'Chakra Petch, sans-serif' }}
        >
          Go back
        </button>
      </div>
    );
  }

  const shownCode = (code.trim().split('/').filter(Boolean).pop() || 'DEMO42').slice(0, 10).toUpperCase();
  const game = GAME_DETAILS[match.game];
  const fields = GAME_FIELDS[match.game];
  const { pot, fee, winnings } = calcPayout(match.wager);
  const canJoin = uid.trim().length >= 6 && name.trim().length >= 2;

  return (
    <div className="min-h-screen bg-[#F4F7F9] text-gray-900 font-sans p-3 sm:p-6 flex flex-col items-center">
      <div className="max-w-[760px] w-full space-y-4 sm:space-y-6">

        {/* Invite banner */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#0B0B0F] border border-gray-800 shadow-lg p-5 sm:p-8 min-h-[200px] flex flex-col justify-end">
          <img src={game.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20 pointer-events-none" />

          <button
            onClick={() => onNavigate('back')}
            className="absolute top-4 left-4 z-10 text-xs font-bold text-gray-200 hover:text-white bg-black/40 backdrop-blur px-3 py-1.5 rounded-full border border-white/10 transition-colors"
          >
            ← Back
          </button>
          <span className="absolute top-4 right-4 z-10 text-[10px] font-black tracking-widest text-[#4ADE80] bg-[#16A34A]/20 border border-[#16A34A]/40 px-3 py-1 rounded-full">
            CODE {shownCode}
          </span>

          <div className="relative z-10 flex items-center gap-4">
            <Avatar color={host.color} country={host.country} name={host.name} size="lg" />
            <div className="min-w-0">
              <p className="text-[#4ADE80] text-[10px] sm:text-[11px] font-black uppercase tracking-widest mb-1">You've been challenged</p>
              <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight truncate" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                {host.name}
              </h1>
              <p className="text-gray-300 text-xs sm:text-sm font-medium">@{host.username} wants to play {game.title}</p>
            </div>
          </div>
        </div>

        {/* Match details */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3">Match details</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><span>Game</span><span className="font-bold text-gray-900">{game.title}</span></div>
            <div className="flex justify-between text-gray-600"><span>Mode</span><span className="font-bold text-gray-900">{match.mode}</span></div>
            <div className="flex justify-between text-gray-600"><span>Your stake</span><span className="font-bold text-gray-900">{money(match.wager)}</span></div>
            <div className="flex justify-between text-gray-600 border-t border-gray-100 pt-2"><span>Total pot</span><span className="font-bold text-gray-900">{money(pot)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Platform fee</span><span className="font-bold text-gray-900">- {money(fee)}</span></div>
            <div className="flex justify-between border-t border-gray-100 pt-2">
              <span className="font-bold text-gray-900">Winner receives</span>
              <span className="font-black text-[#16A34A]">{money(winnings)}</span>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-3">Funds only lock in escrow once both players press Start. No cancelling after that.</p>
        </div>

        {/* Your details */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3">Your {game.title} details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">{fields.uidLabel}</label>
              <input
                type="text"
                value={uid}
                onChange={e => setUid(e.target.value)}
                placeholder="Enter your UID"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-base sm:text-sm outline-none focus:border-[#16A34A] transition-colors"
              />
              <p className="text-[11px] text-gray-400 mt-1">{fields.uidHint}</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">{fields.nameLabel}</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Exactly as it shows in the game"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-base sm:text-sm outline-none focus:border-[#16A34A] transition-colors"
              />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-3">Your ID is saved with the match so it can be checked if there's a dispute.</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('back')}
            className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl bg-[#27272A] hover:bg-black text-white font-bold text-sm transition-colors"
            style={{ fontFamily: 'Chakra Petch, sans-serif' }}
          >
            Decline
          </button>
          <button
            disabled={!canJoin}
            onClick={() => {
              onJoined({ game: match.game, mode: match.mode, wager: match.wager, uid: uid.trim(), username: name.trim() });
              onNavigate('match-lobby');
            }}
            className={`flex-1 px-8 py-3.5 rounded-xl font-bold text-sm text-white transition-all shadow-md ${
              canJoin ? 'bg-[#16A34A] hover:bg-[#15803d] hover:-translate-y-0.5' : 'bg-gray-300 cursor-not-allowed shadow-none'
            }`}
            style={{ fontFamily: 'Chakra Petch, sans-serif' }}
          >
            Accept & go to lobby →
          </button>
        </div>
      </div>
    </div>
  );
}