import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
const DEVICE = process.argv[2] || "mobil";
const vp = DEVICE === "desktop" ? { width: 1280, height: 900, m: false } : { width: 430, height: 932, m: true };
const OUT = `/tmp/akhq-app-shots-${DEVICE}`;
await mkdir(OUT, { recursive: true });
const b = await chromium.launch({ headless: true });
const p = await b.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2, isMobile: vp.m, hasTouch: vp.m });
await p.addInitScript(() => { try { localStorage.setItem("ak_cookie_consent", "all"); } catch {} });
for (const [name, path] of [["auth-login","/auth/login"],["auth-signup","/auth/signup"],["auth-glemt","/auth/forgot-password"],["auth-bankid","/auth/bankid"]]) {
  await p.goto(`http://localhost:3000${path}`, { waitUntil: "networkidle", timeout: 30000 });
  await p.waitForTimeout(900);
  await p.addStyleTag({ content: "nextjs-portal,[data-nextjs-toast],#__next-dev-tools-indicator{display:none!important}" }).catch(()=>{});
  await p.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  console.log(`OK ${name} [${DEVICE}]`);
}
await b.close();
