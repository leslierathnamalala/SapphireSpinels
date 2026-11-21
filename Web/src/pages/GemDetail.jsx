import { Link, useParams } from 'react-router-dom';
import { GemArt } from '../components/GemArt';
import { GemCard } from '../components/GemCard';
import { GEMS, getGem } from '../data/gems';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatCarat, formatMoney } from '../utils/format';
import { NotFound } from './NotFound';

export function GemDetail() {
  const { id } = useParams();
  const gem = getGem(id);
  const { add, items } = useCart();
  const { notify } = useToast();
  useDocumentTitle(gem ? `${gem.name} · SapphireSpinels` : 'Stone · SapphireSpinels');

  if (!gem) return <NotFound />;

  const inCart = items.some((item) => item.id === gem.id);
  const related = GEMS.filter((item) => item.family === gem.family && item.id !== gem.id).slice(0, 3);
  const phenomenon = gem.type === 'Star' || gem.type === "Cat's Eye" ? gem.type : undefined;

  const onAdd = () => {
    const result = add(gem.id);
    notify(result === 'exists' ? `${gem.name} is already in your cart.` : `${gem.name} added to your cart.`);
  };

  return (
    <div className="detail-page">
      <div className="wrap detail-crumb">
        <Link to="/shop">Shop</Link>
        <span aria-hidden="true">/</span>
        <span>{gem.name}</span>
      </div>
      <div className="wrap detail-grid">
        <GemArt
          hue={gem.hue}
          accent={gem.accent}
          shape={gem.shape}
          phenomenon={phenomenon}
          sheen={gem.gemstone === 'Moonstone'}
          label={`${gem.name}, ${gem.shape} ${gem.gemstone}`}
        />
        <div>
          <p className="kicker">{gem.sku}</p>
          <h1>{gem.name}</h1>
          <p className="detail-price">{formatMoney(gem.price)}</p>
          <p className="lede">{gem.description}</p>
          <dl className="spec-list">
            <div><dt>Family</dt><dd>{gem.family}</dd></div>
            <div><dt>Gemstone</dt><dd>{gem.gemstone}</dd></div>
            <div><dt>Type</dt><dd>{gem.type}</dd></div>
            <div><dt>Shape</dt><dd>{gem.shape}</dd></div>
            <div><dt>Size</dt><dd>{gem.size} · {gem.dimensions}</dd></div>
            <div><dt>Carat</dt><dd>{formatCarat(gem.carat)}</dd></div>
            <div><dt>Origin</dt><dd>{gem.origin}, {gem.district}</dd></div>
          </dl>
          <p className="single-note">A single stone. Quantity is one, because the listing is this crystal and no other.</p>
          <div className="detail-actions">
            <button type="button" className="button button-solid" onClick={onAdd}>
              {inCart ? 'In your cart' : 'Add to cart'}
            </button>
            <Link className="button button-line" to="/cart">Go to cart</Link>
          </div>
        </div>
      </div>
      {related.length ? (
        <div className="wrap related">
          <h2>More from {gem.family}</h2>
          <div className="gem-grid">
            {related.map((item) => <GemCard key={item.id} gem={item} />)}
          </div>
        </div>
      ) : null}
    </div>
  );
}
