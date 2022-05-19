import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import Main from './Main';
import Phi from './components/Phi';
import PythagCList from './components/PythagCList';
import PythagTriples from './components/PythagTriples';
import PythagSquare from './components/PythagSquare';
import Calendar from './components/Calendar';

function App() {
  
  useEffect(() => {
  //  console.log('App useEffect', popupRef.current);
    
  });

  const popupRef = useRef(null);
  const handleClick = e => {
    popupRef.current.classList.add('hide-popup');
    console.log(popupRef.current.classList);
  }
  
  return (
    <div className="App">
            <div ref={popupRef} onClick={handleClick} className="hide-popup popup-wrapper"><div className="popup">Phi Popup</div></div>

      <header>
      RickToews.me
      </header>
      <nav>
        <ul>
          <li><a href="/phi">Phi</a></li>
          <li><a href="/pythag-clist">Pythag C List</a></li>
          <li><a href="/pythag">Pythagorean Triples</a></li>
          <li><a href="/calendar">Calendar</a></li>
        </ul>
      </nav>
      <div className="container">
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/phi" element={<Phi />} />
        <Route path="/pythag-clist" element={<PythagCList />} />
        <Route path="/pythag" element={<PythagTriples />} />
        <Route path="/calendar" element={<Calendar />} />
      </Routes>
      </div>
    </div>
  );
}

export default App;
