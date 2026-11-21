import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GemCard } from '../components/GemCard';
import { PageHero } from '../components/PageHero';
import { Pagination } from '../components/Pagination';
import { catalogBounds, facetOptions } from '../data/gems';
import { SORTS } from '../data/gems';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatCarat, formatMoney } from '../utils/format';
import { hasActiveFilters, queryCatalog } from '../utils/catalog';

const FILTER_KEYS = ['q', 'size', 'shape', 'gem', 'type', 'family', 'minPrice', 'maxPrice', 'minCt', 'maxCt'];

function FilterGroup({ title, name, options, selected, onToggle }) {
  return (
    <fieldset>
      <legend>{title}</legend>
      <div className={name === 'gem' ? 'filter-options is-scroll' : 'filter-options'}>
        {options.map((option) => (
          <label key={option}>
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onToggle(option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function Shop() {
  useDocumentTitle('Shop · SapphireSpinels');
  const [params, setParams] = useSearchParams();
  const options = useMemo(() => facetOptions(), []);
  const bounds = useMemo(() => catalogBounds(), []);
  const catalog = useMemo(() => queryCatalog(params), [params]);
  const [open, setOpen] = useState(false);
  const resultsRef = useRef(null);
  const skipScroll = useRef(true);
  const { query } = catalog;

  useEffect(() => {
    const requested = Number(params.get('page') || 1);
    if (requested === catalog.page) return;
    const next = new URLSearchParams(params);
    if (catalog.page <= 1) next.delete('page');
    else next.set('page', String(catalog.page));
    setParams(next, { replace: true });
  }, [catalog.page, params, setParams]);

  useEffect(() => {
    if (skipScroll.current) {
      skipScroll.current = false;
      return;
    }
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [catalog.page]);

  const update = (mutate, resetPage = true) => {
    const next = new URLSearchParams(params);
    mutate(next);
    if (resetPage) next.delete('page');
    setParams(next, { replace: true });
  };

  const toggle = (key, value) => {
    update((next) => {
      const current = new Set((next.get(key) || '').split(',').filter(Boolean));
      if (current.has(value)) current.delete(value);
      else current.add(value);
      if (current.size) next.set(key, [...current].join(','));
      else next.delete(key);
    });
  };

  const setPrice = (edge, raw) => {
    const value = Number(raw);
    let min = query.priceMin;
    let max = query.priceMax;
    if (edge === 'min') min = Math.min(value, max);
    else max = Math.max(value, min);
    update((next) => {
      if (min <= bounds.priceMin) next.delete('minPrice');
      else next.set('minPrice', String(min));
      if (max >= bounds.priceMax) next.delete('maxPrice');
      else next.set('maxPrice', String(max));
    });
  };

  const setCarat = (edge, raw) => {
    const value = Number(raw);
    let min = query.caratMin;
    let max = query.caratMax;
    if (edge === 'min') min = Math.min(value, max);
    else max = Math.max(value, min);
    update((next) => {
      if (min <= bounds.caratMin + 0.001) next.delete('minCt');
      else next.set('minCt', min.toFixed(2));
      if (max >= bounds.caratMax - 0.001) next.delete('maxCt');
      else next.set('maxCt', max.toFixed(2));
    });
  };

  const clearFilters = () => {
    update((next) => {
      FILTER_KEYS.forEach((key) => next.delete(key));
    });
    setOpen(false);
  };

  return (
    <div className="shop-page">
      <PageHero
        compact
        kicker="The shop"
        title="Every stone currently on the table."
        lede="Search by size, shape, gemstone, type, family, price, and carat weight. Each result is one gem."
      />
      <div className="wrap shop-layout">
        <aside className={open ? 'filters is-open' : 'filters'} aria-label="Search gems">
          <div className="filters-head">
            <h2>Search</h2>
            {hasActiveFilters(query) ? (
              <button type="button" className="text-button" onClick={clearFilters}>Clear</button>
            ) : null}
          </div>
          <label className="search-field">
            Name
            <input
              type="search"
              value={query.q}
              placeholder="Search by name"
              onChange={(event) => update((next) => {
                const value = event.target.value;
                if (value) next.set('q', value);
                else next.delete('q');
              })}
            />
          </label>
          <FilterGroup title="Size" name="size" options={options.sizes} selected={query.size} onToggle={(value) => toggle('size', value)} />
          <FilterGroup title="Shape" name="shape" options={options.shapes} selected={query.shape} onToggle={(value) => toggle('shape', value)} />
          <FilterGroup title="Gemstone" name="gem" options={options.gemstones} selected={query.gemstone} onToggle={(value) => toggle('gem', value)} />
          <FilterGroup title="Type" name="type" options={options.types} selected={query.type} onToggle={(value) => toggle('type', value)} />
          <FilterGroup title="Family" name="family" options={options.families} selected={query.family} onToggle={(value) => toggle('family', value)} />
          <fieldset>
            <legend>Price range</legend>
            <div className="range-readout">
              <span>{formatMoney(query.priceMin)}</span>
              <span>{formatMoney(query.priceMax)}</span>
            </div>
            <label>
              Minimum
              <input type="range" min={bounds.priceMin} max={bounds.priceMax} step="10" value={query.priceMin} onChange={(event) => setPrice('min', event.target.value)} />
            </label>
            <label>
              Maximum
              <input type="range" min={bounds.priceMin} max={bounds.priceMax} step="10" value={query.priceMax} onChange={(event) => setPrice('max', event.target.value)} />
            </label>
          </fieldset>
          <fieldset>
            <legend>Carat weight</legend>
            <div className="range-readout">
              <span>{formatCarat(query.caratMin)}</span>
              <span>{formatCarat(query.caratMax)}</span>
            </div>
            <label>
              Minimum
              <input type="range" min={bounds.caratMin} max={bounds.caratMax} step="0.01" value={query.caratMin} onChange={(event) => setCarat('min', event.target.value)} />
            </label>
            <label>
              Maximum
              <input type="range" min={bounds.caratMin} max={bounds.caratMax} step="0.01" value={query.caratMax} onChange={(event) => setCarat('max', event.target.value)} />
            </label>
          </fieldset>
        </aside>

        <div className="shop-results" id="results" ref={resultsRef}>
          <div className="results-bar">
            <p>{catalog.total} {catalog.total === 1 ? 'stone' : 'stones'}</p>
            <div className="results-tools">
              <button type="button" className="filter-toggle" onClick={() => setOpen((value) => !value)}>
                {open ? 'Hide search' : 'Search'}
              </button>
              <label>
                Sort
                <select
                  value={query.sort}
                  onChange={(event) => update((next) => {
                    if (event.target.value === 'best') next.delete('sort');
                    else next.set('sort', event.target.value);
                  })}
                >
                  {SORTS.map((sort) => (
                    <option key={sort.id} value={sort.id}>{sort.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          {catalog.items.length ? (
            <div className="gem-grid">
              {catalog.items.map((gem) => <GemCard key={gem.id} gem={gem} />)}
            </div>
          ) : (
            <div className="empty-state">
              <h2>No stone matches that search.</h2>
              <p>Widen the price or carat range, or clear a family, and the table will fill again.</p>
              <button type="button" className="button button-solid" onClick={clearFilters}>Clear search</button>
            </div>
          )}
          <Pagination
            page={catalog.page}
            pages={catalog.pages}
            onPage={(page) => update((next) => {
              if (page <= 1) next.delete('page');
              else next.set('page', String(page));
            }, false)}
          />
        </div>
      </div>
    </div>
  );
}
