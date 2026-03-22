import { GameLoop } from './engine/game-loop';
import { InputManager } from './engine/input';
import { Renderer } from './engine/renderer';
import { GameState, TILE_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT } from './engine/types';
import {
  Player, createPlayer, updatePlayer, damagePlayer, addXp, addSpellXp,
  addItemToInventory, unlockSpell, getPlayerDamageBonus, hasSpell
} from './entities/player';
import {
  Enemy, EnemyProjectile, createEnemy, updateEnemy, damageEnemy
} from './entities/enemy';
import {
  Projectile, AoeEffect, createProjectile, updateProjectile,
  createAoeEffect, updateAoeEffect
} from './entities/projectile';
import {
  DungeonMap, generateDungeon, getRoomCenterWorld, worldToTile,
  updateVisibility, findRoomAt
} from './systems/dungeon';
import { BASE_SPELLS, findComboSpell, SpellDef } from './data/spells';
import { getEnemiesForFloor, getBossForFloor, scaleEnemyForFloor, EnemyDef } from './data/enemies';
import { MetaSave, loadMetaProgress, saveMetaProgress, updateMetaFromRun, getDefaultMeta } from './systems/save';
import { generateLoot } from './systems/loot';
import { Shop, generateShop } from './systems/shop';
import { MenuState, MenuType, createMenuState, updateMenu, renderMenu } from './ui/menus';
import { renderHUD, renderMinimap } from './ui/hud';
import {
  renderDungeon, renderPlayer, renderEnemies, renderProjectiles,
  renderEnemyProjectiles, renderAoeEffects, renderInteractionPrompt
} from './ui/dungeon-renderer';
import { vec2Sub, vec2Normalize, vec2Dist, vec2Len, randomChoice, randomInt } from './utils/math';

export class Game {
  private loop: GameLoop;
  private input: InputManager;
  private renderer: Renderer;
  private state: GameState;
  private player: Player;
  private dungeon!: DungeonMap;
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private enemyProjectiles: EnemyProjectile[] = [];
  private aoeEffects: AoeEffect[] = [];
  private meta: MetaSave;
  private menu: MenuState;
  private currentShop: Shop | null = null;
  private notifications: { text: string; timer: number; color: string }[] = [];
  private autoSaveTimer = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new Renderer(canvas);
    this.input = new InputManager(canvas);
    this.meta = loadMetaProgress();
    this.player = createPlayer();
    this.menu = createMenuState();

    this.state = {
      scene: 'title',
      paused: false,
      floor: 1,
      runNumber: this.meta.totalRuns,
      gameTime: 0,
    };

    // Show hub/title
    this.menu.type = 'hub';

    this.loop = new GameLoop(
      (dt) => this.update(dt),
      (_interp) => this.render()
    );
  }

  start(): void {
    this.loop.start();
  }

  private startNewRun(): void {
    this.player = createPlayer();
    this.state.floor = 1;
    this.state.scene = 'dungeon';
    this.state.gameTime = 0;

    // Apply meta progression
    const up = this.meta.permanentUpgrades;
    this.player.maxHp += up.maxHpBonus;
    this.player.hp = this.player.maxHp;
    this.player.maxMana += up.maxManaBonus;
    this.player.mana = this.player.maxMana;
    this.player.baseDamage += up.damageBonus;
    this.player.speed += up.speedBonus;
    this.player.manaRegen += up.manaRegenBonus;

    // Unlock previously discovered spells
    for (const element of this.meta.unlockedSpells) {
      if (!hasSpell(this.player, element)) {
        unlockSpell(this.player, element);
      }
    }

    this.generateFloor();
    this.menu.type = 'none';
  }

  private generateFloor(): void {
    this.dungeon = generateDungeon(this.state.floor);
    this.enemies = [];
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.aoeEffects = [];
    this.currentShop = null;

    // Place player at spawn
    const spawnPos = getRoomCenterWorld(this.dungeon.spawnRoom);
    this.player.position = { ...spawnPos };

    // Spawn enemies in rooms
    for (const room of this.dungeon.rooms) {
      if (room.type === 'spawn' || room.type === 'shop' || room.type === 'cooking') continue;

      if (room.type === 'boss') {
        const bossDef = getBossForFloor(this.state.floor);
        if (bossDef) {
          const scaled = scaleEnemyForFloor(bossDef, this.state.floor);
          const pos = getRoomCenterWorld(room);
          this.enemies.push(createEnemy(scaled, pos));
        }
        continue;
      }

      const availableEnemies = getEnemiesForFloor(this.state.floor);
      for (let i = 0; i < room.enemyCount; i++) {
        const def = randomChoice(availableEnemies);
        const scaled = scaleEnemyForFloor(def, this.state.floor);
        const pos = {
          x: (room.x + randomInt(1, room.width - 2)) * TILE_SIZE + TILE_SIZE / 2,
          y: (room.y + randomInt(1, room.height - 2)) * TILE_SIZE + TILE_SIZE / 2,
        };
        this.enemies.push(createEnemy(scaled, pos));
      }
    }

    // Generate shop for shop room
    const shopRoom = this.dungeon.rooms.find((r) => r.type === 'shop');
    if (shopRoom) {
      this.currentShop = generateShop(this.state.floor);
    }

    this.addNotification(`Floor ${this.state.floor}`, '#ffdd44');
  }

  private update(dt: number): void {
    // Handle menu interactions
    if (this.menu.type !== 'none') {
      const action = updateMenu(this.menu, this.input, this.player, this.meta);
      if (action === 'restart') {
        this.endRun();
        return;
      }
      if (action === 'start_run') {
        this.startNewRun();
        return;
      }
      this.input.endFrame();
      return;
    }

    if (this.state.scene !== 'dungeon') {
      this.input.endFrame();
      return;
    }

    this.state.gameTime += dt;

    // Update player
    updatePlayer(this.player, this.input, this.dungeon, dt);

    // Update visibility
    const playerTile = worldToTile(this.player.position.x, this.player.position.y);
    updateVisibility(this.dungeon, playerTile.x, playerTile.y);

    // Handle spell casting
    if (this.input.isMouseJustClicked()) {
      this.handleSpellCast();
    }

    // Handle combo slot (Shift+number)
    if (this.input.isKeyDown('ShiftLeft') || this.input.isKeyDown('ShiftRight')) {
      for (let i = 0; i < 6; i++) {
        if (this.input.isKeyJustPressed(`Digit${i + 1}`) && i < this.player.spells.length) {
          const element = this.player.spells[i].element;
          if (this.player.comboSlot && this.player.comboSlot !== element) {
            // Try combo cast
            this.handleComboCast(this.player.comboSlot, element);
            this.player.comboSlot = null;
          } else {
            this.player.comboSlot = element;
          }
        }
      }
    }

    // Handle interaction (F key)
    if (this.input.isKeyJustPressed('KeyF')) {
      this.handleInteraction();
    }

    // Update enemies
    for (const enemy of this.enemies) {
      if (!enemy.active) continue;
      // Only update enemies that are in visible/nearby rooms
      const dist = vec2Dist(enemy.position, this.player.position);
      if (dist > 500) continue;

      const proj = updateEnemy(enemy, this.player.position, this.dungeon, dt, this.enemies);
      if (proj) this.enemyProjectiles.push(proj);

      // Melee damage to player
      if (enemy.def.behavior === 'melee' || enemy.def.behavior === 'charger' || enemy.def.behavior === 'boss') {
        if (dist < enemy.def.attackRange + this.player.width / 2 && enemy.attackTimer <= 0) {
          damagePlayer(this.player, enemy.def.damage);
          enemy.attackTimer = enemy.def.attackCooldown;
        }
      }
      enemy.attackTimer -= dt;
    }

    // Update player projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      const expired = updateProjectile(proj, dt);

      // Check collision with enemies
      let hit = false;
      for (const enemy of this.enemies) {
        if (!enemy.active || proj.hitEnemies.has(enemy.id)) continue;
        const dist = vec2Dist(proj.position, enemy.position);
        if (dist < proj.radius + enemy.def.size / 2) {
          const knockDir = vec2Normalize(vec2Sub(enemy.position, this.player.position));
          const killed = damageEnemy(enemy, proj.damage, knockDir);
          proj.hitEnemies.add(enemy.id);

          if (killed) {
            this.handleEnemyKill(enemy);
          }

          // Spell XP
          const spell = this.player.spells[this.player.activeSpellIndex];
          if (spell) addSpellXp(this.player, spell.element, 3);

          if (!proj.piercing) {
            hit = true;
            // Spawn AoE if applicable
            if (proj.aoeRadius > 0) {
              const spellDef = this.getSpellDef(proj.spellId);
              if (spellDef) {
                this.aoeEffects.push(
                  createAoeEffect(spellDef, proj.position, getPlayerDamageBonus(this.player), 1)
                );
              }
            }
            break;
          }
        }
      }

      // Check wall collision
      const tile = worldToTile(proj.position.x, proj.position.y);
      if (tile.x < 0 || tile.y < 0 || tile.x >= this.dungeon.width || tile.y >= this.dungeon.height ||
          !this.dungeon.tiles[tile.y]?.[tile.x]?.walkable) {
        hit = true;
      }

      if (expired || hit) {
        this.projectiles.splice(i, 1);
      }
    }

    // Update enemy projectiles
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const proj = this.enemyProjectiles[i];
      proj.position.x += proj.velocity.x * dt;
      proj.position.y += proj.velocity.y * dt;
      proj.lifetime -= dt;

      // Hit player
      const dist = vec2Dist(proj.position, this.player.position);
      if (dist < proj.radius + this.player.width / 2) {
        damagePlayer(this.player, proj.damage);
        this.enemyProjectiles.splice(i, 1);
        continue;
      }

      // Wall collision or expired
      const tile = worldToTile(proj.position.x, proj.position.y);
      if (proj.lifetime <= 0 || !this.dungeon.tiles[tile.y]?.[tile.x]?.walkable) {
        this.enemyProjectiles.splice(i, 1);
      }
    }

    // Update AoE effects
    for (let i = this.aoeEffects.length - 1; i >= 0; i--) {
      const aoe = this.aoeEffects[i];
      const expired = updateAoeEffect(aoe, dt);

      // Damage enemies in radius
      for (const enemy of this.enemies) {
        if (!enemy.active || aoe.hitEnemies.has(enemy.id)) continue;
        const dist = vec2Dist(aoe.position, enemy.position);
        if (dist < aoe.radius) {
          const killed = damageEnemy(enemy, aoe.damage);
          aoe.hitEnemies.add(enemy.id);
          if (killed) this.handleEnemyKill(enemy);
        }
      }

      if (expired) this.aoeEffects.splice(i, 1);
    }

    // Check player death
    if (this.player.hp <= 0) {
      this.menu.type = 'death';
      updateMetaFromRun(this.meta, this.player, this.state.floor);
      saveMetaProgress(this.meta);
    }

    // Camera follow
    this.renderer.followTarget(this.player.position, 0.08);

    // Update notifications
    for (let i = this.notifications.length - 1; i >= 0; i--) {
      this.notifications[i].timer -= dt;
      if (this.notifications[i].timer <= 0) {
        this.notifications.splice(i, 1);
      }
    }

    // Auto-save
    this.autoSaveTimer += dt;
    if (this.autoSaveTimer > 30) {
      this.autoSaveTimer = 0;
      saveMetaProgress(this.meta);
    }

    this.input.endFrame();
  }

  private handleSpellCast(): void {
    if (this.player.spells.length === 0) return;
    const spell = this.player.spells[this.player.activeSpellIndex];
    if (!spell) return;

    const baseDef = BASE_SPELLS.find((s) => s.id === spell.element);
    if (!baseDef) return;

    if (this.player.spellCooldowns.has(spell.element)) return;
    if (this.player.mana < baseDef.manaCost) return;

    // Get direction to mouse
    const mouseWorld = this.renderer.screenToWorld(this.input.getMousePos());
    const dir = vec2Normalize(vec2Sub(mouseWorld, this.player.position));
    if (vec2Len(dir) === 0) return;

    this.player.mana -= baseDef.manaCost;
    this.player.spellCooldowns.set(spell.element, baseDef.cooldown);

    if (baseDef.projectileSpeed > 0) {
      this.projectiles.push(
        createProjectile(baseDef, this.player.position, dir, this.player.baseDamage + getPlayerDamageBonus(this.player), spell.level)
      );
    } else if (baseDef.aoeRadius > 0) {
      // AoE centered on player or at target location
      this.aoeEffects.push(
        createAoeEffect(baseDef, this.player.position, this.player.baseDamage + getPlayerDamageBonus(this.player), spell.level)
      );
    }
  }

  private handleComboCast(el1: string, el2: string): void {
    const comboDef = findComboSpell(el1 as any, el2 as any);
    if (!comboDef) {
      this.addNotification('No combo exists for those elements', '#ff4444');
      return;
    }

    const comboKey = `combo_${comboDef.id}`;
    if (this.player.spellCooldowns.has(comboKey)) return;
    if (this.player.mana < comboDef.manaCost) {
      this.addNotification('Not enough mana!', '#4444ff');
      return;
    }

    const mouseWorld = this.renderer.screenToWorld(this.input.getMousePos());
    const dir = vec2Normalize(vec2Sub(mouseWorld, this.player.position));

    this.player.mana -= comboDef.manaCost;
    this.player.spellCooldowns.set(comboKey, comboDef.cooldown);

    if (comboDef.projectileSpeed > 0) {
      this.projectiles.push(
        createProjectile(comboDef, this.player.position, dir, this.player.baseDamage + getPlayerDamageBonus(this.player), 1)
      );
    }
    if (comboDef.aoeRadius > 0 && comboDef.projectileSpeed === 0) {
      this.aoeEffects.push(
        createAoeEffect(comboDef, comboDef.range > 0 ? mouseWorld : this.player.position, this.player.baseDamage + getPlayerDamageBonus(this.player), 1)
      );
    }

    this.addNotification(`${comboDef.name}!`, comboDef.color);

    // Give XP to both element spells
    addSpellXp(this.player, el1 as any, 5);
    addSpellXp(this.player, el2 as any, 5);
  }

  private handleInteraction(): void {
    const playerTile = worldToTile(this.player.position.x, this.player.position.y);
    const tile = this.dungeon.tiles[playerTile.y]?.[playerTile.x];
    if (!tile) return;

    if (tile.type === 'stairs') {
      // Check if boss is defeated
      const bossAlive = this.enemies.some((e) => e.active && e.def.behavior === 'boss');
      if (bossAlive) {
        this.addNotification('Defeat the boss first!', '#ff4444');
        return;
      }

      // Check for final boss victory
      if (this.state.floor >= 8) {
        this.menu.type = 'victory';
        updateMetaFromRun(this.meta, this.player, this.state.floor);
        saveMetaProgress(this.meta);
        return;
      }

      this.state.floor++;
      this.generateFloor();
      return;
    }

    if (tile.type === 'shop' && this.currentShop) {
      this.menu.type = 'shop';
      this.menu.shop = this.currentShop;
      this.menu.selectedIndex = 0;
      return;
    }

    if (tile.type === 'cooking_station') {
      this.menu.type = 'cooking';
      this.menu.selectedIndex = 0;
      return;
    }
  }

  private handleEnemyKill(enemy: Enemy): void {
    const loot = generateLoot(enemy.def, this.state.floor, this.meta.unlockedSpells);

    this.player.gold += loot.gold;
    if (loot.gold > 0) {
      this.addNotification(`+${loot.gold} gold`, '#ffdd44');
    }

    for (const { item, count } of loot.items) {
      addItemToInventory(this.player, item.id, count);
      this.addNotification(`+${count} ${item.name}`, item.color);
    }

    if (loot.spellUnlock) {
      unlockSpell(this.player, loot.spellUnlock);
      if (!this.meta.unlockedSpells.includes(loot.spellUnlock)) {
        this.meta.unlockedSpells.push(loot.spellUnlock);
      }
      this.addNotification(`New spell: ${loot.spellUnlock}!`, '#cc88ff');
    }

    const leveled = addXp(this.player, enemy.def.xpReward);
    if (leveled) {
      this.addNotification(`Level up! Lv.${this.player.level}`, '#ffff44');
    }

    // Mark room as cleared
    const enemyTile = worldToTile(enemy.position.x, enemy.position.y);
    const room = findRoomAt(this.dungeon, enemyTile.x, enemyTile.y);
    if (room) {
      const roomEnemies = this.enemies.filter((e) => {
        const et = worldToTile(e.position.x, e.position.y);
        return findRoomAt(this.dungeon, et.x, et.y) === room;
      });
      if (roomEnemies.every((e) => !e.active)) {
        room.cleared = true;
      }
    }
  }

  private endRun(): void {
    updateMetaFromRun(this.meta, this.player, this.state.floor);

    // Small permanent upgrade per run
    const up = this.meta.permanentUpgrades;
    up.maxHpBonus += 2;
    up.maxManaBonus += 1;
    up.damageBonus += 1;

    saveMetaProgress(this.meta);

    this.state.scene = 'title';
    this.menu.type = 'hub';
    this.menu.selectedIndex = 0;
  }

  private getSpellDef(spellId: string): SpellDef | undefined {
    return BASE_SPELLS.find((s) => s.id === spellId) ||
      (findComboSpell as any)(spellId); // fallback
  }

  private addNotification(text: string, color: string): void {
    this.notifications.push({ text, timer: 2.5, color });
    if (this.notifications.length > 5) this.notifications.shift();
  }

  private render(): void {
    this.renderer.clear();

    if (this.state.scene === 'dungeon' || this.menu.type === 'death' || this.menu.type === 'victory') {
      this.renderer.beginCamera();

      // Render dungeon
      renderDungeon(this.renderer, this.dungeon);

      // Render AoE effects (below entities)
      renderAoeEffects(this.renderer, this.aoeEffects);

      // Render enemies
      renderEnemies(this.renderer, this.enemies);

      // Render player
      renderPlayer(this.renderer, this.player);

      // Render projectiles
      renderProjectiles(this.renderer, this.projectiles);
      renderEnemyProjectiles(this.renderer, this.enemyProjectiles);

      // Render interaction prompts
      this.renderInteractionPrompts();

      this.renderer.endCamera();

      // HUD (screen space)
      renderHUD(this.renderer, this.player, this.state);

      // Minimap
      const pt = worldToTile(this.player.position.x, this.player.position.y);
      renderMinimap(this.renderer, this.dungeon, pt.x, pt.y);

      // Notifications
      this.renderNotifications();
    }

    // Menus (always on top)
    renderMenu(this.renderer, this.menu, this.player, this.meta);
  }

  private renderInteractionPrompts(): void {
    const playerTile = worldToTile(this.player.position.x, this.player.position.y);
    const tile = this.dungeon.tiles[playerTile.y]?.[playerTile.x];
    if (!tile) return;

    if (tile.type === 'stairs') {
      const bossAlive = this.enemies.some((e) => e.active && e.def.behavior === 'boss');
      if (bossAlive) {
        renderInteractionPrompt(this.renderer, 'Defeat the boss!', this.player.position.x, this.player.position.y);
      } else {
        renderInteractionPrompt(this.renderer, 'Descend', this.player.position.x, this.player.position.y);
      }
    }
    if (tile.type === 'shop') {
      renderInteractionPrompt(this.renderer, 'Shop', this.player.position.x, this.player.position.y);
    }
    if (tile.type === 'cooking_station') {
      renderInteractionPrompt(this.renderer, 'Cook', this.player.position.x, this.player.position.y);
    }
  }

  private renderNotifications(): void {
    for (let i = 0; i < this.notifications.length; i++) {
      const n = this.notifications[i];
      const alpha = Math.min(1, n.timer);
      this.renderer.ctx.globalAlpha = alpha;
      this.renderer.drawText(
        n.text,
        CANVAS_WIDTH / 2, 100 + i * 22,
        n.color, 14, 'center'
      );
    }
    this.renderer.ctx.globalAlpha = 1;
  }
}
