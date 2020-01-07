import React from 'react';

const AspectRatioBox: React.FC = () => {
  return (
    <div
      style={{
        width: 1200,
        height: 675,
        top: 0,
        left: 0,
        border: "1px solid white",
        position: "fixed",
        pointerEvents: "none"
      }}
    ></div>
  );
};

export default AspectRatioBox;
