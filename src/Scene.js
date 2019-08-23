export default class Scene {
  constructor(canvas, ctx, size, sceneObjects) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.size = size;
    this.sceneObjects = sceneObjects;
    this.capturer = new window.CCapture({ format: "webm" });
  }

  startRecording() {
    this.capturer.start();
  }

  stopRecording() {
    this.capturer.stop();
    this.capturer.save();
  }

  render() {
    requestAnimationFrame(this.render.bind(this));

    this.ctx.clearRect(0, 0, this.size.width, this.size.height);
    this.sceneObjects.forEach(obj => {
      obj.render(this.ctx, this.size);
    });

    this.capturer.capture(this.canvas);
  }
}
