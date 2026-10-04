export type Country = 'GH' | 'NG';
export type Currency = 'GHS' | 'NGN';
export type GameType = 'CODM' | 'FC Mobile' | 'eFootball' | 'Free Fire' | 'PUBG Mobile' | 'Tekken 8';
export type MatchStatus = 'live' | 'pending' | 'completed' | 'disputed' | 'cancelled';
export type KycTier = 'none' | 'basic' | 'verified';

export interface Player {
  id: string;
  name: string;
  username: string;
  country: Country;
  currency: Currency;
  rating: number;
  wins: number;
  losses: number;
  totalVolume: number;
  phone: string;
  kycTier: KycTier;
  color: string;
  joinedAt: string;
}

export interface Match {
  id: string;
  game: GameType;
  gameMode: string;
  wagerAmount: number;
  currency: Currency;
  playerA: Player;
  playerB: Player | null;
  status: MatchStatus;
  createdAt: string;
  resolvedAt?: string;
  winner?: Player;
  disputeReason?: string;
  timeWaiting?: string;
}

export interface Notification {
  id: string;
  type: 'match_invite' | 'dispute_alert' | 'payout' | 'kyc' | 'system';
  title: string;
  body: string;
  time: string;
  read: boolean;
  matchId?: string;
}

export interface Transaction {
  id: string;
  type: 'wager' | 'payout' | 'deposit' | 'withdrawal';
  amount: number;
  currency: Currency;
  method: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  ref: string;
}

export const players: Player[] = [
  {
    id: 'p1',
    name: 'Kwame Asante',
    username: 'KwameGOAT',
    country: 'GH',
    currency: 'GHS',
    rating: 2340,
    wins: 87,
    losses: 23,
    totalVolume: 48500,
    phone: '+233 20 123 4567',
    kycTier: 'verified',
    color: '#1D4ED8',
    joinedAt: '2024-01-15',
  },
  {
    id: 'p2',
    name: 'Chukwuemeka Obi',
    username: 'EmkaBeast',
    country: 'NG',
    currency: 'NGN',
    rating: 2180,
    wins: 62,
    losses: 31,
    totalVolume: 1240000,
    phone: '+234 802 345 6789',
    kycTier: 'verified',
    color: '#7C3AED',
    joinedAt: '2024-02-08',
  },
  {
    id: 'p3',
    name: 'Abena Mensah',
    username: 'AbenaElite',
    country: 'GH',
    currency: 'GHS',
    rating: 1980,
    wins: 44,
    losses: 29,
    totalVolume: 22300,
    phone: '+233 24 987 6543',
    kycTier: 'basic',
    color: '#DC2626',
    joinedAt: '2024-03-20',
  },
  {
    id: 'p4',
    name: 'Tunde Adeyemi',
    username: 'TundeSniper',
    country: 'NG',
    currency: 'NGN',
    rating: 2050,
    wins: 58,
    losses: 22,
    totalVolume: 890000,
    phone: '+234 703 456 7890',
    kycTier: 'verified',
    color: '#D97706',
    joinedAt: '2024-01-30',
  },
  {
    id: 'p5',
    name: 'Ama Darko',
    username: 'AmaFire',
    country: 'GH',
    currency: 'GHS',
    rating: 1750,
    wins: 33,
    losses: 28,
    totalVolume: 14800,
    phone: '+233 26 543 2109',
    kycTier: 'none',
    color: '#0891B2',
    joinedAt: '2024-05-11',
  },
  {
    id: 'p6',
    name: 'Oluwaseun Afolabi',
    username: 'SeunPro',
    country: 'NG',
    currency: 'NGN',
    rating: 1860,
    wins: 41,
    losses: 19,
    totalVolume: 560000,
    phone: '+234 814 678 9012',
    kycTier: 'basic',
    color: '#059669',
    joinedAt: '2024-04-03',
  },
];

export const me = players[0];

// Demo opponent from the same country as the user (matches are same-country only)
export const opponentFor = (country: Country) => (country === 'NG' ? players[1] : players[2]);

export const matches: Match[] = [
  {
    id: 'M-7842',
    game: 'CODM',
    gameMode: '1v1 Killhouse',
    wagerAmount: 450,
    currency: 'GHS',
    playerA: players[0],
    playerB: players[1],
    status: 'live',
    createdAt: '2025-09-25T10:30:00Z',
  },
  {
    id: 'M-7839',
    game: 'FC Mobile',
    gameMode: 'H2H 90 mins',
    wagerAmount: 25000,
    currency: 'NGN',
    playerA: players[3],
    playerB: players[1],
    status: 'live',
    createdAt: '2025-09-25T10:15:00Z',
  },
  {
    id: 'M-7835',
    game: 'CODM',
    gameMode: 'Hardpoint Search',
    wagerAmount: 200,
    currency: 'GHS',
    playerA: players[2],
    playerB: players[4],
    status: 'disputed',
    createdAt: '2025-09-25T09:00:00Z',
    disputeReason: 'Both players claim victory. Screenshot evidence conflicting.',
    timeWaiting: '2h 14m',
  },
  {
    id: 'M-7831',
    game: 'FC Mobile',
    gameMode: 'H2H 90 mins',
    wagerAmount: 15000,
    currency: 'NGN',
    playerA: players[5],
    playerB: players[3],
    status: 'completed',
    createdAt: '2025-09-25T08:00:00Z',
    resolvedAt: '2025-09-25T09:10:00Z',
    winner: players[5],
  },
  {
    id: 'M-7828',
    game: 'Tekken 8',
    gameMode: 'Best of 3',
    wagerAmount: 100,
    currency: 'GHS',
    playerA: players[0],
    playerB: null,
    status: 'pending',
    createdAt: '2025-09-25T11:00:00Z',
  },
  {
    id: 'M-7821',
    game: 'eFootball',
    gameMode: 'League Match',
    wagerAmount: 50000,
    currency: 'NGN',
    playerA: players[1],
    playerB: players[5],
    status: 'disputed',
    createdAt: '2025-09-24T16:00:00Z',
    disputeReason: 'Player B claims connection drop mid-match.',
    timeWaiting: '5h 48m',
  },
  {
    id: 'M-7815',
    game: 'CODM',
    gameMode: 'TDM Nuketown',
    wagerAmount: 300,
    currency: 'GHS',
    playerA: players[2],
    playerB: players[0],
    status: 'completed',
    createdAt: '2025-09-24T14:00:00Z',
    resolvedAt: '2025-09-24T15:20:00Z',
    winner: players[0],
  },
  {
    id: 'M-7809',
    game: 'FC Mobile',
    gameMode: 'H2H 90 mins',
    wagerAmount: 10000,
    currency: 'NGN',
    playerA: players[3],
    playerB: players[1],
    status: 'cancelled',
    createdAt: '2025-09-24T12:00:00Z',
  },
];

export const notifications: Notification[] = [
  {
    id: 'n1',
    type: 'match_invite',
    title: 'Match Invite from EmkaBeast',
    body: 'CODM: 1v1 Killhouse — GHS 450.00 wager. Accept before it expires.',
    time: '2 min ago',
    read: false,
    matchId: 'M-7842',
  },
  {
    id: 'n2',
    type: 'payout',
    title: 'Payout Confirmed',
    body: 'GHS 870.00 sent to MTN Mobile Money ending **4521.',
    time: '14 min ago',
    read: false,
  },
  {
    id: 'n3',
    type: 'dispute_alert',
    title: 'Dispute Under Review',
    body: 'Match M-7815 is being reviewed by admin. Decision within 24 hours.',
    time: '1 hr ago',
    read: false,
    matchId: 'M-7815',
  },
  {
    id: 'n4',
    type: 'kyc',
    title: 'KYC Verified',
    body: 'Your identity has been verified. You can now wager up to GHS 5,000 per match.',
    time: '3 hr ago',
    read: true,
  },
  {
    id: 'n5',
    type: 'match_invite',
    title: 'Match Invite from TundeSniper',
    body: 'FC Mobile: H2H 90 mins — NGN 25,000 wager. Accept before it expires.',
    time: '5 hr ago',
    read: true,
    matchId: 'M-7839',
  },
  {
    id: 'n6',
    type: 'payout',
    title: 'Match Won — Payout Incoming',
    body: 'You beat AbenaElite in CODM: TDM Nuketown. GHS 570.00 credited to your wallet.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 'n7',
    type: 'system',
    title: 'New Feature: Live Spectator Mode',
    body: 'Watch verified matches live. Now available for CODM and FC Mobile.',
    time: '2 days ago',
    read: true,
  },
];

export const transactions: Transaction[] = [
  {
    id: 'TXN-29841',
    type: 'payout',
    amount: 870,
    currency: 'GHS',
    method: 'MTN Mobile Money',
    status: 'completed',
    date: '25 Sep 2025',
    ref: 'PRV-GH-20250925-29841',
  },
  {
    id: 'TXN-29835',
    type: 'wager',
    amount: 450,
    currency: 'GHS',
    method: 'Escrow Lock',
    status: 'pending',
    date: '25 Sep 2025',
    ref: 'PRV-GH-20250925-29835',
  },
  {
    id: 'TXN-29820',
    type: 'deposit',
    amount: 1000,
    currency: 'GHS',
    method: 'Telecel Cash',
    status: 'completed',
    date: '24 Sep 2025',
    ref: 'PRV-GH-20250924-29820',
  },
  {
    id: 'TXN-29814',
    type: 'payout',
    amount: 570,
    currency: 'GHS',
    method: 'MTN Mobile Money',
    status: 'completed',
    date: '24 Sep 2025',
    ref: 'PRV-GH-20250924-29814',
  },
];

export const adminStats = {
  escrowVolume: 'GHS 480K',
  escrowChange: '+12.4%',
  pendingDisputes: 42,
  disputesChange: '+8',
  kycQueue: 18,
  kycChange: '-3',
  totalMatches: 2340,
  matchesChange: '+187',
  chartData: [
    { day: 'Mon', matches: 284, volume: 142 },
    { day: 'Tue', matches: 312, volume: 167 },
    { day: 'Wed', matches: 298, volume: 153 },
    { day: 'Thu', matches: 445, volume: 229 },
    { day: 'Fri', matches: 521, volume: 287 },
    { day: 'Sat', matches: 389, volume: 198 },
    { day: 'Sun', matches: 340, volume: 172 },
  ],
};

export function formatCurrency(amount: number, currency: Currency): string {
  const formatted = amount.toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency} ${formatted}`;
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export const GAME_META: Record<GameType, { color: string; bg: string; label: string }> = {
  'CODM': { color: '#FF6B00', bg: '#1A0800', label: 'Call of Duty: Mobile' },
  'FC Mobile': { color: '#00C853', bg: '#001A0D', label: 'FC Mobile' },
  'eFootball': { color: '#0066FF', bg: '#00001A', label: 'eFootball' },
  'Free Fire': { color: '#FF3D00', bg: '#1A0500', label: 'Free Fire' },
  'PUBG Mobile': { color: '#F59E0B', bg: '#1A1000', label: 'PUBG Mobile' },
  'Tekken 8': { color: '#FFD700', bg: '#1A1400', label: 'Tekken 8' },
};

export const FLAG_EMOJI: Record<Country, string> = {
  GH: '🇬🇭',
  NG: '🇳🇬',
};
