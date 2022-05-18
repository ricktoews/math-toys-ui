import { Table, Form, InputGroup, Button } from 'react-bootstrap';
import { useEffect, useState, useRef } from 'react';
import { getPythagTriples } from '../api/math-toys-api';
import PythagSquare from './PythagSquare';

function PythagTriples(props) {
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
        console.log(triple);
        setSelectedTriple(triple);
    }

    return (<div>
      <h1>Pythagorean Triples</h1>
      { Array.isArray(selectedTriple) && <PythagSquare triple={selectedTriple} />}
      <Form>
        <InputGroup>
          <Form.Control ref={cornerRef} type="text" id="a" />
          <Button onClick={handleInput}>Set Corner</Button>
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

    </div>);
}

export default PythagTriples;