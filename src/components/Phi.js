import { Table, Modal, Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { MathJax } from 'better-react-mathjax';
import { getPhi } from '../api/math-toys-api';
import { getPascalRow, constructXYPower, constructPhiPower, reducedTerms, combineTerms, isolateFibonacciTerms } from './phi-utils';

const convertToSuperscript = (str) => {
  if (!str) return;
  let converted = str && str.replace(/\^(\d+)/g, '<sup>$1</sup>');
  return converted;
}
const radicalSymbol = '√';
const radicalSymbol5 = radicalSymbol + '5';

function InfoModal(props) {
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="phi-info-title"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="phi-info-title">
          About Powers of Phi
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Phi is (√5 + 1) / 2, which is approximately 1.618. It's associated with the Fibonacci series, in that the ratio of a given element in that series to the previous element approximates phi.</p>
        <p>For example, the first several Fibonacci numbers are 1, 1, 2, 3, 5, 8, 13, 21... The ratio of 8/5 is 1.6, 13/8 is 1.625, 21/13 is approximately 1.615, etc. This approximation increases in accuracy as one progresses through the series.</p>
        <p>Each power of phi can be expressed in the form (a√5 + b) / 2. Notice the values of a and b for progressive powers of phi. For a, the values are the Fibonacci numbers.</p>
        <p>Notice also that as the powers increase, the values for a√5 and b converge, with a√5 alternating less than and greater than b.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button className="app-btn" onClick={props.onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function MyVerticallyCenteredModal(props) {
  const { data } = props;
  const { power, pascalRow, xyPower, termsExponents = [], terms = [], fibonacciTerms, reducedFibonacci } = data;
  const xyPowerSuperscript = convertToSuperscript(xyPower);
  const termsExponentsSuperscript = convertToSuperscript(termsExponents.join(' + '));
  const fibonacciSum = eval(reducedFibonacci);

  setTimeout(() => {
    console.trace('sourcemap probe from within Phi.js');
  }, 0);

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Phi to the power of {power} = <MathJax inline>{`\\(\\left(\\frac{\\sqrt{5} + 1}{2}\\right)^${power}\\)`}</MathJax>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Numerator: ({radicalSymbol5} + 1)<sup>{power}</sup>.</p>
        <p>Denominator: 2<sup>{power}</sup> = {2 ** power}. Numerator will be divided by {2 ** (power - 1)} to yield a result with denominator 2.</p>
        <p>Calculate numerator as (x + y)<sup>{power}</sup> = <span dangerouslySetInnerHTML={{ __html: xyPowerSuperscript }} />,<br />
          where x = {radicalSymbol5}, y = 1.</p>
        <p>So: <span dangerouslySetInnerHTML={{ __html: termsExponentsSuperscript }} /></p>
        <p>Compute {radicalSymbol5}<sup>n</sup>: <span dangerouslySetInnerHTML={{ __html: terms.join(' + ') }} /></p>
        <p>Fibonacci terms (<i>n</i>{radicalSymbol5}): <span dangerouslySetInnerHTML={{ __html: fibonacciTerms }} /> = {fibonacciSum}</p>
        <p>So the {power}th Fibonacci number is {fibonacciSum} / {2 ** (power - 1)} = {fibonacciSum / 2 ** (power - 1)}.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button className="app-btn" onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

function Phi(props) {
  const [modalShow, setModalShow] = useState(false);
  const [infoShow, setInfoShow] = useState(false);
  const [phiData, setPhiData] = useState([]);
  const [phiDissect, setPhiDissect] = useState({});

  useEffect(() => {
    (async () => {
      let result = await phi(34);
      console.log('useEffect result', result);
      setPhiData(result.data);
    })();
  }, [phiData.length]);

  async function phi(n) {
    let data = await getPhi(n);
    return data;
  }

  const handleRowClick = e => {
    const row = e.currentTarget;
    const popupData = {};
    const power = row.dataset.power;
    popupData.power = power;
    popupData.pascalRow = getPascalRow(power);
    const xyPower = constructXYPower(power);
    popupData.xyPower = xyPower;
    const termsExponents = constructPhiPower(power);
    popupData.termsExponents = termsExponents;
    const terms = constructPhiPower(power, false);
    popupData.terms = terms;
    const fibonacciTerms = isolateFibonacciTerms(terms).sum;
    popupData.fibonacciTerms = fibonacciTerms;
    const reduced = reducedTerms(terms);
    popupData.reduced = reduced;
    const reducedFibonacci = isolateFibonacciTerms(reduced).sum
    popupData.reducedFibonacci = reducedFibonacci;
    const combined = combineTerms(reduced);
    popupData.combined = combined;
    setPhiDissect(popupData);
    setModalShow(true);
  }

  return (<div>
    <h1>
      Powers of Phi
      <button
        type="button"
        className="info-button"
        onClick={() => setInfoShow(true)}
        aria-label="Info about Powers of Phi"
        style={{ marginLeft: '1rem', fontSize: '1rem', cursor: 'pointer', background: 'none', border: 'none' }}
      >
        ⓘ Info
      </button>
    </h1>
    <Table striped hover className="table">
      <thead className="sticky-table">
        <tr>
          <th>n</th>
          <th>Fraction of Phi<sup>n</sup></th>
          <th>Phi<sup>n</sup></th>
          <th>a√5</th>
          <th>a√5 - b</th>
        </tr>
      </thead>
      <tbody>

        {phiData.map((item, key) => {
          //let f_l = item['[F, F*SQRT_5, L, L/SQRT_5]'];
          let f_l = item['[a, b]'];
          const power = key + 1;
          const Fibonacci = f_l[0];
          const Lucas = f_l[1];
          const phiNValue = (Fibonacci * Math.sqrt(5) + Lucas) / 2;

          return (<tr onClick={handleRowClick} key={key} data-power={key + 1}>
            <td>{power}</td>
            <td><MathJax>{`\\(\\frac{${Fibonacci}\\sqrt{5} + ${Lucas}}{2}\\)`}</MathJax></td>
            <td>{Math.floor(phiNValue * 10000) / 10000}</td>
            <td>{item['phi^n'].toFixed(power > 20 ? 1 : 4)}</td>
            <td>{(item['phi^n'] - Lucas).toFixed(4)}</td>
          </tr>)
        })}
      </tbody>
    </Table>
    <MyVerticallyCenteredModal
      show={modalShow}
      onHide={() => setModalShow(false)}
      data={phiDissect}
    />
    <InfoModal show={infoShow} onHide={() => setInfoShow(false)} />
  </div>)
}

export default Phi