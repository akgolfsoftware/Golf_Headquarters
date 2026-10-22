/**
 * Testøkt uten testdag i Team Norway (utkast 3, Anders 22.10.2026): treneren velger én spiller og flere tester
 * og kjører dem i ett løp. Her bor utvalget og løpets adresse, uten database, så det kan testes for seg.
 *
 * Løpet står i adressen som `t=protokoll:økt-id,protokoll:økt-id` og `steg=n`. Økt-ID-en lages når løpet
 * startes, så en test som åpnes på nytt (pause, mistet nett, lukket fane) fortsetter samme utkast på telefonen.
 */
import { TN_CATALOG, type TnProtocol } from "./tn-catalog";
import { PRIORITERTE, TESTBATTERI, trenerKanFore, type Batteritest } from "./testbatteri";

export type TestoktValg = { protokollId: string; navn: string; slag: number; merknad: string | null };
export type TestoktUtvalg = {
  /** Prioriterte tester treneren kan føre, som mangler forsøk mot minsteantallet. Står først. */
  mangler: TestoktValg[];
  teknikk: TestoktValg[];
  golfslag: TestoktValg[];
  /** Batteritester spilleren fører selv i PlayerHQ (vises grå). */
  spillerForer: string[];
};

const batteriFor = (p: TnProtocol): Batteritest | undefined => TESTBATTERI.find((t) => t.protokoller.includes(p.id));

/** `antallTatt` er antall tatte forsøk per batteritest-ID. `kanVises` sier om testskjermen har feltene protokollen trenger. */
export function testoktUtvalg(antallTatt: ReadonlyMap<string, number>, kanVises: (p: TnProtocol) => boolean): TestoktUtvalg {
  const ut: TestoktUtvalg = { mangler: [], teknikk: [], golfslag: [], spillerForer: [] };
  for (const p of TN_CATALOG) {
    const b = batteriFor(p);
    if (!b || p.blocked || !trenerKanFore({ protokollId: p.id }) || !kanVises(p)) continue;
    const tatt = antallTatt.get(b.id) ?? 0;
    const prioritertMangler = b.minst != null && tatt < b.minst;
    const valg: TestoktValg = { protokollId: p.id, navn: p.name, slag: p.rows.length, merknad: prioritertMangler ? `${tatt} av ${b.minst}` : null };
    if (prioritertMangler) ut.mangler.push(valg);
    else if (b.del === "Teknikk") ut.teknikk.push(valg);
    else ut.golfslag.push(valg);
  }
  // Rekkefølgen i de prioriterte følger batteriet.
  ut.mangler.sort((a, b) => PRIORITERTE.findIndex((t) => t.protokoller.includes(a.protokollId)) - PRIORITERTE.findIndex((t) => t.protokoller.includes(b.protokollId)));
  ut.spillerForer = TESTBATTERI.filter((t) => !trenerKanFore({ batteriId: t.id })).map((t) => t.navn);
  return ut;
}

export type TestoktSteg = { protokollId: string; sessionId: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Løpet fra adressen. Ukjente tester, tester treneren ikke kan føre og ugyldige økt-ID-er gir null. */
export function lesTestokt(t: string | undefined): TestoktSteg[] | null {
  if (!t) return null;
  const steg = t.split(",").map((del) => {
    const [protokollId, sessionId] = del.split(":");
    return { protokollId: protokollId ?? "", sessionId: sessionId ?? "" };
  });
  if (!steg.length || steg.length > 12) return null;
  const gyldig = steg.every((s) => UUID.test(s.sessionId) && TN_CATALOG.some((p) => p.id === s.protokollId) && trenerKanFore({ protokollId: s.protokollId }));
  return gyldig && new Set(steg.map((s) => s.sessionId)).size === steg.length ? steg : null;
}

export function skrivTestokt(steg: TestoktSteg[]): string {
  return steg.map((s) => `${s.protokollId}:${s.sessionId}`).join(",");
}
