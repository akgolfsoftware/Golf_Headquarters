#!/usr/bin/env node
/** Sammenligner eksisterende skjermbilder. Ingen nettleser, innlogging eller nettverk. */
import { readFile, writeFile, mkdir, realpath } from "node:fs/promises";
import { resolve, relative, dirname, isAbsolute, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import sharp from "sharp";

const help = `Workbench: sammenlign PNG-er fra samme skjermtilstand.

node scripts/workbench-compare.mjs --reference <fasit.png> --actual <app.png> \\
  --out /private/tmp/workbench-kontroll --scale 2 --label uke-1440

--reference          Uendret referanse-PNG fra valgt Claude Design-eksport
--actual             Faktisk app-PNG med samme størrelse, data og tilstand
--out                Privat mappe utenfor repoet (obligatorisk)
--scale              Piksler per CSS-piksel, standard 2
--reference-scale    Referansens pikselfaktor hvis ulik --scale. Eksplisitt
                     nedskalering til appens faktor; registreres i rapporten.
--label              Filprefiks, små bokstaver/tall/bindestrek, standard sammenligning
--max-diff-percent   Valgfri eksplisitt grense, 0–100; overskridelse gir exit 2

Skriver <label>-side-ved-side.png (fasit venstre, app høyre),
<label>-diff.png (forskjeller i rødt) og <label>-rapport.json.
PNG og JPEG støttes. Ulike CSS-størrelser avvises. Referansen nedskaleres
bare med eksplisitt --reference-scale; aldri beskjæring eller maskering.
JPEG og nedskalering gir diagnostikk, ikke en tapsfri pikselgodkjenning.
Avviksprosent og omsluttende avviksområde er ikke en visuell godkjenning
eller måling av elementenes plassering. Mål topp/paneler separat i nettleseren.
`;

async function main() {
  const argv = process.argv.slice(2);
  if (argv.includes("--help")) { console.log(help); return; }
  const allowed = new Set(["reference", "actual", "out", "scale", "reference-scale", "label", "max-diff-percent"]);
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i]?.slice(2);
    if (!argv[i]?.startsWith("--") || !allowed.has(key) || args[key] !== undefined || !argv[i + 1] || argv[i + 1].startsWith("--")) {
      throw new Error("Ugyldige argumenter. Bruk --help.");
    }
    args[key] = argv[i + 1];
  }
  if (!args.reference || !args.actual || !args.out) throw new Error("--reference, --actual og --out kreves.");
  const scale = Number(args.scale ?? 2);
  const referenceScale = Number(args["reference-scale"] ?? scale);
  const limit = args["max-diff-percent"] === undefined ? null : Number(args["max-diff-percent"]);
  const label = args.label ?? "sammenligning";
  if (!Number.isFinite(scale) || scale <= 0) throw new Error("--scale må være positiv.");
  if (!Number.isFinite(referenceScale) || referenceScale < scale) throw new Error("--reference-scale må være minst appens --scale. Oppskalering er ikke tillatt.");
  if (limit !== null && (!Number.isFinite(limit) || limit < 0 || limit > 100)) throw new Error("Grensen må være 0–100.");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(label)) throw new Error("--label må være små bokstaver/tall med bindestrek.");

  const repo = await realpath(resolve(dirname(fileURLToPath(import.meta.url)), ".."));
  const out = resolve(args.out);
  // Kontroller også symlinker i eksisterende foreldre før noe skrives.
  let ancestor = out;
  const missing = [];
  while (true) {
    try { ancestor = await realpath(ancestor); break; }
    catch (error) {
      if (error.code !== "ENOENT") throw error;
      missing.unshift(relative(dirname(ancestor), ancestor));
      ancestor = dirname(ancestor);
    }
  }
  const resolvedOut = resolve(ancestor, ...missing);
  const rel = relative(repo, resolvedOut);
  if (rel === "" || (rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel))) throw new Error("Bildene må lagres privat utenfor repoet.");

  const [referenceBytes, actualBytes] = await Promise.all([
    readFile(resolve(args.reference)), readFile(resolve(args.actual)),
  ]);
  const [referenceMeta, actualMeta] = await Promise.all([sharp(referenceBytes).metadata(), sharp(actualBytes).metadata()]);
  const resized = referenceScale !== scale;
  let referenceImage = sharp(referenceBytes);
  if (resized) {
    const width = referenceMeta.width / referenceScale * scale;
    const height = referenceMeta.height / referenceScale * scale;
    if (!Number.isInteger(width) || !Number.isInteger(height)) throw new Error("Pikselfaktorene gir ikke hele dimensjoner.");
    referenceImage = referenceImage.resize(width, height, { kernel: "lanczos3" });
  }
  const reference = PNG.sync.read(await referenceImage.png().toBuffer());
  const actual = PNG.sync.read(await sharp(actualBytes).png().toBuffer());
  const { width, height } = reference;
  if (actual.width !== width || actual.height !== height) {
    throw new Error(`Ulike dimensjoner: fasit ${width}×${height}, app ${actual.width}×${actual.height}. Ta nytt skjermbilde i samme format.`);
  }
  const mask = new PNG({ width, height });
  const count = pixelmatch(reference.data, actual.data, mask.data, width, height, {
    threshold: 0.1, includeAA: false, diffMask: true,
  });
  const diff = new PNG({ width, height });
  diff.data.fill(255);
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      if (mask.data[offset + 3] === 0) continue;
      mask.data.copy(diff.data, offset, offset, offset + 4);
      minX = Math.min(minX, x); minY = Math.min(minY, y);
      maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
    }
  }
  const sideBySide = new PNG({ width: width * 2, height });
  PNG.bitblt(reference, sideBySide, 0, 0, width, height, 0, 0);
  PNG.bitblt(actual, sideBySide, 0, 0, width, height, width, 0);
  const percent = count / (width * height) * 100;
  const report = {
    label,
    createdAt: new Date().toISOString(),
    reference: { path: resolve(args.reference), sha256: createHash("sha256").update(referenceBytes).digest("hex"), format: referenceMeta.format, width: referenceMeta.width, height: referenceMeta.height, scale: referenceScale },
    actual: { path: resolve(args.actual), sha256: createHash("sha256").update(actualBytes).digest("hex"), format: actualMeta.format, width: actualMeta.width, height: actualMeta.height },
    pixels: { width, height, different: count, total: width * height, percent },
    css: { width: width / scale, height: height / scale, scale },
    differenceBoundsCss: count === 0 ? null : { x: minX / scale, y: minY / scale, width: (maxX - minX + 1) / scale, height: (maxY - minY + 1) / scale },
    comparison: { threshold: 0.1, includeAntialiasing: false, resized, resizeKernel: resized ? "lanczos3" : null, lossyInput: referenceMeta.format === "jpeg" || actualMeta.format === "jpeg", cropped: false, masked: false },
    explicitLimitPercent: limit,
    withinExplicitLimit: limit === null ? null : percent <= limit,
    visualApproval: false,
    note: "Fasit til venstre. Avviksområdet er ikke en måling av elementforskyvning. Samsvar i data, fonter, tid, tilstand og rulling må kontrolleres separat.",
  };
  await mkdir(resolvedOut, { recursive: true, mode: 0o700 });
  await Promise.all([
    writeFile(resolve(resolvedOut, `${label}-side-ved-side.png`), PNG.sync.write(sideBySide), { mode: 0o600 }),
    writeFile(resolve(resolvedOut, `${label}-diff.png`), PNG.sync.write(diff), { mode: 0o600 }),
    writeFile(resolve(resolvedOut, `${label}-rapport.json`), JSON.stringify(report, null, 2) + "\n", { mode: 0o600 }),
  ]);
  console.log(`${label}: ${count}/${width * height} avvikende piksler (${percent.toFixed(3)} %). CSS-format ${width / scale}×${height / scale}. Rapport: ${resolvedOut}/${label}-rapport.json`);
  if (limit !== null && percent > limit) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
