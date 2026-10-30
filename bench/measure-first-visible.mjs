import { chromium } from 'playwright';

const RUNS = 10;

const TARGETS = [
  {
    name: 'addon-docs',
    url: 'http://127.0.0.1:6018/?path=/docs/example-button--docs',
    visible: async (page) => {
      const frame = page.frameLocator('#storybook-preview-iframe');
      await frame
        .locator('.sbdocs, article, .sbdocs-wrapper')
        .first()
        .waitFor({ state: 'visible', timeout: 30000 });
    },
  },
  {
    name: 'manager-docs+pool',
    url: 'http://127.0.0.1:6008/?path=/docs/stories-button--docs',
    visible: async (page) => {
      await page
        .locator('article[aria-label="Documentation"]')
        .waitFor({ state: 'visible', timeout: 30000 });
    },
  },
];

function median(values) {
  const sorted = [...values].filter((n) => typeof n === 'number' && Number.isFinite(n)).sort((a, b) => a - b);
  if (sorted.length === 0) {
    return null;
  }
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

async function preparePage(context) {
  const page = await context.newPage();
  await page.addInitScript(() => {
    const store = { fcp: null, lcp: null, lcpTag: null, lcpText: null, lcpSize: null };
    window.__docsPaint = store;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          store.fcp = entry.startTime;
        }
      }
    }).observe({ type: 'paint', buffered: true });
    new PerformanceObserver((list) => {
      const entry = list.getEntries().at(-1);
      if (!entry) {
        return;
      }
      store.lcp = entry.startTime;
      store.lcpSize = entry.size;
      store.lcpTag = entry.element?.tagName ?? null;
      store.lcpText = entry.element?.textContent?.trim()?.slice(0, 80) ?? null;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  });
  return page;
}

async function measureTarget(browser, target) {
  const runs = [];
  for (let i = 0; i < RUNS; i++) {
    const context = await browser.newContext();
    const page = await preparePage(context);
    await page.goto('about:blank');
    const started = performance.now();
    await page.goto(target.url, { waitUntil: 'commit' });
    await target.visible(page);
    const visibleMs = performance.now() - started;
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(500);
    const paint = await page.evaluate(() => window.__docsPaint ?? {});
    runs.push({
      visibleMs,
      fcp: paint.fcp ?? null,
      lcp: paint.lcp ?? null,
      lcpTag: paint.lcpTag ?? null,
      lcpText: paint.lcpText ?? null,
      lcpSize: paint.lcpSize ?? null,
    });
    await context.close();
  }
  return runs;
}

function summarize(runs) {
  const summary = {};
  for (const key of ['visibleMs', 'fcp', 'lcp']) {
    const values = runs.map((run) => run[key]);
    summary[key] = {
      median: median(values),
      raw: values.map((n) => (typeof n === 'number' ? Math.round(n) : n)),
    };
  }
  summary.lcpElements = runs.map((run) => ({ tag: run.lcpTag, text: run.lcpText, size: run.lcpSize }));
  return summary;
}

const browser = await chromium.launch({ headless: true });
const report = {};
for (const target of TARGETS) {
  const runs = await measureTarget(browser, target);
  report[target.name] = { summary: summarize(runs), runs };
}

const scale = await browser.newContext();
const scalePage = await scale.newPage();
await scalePage.goto('http://127.0.0.1:6008/?path=/docs/stories-scale6--docs', {
  waitUntil: 'networkidle',
});
await scalePage.waitForTimeout(800);
const before = await scalePage.evaluate(() => {
  const frame = document.querySelector('iframe[data-manager-docs-frame]');
  return {
    iframes: document.querySelectorAll('iframe[data-manager-docs-instance]').length,
    placeholders: document.querySelectorAll('[data-story-placeholder]').length,
    frameId: frame?.getAttribute('data-manager-docs-frame') ?? null,
    occupant: frame?.getAttribute('data-manager-docs-instance') ?? null,
    src: frame?.getAttribute('src') ?? null,
  };
});
await scalePage.evaluate(() => {
  const root = document.getElementById('storybook-preview-wrapper');
  (root ?? document.scrollingElement).scrollBy(0, window.innerHeight * 1.2);
});
await scalePage.waitForTimeout(800);
const after = await scalePage.evaluate(() => {
  const frame = document.querySelector('iframe[data-manager-docs-frame]');
  return {
    iframes: document.querySelectorAll('iframe[data-manager-docs-instance]').length,
    placeholders: document.querySelectorAll('[data-story-placeholder]').length,
    frameId: frame?.getAttribute('data-manager-docs-frame') ?? null,
    occupant: frame?.getAttribute('data-manager-docs-instance') ?? null,
    src: frame?.getAttribute('src') ?? null,
  };
});
report.scale6 = { before, after, srcUnchanged: before.src === after.src && before.frameId === after.frameId };

await scale.close();
await browser.close();
console.log(JSON.stringify(report, null, 2));
