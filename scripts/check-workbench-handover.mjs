#!/usr/bin/env node
/** Kontrollerer valgt kildepakke, ikke implementering eller visuell godkjenning. */
import { createHash } from "node:crypto";
import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const PILLER = ["ar", "periode", "maned", "uke", "okt", "stall", "live", "minkalender"];
const PAAREVDE = [
  "SKILL.md", "manifest.md", "Workbench WB-05-11.dc.html",
  "assets/logo-ak-golf-hq.svg", "assets/logo-ak-golf-hq-negative.svg",
  "tokens/colors.css", "tokens/fonts.css", "tokens/typography.css",
  ...PILLER.flatMap((pille) => [1440, 390].map((bredde) => `WB-${pille}-coach-normal-${bredde}.png`)),
];

export function kontrollerHandover(mappe) {
  const feil = [];
  let kontroll;
  let rot;
  try {
    rot = realpathSync(mappe);
    kontroll = JSON.parse(readFileSync(path.join(rot, "import-kontroll.json"), "utf8"));
    if (!Array.isArray(kontroll.filer)) throw new Error("filer må være en liste");
  } catch (err) {
    return { ok: false, feil: [`Kan ikke lese importkontrollen: ${err.message}`], filer: 0, png: 0 };
  }
  const sett = new Set();
  let png = 0;
  for (const rad of kontroll.filer) {
    const navn = rad?.fil;
    if (typeof navn !== "string" || !PAAREVDE.includes(navn)) {
      feil.push("Importkontrollen inneholder en ukjent fil eller ugyldig sti");
      continue;
    }
    if (sett.has(navn)) {
      feil.push(`Duplisert fil: ${navn}`);
      continue;
    }
    sett.add(navn);
    try {
      const faktiskSti = realpathSync(path.join(rot, navn));
      const relativ = path.relative(rot, faktiskSti);
      if (relativ.startsWith(`..${path.sep}`) || path.isAbsolute(relativ)) {
        throw new Error("filen peker utenfor kildepakken");
      }
      const data = readFileSync(faktiskSti);
      if (data.length !== rad.bytes) feil.push(`Endret filstørrelse: ${navn}`);
      const hash = createHash("sha256").update(data).digest("hex");
      if (hash !== rad.sha256) feil.push(`Endret kontrollsum: ${navn}`);
      if (navn.endsWith(".png")) {
        const desktop = navn.endsWith("-1440.png");
        const bredde = desktop ? 2880 : 780;
        const hoyde = desktop ? 1760 : 1688;
        if (data.length < 33 || data.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a"
          || data.readUInt32BE(8) !== 13 || data.subarray(12, 16).toString() !== "IHDR") {
          feil.push(`Ugyldig PNG-hode: ${navn}`);
        } else if (data.readUInt32BE(16) !== bredde || data.readUInt32BE(20) !== hoyde) {
          feil.push(`Feil 2×-mål, forventet ${bredde}×${hoyde}: ${navn}`);
        } else png++;
      }
    } catch (err) {
      feil.push(`${navn}: ${err.message}`);
    }
  }
  for (const navn of PAAREVDE) if (!sett.has(navn)) feil.push(`Mangler i importkontrollen: ${navn}`);
  return { ok: feil.length === 0, feil, filer: sett.size, png };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const resultat = kontrollerHandover(path.join(process.cwd(), "docs/design/workbench-handover"));
  if (resultat.ok) {
    console.log(`OK: valgt Workbench-kildepakke, ${resultat.filer} filer og ${resultat.png} PNG-er med riktige kontrollsummer og 2×-mål. Ikke portering/godkjenning.`);
  } else {
    for (const feil of resultat.feil) console.error(`Workbench-kilde: ${feil}`);
    process.exitCode = 1;
  }
}
