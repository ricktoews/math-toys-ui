import { Table, Form, InputGroup, Button } from 'react-bootstrap';
import { useEffect, useState, useRef } from 'react';
import { cList } from './pythag-find-c';
function PythagCList(props) {
  const [pythagData, setPythagData] = useState([]);

  useEffect(() => {
    const results = cList({ primeOnly: false, triplesOnly: true });
    results.forEach(item => {
      item.num = item.c;
      console.log(item);
      item.triples = [{ c: item.c, a: item.ab[0], b: item.ab[1] }];
    });
    setPythagData(results);
  }, []);

console.log('C List', pythagData);
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

  return (<div>
    <h1>Pythagorean C List</h1>
    <Table striped hover>
      <thead>
        <tr>
          <th>C</th>
          <th>Triples</th>
        </tr>
      </thead>
      <tbody>

        {pythagData.map((item, key) => {
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

export default PythagCList;