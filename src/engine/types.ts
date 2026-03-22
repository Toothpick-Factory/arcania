export interface Vec2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Entity {
  id: string;
  position: Vec2;
  velocity: Vec2;
  width: number;
  height: number;
  active: boolean;
}

export interface GameState {
  scene: SceneType;
  paused: boolean;
  floor: number;
  runNumber: number;
  gameTime: number;
}

export type SceneType = 'title' | 'hub' | 'dungeon' | 'gameover' | 'victory';

export interface Camera {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
}

export interface Tile {
  type: TileType;
  walkable: boolean;
  visible: boolean;
  explored: boolean;
}

export type TileType = 'floor' | 'wall' | 'door' | 'stairs' | 'shop' | 'cooking_station' | 'void';

export const TILE_SIZE = 32;
export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 640;
