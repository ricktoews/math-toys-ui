import React from 'react';

function Peg(props) {
  return <div className="peg-outer">
    <div className={'peg peg-' + props.color} onClick={props.handlePegSelect}></div>
  </div>
}

export default Peg;
