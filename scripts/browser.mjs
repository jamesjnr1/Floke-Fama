// Shared headless Chromium launcher for the build scripts.
// If Playwright's bundled browser is missing, set CHROMIUM_PATH to any Chrome/Chromium executable.
import { chromium } from 'playwright';

export function launch() {
  const executablePath = process.env.CHROMIUM_PATH || undefined;
  // SwiftShader gives headless Chromium a software WebGL context, so the 3D hero renders in QA.
  return chromium.launch({ executablePath, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
}
