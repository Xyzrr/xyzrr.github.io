import React from "react";
import styled from "styled-components";
import { mat4 } from "gl-matrix";
import useWindowSize from "../util/useWindowSize";

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

  const windowSize = useWindowSize();

  const resizeCanvas = (gl: WebGLRenderingContext | null) => {
    if (gl && windowSize.width && windowSize.height) {
      gl.canvas.width = windowSize.width * window.devicePixelRatio;
      gl.canvas.height = windowSize.height * window.devicePixelRatio;
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }
  };

  const loadShader = (
    gl: WebGLRenderingContext,
    type: number,
    source: string
  ) => {
    const shader = gl.createShader(type);
    if (!shader) {
      return null;
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(
        "An error occured compiling the shaders:",
        gl.getShaderInfoLog(shader)
      );
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  };

  const initShaderProgram = (
    gl: WebGLRenderingContext,
    vsSource: string,
    fsSource: string
  ) => {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    if (!shaderProgram || !vertexShader || !fragmentShader) {
      return null;
    }

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error(
        "Unable to initialize the shader program:",
        gl.getProgramInfoLog(shaderProgram)
      );
      return null;
    }

    return shaderProgram;
  };

  const initBuffer = (gl: WebGLRenderingContext, data: ArrayBuffer) => {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buffer;
  };

  const initAttribute = (
    gl: WebGLRenderingContext,
    location: number,
    size: number,
    type: number,
    normalize: boolean,
    buffer: WebGLBuffer
  ) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    const stride = 0;
    const offset = 0;
    gl.vertexAttribPointer(location, size, type, normalize, stride, offset);
    gl.enableVertexAttribArray(location);
  };

  const drawScene = (
    gl: WebGLRenderingContext,
    programInfo: any,
    time: number
  ) => {
    gl.clearColor(0, 0, 0, 1);
    gl.clearDepth(1);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const fieldOfView = (45 * Math.PI) / 180;
    const aspect = gl.canvas.width / gl.canvas.height;
    const zNear = 0.1;
    const zFar = 100;
    const projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    const modelViewMatrix = mat4.create();

    mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -6]);
    mat4.rotateY(modelViewMatrix, modelViewMatrix, (Math.PI / 4) * time);

    initAttribute(
      gl,
      programInfo.attribLocations.vertexPosition,
      3,
      gl.FLOAT,
      false,
      programInfo.buffers.position
    );

    initAttribute(
      gl,
      programInfo.attribLocations.vertexColor,
      3,
      gl.UNSIGNED_BYTE,
      true,
      programInfo.buffers.color
    );

    gl.useProgram(programInfo.program);

    gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix
    );

    gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix
    );

    {
      const offset = 0;
      const vertexCount = 18;
      gl.drawArrays(gl.TRIANGLES, offset, vertexCount);
    }
  };

  React.useEffect(() => {
    if (canvasRef.current) {
      const gl = canvasRef.current.getContext("webgl");

      resizeCanvas(gl);

      if (gl === null) {
        console.log("Unabled to initialize WebGL.");
        return;
      }

      const vsSource = `
          attribute vec4 aVertexPosition;
          attribute vec4 aVertexColor;

          uniform mat4 uModelViewMatrix;
          uniform mat4 uProjectionMatrix;
          // uniform vec2 uTranslationVector;

          varying vec4 vColor;

          void main() {
              gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
              // gl_Position = vec4(aVertexPosition + uTranslationVector, 0, 1);
              vColor = aVertexColor;
          }
        `;

      const fsSource = `
          precision mediump float;
          varying vec4 vColor;

          void main() {
              gl_FragColor = vColor;
          }
        `;

      const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

      if (!shaderProgram) {
        return;
      }

      const programInfo = {
        program: shaderProgram,
        attribLocations: {
          vertexPosition: gl.getAttribLocation(
            shaderProgram,
            "aVertexPosition"
          ),
          vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor")
        },
        uniformLocations: {
          projectionMatrix: gl.getUniformLocation(
            shaderProgram,
            "uProjectionMatrix"
          ),
          modelViewMatrix: gl.getUniformLocation(
            shaderProgram,
            "uModelViewMatrix"
          )
        },
        buffers: {
          position: initBuffer(
            gl,
            new Float32Array([
              // front
              1,
              1,
              1,
              -1,
              1,
              1,
              1,
              -1,
              1,
              -1,
              1,
              1,
              1,
              -1,
              1,
              -1,
              -1,
              1,
              // front
              1,
              1,
              1,
              1,
              1,
              -1,
              1,
              -1,
              1,
              1,
              -1,
              1,
              1,
              1,
              -1,
              1,
              -1,
              -1,
              // back
              1,
              1,
              -1,
              -1,
              1,
              -1,
              1,
              -1,
              -1,
              -1,
              1,
              -1,
              1,
              -1,
              -1,
              -1,
              -1,
              -1
            ])
          ),
          color: initBuffer(
            gl,
            new Uint8Array([
              // front
              200,
              70,
              120,
              200,
              70,
              120,
              200,
              70,
              120,
              200,
              70,
              120,
              200,
              70,
              120,
              200,
              70,
              120,

              // front
              200,
              20,
              120,
              200,
              20,
              120,
              200,
              20,
              120,
              200,
              20,
              120,
              200,
              20,
              120,
              200,
              20,
              120,

              // back
              70,
              120,
              200,
              70,
              120,
              200,
              70,
              120,
              200,
              70,
              120,
              200,
              70,
              120,
              200,
              70,
              120,
              200
            ])
          )
        }
      };

      const animation = (time: number) => {
        drawScene(gl, programInfo, time * 0.001);
        requestAnimationFrame(animation);
      };

      requestAnimationFrame(animation);
    }
  }, []);

  return (
    <ShaderBackgroundDiv>
      <canvas ref={canvasRef}></canvas>
    </ShaderBackgroundDiv>
  );
};

export default ShaderBackground;
