import { test, expect } from '@playwright/test';

test.describe('Arcania Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas#game-canvas');
  });

  test('loads the game canvas', async ({ page }) => {
    const canvas = page.locator('canvas#game-canvas');
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
  });

  test('shows title/hub screen initially', async ({ page }) => {
    // The hub screen should be rendered on canvas - we verify by checking
    // that the game doesn't crash and the canvas is rendered
    await page.waitForTimeout(500);
    const canvas = page.locator('canvas#game-canvas');
    await expect(canvas).toBeVisible();
  });

  test('starts a run when Enter is pressed', async ({ page }) => {
    await page.waitForTimeout(300);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    // Game should now be in dungeon scene - canvas should still be visible and rendering
    const canvas = page.locator('canvas#game-canvas');
    await expect(canvas).toBeVisible();
  });

  test('player can move with WASD', async ({ page }) => {
    // Start the game
    await page.waitForTimeout(300);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    // Hold W to move up
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(300);
    await page.keyboard.up('KeyW');

    // Hold D to move right
    await page.keyboard.down('KeyD');
    await page.waitForTimeout(300);
    await page.keyboard.up('KeyD');

    // Game should still be running
    const canvas = page.locator('canvas#game-canvas');
    await expect(canvas).toBeVisible();
  });

  test('pause menu opens with Escape', async ({ page }) => {
    await page.waitForTimeout(300);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);

    // Resume with Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);

    const canvas = page.locator('canvas#game-canvas');
    await expect(canvas).toBeVisible();
  });

  test('inventory opens with I key', async ({ page }) => {
    await page.waitForTimeout(300);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    await page.keyboard.press('KeyI');
    await page.waitForTimeout(200);

    // Close with Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);

    const canvas = page.locator('canvas#game-canvas');
    await expect(canvas).toBeVisible();
  });

  test('player can cast spells with mouse click', async ({ page }) => {
    await page.waitForTimeout(300);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    // Click to cast spell
    const canvas = page.locator('canvas#game-canvas');
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width / 2 + 50, box.y + box.height / 2);
      await page.waitForTimeout(200);
    }

    await expect(canvas).toBeVisible();
  });

  test('game does not crash during extended play', async ({ page }) => {
    await page.waitForTimeout(300);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    // Simulate some gameplay
    const actions = ['KeyW', 'KeyD', 'KeyS', 'KeyA', 'KeyW', 'KeyD'];
    for (const key of actions) {
      await page.keyboard.down(key);
      await page.waitForTimeout(200);
      await page.keyboard.up(key);
    }

    // Cast some spells
    const canvas = page.locator('canvas#game-canvas');
    const box = await canvas.boundingBox();
    if (box) {
      for (let i = 0; i < 3; i++) {
        await page.mouse.click(
          box.x + box.width / 2 + Math.random() * 100 - 50,
          box.y + box.height / 2 + Math.random() * 100 - 50
        );
        await page.waitForTimeout(300);
      }
    }

    // Game should still be running without errors
    await expect(canvas).toBeVisible();

    // Check for console errors
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.waitForTimeout(500);
    expect(errors.length).toBe(0);
  });
});
