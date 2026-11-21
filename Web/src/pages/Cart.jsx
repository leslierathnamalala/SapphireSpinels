import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { GemArt } from '../components/GemArt';
import { PageHero } from '../components/PageHero';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatCarat, formatMoney, isEmail, luhnValid } from '../utils/format';
import { readJson, writeJson } from '../utils/storage';

const COUNTRIES = ['Sri Lanka', 'Singapore', 'United Kingdom', 'United States', 'Australia', 'United Arab Emirates'];
const EMPTY_ADDRESS = { name: '', email: '', phone: '', line1: '', city: '', postal: '', country: 'Sri Lanka' };
const METHODS = [
  { id: 'card', title: 'Credit or debit card', copy: 'Visa and Mastercard. Use 4242 4242 4242 4242 in this preview.' },
  { id: 'bank', title: 'Bank transfer', copy: 'A proforma in USD or LKR, settled before the stone is released.' },
  { id: 'cod', title: 'Cash on delivery', copy: 'For Sri Lankan addresses, paid when the insured parcel arrives.' },
  { id: 'instalment', title: 'Pay in 3', copy: 'A local instalment option in the spirit of Mintpay or Koko. Approval is not connected in this preview.' },
];

function expiryValid(value) {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value.trim());
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  return new Date(year, month, 1) > new Date();
}

function AddressFields({ legend, value, onChange }) {
  const set = (key) => (event) => onChange({ ...value, [key]: event.target.value });
  return (
    <fieldset className="address-fields">
      <legend>{legend}</legend>
      <label>Full name<input value={value.name} onChange={set('name')} autoComplete="name" /></label>
      <label>Email<input value={value.email} onChange={set('email')} autoComplete="email" inputMode="email" /></label>
      <label>Phone<input value={value.phone} onChange={set('phone')} autoComplete="tel" /></label>
      <label className="span-2">Address<input value={value.line1} onChange={set('line1')} autoComplete="address-line1" /></label>
      <label>City<input value={value.city} onChange={set('city')} autoComplete="address-level2" /></label>
      <label>Postal code<input value={value.postal} onChange={set('postal')} autoComplete="postal-code" /></label>
      <label className="span-2">
        Country
        <select value={value.country} onChange={set('country')} autoComplete="country-name">
          {COUNTRIES.map((country) => <option key={country}>{country}</option>)}
        </select>
      </label>
    </fieldset>
  );
}

function addressErrors(address) {
  const errors = {};
  if (!address.name.trim()) errors.name = 'Enter the full name.';
  if (!isEmail(address.email)) errors.email = 'Enter a valid email.';
  if (address.phone.trim().length < 7) errors.phone = 'Enter a phone number.';
  if (address.line1.trim().length < 4) errors.line1 = 'Enter the street address.';
  if (!address.city.trim()) errors.city = 'Enter the city.';
  if (!address.postal.trim()) errors.postal = 'Enter the postal code.';
  return errors;
}

export function Cart() {
  useDocumentTitle('Cart · SapphireSpinels');
  const { user } = useAuth();
  const { items, subtotal, setQty, remove, clear } = useCart();
  const [step, setStep] = useState('bag');
  const [same, setSame] = useState(true);
  const [billing, setBilling] = useState(EMPTY_ADDRESS);
  const [delivery, setDelivery] = useState(EMPTY_ADDRESS);
  const [method, setMethod] = useState('card');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvc: '' });
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState([]);
  const [order, setOrder] = useState(null);
  const skipStepScroll = useRef(true);

  useEffect(() => {
    if (!user) return;
    setBilling((current) => ({
      ...current,
      name: current.name || user.name,
      email: current.email || user.email,
    }));
  }, [user]);

  const destination = same ? billing : delivery;
  const codAllowed = destination.country === 'Sri Lanka';
  const methodMeta = METHODS.find((item) => item.id === method);

  useEffect(() => {
    if (method === 'cod' && !codAllowed) setMethod('card');
  }, [codAllowed, method]);

  useEffect(() => {
    if (skipStepScroll.current) {
      skipStepScroll.current = false;
      return;
    }
    document.querySelector('.steps')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [step]);

  const summary = useMemo(() => items, [items]);
  const summaryItems = step === 'done' && order
    ? order.items.map((item) => ({ id: item.id, name: item.name, lineTotal: item.price * item.qty }))
    : summary;
  const summaryTotal = step === 'done' && order ? order.total : subtotal;

  const continueDetails = () => {
    const nextErrors = Object.values(addressErrors(billing));
    if (!same) nextErrors.push(...Object.values(addressErrors(delivery)));
    setErrors(nextErrors);
    if (!nextErrors.length) setStep('payment');
  };

  const placeOrder = () => {
    const nextErrors = [];
    if (method === 'card') {
      if (!luhnValid(card.number)) nextErrors.push('Enter a valid card number. 4242 4242 4242 4242 will pass this preview.');
      if (card.name.trim().length < 2) nextErrors.push('Enter the name on the card.');
      if (!expiryValid(card.expiry)) nextErrors.push('Enter an expiry as MM/YY, later than this month.');
      if (!/^\d{3,4}$/.test(card.cvc.trim())) nextErrors.push('Enter a 3 or 4 digit security code.');
    }
    if (method === 'cod' && !codAllowed) nextErrors.push('Cash on delivery is available for Sri Lankan addresses.');
    if (!agree) nextErrors.push('Confirm that you understand this preview does not take payment.');
    setErrors(nextErrors);
    if (nextErrors.length || !items.length) return;

    const record = {
      id: `SS-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty,
      })),
      total: subtotal,
      billing,
      delivery: same ? { ...billing, sameAsBilling: true } : delivery,
      paymentMethod: method,
    };
    const orders = readJson('sapphirespinels.orders', []);
    writeJson('sapphirespinels.orders', [record, ...orders]);
    clear();
    setOrder(record);
    setCard({ number: '', name: '', expiry: '', cvc: '' });
    setStep('done');
  };

  return (
    <div className="cart-page">
      <PageHero
        compact
        kicker="Cart"
        title={step === 'done' ? 'The preview order is held.' : 'Your stones, then the address, then the way you would pay.'}
        lede="Checkout collects billing and delivery details and shows the payment options. Nothing is charged in this preview."
      />
      <div className="wrap cart-layout">
        <div>
          <ol className="steps" aria-label="Checkout progress">
            {['bag', 'details', 'payment', 'done'].map((id, index) => (
              <li key={id} className={step === id ? 'is-current' : undefined}>
                <span>0{index + 1}</span>
                {id === 'bag' ? 'Cart' : id === 'details' ? 'Details' : id === 'payment' ? 'Payment' : 'Confirmation'}
              </li>
            ))}
          </ol>

          {step === 'done' && order ? (
            <section className="confirmation">
              <p className="kicker">Order {order.id}</p>
              <h2>Held on this device. Not charged, not shipped.</h2>
              <p>
                A confirmation of this preview would go to {order.billing.email}. Payment choice: {METHODS.find((item) => item.id === order.paymentMethod)?.title}.
                The stones in the order were {order.items.map((item) => item.name).join(', ')}.
              </p>
              <p>Total recorded: {formatMoney(order.total)}. Card numbers are not stored.</p>
              <Link className="button button-solid" to="/shop">Return to the shop</Link>
            </section>
          ) : null}

          {step !== 'done' && !summary.length ? (
            <div className="empty-state">
              <h2>The cart is empty.</h2>
              <p>Each listing is a single gem. Add one from the shop and it will wait here.</p>
              <Link className="button button-solid" to="/shop">Browse the shop</Link>
            </div>
          ) : null}

          {step === 'bag' && summary.length ? (
            <div className="bag-list">
              {summary.map((item) => (
                <article key={item.id} className="bag-row">
                  <Link to={`/shop/${item.id}`} className="bag-art" aria-label={item.name}>
                    <GemArt hue={item.hue} accent={item.accent} shape={item.shape} decorative />
                  </Link>
                  <div>
                    <h2><Link to={`/shop/${item.id}`}>{item.name}</Link></h2>
                    <p>{item.family} · {formatCarat(item.carat)}</p>
                    <p className="single-note">Single stone</p>
                  </div>
                  <div className="qty" aria-label={`Quantity for ${item.name}`}>
                    <button type="button" onClick={() => setQty(item.id, item.qty - 1)} disabled={item.qty <= 1} aria-label="Decrease quantity">−</button>
                    <span>{item.qty}</span>
                    <button type="button" onClick={() => setQty(item.id, item.qty + 1)} disabled={item.qty >= item.stock} aria-label="Increase quantity">+</button>
                  </div>
                  <p className="line-price">{formatMoney(item.lineTotal)}</p>
                  <button type="button" className="text-button" onClick={() => remove(item.id)}>Remove</button>
                </article>
              ))}
              <button type="button" className="button button-solid" onClick={() => setStep('details')}>Continue to details</button>
            </div>
          ) : null}

          {step === 'details' && summary.length ? (
            <div className="checkout-panel">
              <AddressFields legend="Billing details" value={billing} onChange={setBilling} />
              <label className="check-line">
                <input type="checkbox" checked={same} onChange={(event) => setSame(event.target.checked)} />
                <span>Delivery details are the same as billing</span>
              </label>
              {same ? null : <AddressFields legend="Delivery details" value={delivery} onChange={setDelivery} />}
              {errors.length ? <ul className="form-error">{errors.map((error) => <li key={error}>{error}</li>)}</ul> : null}
              <div className="step-actions">
                <button type="button" className="button button-line" onClick={() => setStep('bag')}>Back to cart</button>
                <button type="button" className="button button-solid" onClick={continueDetails}>Continue to payment</button>
              </div>
            </div>
          ) : null}

          {step === 'payment' && summary.length ? (
            <div className="checkout-panel">
              <fieldset className="pay-options">
                <legend>Payment options</legend>
                {METHODS.map((item) => {
                  const disabled = item.id === 'cod' && !codAllowed;
                  return (
                    <label key={item.id} className={disabled ? 'is-disabled' : undefined}>
                      <input
                        type="radio"
                        name="payment"
                        value={item.id}
                        disabled={disabled}
                        checked={method === item.id}
                        onChange={() => setMethod(item.id)}
                      />
                      <span>
                        <strong>{item.title}</strong>
                        <small>{disabled ? 'Available when delivery is in Sri Lanka.' : item.copy}</small>
                      </span>
                    </label>
                  );
                })}
              </fieldset>
              {method === 'card' ? (
                <fieldset className="address-fields">
                  <legend>Card</legend>
                  <label className="span-2">
                    Number
                    <input
                      inputMode="numeric"
                      autoComplete="cc-number"
                      placeholder="4242 4242 4242 4242"
                      value={card.number}
                      onChange={(event) => {
                        const digits = event.target.value.replace(/[^\d]/g, '').slice(0, 16);
                        const grouped = digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
                        setCard((current) => ({ ...current, number: grouped }));
                      }}
                    />
                  </label>
                  <label className="span-2">
                    Name on card
                    <input autoComplete="cc-name" value={card.name} onChange={(event) => setCard((current) => ({ ...current, name: event.target.value }))} />
                  </label>
                  <label>
                    Expiry
                    <input autoComplete="cc-exp" placeholder="MM/YY" value={card.expiry} onChange={(event) => setCard((current) => ({ ...current, expiry: event.target.value }))} />
                  </label>
                  <label>
                    CVC
                    <input autoComplete="cc-csc" inputMode="numeric" value={card.cvc} onChange={(event) => setCard((current) => ({ ...current, cvc: event.target.value.replace(/\D/g, '').slice(0, 4) }))} />
                  </label>
                </fieldset>
              ) : (
                <p className="pay-copy">{methodMeta?.copy} No payment is captured in this preview.</p>
              )}
              <label className="check-line">
                <input type="checkbox" checked={agree} onChange={(event) => setAgree(event.target.checked)} />
                <span>I understand this is a preview checkout. Nothing will be charged or shipped.</span>
              </label>
              {errors.length ? <ul className="form-error">{errors.map((error) => <li key={error}>{error}</li>)}</ul> : null}
              <div className="step-actions">
                <button type="button" className="button button-line" onClick={() => { setErrors([]); setStep('details'); }}>Back to details</button>
                <button type="button" className="button button-solid" onClick={placeOrder}>Place preview order</button>
              </div>
            </div>
          ) : null}
        </div>

        <aside className="summary">
          <h2>Summary</h2>
          {summaryItems.length ? summaryItems.map((item) => (
            <p key={item.id} className="summary-line">
              <span>{item.name}</span>
              <span>{formatMoney(item.lineTotal)}</span>
            </p>
          )) : <p>No stones yet.</p>}
          <p className="summary-line"><span>Stones</span><span>{formatMoney(summaryTotal)}</span></p>
          <p className="summary-line"><span>Shipping</span><span>Quoted later</span></p>
          <p className="summary-total"><span>Total now</span><span>{formatMoney(summaryTotal)}</span></p>
          <p className="summary-note">Insured delivery is arranged with the final invoice. This preview adds no shipping fee and takes no payment.</p>
        </aside>
      </div>
    </div>
  );
}
