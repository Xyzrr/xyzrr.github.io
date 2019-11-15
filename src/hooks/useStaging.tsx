import React from "react";

type Stage = () => void;

export default function useStaging(stages: Stage[]) {
  const [stage, setStage] = React.useState(0);
  React.useEffect(() => {
    window.addEventListener("keypress", e => {
      switch (e.keyCode) {
        case 110:
          // n
          stages[stage]();
          if (stage < stages.length - 1) {
            setStage(stage + 1);
          }
          break;
      }
    });
  });
  return [stage, setStage];
}
