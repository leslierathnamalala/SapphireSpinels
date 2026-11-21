function pagesToShow(page, pages) {
  const items = [];
  for (let number = 1; number <= pages; number += 1) {
    if (number === 1 || number === pages || Math.abs(number - page) <= 1) {
      items.push(number);
    } else if (items[items.length - 1] !== 'gap') {
      items.push('gap');
    }
  }
  return items;
}

export function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;
  const items = pagesToShow(page, pages);

  return (
    <nav className="pagination" aria-label="Shop pages">
      <button type="button" onClick={() => onPage(page - 1)} disabled={page === 1}>
        Previous
      </button>
      <ol>
        {items.map((item, index) => (
          <li key={`${item}-${index}`}>
            {item === 'gap' ? (
              <span aria-hidden="true">…</span>
            ) : (
              <button
                type="button"
                aria-current={item === page ? 'page' : undefined}
                onClick={() => onPage(item)}
              >
                {item}
              </button>
            )}
          </li>
        ))}
      </ol>
      <button type="button" onClick={() => onPage(page + 1)} disabled={page === pages}>
        Next
      </button>
    </nav>
  );
}
