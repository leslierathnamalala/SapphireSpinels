import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getGem } from '../data/gems';
import { readJson, writeJson } from '../utils/storage';

const CART_KEY = 'sapphirespinels.cart';
const CartContext = createContext(null);

function sanitize(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => ({ id: item.id, qty: Number(item.qty) || 1 }))
    .filter((item) => getGem(item.id));
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => sanitize(readJson(CART_KEY, [])));

  useEffect(() => {
    writeJson(CART_KEY, items);
  }, [items]);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === CART_KEY) setItems(sanitize(readJson(CART_KEY, [])));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo(() => {
    const detailed = items
      .map((item) => {
        const gem = getGem(item.id);
        if (!gem) return null;
        const qty = Math.min(Math.max(item.qty, 1), gem.stock);
        return { ...gem, qty, lineTotal: gem.price * qty };
      })
      .filter(Boolean);

    return {
      items: detailed,
      count: detailed.reduce((sum, item) => sum + item.qty, 0),
      subtotal: detailed.reduce((sum, item) => sum + item.lineTotal, 0),
      add(id) {
        const gem = getGem(id);
        if (!gem) return 'missing';
        if (items.some((item) => item.id === id)) return 'exists';
        setItems((current) => (current.some((item) => item.id === id) ? current : [...current, { id, qty: 1 }]));
        return 'added';
      },
      setQty(id, qty) {
        const gem = getGem(id);
        if (!gem) return;
        const nextQty = Math.min(Math.max(Number(qty) || 1, 1), gem.stock);
        setItems((current) => current.map((item) => (item.id === id ? { ...item, qty: nextQty } : item)));
      },
      remove(id) {
        setItems((current) => current.filter((item) => item.id !== id));
      },
      clear() {
        setItems([]);
      },
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
