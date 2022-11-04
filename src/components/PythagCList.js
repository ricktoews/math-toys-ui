import { Table, Form, Modal, Button } from 'react-bootstrap';
import React, { useEffect, useState, useRef } from 'react';
import { getCList } from './pythag-find-c';
import { getPythagCList } from '../api/math-toys-api';

function formatTriples(triples, fmt='string') {
  let data = [];
  triples.forEach((tripleObj, key) => {
    let { a, b, c, prime } = tripleObj;
    if (fmt === 'string') {
      let triple = prime
      ? <div className="primitive">{a}<sup>2</sup> + {b}<sup>2</sup> = {c}<sup>2</sup></div>
      : <div className="composite">{a}<sup>2</sup> + {b}<sup>2</sup> = {c}<sup>2</sup></div>
      data.push(triple);
    } else {
      let triple = prime
      ? <tr key={key} className="primitive"><td>{a}<sup>2</sup></td><td>{b}<sup>2</sup></td><td>{c}<sup>2</sup></td></tr>
      : <tr key={key} className="composite"><td>{a}<sup>2</sup></td><td>{b}<sup>2</sup></td><td>{c}<sup>2</sup></td></tr>
      data.push(triple);
    }
  });
  return data;
}


function MyVerticallyCenteredModal(props) {
  const { data } = props;
  const { factors, triplesData } = data;
  const [formatted, setFormatted] = useState([]);
  const [onlyPrimes, setOnlyPrimes] = useState(true);
  const [tripleCount, setTripleCount] = useState(0);
  const [primeTripleCount, setPrimeTripleCount] = useState(0);
  const [product, setProduct] = useState(0);

  useEffect(() => {
    let _triplesArray = triplesData[0].triples;
    setOnlyPrimes(true);
    setFormatted(formatTriples(_triplesArray.filter(item => item.prime), 'row'));
    setTripleCount(_triplesArray.length);
    setPrimeTripleCount(_triplesArray.filter(item => item.prime).length);
    setProduct(factors.reduce((c, p) => c*p));
  }, [triplesData[0].triples[0].c]);

  const handleSwitchOnlyPrimes = e => {
    let list = triplesData[0].triples;
    let toggleOnlyPrimes = !onlyPrimes;
    if (toggleOnlyPrimes) {
      list = list.filter(item => item.prime);
    }
    setFormatted(formatTriples(list, 'row'));
    setOnlyPrimes(toggleOnlyPrimes);
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
        <Table>
          <thead>
            <tr>
              <th>a<sup>2</sup></th>
              <th>b<sup>2</sup></th>
              <th>c<sup>2</sup></th>
            </tr>
          </thead>
          <tbody>
            {formatted.map((item, key) => <React.Fragment key={key}>{item}</React.Fragment>)}    
          </tbody>
        </Table>
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
    if (product < 50000000) {
      let data = await getPythagCList([product]);
      setCMixData(data);
      console.log('pythagData', data);
    
      setModalShow(true);
    }
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
    <h1>Pythagorean Hypotenuse (C) List</h1>

    <Table striped hover>
      <thead className="sticky-table">
        <tr className="list-settings">
          <th colSpan="3">
            <div className="list-settings">
            <span className="settings-label">Settings:</span>
            <Form.Check inline type="switch" className="check-toggle" defaultChecked={onlyPrimes} label="Prime C Values" onClick={handleSwitchOnlyPrimes}></Form.Check>
            <Button className="app-btn settings-btn" onClick={handleMixButton}>Mix</Button>
            </div>

          </th>
        </tr>
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