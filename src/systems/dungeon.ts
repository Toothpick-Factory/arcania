import { Tile, TileType, TILE_SIZE, Vec2, Rect } from '../engine/types';
import { randomInt, randomChoice, shuffleArray } from '../utils/math';

export interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'normal' | 'spawn' | 'boss' | 'shop' | 'cooking' | 'treasure';
  enemyCount: number;
  cleared: boolean;
}

export interface DungeonMap {
  width: number;
  height: number;
  tiles: Tile[][];
  rooms: Room[];
  spawnRoom: Room;
  bossRoom: Room;
  floor: number;
}

const MIN_ROOM_SIZE = 5;
const MAX_ROOM_SIZE = 10;
const MAP_WIDTH = 60;
const MAP_HEIGHT = 60;

export function generateDungeon(floor: number): DungeonMap {
  const width = MAP_WIDTH + Math.floor(floor * 2);
  const height = MAP_HEIGHT + Math.floor(floor * 2);

  // Initialize all tiles as walls
  const tiles: Tile[][] = [];
  for (let y = 0; y < height; y++) {
    tiles[y] = [];
    for (let x = 0; x < width; x++) {
      tiles[y][x] = { type: 'wall', walkable: false, visible: false, explored: false };
    }
  }

  // Generate rooms using BSP-like approach
  const rooms: Room[] = [];
  const roomCount = 8 + Math.floor(floor * 1.5);
  const maxAttempts = roomCount * 20;

  for (let i = 0; i < maxAttempts && rooms.length < roomCount; i++) {
    const w = randomInt(MIN_ROOM_SIZE, MAX_ROOM_SIZE);
    const h = randomInt(MIN_ROOM_SIZE, MAX_ROOM_SIZE);
    const x = randomInt(2, width - w - 2);
    const y = randomInt(2, height - h - 2);

    const newRoom: Room = {
      x, y, width: w, height: h,
      type: 'normal',
      enemyCount: 0,
      cleared: false,
    };

    // Check overlap with existing rooms (with padding)
    const overlaps = rooms.some((r) =>
      x - 2 < r.x + r.width &&
      x + w + 2 > r.x &&
      y - 2 < r.y + r.height &&
      y + h + 2 > r.y
    );

    if (!overlaps) {
      rooms.push(newRoom);
    }
  }

  // Carve rooms into tiles
  for (const room of rooms) {
    for (let ry = room.y; ry < room.y + room.height; ry++) {
      for (let rx = room.x; rx < room.x + room.width; rx++) {
        tiles[ry][rx] = { type: 'floor', walkable: true, visible: false, explored: false };
      }
    }
  }

  // Connect rooms with corridors
  for (let i = 1; i < rooms.length; i++) {
    const prevCenter = getRoomCenter(rooms[i - 1]);
    const currCenter = getRoomCenter(rooms[i]);

    // Randomly choose horizontal-first or vertical-first
    if (Math.random() > 0.5) {
      carveHCorridor(tiles, prevCenter.x, currCenter.x, prevCenter.y);
      carveVCorridor(tiles, prevCenter.y, currCenter.y, currCenter.x);
    } else {
      carveVCorridor(tiles, prevCenter.y, currCenter.y, prevCenter.x);
      carveHCorridor(tiles, prevCenter.x, currCenter.x, currCenter.y);
    }
  }

  // Assign room types
  rooms[0].type = 'spawn';
  rooms[0].cleared = true;
  rooms[rooms.length - 1].type = 'boss';

  // Place special rooms
  const midRooms = shuffleArray(rooms.slice(1, -1));
  if (midRooms.length > 0) midRooms[0].type = 'shop';
  if (midRooms.length > 1) midRooms[1].type = 'cooking';
  if (midRooms.length > 2) midRooms[2].type = 'treasure';

  // Assign enemy counts to normal rooms
  for (const room of rooms) {
    if (room.type === 'normal') {
      room.enemyCount = randomInt(2, 3 + floor);
    } else if (room.type === 'boss') {
      room.enemyCount = 1;
    }
  }

  // Place special tiles
  const bossRoom = rooms[rooms.length - 1];
  const bossCenter = getRoomCenter(bossRoom);
  tiles[bossCenter.y][bossCenter.x] = { type: 'stairs', walkable: true, visible: false, explored: false };

  for (const room of rooms) {
    const center = getRoomCenter(room);
    if (room.type === 'shop') {
      tiles[center.y][center.x] = { type: 'shop', walkable: true, visible: false, explored: false };
    } else if (room.type === 'cooking') {
      tiles[center.y][center.x] = { type: 'cooking_station', walkable: true, visible: false, explored: false };
    }
  }

  return {
    width, height, tiles, rooms,
    spawnRoom: rooms[0],
    bossRoom: rooms[rooms.length - 1],
    floor,
  };
}

function getRoomCenter(room: Room): Vec2 {
  return {
    x: Math.floor(room.x + room.width / 2),
    y: Math.floor(room.y + room.height / 2),
  };
}

export function getRoomCenterWorld(room: Room): Vec2 {
  const center = getRoomCenter(room);
  return { x: center.x * TILE_SIZE + TILE_SIZE / 2, y: center.y * TILE_SIZE + TILE_SIZE / 2 };
}

function carveHCorridor(tiles: Tile[][], x1: number, x2: number, y: number): void {
  const startX = Math.min(x1, x2);
  const endX = Math.max(x1, x2);
  for (let x = startX; x <= endX; x++) {
    if (y >= 0 && y < tiles.length && x >= 0 && x < tiles[0].length) {
      tiles[y][x] = { type: 'floor', walkable: true, visible: false, explored: false };
    }
  }
}

function carveVCorridor(tiles: Tile[][], y1: number, y2: number, x: number): void {
  const startY = Math.min(y1, y2);
  const endY = Math.max(y1, y2);
  for (let y = startY; y <= endY; y++) {
    if (y >= 0 && y < tiles.length && x >= 0 && x < tiles[0].length) {
      tiles[y][x] = { type: 'floor', walkable: true, visible: false, explored: false };
    }
  }
}

export function isTileWalkable(dungeon: DungeonMap, tileX: number, tileY: number): boolean {
  if (tileX < 0 || tileX >= dungeon.width || tileY < 0 || tileY >= dungeon.height) return false;
  return dungeon.tiles[tileY][tileX].walkable;
}

export function worldToTile(worldX: number, worldY: number): Vec2 {
  return { x: Math.floor(worldX / TILE_SIZE), y: Math.floor(worldY / TILE_SIZE) };
}

export function tileToWorld(tileX: number, tileY: number): Vec2 {
  return { x: tileX * TILE_SIZE + TILE_SIZE / 2, y: tileY * TILE_SIZE + TILE_SIZE / 2 };
}

export function updateVisibility(dungeon: DungeonMap, playerTileX: number, playerTileY: number, radius: number = 8): void {
  // Reset visibility
  for (let y = 0; y < dungeon.height; y++) {
    for (let x = 0; x < dungeon.width; x++) {
      dungeon.tiles[y][x].visible = false;
    }
  }

  // Simple raycasting FOV
  for (let angle = 0; angle < 360; angle += 1) {
    const rad = (angle * Math.PI) / 180;
    const dx = Math.cos(rad);
    const dy = Math.sin(rad);

    let cx = playerTileX + 0.5;
    let cy = playerTileY + 0.5;

    for (let i = 0; i < radius; i++) {
      const tx = Math.floor(cx);
      const ty = Math.floor(cy);

      if (tx < 0 || tx >= dungeon.width || ty < 0 || ty >= dungeon.height) break;

      dungeon.tiles[ty][tx].visible = true;
      dungeon.tiles[ty][tx].explored = true;

      if (dungeon.tiles[ty][tx].type === 'wall') break;

      cx += dx;
      cy += dy;
    }
  }
}

export function findRoomAt(dungeon: DungeonMap, tileX: number, tileY: number): Room | undefined {
  return dungeon.rooms.find(
    (r) => tileX >= r.x && tileX < r.x + r.width && tileY >= r.y && tileY < r.y + r.height
  );
}

/**
 * Raycasts from one world position to another.
 * Returns the farthest walkable world position along the line before hitting a wall.
 * If the full path is clear, returns the target position.
 */
export function lineOfSightClamp(dungeon: DungeonMap, from: Vec2, to: Vec2): Vec2 {
  const fromTile = worldToTile(from.x, from.y);
  const toTile = worldToTile(to.x, to.y);

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return { ...to };

  const stepSize = TILE_SIZE / 2; // check every half-tile
  const steps = Math.ceil(dist / stepSize);
  const sx = dx / steps;
  const sy = dy / steps;

  let lastGoodX = from.x;
  let lastGoodY = from.y;

  for (let i = 1; i <= steps; i++) {
    const cx = from.x + sx * i;
    const cy = from.y + sy * i;
    const tile = worldToTile(cx, cy);

    if (!isTileWalkable(dungeon, tile.x, tile.y)) {
      return { x: lastGoodX, y: lastGoodY };
    }
    lastGoodX = cx;
    lastGoodY = cy;
  }

  return { ...to };
}

/**
 * Returns true if there is a clear line of sight between two world positions.
 */
export function hasLineOfSight(dungeon: DungeonMap, from: Vec2, to: Vec2): boolean {
  const clamped = lineOfSightClamp(dungeon, from, to);
  const clampedTile = worldToTile(clamped.x, clamped.y);
  const toTile = worldToTile(to.x, to.y);
  return clampedTile.x === toTile.x && clampedTile.y === toTile.y;
}
