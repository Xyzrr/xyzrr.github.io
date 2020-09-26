import React from "react";

import Katex from "./Katex";

interface DynamicMatrixProps {}

const DynamicMatrix: React.FC<DynamicMatrixProps> = (props) => {
  return (
    <Katex
      expression={String.raw`
    \begin{bmatrix}
        x&y\\
        z&n\\
    \end{bmatrix}
    `}
    ></Katex>
  );
};

export default DynamicMatrix;
