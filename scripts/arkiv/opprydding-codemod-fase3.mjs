// Fase 3-codemod (docs/opprydding/03-opprydding-plan.md): bytter de gamle
// athletic-atomene til golfdata-ekvivalenter på tvers av src.
//   AthleticEyebrow → Eyebrow (as="span"; tone lime→signal)
//   AthleticBadge   → Tag (primary/lime→signal, ok→up, urgent→down, neutral→neutral,
//                     warn→outline + warning-token-style — DS mangler warn-variant, gap meldt)
//   AthleticButton  → Button (default/lime→signal, primary→primary; størrelser 1:1)
// Sparkline/Avatar/Card har semantiske prop-forskjeller og tas i egen (halv)manuell pass.
// Kjør: node scripts/opprydding-codemod-fase3.mjs [--area src/app/portal] [--dry]
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const areaIdx = process.argv.indexOf("--area");
const AREA = areaIdx >= 0 ? process.argv[areaIdx + 1] : "src";
const DRY = process.argv.includes("--dry");

const files = execSync(
  `grep -rl "AthleticEyebrow\\|AthleticBadge\\|AthleticButton" ${AREA} --include='*.tsx' --include='*.ts'`,
  { encoding: "utf8" },
)
  .trim()
  .split("\n")
  .filter((f) => f && !f.startsWith("src/components/athletic/"));

const BADGE_VARIANT = { primary: "signal", lime: "signal", neutral: "neutral", ok: "up", urgent: "down" };
const WARN_STYLE =
  'variant="outline" style={{ color: "var(--warning)", borderColor: "var(--warning-border)" }}';

let changed = 0;
for (const f of files) {
  let src = readFileSync(f, "utf8");
  const orig = src;

  let brukerEyebrow = /\bAthleticEyebrow\b/.test(src);
  let brukerBadge = /\bAthleticBadge\b/.test(src);
  let brukerButton = /\bAthleticButton\b/.test(src);

  // Kollisjonsvern: hvis filen ALLEREDE bruker målnavnet (golfdata-Tag, ui-Button,
  // lokal Eyebrow …), hopp over den transformen her — tas manuelt med alias.
  if (brukerEyebrow && /<Eyebrow[\s/>]/.test(src)) { console.log(`MANUELL (Eyebrow-kollisjon): ${f}`); brukerEyebrow = false; }
  if (brukerBadge && /<Tag[\s/>]/.test(src)) { console.log(`MANUELL (Tag-kollisjon): ${f}`); brukerBadge = false; }
  if (brukerButton && /<Button[\s/>]/.test(src)) { console.log(`MANUELL (Button-kollisjon): ${f}`); brukerButton = false; }
  if (!brukerEyebrow && !brukerBadge && !brukerButton) continue;

  // ---- JSX: AthleticEyebrow → Eyebrow (behold inline-flow med as="span") ----
  if (brukerEyebrow) {
    src = src.replace(/<AthleticEyebrow(?=[\s/>])/g, '<Eyebrow as="span"');
    src = src.replace(/<\/AthleticEyebrow>/g, "</Eyebrow>");
    // tone-mapping innenfor Eyebrow-tagger (lime→signal; default utelates = muted)
    src = src.replace(/(<Eyebrow as="span"[^>]*?)\stone="lime"/gs, '$1 tone="signal"');
  }

  // ---- JSX: AthleticBadge → Tag ----
  if (brukerBadge) {
    src = src.replace(/<AthleticBadge(?=[\s/>])/g, "<Tag");
    src = src.replace(/<\/AthleticBadge>/g, "</Tag>");
    src = src.replace(/(<Tag(?![A-Za-z])[^>]*?)\svariant="(primary|lime|neutral|ok|urgent)"/gs, (m, pre, v) =>
      `${pre} variant="${BADGE_VARIANT[v]}"`,
    );
    src = src.replace(/(<Tag(?![A-Za-z])[^>]*?)\svariant="warn"/gs, `$1 ${WARN_STYLE}`);
    // gammel default var primary → signal: Tag uten variant-attributt får variant="signal"
    src = src.replace(/<Tag(?![A-Za-z])((?:(?!variant=)[^>])*?)(\/?)>/gs, (m, attrs, selfClose) =>
      /variant=/.test(m) ? m : `<Tag variant="signal"${attrs}${selfClose}>`,
    );
  }

  // ---- JSX: AthleticButton → Button ----
  if (brukerButton) {
    src = src.replace(/<AthleticButton(?=[\s/>])/g, "<Button");
    src = src.replace(/<\/AthleticButton>/g, "</Button>");
    src = src.replace(/(<Button(?![A-Za-z])[^>]*?)\svariant="lime"/gs, '$1 variant="signal"');
    // gammel default var lime → signal
    src = src.replace(/<Button(?![A-Za-z])((?:(?!variant=)[^>])*?)(\/?)>/gs, (m, attrs, selfClose) =>
      /variant=/.test(m) ? m : `<Button variant="signal"${attrs}${selfClose}>`,
    );
  }

  // ---- Imports: fjern gamle navn, legg til golfdata-import ----
  const fjernNavn = [];
  if (brukerEyebrow) fjernNavn.push("AthleticEyebrow");
  if (brukerBadge) fjernNavn.push("AthleticBadge");
  if (brukerButton) fjernNavn.push("AthleticButton");
  const nyeNavn = [];
  if (brukerEyebrow) nyeNavn.push("Eyebrow");
  if (brukerBadge) nyeNavn.push("Tag");
  if (brukerButton) nyeNavn.push("Button");

  // Fjern navnene fra alle athletic-imports (barrel eller enkeltfil)
  src = src.replace(
    /import\s*(type\s*)?\{([^}]*)\}\s*from\s*"@\/components\/athletic(?:\/[a-z-]+)?";?\n/g,
    (m, typePrefix, names) => {
      const rest = names
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean)
        .filter((n) => !fjernNavn.includes(n.replace(/^type\s+/, "")));
      if (rest.length === 0) return "";
      return m.replace(names, " " + rest.join(", ") + " ");
    },
  );

  // Legg navnene inn i eksisterende golfdata-import, eller lag ny
  const gdImport = /import\s*\{([^}]*)\}\s*from\s*"@\/components\/athletic\/golfdata";/;
  if (gdImport.test(src)) {
    src = src.replace(gdImport, (m, names) => {
      const have = names.split(",").map((n) => n.trim()).filter(Boolean);
      for (const n of nyeNavn) if (!have.includes(n)) have.push(n);
      return `import { ${have.join(", ")} } from "@/components/athletic/golfdata";`;
    });
  } else if (nyeNavn.length) {
    // Sett golfdata-importen på egen linje FØR første import (trygt også når
    // første import er flerlinjes).
    src = src.replace(
      /^import[\s{]/m,
      (m) => `import { ${nyeNavn.join(", ")} } from "@/components/athletic/golfdata";\n${m}`,
    );
  }

  // Rydd eslint-disable som nå henger over en fjernet/migrert import:
  // behold kun disable-linjer der NESTE linje fortsatt er en gammel athletic-import.
  {
    const lines = src.split("\n");
    const keep = [];
    for (let i = 0; i < lines.length; i++) {
      const erDisable = /^\s*\/\/ eslint-disable-next-line no-restricted-imports -- TODO\(opprydding\)/.test(lines[i]);
      if (erDisable) {
        const neste = lines[i + 1] ?? "";
        const fortsattGammel = /from\s*"@\/components\/athletic(?!\/golfdata)/.test(neste);
        if (!fortsattGammel) continue;
      }
      keep.push(lines[i]);
    }
    src = keep.join("\n");
  }

  if (src !== orig) {
    changed++;
    if (!DRY) writeFileSync(f, src);
    console.log((DRY ? "[dry] " : "") + f);
  }
}
console.log(`\n${changed} filer endret (område: ${AREA}${DRY ? ", dry-run" : ""})`);
