import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Tiers from './pages/Tiers';
import CareerFair from './pages/CareerFair';
import Sectors from './pages/Sectors';
import PreviousSponsors from './pages/PreviousSponsors';
import Events from './pages/Events';
import SocialInsights from './pages/SocialInsights';
import Contact from './pages/Contact';
import Portal from './pages/Portal';
import SponsorPortal from './pages/SponsorPortal';
import Partners from './pages/Partners';

const isPortalRoute = () => {
  const path = window.location.pathname;
  return path.startsWith('/portal') || path.startsWith('/sponsor-portal');
};

function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '80vh' }}>{children}</main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<AppLayout><Home /></AppLayout>} />
        <Route path="/about" element={<AppLayout><About /></AppLayout>} />
        <Route path="/tiers" element={<AppLayout><Tiers /></AppLayout>} />
        <Route path="/career-fair" element={<AppLayout><CareerFair /></AppLayout>} />
        <Route path="/sectors" element={<AppLayout><Sectors /></AppLayout>} />
        <Route path="/previous-sponsors" element={<AppLayout><PreviousSponsors /></AppLayout>} />
        <Route path="/events" element={<AppLayout><Events /></AppLayout>} />
        <Route path="/social-insights" element={<AppLayout><SocialInsights /></AppLayout>} />
        <Route path="/contact" element={<AppLayout><Contact /></AppLayout>} />
        <Route path="/partners" element={<AppLayout><Partners /></AppLayout>} />

        {/* Admin Portal (no public navbar/footer) */}
        <Route path="/portal/*" element={<Portal />} />

        {/* Sponsor-Facing Portal (separate auth) */}
        <Route path="/sponsor-portal/*" element={<SponsorPortal />} />
      </Routes>
    </Router>
  );
}

export default App;
