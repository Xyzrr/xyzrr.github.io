import katex from 'katex';
import React from 'react';
import styled from 'styled-components';

import * as colors from '../colors';

const KatexDiv = styled.div<{ fontSize: number }>`
  color: ${colors.lightGray.toString()};
  font-size: ${props => props.fontSize}px;
`;

interface KatexProps {
  expression: string;
  fontSize?: number;
}

const Katex: React.FC<KatexProps> = props => {
  const html = katex.renderToString(props.expression);
  return (
    <KatexDiv
      fontSize={props.fontSize || 20}
      dangerouslySetInnerHTML={{ __html: html }}
    ></KatexDiv>
  );
};

export default Katex;
