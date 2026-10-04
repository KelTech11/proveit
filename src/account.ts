const ACCOUNTS_KEY = 'proveit_accounts';
const LEGACY_KEY = 'proveit_account';
const CURRENT_KEY = 'proveit_current';

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

export const saveAccount = async (data: { username: string; email: string; phone: string; password: string }) => {
  const hash = await hashPassword(data.username, data.password);
  const map = readAccounts();
  map[data.username] = { username: data.username, email: data.email, phone: data.phone, hash };
  writeAccounts(map);
  setCurrentUser(data.username);
};

export const checkLogin = async (username: string, password: string): Promise<'ok' | 'no-account' | 'wrong'> => {
  const map = readAccounts();
  if (Object.keys(map).length === 0) return 'no-account';
  const a = map[username];
  if (!a) return 'wrong';
  if ((await hashPassword(username, password)) !== a.hash) return 'wrong';
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
