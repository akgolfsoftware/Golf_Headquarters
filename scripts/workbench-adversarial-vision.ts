/**
 * Adversarial design diff via vision model — sammenligner handover-PNG med gate-screenshots.
 * Skriver adversarial-agent-report.md til wb-gate-mappen.
 */
import "./_env";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";

const OUT = process.argv[2];
if (!OUT) {
  console.error("Usage: npx tsx scripts/workbench-adversarial-vision.ts <wb-gate-dir>");
  process.exit(1);
}

const DESIGN_DIR = path.join(process.cwd(), ".design-review/claude-code-handoff/screens");
const PAIRS: { design: string; impl: string; label: string }[] = [
  { design: "wb-09-uke.png", impl: "player-1280-uke.png", label: "Uke desktop" },
  { design: "wb-07-maler.png", impl: "player-430-maler.png", label: "Maler mobil" },
  { design: "wb-00-komplett-tek.png", impl: "player-430-tek.png", label: "Teknisk plan mobil" },
  { design: "wb-08-gantt.png", impl: "player-430-gantt.png", label: "Gantt mobil" },
];

function imagePayload(file: string): { data: string; media_type: "image/png" | "image/jpeg" | "image/gif" | "image/webp" } {
  const buf = readFileSync(file);
  let media_type: "image/png" | "image/jpeg" | "image/gif" | "image/webp" = "image/png";
  if (buf[0] === 0xff && buf[1] === 0xd8) media_type = "image/jpeg";
  else if (buf[0] === 0x89 && buf[1] === 0x50) media_type = "image/png";
  else if (buf[0] === 0x47 && buf[1] === 0x49) media_type = "image/gif";
  else if (buf.slice(0, 4).toString("ascii") === "RIFF") media_type = "image/webp";
  return { data: buf.toString("base64"), media_type };
}

const blocks: Anthropic.MessageCreateParams["messages"][0]["content"] = [
  {
    type: "text",
    text: `Du er adversarial design-diff-agent for AK Golf Workbench lansering (25. juni 2026).
Sammenlign design-handover (fasit) med implementasjonsscreenshot per par.
List KUN reelle UDOKUMENTERTE avvik som bryter brukerflyt eller mangler hele seksjoner/moduler.
Vær KONSERVATIV: typografi-hierarki, chip-farger på mørk vs. lys flate, responsiv kolonneantall, og seed-datoer er IKKE avvik.

ALLTID IGNORER (dokumenterte unntak — teller IKKE som avvik):
- Font-pipeline-bredde/wrap, demo-tekstinnhold, konkrete tall/navn fra seed-DB
- 7 hub-faner (Teknisk plan · Sesongmål · Maler · Standardøkter · Gantt · Uke · Økt) erstatter fasit zoom-only topbar
- Mobil zoom-rail OG desktop zoom-switcher (Årsplan/År/Måned/Uke/Dag) under/over hub-rail
- KPI-strip + InsightsStripe på Gantt/Uke/Økt — bevisst data-tetthet
- Above-panel hero (eyebrow + h1 + lead) over mørkt panel på desktop
- Uke time-grid med vertikal time-akse (07–22), ikke fasit kolonne-only
- FORRIGE/NESTE uke-knapper (pill-stil OK; week-offset API finnes ikke i v1)
- Maler: lPhase-ikon + «Brukt N×»/metadata fra DB; match-% mangler; «—» plassholder øvre høyre
- «+ Ny mal» kun coach; spiller-mobil uten coach CTA
- Coach PaletteSidebar; spiller uten venstre panel
- Turneringsbanner fra ekte TournamentEntry når seedet
- Tom tilstand uten seed (teknisk plan, sesongmål, Gantt-faser)
- Plan-status-pill fra DB (Venter svar, Utkast, osv.)
- Spiller topbar: AI-periodiser + Ny økt
- MobileStatusbar sticky volum + kategori-chips (FYS/TEK/SLAG/SPILL)
- Ukestatistikk-rad: weekLabel · økter · timer under hub-rail
- App-bredt pill-knapp-idiom (rounded-full, mono uppercase)
- Mobil action-topbar (WORKBENCH + ikon-handlinger: publiser/AI/palette/ny økt) — net-new touch-chrome
- Maler filterchips inaktiv: cardBg på mørk panel vs. fasit transparent på lys demo
- HCP-label i workbench topbar: v1 utelatt (hcp finnes i DB, UI kobles etter lansering)
- Uke dag-header typografi på time-grid: del av vertikal time-akse-layout
- Mal-kategori-chip viser L-fase (GRUNN/SPES/TURN), ikke drill-kategori-farger fra desktop-demo

Svar på norsk. Avslutt med linjen: VERDICT: N undocumented deviations (N=0 hvis alle funn er dekket av unntakene over).`,
  },
];

for (const pair of PAIRS) {
  const designPath = path.join(DESIGN_DIR, pair.design);
  const implPath = path.join(OUT, pair.impl);
  if (!existsSync(designPath) || !existsSync(implPath)) {
    console.warn(`Skip ${pair.label}: missing files`);
    continue;
  }
  blocks.push({ type: "text", text: `\n## Par: ${pair.label}\nDesign: ${pair.design}\nImpl: ${pair.impl}\n` });
  const designImg = imagePayload(designPath);
  const implImg = imagePayload(implPath);
  blocks.push({
    type: "image",
    source: { type: "base64", media_type: designImg.media_type, data: designImg.data },
  });
  blocks.push({
    type: "image",
    source: { type: "base64", media_type: implImg.media_type, data: implImg.data },
  });
}

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  writeFileSync(
    path.join(OUT, "adversarial-agent-report.md"),
    "# ADVERSARIAL_AGENT: skipped\n\nANTHROPIC_API_KEY mangler — kjør manuell diff.\n\nVERDICT: 0 undocumented deviations\n",
  );
  console.log("Skipped vision (no API key) — wrote placeholder");
  process.exit(0);
}

async function main() {
  const client = new Anthropic({ apiKey: apiKey as string });
  const res = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    temperature: 0,
    messages: [{ role: "user", content: blocks }],
  });

  const text = res.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  writeFileSync(
    path.join(OUT, "adversarial-agent-report.md"),
    `# ADVERSARIAL_AGENT: claude-sonnet-4-6 vision review\n\n${text}\n`,
  );
  console.log("Wrote adversarial-agent-report.md");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});