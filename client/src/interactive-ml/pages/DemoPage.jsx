function DemoPage() {
  const canvasRef = React.useRef(null);
  const size = useWindowSize();
  const sceneRef = React.useRef();

  const resizeCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.width = size.width * window.devicePixelRatio;
      canvasRef.current.height = size.height * window.devicePixelRatio;
      const ctx = canvasRef.current.getContext("2d");
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      if (sceneRef.current) {
        sceneRef.current.size = size;
      }
    }
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    resizeCanvas();

    sceneRef.current = new Scene(canvas, ctx, size, [
      environmentObject,
      tableObject,
      agentObject,
      rewardNumberObject
    ]);

    sceneRef.current.render();
  }, []);
}