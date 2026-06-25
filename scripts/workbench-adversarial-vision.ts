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

/** Alle gate-screenshots med nærmeste design-referanse (15 par). */
const ALL_PAIRS: { design: string; impl: string; label: string }[] = [
  { design: "wb-00-komplett-tek.png", impl: "player-430-tek.png", label: "Tek mobil spiller" },
  { design: "wb-00-komplett-tek.png", impl: "coach-1280-tek.png", label: "Tek desktop coach" },
  { design: "wb-06-seson.png", impl: "player-430-seson.png", label: "Sesongmål mobil spiller" },
  { design: "wb-06-seson.png", impl: "coach-1280-seson.png", label: "Sesongmål desktop coach" },
  { design: "wb-07-maler.png", impl: "player-430-maler.png", label: "Maler mobil spiller" },
  { design: "wb-07-maler.png", impl: "coach-1280-maler.png", label: "Maler desktop coach" },
  { design: "wb-11-standardokt.png", impl: "player-430-std.png", label: "Std mobil spiller" },
  { design: "wb-11-standardokt.png", impl: "coach-1280-std.png", label: "Std desktop coach" },
  { design: "wb-08-gantt.png", impl: "player-430-gantt.png", label: "Gantt mobil spiller" },
  { design: "wb-08-gantt.png", impl: "coach-1280-gantt.png", label: "Gantt desktop coach" },
  { design: "wb-09-uke.png", impl: "player-430-uke.png", label: "Uke mobil spiller" },
  { design: "wb-09-uke.png", impl: "player-1280-uke.png", label: "Uke desktop spiller" },
  { design: "wb-09-uke.png", impl: "coach-1280-uke.png", label: "Uke desktop coach" },
  { design: "wb-10-okt.png", impl: "player-430-okt.png", label: "Økt mobil spiller" },
  { design: "wb-10-okt.png", impl: "coach-1280-okt.png", label: "Økt desktop coach" },
];

const BATCH_SIZE = 3;

const EXCEPTIONS_TEXT = `ALLTID IGNORER (dokumenterte unntak — teller IKKE som avvik):
- Font-pipeline-bredde/wrap, demo-tekstinnhold, konkrete tall/navn fra seed-DB
- 7 hub-faner (Teknisk plan · Sesongmål · Maler · Standardøkter · Gantt · Uke · Økt) erstatter fasit zoom-only topbar
- Mobil zoom-rail OG desktop zoom-switcher (Årsplan/År/Måned/Uke/Dag) under/over hub-rail
- KPI-strip + InsightsStripe på Gantt/Uke/Økt — bevisst data-tetthet
- Above-panel hero (eyebrow + h1 + lead) over mørkt panel på desktop
- Uke time-grid med vertikal time-akse (07–22), side-lanes ved overlapp, ikke fasit kolonne-only
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
- Mobil action-topbar (WORKBENCH + ikon-handlinger) — net-new touch-chrome
- Maler filterchips inaktiv: cardBg på mørk panel vs. fasit transparent på lys demo
- HCP-label i workbench topbar: v1 utelatt
- Uke dag-header typografi på time-grid: del av vertikal time-akse-layout
- Mal-kategori-chip viser L-fase (GRUNN/SPES/TURN), ikke drill-kategori-farger fra desktop-demo
- Coach vs. spiller chrome-forskjeller (spiller-velger, REDIGER, palette)
- Std spiller: ingen «+ Ny standardøkt» / «Rediger» — kun «Legg i plan»
- Økt v1 inline: COACH-NOTAT/SG-KOBLING fra wb-10 mangler til notat/SG er seedet; coach har redigeringspanel
- Gantt v1: L-fase-bånd + fokusområde-rad-grid (Nærspill/Putting/Utslag/Innspill/FYS/Turneringer) avledet fra periodBlocks/default — ikke piksel-paritet med wb-08-demo-blokklengder
- Økt mobil: «Tilbake til uke» i OktDetailTab øverst; KPI-strip skjules på Økt-fane så back-lenke er synlig
- Hub-rail mobil compact (Tek/Mål/Mal/Std/Gantt/Uke/Økt): alle 7 faner tilgjengelige`;

function imagePayload(file: string): { data: string; media_type: "image/png" | "image/jpeg" | "image/gif" | "image/webp" } {
  const buf = readFileSync(file);
  let media_type: "image/png" | "image/jpeg" | "image/gif" | "image/webp" = "image/png";
  if (buf[0] === 0xff && buf[1] === 0xd8) media_type = "image/jpeg";
  else if (buf[0] === 0x89 && buf[1] === 0x50) media_type = "image/png";
  else if (buf[0] === 0x47 && buf[1] === 0x49) media_type = "image/gif";
  else if (buf.slice(0, 4).toString("ascii") === "RIFF") media_type = "image/webp";
  return { data: buf.toString("base64"), media_type };
}

function buildBlocks(pairs: typeof ALL_PAIRS): Anthropic.MessageCreateParams["messages"][0]["content"] {
  const blocks: Anthropic.MessageCreateParams["messages"][0]["content"] = [
    {
      type: "text",
      text: `Du er adversarial design-diff-agent for AK Golf Workbench lansering (25. juni 2026).
Sammenlign design-handover (fasit) med implementasjonsscreenshot per par.
List KUN reelle UDOKUMENTERTE avvik som bryter brukerflyt eller mangler hele seksjoner/moduler.
Vær KONSERVATIV: typografi-hierarki, chip-farger på mørk vs. lys flate, responsiv kolonneantall, og seed-datoer er IKKE avvik.

${EXCEPTIONS_TEXT}

Svar på norsk. Avslutt med linjen: VERDICT: N undocumented deviations (N=0 hvis alle funn er dekket av unntakene over).`,
    },
  ];
  for (const pair of pairs) {
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
  return blocks;
}

function parseVerdict(text: string): number {
  const m = text.match(/VERDICT:\s*(\d+)\s+undocumented/i);
  return m ? Number(m[1]) : -1;
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
  const sections: string[] = [];
  let totalUndocumented = 0;
  let batchNum = 0;

  for (let i = 0; i < ALL_PAIRS.length; i += BATCH_SIZE) {
    batchNum += 1;
    const batch = ALL_PAIRS.slice(i, i + BATCH_SIZE);
    const blocks = buildBlocks(batch);
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
    const n = parseVerdict(text);
    if (n < 0) {
      console.error(`Batch ${batchNum}: mangler VERDICT`);
      process.exit(1);
    }
    totalUndocumented += n;
    sections.push(`## Batch ${batchNum} (${batch.map((p) => p.label).join(", ")})\n\n${text}`);
    console.log(`Batch ${batchNum}: ${n} undocumented`);
  }

  const report = `# ADVERSARIAL_AGENT: claude-sonnet-4-6 vision review

**Screenshots reviewed:** ${ALL_PAIRS.length} par (alle gate-faner spiller 430 + coach 1280)

${sections.join("\n\n---\n\n")}

---

## Samlet verdict

VERDICT: ${totalUndocumented} undocumented deviations
`;
  writeFileSync(path.join(OUT, "adversarial-agent-report.md"), report);
  console.log(`Wrote adversarial-agent-report.md (total=${totalUndocumented})`);
  if (totalUndocumented !== 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});