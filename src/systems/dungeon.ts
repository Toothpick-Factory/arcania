import { Tile, TileType, TILE_SIZE, Vec2, Rect } from '../engine/types';
import { randomInt, randomChoice, shuffleArray } from '../utils/math';

export interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'normal' | 'spawn' | 'boss' | 'miniboss' | 'shop' | 'cooking' | 'treasure';
  enemyCount: number;
  cleared: boolean;
  locked: boolean;       // R3: player locked in until room is cleared
  bossElement?: string;  // R3: element theme for boss rooms
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

const MIN_ROOM_SIZE = 8;
const MAX_ROOM_SIZE = 16;
const CORRIDOR_WIDTH = 3;
const MAP_WIDTH = 100;
const MAP_HEIGHT = 100;

export function generateDungeon(floor: number): DungeonMap {
  const width = MAP_WIDTH + Math.floor(floor * 3);
  const height = MAP_HEIGHT + Math.floor(floor * 3);

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
  const roomCount = 10 + Math.floor(floor * 2);
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
      locked: false,
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

  // Connect rooms with corridors (linear chain)
  for (let i = 1; i < rooms.length; i++) {
    const prevCenter = getRoomCenter(rooms[i - 1]);
    const currCenter = getRoomCenter(rooms[i]);
    if (Math.random() > 0.5) {
      carveHCorridor(tiles, prevCenter.x, currCenter.x, prevCenter.y);
      carveVCorridor(tiles, prevCenter.y, currCenter.y, currCenter.x);
    } else {
      carveVCorridor(tiles, prevCenter.y, currCenter.y, prevCenter.x);
      carveHCorridor(tiles, prevCenter.x, currCenter.x, currCenter.y);
    }
  }

  // CSV2: Add extra connections to avoid dead ends — connect some non-adjacent rooms
  const extraConnections = Math.floor(rooms.length / 3);
  for (let i = 0; i < extraConnections; i++) {
    const a = randomInt(0, rooms.length - 1);
    const b = randomInt(0, rooms.length - 1);
    if (a !== b) {
      const ca = getRoomCenter(rooms[a]);
      const cb = getRoomCenter(rooms[b]);
      carveHCorridor(tiles, ca.x, cb.x, ca.y);
      carveVCorridor(tiles, ca.y, cb.y, cb.x);
    }
  }

  // Assign room types
  rooms[0].type = 'spawn';
  rooms[0].cleared = true;
  rooms[rooms.length - 1].type = 'boss';

  // R3: Make boss room larger (expand to at least 12x12)
  const bossRoom = rooms[rooms.length - 1];
  const minBossSize = 12;
  if (bossRoom.width < minBossSize) {
    const expand = minBossSize - bossRoom.width;
    bossRoom.width = minBossSize;
    // Re-carve the expanded area
    for (let ry = bossRoom.y; ry < bossRoom.y + bossRoom.height; ry++) {
      for (let rx = bossRoom.x; rx < bossRoom.x + expand + bossRoom.width; rx++) {
        if (ry >= 0 && ry < height && rx >= 0 && rx < width) {
          tiles[ry][rx] = { type: 'floor', walkable: true, visible: false, explored: false };
        }
      }
    }
  }
  if (bossRoom.height < minBossSize) {
    const expand = minBossSize - bossRoom.height;
    bossRoom.height = minBossSize;
    for (let ry = bossRoom.y; ry < bossRoom.y + bossRoom.height + expand; ry++) {
      for (let rx = bossRoom.x; rx < bossRoom.x + bossRoom.width; rx++) {
        if (ry >= 0 && ry < height && rx >= 0 && rx < width) {
          tiles[ry][rx] = { type: 'floor', walkable: true, visible: false, explored: false };
        }
      }
    }
  }
  bossRoom.locked = false; // unlocked until player enters

  // Place special rooms — FB2/3: 3 tiers of bosses
  const midRooms = shuffleArray(rooms.slice(1, -1));
  let idx = 0;
  if (midRooms.length > idx) { midRooms[idx].type = 'shop'; idx++; }
  if (midRooms.length > idx) { midRooms[idx].type = 'cooking'; idx++; }
  if (midRooms.length > idx) { midRooms[idx].type = 'treasure'; idx++; }
  // Entry-difficulty bosses (3-4 per floor)
  // CSV2: Fewer boss rooms — most rooms should be normal combat rooms
  // Entry bosses (2 per floor)
  const entryBossCount = 2;
  for (let i = 0; i < entryBossCount && idx < midRooms.length; i++) {
    midRooms[idx].type = 'miniboss'; idx++;
  }
  // Elite boss (1 per floor)
  if (idx < midRooms.length) {
    midRooms[idx].type = 'miniboss'; idx++;
  }

  // Assign enemy counts
  for (const room of rooms) {
    if (room.type === 'normal') {
      room.enemyCount = randomInt(3, 4 + floor);
    } else if (room.type === 'miniboss') {
      room.enemyCount = 1; // single mini-boss
    } else if (room.type === 'boss') {
      room.enemyCount = 1;
    }
  }

  // Place special tiles
  const bossRm = rooms[rooms.length - 1];
  const bossCenter = getRoomCenter(bossRm);
  tiles[bossCenter.y][bossCenter.x] = { type: 'stairs', walkable: true, visible: false, explored: false };

  for (const room of rooms) {
    const center = getRoomCenter(room);
    if (room.type === 'shop') {
      tiles[center.y][center.x] = { type: 'shop', walkable: true, visible: false, explored: false };
    } else if (room.type === 'cooking') {
      tiles[center.y][center.x] = { type: 'cooking_station', walkable: true, visible: false, explored: false };
    }

    // CSV3: Place torches on walls flanking boss/miniboss rooms (not in doorways)
    if (room.type === 'boss' || room.type === 'miniboss') {
      const torchType = room.type === 'boss' ? 'torch_red' as const : 'torch_yellow' as const;
      // Place torches on the inner wall corners of the room
      const positions = [
        { x: room.x, y: room.y },                                    // top-left
        { x: room.x + room.width - 1, y: room.y },                   // top-right
        { x: room.x, y: room.y + room.height - 1 },                  // bottom-left
        { x: room.x + room.width - 1, y: room.y + room.height - 1 }, // bottom-right
      ];
      for (const pos of positions) {
        if (pos.x >= 0 && pos.x < width && pos.y >= 0 && pos.y < height) {
          tiles[pos.y][pos.x] = { type: torchType, walkable: false, visible: false, explored: false };
        }
      }
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
    // R2: 2-wide corridors
    for (let dy = 0; dy < CORRIDOR_WIDTH; dy++) {
      const cy = y + dy;
      if (cy >= 0 && cy < tiles.length && x >= 0 && x < tiles[0].length) {
        tiles[cy][x] = { type: 'floor', walkable: true, visible: false, explored: false };
      }
    }
  }
}

function carveVCorridor(tiles: Tile[][], y1: number, y2: number, x: number): void {
  const startY = Math.min(y1, y2);
  const endY = Math.max(y1, y2);
  for (let y = startY; y <= endY; y++) {
    for (let dx = 0; dx < CORRIDOR_WIDTH; dx++) {
      const cx = x + dx;
      if (y >= 0 && y < tiles.length && cx >= 0 && cx < tiles[0].length) {
        tiles[y][cx] = { type: 'floor', walkable: true, visible: false, explored: false };
      }
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

/**
 * R13: Generate a small pre-made lobby area
 */
export function generateLobby(): DungeonMap {
  const width = 20;
  const height = 20;
  const tiles: Tile[][] = [];
  for (let y = 0; y < height; y++) {
    tiles[y] = [];
    for (let x = 0; x < width; x++) {
      tiles[y][x] = { type: 'wall', walkable: false, visible: true, explored: true };
    }
  }

  // Carve the lobby room (centered, 12x12)
  const roomX = 4, roomY = 4, roomW = 12, roomH = 12;
  for (let ry = roomY; ry < roomY + roomH; ry++) {
    for (let rx = roomX; rx < roomX + roomW; rx++) {
      tiles[ry][rx] = { type: 'floor', walkable: true, visible: true, explored: true };
    }
  }

  // Portal tile at the top center
  tiles[roomY + 1][roomX + roomW / 2] = { type: 'stairs', walkable: true, visible: true, explored: true };

  // Campfire at center (using cooking_station tile type for the visual)
  tiles[roomY + roomH / 2][roomX + roomW / 2] = { type: 'cooking_station', walkable: true, visible: true, explored: true };

  const lobbyRoom: Room = {
    x: roomX, y: roomY, width: roomW, height: roomH,
    type: 'spawn', enemyCount: 0, cleared: true, locked: false,
  };

  return {
    width, height, tiles, rooms: [lobbyRoom],
    spawnRoom: lobbyRoom, bossRoom: lobbyRoom, floor: 0,
  };
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
