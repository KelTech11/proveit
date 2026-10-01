import { Avatar } from '../components/ui';
import { players, formatCurrency } from '../data';

const opponent = players[1]; // EmkaBeast

const KYC_LABEL = { verified: 'Verified', basic: 'Basic', none: 'Unverified' } as const;

export default function OpponentProfile({ onNavigate }: { onNavigate: (s: string) => void }) {
  const total = opponent.wins + opponent.losses;
  const winRate = total ? Math.round((opponent.wins / total) * 100) : 0;
  const joined = new Date(opponent.joinedAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

  const stats = [
    { label: 'Rating', value: opponent.rating.toLocaleString() },
    { label: 'Win Rate', value: `${winRate}%` },
    { label: 'Wins', value: String(opponent.wins) },
    { label: 'Losses', value: String(opponent.losses) },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7F9] text-gray-900 p-6 lg:p-8 flex flex-col items-center">
      <div className="max-w-[720px] w-full flex flex-col gap-6">

        <div>
          <button
            onClick={() => onNavigate('active-match')}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-900 text-sm font-bold transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Opponent Profile
          </button>
        </div>

        {/* Header card */}
        <div className="bg-gray-900 text-white rounded-[32px] p-6 lg:p-8 flex flex-col items-center text-center shadow-md">
          <div className="relative mb-3">
            <Avatar color={opponent.color} country={opponent.country} name={opponent.name} size="lg" />
          </div>
          <h2 className="text-xl font-black" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{opponent.username}</h2>
          <p className="text-xs text-gray-400 font-semibold mt-1">{opponent.name}</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[11px] text-green-400 bg-green-950/60 px-2.5 py-0.5 rounded-full border border-green-800/50 font-bold">
              KYC: {KYC_LABEL[opponent.kycTier]}
            </span>
            <span className="text-[11px] text-purple-300 bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-800/50 font-bold">
              {opponent.country === 'NG' ? 'Nigeria' : 'Ghana'}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{s.label}</p>
              <p className="text-lg font-black text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Details */}
        <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm flex flex-col gap-3">
          <h3 className="font-black text-gray-900 text-base" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>Details</h3>
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-xs font-bold text-gray-500">Total Volume</span>
            <span className="text-xs font-bold text-gray-900">{formatCurrency(opponent.totalVolume, opponent.currency)}</span>
          </div>
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-xs font-bold text-gray-500">Matches Played</span>
            <span className="text-xs font-bold text-gray-900">{total}</span>
          </div>
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-xs font-bold text-gray-500">Member Since</span>
            <span className="text-xs font-bold text-gray-900">{joined}</span>
          </div>
        </div>

      </div>
    </div>
  );
}