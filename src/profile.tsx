import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { me } from './data';
import type { GameType } from './data';

export type Profile = typeof me & {
  email: string;
  linkedGames: Partial<Record<GameType, string>>;
};

const DEFAULT_PROFILE: Profile = {
  ...me,
  email: 'kwame@gmail.com',
  linkedGames: { CODM: 'KwameGOAT_GH', 'FC Mobile': 'KwameFCM' },
};

const KEY = 'proveit_profile';

function load(): Profile {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_PROFILE;
}

type Ctx = { profile: Profile; updateProfile: (patch: Partial<Profile>) => void };

const ProfileContext = createContext<Ctx>({ profile: DEFAULT_PROFILE, updateProfile: () => {} });

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(profile)); } catch {}
  }, [profile]);

  const updateProfile = (patch: Partial<Profile>) =>
    setProfile((p: Profile) => ({ ...p, ...patch }));

  return <ProfileContext.Provider value={{ profile, updateProfile }}>{children}</ProfileContext.Provider>;
}

export const useProfile = () => useContext(ProfileContext);