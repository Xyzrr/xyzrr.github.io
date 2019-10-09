import React from 'react';
import styled, {keyframes} from 'styled-components';

import Position from '../util/Position';
import Katex from './Katex';

const clickEffect = keyframes`
    from {
        background: rgba(255, 255, 255, .5);
    }
    to {
        background: rgba(0, 0, 0, 0);
    }
`;

const ButtonDiv = styled.div`
  position: fixed;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  animation: ${clickEffect} 0.3s ease-out 1;
`;

export interface ButtonHandles {
  click(): void;
}

interface ButtonProps {
  expression: string;
  position: Position;
  onClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
}

const Button: React.RefForwardingComponent<ButtonHandles, ButtonProps> = (
  props,
  ref
) => {
  const buttonRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => ({
    click: () => {
      if (buttonRef.current) {
        buttonRef.current.style.animation = "none";
        window.setTimeout(() => {
          if (buttonRef.current) {
            buttonRef.current.style.animation = "";
          }
        });
      }
    }
  }));
  return (
    <ButtonDiv
      style={{
        left: props.position.x,
        top: props.position.y,
        animation: "none"
      }}
      onClick={props.onClick}
      ref={buttonRef}
    >
      <Katex fontSize={16} expression={props.expression}></Katex>
    </ButtonDiv>
  );
};

export default React.forwardRef(Button);
