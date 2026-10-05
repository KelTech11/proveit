const ACCOUNTS_KEY = 'proveit_accounts';
const LEGACY_KEY = 'proveit_account';
const CURRENT_KEY = 'proveit_current';

// Backend address. Local only for now.
const API_URL = 'http://localhost:3000';
const TOKEN_KEY = 'proveit_token';

export const getToken = (): string => {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
};

export type Account = { username: string; email: string; phone: string; hash: string };

const fallbackHash = (text: string) => {
  let h1 = 5381;
  let h2 = 52711;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    h1 = (h1 * 33) ^ c;
    h2 = (h2 * 33) ^ c;
  }
  return (h1 >>> 0).toString(16) + (h2 >>> 0).toString(16);
};

const hashPassword = async (username: string, password: string) => {
  const text = `proveit:${username}:${password}`;
  try {
    if (crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {}
  return fallbackHash(text);
};

const readAccounts = (): Record<string, Account> => {
  try {
    const saved = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || 'null');
    if (saved && typeof saved === 'object') return saved;
    // One-time move from the old single-account storage
    const old = JSON.parse(localStorage.getItem(LEGACY_KEY) || 'null');
    if (old && old.username && old.hash) {
      const map: Record<string, Account> = { [old.username]: old };
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(map));
      if (!localStorage.getItem(CURRENT_KEY)) localStorage.setItem(CURRENT_KEY, old.username);
      return map;
    }
  } catch {}
  return {};
};

const writeAccounts = (map: Record<string, Account>) => {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(map));
  } catch {}
};

export const setCurrentUser = (username: string) => {
  try {
    localStorage.setItem(CURRENT_KEY, username);
  } catch {}
};

export const currentUser = (): string => {
  try {
    return localStorage.getItem(CURRENT_KEY) || '';
  } catch {
    return '';
  }
};

export const loadAccount = (): Account | null => {
  const map = readAccounts();
  return map[currentUser()] ?? Object.values(map)[0] ?? null;
};

// Logs in on the server and keeps the token. Returns the user, or why it failed.
const requestLogin = async (identifier: string, password: string): Promise<{ user: any } | 'wrong' | 'offline'> => {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
  } catch {
    return 'offline';
  }
  if (!res.ok) return 'wrong';
  const body = await res.json();
  try {
    localStorage.setItem(TOKEN_KEY, body.accessToken);
  } catch {}
  return { user: body.user };
};

export const saveAccount = async (data: {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  dateOfBirth: string;
}): Promise<{ ok: true } | { ok: false; error: string }> => {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: data.fullName,
        username: data.username,
        phone: data.phone.replace(/\s/g, ''),
        email: data.email,
        password: data.password,
        dateOfBirth: data.dateOfBirth,
      }),
    });
  } catch {
    return { ok: false, error: "Can't reach the server. Make sure the backend is running." };
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const msg = Array.isArray(body?.message) ? body.message[0] : body?.message;
    return { ok: false, error: msg || 'Could not create your account. Try again.' };
  }

  // Keep a local copy so the rest of the app keeps working
  const hash = await hashPassword(data.username, data.password);
  const map = readAccounts();
  map[data.username] = { username: data.username, email: data.email, phone: data.phone, hash };
  writeAccounts(map);
  setCurrentUser(data.username);
  await requestLogin(data.username, data.password);
  return { ok: true };
};

export const checkLogin = async (username: string, password: string): Promise<'ok' | 'wrong' | 'offline'> => {
  const result = await requestLogin(username, password);
  if (result === 'offline') return 'offline';
  if (result === 'wrong') return 'wrong';

  // Make sure this device has a local record for the account
  const map = readAccounts();
  if (!map[username]) {
    map[username] = {
      username,
      email: result.user.email ?? '',
      phone: result.user.phone ?? '',
      hash: await hashPassword(username, password),
    };
    writeAccounts(map);
  }
  setCurrentUser(username);
  return 'ok';
};

// For the Forgot Password flow
let resetTarget = '';

export const findAccountByContact = (identifier: string): Account | null => {
  const v = identifier.trim().toLowerCase();
  const digits = v.replace(/\D/g, '');
  for (const a of Object.values(readAccounts())) {
    const match = v.includes('@')
      ? a.email.toLowerCase() === v
      : digits.length >= 9 && a.phone.replace(/\D/g, '').endsWith(digits.slice(-9));
    if (match) {
      resetTarget = a.username;
      return a;
    }
  }
  return null;
};

export const setNewPassword = async (newPassword: string) => {
  const map = readAccounts();
  const a = map[resetTarget] ?? map[currentUser()];
  if (!a) return;
  a.hash = await hashPassword(a.username, newPassword);
  writeAccounts(map);
};
