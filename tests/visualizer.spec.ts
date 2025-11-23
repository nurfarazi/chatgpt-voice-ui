// tests/visualizer.spec.ts
import { test, expect, chromium } from '@playwright/test';
import path from 'path';

test.describe('ChatGPT Voice Visualizer Extension', () => {
  test('should load extension and display visualizer', async () => {
    // Path to the built extension directory
    const extensionPath = path.resolve(__dirname, '..', 'dist');

    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
      // Grant microphone permission for the page
      permissions: ['microphone'],
    });

    const page = await context.newPage();
    await page.goto('https://chat.openai.com/'); // Using the actual ChatGPT URL

    // Wait for the overlay to be injected (by checking for the overlay host element)
    const overlayHost = await page.waitForSelector('#codex-overlay-host', { timeout: 15000 });
    expect(overlayHost).toBeTruthy();

    // Click the voice orb button to start listening
    const voiceOrb = await page.waitForSelector('.codex-overlay__voice-orb', { timeout: 5000 });
    await voiceOrb.click();

    // Verify that the visualizer bars appear (default style is bars)
    const bars = await page.waitForSelector('.codex-overlay__voice-bars', { timeout: 5000 });
    expect(bars).toBeTruthy();

    // Clean up
    await context.close();
  });
});
