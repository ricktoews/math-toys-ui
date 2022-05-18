import { Table } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { getPhi } from '../api/math-toys-api';

function Phi(props) {
    const [ phiData, setPhiData ] = useState([]);

    useEffect(() => {
        (async () => {
            let data = await phi(18);
            console.log('useEffect data', data);
            setPhiData(data);
        })();
    }, [phiData.length]);

    async function phi(n) {
        let data = await getPhi(n);
        return data;
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
            return (<tr key={key}>
              <td>{item.fraction}</td>
              <td>{f_l[0]}</td>
              <td>{f_l[2]}</td>
              <td>{Number.parseFloat(f_l[1]).toFixed(2)}</td>
            </tr>)
        })}
        </tbody>
      </Table>
    </div>)
}

export default Phi