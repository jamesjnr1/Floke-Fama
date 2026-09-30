// Shared headless Chromium launcher for the build scripts.
// If Playwright's bundled browser is missing, set CHROMIUM_PATH to any Chrome/Chromium executable.
import { chromium } from 'playwright';

export function launch() {
  const executablePath = process.env.CHROMIUM_PATH || undefined;
  return chromium.launch({ executablePath });
}
