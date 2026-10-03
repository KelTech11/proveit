import { useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { Avatar } from './components/ui';
import { useProfile } from './profile';

const SIZE_PX: Record<string, number> = { sm: 32, md: 40, lg: 56, xl: 72 };

const ART: Record<string, ReactNode> = {
  jet: (
    <>
      <rect width="100" height="100" fill="#0B1B3A" />
      <circle cx="50" cy="52" r="40" fill="#1D4ED8" opacity="0.35" />
      <path d="M50 12 L57 38 L57 70 L50 80 L43 70 L43 38 Z" fill="#E2E8F0" />
      <path d="M43 40 L14 68 L14 74 L43 62 Z" fill="#94A3B8" />
      <path d="M57 40 L86 68 L86 74 L57 62 Z" fill="#94A3B8" />
      <path d="M43 68 L32 80 L32 85 L44 78 Z" fill="#94A3B8" />
      <path d="M57 68 L68 80 L68 85 L56 78 Z" fill="#94A3B8" />
      <ellipse cx="50" cy="36" rx="3.5" ry="9" fill="#38BDF8" />
      <rect x="49" y="48" width="2" height="20" fill="#22C55E" />
      <path d="M47 82 L50 94 L53 82 Z" fill="#FB923C" />
    </>
  ),
  controller: (
    <>
      <rect width="100" height="100" fill="#1E1B4B" />
      <circle cx="50" cy="52" r="40" fill="#7C3AED" opacity="0.45" />
      <path d="M26 40 h48 a12 12 0 0 1 12 12 v6 a10 10 0 0 1 -17 7 l-5 -5 h-28 l-5 5 a10 10 0 0 1 -17 -7 v-6 a12 12 0 0 1 12 -12 z" fill="#F8FAFC" />
      <rect x="27" y="49.5" width="14" height="5" rx="1.5" fill="#1E1B4B" />
      <rect x="31.5" y="45" width="5" height="14" rx="1.5" fill="#1E1B4B" />
      <circle cx="68" cy="46" r="3" fill="#22C55E" />
      <circle cx="74" cy="52" r="3" fill="#EF4444" />
      <circle cx="68" cy="58" r="3" fill="#3B82F6" />
      <circle cx="62" cy="52" r="3" fill="#FACC15" />
      <circle cx="46" cy="50" r="1.8" fill="#CBD5E1" />
      <circle cx="54" cy="50" r="1.8" fill="#CBD5E1" />
    </>
  ),
  phantom: (
    <>
      <rect width="100" height="100" fill="#1F0A0A" />
      <circle cx="50" cy="52" r="40" fill="#DC2626" opacity="0.4" />
      <path d="M18 100 Q22 74 50 74 Q78 74 82 100 Z" fill="#0F172A" />
      <circle cx="50" cy="52" r="30" fill="#0F172A" />
      <rect x="30" y="42" width="40" height="18" rx="9" fill="#1E293B" />
      <path d="M34 49 L47 52 L38 57 Z" fill="#F43F5E" />
      <path d="M66 49 L53 52 L62 57 Z" fill="#F43F5E" />
      <rect x="22" y="36" width="56" height="5" fill="#DC2626" />
      <path d="M78 38 L90 32 L88 42 Z" fill="#DC2626" />
    </>
  ),
  skull: (
    <>
      <rect width="100" height="100" fill="#052E16" />
      <circle cx="50" cy="52" r="40" fill="#16A34A" opacity="0.4" />
      <path d="M20 52 A30 30 0 0 1 80 52" stroke="#22C55E" strokeWidth="5" fill="none" />
      <rect x="14" y="44" width="9" height="18" rx="4.5" fill="#22C55E" />
      <rect x="77" y="44" width="9" height="18" rx="4.5" fill="#22C55E" />
      <circle cx="50" cy="46" r="22" fill="#F8FAFC" />
      <rect x="40" y="58" width="20" height="16" rx="4" fill="#F8FAFC" />
      <circle cx="42" cy="46" r="6" fill="#0F172A" />
      <circle cx="58" cy="46" r="6" fill="#0F172A" />
      <path d="M50 54 L46 62 L54 62 Z" fill="#0F172A" />
      <path d="M44 66 V74 M50 66 V74 M56 66 V74" stroke="#0F172A" strokeWidth="2" />
      <path d="M18 60 Q20 74 38 76" stroke="#22C55E" strokeWidth="3" fill="none" />
      <circle cx="38" cy="76" r="3.5" fill="#22C55E" />
    </>
  ),
  rocket: (
    <>
      <rect width="100" height="100" fill="#2A0F05" />
      <circle cx="50" cy="52" r="40" fill="#EA580C" opacity="0.35" />
      <circle cx="20" cy="24" r="1.5" fill="#FFFFFF" />
      <circle cx="80" cy="30" r="1.2" fill="#FFFFFF" />
      <circle cx="72" cy="14" r="1.5" fill="#FFFFFF" />
      <circle cx="26" cy="70" r="1.2" fill="#FFFFFF" />
      <path d="M38 56 L24 74 L38 72 Z" fill="#EF4444" />
      <path d="M62 56 L76 74 L62 72 Z" fill="#EF4444" />
      <path d="M50 14 C63 26 66 46 63 68 L37 68 C34 46 37 26 50 14 Z" fill="#F8FAFC" />
      <rect x="38" y="58" width="24" height="3" fill="#EF4444" />
      <circle cx="50" cy="42" r="7" fill="#38BDF8" stroke="#0F172A" strokeWidth="2" />
      <rect x="43" y="68" width="14" height="5" rx="2" fill="#64748B" />
      <path d="M44 73 Q50 96 56 73 Z" fill="#FBBF24" />
      <path d="M47 73 Q50 86 53 73 Z" fill="#F97316" />
    </>
  ),
  crown: (
    <>
      <rect width="100" height="100" fill="#2A1503" />
      <circle cx="50" cy="52" r="40" fill="#F59E0B" opacity="0.35" />
      <path d="M22 66 L18 36 L36 50 L50 28 L64 50 L82 36 L78 66 Z" fill="#FBBF24" stroke="#92400E" strokeWidth="2" strokeLinejoin="round" />
      <rect x="22" y="68" width="56" height="8" rx="3" fill="#F59E0B" />
      <circle cx="18" cy="36" r="4" fill="#FDE68A" />
      <circle cx="50" cy="28" r="4" fill="#FDE68A" />
      <circle cx="82" cy="36" r="4" fill="#FDE68A" />
      <circle cx="50" cy="56" r="4" fill="#EF4444" />
      <circle cx="34" cy="58" r="3" fill="#38BDF8" />
      <circle cx="66" cy="58" r="3" fill="#22C55E" />
    </>
  ),
};

export const AVATARS = [
  { id: 'jet', label: 'Sky Jet' },
  { id: 'controller', label: 'Controller' },
  { id: 'phantom', label: 'Phantom' },
  { id: 'skull', label: 'Headset Skull' },
  { id: 'rocket', label: 'Rocket' },
  { id: 'crown', label: 'Champion' },
];

export function AvatarArt({ id, px }: { id: string; px: number }) {
  return (
    <svg viewBox="0 0 100 100" width={px} height={px} className="block rounded-full">
      {ART[id]}
    </svg>
  );
}

// Shows the chosen avatar when the avatar belongs to the signed-in player, otherwise the normal Avatar.
export function ProfileAvatar(props: ComponentProps<typeof Avatar>) {
  const { profile } = useProfile();
  const art = profile.avatar ? ART[profile.avatar] : undefined;
  if (!art || props.name !== profile.name) return <Avatar {...props} />;
  const px = SIZE_PX[String(props.size)] ?? 40;
  return (
    <div className="shrink-0 rounded-full overflow-hidden" style={{ width: px, height: px }}>
      <AvatarArt id={profile.avatar as string} px={px} />
    </div>
  );
}

export function AvatarPicker() {
  const { profile, updateProfile } = useProfile();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="flex flex-col items-center gap-1.5 shrink-0" aria-label="Change avatar">
        <ProfileAvatar name={profile.name} country={profile.country} color={profile.color} size="xl" />
        <span className="text-[11px] font-semibold text-green-400" style={{ fontFamily: 'Inter, sans-serif' }}>
          Change avatar
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                Choose your avatar
              </h2>
              <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700 text-lg leading-none" aria-label="Close">
                ✕
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              Pick the look that represents you in matches.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {AVATARS.map(a => {
                const active = profile.avatar === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => { updateProfile({ avatar: a.id }); setOpen(false); }}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border-2 transition-colors ${
                      active ? 'border-green-500 bg-green-50' : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    <AvatarArt id={a.id} px={64} />
                    <span className="text-[11px] font-bold text-gray-700" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                      {a.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}