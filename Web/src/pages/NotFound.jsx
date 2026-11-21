import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function NotFound() {
  useDocumentTitle('Not found · SapphireSpinels');
  return (
    <div className="wrap not-found">
      <p className="kicker">Missing</p>
      <h1>That page is not on the table.</h1>
      <p>The stone may have been listed under another name, or the address may have wandered.</p>
      <Link className="button button-solid" to="/shop">Return to the shop</Link>
    </div>
  );
}
