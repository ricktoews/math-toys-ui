import { useLayoutEffect, useRef, useState } from 'react';

function NumeratorList(props) {
  const { digits, numeratorData, selectedNumerator, selectedPanel } = props;
  const numerators = Object.keys(numeratorData);
  const listRef = useRef(null);
  const [columnCount, setColumnCount] = useState(1);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return undefined;

    const updateColumnCount = () => {
      const chip = list.querySelector('.numerator-chip');
      if (!chip) return;

      const styles = window.getComputedStyle(list);
      const gap = parseFloat(styles.columnGap) || 0;
      const columns = Math.max(
        1,
        Math.floor((list.clientWidth + gap) / (chip.offsetWidth + gap))
      );
      setColumnCount(columns);
    };

    updateColumnCount();
    const resizeObserver = new ResizeObserver(updateColumnCount);
    resizeObserver.observe(list);

    return () => resizeObserver.disconnect();
  }, [numerators.length]);

  const selectedIndex = selectedNumerator
    ? numerators.indexOf(selectedNumerator)
    : -1;
  const selectedRowStart = selectedIndex >= 0
    ? Math.floor(selectedIndex / columnCount) * columnCount
    : -1;
  
  return (<div className="numerator-list" ref={listRef}>
  { numerators.map((numerator, index) => (
    <div className="numerator-chip-group" key={numerator}>
      {index === selectedRowStart && selectedPanel}
      <button
        type="button"
        className={selectedNumerator === numerator ? "numerator-chip numerator-chip-selected" : "numerator-chip"}
        data-stringified={JSON.stringify(numeratorData[numerator])}
        data-digits={digits}
        data-numerator={numerator}
        aria-pressed={selectedNumerator === numerator}
        onClick={props.onClick}
      >
        {numerator}
      </button>
    </div>
  ))}
  </div>);
}

export default NumeratorList;
