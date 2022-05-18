import React, { useEffect, useState, useRef } from 'react';

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

const generateYear = ({jan, isLeap}) => {
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
  const classNames = ['year-12-digit-wrapper']
  if (isCurrentYear) {
    classNames.push('current-year')
  }
  return (<div className={classNames.join(' ')}>
    <div className="digit-grid">
    <div className="year-label">{year}</div>
    { monthDigits.map((digit, ndx) => <div key={ndx}>{digit}</div>) }
    </div>
  </div>)
}

function Calendar(props) {

  const currentYearRef = useRef(null);

  useEffect(() => {
    currentYearRef.current.scrollIntoView(false);
  }, [currentYearRef.current]);

  const years = [];
  for (let i = 0; i < 800; i++) {
    years.push(1600+i);
  }
  const d = new Date();
  const currentYear = d.getFullYear();

  return (<div>
    12-digit calendar
    <div className="calendar-grid">
    { years.map((year, key) => {
      const isCurrentYear = year === currentYear;
      const yearBlockClass = year % 100 === 0 ? 'century-divider' : '';
  
      if (year === currentYear) {
        return <React.Fragment key={key}><div className={yearBlockClass}></div><div ref={currentYearRef}>
          <Year12Digit key={year} year={year} isCurrentYear={isCurrentYear} />
        </div></React.Fragment>
      } else {
        return <React.Fragment key={key}><div className={yearBlockClass}></div><div>
          <Year12Digit key={year} year={year} isCurrentYear={isCurrentYear} />
        </div></React.Fragment>
      }
      
    })}
    </div>
  </div>)
}

export default Calendar;