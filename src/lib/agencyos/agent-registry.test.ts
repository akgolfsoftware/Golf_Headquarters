/**
 * Agent-registeret (H6) — låser at AGENT_INFO dekker hele agent-flåten i
 * `src/lib/agents/`, slik at /admin/agenticos-huben og agent-detaljsiden
 * forblir sanne når nye agenter legges til.
 *
 * Slug-uttrekket leser `const …AGENT_NAME… = "…"`-konstantene fra hver
 * agentfil (det navnet agenten faktisk logger som i AgentRun). Filer uten
 * en slik konstant sjekkes på filnavn-slug (med og uten «-agent»-suffiks) —
 * samme navnepolicy som runAgent-wrappingen bruker.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import {
  AGENT_INFO,
  AGENTER_UTEN_TIDSPLAN,
  kanoniskSlug,
  agentNavnFor,
} from "./agent-registry";

const AGENTS_DIR = path.join(process.cwd(), "src/lib/agents");

/** Infrastruktur — ikke agenter (delt runner/varsling/executor/hjelpere). */
const INFRASTRUKTUR = new Set([
  "accept-plan-action.ts",
  "actions.ts",
  "agent-notify.ts",
  "agent-runner.ts",
  "canonical-json.ts",
  "notify-plan-action.ts",
  "plan-action-executor.ts",
  "plan-revision-actions.ts",
  "provenance.ts",
  "triggers.ts",
  "youtube-search.ts",
]);

function agentFiler(): string[] {
  return readdirSync(AGENTS_DIR).filter(
    (f) => f.endsWith(".ts") && !f.endsWith(".test.ts") && !INFRASTRUKTUR.has(f),
  );
}

/** AgentName-konstantene en fil logger under (kan være flere per fil). */
function agentNavnIFil(fil: string): string[] {
  const kilde = readFileSync(path.join(AGENTS_DIR, fil), "utf8");
  const navn: string[] = [];
  for (const m of kilde.matchAll(/const\s+[A-Z0-9_]*AGENT_NAME[A-Z0-9_]*\s*=\s*"([^"]+)"/g)) {
    navn.push(m[1]);
  }
  return navn;
}

const ALLE_ALIASER = Object.values(AGENT_INFO).flatMap((info) => info.aliaser ?? []);

function erRegistrert(agentName: string): boolean {
  return agentName in AGENT_INFO || ALLE_ALIASER.includes(agentName);
}

test("alle agentfiler i src/lib/agents/ har registeroppføring eller alias", () => {
  const mangler: string[] = [];
  for (const fil of agentFiler()) {
    const navn = agentNavnIFil(fil);
    if (navn.length > 0) {
      for (const n of navn) {
        if (!erRegistrert(n)) mangler.push(`${fil} → ${n}`);
      }
    } else {
      // Ingen AGENT_NAME-konstant: filnavnet er slug-policyen.
      const base = fil.replace(/\.ts$/, "");
      const kandidater = [base, base.replace(/-agent$/, "")];
      if (!kandidater.some(erRegistrert)) mangler.push(`${fil} → (${kandidater.join(" | ")})`);
    }
  }
  assert.deepEqual(mangler, [], `Uregistrerte agentnavn: ${mangler.join(", ")}`);
});

test("aliaser kolliderer ikke med hovedslugs og peker riktig via kanoniskSlug", () => {
  for (const [slug, info] of Object.entries(AGENT_INFO)) {
    for (const alias of info.aliaser ?? []) {
      assert.ok(!(alias in AGENT_INFO), `Alias «${alias}» er også hovedslug`);
      assert.equal(kanoniskSlug(alias), slug);
    }
    assert.equal(kanoniskSlug(slug), slug);
    assert.deepEqual(agentNavnFor(slug), [slug, ...(info.aliaser ?? [])]);
  }
  // Ukjente navn passerer uendret (kjøringslisten viser rå slugs).
  assert.equal(kanoniskSlug("finnes-ikke"), "finnes-ikke");
});

test("agentene uten tidsplan har registeroppføring", () => {
  for (const slug of AGENTER_UTEN_TIDSPLAN) {
    assert.ok(slug in AGENT_INFO, `AGENTER_UTEN_TIDSPLAN «${slug}» mangler i AGENT_INFO`);
  }
});
