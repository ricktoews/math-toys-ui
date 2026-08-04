import 'bootstrap/dist/css/bootstrap.min.css';
import './css/App.scss';
import { Routes, Route, NavLink } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import Main from './Main';
import Phi from './components/Phi';
import HexCluster from './components/HexCluster';
import SquarePyramidalStack from './components/SquarePyramidalStack';
//import PythagCList from './components/PythagCList';
import PythagTriples from './components/PythagTriples';
import Calendar from './components/Calendar';
//import Mastermind from './components/mastermind/AppSolves';
//import Wordle from './components/wordle/AppSolves';
import Denom from './components/Denom';
import PythagoreanTriplesLab from './components/PythagoreanTriplesLab';
import LucasLab from './components/LucasLab';
import FibonacciLab from './components/FibonacciLab';

function App() {
  const [menuState, setMenuState] = useState(false);

  const navContainerRef = useRef(null);
  const hamburgerIconRef = useRef(null);

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuState);
    const closeOnEscape = event => event.key === 'Escape' && setMenuState(false);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.classList.remove('menu-open');
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuState]);

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
      </div>
      <div className="container app-content">
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/phi" element={<Phi />} />
          {/*          <Route path="/pythag-clist" element={<PythagCList />} /> */}
          <Route path="/pythag" element={<PythagTriples />} />
          <Route path="/calendar" element={<Calendar />} />
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
