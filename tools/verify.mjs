// Headless verification: static server + Playwright at 1440x900 and 390x844.
// Screenshots -> assets/src/verify/, console errors + failed requests -> stdout.
import { chromium } from '/Users/user/aios/node_modules/playwright/index.mjs';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
const ROOT = new URL('..', import.meta.url).pathname;
const OUT = ROOT + 'assets/src/verify'; mkdirSync(OUT, { recursive: true });
const PORT = 4381;
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 900));
const browser = await chromium.launch();
const problems = [];
async function run(name, viewport, mobile = false) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
  page.on('console', m => { if (m.type() === 'error') problems.push(`[${name}] console: ${m.text()}`); });
  page.on('requestfailed', r => problems.push(`[${name}] failed: ${r.url()}`));
  page.on('response', r => { if (r.status() >= 400) problems.push(`[${name}] ${r.status()}: ${r.url()}`); });
  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const hOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  if (hOverflow) problems.push(`[${name}] horizontal overflow: scrollWidth ${await page.evaluate(() => document.documentElement.scrollWidth)}`);
  let y = 0, i = 0;
  while (y < total - 10 && i < 40) {
    await page.screenshot({ path: `${OUT}/${name}-${String(i).padStart(2, '0')}.jpg`, type: 'jpeg', quality: 70 });
    for (let k = 0; k < 4; k++) { await page.mouse.wheel(0, viewport.height / 4); await page.waitForTimeout(90); }
    await page.waitForTimeout(650);
    const ny = await page.evaluate(() => window.scrollY); if (ny === y) break; y = ny; i++;
  }
  await page.screenshot({ path: `${OUT}/${name}-${String(i).padStart(2, '0')}.jpg`, type: 'jpeg', quality: 70 });
  // interactions
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300);
  await page.click('#burger'); await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/${name}-menu.jpg`, type: 'jpeg', quality: 70 });
  await page.click('#burger'); await page.waitForTimeout(500);
  const faqBtn = await page.$('.qa:not(.open) .qa__q');
  await faqBtn.scrollIntoViewIfNeeded(); await faqBtn.click(); await page.waitForTimeout(700);
  const opened = await faqBtn.getAttribute('aria-expanded');
  if (opened !== 'true') problems.push(`[${name}] FAQ did not open`);
  const stat = await page.locator('.stat__num').first().textContent();
  console.log(`[${name}] height ${total}px, first stat "${stat}", faq open ${opened}`);
  await page.close();
}
await run('desk', { width: 1440, height: 900 });
await run('mob', { width: 390, height: 844 }, true);
await browser.close(); srv.kill();
console.log(problems.length ? problems.join('\n') : 'no console errors / failed requests / overflow');
