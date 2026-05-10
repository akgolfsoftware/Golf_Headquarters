// Genererer PWA-icons fra SVG-logo.
// Bruker: node scripts/generate-icons.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const PUBLIC = join(process.cwd(), "public");

// Maskable icon må ha safe-zone padding (40% av bildet rundt sentrum).
// Standard icon kan ha mindre padding.
const KONFIG = [
  { navn: "icon-192.png", størrelse: 192, padding: 0.15, bakgrunn: "#FAFAF7" },
  { navn: "icon-512.png", størrelse: 512, padding: 0.15, bakgrunn: "#FAFAF7" },
  { navn: "icon-512-maskable.png", størrelse: 512, padding: 0.25, bakgrunn: "#005840" },
  { navn: "apple-touch-icon.png", størrelse: 180, padding: 0.15, bakgrunn: "#FAFAF7" },
  { navn: "favicon-32.png", størrelse: 32, padding: 0.05, bakgrunn: "#FAFAF7" },
  { navn: "favicon-16.png", størrelse: 16, padding: 0.05, bakgrunn: "#FAFAF7" },
];

const sourceSvg = readFileSync(
  join(PUBLIC, "logos", "ak-golf-logo-primary-on-light.svg")
);

for (const k of KONFIG) {
  const innerSize = Math.round(k.størrelse * (1 - 2 * k.padding));
  const buffer = await sharp({
    create: {
      width: k.størrelse,
      height: k.størrelse,
      channels: 4,
      background: k.bakgrunn,
    },
  })
    .composite([
      {
        input: await sharp(sourceSvg)
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

  writeFileSync(join(PUBLIC, k.navn), buffer);
  console.log(`✓ ${k.navn} (${k.størrelse}x${k.størrelse})`);
}

console.log("\nFerdig — ikoner ligger i public/");
