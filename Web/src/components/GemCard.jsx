import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatCarat, formatMoney } from '../utils/format';
import { GemArt } from './GemArt';

export function GemCard({ gem }) {
  const { add, items } = useCart();
  const { notify } = useToast();
  const inCart = items.some((item) => item.id === gem.id);

  const onMove = (event) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    event.currentTarget.style.setProperty('--ry', `${(x * 8).toFixed(2)}deg`);
    event.currentTarget.style.setProperty('--rx', `${(-y * 6).toFixed(2)}deg`);
  };

  const onLeave = (event) => {
    event.currentTarget.style.setProperty('--ry', '0deg');
    event.currentTarget.style.setProperty('--rx', '0deg');
  };

  const onAdd = () => {
    const result = add(gem.id);
    notify(result === 'exists' ? `${gem.name} is already in your cart.` : `${gem.name} added to your cart.`);
  };

  return (
    <article className="gem-card" onMouseMove={onMove} onMouseLeave={onLeave}>
      <Link to={`/shop/${gem.id}`} className="gem-card-link">
        <GemArt
          hue={gem.hue}
          accent={gem.accent}
          shape={gem.shape}
          phenomenon={gem.type === 'Star' || gem.type === "Cat's Eye" ? gem.type : undefined}
          sheen={gem.gemstone === 'Moonstone'}
          decorative
        />
        <div className="gem-card-meta">
          <h2>{gem.name}</h2>
          <p>{gem.family}</p>
          <p className="gem-card-facts">
            <span>{formatCarat(gem.carat)}</span>
            <span>{formatMoney(gem.price)}</span>
          </p>
        </div>
      </Link>
      <button type="button" className="text-button" onClick={onAdd}>
        {inCart ? 'In your cart' : 'Add to cart'}
      </button>
    </article>
  );
}
