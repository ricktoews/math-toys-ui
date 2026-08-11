import React, { useEffect, useState, useRef } from 'react';
import { Modal } from 'react-bootstrap';
import styled from 'styled-components';
import { generateMonthData } from './calendar-helper';
import DrawMonth from './CalendarDrawMonth';

const CalendarMonthGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, max-content);
    justify-content: space-between;
    width: 100%;
    padding: 5px;
    box-sizing: border-box;
    background: transparent;
    color: black;
    border-radius: 10px;

    .year-header {
        grid-area: 1 / 1 / 1 / 4;
        display: flex;
        font-size: .9rem;
        justify-content: space-between;
    }
`;


function MyVerticallyCenteredModal(props) {
  const { yeardata } = props;
  const { year, jan, leap } = yeardata;
  const monthData = generateMonthData({ year, janDigit: jan, isLeap: leap });

  return (
    <Modal
      {...props}
      dialogClassName="calendar-year-modal"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {year}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <CalendarMonthGrid>
          {monthData.map((m, key) => <DrawMonth key={key} monthData={m} />)}
        </CalendarMonthGrid>
      </Modal.Body>
    </Modal>
  );
}

const leapYearBase = [0, 3, 4, 0, 2, 5, 0, 3, 6, 1, 4, 6];
const standardYearBase = [0, 3, 3, 6, 1, 4, 6, 2, 5, 0, 3, 5];


const calcYearConfig = (year) => {
  let isLeap = false;
  if (year % 400 === 0) {
    isLeap = true;
  } else if (year % 4 === 0 && year % 100 !== 0) {
    isLeap = true;
  }

  let centuryBase = Math.floor(year / 100);
  let offsetYear = year % 100;
  let centuryFirst = centuryBase % 4 * 5;
  let leaps = Math.floor(offsetYear / 4);
  if (isLeap) leaps = leaps + 6; // Fix so January of the leap year doesn't reflect the leap day.
  let jan = (centuryFirst + offsetYear + leaps) % 7;

  return { jan, isLeap };
}

const generateYear = ({ jan, isLeap }) => {
  const yearBase = isLeap ? leapYearBase : standardYearBase;
  const monthDigits = [];
  for (let i = 0; i < 12; i++) {
    monthDigits.push((jan + yearBase[i]) % 7);
  }
  return monthDigits;

}

function Year12Digit(props) {
  const { year, isCurrentYear } = props;
  const monthDigits = generateYear(calcYearConfig(year));
  const janDigit = monthDigits[0];
  const isLeap = monthDigits[1] !== monthDigits[2];
  const classNames = ['year-12-digit-wrapper']
  if (isCurrentYear) {
    classNames.push('current-year')
  }
  return (<div onClick={props.onClick} className={classNames.join(' ')}>
    <div className="digit-grid">
      <div data-year={year} data-jan={janDigit} data-leap={isLeap} className="year-label">{year}</div>
      {monthDigits.map((digit, ndx) => <div key={ndx}>{digit}</div>)}
    </div>
  </div>)
}

function Calendar(props) {
  const [selectedYearData, setSelectedYearData] = useState({});
  const [modalShow, setModalShow] = useState(false);
  const currentYearRef = useRef(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      currentYearRef.current?.scrollIntoView({ block: "center", behavior: "auto" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const years = [];
  for (let i = 0; i < 800; i++) {
    years.push(1600 + i);
  }
  const d = new Date();
  const currentYear = d.getFullYear();

  const handleClick = e => {
    const yearContainer = e.currentTarget;
    const clickedYearEl = yearContainer.querySelector('[data-year]');
    const selectedYear = clickedYearEl.dataset.year;
    const jan = clickedYearEl.dataset.jan;
    const leap = clickedYearEl.dataset.leap === 'true';
    setSelectedYearData({ year: selectedYear, jan, leap });
    setModalShow(true);
  }

  return (<div className="calendar-page">
    <div className="math-toy-page-header">
      <h1 className="math-toy-page-title">12-Digit Calendar</h1>
    </div>
    <div className="calendar-grid">
      {years.map((year, key) => {
        const isCurrentYear = year === currentYear;
        return <React.Fragment key={key}>
          {year > 1600 && year % 100 === 0 && <div className="century-divider"></div>}
          <div ref={isCurrentYear ? currentYearRef : null}>
            <Year12Digit year={year} onClick={handleClick} isCurrentYear={isCurrentYear} />
          </div>
        </React.Fragment>
      })}
    </div>
    <MyVerticallyCenteredModal
      show={modalShow}
      onHide={() => setModalShow(false)}
      yeardata={selectedYearData}
    />

  </div>)
}

export default Calendar;
