import { Link } from 'react-router-dom';
import { PageHero } from '../components/PageHero';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const viewing = [
  {
    title: 'Write ahead',
    text: 'Tell us which stone, or which colour, you want to see. The Colombo table is quieter when the parcel is already chosen.',
  },
  {
    title: 'See it by the window',
    text: 'Sapphire changes with the light. A viewing is daylight first, then a lamp, so heated blue and unheated blue can be told apart by the eye as well as by the note.',
  },
  {
    title: 'Leave with the sentence',
    text: 'You should be able to repeat the origin and the treatment without looking at a card. If you cannot, the house has not finished.',
  },
];

export function About() {
  useDocumentTitle('About Us · SapphireSpinels');

  return (
    <div className="about-page">
      <PageHero
        kicker="About us"
        title="Two rooms, one standard."
        lede="SapphireSpinels keeps a cutting desk in Ratnapura and a viewing room in Colombo. The work between them is to sell a Sri Lankan gem with its name and its treatment intact."
      />
      <section className="wrap prose-section">
        <div className="prose-grid">
          <div>
            <p className="kicker">The house</p>
            <h2>Spinel sits beside sapphire, not behind it.</h2>
          </div>
          <div className="prose">
            <p>
              The founders kept a shared desk in Ratnapura before there was a sign. Cutters, dealers,
              and the occasional Colombo client used the same cloth. Stones left the island every week
              with a colour and without a sentence. The house was started to refuse that habit.
            </p>
            <p>
              In 2014 the viewing room opened in Colombo so colour could be judged in daylight before
              a decision. The name was chosen in the same years: sapphire, because that is the stone
              the world asks Sri Lanka for, and spinel, because it had spent centuries being introduced
              as something else. The longer history of the island’s gems, and of this market, is told
              on the home page.
            </p>
            <p>
              <Link to="/#history">Read the gem history</Link>
              {' · '}
              <Link to="/#market">Read the market</Link>
            </p>
          </div>
        </div>
      </section>
      <section className="about-steps">
        <div className="wrap">
          <p className="kicker">A viewing</p>
          <h2>How a visit works.</h2>
          <div className="step-grid">
            {viewing.map((step, index) => (
              <article key={step.title}>
                <span>0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="wrap prose-section">
        <div className="prose-grid">
          <div>
            <p className="kicker">Disclosure</p>
            <h2>What we will say about a stone.</h2>
          </div>
          <div className="prose">
            <p>
              Family, gemstone, shape, size, carat, district when we know it, and treatment. Unheated
              means we have no reason to believe the colour was produced by heat. Heated means the
              colour was settled or brought up in the usual way of the modern sapphire trade. A star
              or an eye is named as a phenomenon, not as a mystery.
            </p>
            <p>
              We do not offer a single rate per carat. A sleepy three-carat blue and a bright one-carat
              blue are not neighbours. The shop lets you search the difference yourself.
            </p>
            <Link className="button button-solid" to="/contact">Arrange a viewing</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
