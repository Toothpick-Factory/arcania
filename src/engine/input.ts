import { Vec2 } from './types';

export class InputManager {
  private keys: Set<string> = new Set();
  private keysJustPressed: Set<string> = new Set();
  private keysJustReleased: Set<string> = new Set();
  private mousePos: Vec2 = { x: 0, y: 0 };
  private mouseDown: boolean = false;
  private mouseJustClicked: boolean = false;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupListeners();
  }

  private setupListeners(): void {
    window.addEventListener('keydown', (e) => {
      if (!this.keys.has(e.code)) {
        this.keysJustPressed.add(e.code);
      }
      this.keys.add(e.code);
      e.preventDefault();
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
      this.keysJustReleased.add(e.code);
      e.preventDefault();
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mousePos = {
        x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
        y: (e.clientY - rect.top) * (this.canvas.height / rect.height),
      };
    });

    this.canvas.addEventListener('mousedown', () => {
      this.mouseDown = true;
      this.mouseJustClicked = true;
    });

    this.canvas.addEventListener('mouseup', () => {
      this.mouseDown = false;
    });

    // R16: Disable browser right-click menu on the game canvas
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  isKeyDown(code: string): boolean {
    return this.keys.has(code);
  }

  isKeyJustPressed(code: string): boolean {
    return this.keysJustPressed.has(code);
  }

  isKeyJustReleased(code: string): boolean {
    return this.keysJustReleased.has(code);
  }

  getMousePos(): Vec2 {
    return { ...this.mousePos };
  }

  isMouseDown(): boolean {
    return this.mouseDown;
  }

  isMouseJustClicked(): boolean {
    return this.mouseJustClicked;
  }

  getMovementVector(): Vec2 {
    let x = 0;
    let y = 0;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) y -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) y += 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) x -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) x += 1;
    // Normalize diagonal movement
    const len = Math.sqrt(x * x + y * y);
    if (len > 0) {
      x /= len;
      y /= len;
    }
    return { x, y };
  }

  endFrame(): void {
    this.keysJustPressed.clear();
    this.keysJustReleased.clear();
    this.mouseJustClicked = false;
  }
}
