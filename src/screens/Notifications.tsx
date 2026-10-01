import { useState } from 'react';
import {
  IconGamepad,
  IconTrophy,
  IconAlertTriangle,
  IconShield,
  IconBell,
} from '../components/ui';
import type { Notification } from '../data';

type FilterTab = 'all' | 'matches' | 'disputes' | 'payouts';

const TAB_LABELS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'matches', label: 'Matches' },
  { id: 'disputes', label: 'Disputes' },
  { id: 'payouts', label: 'Payouts' },
];

function filterNotifications(items: Notification[], tab: FilterTab): Notification[] {
  if (tab === 'all') return items;
  if (tab === 'matches') return items.filter(n => n.type === 'match_invite');
  if (tab === 'disputes') return items.filter(n => n.type === 'dispute_alert');
  if (tab === 'payouts') return items.filter(n => n.type === 'payout');
  return items;
}

function NotifIcon({ type }: { type: Notification['type'] }) {
  if (type === 'match_invite') {
    return (
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
        <IconGamepad size={18} className="text-blue-600" />
      </div>
    );
  }
  if (type === 'payout') {
    return (
      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
        <IconTrophy size={18} className="text-green-600" />
      </div>
    );
  }
  if (type === 'dispute_alert') {
    return (
      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
        <IconAlertTriangle size={18} className="text-amber-600" />
      </div>
    );
  }
  if (type === 'kyc') {
    return (
      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
        <IconShield size={18} className="text-green-600" />
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
      <IconBell size={18} className="text-gray-500" />
    </div>
  );
}

export default function Notifications({ onNavigate, notifications, onMarkRead, onMarkAllRead }: { onNavigate: (s: string) => void; notifications: Notification[]; onMarkRead: (id: string) => void; onMarkAllRead: () => void }) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const readState: Record<string, boolean> = Object.fromEntries(notifications.map(n => [n.id, n.read]));

  function markAllRead() {
    onMarkAllRead();
  }

  function handleNotifClick(notif: Notification) {
    onMarkRead(notif.id);
    if (notif.type === 'match_invite') onNavigate('match-lobby');
    else if (notif.type === 'dispute_alert') onNavigate('dispute');
    else if (notif.type === 'payout') onNavigate('payout');
  }

  const filtered = filterNotifications(notifications, activeTab);
  const unreadItems = filtered.filter(n => !readState[n.id]);
  const readItems = filtered.filter(n => readState[n.id]);

  const unreadCount = notifications.filter(n => !readState[n.id]).length;

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <h1
            className="text-lg font-bold text-gray-900"
            style={{ fontFamily: 'Chakra Petch, sans-serif' }}
          >
            Notifications
          </h1>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-600 text-white text-xs font-bold" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={markAllRead}
          className="text-sm font-semibold text-green-600 hover:text-green-700 transition-colors"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Mark all read
        </button>
      </header>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex gap-2 overflow-x-auto no-scroll">
        {TAB_LABELS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
              activeTab === tab.id
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            style={{ fontFamily: 'Chakra Petch, sans-serif' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col">
        {filtered.length === 0 ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
              <IconBell size={24} className="text-gray-400" />
            </div>
            <p
              className="text-base font-semibold text-gray-700"
              style={{ fontFamily: 'Chakra Petch, sans-serif' }}
            >
              No notifications here yet
            </p>
            <p className="text-sm text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              When you get{' '}
              {activeTab === 'matches'
                ? 'match invites'
                : activeTab === 'disputes'
                ? 'dispute alerts'
                : activeTab === 'payouts'
                ? 'payout updates'
                : 'notifications'}
              , they'll show up here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Unread Section */}
            {unreadItems.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                    New
                  </p>
                </div>
                {unreadItems.map(notif => (
                  <NotifRow
                    key={notif.id}
                    notif={notif}
                    isRead={false}
                    onClick={() => handleNotifClick(notif)}
                  />
                ))}
              </div>
            )}

            {/* Read Section */}
            {readItems.length > 0 && (
              <div>
                {unreadItems.length > 0 && (
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Earlier
                    </p>
                  </div>
                )}
                {readItems.map(notif => (
                  <NotifRow
                    key={notif.id}
                    notif={notif}
                    isRead={true}
                    onClick={() => handleNotifClick(notif)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NotifRow({
  notif,
  isRead,
  onClick,
}: {
  notif: Notification;
  isRead: boolean;
  onClick: () => void;
}) {
  const isActionable = notif.type === 'match_invite' || notif.type === 'dispute_alert' || notif.type === 'payout';

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-4 border-b border-gray-100 text-left transition-colors hover:bg-gray-50 ${
        !isRead ? 'bg-green-50/50' : 'bg-white'
      }`}
    >
      <NotifIcon type={notif.type} />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm leading-snug truncate pr-1 ${
              !isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
            }`}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {notif.title}
          </p>
          <span className="text-xs text-gray-400 shrink-0 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
            {notif.time}
          </span>
        </div>
        <p
          className="text-xs text-gray-500 mt-0.5 truncate"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {notif.body}
        </p>
        {isActionable && notif.matchId && (
          <span
            className="inline-block mt-1.5 text-xs font-semibold text-green-600"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            View →
          </span>
        )}
      </div>

      {/* Unread dot */}
      {!isRead && (
        <div className="w-2 h-2 rounded-full bg-green-500 shrink-0 mt-1.5" />
      )}
    </button>
  );
}
