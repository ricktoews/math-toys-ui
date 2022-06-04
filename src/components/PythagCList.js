import { Table, Form, InputGroup, Button } from 'react-bootstrap';
import { useEffect, useState, useRef } from 'react';
import { getPythagCList } from '../api/math-toys-api';

function PythagCList(props) {
    const [ pythagData, setPythagData ] = useState([]);
    const [ cList, setCList ] = useState([5, 25, 125, 625]);

    const cListRef = useRef(null);

    useEffect(() => {
        (async () => {
            let data = await pythagCList(cList);
            setPythagData(data);
        })();
    }, [pythagData.length]);

    async function pythagCList(list) {
        let data = await getPythagCList(list);
        return data;
    }

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

    const processCList = async clistString => {
        let items = clistString.split(',');
        let result = [];
        items.forEach(item => {
            item = item.trim();
            let validateItem = item.replace(/\d/g, '');
            if (validateItem.length === 0) {
                result.push(item);
            }
        });
        setCList(result);
        let data = await pythagCList(result);
        setPythagData(data);
        return result;
    }

    const handleInput = e => {
        const cListEl = cListRef.current;
        processCList(cListEl.value);
    }

    return (<div>
      <h1>Pythagorean C List Data</h1>
      <Form>
        <InputGroup>
          <Form.Control ref={cListRef} type="text" id="clist" />
          <Button className="app-btn" onClick={handleInput}>Set C List</Button>
        </InputGroup>
      </Form>
      <Table striped hover>
        <thead>
          <tr>
            <th>C</th>
            <th>Triples</th>
          </tr>
        </thead>
        <tbody>
        
        { pythagData.map((item, key) => {
            let triples = formatTriples(item.triples);
            return (<tr key={key}>
              <td>{item.num}</td>
              <td>{triples.map((triple, key) => <div key={key}>{triple}</div>)}</td>
            </tr>)
        })}
        </tbody>
      </Table>
    </div>)
}

export default PythagCList