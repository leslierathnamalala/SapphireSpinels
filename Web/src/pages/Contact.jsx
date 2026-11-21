import { useState } from 'react';
import { PageHero } from '../components/PageHero';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { isEmail } from '../utils/format';
import { readJson, writeJson } from '../utils/storage';

const EMPTY = { name: '', email: '', phone: '', subject: 'Viewing appointment', message: '' };

export function Contact() {
  useDocumentTitle('Contact Us · SapphireSpinels');
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const setField = (key) => (event) => {
    setSent(false);
    setError('');
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError('Enter your name.');
      return;
    }
    if (!isEmail(form.email)) {
      setError('Enter a valid email address.');
      return;
    }
    if (form.message.trim().length < 12) {
      setError('Write a few lines so the desk knows what you need.');
      return;
    }
    const messages = readJson('sapphirespinels.messages', []);
    writeJson('sapphirespinels.messages', [
      { ...form, id: `MSG-${Date.now().toString().slice(-6)}`, createdAt: new Date().toISOString() },
      ...messages,
    ]);
    setForm(EMPTY);
    setSent(true);
  };

  return (
    <div className="contact-page">
      <PageHero
        kicker="Contact us"
        title="Write to the desk."
        lede="Appointments, questions about a listing, and notes on treatment all come to the same table."
      />
      <div className="wrap contact-grid">
        <form className="stack-form contact-form" onSubmit={onSubmit}>
          <label>
            Name
            <input value={form.name} onChange={setField('name')} autoComplete="name" />
          </label>
          <label>
            Email
            <input value={form.email} onChange={setField('email')} autoComplete="email" inputMode="email" />
          </label>
          <label>
            Phone
            <input value={form.phone} onChange={setField('phone')} autoComplete="tel" />
          </label>
          <label>
            Subject
            <select value={form.subject} onChange={setField('subject')}>
              <option>Viewing appointment</option>
              <option>A stone on the site</option>
              <option>Cutting and treatment</option>
              <option>Something else</option>
            </select>
          </label>
          <label>
            Message
            <textarea rows="6" value={form.message} onChange={setField('message')} />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          {sent ? <p className="form-success">Saved on this device. The desk inbox is not connected in this preview, so the note stays in your browser.</p> : null}
          <button type="submit" className="button button-solid">Send message</button>
        </form>
        <aside className="visit-card">
          <p className="kicker">Rooms</p>
          <h2>Where to find the house</h2>
          <div>
            <h3>Colombo viewing room</h3>
            <p>Colombo 03<br />Tuesday to Saturday, 10:00–18:00<br />Daylight table by appointment</p>
          </div>
          <div>
            <h3>Ratnapura desk</h3>
            <p>Batugedara side of the gem town<br />Cutting and parcels, by appointment<br />+94 45 223 0184</p>
          </div>
          <div>
            <h3>Write</h3>
            <p>hello@sapphirespinels.lk</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
