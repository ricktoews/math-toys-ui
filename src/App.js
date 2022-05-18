import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Main from './Main';
import Phi from './components/Phi';
import PythagCList from './components/PythagCList';
import PythagTriples from './components/PythagTriples';
import PythagSquare from './components/PythagSquare';
import Calendar from './components/Calendar';

function App() {
  
  return (
    <div className="App">
      <header>
      RickToews.me
      </header>
      <nav>
        <ul>
          <li><a href="/phi">Phi</a></li>
          <li><a href="/pythag-clist">Pythag C List</a></li>
          <li><a href="/pythag">Pythagorean Triples</a></li>
          <li><a href="/pythag-square">Pythagorean Square</a></li>
          <li><a href="/calendar">Calendar</a></li>
        </ul>
      </nav>
      <div className="container">
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/phi" element={<Phi />} />
        <Route path="/pythag-clist" element={<PythagCList />} />
        <Route path="/pythag" element={<PythagTriples />} />
        <Route path="/pythag-square" element={<PythagSquare />} />
        <Route path="/calendar" element={<Calendar />} />
      </Routes>
      </div>
    </div>
  );
}

export default App;
