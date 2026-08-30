#!/usr/bin/env node
/**
 * Screenshot Train-lock-rammer (data-screen-label) til /tmp/ak-visuell-review/fasit.
 */
import { chromium } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

const ROOT = path.resolve(import.meta.dirname, "../..");
const FASIT = path.join(ROOT, "designsystem/train-lock");
const OUT = "/tmp/ak-visuell-review/fasit";

const RAMMER = [
  { id: "idag-telefon", fil: "PH-01 I dag.dc.html", label: "PH-01 I dag" },
  { id: "idag-ipad", fil: "B2 PH-01 I dag iPad Mac.dc.html", label: "PH-01 iPad regular" },
  { id: "idag-mac", fil: "B2 PH-01 I dag iPad Mac.dc.html", label: "PH-01 Mac" },
  { id: "plan-telefon", fil: "PH-07 Plan.dc.html", label: "PH-07 Plan" },
  { id: "plan-mac", fil: "P-01 Mac Uke.dc.html", label: "P-01 Player Min uke" },
  { id: "wb-telefon", fil: "WB-01 Uke minimum.dc.html", label: "WB-01c Uke iPhone" },
  { id: "wb-ipad", fil: "WB-01 Uke minimum.dc.html", label: "WB-01b Uke iPad" },
  { id: "wb-mac", fil: "WB-01 Uke minimum.dc.html", label: "WB-01a Uke Mac" },
];

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ deviceScaleFactor: 2 });

for (const r of RAMMER) {
  const url = "file://" + path.join(FASIT, r.fil);
  await page.goto(url, { waitUntil: "load" });
  const el = page.locator(`[data-screen-label="${r.label}"]`).first();
  await el.waitFor({ state: "visible", timeout: 15000 });
  const dest = path.join(OUT, `${r.id}.png`);
  await el.screenshot({ path: dest, type: "png" });
  console.log("fasit", r.id, dest);
}

await browser.close();
