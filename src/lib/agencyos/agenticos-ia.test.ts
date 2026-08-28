import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  AGENTICOS_NAV,
  AGENTICOS_RUNTIMES,
  AGENTICOS_SKILLS,
  agenticosNavAktiv,
  agenticosNaTekst,
  areaForAgent,
  godkjennMerkeFor,
  selskapTilArea,
} from "./agenticos-ia";
import { AGENTICOS_FORBYR_OK_GRONN } from "@/lib/domain/agenticos/godkjenningspolicy";

describe("agenticos-ia · AO-00 rail", () => {
  it("har de seks destinasjonene i fasit-rekkefølge", () => {
    assert.deepEqual(
      AGENTICOS_NAV.map((t) => t.id),
      ["cockpit", "ko", "godkjenn", "projects", "runtimes", "skills"],
    );
  });

  it("mapper stier til aktiv fane", () => {
    assert.equal(agenticosNavAktiv("/admin/agenticos"), "cockpit");
    assert.equal(agenticosNavAktiv("/admin/agenticos/ko"), "ko");
    assert.equal(agenticosNavAktiv("/admin/agenticos/godkjenn?sak=x"), "godkjenn");
    assert.equal(agenticosNavAktiv("/admin/agenticos/skills"), "skills");
  });
});

describe("agenticos-ia · AO-09 skills", () => {
  it("e-post og publisering er av", () => {
    const epost = AGENTICOS_SKILLS.find((s) => s.id === "sende-epost");
    const pub = AGENTICOS_SKILLS.find((s) => s.id === "publisere-okter");
    assert.equal(epost?.paa, false);
    assert.equal(epost?.las, true);
    assert.equal(pub?.paa, false);
    assert.equal(pub?.las, true);
  });

  it("lese og foreslå er på — via kø, ikke direkte Workbench", () => {
    const foresla = AGENTICOS_SKILLS.find((s) => s.id === "foresla-okter");
    assert.equal(foresla?.paa, true);
    assert.match(foresla?.meta ?? "", /aldri direkte til Workbench/);
  });
});

describe("agenticos-ia · areas og merker", () => {
  it("mapper kjente agenter til Area", () => {
    assert.equal(areaForAgent("round-agent"), "AKADEMI");
    assert.equal(areaForAgent("social-media"), "INNHOLD");
    assert.equal(areaForAgent("booking-optimizer"), "DRIFT");
    assert.equal(areaForAgent("tripletex-lonn-sjekkliste"), "OKONOMI");
    assert.equal(areaForAgent("ai-code-reviewer"), "PRODUKT");
  });

  it("plan-skriv merkes som skriver til plan", () => {
    assert.equal(godkjennMerkeFor("WEEKLY_PROPOSAL"), "plan");
    assert.equal(godkjennMerkeFor("SOCIAL_POST"), "utkast");
  });

  it("selskap-navn lander i riktig area", () => {
    assert.equal(selskapTilArea("Mulligan"), "DRIFT");
    assert.equal(selskapTilArea("AK Golf"), "AKADEMI");
  });
});

describe("agenticos-ia · B1 ok-grønn", () => {
  it("policyen forbyr ok-grønn", () => {
    assert.equal(AGENTICOS_FORBYR_OK_GRONN, true);
  });

  it("runtimes bruker hvit prikk, ikke ok-grønn som «på»", () => {
    assert.ok(AGENTICOS_RUNTIMES.some((r) => r.koblet));
    assert.ok(AGENTICOS_RUNTIMES.some((r) => !r.koblet));
  });
});

describe("agenticos-ia · klokke", () => {
  it("na-tekst har punktum i klokkeslett", () => {
    const t = agenticosNaTekst(new Date("2026-08-24T07:42:00Z"));
    assert.match(t, / · \d{2}\.\d{2}$/);
  });
});

describe("agenticos visuell · ingen ok-grønn i komponentene", () => {
  it("T12-mappa bruker ikke TL.ok eller #30D158", () => {
    const rot = join(process.cwd(), "src/components/admin/v2/agenticos");
    const filer: string[] = [];
    const walk = (d: string) => {
      for (const n of readdirSync(d)) {
        const p = join(d, n);
        if (statSync(p).isDirectory()) walk(p);
        else if (p.endsWith(".tsx") || p.endsWith(".ts")) filer.push(p);
      }
    };
    walk(rot);
    const treff: string[] = [];
    for (const f of filer) {
      const k = readFileSync(f, "utf8");
      if (k.includes("TL.ok") || k.includes("#30D158") || k.includes("#34C759")) treff.push(f);
    }
    assert.deepEqual(treff, []);
  });
});
