import '../src/index.css';
import '../src/components/Button.css';
import '../src/components/Card.css';
import '../src/components/Footer.css';
import '../src/components/ImagePlaceholder.css';
import '../src/components/Navbar.css';
import '../src/pages/About.css';
import '../src/pages/CareerFair.css';
import '../src/pages/Contact.css';
import '../src/pages/Events.css';
import '../src/pages/Home.css';
import '../src/pages/Partners.css';
import '../src/pages/Portal.css';
import '../src/pages/PreviousSponsors.css';
import '../src/pages/Legal.css';
import '../src/pages/SectorsBase.css';
import '../src/pages/SocialInsights.css';
import '../src/pages/Tiers.css';
import Head from 'next/head';
import { useRouter } from 'next/router';

const BASE_URL = 'https://jinnahleague.com';
const DEFAULT_OG_IMAGE = `${BASE_URL}/sponsorship-deck/misc/acm-logo-transparent.png`;

const SEO_BY_ROUTE = {
  '/': {
    title: "Jinnah League '26 Sponsorship Deck | ACM MAJU",
    description:
      "Explore sponsorship opportunities for Jinnah League '26, Pakistan's premier inter-university tech and gaming festival by ACM MAJU.",
  },
  '/about': {
    title: "About | Jinnah League '26 Sponsorship Deck",
    description:
      "Meet the executive team and student leaders behind Jinnah League '26 at ACM MAJU.",
  },
  '/career-fair': {
    title: "Career Fair | Jinnah League '26 Sponsorship Deck",
    description:
      "Showcase your company at the Jinnah League '26 Career Fair and connect with top student talent.",
  },
  '/contact': {
    title: "Contact | Jinnah League '26 Sponsorship Deck",
    description:
      "Contact ACM MAJU to become a sponsor or discuss partnership opportunities for Jinnah League '26.",
  },
  '/terms': {
    title: 'Terms of Service | Jinnah League',
    description: 'Terms governing use of the Jinnah League sponsorship deck and website content.',
  },
  '/privacy': {
    title: 'Privacy Policy | Jinnah League',
    description: 'How Jinnah League handles sponsorship inquiry and website-submitted information.',
  },
  '/events': {
    title: 'Legacy Events | Jinnah League Sponsorship Deck',
    description:
      "Review Jinnah League legacy editions from 2022 to 2024, including official participant and prize pool highlights.",
  },
  '/partners': {
    title: "Current Partners | Jinnah League '26 Sponsorship Deck",
    description:
      "Discover current partners supporting Jinnah League '26 and their role in empowering student innovation.",
  },
  '/previous-sponsors': {
    title: 'Previous Sponsors | Jinnah League Sponsorship Deck',
    description:
      "Explore sponsor history from Jinnah League legacy editions, including official 2023 and 2024 partner profiles.",
  },
  '/sectors': {
    title: 'Industry Sectors | Jinnah League Sponsorship Deck',
    description:
      'See sector-specific sponsorship benefits for banking, technology, media, education, and more.',
  },
  '/social-insights': {
    title: 'Social Insights | Jinnah League Sponsorship Deck',
    description:
      "View audience reach, engagement metrics, and digital visibility opportunities for Jinnah League '26 sponsors.",
  },
  '/tiers': {
    title: 'Sponsorship Packages | Jinnah League Sponsorship Deck',
    description:
      "Compare Jinnah League '26 sponsorship packages, pricing, and benefits from Silver to Title Sponsor.",
  },
  '/portal': {
    title: 'Portal Login | Jinnah League',
    description: 'Internal portal access for Jinnah League management team members.',
  },
  '/portal/dashboard': {
    title: 'Portal Dashboard | Jinnah League',
    description: 'Internal management dashboard for Jinnah League operations.',
  },
  '/portal/sponsors': {
    title: 'Portal Sponsors | Jinnah League',
    description: 'Internal sponsors management view for Jinnah League.',
  },
  '/portal/budget': {
    title: 'Portal Budget Tracker | Jinnah League',
    description: 'Internal budget tracking and allocation for Jinnah League.',
  },
  '/portal/expenditures': {
    title: 'Portal Expenditures | Jinnah League',
    description: 'Internal expenditure records and financial logs for Jinnah League.',
  },
  '/portal/reports': {
    title: 'Portal Reports | Jinnah League',
    description: 'Internal reports and analytics for Jinnah League operations.',
  },
  '/portal/settings': {
    title: 'Portal Settings | Jinnah League',
    description: 'Internal portal settings and team access management.',
  },
  '/sponsor-portal': {
    title: 'Sponsor Portal Login | Jinnah League',
    description: 'Login portal for Jinnah League sponsors to track partnership progress.',
  },
  '/sponsor-portal/dashboard': {
    title: 'Sponsor Dashboard | Jinnah League',
    description: 'Partnership overview and status for Jinnah League sponsors.',
  },
  '/sponsor-portal/deliverables': {
    title: 'Sponsor Deliverables | Jinnah League',
    description: 'Track sponsor deliverables and fulfillment progress.',
  },
  '/sponsor-portal/documents': {
    title: 'Sponsor Documents | Jinnah League',
    description: 'Access sponsor-related agreements, invoices, and records.',
  },
  '/sponsor-portal/social-proof': {
    title: 'Sponsor Social Proof | Jinnah League',
    description: 'Review sponsor social media coverage and visibility proof.',
  },
  '/sponsor-portal/event-info': {
    title: 'Sponsor Event Info | Jinnah League',
    description: 'Operational event-day details for Jinnah League sponsors.',
  },
};

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const pathname = router.pathname;
  const cleanPath = pathname || '/';
  const seo =
    SEO_BY_ROUTE[cleanPath] || {
      title: 'Jinnah League | ACM MAJU',
      description:
        "Jinnah League by ACM MAJU - inter-university tech and gaming festival sponsorship deck and event platform.",
    };

  const canonical = `${BASE_URL}${cleanPath === '/' ? '' : cleanPath}`;
  const noIndex = cleanPath.startsWith('/portal') || cleanPath.startsWith('/sponsor-portal');
  const robots = noIndex ? 'noindex, nofollow' : 'index, follow';

  return (
    <>
      <Head>
          <link rel="icon" href="/favicon.ico" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="robots" content={robots} />
        <link rel="canonical" href={canonical} />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Jinnah League" />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seo.title} />
        <meta name="twitter:description" content={seo.description} />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
