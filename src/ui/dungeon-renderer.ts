import { Renderer } from '../engine/renderer';
import { DungeonMap, worldToTile } from '../systems/dungeon';
import { TILE_SIZE } from '../engine/types';
import { Player } from '../entities/player';
import { Enemy, EnemyProjectile } from '../entities/enemy';
import { Projectile, AoeEffect } from '../entities/projectile';

const TILE_COLORS: Record<string, [string, string]> = {
  floor: ['#2a2a3a', '#252535'],
  wall: ['#555566', '#4a4a5a'],
  door: ['#886644', '#775533'],
  stairs: ['#ffdd44', '#ccaa22'],
  shop: ['#334488', '#223366'],
  cooking_station: ['#884422', '#663311'],
  void: ['#000000', '#000000'],
};

export function renderDungeon(renderer: Renderer, dungeon: DungeonMap): void {
  const cam = renderer.camera;
  const startTileX = Math.max(0, Math.floor((cam.x - cam.width / 2) / TILE_SIZE) - 1);
  const startTileY = Math.max(0, Math.floor((cam.y - cam.height / 2) / TILE_SIZE) - 1);
  const endTileX = Math.min(dungeon.width, Math.ceil((cam.x + cam.width / 2) / TILE_SIZE) + 1);
  const endTileY = Math.min(dungeon.height, Math.ceil((cam.y + cam.height / 2) / TILE_SIZE) + 1);

  for (let y = startTileY; y < endTileY; y++) {
    for (let x = startTileX; x < endTileX; x++) {
      const tile = dungeon.tiles[y][x];
      if (!tile.explored) continue;

      const colors = TILE_COLORS[tile.type] || TILE_COLORS.void;
      const color = tile.visible ? colors[0] : colors[1];
      const alpha = tile.visible ? 1 : 0.4;

      renderer.ctx.globalAlpha = alpha;
      renderer.drawRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE, color);

      // Add some texture to walls
      if (tile.type === 'wall' && tile.visible) {
        renderer.ctx.globalAlpha = 0.15;
        renderer.drawRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, 2, '#888888');
        renderer.drawRect(x * TILE_SIZE, y * TILE_SIZE, 2, TILE_SIZE, '#888888');
      }

      // Special tile indicators
      if (tile.type === 'stairs' && tile.visible) {
        renderer.ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 300) * 0.3;
        renderer.drawRect(x * TILE_SIZE + 4, y * TILE_SIZE + 4, TILE_SIZE - 8, TILE_SIZE - 8, '#ffff88');
      }
      if (tile.type === 'shop' && tile.visible) {
        renderer.drawText('$', x * TILE_SIZE + 10, y * TILE_SIZE + 8, '#4488ff', 16);
      }
      if (tile.type === 'cooking_station' && tile.visible) {
        renderer.ctx.globalAlpha = 0.7 + Math.sin(Date.now() / 200) * 0.3;
        renderer.drawCircle(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 8, '#ff6622');
      }

      renderer.ctx.globalAlpha = 1;
    }
  }
}

export function renderPlayer(renderer: Renderer, player: Player): void {
  const { x, y } = player.position;
  const halfW = player.width / 2;
  const halfH = player.height / 2;

  // Shadow
  renderer.ctx.globalAlpha = 0.3;
  renderer.drawCircle(x, y + halfH + 2, halfW * 0.8, '#000000');
  renderer.ctx.globalAlpha = 1;

  // Body
  const flash = player.invincibleTimer > 0 && Math.floor(player.invincibleTimer * 10) % 2 === 0;
  if (!flash) {
    // Robe/body
    renderer.drawRect(x - halfW, y - halfH, player.width, player.height, '#6644aa');
    // Head
    renderer.drawCircle(x, y - halfH + 4, 7, '#ffccaa');
    // Hat
    renderer.drawRect(x - 8, y - halfH - 6, 16, 8, '#4422aa');
    renderer.drawRect(x - 4, y - halfH - 12, 8, 6, '#4422aa');
  }

  // Facing direction indicator (staff/wand)
  const fx = x + player.facing.x * 14;
  const fy = y + player.facing.y * 14;
  renderer.drawCircle(fx, fy, 3, '#cc88ff');
}

export function renderEnemies(renderer: Renderer, enemies: Enemy[], dungeon: DungeonMap, debugFog: boolean): void {
  for (const enemy of enemies) {
    if (!enemy.active) continue;

    // Hide enemies in fog of war (unless debug fog is on)
    if (!debugFog) {
      const tile = worldToTile(enemy.position.x, enemy.position.y);
      if (tile.y >= 0 && tile.y < dungeon.height && tile.x >= 0 && tile.x < dungeon.width) {
        if (!dungeon.tiles[tile.y][tile.x].visible) continue;
      }
    }

    const { x, y } = enemy.position;
    const size = enemy.def.size;

    // Shadow
    renderer.ctx.globalAlpha = 0.3;
    renderer.drawCircle(x, y + size / 2 + 2, size * 0.5, '#000000');
    renderer.ctx.globalAlpha = 1;

    // Body
    if (enemy.stunTimer > 0) {
      renderer.ctx.globalAlpha = 0.6;
    }
    renderer.drawCircle(x, y, size / 2, enemy.def.color);

    // Eyes
    const eyeSize = Math.max(2, size / 6);
    renderer.drawCircle(x - size / 5, y - size / 6, eyeSize, '#ff2222');
    renderer.drawCircle(x + size / 5, y - size / 6, eyeSize, '#ff2222');

    renderer.ctx.globalAlpha = 1;

    // Health bar
    if (enemy.hp < enemy.maxHp) {
      const barW = size * 1.5;
      renderer.drawBar(
        x - barW / 2, y - size / 2 - 10, barW, 4,
        enemy.hp / enemy.maxHp, '#cc2222', '#441111'
      );
    }

    // Boss indicator
    if (enemy.def.behavior === 'boss') {
      renderer.drawText(enemy.def.name, x, y - size / 2 - 18, '#ff4444', 10, 'center');
    }
  }
}

export function renderProjectiles(renderer: Renderer, projectiles: Projectile[]): void {
  for (const proj of projectiles) {
    // Trail effect
    renderer.ctx.globalAlpha = 0.4;
    renderer.drawCircle(
      proj.position.x - proj.velocity.x * 0.02,
      proj.position.y - proj.velocity.y * 0.02,
      proj.radius * 1.5,
      proj.secondaryColor
    );
    renderer.ctx.globalAlpha = 1;

    // Main projectile
    renderer.drawCircle(proj.position.x, proj.position.y, proj.radius, proj.color);
    renderer.drawCircle(proj.position.x, proj.position.y, proj.radius * 0.5, proj.secondaryColor);
  }
}

export function renderEnemyProjectiles(renderer: Renderer, projectiles: EnemyProjectile[]): void {
  for (const proj of projectiles) {
    renderer.drawCircle(proj.position.x, proj.position.y, proj.radius, proj.color);
    renderer.ctx.globalAlpha = 0.5;
    renderer.drawCircle(proj.position.x, proj.position.y, proj.radius * 1.5, '#ff0000');
    renderer.ctx.globalAlpha = 1;
  }
}

export function renderAoeEffects(renderer: Renderer, effects: AoeEffect[]): void {
  for (const aoe of effects) {
    const progress = aoe.elapsed / aoe.duration;
    renderer.ctx.globalAlpha = 0.3 * (1 - progress);
    renderer.drawCircle(aoe.position.x, aoe.position.y, aoe.radius, aoe.color);
    renderer.ctx.globalAlpha = 0.5 * (1 - progress);
    renderer.drawCircle(aoe.position.x, aoe.position.y, aoe.radius * 0.6, aoe.color);
    renderer.ctx.globalAlpha = 1;
  }
}

export function renderInteractionPrompt(renderer: Renderer, text: string, x: number, y: number): void {
  renderer.drawText(`[F] ${text}`, x, y - 30, '#ffffff', 12, 'center');
}
