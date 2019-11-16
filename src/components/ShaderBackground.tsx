import React from "react";
import styled from "styled-components";

const ShaderBackgroundDiv = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: lightgray;
  canvas {
    width: 100%;
    height: 100%;
  }
`;

const ShaderBackground: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (canvasRef.current) {
      const gl = canvasRef.current.getContext("webgl");

      if (gl === null) {
        console.log("Unabled to initialize WebGL.");
        return;
      }

      gl.clearColor(0, 1, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
  }, []);

  return (
    <ShaderBackgroundDiv>
      <canvas ref={canvasRef}></canvas>
    </ShaderBackgroundDiv>
  );
};

export default ShaderBackground;
