import { Table, Form, InputGroup, Modal, Button } from 'react-bootstrap';
import { useEffect, useState, useRef } from 'react';
import { getPythagTriples } from '../api/math-toys-api';
import PythagSquare from './PythagSquare';

const makeTripleTitle = triple => {
  const [a, b, c] = triple;
  const title1 = `${a}<span class="exponent">2</span> + ${b}<span class="exponent">2</span> = ${c}<span class="exponent">2</span>`;
  const title2 = <div>
    <span className="pythag-triple"><span className="pythag-triple-label">a</span> = {a}</span><br/>
    <span className="pythag-triple"><span className="pythag-triple-label">b</span> = {b}</span><br/>
    <span className="pythag-triple"><span className="pythag-triple-label">c</span> = {c}</span><br/>
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
    <span className="pythag-label">{label}<span className="exponent">2</span></span> = {value}x{value} = {value*value}
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

        { Array.isArray(triple) && <PythagSquare triple={triple} labels={{aLabel, bLabel, cLabel}} />}

      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}


function PythagTriples(props) {
  const [ modalShow, setModalShow ] = useState(false);
  const [ pythagData, setPythagData ] = useState([]);
  const [ corner, setCorner ] = useState(1);
  const [ selectedTriple, setSelectedTriple ] = useState();

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
    <Form>
      <InputGroup>
        <Form.Control ref={cornerRef} type="tel" id="a" />
        <Button className="btn btn-info" onClick={handleInput}>Set Corner</Button>
      </InputGroup>
    </Form>
    <Table striped hover>
      <thead>
        <tr>
          <th>Triples</th>
        </tr>
      </thead>
      <tbody>
      
      { pythagData.map((item, key) => {
          let triple = formatTriple(item);
          let {a, b, c, isPrimitive} = item;
          return (<tr key={key} onClick={item => { selectTriple([a, b, c], isPrimitive) }}>
            <td>{triple}</td>
          </tr>)
      })}
      </tbody>
    </Table>

    { modalShow && (
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