# Arcania Testing Guide

## Running Tests

### Unit Tests
```bash
npx vitest run        # Run all tests once
npx vitest            # Watch mode
```

### E2E Tests (Playwright)
```bash
npx playwright test   # Run all E2E tests
```

### Type Check
```bash
npx tsc --noEmit      # Verify TypeScript compiles clean
```

## Manual Test Flows

### Lobby
1. Game loads into lobby with player at center
2. Cooking station shows `[F] Cook` prompt — press F to open cooking menu
3. Portal (yellow square) shows `[F] Descend` — press F to start run
4. ESC opens pause menu

### Cooking System
1. Gather ingredients by killing enemies in dungeon
2. Walk to cooking station tile and press F
3. Cooking menu shows available recipes based on inventory
4. Select recipe with arrows, press Enter or click to cook
5. Verify ingredients are consumed and food is added to inventory

### Boss Encounters
1. Enter a boss/miniboss room (2+ tiles inside triggers seal)
2. Room displays "SEALED" with red pulsing border
3. Boss wakes up and attacks — should NOT leave the room bounds
4. Non-boss creatures in the room should NOT trigger the boss reward screen
5. Only the designated boss/miniboss grants the reward screen on kill

### Boss Reward Screen
1. After killing a boss, reward screen appears with 2 choices
2. Keyboard: W/S to navigate, Enter to select
3. Mouse: Hover highlights options, click to select
4. Spell reward should guarantee a tier upgrade (T1->T2, T2->T3, etc.)
5. Secondary reward grants HP/Damage/Gold as described

### Spell System
1. Spells do NOT gain XP from casting or hitting enemies
2. Spell tiers only upgrade via boss kill rewards
3. Shift+Number on hotbar cycles tier selection for that spell

### Fog of War Debug
1. Press M to toggle FoW off — entire map becomes visible
2. Press M again to toggle FoW back on
3. Previously explored areas should remain visible (dimmed)
4. Only current line-of-sight area should be fully bright

### Boss Room Torches
1. Boss rooms have colored torches at their corners (red for boss, yellow for miniboss)
2. Torches should be on wall tiles, not in doorways/corridors
3. After clearing the room, ALL torches should extinguish (become walls)

### Inventory
1. Press I to open inventory
2. Left columns = spells, right columns = items
3. Arrow keys or mouse to navigate grid
4. Number keys 1-4 assign selected cell to hotbar
5. Enter or click on food items to consume them
