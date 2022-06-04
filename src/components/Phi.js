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
function MyVerticallyCenteredModal(props) {
  const { data } = props;
  const { power, pascalRow, xyPower, termsExponents = [], terms = [], fibonacciTerms, reducedFibonacci } = data;
  const xyPowerSuperscript = convertToSuperscript(xyPower);
  const termsExponentsSuperscript = convertToSuperscript(termsExponents.join(' + '));
  const fibonacciSum = eval(reducedFibonacci);
  
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
        <p>Denominator: 2<sup>{power}</sup> = {2**power}. Numerator will be divided by {2**(power-1)} to yield a result with denominator 2.</p>
        <p>Calculate numerator as (x + y)<sup>{power}</sup> = <span dangerouslySetInnerHTML={{__html:xyPowerSuperscript}} />,<br/>
        where x = {radicalSymbol5}, y = 1.</p>
        <p>So: <span dangerouslySetInnerHTML={{__html: termsExponentsSuperscript}} /></p>
        <p>Compute {radicalSymbol5}<sup>n</sup>: <span dangerouslySetInnerHTML={{__html: terms.join(' + ')}} /></p>
        <p>Fibonacci terms (<i>n</i>{radicalSymbol5}): <span dangerouslySetInnerHTML={{__html: fibonacciTerms}} /> = {fibonacciSum}</p>
        <p>So the {power}th Fibonacci number is {fibonacciSum} / {2**(power-1)} = {fibonacciSum / 2**(power-1)}.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button className="app-btn" onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

function Phi(props) {
  const [modalShow, setModalShow] = useState(false);
  const [ phiData, setPhiData ] = useState([]);
  const [ phiDissect, setPhiDissect ] = useState({});

    useEffect(() => {
        (async () => {
            let data = await phi(18);
//            console.log('useEffect data', data);
            setPhiData(data);
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
      <h1>Powers of Phi</h1>
      <Table striped hover>
        <thead>
          <tr>
            <th>Fraction of Phi<sup>n</sup></th>
            <th>Fibonacci n</th>
            <th>Lucas n</th>
            <th>Fibonacci n x V5</th>
          </tr>
        </thead>
        <tbody>
        
        { phiData.map((item, key) => {
            let f_l = item['[F, F*SQRT_5, L, L/SQRT_5]'];
            const Fibonacci = f_l[0];
            const Lucas = f_l[2];

            return (<tr onClick={handleRowClick} key={key} data-power={key + 1}>
              <td><MathJax>{`\\(\\frac{${Fibonacci}\\sqrt{5} + ${Lucas}}{2}\\)`}</MathJax></td>
              <td>{f_l[0]}</td>
              <td>{f_l[2]}</td>
              <td>{Number.parseFloat(f_l[1]).toFixed(2)}</td>
            </tr>)
        })}
        </tbody>
      </Table>
      <MyVerticallyCenteredModal
        show={modalShow}
        onHide={() => setModalShow(false)}
        data={phiDissect}
      />
    </div>)
}

export default Phi