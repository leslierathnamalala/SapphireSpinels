import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { GemArt } from '../components/GemArt';
import { GemCard } from '../components/GemCard';
import { FAMILY_ORDER, GEMS } from '../data/gems';
import {
  familyNotes,
  gemChapters,
  houseChapters,
  priceFactors,
  promises,
  regions,
  tradeSteps,
} from '../data/story';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const stageIds = ['ss-royal-cornflower', 'ss-crimson-spinel', 'ss-cats', 'ss-padma-dawn'];

function CountIn({ to }) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    let started = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started) return;
      started = true;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setValue(to);
        return;
      }
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min(1, (now - start) / 900);
        setValue(Math.round(to * (1 - (1 - progress) ** 3)));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.7 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [to]);

  return <span ref={ref}>{value}</span>;
}

export function Home() {
  useDocumentTitle('SapphireSpinels · Ceylon sapphire and spinel');
  const [chapter, setChapter] = useState(0);
  const [trade, setTrade] = useState(0);
  const chapterRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setChapter(Number(entry.target.dataset.index));
      });
    }, { rootMargin: '-42% 0px -42% 0px', threshold: 0.1 });
    chapterRefs.current.forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const stage = GEMS.find((gem) => gem.id === stageIds[chapter]) ?? GEMS[0];
  const featured = [...GEMS].sort((a, b) => b.sales - a.sales).slice(0, 4);

  const onHeroMove = (event) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--mx', ((event.clientX - rect.left) / rect.width - 0.5).toFixed(3));
    event.currentTarget.style.setProperty('--my', ((event.clientY - rect.top) / rect.height - 0.5).toFixed(3));
  };

  return (
    <div className="home">
      <section className="hero" data-hero onMouseMove={onHeroMove}>
        <div className="hero-bg" aria-hidden="true" />
        <p className="hero-watermark" aria-hidden="true">Ceylon</p>
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="kicker">Ratnapura · Colombo</p>
            <h1>Sapphire and spinel, with the note still attached.</h1>
            <p className="lede">
              SapphireSpinels is a house for Sri Lankan gemstones. Each listing is a single stone.
              Origin and treatment are written in plain language, the way they are said at the table.
            </p>
            <div className="hero-actions">
              <Link className="button button-solid" to="/shop">Shop the collection</Link>
              <a className="button button-ghost" href="#history">Read the history</a>
            </div>
          </div>
          <div className="hero-stage" aria-hidden="true">
            <div className="orbit" />
            <div className="hero-gem hero-gem-main">
              <GemArt hue="#1d4e89" accent="#d5e6fb" shape="Oval" decorative />
            </div>
            <div className="hero-gem hero-gem-spinel" data-parallax="-0.22">
              <GemArt hue="#a32038" accent="#f6c4ce" shape="Cushion" decorative />
            </div>
            <div className="hero-gem hero-gem-eye" data-parallax="0.28">
              <GemArt hue="#b7a15a" accent="#f6edd0" shape="Cabochon" phenomenon="Cat's Eye" decorative />
            </div>
          </div>
        </div>
        <a className="hero-scroll" href="#house">Scroll the house</a>
      </section>

      <section className="promise-band">
        <div className="wrap promise-grid">
          <article>
            <p><CountIn to={2} /></p>
            <h2>Rooms</h2>
            <span>A cutting desk in Ratnapura and a daylight table in Colombo.</span>
          </article>
          <article>
            <p><CountIn to={9} /></p>
            <h2>Families</h2>
            <span>From corundum and spinel to moonstone, in one gallery.</span>
          </article>
          <article>
            <p>1:1</p>
            <h2>Stones</h2>
            <span>One listing is one gem. When it goes, it is gone.</span>
          </article>
        </div>
      </section>

      <section className="house" id="house">
        <div className="wrap house-grid">
          <div>
            <p className="kicker">The store</p>
            <h2>A desk that refused to send a stone away unnamed.</h2>
            <div className="chapter-list">
              {houseChapters.map((item) => (
                <article key={item.title}>
                  <p>{item.year}</p>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="house-art">
            <div className="house-art-back" data-parallax="0.2">
              <GemArt hue="#8d74b5" accent="#e6dff6" shape="Oval" decorative />
            </div>
            <div className="house-art-front" data-parallax="-0.16">
              <GemArt hue="#1d4e89" accent="#c5daf8" shape="Cushion" decorative />
            </div>
            <p className="house-caption">Colour first. Then the sentence that says what was done to it.</p>
          </div>
        </div>
      </section>

      <section className="chronicle" id="history">
        <div className="wrap chronicle-head">
          <p className="kicker">Gem history</p>
          <h2>How a crystal from these gravels learned its names.</h2>
        </div>
        <div className="wrap chronicle-grid">
          <div className="chronicle-stage">
            <GemArt
              hue={stage.hue}
              accent={stage.accent}
              shape={stage.shape}
              phenomenon={stage.type === 'Star' || stage.type === "Cat's Eye" ? stage.type : undefined}
              label={stage.name}
            />
            <div className="stage-caption">
              <p>{gemChapters[chapter].era}</p>
              <h3>{stage.name}</h3>
              <span>{stage.gemstone} · {stage.district}</span>
            </div>
          </div>
          <div className="chronicle-copy">
            {gemChapters.map((item, index) => (
              <article
                key={item.title}
                data-index={index}
                ref={(node) => { chapterRefs.current[index] = node; }}
                className={index === chapter ? 'is-active' : undefined}
              >
                <p>{item.era}</p>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="reel" data-hscroll>
        <div className="reel-sticky">
          <div className="wrap">
            <p className="kicker">The families</p>
            <h2>Nine minerals. One island market.</h2>
          </div>
          <div className="reel-viewport">
            <div className="reel-track" data-hscroll-track>
              {FAMILY_ORDER.map((family) => {
                const gem = GEMS.find((item) => item.family === family);
                return (
                  <article key={family} className="family-card">
                    <GemArt hue={gem.hue} accent={gem.accent} shape={gem.shape} decorative />
                    <div>
                      <h3>{family}</h3>
                      <p>{familyNotes[family]}</p>
                      <Link to={`/shop?family=${encodeURIComponent(family)}`}>View {family}</Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="market" id="market">
        <div className="market-bg" data-parallax="0.12" aria-hidden="true" />
        <div className="wrap market-copy">
          <p className="kicker">The Sri Lankan gem market</p>
          <h2>From a pit in the gravel to a table in Colombo.</h2>
          <p className="lede">
            There is no single price per carat for a Ceylon sapphire. The market is a chain of pits,
            parcels, wheels, and licensed rooms, and a stone’s price is the sum of its colour, its
            cut, its size, and whether anyone had to heat it to wake the colour up.
          </p>

          <div className="trade-path" role="list">
            {tradeSteps.map((step, index) => (
              <button
                key={step.title}
                type="button"
                role="listitem"
                className={trade === index ? 'is-active' : undefined}
                onClick={() => setTrade(index)}
                aria-pressed={trade === index}
              >
                <span>0{index + 1}</span>
                {step.title}
              </button>
            ))}
          </div>
          <p className="trade-detail">{tradeSteps[trade].text}</p>

          <div className="region-grid">
            {regions.map((region, index) => (
              <article key={region.name} data-parallax={(index - 2) * 0.06}>
                <h3>{region.name}</h3>
                <p>{region.note}</p>
              </article>
            ))}
          </div>

          <div className="factor-grid">
            {priceFactors.map((factor) => (
              <article key={factor.title}>
                <h3>{factor.title}</h3>
                <p>{factor.text}</p>
              </article>
            ))}
          </div>

          <div className="market-note">
            <h3>How the house sits in that market</h3>
            <p>
              SapphireSpinels buys through licensed channels and sells with the district when it is known.
              The National Gem and Jewellery Authority is the body that licenses much of Sri Lanka’s gem
              and jewellery trade, including export. A buyer should expect a dealer to speak plainly about
              that world, and about treatment. Heat is not a scandal. Silence about heat is.
            </p>
            <p>
              Padparadscha, unheated royal blue, a sharp cat’s eye, and a fine red spinel are the stones
              the market still lowers its voice for. Heated blue sapphire is the working heart of the
              trade, and it deserves an honest price rather than a borrowed story. Zircon on this table
              is natural zircon. It is not cubic zirconia.
            </p>
          </div>
        </div>
      </section>

      <section className="featured">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="kicker">In the gallery</p>
              <h2>Stones the table returns to.</h2>
            </div>
            <Link to="/shop?sort=best">Shop best selling</Link>
          </div>
          <div className="gem-grid featured-grid">
            {featured.map((gem) => <GemCard key={gem.id} gem={gem} />)}
          </div>
        </div>
      </section>

      <section className="close-band">
        <div className="wrap close-grid">
          <div>
            <p className="kicker">Before you buy</p>
            <h2>Three things the house will not leave off a listing.</h2>
          </div>
          <div className="promise-list">
            {promises.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
          <Link className="button button-solid" to="/shop">Enter the shop</Link>
        </div>
      </section>
    </div>
  );
}
