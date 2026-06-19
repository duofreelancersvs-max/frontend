/**
 * Post-build prerender for public marketing & auth routes.
 * Run after `vite build`: node scripts/prerender-public.mjs
 */
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "../dist");
const PORT = 4173;
const BASE = `http://127.0.0.1:${PORT}`;

const ROUTES = [
  "/",
  "/about",
  "/how-it-works",
  "/pricing",
  "/freelancers",
  "/projects",
  "/categories",
  "/contact",
  "/terms-and-conditions",
  "/privacy-policy",
  "/login",
  "/register",
  "/forgot-password",
  "/verify-email-sent",
  "/launch",
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, attempts = 30) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return;
    } catch {
      /* retry */
    }
    await wait(500);
  }
  throw new Error(`Static server did not start at ${url}`);
}

function startServer() {
  return spawn("npx", ["serve", DIST, "-l", String(PORT), "-s"], {
    stdio: "pipe",
  });
}

function routeToFile(route) {
  if (route === "/") return join(DIST, "index.html");
  const dir = join(DIST, route.replace(/^\//, ""));
  mkdirSync(dir, { recursive: true });
  return join(dir, "index.html");
}

async function main() {
  if (!existsSync(join(DIST, "index.html"))) {
    console.error("[prerender] dist/index.html not found. Run vite build first.");
    process.exit(1);
  }

  let puppeteer;
  try {
    puppeteer = await import("puppeteer");
  } catch {
    console.warn("[prerender] puppeteer not installed — skipping prerender.");
    console.warn("  Install with: npm install -D puppeteer");
    process.exit(0);
  }

  const server = startServer();
  let browser;

  try {
    await waitForServer(`${BASE}/`);
    console.log("[prerender] Server ready, launching browser…");

    browser = await puppeteer.default.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

    for (const route of ROUTES) {
      const url = `${BASE}${route}`;
      console.log(`[prerender] ${route}`);

      await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
      await page.waitForSelector("#root", { timeout: 15000 });
      await wait(500);

      const html = await page.content();
      const out = routeToFile(route);
      writeFileSync(out, html, "utf8");
    }

    console.log(`[prerender] Done — ${ROUTES.length} routes written to dist/`);
  } finally {
    if (browser) await browser.close();
    server.kill("SIGTERM");
  }
}

main().catch((err) => {
  console.error("[prerender] Failed:", err.message);
  process.exit(1);
});
