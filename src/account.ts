const KEY = 'proveit_account';

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

export const loadAccount = (): Account | null => {
  try {
    const a = JSON.parse(localStorage.getItem(KEY) || 'null');
    return a && a.username && a.hash ? a : null;
  } catch {
    return null;
  }
};

export const saveAccount = async (data: { username: string; email: string; phone: string; password: string }) => {
  const hash = await hashPassword(data.username, data.password);
  try {
    localStorage.setItem(KEY, JSON.stringify({ username: data.username, email: data.email, phone: data.phone, hash }));
  } catch {}
};

export const checkLogin = async (username: string, password: string): Promise<'ok' | 'no-account' | 'wrong'> => {
  const a = loadAccount();
  if (!a) return 'no-account';
  if (a.username !== username) return 'wrong';
  return (await hashPassword(username, password)) === a.hash ? 'ok' : 'wrong';
};

// For the Forgot Password flow
export const findAccountByContact = (identifier: string): Account | null => {
  const a = loadAccount();
  if (!a) return null;
  const v = identifier.trim().toLowerCase();
  if (v.includes('@')) return a.email.toLowerCase() === v ? a : null;
  const digits = v.replace(/\D/g, '');
  const mine = a.phone.replace(/\D/g, '');
  return digits.length >= 9 && mine.endsWith(digits.slice(-9)) ? a : null;
};

export const setNewPassword = async (newPassword: string) => {
  const a = loadAccount();
  if (!a) return;
  a.hash = await hashPassword(a.username, newPassword);
  try {
    localStorage.setItem(KEY, JSON.stringify(a));
  } catch {}
};