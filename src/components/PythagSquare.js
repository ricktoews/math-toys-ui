import { useEffect, useState, useRef } from 'react';

function PythagSquare(props) {
    console.log('Pythagorean Square', props.triple);
    const [ triple, setTriple ] = useState(props.triple);

    const cWrapRef = useRef(null);

    useEffect(() => {
        console.log('PythagSquare', props.triple);
        setTriple(props.triple);
    }, [props.triple[2]]);
    
    function drawASquare(triple) {
        let [a, b, c] = triple;
        let corner = c - b;

        let wraparoundRows = [];
        // Build wrap-around
        for (let row = 0; row < c; row++) {
            let cols = [];
            for (let col = 0; col < c; col++) {
                if (row >= corner && col >= corner) {
                    cols.push(<div className="a-square no-show"></div>);
                } else {
                    cols.push(<div className="a-square"></div>);
                }
            }
            wraparoundRows.push(cols);
        }

        let rows = [];
        // Build square
        for (let row = 0; row < a; row++) {
            let cols = [];
            for (let col = 0; col < a; col++) {
                if (row >= corner && col >= corner) {
                    cols.push(<div className="a-square movable"></div>);
                } else {
                    cols.push(<div className="a-square"></div>);
                }
            }
            rows.push(cols);
        }

        let code = (<div className="a-wrapper">
            {rows.map((row, key) => {
                return <div key={key} className="a-row-wrapper">{row.map((square) => {
                    return square;
                })}</div>
            })}
        </div>)

        return code;
    }

    function drawBSquare(b) {
        let rows = [];
        for (let row = 0; row < b; row++) {
            let cols = [];
            for (let col = 0; col < b; col++) {
                cols.push(<div className="b-square"></div>);
            }
            rows.push(cols);
        }
        let code = (<div className="b-wrapper">
            {rows.map((row, key) => {
                return <div key={key} className="b-row-wrapper">{row.map(square => {
                    return square;
                })}</div>
            })}
        </div>)

        return code;
    }

    function drawCSquare(triple) {
        let c = triple[2];
        let cRows = [];
        let aSquare = drawASquare(triple);
        let bSquare = drawBSquare(triple[1]);
        for (let row = 0; row < c; row++) {
            let cCols = [];
            for (let col = 0; col < c; col++) {
                cCols.push(<div className="c-square"></div>);
            }
            cRows.push(cCols);
        }
        let code = (<div ref={cWrapRef} className="c-wrapper">
            {bSquare}
            {aSquare}
            {cRows.map((row, key) => {
                return <div key={key} className="c-row-wrapper">{row.map(square => {
                    return square;
                })}</div>
            })}
        </div>)

        return code;
    }

    let cSquare = drawCSquare(triple);
    console.log('Pythagorean Square, about to return HTML', triple);
    return (<div>
        {cSquare}
    </div>);
}

export default PythagSquare;