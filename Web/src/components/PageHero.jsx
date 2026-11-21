export function PageHero({ kicker, title, lede, compact = false }) {
  return (
    <section className={compact ? 'page-hero is-compact' : 'page-hero'} data-hero>
      <div className="page-hero-bg" aria-hidden="true" />
      <p className="hero-watermark" aria-hidden="true">Ceylon</p>
      <div className="wrap page-hero-copy">
        <p className="kicker">{kicker}</p>
        <h1>{title}</h1>
        {lede ? <p className="lede">{lede}</p> : null}
      </div>
    </section>
  );
}
