import { Routes, Route, Link } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  return (
    <div>
      <div className="container">
        <nav className="topnav">
          <Link to="/" className="brand" style={{ textDecoration: 'none', color: 'inherit' }}>
            LeadDesk <span className="brand-mark">MINI</span>
          </Link>
          <Link to="/admin" className="nav-link">
            Admin →
          </Link>
        </nav>
      </div>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>

      <Footer />
    </div>
  );
}
