import 'bootstrap/dist/css/bootstrap.min.css';
import './css/App.scss';
import { Routes, Route, NavLink, Link, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import Main from './Main';
import Phi from './components/Phi';
import HexCluster from './components/HexCluster';
import SquarePyramidalStack from './components/SquarePyramidalStack';
//import PythagCList from './components/PythagCList';
import PythagTriples from './components/PythagTriples';
import Calendar from './components/Calendar';
import CalendarLab from './components/CalendarLab';
import CalendarInstructions from './components/CalendarInstructions';
//import Mastermind from './components/mastermind/AppSolves';
//import Wordle from './components/wordle/AppSolves';
import Denom from './components/Denom';
import PythagoreanTriplesLab from './components/PythagoreanTriplesLab';
import LucasLab from './components/LucasLab';
import FibonacciLab from './components/FibonacciLab';

function App() {
  const [menuState, setMenuState] = useState(false);
  const [pageMenuOpen, setPageMenuOpen] = useState(false);
  const location = useLocation();

  const navContainerRef = useRef(null);
  const hamburgerIconRef = useRef(null);
  const pageMenuRef = useRef(null);

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuState);
    const closeOnEscape = event => event.key === 'Escape' && setMenuState(false);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.classList.remove('menu-open');
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuState]);

  useEffect(() => {
    setPageMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    // The calendar manages its own initial position by scrolling to the current
    // year. Do not overwrite that page-specific behavior with the route reset.
    if (location.pathname === '/calendar') return undefined;

    // Mobile Safari can restore/anchor the old page's scroll position after the
    // new route has mounted. Reset once now and once after the new layout has
    // been painted so route content always starts below the fixed masthead.
    window.scrollTo(0, 0);
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname]);

  useEffect(() => {
    if (!pageMenuOpen) return undefined;

    const closePageMenu = event => {
      if (event.key === 'Escape' || !pageMenuRef.current?.contains(event.target)) {
        setPageMenuOpen(false);
      }
    };

    document.addEventListener('keydown', closePageMenu);
    document.addEventListener('mousedown', closePageMenu);
    return () => {
      document.removeEventListener('keydown', closePageMenu);
      document.removeEventListener('mousedown', closePageMenu);
    };
  }, [pageMenuOpen]);

  const toggleMenu = () => {
    setMenuState(!menuState);
  }

  const navItems = [
    ['/', 'Home', '⌂'],
    ['/calendar', '12-Digit Calendar', '12'],
    ['/denom', 'Decimal Expansions', '.3'],
    ['/pythagorean-triples-lab', 'Pythagorean Triples', '△'],
    ['/phi', 'Powers of Phi', 'φ'],
    ['/fibonacci-lab', 'Fibonacci Lab', '∞'],
    ['/lucas-lab', 'Square Root Lab', '√'],
    ['/hex-cluster', 'Hex Cluster', '⬡'],
    ['/square-pyramidal-stack', 'Square Pyramidal Stack', '▦'],
  ];

  const hasCalendarMenu = location.pathname === '/calendar';

  return (
    <div className="App">
      <div
        ref={navContainerRef}
        onMouseDown={event => event.target === event.currentTarget && setMenuState(false)}
        className={`nav-container ${menuState ? 'show-nav-menu' : 'hide-nav-menu'}`}
        aria-hidden={!menuState}
      >
        <nav aria-label="Math toys navigation">
          <div className="nav-heading">
            <span>Explore</span>
            <button className="nav-close" onClick={() => setMenuState(false)} aria-label="Close menu">×</button>
          </div>
          <ul>
            {navItems.map(([to, label, symbol]) => (
              <li key={to}>
                <NavLink to={to} end={to === '/'} onClick={() => setMenuState(false)}>
                  <span className="nav-symbol" aria-hidden="true">{symbol}</span>
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="fixed-header">
        <button ref={hamburgerIconRef} className="hamburger-icon" onClick={toggleMenu} aria-label="Open menu" aria-expanded={menuState}>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
        <header aria-label="Math Toys">
          M<span className="logo-symbol">Λ</span>TH <span className="logo-accent">TOYΣ</span>
        </header>
        {hasCalendarMenu && (
          <div className="page-menu" ref={pageMenuRef}>
            <button
              type="button"
              className="page-menu-trigger"
              aria-label="Calendar page options"
              aria-haspopup="menu"
              aria-expanded={pageMenuOpen}
              onClick={() => setPageMenuOpen(open => !open)}
            >
              <span aria-hidden="true">⋮</span>
            </button>
            {pageMenuOpen && (
              <div className="page-menu-popover" role="menu">
                <Link to="/calendar/lab" role="menuitem">Generate a calendar</Link>
                <Link to="/calendar/instructions" role="menuitem">Instructions</Link>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="container app-content">
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/phi" element={<Phi />} />
          {/*          <Route path="/pythag-clist" element={<PythagCList />} /> */}
          <Route path="/pythag" element={<PythagTriples />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/calendar/lab" element={<CalendarLab />} />
          <Route path="/calendar/instructions" element={<CalendarInstructions />} />
          <Route path="/denom" element={<Denom />} />
          <Route path="/lucas-lab" element={<LucasLab />} />
          <Route path="/fibonacci-lab" element={<FibonacciLab />} />
          <Route path="/hex-cluster" element={<HexCluster />} />
          <Route path="/square-pyramidal-stack" element={<SquarePyramidalStack />} />
          <Route path="/pythagorean-triples-lab" element={<PythagoreanTriplesLab />} />
          {/*
          <Route path="/mastermind" element={<Mastermind />} />
          <Route path="/wordle" element={<Wordle />} />
*/}
        </Routes>
      </div>
    </div>
  );
}

export default App;
