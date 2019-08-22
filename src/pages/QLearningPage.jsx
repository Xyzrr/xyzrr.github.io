import React from "react";
import styled from "styled-components";

const Button = styled.button`
  background-color: red;
`;

function QLearningPage() {
  return (
    <div className="q-learning-page">
      Hello world <Button>Hey</Button>
    </div>
  );
}

export default QLearningPage;
