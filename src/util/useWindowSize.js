import React from "react";

// Hook
export default function useWindowSize() {
  const isClient = typeof window === "object";

  const getSize = React.useCallback(() => {
    return {
      width: isClient ? window.innerWidth : undefined,
      height: isClient ? window.innerHeight : undefined
    };
  }, [isClient]);

  const [windowSize, setWindowSize] = React.useState(getSize);

  React.useEffect(() => {
    if (!isClient) {
      return false;
    }

    function handleResize() {
      setWindowSize(getSize());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getSize, setWindowSize, isClient]); // Empty array ensures that effect is only run on mount and unmount

  return windowSize;
}
