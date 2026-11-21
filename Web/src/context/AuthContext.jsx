import { createContext, useContext, useMemo, useState } from 'react';
import { hashPassword } from '../utils/format';
import { readJson, writeJson } from '../utils/storage';

const SESSION_KEY = 'sapphirespinels.session';
const ACCOUNTS_KEY = 'sapphirespinels.accounts';
const AuthContext = createContext(null);

function publicUser(account) {
  return { name: account.name, email: account.email, provider: account.provider };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readJson(SESSION_KEY, null));

  const value = useMemo(() => {
    const persistSession = (account) => {
      const session = publicUser(account);
      writeJson(SESSION_KEY, session);
      setUser(session);
    };

    return {
      user,
      async signup({ name, email, password }) {
        const accounts = readJson(ACCOUNTS_KEY, []);
        const cleanEmail = email.trim().toLowerCase();
        if (accounts.some((account) => account.email === cleanEmail)) {
          return { ok: false, error: 'An account with that email is already on this device.' };
        }
        const account = {
          name: name.trim(),
          email: cleanEmail,
          provider: 'email',
          passwordHash: await hashPassword(password),
        };
        writeJson(ACCOUNTS_KEY, [...accounts, account]);
        persistSession(account);
        return { ok: true };
      },
      async login({ email, password }) {
        const accounts = readJson(ACCOUNTS_KEY, []);
        const cleanEmail = email.trim().toLowerCase();
        const account = accounts.find((item) => item.email === cleanEmail);
        if (!account) {
          return { ok: false, error: 'No account with that email is saved on this device yet.' };
        }
        if (account.provider !== 'email') {
          const label = account.provider === 'google' ? 'Google' : 'Facebook';
          return { ok: false, error: `That email was saved with ${label}. Continue with ${label} instead.` };
        }
        const passwordHash = await hashPassword(password);
        if (passwordHash !== account.passwordHash) {
          return { ok: false, error: 'That email and password do not match.' };
        }
        persistSession(account);
        return { ok: true };
      },
      continueWithProvider(provider, name, email) {
        const accounts = readJson(ACCOUNTS_KEY, []);
        const cleanEmail = email.trim().toLowerCase();
        const existing = accounts.find((item) => item.email === cleanEmail);
        if (existing && existing.provider === 'email') {
          return { ok: false, error: 'That email already has a password. Log in with email.' };
        }
        if (existing && existing.provider !== provider) {
          const label = existing.provider === 'google' ? 'Google' : 'Facebook';
          return { ok: false, error: `That email was saved with ${label}.` };
        }
        const account = existing ?? {
          name: name.trim(),
          email: cleanEmail,
          provider,
          passwordHash: null,
        };
        if (!existing) writeJson(ACCOUNTS_KEY, [...accounts, account]);
        persistSession(account);
        return { ok: true };
      },
      logout() {
        localStorage.removeItem(SESSION_KEY);
        setUser(null);
      },
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
