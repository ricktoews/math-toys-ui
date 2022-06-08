import { Table, Form, Modal, Button } from 'react-bootstrap';
import { useEffect, useState, useRef } from 'react';
import { getCList } from './pythag-find-c';
import { getPythagCList } from '../api/math-toys-api';

function formatTriples(triples) {
  let data = [];
  triples.forEach(tripleObj => {
    let { a, b, c, prime } = tripleObj;
    let triple = prime
      ? <div className="primitive">{a}<sup>2</sup> + {b}<sup>2</sup> = {c}<sup>2</sup></div>
      : <div className="composite">{a}<sup>2</sup> + {b}<sup>2</sup> = {c}<sup>2</sup></div>
    data.push(triple);
  });
  return data;
}


function MyVerticallyCenteredModal(props) {
  const { data } = props;
  const { factors, triplesData } = data;
  const [triplesList, setTriplesList] = useState(triplesData[0].triples);
  const [formatted, setFormatted] = useState(formatTriples(triplesData[0].triples));
  const [onlyPrimes, setOnlyPrimes] = useState(false);
  const product = factors.reduce((c, p) => c*p);
  const tripleCount = triplesList.length;
  const primeTripleCount = triplesList.filter(item => item.prime).length;

  const handleSwitchOnlyPrimes = e => {
    let list = triplesData[0].triples;
    let toggleOnlyPrimes = !onlyPrimes;
    if (toggleOnlyPrimes) {
      list = list.filter(item => item.prime);
    }
    setFormatted(formatTriples(list));
    setOnlyPrimes(!onlyPrimes);
  }
  return (
    <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          <p>Pythag C Mix: {factors.join(' x ')} = {product}</p>
          <p>Triples: {tripleCount}, Primitives: {primeTripleCount}</p>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Check inline type="switch" defaultChecked={onlyPrimes} label="Primitive Triples" onClick={handleSwitchOnlyPrimes}></Form.Check>

        {formatted.map((item, key) => <div key={key}>{item}</div>)}
      </Modal.Body>
      <Modal.Footer>
        <Button className="app-btn" onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}


function PythagCList(props) {
  const [cMixData, setCMixData] = useState([]);
  const [pythagData, setPythagData] = useState([]);
  const [onlyPrimes, setOnlyPrimes] = useState(true);
  const [cMix, setCMix] = useState({});
  const [modalShow, setModalShow] = useState(false);

  useEffect(() => {
    refreshPythagData();
  }, [onlyPrimes]);

  const refreshPythagData = () => {
    const results = getCList({ primeOnly: onlyPrimes, triplesOnly: true });
    setPythagData(results);
  }

  const handleSwitchOnlyPrimes = e => {
    const el = e.target;
    setOnlyPrimes(!onlyPrimes);
  }

  const handleMixButton = async e => {
    let product = Object.keys(cMix).reduce((prev, curr) => prev * curr);
    console.log('cMix', cMix, product);

    let data = await getPythagCList([product]);
    setCMixData(data);
    console.log('pythagData', data);
  
    setModalShow(true);
  }

  const handleCRowToggle = e => {
    const el = e.target;
    const c = el.dataset.c;
    let newMix = cMix;
    if (el.checked) {
      newMix[c] = true;
    } else {
      delete newMix[c];
    }
    
    setCMix(newMix);
  }

  return (<div>
    <h1>Pythagorean C List</h1>
    Settings: 
    <Form.Check inline type="switch" defaultChecked={onlyPrimes} label="Prime C Values" onClick={handleSwitchOnlyPrimes}></Form.Check>
    <Button onClick={handleMixButton}>Mix</Button>

    <Table striped hover>
      <thead>
        <tr>
          <th></th>
          <th>C</th>
          <th>Triples</th>
        </tr>
      </thead>
      <tbody>

        {pythagData.map((item, key) => {
          let triples = formatTriples(item.triples);
          return (<tr key={key}>
            <td>
            <Form.Check data-c={item.c} onClick={handleCRowToggle}></Form.Check>
            </td>
            <td>{item.c}</td>
            <td>{triples.map((triple, key) => <div key={key}>{triple}</div>)}</td>
          </tr>)
        })}
      </tbody>
    </Table>
    { cMixData.length > 0 && <MyVerticallyCenteredModal
        show={modalShow}
        onHide={() => setModalShow(false)}
        data={{factors: Object.keys(cMix), triplesData: cMixData}}
      /> }

  </div>)
}

export default PythagCList;