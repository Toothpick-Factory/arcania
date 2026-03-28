import { describe, it, expect } from 'vitest';
import {
  generateDungeon, isTileWalkable, worldToTile, tileToWorld,
  getRoomCenterWorld, findRoomAt, updateVisibility
} from './dungeon';
import { TILE_SIZE } from '../engine/types';

describe('Dungeon generation', () => {
  it('generates a dungeon with rooms', () => {
    const dungeon = generateDungeon(1);
    expect(dungeon.rooms.length).toBeGreaterThanOrEqual(5);
    expect(dungeon.width).toBeGreaterThanOrEqual(60);
    expect(dungeon.height).toBeGreaterThanOrEqual(60);
  });

  it('has spawn and boss rooms', () => {
    const dungeon = generateDungeon(1);
    expect(dungeon.spawnRoom).toBeDefined();
    expect(dungeon.bossRoom).toBeDefined();
    expect(dungeon.spawnRoom.type).toBe('spawn');
    expect(dungeon.bossRoom.type).toBe('boss');
  });

  it('spawn room is cleared by default', () => {
    const dungeon = generateDungeon(1);
    expect(dungeon.spawnRoom.cleared).toBe(true);
  });

  it('has a shop room', () => {
    const dungeon = generateDungeon(1);
    const shopRoom = dungeon.rooms.find((r) => r.type === 'shop');
    expect(shopRoom).toBeDefined();
  });

  it('has a cooking station room', () => {
    const dungeon = generateDungeon(1);
    const cookRoom = dungeon.rooms.find((r) => r.type === 'cooking');
    expect(cookRoom).toBeDefined();
  });

  it('rooms have walkable floor tiles', () => {
    const dungeon = generateDungeon(1);
    for (const room of dungeon.rooms) {
      const centerX = Math.floor(room.x + room.width / 2);
      const centerY = Math.floor(room.y + room.height / 2);
      expect(isTileWalkable(dungeon, centerX, centerY)).toBe(true);
    }
  });

  it('walls are not walkable', () => {
    const dungeon = generateDungeon(1);
    // Check corners of map which should be walls
    expect(isTileWalkable(dungeon, 0, 0)).toBe(false);
  });

  it('out of bounds is not walkable', () => {
    const dungeon = generateDungeon(1);
    expect(isTileWalkable(dungeon, -1, -1)).toBe(false);
    expect(isTileWalkable(dungeon, dungeon.width + 1, dungeon.height + 1)).toBe(false);
  });

  it('scales dungeon size with floor', () => {
    const d1 = generateDungeon(1);
    const d5 = generateDungeon(5);
    expect(d5.width).toBeGreaterThan(d1.width);
    expect(d5.rooms.length).toBeGreaterThanOrEqual(d1.rooms.length);
  });

  it('assigns enemy counts to normal rooms', () => {
    const dungeon = generateDungeon(1);
    const normalRooms = dungeon.rooms.filter((r) => r.type === 'normal');
    for (const room of normalRooms) {
      expect(room.enemyCount).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('Tile coordinate conversion', () => {
  it('converts world to tile coords', () => {
    const tile = worldToTile(TILE_SIZE * 5 + 10, TILE_SIZE * 3 + 5);
    expect(tile.x).toBe(5);
    expect(tile.y).toBe(3);
  });

  it('converts tile to world coords (center)', () => {
    const world = tileToWorld(5, 3);
    expect(world.x).toBe(5 * TILE_SIZE + TILE_SIZE / 2);
    expect(world.y).toBe(3 * TILE_SIZE + TILE_SIZE / 2);
  });

  it('getRoomCenterWorld returns center of room in world coords', () => {
    const dungeon = generateDungeon(1);
    const center = getRoomCenterWorld(dungeon.spawnRoom);
    expect(center.x).toBeGreaterThan(0);
    expect(center.y).toBeGreaterThan(0);
  });
});

describe('Visibility', () => {
  it('updates tile visibility around player', () => {
    const dungeon = generateDungeon(1);
    const center = getRoomCenterWorld(dungeon.spawnRoom);
    const tile = worldToTile(center.x, center.y);
    updateVisibility(dungeon, tile.x, tile.y, 8);

    // The tile the player is on should be visible
    expect(dungeon.tiles[tile.y][tile.x].visible).toBe(true);
    expect(dungeon.tiles[tile.y][tile.x].explored).toBe(true);
  });

  it('explored tiles stay explored when visibility is cleared', () => {
    const dungeon = generateDungeon(1);
    const spawnCenter = getRoomCenterWorld(dungeon.spawnRoom);
    const tile = worldToTile(spawnCenter.x, spawnCenter.y);

    // First update: mark tiles as visible + explored
    updateVisibility(dungeon, tile.x, tile.y, 8);
    expect(dungeon.tiles[tile.y][tile.x].visible).toBe(true);
    expect(dungeon.tiles[tile.y][tile.x].explored).toBe(true);

    // Move player far away so previously visible tiles lose visibility
    // Use boss room which is far from spawn
    const bossCenter = getRoomCenterWorld(dungeon.bossRoom);
    const bossTile = worldToTile(bossCenter.x, bossCenter.y);
    updateVisibility(dungeon, bossTile.x, bossTile.y, 8);

    // Original spawn tile should no longer be visible but should remain explored
    expect(dungeon.tiles[tile.y][tile.x].visible).toBe(false);
    expect(dungeon.tiles[tile.y][tile.x].explored).toBe(true);
  });

  it('unexplored tiles remain unexplored outside radius', () => {
    const dungeon = generateDungeon(1);
    const center = getRoomCenterWorld(dungeon.spawnRoom);
    const tile = worldToTile(center.x, center.y);
    updateVisibility(dungeon, tile.x, tile.y, 8);

    // A tile far from the player should not be explored
    const farTile = dungeon.tiles[0][0];
    expect(farTile.explored).toBe(false);
    expect(farTile.visible).toBe(false);
  });
});

describe('findRoomAt', () => {
  it('finds room containing a tile', () => {
    const dungeon = generateDungeon(1);
    const room = dungeon.spawnRoom;
    const cx = Math.floor(room.x + room.width / 2);
    const cy = Math.floor(room.y + room.height / 2);
    const found = findRoomAt(dungeon, cx, cy);
    expect(found).toBe(room);
  });

  it('returns undefined for tiles not in any room', () => {
    const dungeon = generateDungeon(1);
    const found = findRoomAt(dungeon, 0, 0);
    expect(found).toBeUndefined();
  });
});
