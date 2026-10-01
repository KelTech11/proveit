import { useState } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  GameBadge,
  IconAlertTriangle,
  IconCheck,
} from '../components/ui';
import { me, players, formatCurrency } from '../data';
import { GAME_DETAILS, DEFAULT_DRAFT, type MatchDraft } from './CreateMatch';

const opponent = players[2]; // AbenaElite
const baseMatch = {
  id: 'M-7835',
  game: 'CODM' as const,
  gameMode: 'Hardpoint Search',
  wagerAmount: 200,
  currency: 'GHS' as const,
  timeSubmitted: '47 min ago',
};

export default function Dispute({ onNavigate, matchDraft }: { onNavigate: (s: string) => void; matchDraft: MatchDraft | null }) {
  const draft = matchDraft ?? DEFAULT_DRAFT;
  const game = GAME_DETAILS[draft.game];
  const match = { ...baseMatch, game: draft.game, gameMode: draft.mode, wagerAmount: draft.wager };
  const [activeTab, setActiveTab] = useState<'mine' | 'opponent'>('mine');

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <h1
            className="text-lg font-bold text-gray-900"
            style={{ fontFamily: 'Chakra Petch, sans-serif' }}
          >
            Dispute #{match.id}
          </h1>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
            Under Review
          </span>
        </div>
      </header>

      {/* Alert Banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center gap-3">
        <IconAlertTriangle size={18} className="text-amber-600 shrink-0" />
        <p className="text-sm font-medium text-amber-800" style={{ fontFamily: 'Inter, sans-serif' }}>
          Admin is reviewing this dispute. Do not exit the app.
        </p>
      </div>

      <div className="flex-1 px-4 py-5 flex flex-col gap-5 max-w-2xl mx-auto w-full">
        {/* Match Summary Card */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className={`inline-flex items-center font-bold rounded px-2 py-0.5 text-xs ${game.genreColor}`} style={{ fontFamily: 'Chakra Petch, sans-serif', letterSpacing: '0.04em' }}>
              {game.title}
            </span>
            <span className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              Submitted {match.timeSubmitted}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Avatar name={me.name} country={me.country} color={me.color} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                  {me.username}
                </p>
                <p className="text-xs text-gray-400">You</p>
              </div>
            </div>
            <div className="flex flex-col items-center shrink-0">
              <span
                className="text-xs font-bold text-gray-400 uppercase tracking-widest"
                style={{ fontFamily: 'Chakra Petch, sans-serif' }}
              >
                vs
              </span>
              <span
                className="text-base font-bold text-green-600 tabular mt-0.5"
                style={{ fontFamily: 'Chakra Petch, sans-serif' }}
              >
                {formatCurrency(match.wagerAmount, match.currency)}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
              <div className="min-w-0 text-right">
                <p className="text-sm font-semibold text-gray-900 truncate" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                  {opponent.username}
                </p>
                <p className="text-xs text-gray-400">Opponent</p>
              </div>
              <Avatar name={opponent.name} country={opponent.country} color={opponent.color} size="sm" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
            {match.gameMode}
          </p>
        </Card>

        {/* Mobile Tab Switcher */}
        <div className="flex rounded-lg bg-gray-100 p-1 gap-1 sm:hidden">
          <button
            onClick={() => setActiveTab('mine')}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
              activeTab === 'mine'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            style={{ fontFamily: 'Chakra Petch, sans-serif' }}
          >
            My Evidence
          </button>
          <button
            onClick={() => setActiveTab('opponent')}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
              activeTab === 'opponent'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            style={{ fontFamily: 'Chakra Petch, sans-serif' }}
          >
            Opponent's Evidence
          </button>
        </div>

        {/* Evidence Split View */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Player A - Me */}
          <div className={`flex flex-col gap-3 ${activeTab === 'opponent' ? 'hidden sm:flex' : 'flex'}`}>
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
              Your Evidence
            </p>
            {/* Fake Screenshot */}
            <div className="relative rounded-xl overflow-hidden bg-gray-900 aspect-[9/16] w-full flex flex-col">
              {/* Screenshot header overlay */}
              <div className="absolute top-0 left-0 right-0 bg-black/60 px-3 py-2 flex items-center justify-between">
                <span className="text-white text-xs font-bold" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                  {game.title} Match Result
                </span>
                <span className="text-gray-400 text-xs">09:14</span>
              </div>
              {/* Background grid pattern */}
              <div
                className="flex-1 flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
                }}
              >
                {/* Score */}
                <div className="flex flex-col items-center gap-2">
                  <p className="text-6xl font-black text-white tabular" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                    4–2
                  </p>
                  <p className="text-gray-300 text-sm uppercase tracking-widest">Final Score</p>
                </div>
              </div>
              {/* Winner banner */}
              <div className="bg-green-600 px-4 py-3 text-center">
                <span className="text-white font-black text-sm uppercase tracking-widest" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                  Winner — {me.username}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                Uploaded {match.timeSubmitted}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                <IconCheck size={12} />
                Evidence Submitted
              </span>
            </div>
          </div>

          {/* Player B - Opponent */}
          <div className={`flex flex-col gap-3 ${activeTab === 'mine' ? 'hidden sm:flex' : 'flex'}`}>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
              {opponent.username}'s Evidence
            </p>
            {/* Fake Screenshot */}
            <div className="relative rounded-xl overflow-hidden bg-gray-900 aspect-[9/16] w-full flex flex-col">
              {/* Screenshot header overlay */}
              <div className="absolute top-0 left-0 right-0 bg-black/60 px-3 py-2 flex items-center justify-between">
                <span className="text-white text-xs font-bold" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                  {game.title} Match Result
                </span>
                <span className="text-gray-400 text-xs">09:21</span>
              </div>
              {/* Background */}
              <div
                className="flex-1 flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #1a0000 0%, #3d0000 50%, #1a0000 100%)',
                }}
              >
                {/* Score */}
                <div className="flex flex-col items-center gap-2">
                  <p className="text-6xl font-black text-white tabular" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                    3–2
                  </p>
                  <p className="text-gray-300 text-sm uppercase tracking-widest">Final Score</p>
                </div>
              </div>
              {/* Winner banner */}
              <div className="bg-red-600 px-4 py-3 text-center">
                <span className="text-white font-black text-sm uppercase tracking-widest" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                  Winner — {opponent.username}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                Uploaded 31 min ago
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                <IconCheck size={12} />
                Evidence Submitted
              </span>
            </div>
          </div>
        </div>

        {/* Countdown Ring Section */}
        <Card className="p-6 flex flex-col items-center gap-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
            Admin Decision Window
          </p>
          <div className="relative">
            <svg viewBox="0 0 100 100" className="w-32 h-32 -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="4"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#16A34A"
                strokeWidth="4"
                strokeDasharray="283"
                strokeDashoffset="0"
                style={{ animation: 'countdown-ring 66720s linear forwards' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center rotate-90">
              <span
                className="text-xl font-bold text-gray-900 tabular"
                style={{ fontFamily: 'Chakra Petch, sans-serif' }}
              >
                18:32:05
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-500 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
            Time remaining for admin review
          </p>
        </Card>

        {/* Contact Support */}
        <Button variant="ghost" fullWidth onClick={() => {}}>
          Contact Support
        </Button>
      </div>
    </div>
  );
}
