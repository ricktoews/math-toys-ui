import React from 'react';
import styled from 'styled-components';

const PeriodicWrapper = styled.span`
	display: inline-block;
`;

const Whole = styled.span`
`;

const NonRepeating = styled.span`
`;

const Repeating = styled.span`
	text-decoration: overline;
`;


export default function Periodic({ whole, nonRepeating, repeating }) {
	return (
	<PeriodicWrapper>
	  <Whole>{whole}</Whole>.<NonRepeating>{nonRepeating}</NonRepeating><Repeating>{repeating}</Repeating>
	</PeriodicWrapper>
	);
}
