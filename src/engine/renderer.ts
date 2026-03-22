import { Camera, Vec2, CANVAS_WIDTH, CANVAS_HEIGHT } from './types';

export class Renderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  camera: Camera;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    this.ctx = canvas.getContext('2d')!;
    this.camera = {
      x: 0,
      y: 0,
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      zoom: 1,
    };
  }

  clear(): void {
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  beginCamera(): void {
    this.ctx.save();
    this.ctx.scale(this.camera.zoom, this.camera.zoom);
    this.ctx.translate(
      -this.camera.x + this.camera.width / (2 * this.camera.zoom),
      -this.camera.y + this.camera.height / (2 * this.camera.zoom)
    );
  }

  endCamera(): void {
    this.ctx.restore();
  }

  worldToScreen(worldPos: Vec2): Vec2 {
    return {
      x: (worldPos.x - this.camera.x) * this.camera.zoom + this.camera.width / 2,
      y: (worldPos.y - this.camera.y) * this.camera.zoom + this.camera.height / 2,
    };
  }

  screenToWorld(screenPos: Vec2): Vec2 {
    return {
      x: (screenPos.x - this.camera.width / 2) / this.camera.zoom + this.camera.x,
      y: (screenPos.y - this.camera.height / 2) / this.camera.zoom + this.camera.y,
    };
  }

  drawRect(x: number, y: number, w: number, h: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }

  drawRectOutline(x: number, y: number, w: number, h: number, color: string, lineWidth = 1): void {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeRect(x, y, w, h);
  }

  drawCircle(x: number, y: number, radius: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawText(text: string, x: number, y: number, color: string, size = 16, align: CanvasTextAlign = 'left'): void {
    this.ctx.fillStyle = color;
    this.ctx.font = `${size}px monospace`;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(text, x, y);
  }

  drawBar(x: number, y: number, w: number, h: number, ratio: number, fgColor: string, bgColor: string): void {
    this.ctx.fillStyle = bgColor;
    this.ctx.fillRect(x, y, w, h);
    this.ctx.fillStyle = fgColor;
    this.ctx.fillRect(x, y, w * Math.max(0, Math.min(1, ratio)), h);
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, w, h);
  }

  followTarget(target: Vec2, lerp = 0.1): void {
    this.camera.x += (target.x - this.camera.x) * lerp;
    this.camera.y += (target.y - this.camera.y) * lerp;
  }
}
