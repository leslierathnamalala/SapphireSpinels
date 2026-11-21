import { useEffect, useId, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { isEmail, passwordIssue } from '../utils/format';

const SOCIAL = {
  google: {
    label: 'Google',
    name: 'Preview account',
    email: 'preview.google@sapphirespinels.test',
  },
  facebook: {
    label: 'Facebook',
    name: 'Preview account',
    email: 'preview.facebook@sapphirespinels.test',
  },
};

export function AuthModal({ open, onClose }) {
  const { login, signup, continueWithProvider } = useAuth();
  const titleId = useId();
  const dialogRef = useRef(null);
  const returnFocus = useRef(null);
  const [mode, setMode] = useState('login');
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });

  useEffect(() => {
    if (!open) return undefined;
    returnFocus.current = document.activeElement;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = window.setTimeout(() => {
      dialogRef.current?.querySelector('input, button')?.focus();
    }, 0);
    return () => {
      document.body.style.overflow = previous;
      window.clearTimeout(timer);
      returnFocus.current?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setMode('login');
      setProvider(null);
      setError('');
      setPending(false);
      setForm({ name: '', email: '', password: '', confirm: '' });
    }
  }, [open]);

  if (!open) return null;

  const setField = (key) => (event) => {
    setError('');
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== 'Tab' || !dialogRef.current) return;
    const nodes = [...dialogRef.current.querySelectorAll('button, input, a')].filter((node) => !node.disabled);
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  const submitEmail = async (event) => {
    event.preventDefault();
    setError('');
    if (!isEmail(form.email)) {
      setError('Enter a valid email address.');
      return;
    }
    if (mode === 'signup') {
      if (!form.name.trim()) {
        setError('Enter the name you would like on the account.');
        return;
      }
      const issue = passwordIssue(form.password);
      if (issue) {
        setError(issue);
        return;
      }
      if (form.password !== form.confirm) {
        setError('The two passwords do not match.');
        return;
      }
    } else if (!form.password) {
      setError('Enter your password.');
      return;
    }

    setPending(true);
    const result = mode === 'signup'
      ? await signup(form)
      : await login({ email: form.email, password: form.password });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onClose();
  };

  const submitProvider = (event) => {
    event.preventDefault();
    if (!provider) return;
    if (!form.name.trim()) {
      setError('Enter the name on this account.');
      return;
    }
    if (!isEmail(form.email)) {
      setError('Enter a valid email address.');
      return;
    }
    const result = continueWithProvider(provider, form.name, form.email);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onClose();
  };

  const openProvider = (next) => {
    setProvider(next);
    setError('');
    setForm({
      name: SOCIAL[next].name,
      email: SOCIAL[next].email,
      password: '',
      confirm: '',
    });
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={dialogRef}
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <p className="kicker">Account</p>
        <h2 id={titleId}>{provider ? `Continue with ${SOCIAL[provider].label}` : mode === 'signup' ? 'Create an account' : 'Log in'}</h2>
        <p className="modal-note">
          This preview keeps the account in this browser. Google and Facebook are not contacted, and no password leaves the device.
        </p>

        {provider ? (
          <form onSubmit={submitProvider} className="stack-form">
            <label>
              Name
              <input value={form.name} onChange={setField('name')} autoComplete="name" />
            </label>
            <label>
              Email
              <input value={form.email} onChange={setField('email')} autoComplete="email" inputMode="email" />
            </label>
            {error ? <p className="form-error">{error}</p> : null}
            <button type="submit" className="button button-solid">Continue</button>
            <button type="button" className="text-button" onClick={() => { setProvider(null); setError(''); }}>
              Back
            </button>
          </form>
        ) : (
          <>
            <div className="auth-switch" role="tablist" aria-label="Account mode">
              <button type="button" role="tab" aria-selected={mode === 'login'} onClick={() => { setMode('login'); setError(''); }}>
                Log in
              </button>
              <button type="button" role="tab" aria-selected={mode === 'signup'} onClick={() => { setMode('signup'); setError(''); }}>
                Create account
              </button>
            </div>
            <form onSubmit={submitEmail} className="stack-form">
              {mode === 'signup' ? (
                <label>
                  Name
                  <input value={form.name} onChange={setField('name')} autoComplete="name" />
                </label>
              ) : null}
              <label>
                Email
                <input value={form.email} onChange={setField('email')} autoComplete="email" inputMode="email" />
              </label>
              <label>
                Password
                <input value={form.password} onChange={setField('password')} type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
              </label>
              {mode === 'signup' ? (
                <label>
                  Confirm password
                  <input value={form.confirm} onChange={setField('confirm')} type="password" autoComplete="new-password" />
                </label>
              ) : null}
              {error ? <p className="form-error">{error}</p> : null}
              <button type="submit" className="button button-solid" disabled={pending}>
                {pending ? 'Please wait' : mode === 'signup' ? 'Create account' : 'Log in'}
              </button>
            </form>
            <div className="auth-divider"><span>or</span></div>
            <div className="social-actions">
              <button type="button" className="button button-social" onClick={() => openProvider('google')}>
                Continue with Google
              </button>
              <button type="button" className="button button-social" onClick={() => openProvider('facebook')}>
                Continue with Facebook
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
