import { Table, Form, InputGroup, Modal, Button } from 'react-bootstrap';
import { useEffect, useState, useRef } from 'react';
import { getPythagTriples } from '../api/math-toys-api';
import PythagSquare from './PythagSquare';

const makeTripleTitle = triple => {
  const [a, b, c] = triple;
  const title1 = `${a}<span class="exponent">2</span> + ${b}<span class="exponent">2</span> = ${c}<span class="exponent">2</span>`;
  const title2 = <div>
    <span className="pythag-triple"><span className="pythag-triple-label">a</span> = {a}</span><br />
    <span className="pythag-triple"><span className="pythag-triple-label">b</span> = {b}</span><br />
    <span className="pythag-triple"><span className="pythag-triple-label">c</span> = {c}</span><br />
  </div>
  const title3 = <ul className="pythag-triple-title">
    <li><span className="pythag-label">a</span> = {a}, </li>
    <li><span className="pythag-label">b</span> = {b}, </li>
    <li><span className="pythag-label">c</span> = {c}</li>
  </ul>
  return title3;
}

const makePythagLabel = (label, value) => {
  const labelJSX = <span className="pythag-side">
    <span className="pythag-label">{label}<span className="exponent">2</span></span> = {value}x{value} = {value * value}
  </span>
  return labelJSX;
}

function MyVerticallyCenteredModal(props) {
  const { triple } = props;
  const [a, b, c] = triple;
  const tripleTitle = makeTripleTitle(triple);

  const aLabel = makePythagLabel('a', a);
  const bLabel = makePythagLabel('b', b);
  const cLabel = makePythagLabel('c', c);

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {makeTripleTitle(triple)}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>

        {Array.isArray(triple) && <PythagSquare triple={triple} labels={{ aLabel, bLabel, cLabel }} />}

      </Modal.Body>
      <Modal.Footer>
        <Button className="app-btn" onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}


function Illustration(props) {
  const { triple } = props;
  const [a, b, c] = triple;

  const aLabel = makePythagLabel('a', a);
  const bLabel = makePythagLabel('b', b);
  const cLabel = makePythagLabel('c', c);

  return (
    <PythagSquare triple={triple} labels={{ aLabel, bLabel, cLabel }} illus={true} />
  );
}

function PythagTriples(props) {
  const [modalShow, setModalShow] = useState(false);
  const [pythagData, setPythagData] = useState([]);
  const [corner, setCorner] = useState(1);
  const [selectedTriple, setSelectedTriple] = useState();

  const cornerRef = useRef(null);

  useEffect(() => {
    (async () => {
      let data = await pythagCorner(corner);
      setPythagData(data);
    })();
  }, [pythagData.length]);

  async function pythagCorner(a) {
    let data = await getPythagTriples(a);
    return data;
  }

  function formatTriple(tripleObj) {
    let { a, b, c, isPrimitive } = tripleObj;
    let triple = isPrimitive
      ? <div className="primitive">{a}<sup>2</sup> + {b}<sup>2</sup> = {c}<sup>2</sup></div>
      : <div className="composite">{a}<sup>2</sup> + {b}<sup>2</sup> = {c}<sup>2</sup></div>
    return triple;
  }

  const processCorner = async a => {
    setCorner(a);
    let data = await pythagCorner(a);
    setPythagData(data);
  }

  const handleInput = e => {
    const cornerEl = cornerRef.current;
    processCorner(cornerEl.value);
  }

  const selectTriple = (triple, isPrimitive) => {
    //console.log(triple);
    setSelectedTriple(triple);
    setModalShow(true);
  }

  return (<div>
    <h1>Pythagorean Triples</h1>
    <div className="explanatory">
      <div>
        <div style={{ "float": "right", "padding": "0 30px" }}>
          <Illustration triple={[3, 4, 5]} />
        </div>

        <p>The drawing illustrates how I visualize a Pythagoran triple, using the familiar (3, 4, 5) triple as an example.</p>
        <p>The 5x5 square is c-squared, which is the sum of a-squared (3x3) and b-squared (4x4). The illustration shows how the nine (3x3) unit squares that comprise a-squared can be redistributed to wrap around b-squared: Since b-squared has four (4) squares on each side, the nine squares of a-squared can be arranged as four squares on the left, four squares on the top, and the remaining square in the upper left corner. So 4 + 4 + 1 = 9.</p>
        <p>In this case, the "corner" value is 1, since the corner is a 1x1 square. All Pythagorean triples with a corner value of 1 are primitives, since c-b in all such cases is by definition 1.</p>
        <p>A Pythagorea triple with a corner of 1 can be calculated for every odd number >= 3: the odd number is itself the a value. To find the b value, simply square the a value, subtract 1, and divide by 2. To find the c value, square the a value, add one, and divide by 2.</p>
        <p>Example: Let a=11. Then b = (11^2 - 1) / 2 = 60, and c = (11^2 + 1) / 2 = 61. (You'll see the (11, 60, 61) triple listed below.)</p>
      </div>
    </div>
    <Form>
      <InputGroup>
        <Form.Control ref={cornerRef} type="tel" id="a" />
        <Button className="app-btn" onClick={handleInput}>Set Corner</Button>
      </InputGroup>
    </Form>
    <Table striped hover>
      <thead className="sticky-table">
        <tr>
          <th>Triples</th>
        </tr>
      </thead>
      <tbody>

        {pythagData.map((item, key) => {
          let triple = formatTriple(item);
          let { a, b, c, isPrimitive } = item;
          return (<tr key={key} onClick={item => { selectTriple([a, b, c], isPrimitive) }}>
            <td>{triple}</td>
          </tr>)
        })}
      </tbody>
    </Table>

    {modalShow && (
      <MyVerticallyCenteredModal
        show={modalShow}
        onHide={() => setModalShow(false)}
        triple={selectedTriple}
      />
    )
    }

  </div>);
}

export default PythagTriples;