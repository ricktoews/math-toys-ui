import 'bootstrap/dist/css/bootstrap.min.css';
import './App.scss';
import { Routes, Route } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import Main from './Main';
import Phi from './components/Phi';
import PythagCList from './components/PythagCList';
import PythagTriples from './components/PythagTriples';
import Calendar from './components/Calendar';
import Mastermind from './components/mastermind/AppSolves';
import Wordle from './components/wordle/AppSolves';
import Denom from './components/Denom';

function App() {
  const [menuState, setMenuState] = useState(false);

  const navContainerRef = useRef(null);
  const hamburgerIconRef = useRef(null);

  useEffect(() => {
    const handleClick = e => {
      const el = e.target;
      const currentEl = e.currentTarget;
      if (navContainerRef.current.contains(el)) {
        console.log('handleClick clicked in nav menu; leave open');
        setMenuState(true);
      } else {
        // Close outside of nav container. Close menu unless clicked on hamburger icon.
        if (!hamburgerIconRef.current.contains(el)) {
          setMenuState(false);
        }
      }
    }

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    }
  }, [])

  useEffect(() => {

    if (menuState === true) {
      navContainerRef.current.classList.add('show-nav-menu');
      navContainerRef.current.classList.remove('hide-nav-menu');
    } else {
      navContainerRef.current.classList.remove('show-nav-menu');
      navContainerRef.current.classList.add('hide-nav-menu');
    }

  }, [menuState]);

  const toggleMenu = () => {
    console.log('toggleMenu');
    setMenuState(!menuState);
  }

  const checkMenuClick = e => {
    const el = e.target;
    const currentEl = e.currentTarget;
    if (el === currentEl) {
      setMenuState(false);
    }
  }

  return (
    <div className="App">
      <div ref={navContainerRef} onClick={checkMenuClick} className="nav-container">

        <nav>
          <ul>
            <li><a href="/">Main</a></li>
            <li><a href="/phi">Phi</a></li>
            {/*
            <li><a href="/pythag-clist">Pythag C List</a></li>
            */}
            <li><a href="/pythag">Pythagorean Triples</a></li>
            <li><a href="/calendar">Calendar</a></li>
            <li><a href="/denom">Decimal Expansions</a></li>
            {/*
              <li><a href="/mastermind">Mastermind</a></li>
              <li><a href="/wordle">Wordle</a></li>
              */}
          </ul>
        </nav>

      </div>
      <div className="fixed-header">
        <div ref={hamburgerIconRef} className="hamburger-icon" onClick={toggleMenu}>
          <div className="hamburger-line"></div>
          <div className="hamburger-line"></div>
          <div className="hamburger-line"></div>
        </div>
        <header>
          M&Lambda;th Toy&Sigma;
        </header>
      </div>
      <div className="container app-content">
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/phi" element={<Phi />} />
          <Route path="/pythag-clist" element={<PythagCList />} />
          <Route path="/pythag" element={<PythagTriples />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/denom" element={<Denom />} />
          <Route path="/mastermind" element={<Mastermind />} />
          <Route path="/wordle" element={<Wordle />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
