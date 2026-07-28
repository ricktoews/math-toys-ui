import { Table, Modal } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { MathJax } from 'better-react-mathjax';
import { getPhi } from '../api/math-toys-api';
import { getPascalRow, constructXYPower, constructPhiPower, reducedTerms, combineTerms, isolateFibonacciTerms } from './phi-utils';

const simplifyDisplayedExpression = (str = '') => str
  .replace(/\*1(?=√5|\s|<|$)/g, '')
  .replace(/(^|[>\s+])1√5/g, '$1√5');
const toMathJax = (str = '') => simplifyDisplayedExpression(str)
  .replace(/<[^>]*>/g, '')
  .replace(/√5/g, '\\sqrt{5}')
  .replace(/\^(\d+)/g, '^{$1}')
  .replace(/\*/g, '\\times ');
const radicalSymbol = '√';
const radicalSymbol5 = radicalSymbol + '5';

function InlineMath({ expression }) {
  return (
    <MathJax inline dynamic>
      {`\\(${toMathJax(expression)}\\)`}
    </MathJax>
  );
}

function MathTermList({ terms = [] }) {
  return terms.map((term, index) => {
    const termClass = term.includes('class="fibonacci"') ? 'fibonacci' : 'lucas';
    return (
      <span className={termClass} key={`${term}-${index}`}>
        {index > 0 && <span className="phi-math-operator"> + </span>}
        <InlineMath expression={term} />
      </span>
    );
  });
}

function InfoModal(props) {
  return (
    <Modal
      {...props}
      size="lg"
      dialogClassName="phi-info-modal"
      aria-labelledby="phi-info-title"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="phi-info-title">
          About Powers of Phi
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="phi-info-body">
        <div className="phi-info-formula">
          <MathJax inline>
            {'\\(\\varphi = \\frac{\\sqrt{5}+1}{2} \\approx 1.618\\)'}
          </MathJax>
        </div>

        <section>
          <h3>Fibonacci connection</h3>
          <p>
            Ratios of consecutive Fibonacci numbers approach φ. For example,
            8/5 = 1.6, 13/8 = 1.625, and 21/13 ≈ 1.615.
          </p>
        </section>

        <section>
          <h3>Powers of φ</h3>
          <p>
            Each power can be written in the form{' '}
            <MathJax inline>{'\\(\\frac{a\\sqrt{5}+b}{2}\\)'}</MathJax>. The values of{' '}
            <InlineMath expression="a" /> are Fibonacci numbers.
          </p>
        </section>

        <section>
          <h3>Convergence</h3>
          <p>
            As the powers increase, <InlineMath expression="a√5" /> and{' '}
            <InlineMath expression="b" />{' '}
            converge, with <InlineMath expression="a√5" /> alternating between
            less than and greater than <InlineMath expression="b" />.
          </p>
        </section>
      </Modal.Body>
    </Modal>
  );
}

function MyVerticallyCenteredModal(props) {
  const { data } = props;
  const { power, pascalRow, xyPower, termsExponents = [], oddPowerTerms = [], fibonacciTerms = [], reducedFibonacci } = data;
  const fibonacciSum = eval(reducedFibonacci);

  return (
    <Modal
      {...props}
      size="lg"
      dialogClassName="phi-power-modal"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          <MathJax inline>
            {`\\(\\varphi^{${power}} = \\left(\\frac{\\sqrt{5} + 1}{2}\\right)^{${power}}\\)`}
          </MathJax>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="phi-fraction-setup">
          <p>Numerator: <InlineMath expression={`(√5 + 1)^${power}`} /></p>
          <p>Denominator: 2<sup>{power}</sup> = {2 ** power}</p>
        </div>
        <div className="phi-calculation-box">
          <div className="phi-step-heading">
            Binomial expansion of (x + y)<sup>{power}</sup>
          </div>
          <p className="phi-step-expression"><InlineMath expression={xyPower} /></p>

          <div className="phi-step-heading">Substitute <InlineMath expression="x = √5, y = 1" /></div>
          <p className="phi-step-expression"><MathTermList terms={termsExponents} /></p>

          <p className="phi-pattern-note">
            Odd powers of x retain a factor of <InlineMath expression="√5" />.
            The sum of their coefficients, after division by{' '}
            <InlineMath expression="2^{n-1}" />, is the Fibonacci number{' '}
            <InlineMath expression="F_n" />.
          </p>

          <div className="phi-step-heading">Odd-x terms</div>
          <p className="phi-step-expression"><MathTermList terms={oddPowerTerms} /></p>

          <div className="phi-step-heading">Reduced powers of <InlineMath expression="√5" /></div>
          <p className="phi-step-expression"><MathTermList terms={fibonacciTerms} /></p>

          <div className="phi-step-heading">Sum of Coefficients</div>
          <p className="phi-step-expression"><InlineMath expression={`${reducedFibonacci} = ${fibonacciSum}`} /></p>

          <div className="phi-step-heading">
            Fibonacci Number <InlineMath expression={`F_{${power}}`} />
          </div>
          <p className="phi-step-expression">
            <InlineMath expression={`${fibonacciSum} / 2^{${power}-1} = ${fibonacciSum / 2 ** (power - 1)}`} />
          </p>
        </div>
      </Modal.Body>
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
    popupData.oddPowerTerms = termsExponents
      .filter(term => term.includes('class="fibonacci"'));
    const terms = constructPhiPower(power, false);
    popupData.terms = terms;
    const fibonacciParts = isolateFibonacciTerms(terms);
    popupData.fibonacciTerms = fibonacciParts.fibTerms;
    const reduced = reducedTerms(terms);
    popupData.reduced = reduced;
    const reducedFibonacci = isolateFibonacciTerms(reduced).sum
    popupData.reducedFibonacci = reducedFibonacci;
    const combined = combineTerms(reduced);
    popupData.combined = combined;
    setPhiDissect(popupData);
    setModalShow(true);
  }

  return (<div className="phi-page">
    <div className="math-toy-page-header">
      <h1 className="math-toy-page-title">
        Powers of Phi
        <button
          type="button"
          className="math-toy-page-action"
          onClick={() => setInfoShow(true)}
          aria-label="Info about Powers of Phi"
        >
          ⓘ Info
        </button>
      </h1>
    </div>
    <div className="phi-table-wrapper">
      <Table className="phi-table">
        <thead className="sticky-table">
          <tr>
            <th><span className="phi-table-math"><InlineMath expression="n" /></span></th>
            <th>Exact form</th>
            <th><span className="phi-table-math"><InlineMath expression={'\\phi^n'} /></span></th>
            <th><span className="phi-table-math"><InlineMath expression="a√5" /></span></th>
            <th><span className="phi-table-math"><InlineMath expression="a√5 - b" /></span></th>
          </tr>
        </thead>
        <tbody>

          {phiData.map((item, key) => {
            //let f_l = item['[F, F*SQRT_5, L, L/SQRT_5]'];
            let f_l = item['[a, b]'];
            const power = key + 1;
            const Fibonacci = f_l[0];
            const Lucas = f_l[1];
            const aRoot5 = Fibonacci * Math.sqrt(5);
            const phiNValue = (aRoot5 + Lucas) / 2;

            return (<tr
              className="phi-result-row"
              onClick={handleRowClick}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleRowClick(event);
                }
              }}
              tabIndex="0"
              key={key}
              data-power={key + 1}
            >
              <td>{power}</td>
              <td className="phi-fraction-cell"><MathJax>{`\\(\\frac{${Fibonacci}\\sqrt{5} + ${Lucas}}{2}\\)`}</MathJax></td>
              <td>{Math.floor(phiNValue * 10000) / 10000}</td>
              <td>{aRoot5.toFixed(power > 20 ? 1 : 4)}</td>
              <td>{(aRoot5 - Lucas).toFixed(4)}</td>
            </tr>)
          })}
        </tbody>
      </Table>
    </div>
    <MyVerticallyCenteredModal
      show={modalShow}
      onHide={() => setModalShow(false)}
      data={phiDissect}
    />
    <InfoModal show={infoShow} onHide={() => setInfoShow(false)} />
  </div>)
}

export default Phi
