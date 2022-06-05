import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const CSSRoot = document.querySelector(':root');
const CSSRootStyle = getComputedStyle(CSSRoot);

const getCSSVar = cssVarName => {
	let cssVar = CSSRootStyle.getPropertyValue(cssVarName);
	console.log('getCSSVar', cssVar);
	return cssVar;
}

const monthName = [
  'January', 'February', 'March',
  'April', 'May', 'June',
  'July', 'August', 'September',
  'October', 'November', 'December'
];

const MonthWrapper = styled.div`
	position: relative;
	display: inline-block;
	font-size: .5em;
	padding: 3px;
`;

const MonthDigit = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	padding-top: 25px;
	text-align: center;
	font-family: times new roman;
	font-style: italic;
	font-size:7em;
	color: ${getCSSVar('--palette-4')};
`;

const MonthRow = styled.div`
	display: flex;
`;

const MonthHeader = styled.div`
	font-size: 1em;
	font-weight: bold;
	text-align:center;
	border-radius: 10px;
	background-color: ${getCSSVar('--palette-4')};
`;

const MonthMasthead = styled.div`
	font-size:1.25em;
	margin-bottom: 3px;
`;

const DateCell = styled.div`
	position: relative;
	width: 14px;
	height: 14px;
	display: flex;
	justify-content: center;
	align-items: center;

	.blank {
		margin: 0 2px;
		background: transparent;
		height: 5px;
		width: 5px;
		border-radius: 50%;
	}
`;

function DrawMonth(props) {
	const [ monthData, setMonthData ] = useState(props.monthData);

	useEffect(() => {
		setMonthData(props.monthData);
	}, [props.monthData]);

	const generateHeader = () => {
		return (<MonthHeader>
		          <MonthMasthead>{monthName[monthData.month]}</MonthMasthead>
		        </MonthHeader>); 
	}

	const drawDate = date => {
		var dateClass = date.dt === '' ? `blank` : '';
		return <DateCell key={date.ndx}>
		         <div className={dateClass}>{date.dt}</div>
		       </DateCell>
	}

	const buildMonthRowArray = dates => {
		var nRows = Math.ceil(dates.length / 7);
		var rows = [];
		for (let i = 0; i < nRows; i++) { rows.push([]); }
		var rowNdx = 0;
		dates.forEach((d, ndx) => {
			if (ndx > 0 && ndx % 7 === 0) rowNdx++;
   			rows[rowNdx].push((d === -1 ? { ndx: ndx, dt: '' } : { ndx: ndx, dt: d } ));
		});
		return rows;
	}

	const monthRows = dates => {
		var rows = buildMonthRowArray(dates);
		return <div>
		         {rows.map((row, key) => {
		           return <MonthRow key={key}>
		                    {row.map(date => { return drawDate(date); })}
		                  </MonthRow>
		         })}
		       </div>
    
	}

	const generateCalendar = () => {
		var blanks = monthData.blanks;
		var monthDays = monthData.days;
		var dates = ['S','M','T','W','T','F','S'];
		for (let i = 0; i < blanks; i++) dates.push(-1);
		for (let i = 1; i <= monthDays; i++) dates.push(i);
		var html = monthRows(dates);
		return html;
	}

	return <MonthWrapper>
	         <MonthDigit>{monthData.blanks}</MonthDigit>
	         {generateHeader()}
	         {generateCalendar()}
	       </MonthWrapper>;
}

export default DrawMonth;

