export class GameLoop {
  private lastTime = 0;
  private accumulator = 0;
  private readonly fixedDt = 1 / 60; // 60 updates per second
  private running = false;
  private updateFn: (dt: number) => void;
  private renderFn: (interp: number) => void;
  private rafId = 0;

  constructor(update: (dt: number) => void, render: (interp: number) => void) {
    this.updateFn = update;
    this.renderFn = render;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now() / 1000;
    this.tick();
  }

  stop(): void {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  private tick = (): void => {
    if (!this.running) return;

    const now = performance.now() / 1000;
    let frameTime = now - this.lastTime;
    this.lastTime = now;

    // Clamp frame time to avoid spiral of death
    if (frameTime > 0.25) frameTime = 0.25;

    this.accumulator += frameTime;

    while (this.accumulator >= this.fixedDt) {
      this.updateFn(this.fixedDt);
      this.accumulator -= this.fixedDt;
    }

    const interp = this.accumulator / this.fixedDt;
    this.renderFn(interp);

    this.rafId = requestAnimationFrame(this.tick);
  };
}
