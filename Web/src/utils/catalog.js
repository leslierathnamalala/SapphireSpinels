import { GEMS, PAGE_SIZE, SORTS, catalogBounds } from '../data/gems';

function split(value) {
  if (!value) return [];
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function numberOr(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function readQuery(params) {
  const bounds = catalogBounds();
  const sortIds = SORTS.map((sort) => sort.id);
  const requested = params.get('sort');
  return {
    q: params.get('q') || '',
    size: split(params.get('size')),
    shape: split(params.get('shape')),
    gemstone: split(params.get('gem')),
    type: split(params.get('type')),
    family: split(params.get('family')),
    priceMin: numberOr(params.get('minPrice'), bounds.priceMin),
    priceMax: numberOr(params.get('maxPrice'), bounds.priceMax),
    caratMin: numberOr(params.get('minCt'), bounds.caratMin),
    caratMax: numberOr(params.get('maxCt'), bounds.caratMax),
    sort: sortIds.includes(requested) ? requested : 'best',
  };
}

export function hasActiveFilters(query) {
  const bounds = catalogBounds();
  return Boolean(
    query.q
    || query.size.length
    || query.shape.length
    || query.gemstone.length
    || query.type.length
    || query.family.length
    || query.priceMin > bounds.priceMin
    || query.priceMax < bounds.priceMax
    || query.caratMin > bounds.caratMin + 0.001
    || query.caratMax < bounds.caratMax - 0.001,
  );
}

function matchesText(gem, q) {
  if (!q) return true;
  const haystack = `${gem.name} ${gem.gemstone} ${gem.family} ${gem.district}`.toLowerCase();
  return haystack.includes(q.trim().toLowerCase());
}

export function filterGems(query) {
  return GEMS.filter((gem) => {
    if (query.size.length && !query.size.includes(gem.size)) return false;
    if (query.shape.length && !query.shape.includes(gem.shape)) return false;
    if (query.gemstone.length && !query.gemstone.includes(gem.gemstone)) return false;
    if (query.type.length && !query.type.includes(gem.type)) return false;
    if (query.family.length && !query.family.includes(gem.family)) return false;
    if (gem.price < query.priceMin || gem.price > query.priceMax) return false;
    if (gem.carat < query.caratMin - 0.001 || gem.carat > query.caratMax + 0.001) return false;
    return matchesText(gem, query.q);
  });
}

export function sortGems(gems, sort) {
  const list = [...gems];
  if (sort === 'recent') {
    list.sort((a, b) => b.added.localeCompare(a.added) || a.name.localeCompare(b.name));
  } else if (sort === 'name-asc') {
    list.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'name-desc') {
    list.sort((a, b) => b.name.localeCompare(a.name));
  } else {
    list.sort((a, b) => b.sales - a.sales || a.name.localeCompare(b.name));
  }
  return list;
}

export function queryCatalog(params) {
  const query = readQuery(params);
  const matched = sortGems(filterGems(query), query.sort);
  const pages = Math.max(1, Math.ceil(matched.length / PAGE_SIZE) || 1);
  let page = numberOr(params.get('page'), 1);
  if (page < 1) page = 1;
  if (page > pages) page = pages;
  const start = (page - 1) * PAGE_SIZE;
  return {
    query,
    items: matched.slice(start, start + PAGE_SIZE),
    total: matched.length,
    pages,
    page,
  };
}
