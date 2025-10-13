import React, { useState, useRef } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Form, InputGroup } from 'react-bootstrap'
import { Table } from 'react-bootstrap';
import NumeratorList from './NumeratorList';
import NumeratorDescription from './NumeratorDescription';
import { getDenomByExpansion, getExpansions, postExpansions } from '../api/math-toys-api';
import { getDenominatorFactors, parsedPeriod, getPeriodJSX } from './denom-helper';

function formatDenominatorFactors(factors) {
  let factorCount = 0;
  let lastFactor = factors[0];
  const factorEls = [];
  factors.forEach(factor => {
    if (factor === lastFactor) {
      factorCount++;
    } else {
      factorEls.push(<span>{lastFactor}<sup>{factorCount}</sup></span>);
      lastFactor = factor;
      factorCount = 1;
    }
  })
  factorEls.push(<span>{lastFactor}<sup>{factorCount}</sup></span>);

  const factorEl = (<div>
    {factorEls.map((el, key) => <React.Fragment key={key}>{el}</React.Fragment>)}
  </div>)
  return factorEl;
}

function MyVerticallyCenteredModal(props) {
  const { numeratordata } = props;
  console.log('MyVertically CenteredModal props', numeratordata);
  const { numerator, denom, period, digits, denomIsPrime, position, beginRepeat } = numeratordata;
  const periodData = parsedPeriod(period, beginRepeat);
  const periodJSX = getPeriodJSX(periodData);
  const power10 = period.length;
  const is10PrimitiveRoot = power10 < denom - 1 ? 'No' : 'Yes';

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          <div className="digits">Digits&nbsp;in&nbsp;Expansion&nbsp;{digits}</div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <NumeratorDescription {...numeratordata} power10={power10} periodJSX={periodJSX} digits={digits} />
      </Modal.Body>
      <Modal.Footer>
        <Button className="app-btn" onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}




function Denom(props) {
  const [denom, setDenom] = useState();
  const [modalShow, setModalShow] = useState(false);
  const [expansionKeys, setExpansionKeys] = useState([]);
  const [expansionData, setExpansionData] = useState([]);
  const [numeratorData, setNumeratorData] = useState({});
  const [denomFactors, setDenomFactors] = useState([]);
  const [periodList, setPeriodList] = useState([]);
  const [denomIsPrime, setDenomIsPrime] = useState(false);

  const denomRef = useRef(null);

  async function getDenomData(selectedDenom) {
    const results = await getExpansions(selectedDenom);
    const data = results.data;
    console.log('getDenomData, expansionData', data);
    let organizeExpansionData = data.byExpansion;
    let expansionData = data.byNumerator;
    const factors = getDenominatorFactors(selectedDenom);
    const formattedFactors = factors.length > 0 ? formatDenominatorFactors(factors) : <></>;
    setDenom(selectedDenom);
    setDenomIsPrime(factors.length === 1 && factors[0] === selectedDenom && 10 % factors[0] !== 0);
    setDenomFactors(formattedFactors);
    setExpansionKeys(Object.keys(organizeExpansionData).sort());
    setExpansionData(organizeExpansionData);
    setPeriodList(expansionData);
    //    console.log('expansion data', expansionData);
    //    console.log('organize expansion data', organizeExpansionData);
  }

  const handleClickNumerator = e => {
    const el = e.target;
    const { digits, numerator, stringified } = el.dataset;
    const data = JSON.parse(stringified);
    const { position, beginRepeat } = data;
    const { expansion } = periodList[numerator];
    let numDataObj = { numerator, denom, period: expansion, digits, denomIsPrime, position, beginRepeat, denomFactors };
    setNumeratorData(numDataObj);
    setModalShow(true);
  }

  const handleInput = e => {
    const denomEl = denomRef.current;
    getDenomData(denomEl.value);
  }

  return (
    <div>
      <h1>Decimal Expansions</h1>
      <div className="explanatory">
        <p>Enter a denominator to see its decimal expansions. Prime numbers are usually interesting. Try 7, for instance. The reciprocal of 7 is 0.142857. Notice that it's six digits and that if you add the first three (142) to the last three (857), you get 999. This same sort of thing happens with all prime denominators whose expansions have an even number of digits.</p>
        <p>Another interesting denominator is 41. Here, the reciprocal has five digits: 0.02439. Since the number of digits is odd, you can't split them into two equal groups that add up to all 9s.</p>
        <p>All prime numbers other than 2 and 5 necessarily belong to one or the other of these categories.</p>
      </div>
      <Form>
        <InputGroup>
          <Form.Control ref={denomRef} type="tel" id="denom" placeholder="Denominator" />
          <Button onClick={handleInput} className="app-btn">Set Denominator</Button>
        </InputGroup>
      </Form>
      <Table striped hover>
        <thead>
          <tr>
            <th>Decimal Expansions {denomFactors}</th>
          </tr>
        </thead>
        <tbody>
          {expansionKeys.map((expansion, key) => {
            const numeratorData = [];
            const periodData = parsedPeriod(expansion, expansionData[expansion][0].beginRepeat);
            const periodJSX = getPeriodJSX(periodData)
            expansionData[expansion].forEach(item => {
              numeratorData[item.numerator] = { position: item.position, beginRepeat: item.beginRepeat };
            });
            return (<tr key={key} onClick={() => { }}>
              <td><div className="digits">{periodJSX}</div>
                <NumeratorList digits={expansion} numeratorData={numeratorData} onClick={handleClickNumerator} />
              </td>
            </tr>)

          })}
        </tbody>
      </Table>

      {modalShow && (
        <MyVerticallyCenteredModal
          show={modalShow}
          onHide={() => setModalShow(false)}
          numeratordata={numeratorData}
        />

      )}

    </div>
  );
}

export default Denom;