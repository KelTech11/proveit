import { useState } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  IconChevronRight,
  IconShield,
  IconLogout,
  IconLink,
  IconCheck,
  GameBadge,
} from '../components/ui';
import { me, FLAG_EMOJI, GAME_META } from '../data';
import type { GameType } from '../data';
import { useProfile } from '../profile';
import { AvatarPicker } from '../avatars';

const GAMES: GameType[] = ['CODM', 'FC Mobile', 'eFootball', 'Tekken 8'];

type NotifKey = 'matchInvites' | 'payoutAlerts' | 'disputeUpdates' | 'marketing';

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
        value ? 'bg-green-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 m-0.5 ${
          value ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function SettingRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
}) {
  return (
    <button
      className="flex items-center justify-between w-full py-3.5 px-4 hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
      onClick={onPress}
    >
      <span className="text-sm text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>
        {label}
      </span>
      <div className="flex items-center gap-2">
        {value && (
          <span className="text-sm text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
            {value}
          </span>
        )}
        <IconChevronRight size={16} className="text-gray-400" />
      </div>
    </button>
  );
}

export default function Settings({ onNavigate }: { onNavigate: (s: string) => void }) {
  const { profile, updateProfile } = useProfile();
  const me = profile;
  const GAMES: GameType[] = ['CODM', 'FC Mobile', 'eFootball', 'Free Fire', 'PUBG Mobile'];
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(profile.name);
  const [usernameDraft, setUsernameDraft] = useState(profile.username);
  const [linking, setLinking] = useState<GameType | null>(null);
  const [linkDraft, setLinkDraft] = useState('');
  const [twoFA, setTwoFA] = useState(true);
  const [notifs, setNotifs] = useState<Record<NotifKey, boolean>>({
    matchInvites: true,
    payoutAlerts: true,
    disputeUpdates: true,
    marketing: false,
  });

  function setNotif(key: NotifKey, val: boolean) {
    setNotifs(prev => ({ ...prev, [key]: val }));
  }

  function saveProfile() {
    const name = nameDraft.trim();
    const username = usernameDraft.trim().replace(/^@/, '');
    if (!name || !username) return;
    updateProfile({ name, username });
    setEditing(false);
  }

  function saveLink(game: GameType) {
    const username = linkDraft.trim();
    if (!username) return;
    updateProfile({ linkedGames: { ...profile.linkedGames, [game]: username } });
    setLinking(null);
    setLinkDraft('');
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <h1
          className="text-lg font-bold text-gray-900"
          style={{ fontFamily: 'Chakra Petch, sans-serif' }}
        >
          Account &amp; Settings
        </h1>
      </header>

      <div className="flex-1 flex flex-col gap-5 pb-8">
        {/* Profile Card */}
        <div
          className="px-4 pt-5 pb-6 flex items-center gap-4"
          style={{ background: '#111827' }}
        >
          <AvatarPicker />
          <div className="flex-1 min-w-0">
            <p
              className="text-xl font-bold text-white truncate"
              style={{ fontFamily: 'Chakra Petch, sans-serif' }}
            >
              {profile.name}
            </p>
            <p className="text-sm text-gray-400 truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
              @{profile.username}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="verified">
                <IconCheck size={10} />
                Verified
              </Badge>
            </div>
          </div>
        </div>

        {/* KYC Tier Progress */}
        <div className="px-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p
              className="text-sm font-bold text-gray-900"
              style={{ fontFamily: 'Chakra Petch, sans-serif' }}
            >
              KYC Verification
            </p>
            <span className="text-xs text-green-600 font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
              Tier 2 of 3
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 rounded-full transition-all"
              style={{ width: '66%' }}
            />
          </div>

          <div className="flex flex-col gap-2">
            {/* Tier 1 */}
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                <IconCheck size={12} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                  Tier 1 Basic
                </p>
                <p className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Identity verified — wager up to {me.currency} 500
                </p>
              </div>
            </div>
            {/* Tier 2 */}
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                <IconCheck size={12} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                  Tier 2 Enhanced
                </p>
                <p className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Phone + BVN verified — wager up to {me.currency} 2,000
                </p>
              </div>
            </div>
            {/* Tier 3 */}
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-amber-600 text-xs font-bold">3</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-700" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                  Tier 3 Premium
                  <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-700">
                    In Progress
                  </span>
                </p>
                <p className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Government ID — wager up to {me.currency} 10,000
                </p>
              </div>
            </div>
          </div>

          <Button variant="secondary" size="sm" fullWidth onClick={() => {}}>
            <IconShield size={16} />
            Complete KYC — Unlock Higher Limits
          </Button>
        </div>

        {/* Account Details */}
        <div className="px-4 flex flex-col gap-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1" style={{ fontFamily: 'Inter, sans-serif' }}>
            Account Details
          </p>
          <Card className="overflow-hidden divide-y divide-gray-100">
            <SettingRow
              label="Phone"
              value={profile.phone.replace(/(\+\d+\s\d+\s)\d+(\s\d+)/, '$1***$2')}
            />
            <SettingRow label="Email" value={profile.email} />
            <SettingRow label="Region" value={`${profile.country === 'GH' ? 'Ghana' : 'Nigeria'} ${FLAG_EMOJI[profile.country]}`} />
            <SettingRow label="Language" value="English" />
          </Card>
        </div>

        {/* Linked Games */}
        <div className="px-4 flex flex-col gap-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1" style={{ fontFamily: 'Inter, sans-serif' }}>
            Linked Games
          </p>
          <Card className="overflow-hidden divide-y divide-gray-100">
            {GAMES.map(game => {
              const meta = GAME_META[game];
              const username = profile.linkedGames[game];
              const linked = !!username;
              return (
                <div
                  key={game}
                  className="flex items-center justify-between px-4 py-3.5"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: meta.bg }}
                    >
                      <span
                        className="text-xs font-black"
                        style={{ color: meta.color, fontFamily: 'Chakra Petch, sans-serif' }}
                      >
                        {game.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                        {game}
                      </p>
                      {username && (
                        <p className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {username}
                        </p>
                      )}
                    </div>
                  </div>
                  {linked ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                      <IconCheck size={10} />
                      Linked
                    </span>
                  ) : linking === game ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={linkDraft}
                        onChange={e => setLinkDraft(e.target.value)}
                        placeholder="Game UID"
                        className="w-28 text-base border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-green-500"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      />
                      <Button variant="primary" size="sm" onClick={() => saveLink(game)}>
                        Save
                      </Button>
                    </div>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => { setLinking(game); setLinkDraft(''); }}>
                      <IconLink size={14} />
                      Link Account
                    </Button>
                  )}
                </div>
              );
            })}
          </Card>
        </div>

        {/* Security */}
        <div className="px-4 flex flex-col gap-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1" style={{ fontFamily: 'Inter, sans-serif' }}>
            Security
          </p>
          <Card className="overflow-hidden divide-y divide-gray-100">
            <SettingRow label="Change PIN" />
            <div className="flex items-center justify-between px-4 py-3.5">
              <div>
                <p className="text-sm text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Two-Factor Authentication
                </p>
                <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {twoFA ? 'Enabled via SMS' : 'Disabled'}
                </p>
              </div>
              <Toggle value={twoFA} onChange={setTwoFA} />
            </div>
            <SettingRow label="Login History" />
          </Card>
        </div>

        {/* Notifications */}
        <div className="px-4 flex flex-col gap-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1" style={{ fontFamily: 'Inter, sans-serif' }}>
            Notifications
          </p>
          <Card className="overflow-hidden divide-y divide-gray-100">
            {(
              [
                { key: 'matchInvites' as NotifKey, label: 'Match Invites' },
                { key: 'payoutAlerts' as NotifKey, label: 'Payout Alerts' },
                { key: 'disputeUpdates' as NotifKey, label: 'Dispute Updates' },
                { key: 'marketing' as NotifKey, label: 'Marketing' },
              ] as const
            ).map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between px-4 py-3.5">
                <span className="text-sm text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {label}
                </span>
                <Toggle value={notifs[key]} onChange={v => setNotif(key, v)} />
              </div>
            ))}
          </Card>
        </div>

        {/* Logout */}
        <div className="px-4"> 
          <button
            className="w-full py-3.5 text-center text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
            style={{ fontFamily: 'Chakra Petch, sans-serif' }}
            onClick={() => onNavigate('login')}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
