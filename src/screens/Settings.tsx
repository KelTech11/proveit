import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  IconChevronRight,
  IconLink,
  IconCheck,
} from '../components/ui';
import { FLAG_EMOJI, GAME_META } from '../data';
import type { GameType } from '../data';
import { useProfile } from '../profile';
import { AvatarPicker } from '../avatars';

const GAMES: GameType[] = ['CODM', 'FC Mobile', 'eFootball', 'Free Fire', 'PUBG Mobile'];

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

  function saveLink(game: GameType) {
    const uid = linkDraft.trim();
    if (!uid) return;
    updateProfile({ linkedGames: { ...profile.linkedGames, [game]: uid } });
    setLinking(null);
    setLinkDraft('');
  }

  const idLabel = profile.country === 'GH' ? 'Ghana Card, passport or NHIS ID' : 'NIN or passport';
  const checks = [
    { title: 'Phone number', note: 'Verified with a one-time code' },
    { title: 'Government ID', note: `${idLabel} checked` },
    { title: 'Selfie liveness check', note: 'Face matched to your ID' },
    { title: 'Game account', note: 'In-game UID and username checked' },
  ];

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

        {/* Identity Verification */}
        <div className="px-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p
              className="text-sm font-bold text-gray-900"
              style={{ fontFamily: 'Chakra Petch, sans-serif' }}
            >
              Identity Verification
            </p>
            <span className="text-xs text-green-600 font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
              Fully verified
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {checks.map(c => (
              <div key={c.title} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                  <IconCheck size={12} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                    {c.title}
                  </p>
                  <p className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {c.note}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
            Your name is locked to your ID. Changing a linked game ID later needs re-verification.
          </p>
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
            <SettingRow
              label="Region"
              value={`${profile.country === 'GH' ? 'Ghana' : 'Nigeria'} ${FLAG_EMOJI[profile.country]}`}
            />
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
              const uid = profile.linkedGames[game];
              const linked = !!uid;
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
                      {uid && (
                        <p className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                          UID: {uid}
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