// Genererer iOS PWA splash-screens fra AK Golf-logoen.
// Bruker: node scripts/generate-pwa-splash.mjs

import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const PUBLIC = join(process.cwd(), "public");
const SPLASH_DIR = join(PUBLIC, "splash");
mkdirSync(SPLASH_DIR, { recursive: true });

// Bakgrunn: Forest #005840 (primary). Logoen: hvit-på-grønn SVG.
const BAKGRUNN = { r: 0, g: 88, b: 64, alpha: 1 };

const SPLASH_SIZES = [
  // iPhone 14 Pro Max / 15 Pro Max
  { navn: "apple-splash-1290-2796.png", w: 1290, h: 2796 },
  // iPhone 14 Pro / 15 Pro
  { navn: "apple-splash-1179-2556.png", w: 1179, h: 2556 },
  // iPhone 14 / 13 / 12
  { navn: "apple-splash-1170-2532.png", w: 1170, h: 2532 },
  // iPhone 11 / XR
  { navn: "apple-splash-828-1792.png", w: 828, h: 1792 },
  // iPad Pro 11"
  { navn: "apple-splash-1668-2388.png", w: 1668, h: 2388 },
];

const logoSvg = readFileSync(
  join(PUBLIC, "logos", "ak-golf-logo-white-on-green.svg"),
);

for (const s of SPLASH_SIZES) {
  // Logoen sentreres og fyller ~35% av kortsiden.
  const kortside = Math.min(s.w, s.h);
  const logoSize = Math.round(kortside * 0.35);

  const logoBuffer = await sharp(logoSvg)
    .resize(logoSize, logoSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const buffer = await sharp({
    create: {
      width: s.w,
      height: s.h,
      channels: 4,
      background: BAKGRUNN,
    },
  })
    .composite([{ input: logoBuffer, gravity: "center" }])
    .png()
    .toBuffer();

  writeFileSync(join(SPLASH_DIR, s.navn), buffer);
  console.log(`✓ splash/${s.navn} (${s.w}x${s.h})`);
}

// Generer i tillegg en maskable-192 (192x192 maskable variant — manifest krever begge størrelser).
const INNER_PADDING = 0.25;
const størrelse = 192;
const innerSize = Math.round(størrelse * (1 - 2 * INNER_PADDING));
const sourceLogo = readFileSync(
  join(PUBLIC, "logos", "ak-golf-logo-primary-on-light.svg"),
);
const maskable192 = await sharp({
  create: {
    width: størrelse,
    height: størrelse,
    channels: 4,
    background: "#005840",
  },
})
  .composite([
    {
      input: await sharp(sourceLogo)
        .resize(innerSize, innerSize, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer(),
      gravity: "center",
    },
  ])
  .png()
  .toBuffer();

writeFileSync(join(PUBLIC, "icon-192-maskable.png"), maskable192);
console.log(`✓ icon-192-maskable.png (192x192)`);

console.log("\nFerdig — splash + maskable-192 ligger i public/");
