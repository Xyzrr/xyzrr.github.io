import React from "react";
import styled from "styled-components";
import { mat4 } from "gl-matrix";
import * as twgl from "twgl.js";

const FluidShaderCanvas = styled.canvas`
  width: 100%;
  height: 100%;
`;

const FluidShader: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const drawScene = (
    gl: WebGLRenderingContext,
    programInfo: twgl.ProgramInfo,
    bufferInfo: twgl.BufferInfo,
    time: number
  ) => {
    twgl.resizeCanvasToDisplaySize(
      gl.canvas as HTMLCanvasElement,
      window.devicePixelRatio
    );
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

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

    const uniforms = {
      u_projectionMatrix: projectionMatrix,
      u_modelViewMatrix: modelViewMatrix,
      u_reverseLightDirection: [0, 0, 1]
    };

    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, uniforms);
    twgl.drawBufferInfo(gl, bufferInfo);
  };

  React.useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const gl = canvasRef.current.getContext("webgl");

    if (gl === null) {
      console.log("Unabled to initialize WebGL.");
      return;
    }

    const vsSource = `
          attribute vec4 a_position;
          attribute vec4 a_color;
          attribute vec3 a_normal;

          uniform mat4 u_modelViewMatrix;
          uniform mat4 u_projectionMatrix;
          uniform vec3 u_reverseLightDirection;

          varying vec4 v_color;

          void main() {
              gl_Position = u_projectionMatrix * u_modelViewMatrix * a_position;
              v_color = a_color;
              v_color.rgb *= abs(dot(mat3(u_modelViewMatrix) * a_normal, u_reverseLightDirection)) * 0.8 + 0.2;
          }
        `;

    const fsSource = `
          precision mediump float;
          varying vec4 v_color;

          void main() {
              gl_FragColor = v_color;
          }
        `;

    const programInfo = twgl.createProgramInfo(gl, [vsSource, fsSource]);

    const arrays = {
      a_position: [
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
        // right
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
      ],
      a_color: {
        data: new Uint8Array([
          // front
          200,
          70,
          120,
          255,
          200,
          70,
          120,
          255,
          200,
          70,
          120,
          255,
          200,
          70,
          120,
          255,
          200,
          70,
          120,
          255,
          200,
          70,
          120,
          255,

          // right
          200,
          20,
          120,
          255,
          200,
          20,
          120,
          255,
          200,
          20,
          120,
          255,
          200,
          20,
          120,
          255,
          200,
          20,
          120,
          255,
          200,
          20,
          120,
          255,

          // back
          70,
          120,
          200,
          255,
          70,
          120,
          200,
          255,
          70,
          120,
          200,
          255,
          70,
          120,
          200,
          255,
          70,
          120,
          200,
          255,
          70,
          120,
          200,
          255
        ])
      },
      a_normal: [
        // front
        0,
        0,
        1,
        0,
        0,
        1,
        0,
        0,
        1,
        0,
        0,
        1,
        0,
        0,
        1,
        0,
        0,
        1,

        // side
        1,
        0,
        0,
        1,
        0,
        0,
        1,
        0,
        0,
        1,
        0,
        0,
        1,
        0,
        0,
        1,
        0,
        0,

        // back
        0,
        0,
        -1,
        0,
        0,
        -1,
        0,
        0,
        -1,
        0,
        0,
        -1,
        0,
        0,
        -1,
        0,
        0,
        -1
      ]
    };
    const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

    const animation = (time: number) => {
      drawScene(gl, programInfo, bufferInfo, time * 0.001);
      requestAnimationFrame(animation);
    };

    requestAnimationFrame(animation);
  }, []);

  return <FluidShaderCanvas ref={canvasRef}></FluidShaderCanvas>;
};

export default FluidShader;
