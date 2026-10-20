/**
 * Tester-oversikten i AgencyOS (AG-15, designløftet 20.10.2026): spillere mot de 19
 * testene i batteriet. Ren funksjon: ingen Prisma, ingen React, så status per celle,
 * dekning og «til kontroll» kan låses med test.
 *
 * Status per celle (canvaset «AgencyOS nøkkelskjermer», tavla Tester):
 *   K  kontrollert: ført av trener eller coach, eller merket kontrollert (witnessStatus ATTESTED)
 *   E  egenført av spilleren og ikke kontrollert ennå
 *   G  siste gyldige test er eldre enn seks uker
 *   M  mangler
 * En test teller bare når alle slag er registrert; det er bare da et TestResult finnes.
 */
import { BATTERI_DELER, PRIORITERTE, TESTBATTERI, batteritestFor, fremdrift, type BatteriDel } from "@/lib/portal-tester/testbatteri";

export const SEKS_UKER_MS = 42 * 86_400_000;

export type CelleStatus = "K" | "E" | "G" | "M";

export type OversiktResultat = {
  id: string;
  userId: string;
  takenAt: Date;
  test: { id: string; name: string };
  recordedById: string | null;
  witnessStatus: "PENDING" | "ATTESTED" | "REJECTED";
  /** Resultatet slik det vises («7 / 10 OK», «PEI 3,1 %»). */
  visning: string;
};

export type OversiktSpiller = { id: string; navn: string };

export type OversiktCelle = { status: CelleStatus; tekst: string; aria: string };

export type OversiktRad = {
  id: string;
  navn: string;
  celler: OversiktCelle[];
  /** Tester med gyldig resultat siste seks uker. */
  tatt: number;
  /** Batteritester uten gyldig resultat siste seks uker, i batteriets rekkefølge. */
  mangler: string[];
  /** Prioriterte tester under minstekravet, f.eks. «Inspill Basic 1 av 2». */
  underMinste: string[];
  prioritertOppfylt: boolean;
};

export type TilKontroll = { id: string; spillerId: string; spillerNavn: string; test: string; dato: string; resultat: string };

export type TesterOversiktData = {
  rader: OversiktRad[];
  tall: { tatt: number; mulig: number; dekning: number | null; prioritertOppfylt: number; spillere: number; kontrollert: number; egenfort: number; eldre: number; mangler: number };
  tilKontroll: TilKontroll[];
};

const kontrollert = (r: OversiktResultat) => !!r.recordedById || r.witnessStatus === "ATTESTED";

/** «14.10» i Oslo-tid. */
export function kortDato(d: Date): string {
  return new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit", timeZone: "Europe/Oslo" }).format(d).replace(/\.$/, "");
}

export function byggTesterOversikt(spillere: OversiktSpiller[], resultater: OversiktResultat[], now: Date): TesterOversiktData {
  const grense = now.getTime() - SEKS_UKER_MS;
  const navn = new Map(spillere.map((s) => [s.id, s.navn] as const));
  // Nyeste først, så første treff per (spiller, test) er siste resultat.
  const sortert = [...resultater].filter((r) => navn.has(r.userId)).sort((a, b) => b.takenAt.getTime() - a.takenAt.getTime());
  const perSpiller = new Map<string, Map<string, OversiktResultat[]>>();
  for (const r of sortert) {
    const b = batteritestFor(r.test);
    if (!b) continue;
    const m = perSpiller.get(r.userId) ?? new Map<string, OversiktResultat[]>();
    m.set(b.id, [...(m.get(b.id) ?? []), r]);
    perSpiller.set(r.userId, m);
  }

  const tall = { tatt: 0, mulig: spillere.length * TESTBATTERI.length, dekning: null as number | null, prioritertOppfylt: 0, spillere: spillere.length, kontrollert: 0, egenfort: 0, eldre: 0, mangler: 0 };
  const rader: OversiktRad[] = spillere.map((s) => {
    const m = perSpiller.get(s.id) ?? new Map<string, OversiktResultat[]>();
    const celler = TESTBATTERI.map((t): OversiktCelle => {
      const alle = m.get(t.id) ?? [];
      const siste = alle[0];
      const status: CelleStatus = !siste ? "M" : siste.takenAt.getTime() < grense ? "G" : kontrollert(siste) ? "K" : "E";
      const nylige = alle.filter((r) => r.takenAt.getTime() >= grense).length;
      const tekst = !siste ? "—" : fremdrift(t, nylige) ?? kortDato(siste.takenAt);
      const ord = { K: "kontrollert", E: "egenført", G: "eldre enn seks uker", M: "mangler" }[status];
      return { status, tekst, aria: `${t.navn}: ${siste ? `${ord}, ${siste.visning}, ${kortDato(siste.takenAt)}` : "mangler"}${t.minst != null ? `, ${fremdrift(t, nylige)}` : ""}` };
    });
    celler.forEach((c) => {
      if (c.status === "K") tall.kontrollert++;
      else if (c.status === "E") tall.egenfort++;
      else if (c.status === "G") tall.eldre++;
      else tall.mangler++;
    });
    const tatt = celler.filter((c) => c.status === "K" || c.status === "E").length;
    const underMinste = PRIORITERTE.flatMap((t) => {
      const n = (m.get(t.id) ?? []).filter((r) => r.takenAt.getTime() >= grense).length;
      return n < t.minst! ? [`${t.navn} ${fremdrift(t, n)}`] : [];
    });
    const prioritertOppfylt = underMinste.length === 0;
    if (prioritertOppfylt) tall.prioritertOppfylt++;
    tall.tatt += tatt;
    return {
      id: s.id, navn: s.navn, celler, tatt, underMinste, prioritertOppfylt,
      mangler: TESTBATTERI.filter((_, i) => celler[i].status === "M" || celler[i].status === "G").map((t) => t.navn),
    };
  });
  tall.dekning = tall.mulig ? Math.round((100 * tall.tatt) / tall.mulig) : null;

  const tilKontroll = sortert
    .filter((r) => !r.recordedById && r.witnessStatus === "PENDING" && r.takenAt.getTime() >= grense && batteritestFor(r.test))
    .map((r) => ({ id: r.id, spillerId: r.userId, spillerNavn: navn.get(r.userId)!, test: batteritestFor(r.test)!.navn, dato: kortDato(r.takenAt), resultat: r.visning }));

  return { rader, tall, tilKontroll };
}

/** Spillerne som mangler flest tester, flest først. */
export function manglerFlest(rader: OversiktRad[], antall = 3): OversiktRad[] {
  return [...rader].filter((r) => r.mangler.length > 0).sort((a, b) => b.mangler.length - a.mangler.length || a.navn.localeCompare(b.navn, "nb")).slice(0, antall);
}

/** Antall tester per del, i batteriets rekkefølge (8 · 6 · 5). */
export const DEL_ANTALL: readonly [BatteriDel, number][] = BATTERI_DELER.map((d) => [d, TESTBATTERI.filter((t) => t.del === d).length]);
