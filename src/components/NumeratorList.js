function NumeratorList(props) {
  const { digits, numeratorData } = props;
  const numerators = Object.keys(numeratorData);
  
  return (<div className="numerator-list">
  { numerators.map((numerator, key) => <span key={key} data-stringified={JSON.stringify(numeratorData[numerator])} data-digits={digits} data-numerator={numerator} onClick={props.onClick}>{numerator}</span>)}
  </div>);
}

export default NumeratorList;