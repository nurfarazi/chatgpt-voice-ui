// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // Only run files that end with .spec.ts (our visualizer test)
  testMatch: '**/*.spec.ts',
  // Ensure Vitest’s globals are not loaded
  globalSetup: undefined,
  use: {
    headless: false,
    // Grant microphone permission automatically
    permissions: ['microphone'],
    // Base URL for ChatGPT
    baseURL: 'https://chat.openai.com',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
