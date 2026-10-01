import { useState } from 'react';
import {
  StatCard, Button, Card,
  IconAlertTriangle, IconCheck, IconShield, IconArrowRight, IconClock,
} from '../../components/ui';
import { adminStats } from '../../data';

const activityFeed = [
  { id: 1, type: 'resolve', icon: '✅', text: 'Match M-7831 resolved — SeunPro wins NGN 29,000', time: '4 min ago' },
  { id: 2, type: 'dispute', icon: '🚨', text: 'Dispute raised — M-7835, CODM, GHS 200', time: '12 min ago' },
  { id: 3, type: 'kyc', icon: '🆔', text: 'KYC submitted — AbenaElite, GH', time: '28 min ago' },
  { id: 4, type: 'resolve', icon: '✅', text: 'Match M-7839 completed — TundeSniper vs EmkaBeast', time: '41 min ago' },
  { id: 5, type: 'payout', icon: '💸', text: 'Withdrawal processed — GHS 870 to MTN MM', time: '1h ago' },
  { id: 6, type: 'dispute', icon: '🚨', text: 'Dispute raised — M-7821, eFootball, NGN 50K', time: '2h ago' },
  { id: 7, type: 'kyc', icon: '🆔', text: 'KYC approved — TundeSniper, NG', time: '3h ago' },
  { id: 8, type: 'resolve', icon: '✅', text: 'Match M-7815 resolved — KwameGOAT wins GHS 570', time: '4h ago' },
];

export default function AdminOverview({ onNavigate }: { onNavigate: (s: string) => void }) {
  const { chartData } = adminStats;
  const maxMatches = Math.max(...chartData.map(d => d.matches));

  const svgWidth = 400;
  const svgHeight = 200;
  const paddingLeft = 48;
  const paddingRight = 16;
  const paddingTop = 16;
  const paddingBottom = 36;
  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;
  const barW = (chartW / chartData.length) * 0.55;
  const gap = (chartW / chartData.length) * 0.45;

  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const yLabels = [0, Math.round(maxMatches * 0.25), Math.round(maxMatches * 0.5), Math.round(maxMatches * 0.75), maxMatches];

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
            Operations Overview
          </h1>
          <p className="text-sm text-gray-500 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
            Thursday, 25 Sep 2025
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate('dispute-queue')}
          >
            <IconAlertTriangle size={16} />
            Resolve Disputes (42)
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigate('user-profile')}
          >
            <IconShield size={16} />
            Review KYC (18)
          </Button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Escrow Volume"
          value="GHS 480K"
          trend="+12.4%"
          subtext="this week"
        />
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em' }}>
            Pending Disputes
          </p>
          <p className="text-2xl font-bold tabular text-amber-500" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>42</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-semibold text-red-500">+8</span>
            <p className="text-xs text-gray-400">since yesterday</p>
          </div>
        </div>
        <StatCard
          label="KYC Queue"
          value="18"
          trend="-3"
          subtext="resolved today"
        />
        <StatCard
          label="Matches Settled"
          value="2,340"
          trend="+187"
          subtext="today"
          accent
        />
      </div>

      {/* Chart + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar Chart */}
        <Card className="lg:col-span-2 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
            Match Volume — Last 7 Days
          </h2>
          <div className="overflow-x-auto no-scroll">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              width="100%"
              style={{ minWidth: 300 }}
              aria-label="Match volume bar chart for the last 7 days"
            >
              {/* Y-axis grid lines + labels */}
              {yLabels.map((val) => {
                const y = paddingTop + chartH - (val / maxMatches) * chartH;
                return (
                  <g key={val}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={svgWidth - paddingRight}
                      y2={y}
                      stroke="#E5E7EB"
                      strokeWidth={1}
                    />
                    <text
                      x={paddingLeft - 6}
                      y={y + 4}
                      textAnchor="end"
                      fontSize={9}
                      fill="#9CA3AF"
                      fontFamily="Inter, sans-serif"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Bars */}
              {chartData.map((d, i) => {
                const slotW = chartW / chartData.length;
                const x = paddingLeft + i * slotW + (slotW - barW) / 2;
                const barH = (d.matches / maxMatches) * chartH;
                const y = paddingTop + chartH - barH;
                const isHovered = hoveredBar === i;

                return (
                  <g key={d.day}>
                    <rect
                      x={x}
                      y={y}
                      width={barW}
                      height={barH}
                      rx={4}
                      fill={isHovered ? '#15803D' : '#16A34A'}
                      opacity={isHovered ? 1 : 0.82}
                      style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
                      onMouseEnter={() => setHoveredBar(i)}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                    {isHovered && (
                      <g>
                        <rect
                          x={x + barW / 2 - 22}
                          y={y - 22}
                          width={44}
                          height={18}
                          rx={4}
                          fill="#111827"
                        />
                        <text
                          x={x + barW / 2}
                          y={y - 9}
                          textAnchor="middle"
                          fontSize={9}
                          fill="white"
                          fontFamily="Chakra Petch, sans-serif"
                          fontWeight="600"
                        >
                          {d.matches}
                        </text>
                      </g>
                    )}
                    {/* Day label */}
                    <text
                      x={x + barW / 2}
                      y={svgHeight - 10}
                      textAnchor="middle"
                      fontSize={10}
                      fill="#6B7280"
                      fontFamily="Inter, sans-serif"
                    >
                      {d.day}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="flex items-center gap-4 mt-2 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-green-600" />
              <span className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>Matches</span>
            </div>
            <p className="text-xs text-gray-400 ml-auto" style={{ fontFamily: 'Inter, sans-serif' }}>Hover bars for exact count</p>
          </div>
        </Card>

        {/* Activity Feed */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
              Recent Activity
            </h2>
            <button
              className="text-xs text-green-600 font-semibold hover:text-green-700 flex items-center gap-1"
              style={{ fontFamily: 'Inter, sans-serif' }}
              onClick={() => onNavigate('match-feed')}
            >
              View all <IconArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-1">
            {activityFeed.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 px-2 py-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-default group"
              >
                <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 leading-relaxed line-clamp-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {item.text}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-gray-400 shrink-0">
                  <IconClock size={11} />
                  <span className="text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* System health row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <IconCheck size={16} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                Payment Rails
              </p>
              <p className="text-xs text-green-600" style={{ fontFamily: 'Inter, sans-serif' }}>All systems operational</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <IconCheck size={16} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                Escrow Engine
              </p>
              <p className="text-xs text-green-600" style={{ fontFamily: 'Inter, sans-serif' }}>Healthy · 0 stuck txns</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <IconAlertTriangle size={16} className="text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                KYC Provider
              </p>
              <p className="text-xs text-amber-600" style={{ fontFamily: 'Inter, sans-serif' }}>Elevated latency · 1.4s</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
