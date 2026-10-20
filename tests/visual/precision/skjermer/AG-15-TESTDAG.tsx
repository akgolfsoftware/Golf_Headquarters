/** Prøvefil for AG-15 Planlegg testdag, testdagen og Registrer test. Syntetiske data, ingen ekte spillere. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG15Planlegg, AG15TestdagVis } from "@/components/admin/precision/AG15Testdag";
import { AG15Registrer } from "@/components/admin/precision/AG15Registrer";
import { tnProtocol } from "@/lib/portal-tester/tn-catalog";
import { TESTBATTERI, trenerKanFore } from "@/lib/portal-tester/testbatteri";
import type { RegistreringData, StasjonsTest, TestdagVisning } from "@/lib/admin/tester/testdag-data";

export const sti = "/admin/tester/testdag";

const Skall = (c: React.ReactNode) => <AdminRolleProvider erAdmin><AgencyOSSkall navn="Test Coach">{c}</AgencyOSSkall></AdminRolleProvider>;

const tester: StasjonsTest[] = TESTBATTERI.flatMap((b) => b.protokoller.flatMap((id) => {
  const p = tnProtocol(id);
  return p && !p.blocked && trenerKanFore({ protokollId: id }) ? [{ protokollId: id, navn: b.protokoller.length > 1 ? p.name : b.navn, del: b.del, slag: p.rows.length }] : [];
}));
const grupper = [{ id: "g1", navn: "GFGK Junior Utvikling", antall: 8 }, { id: "g2", navn: "Junior Academy med et ganske langt gruppenavn", antall: 12 }];

const spillere = ["Henrik Aas", "Emma Berg", "Mats Lie", "Ida Strand"];
const vis: TestdagVisning = {
  id: "e1", tittel: "Testdag · GFGK Junior Utvikling", sted: "Mulligan", dato: "torsdag 29. oktober", klokke: "16:00", gruppe: "GFGK Junior Utvikling",
  stasjoner: ["Nærspill Gate", "Putt Gate", "Wedge Variation"].map((navn, s) => ({
    id: `s${s}`, navn, status: "ACTIVE",
    deltakere: spillere.map((spiller, i) => ({ id: `d${s}${i}`, spiller, status: i < s ? "DONE" as const : "PENDING" as const, resultat: i < s ? "24 / 36 p" : null })),
  })),
};

const gate = tnProtocol("naerspill-gate")!;
const reg: RegistreringData = {
  deltakerId: "d00", spiller: "Henrik Aas", status: "PENDING", protokoll: gate,
  testdag: { eventId: "e1", stasjonId: "s0", tittel: "Nærspill Gate", aktiv: true },
  utkast: { revision: 2, values: { "1": { ok: "I sonen" }, "2": { ok: "Gjennom porten" }, "3": { ok: "Bom" }, "4": { ok: "I sonen" } }, notes: "" },
  resultat: null,
  andre: spillere.map((spiller, i) => ({ id: `d0${i}`, spiller, status: i === 3 ? "DONE" : "PENDING" })),
  nesteId: "d01",
};

export const tilstander = {
  data: Skall(<AG15Planlegg grupper={grupper} tester={tester} idag="2026-10-20" />),
  tom: Skall(<AG15Planlegg grupper={[]} tester={tester} idag="2026-10-20" />),
  testdag: Skall(<AG15TestdagVis d={vis} />),
  registrer: Skall(<AG15Registrer d={reg} />),
  ferdig: Skall(<AG15Registrer d={{ ...reg, status: "DONE", resultat: "21 / 36 p", utkast: null }} />),
};
