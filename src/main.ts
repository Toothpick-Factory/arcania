import { Game } from './game';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './engine/types';

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
if (!canvas) {
  throw new Error('Canvas element not found');
}

function resizeCanvas(): void {
  const windowW = window.innerWidth;
  const windowH = window.innerHeight;
  const scale = Math.min(windowW / CANVAS_WIDTH, windowH / CANVAS_HEIGHT);
  canvas.style.width = `${CANVAS_WIDTH * scale}px`;
  canvas.style.height = `${CANVAS_HEIGHT * scale}px`;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const game = new Game(canvas);
game.start();
