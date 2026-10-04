import { useState, useEffect } from 'react';
import {
  IconAlertTriangle,
  IconCheck,
  IconShield,
  IconClock,
} from '../components/ui';
import { ProfileAvatar as Avatar } from '../avatars';
import { GAME_DETAILS, DEFAULT_DRAFT, calcPayout, type MatchDraft } from './CreateMatch';
import { useProfile } from '../profile';
import { fromGhs } from '../currency';

const REVIEW_WINDOW_SECONDS = 24 * 60 * 60; // 24h target turnaround

type DisputeStage = 'opened' | 'evidence' | 'review' | 'resolved';

export default function Dispute({ onNavigate, matchDraft, onDisputeStatusChange, onWin, onLose, onNotify }: { onNavigate: (s: string) => void; matchDraft: MatchDraft | null; onDisputeStatusChange: (active: boolean) => void; onWin: (amount: number) => void; onLose: () => void; onNotify: (type: 'dispute_alert', title: string, body: string) => void }) {
  const { profile } = useProfile();
  const me = profile;
  const draft = matchDraft ?? { ...DEFAULT_DRAFT, wager: fromGhs(DEFAULT_DRAFT.wager, profile.currency) };
  const game = GAME_DETAILS[draft.game];

  useEffect(() => {
    onDisputeStatusChange(true);
    return () => onDisputeStatusChange(false);
  }, []);

  const [disputeId] = useState(() => `D-${Math.random().toString(36).slice(2, 7).toUpperCase()}`);
  const [youSubmitted] = useState(true); // you only land here after uploading, so this is always true
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);
  const [outcome, setOutcome] = useState<null | 'won' | 'lost'>(null);

  const [secondsLeft, setSecondsLeft] = useState(REVIEW_WINDOW_SECONDS);
  useEffect(() => {
    const t = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  // Demo-only: simulate the opponent submitting their evidence a bit after you do
  useEffect(() => {
    const t = setTimeout(() => setOpponentSubmitted(true), 6000);
    return () => clearTimeout(t);
  }, []);

  // Demo-only: simulate a decision landing a bit after both sides have evidence in.
  // In the real app this comes from the admin resolving the case, likely via a webhook/poll, not a timer.
  useEffect(() => {
    if (opponentSubmitted && !outcome) {
      const t = setTimeout(() => setOutcome(Math.random() < 0.6 ? 'won' : 'lost'), 15000);
      return () => clearTimeout(t);
    }
  }, [opponentSubmitted, outcome]);

  const stage: DisputeStage = outcome ? 'resolved' : !opponentSubmitted ? 'evidence' : 'review';

  useEffect(() => {
    if (outcome) onDisputeStatusChange(false);
  }, [outcome]);

  // Settle the money when the decision lands
  useEffect(() => {
    if (!outcome) return;
    if (outcome === 'won') {
      onWin(calcPayout(draft.wager).winnings);
    } else {
      onLose();
    }
    onNotify(
      'dispute_alert',
      'Dispute resolved',
      outcome === 'won'
        ? 'We confirmed your result. Your winnings were added to your wallet.'
        : "We found in your opponent's favor. Your stake was released to them."
    );
  }, [outcome]);

  const fmtCountdown = (s: number) => {
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${s % 60}s`;
  };

  const STAGES: { key: DisputeStage; label: string; done: boolean }[] = [
    { key: 'opened', label: 'Dispute Opened', done: true },
    { key: 'evidence', label: 'Evidence Collected', done: opponentSubmitted },
    { key: 'review', label: 'Under Review', done: false },
    { key: 'resolved', label: 'Resolved', done: false },
  ];
  const activeIndex = STAGES.findIndex(s => s.key === stage);

  return (
    <div className="min-h-screen bg-[#F4F7F9] text-gray-900 font-sans p-6 lg:p-8 flex flex-col items-center selection:bg-green-200">

      <div className="max-w-[900px] w-full flex flex-col gap-6">

        {/* --- PAGE HEADER --- */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Dispute #{disputeId}</h1>
            </div>
            <p className="text-gray-500 font-semibold text-sm">{game.title} • {draft.mode} • {profile.currency} {draft.wager.toFixed(2)}</p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3 max-w-sm">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <IconShield size={14} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-blue-900 mb-0.5" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Blind review</h4>
              <p className="text-[11px] text-blue-800/80 leading-relaxed font-medium">Neither side can see the other's evidence until our team has reached a decision — this keeps the review fair.</p>
            </div>
          </div>
        </div>

        {(stage === 'evidence' || stage === 'review') && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <p className="text-xs font-semibold text-amber-900">
              Feel free to close this page — we'll email you at the address on your account the moment a decision is made.
            </p>
          </div>
        )}

        {/* --- STATUS TIMELINE --- */}
        <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            {STAGES.map((s, i) => (
              <div key={s.key} className="flex-1 flex flex-col items-center relative">
                {i > 0 && (
                  <div
                    className={`absolute top-3.5 right-1/2 w-full h-0.5 -z-0 ${i <= activeIndex ? 'bg-[#16A34A]' : 'bg-gray-200'}`}
                  />
                )}
                <div
                  className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 ${
                    i < activeIndex || s.done
                      ? 'bg-[#16A34A] border-[#16A34A] text-white'
                      : i === activeIndex
                      ? 'bg-white border-[#16A34A] text-[#16A34A]'
                      : 'bg-white border-gray-200 text-gray-300'
                  }`}
                >
                  {i < activeIndex || s.done ? <IconCheck size={14} /> : i + 1}
                </div>
                <p className={`text-[10px] font-bold text-center mt-2 ${i <= activeIndex ? 'text-gray-900' : 'text-gray-400'}`}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* --- EVIDENCE SECTION --- */}
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 flex flex-col xl:flex-row overflow-hidden">

          <div className="flex-1 p-6 lg:p-8 flex flex-col">

            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-gray-900 text-lg" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Evidence Status</h3>
              <span className="bg-red-50 text-red-600 border border-red-100 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                {stage === 'evidence' ? 'Waiting on opponent' : 'Under Review'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Your evidence — visible to you */}
              <div>
                <p className="text-[11px] font-black text-[#16A34A] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22V8M5 12H2a10 10 0 0 0 20 0h-3"/></svg> Your Evidence
                </p>
                <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-green-50 text-[#16A34A] flex items-center justify-center shrink-0">
                    <IconCheck size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Submitted</p>
                    <p className="text-[11px] text-gray-500">Screen recording + match history received</p>
                  </div>
                </div>
              </div>

              {/* Opponent evidence — status only, content hidden on purpose */}
              <div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <IconShield size={14} /> Opponent Evidence
                </p>
                <div className={`border rounded-2xl p-4 flex items-center gap-3 shadow-sm ${opponentSubmitted ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${opponentSubmitted ? 'bg-green-50 text-[#16A34A]' : 'bg-amber-50 text-amber-500'}`}>
                    {opponentSubmitted ? <IconCheck size={18} /> : <IconClock size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                      {opponentSubmitted ? 'Submitted' : 'Not submitted yet'}
                    </p>
                    <p className="text-[11px] text-gray-500">Hidden from you until review is complete</p>
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-6 flex items-center gap-2 bg-blue-50/50 border border-blue-100 p-3 rounded-xl">
              <IconShield size={16} className="text-blue-500 shrink-0" />
              <p className="text-[11px] font-semibold text-blue-900">
                {opponentSubmitted
                  ? 'Both players have submitted evidence. Our team is reviewing — you\'ll be notified the moment a decision is made.'
                  : 'Waiting for your opponent to submit their evidence before our team begins review.'}
              </p>
            </div>

          </div>

          {/* Right Side Panel */}
          <div className="w-full xl:w-[280px] border-t xl:border-t-0 xl:border-l border-gray-100 bg-gray-50/30 p-6 flex flex-col gap-6">

            <div>
              <div className="flex items-center gap-2 mb-2 text-gray-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <p className="text-xs font-bold uppercase tracking-wider">Dispute Reason</p>
              </div>
              <p className="text-sm font-bold text-gray-900 mb-1" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Match result mismatch</p>
              <p className="text-[11px] text-gray-500 font-medium">Both players claimed a win.</p>
            </div>

            <div className="h-px bg-gray-200" />

            <div>
              <div className="flex items-center gap-2 mb-2 text-gray-500">
                <Avatar color={me.color} country={me.country} name={me.name} size="sm" />
                <p className="text-xs font-bold uppercase tracking-wider">Players</p>
              </div>
              <p className="text-sm font-bold text-gray-900 mb-1" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{me.name}</p>
              <p className="text-[11px] text-gray-500 font-medium">vs. opponent (hidden pending review)</p>
            </div>

            <div className="h-px bg-gray-200" />

            <div>
              <div className="flex items-center gap-2 mb-2 text-gray-500">
                <IconClock size={16} />
                <p className="text-xs font-bold uppercase tracking-wider">Target Decision</p>
              </div>
              <p className="text-lg font-black text-gray-900 mb-1 tabular" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                {fmtCountdown(secondsLeft)}
              </p>
              <p className="text-[11px] text-gray-500 font-medium">Most disputes resolve in 5–8 hours</p>
            </div>

          </div>

        </div>

        {/* --- RESOLUTION --- */}
        {outcome === 'won' && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-[24px] p-8 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#16A34A] text-white flex items-center justify-center shadow-lg">
              <IconCheck size={28} />
            </div>
            <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Dispute resolved — you won</h2>
            <p className="text-sm text-gray-600 max-w-md">
              Our team reviewed both submissions and confirmed your result. Your winnings have been added to your balance.
            </p>
            <div className="mt-2 bg-white rounded-2xl px-6 py-3 border border-green-100 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Amount credited</p>
              <p className="text-2xl font-black text-[#16A34A]" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                {profile.currency} {calcPayout(draft.wager).winnings.toFixed(2)}
              </p>
            </div>
            <button
              onClick={() => onNavigate('dashboard')}
              className="mt-2 px-8 py-3 rounded-xl font-bold text-white bg-[#16A34A] hover:bg-[#15803d] transition-colors"
              style={{ fontFamily: 'Chakra Petch, sans-serif' }}
            >
              Back to Dashboard
            </button>
          </div>
        )}

        {outcome === 'lost' && (
          <div className="bg-white border border-gray-200 rounded-[24px] p-8 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center">
              <IconShield size={26} />
            </div>
            <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Dispute resolved — opponent's claim upheld</h2>
            <p className="text-sm text-gray-600 max-w-md">
              After reviewing both submissions, our team found in favor of your opponent for this match. If you believe this was a mistake, you can appeal once within 48 hours.
            </p>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-6 py-3 rounded-xl font-bold text-white bg-gray-900 hover:bg-gray-800 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* --- SUPPORT NOTE --- */}
        {(stage === 'evidence' || stage === 'review') && (
          <div className="flex items-center gap-2 text-xs text-gray-500 justify-center">
            <IconAlertTriangle size={14} className="text-amber-500" />
            <span>{profile.currency} {(draft.wager * 2).toFixed(2)} is held in escrow until this dispute is resolved. No action needed from you right now.</span>
          </div>
        )}

      </div>
    </div>
  );
}