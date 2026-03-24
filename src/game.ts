import { GameLoop } from './engine/game-loop';
import { InputManager } from './engine/input';
import { Renderer } from './engine/renderer';
import { GameState, TILE_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT } from './engine/types';
import {
  Player, createPlayer, updatePlayer, damagePlayer, healPlayer, addShield,
  addXp, addMagicXp, addItemToInventory, removeItemFromInventory, getItemCount,
  getPlayerDamageBonus, hasMagic, unlockMagic, getActiveSpell, applyFoodEffect,
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
  updateVisibility, findRoomAt, lineOfSightClamp
} from './systems/dungeon';
import {
  MagicType, SpellDef, COMBO_SPELLS, findComboSpell, getSpellById,
  getActiveSpellForMagic, getHighestUnlockedTier, MAGIC_TYPE_NAMES, MAGIC_TYPE_COLORS, ALL_MAGIC_TYPES,
} from './data/spells';
import { findComboRecipe, getItemDef, getFoodEffect, QueueEntry } from './data/items';
import { getEnemiesForFloor, getBossForFloor, scaleEnemyForFloor } from './data/enemies';
import { MetaSave, loadMetaProgress, saveMetaProgress, updateMetaFromRun } from './systems/save';
import { generateLoot } from './systems/loot';
import { Shop, generateShop } from './systems/shop';
import { MenuState, createMenuState, updateMenu, renderMenu } from './ui/menus';
import { renderHUD, renderMinimap, zoomMinimap } from './ui/hud';
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
  private debugFog = false;

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
      floorTimer: 0,
    };

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
    this.player.baseDamage += up.damageBonus;
    this.player.speed += up.speedBonus;

    // Randomize starting spell — 1 random spell per run (spells don't carry over)
    const startingSpell = randomChoice(ALL_MAGIC_TYPES);
    unlockMagic(this.player, startingSpell);
    this.player.hotbar[0] = { kind: 'spell', ref: startingSpell };
    this.addNotification(`Starting spell: ${MAGIC_TYPE_NAMES[startingSpell]}`, MAGIC_TYPE_COLORS[startingSpell]);

    // Restore discovered combos (these persist across runs)
    if (this.meta.discoveredCombos) {
      this.player.discoveredCombos = [...this.meta.discoveredCombos];
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

    const spawnPos = getRoomCenterWorld(this.dungeon.spawnRoom);
    this.player.position = { ...spawnPos };

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

      if (room.type === 'miniboss') {
        // R2: Mini-bosses — scaled-up regular enemies
        const availableEnemies = getEnemiesForFloor(this.state.floor);
        const def = randomChoice(availableEnemies);
        const miniBoss = scaleEnemyForFloor(def, this.state.floor + 2); // tougher
        miniBoss.hp = Math.round(miniBoss.hp * 2.5);
        miniBoss.damage = Math.round(miniBoss.damage * 1.5);
        miniBoss.size = Math.round(miniBoss.size * 1.5);
        miniBoss.xpReward = Math.round(miniBoss.xpReward * 3);
        miniBoss.name = `Elite ${miniBoss.name}`;
        const pos = getRoomCenterWorld(room);
        this.enemies.push(createEnemy(miniBoss, pos));
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

    const shopRoom = this.dungeon.rooms.find((r) => r.type === 'shop');
    if (shopRoom) {
      this.currentShop = generateShop(this.state.floor);
    }

    // R2: Floor timer (5 min per floor, no timer on final boss floor)
    this.state.floorTimer = this.state.floor >= 5 ? 0 : 300;

    this.addNotification(`Floor ${this.state.floor}`, '#ffdd44');
  }

  private update(dt: number): void {
    const action = updateMenu(this.menu, this.input, this.player, this.meta);
    if (action === 'restart') { this.endRun(); return; }
    if (action === 'start_run') { this.startNewRun(); return; }

    if (this.menu.type !== 'none') { this.input.endFrame(); return; }
    if (this.state.scene !== 'dungeon') { this.input.endFrame(); return; }

    this.state.gameTime += dt;

    updatePlayer(this.player, this.input, this.dungeon, dt);

    const playerTile = worldToTile(this.player.position.x, this.player.position.y);
    updateVisibility(this.dungeon, playerTile.x, playerTile.y);

    // M key toggles fog of war debug mode
    if (this.input.isKeyJustPressed('KeyM')) {
      this.debugFog = !this.debugFog;
      if (this.debugFog) {
        // Reveal entire map
        for (let y = 0; y < this.dungeon.height; y++) {
          for (let x = 0; x < this.dungeon.width; x++) {
            this.dungeon.tiles[y][x].visible = true;
            this.dungeon.tiles[y][x].explored = true;
          }
        }
        this.addNotification('Debug: Fog of War OFF', '#ffff00');
      } else {
        this.addNotification('Debug: Fog of War ON', '#ffff00');
      }
    }

    // R19: +/- zoom minimap
    if (this.input.isKeyJustPressed('Equal') || this.input.isKeyJustPressed('NumpadAdd')) {
      zoomMinimap(0.25);
    }
    if (this.input.isKeyJustPressed('Minus') || this.input.isKeyJustPressed('NumpadSubtract')) {
      zoomMinimap(-0.25);
    }

    // Spell casting — click fires whatever is queued
    if (this.input.isMouseJustClicked()) {
      this.handleSpellCast();
    }

    // Interaction
    if (this.input.isKeyJustPressed('KeyF')) {
      this.handleInteraction();
    }

    // Update enemies
    for (const enemy of this.enemies) {
      if (!enemy.active) continue;
      const dist = vec2Dist(enemy.position, this.player.position);
      if (dist > 500) continue;

      const proj = updateEnemy(enemy, this.player.position, this.dungeon, dt, this.enemies);
      if (proj) this.enemyProjectiles.push(proj);

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

      let hit = false;
      for (const enemy of this.enemies) {
        if (!enemy.active || proj.hitEnemies.has(enemy.id)) continue;
        const dist = vec2Dist(proj.position, enemy.position);
        if (dist < proj.radius + enemy.def.size / 2) {
          const knockDir = vec2Normalize(vec2Sub(enemy.position, this.player.position));
          const killed = damageEnemy(enemy, proj.damage, knockDir);
          proj.hitEnemies.add(enemy.id);

          if (killed) this.handleEnemyKill(enemy);

          // Magic XP on hit
          const activeSlot = this.player.hotbar[this.player.activeHotbarIndex];
          const magic = activeSlot?.kind === 'spell' ? this.player.magics.find((m) => m.magicType === activeSlot.ref) : undefined;
          if (magic) {
            const result = addMagicXp(this.player, magic.magicType, 3);
            if (result.leveled && result.newTier) {
              const spellDef = getActiveSpellForMagic(magic.magicType as MagicType, magic.xp);
              const name = spellDef?.name || `Tier ${result.newTier}`;
              this.addNotification(`${MAGIC_TYPE_NAMES[magic.magicType as MagicType] || magic.magicType} upgraded: ${name}!`, MAGIC_TYPE_COLORS[magic.magicType as MagicType] || '#ffffff');
            }
          }

          // Lifesteal
          const spellDef = getSpellById(proj.spellId);
          if (spellDef?.lifesteal) {
            healPlayer(this.player, Math.round(proj.damage * spellDef.lifesteal));
          }

          if (!proj.piercing) {
            hit = true;
            if (proj.aoeRadius > 0) {
              const sd = getSpellById(proj.spellId);
              if (sd) {
                this.aoeEffects.push(createAoeEffect(sd, proj.position, getPlayerDamageBonus(this.player), 1));
              }
            }
            break;
          }
        }
      }

      const tile = worldToTile(proj.position.x, proj.position.y);
      if (tile.x < 0 || tile.y < 0 || tile.x >= this.dungeon.width || tile.y >= this.dungeon.height ||
          !this.dungeon.tiles[tile.y]?.[tile.x]?.walkable) {
        hit = true;
      }

      if (expired || hit) this.projectiles.splice(i, 1);
    }

    // Update enemy projectiles
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const proj = this.enemyProjectiles[i];
      proj.position.x += proj.velocity.x * dt;
      proj.position.y += proj.velocity.y * dt;
      proj.lifetime -= dt;

      const dist = vec2Dist(proj.position, this.player.position);
      if (dist < proj.radius + this.player.width / 2) {
        damagePlayer(this.player, proj.damage);
        this.enemyProjectiles.splice(i, 1);
        continue;
      }

      const tile = worldToTile(proj.position.x, proj.position.y);
      if (proj.lifetime <= 0 || !this.dungeon.tiles[tile.y]?.[tile.x]?.walkable) {
        this.enemyProjectiles.splice(i, 1);
      }
    }

    // Update AoE effects
    for (let i = this.aoeEffects.length - 1; i >= 0; i--) {
      const aoe = this.aoeEffects[i];
      const expired = updateAoeEffect(aoe, dt);

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

    // R2: Floor timer countdown
    if (this.state.floorTimer > 0) {
      this.state.floorTimer -= dt;
      if (this.state.floorTimer <= 0) {
        this.state.floorTimer = 0;
        this.addNotification('TIME UP! Find the boss!', '#ff4444');
      } else if (this.state.floorTimer <= 30 && Math.floor(this.state.floorTimer) % 10 === 0 && this.state.floorTimer % 1 < dt) {
        this.addNotification(`${Math.ceil(this.state.floorTimer)}s remaining!`, '#ff8844');
      }
    }

    this.renderer.followTarget(this.player.position, 0.08);

    // Update notifications
    for (let i = this.notifications.length - 1; i >= 0; i--) {
      this.notifications[i].timer -= dt;
      if (this.notifications[i].timer <= 0) this.notifications.splice(i, 1);
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
    const queue = this.player.comboQueue;

    if (queue.length >= 2) {
      // Check spell+spell combo
      const allSpells = queue.every((e) => e.kind === 'spell');
      if (allSpells && queue.length === 2) {
        const primaryRef = queue[0].ref as MagicType;
        const secondaryRef = queue[1].ref as MagicType;

        // R8: Only primary element goes on cooldown — check primary CD
        const primaryMagic = this.player.magics.find((m) => m.magicType === primaryRef);
        const primarySpell = primaryMagic ? getActiveSpellForMagic(primaryRef, primaryMagic.xp) : null;
        if (primarySpell && this.player.spellCooldowns.has(primarySpell.id)) {
          this.addNotification('Primary spell on cooldown!', '#ff8844');
          this.player.comboQueue = [];
          return;
        }

        // Look for defined combo
        const comboDef = findComboSpell(primaryRef, secondaryRef);
        if (comboDef) {
          // R5: Secondary is multiplicative but lengthens CD if higher tier
          const secondaryMagic = this.player.magics.find((m) => m.magicType === secondaryRef);
          const secondaryTier = secondaryMagic ? getHighestUnlockedTier(secondaryMagic.xp) : 1;
          const cdMultiplier = 1 + (secondaryTier - 1) * 0.2; // T1=1x, T2=1.2x, T3=1.4x, T4=1.6x, T5=1.8x

          this.fireSpell(comboDef);

          // R8: Only put primary on cooldown (with modifier from secondary tier)
          if (primarySpell) {
            this.player.spellCooldowns.set(primarySpell.id, primarySpell.cooldown * cdMultiplier);
          }

          // Discover combo
          if (!this.player.discoveredCombos.includes(comboDef.id)) {
            this.player.discoveredCombos.push(comboDef.id);
            if (!this.meta.discoveredCombos) this.meta.discoveredCombos = [];
            if (!this.meta.discoveredCombos.includes(comboDef.id)) {
              this.meta.discoveredCombos.push(comboDef.id);
            }
            this.addNotification(`COMBO: ${comboDef.name}!`, '#ffff00');
            this.addNotification(`${comboDef.description}`, comboDef.color);
          }

          addMagicXp(this.player, primaryRef, 5);
          addMagicXp(this.player, secondaryRef, 3);
        } else {
          // R10: No fizzle — cast primary spell with a damage boost from secondary
          if (primarySpell) {
            this.fireSpell(primarySpell);
            if (primarySpell) {
              this.player.spellCooldowns.set(primarySpell.id, primarySpell.cooldown);
            }
            addMagicXp(this.player, primaryRef, 2);
            addMagicXp(this.player, secondaryRef, 1);
          }
        }

        this.player.comboQueue = [];
        return;
      }

      // Check mixed combo recipes (spell+item)
      const comboRecipe = findComboRecipe(queue);
      if (comboRecipe) {
        this.handleComboRecipe(comboRecipe);
        this.player.comboQueue = [];
        return;
      }

      // No recipe match — cast primary if it's a spell
      if (queue[0].kind === 'spell') {
        const magic = this.player.magics.find((m) => m.magicType === queue[0].ref);
        if (magic) {
          const spellDef = getActiveSpellForMagic(queue[0].ref as MagicType, magic.xp);
          if (spellDef && !this.player.spellCooldowns.has(spellDef.id)) {
            this.fireSpell(spellDef);
            addMagicXp(this.player, queue[0].ref, 1);
          }
        }
      }
      this.player.comboQueue = [];

    } else if (queue.length === 1) {
      const entry = queue[0];
      if (entry.kind === 'spell') {
        // Cast base spell
        const magic = this.player.magics.find((m) => m.magicType === entry.ref);
        if (magic) {
          const spellDef = getActiveSpellForMagic(entry.ref as MagicType, magic.xp);
          if (spellDef && !this.player.spellCooldowns.has(spellDef.id)) {
            this.fireSpell(spellDef);
            addMagicXp(this.player, entry.ref, 1);
          }
        }
      } else if (entry.kind === 'item') {
        // Consume item directly
        this.consumeItem(entry.ref);
      }
      this.player.comboQueue = [];

    } else {
      // No queue — cast from active hotbar slot
      const slot = this.player.hotbar[this.player.activeHotbarIndex];
      if (!slot || slot.kind === 'empty' || !slot.ref) return;

      if (slot.kind === 'spell') {
        const magic = this.player.magics.find((m) => m.magicType === slot.ref);
        if (!magic) return;
        const spellDef = getActiveSpellForMagic(magic.magicType as MagicType, magic.xp);
        if (!spellDef || this.player.spellCooldowns.has(spellDef.id)) return;
        this.fireSpell(spellDef);
        addMagicXp(this.player, magic.magicType, 1);
      } else if (slot.kind === 'item') {
        this.consumeItem(slot.ref);
      }
    }
  }

  private handleComboRecipe(recipe: import('./data/items').ComboRecipeDef): void {
    // Consume items from inventory (spells are not consumed)
    const itemEntries = recipe.elements.filter((e) => e.kind === 'item');
    // Check player has all items
    const itemCounts = new Map<string, number>();
    for (const e of itemEntries) {
      itemCounts.set(e.ref, (itemCounts.get(e.ref) || 0) + 1);
    }
    for (const [itemId, needed] of itemCounts) {
      if (getItemCount(this.player, itemId) < needed) {
        this.addNotification(`Missing ${getItemDef(itemId)?.name || itemId}!`, '#ff4444');
        return;
      }
    }

    // Consume
    for (const [itemId, needed] of itemCounts) {
      removeItemFromInventory(this.player, itemId, needed);
    }

    // Produce result
    addItemToInventory(this.player, recipe.result, recipe.resultCount);

    // Discover recipe
    if (!this.player.discoveredComboRecipes.includes(recipe.id)) {
      this.player.discoveredComboRecipes.push(recipe.id);
      this.addNotification(`RECIPE DISCOVERED: ${recipe.name}!`, '#ffff00');
    } else {
      this.addNotification(`Crafted: ${recipe.name}!`, '#44ff44');
    }

    // XP to any spell magic types used
    for (const e of recipe.elements) {
      if (e.kind === 'spell') {
        addMagicXp(this.player, e.ref, 3);
      }
    }
  }

  private consumeItem(itemId: string): void {
    if (getItemCount(this.player, itemId) <= 0) {
      this.addNotification('No items left!', '#ff4444');
      return;
    }
    const effect = getFoodEffect(itemId);
    if (effect) {
      removeItemFromInventory(this.player, itemId, 1);
      applyFoodEffect(this.player, itemId, effect);
      this.addNotification(`Consumed ${getItemDef(itemId)?.name || itemId}`, '#44ff44');
    } else {
      this.addNotification('Cannot use that item directly', '#888888');
    }
  }

  private fireSpell(spellDef: SpellDef): void {
    const mouseWorld = this.renderer.screenToWorld(this.input.getMousePos());
    const dir = vec2Normalize(vec2Sub(mouseWorld, this.player.position));
    if (vec2Len(dir) === 0) return;

    this.player.spellCooldowns.set(spellDef.id, spellDef.cooldown);

    // Self-effects
    if (spellDef.shieldAmount) addShield(this.player, spellDef.shieldAmount, spellDef.shieldDuration || 5);
    if (spellDef.healAmount) healPlayer(this.player, spellDef.healAmount);

    // Line-of-sight: clamp target position to last walkable tile
    const targetWorld = lineOfSightClamp(this.dungeon, this.player.position, mouseWorld);
    const clampedDir = vec2Normalize(vec2Sub(targetWorld, this.player.position));
    const finalDir = vec2Len(clampedDir) > 0 ? clampedDir : dir;

    // Cast
    if (spellDef.projectileSpeed > 0) {
      this.projectiles.push(
        createProjectile(spellDef, this.player.position, finalDir, this.player.baseDamage + getPlayerDamageBonus(this.player), 1)
      );
    } else if (spellDef.aoeRadius > 0) {
      // AoE targets the clamped position (can't place through walls)
      const pos = spellDef.range > 0 ? targetWorld : this.player.position;
      this.aoeEffects.push(
        createAoeEffect(spellDef, pos, this.player.baseDamage + getPlayerDamageBonus(this.player), 1)
      );
    }
  }

  private handleInteraction(): void {
    const playerTile = worldToTile(this.player.position.x, this.player.position.y);
    const tile = this.dungeon.tiles[playerTile.y]?.[playerTile.x];
    if (!tile) return;

    if (tile.type === 'stairs') {
      const bossAlive = this.enemies.some((e) => e.active && e.def.behavior === 'boss');
      if (bossAlive) { this.addNotification('Defeat the boss first!', '#ff4444'); return; }
      if (this.state.floor >= 5) {
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
      this.addNotification('Use hotbar combos to cook! (e.g. Fire + Meat)', '#ff8844');
      return;
    }
  }

  private handleEnemyKill(enemy: Enemy): void {
    const loot = generateLoot(enemy.def, this.state.floor, this.player.magics.map((m) => m.magicType as MagicType));

    this.player.gold += loot.gold;
    if (loot.gold > 0) this.addNotification(`+${loot.gold} gold`, '#ffdd44');

    for (const { item, count } of loot.items) {
      addItemToInventory(this.player, item.id, count);
      this.addNotification(`+${count} ${item.name}`, item.color);
    }

    // R6: Guarantee 2nd spell quickly — if player has only 1 spell, force a drop
    if (!loot.magicUnlock && this.player.magics.length <= 1) {
      const available = ALL_MAGIC_TYPES.filter((mt) => !hasMagic(this.player, mt));
      if (available.length > 0) {
        loot.magicUnlock = randomChoice(available);
      }
    }

    if (loot.magicUnlock) {
      unlockMagic(this.player, loot.magicUnlock);
      if (!this.meta.unlockedMagics.includes(loot.magicUnlock)) {
        this.meta.unlockedMagics.push(loot.magicUnlock);
      }
      const name = MAGIC_TYPE_NAMES[loot.magicUnlock];
      this.addNotification(`New magic unlocked: ${name}!`, MAGIC_TYPE_COLORS[loot.magicUnlock]);
      // Auto-assign to first empty hotbar slot
      const emptySlot = this.player.hotbar.findIndex((s) => s.kind === 'empty');
      if (emptySlot >= 0) {
        this.player.hotbar[emptySlot] = { kind: 'spell', ref: loot.magicUnlock };
        this.addNotification(`Assigned to hotbar slot ${emptySlot + 1}`, '#aaaaaa');
      }
    }

    const leveled = addXp(this.player, enemy.def.xpReward);
    if (leveled) this.addNotification(`Level up! Lv.${this.player.level}`, '#ffff44');

    const enemyTile = worldToTile(enemy.position.x, enemy.position.y);
    const room = findRoomAt(this.dungeon, enemyTile.x, enemyTile.y);
    if (room) {
      const roomEnemies = this.enemies.filter((e) => {
        const et = worldToTile(e.position.x, e.position.y);
        return findRoomAt(this.dungeon, et.x, et.y) === room;
      });
      if (roomEnemies.every((e) => !e.active)) room.cleared = true;
    }
  }

  private endRun(): void {
    updateMetaFromRun(this.meta, this.player, this.state.floor);
    const up = this.meta.permanentUpgrades;
    up.maxHpBonus += 2;
    up.damageBonus += 1;
    // Save hotbar config for next run
    this.meta.hotbarConfig = [...this.player.hotbar];
    saveMetaProgress(this.meta);
    this.state.scene = 'title';
    this.menu.type = 'hub';
    this.menu.selectedIndex = 0;
  }

  private addNotification(text: string, color: string): void {
    this.notifications.push({ text, timer: 2.5, color });
    if (this.notifications.length > 5) this.notifications.shift();
  }

  private render(): void {
    this.renderer.clear();

    if (this.state.scene === 'dungeon' || this.menu.type === 'death' || this.menu.type === 'victory') {
      this.renderer.beginCamera();
      renderDungeon(this.renderer, this.dungeon);
      renderAoeEffects(this.renderer, this.aoeEffects);
      renderEnemies(this.renderer, this.enemies, this.dungeon, this.debugFog);
      renderPlayer(this.renderer, this.player);
      renderProjectiles(this.renderer, this.projectiles);
      renderEnemyProjectiles(this.renderer, this.enemyProjectiles);
      this.renderInteractionPrompts();
      this.renderer.endCamera();

      renderHUD(this.renderer, this.player, this.state);
      const pt = worldToTile(this.player.position.x, this.player.position.y);
      renderMinimap(this.renderer, this.dungeon, pt.x, pt.y);
      this.renderNotifications();
    }

    renderMenu(this.renderer, this.menu, this.player, this.meta);
  }

  private renderInteractionPrompts(): void {
    const playerTile = worldToTile(this.player.position.x, this.player.position.y);
    const tile = this.dungeon.tiles[playerTile.y]?.[playerTile.x];
    if (!tile) return;

    if (tile.type === 'stairs') {
      const bossAlive = this.enemies.some((e) => e.active && e.def.behavior === 'boss');
      renderInteractionPrompt(this.renderer, bossAlive ? 'Defeat the boss!' : 'Descend', this.player.position.x, this.player.position.y);
    }
    if (tile.type === 'shop') renderInteractionPrompt(this.renderer, 'Shop', this.player.position.x, this.player.position.y);
    if (tile.type === 'cooking_station') renderInteractionPrompt(this.renderer, 'Cook', this.player.position.x, this.player.position.y);
  }

  private renderNotifications(): void {
    for (let i = 0; i < this.notifications.length; i++) {
      const n = this.notifications[i];
      this.renderer.ctx.globalAlpha = Math.min(1, n.timer);
      this.renderer.drawText(n.text, CANVAS_WIDTH / 2, 100 + i * 22, n.color, 14, 'center');
    }
    this.renderer.ctx.globalAlpha = 1;
  }
}
