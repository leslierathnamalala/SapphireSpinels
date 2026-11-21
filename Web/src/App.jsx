import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { About } from './pages/About';
import { Cart } from './pages/Cart';
import { Contact } from './pages/Contact';
import { GemDetail } from './pages/GemDetail';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';
import { Shop } from './pages/Shop';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="shop/:id" element={<GemDetail />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="cart" element={<Cart />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
