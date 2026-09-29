/**
 * Rene regler for WANG Tester (WG-03, WANG-08, 22, 23, 37, 39).
 *
 * Testpoeng følger Team Norway-arket (tn-excel-v3). Der arket ikke har en
 * avklart skala (protokoller med `blocked`), vises resultatet som «—» — aldri
 * et tall vi har regnet ut selv.
 */
import { TN_CATALOG, TN_VERSION, type TnProtocol } from "@/lib/portal-tester/tn-catalog";
import { tnComparableResult, tnDefinitionId, tnFromDefinitionId } from "@/lib/portal-tester/tn-integration";
import { tnFormat } from "@/lib/portal-tester/tn-scoring";

import { datoKort, datoTekst, enhetFraRegel, TOM, tallTekst } from "./format";

export const NGF_KILDE = "NGF / Team Norway · Treningsprotokoll og tester for spiller v3";
export const FYS_KILDE = "WANG fysiske tester (ikke NGF)";

export type TestDefinisjonInfo = { id: string; name: string; scoringRule: string; pyramidArea: string };

/** Er testen en Team Norway-protokoll (tn-v3-*)? */
export function erNgfTest(testId: string): boolean {
  return !!tnFromDefinitionId(testId);
}

/** Kort kildelinje for en test: protokoll og versjon. */
export function protokollTekst(def: TestDefinisjonInfo): string {
  const p = tnFromDefinitionId(def.id);
  if (p) return `Team Norway v3 · ${p.source}`;
  return def.pyramidArea === "FYS" ? FYS_KILDE : def.scoringRule;
}

/**
 * Resultatet slik det skal vises. NGF-tester bruker arkets skala; blokkert
 * eller ufullstendig protokoll gir «—». Andre tester viser målt verdi med
 * enheten fra scoringsregelen.
 */
export function resultatTekst(def: TestDefinisjonInfo, score: number, details: unknown): { verdi: string; enhet: string; tall: number | null; enhetKode: string } {
  if (erNgfTest(def.id)) {
    const r = tnComparableResult(def.id, score, details);
    if (!r) return { verdi: TOM, enhet: "", tall: null, enhetKode: "" };
    const tekst = tnFormat({ value: r.score, unit: r.unit });
    return { verdi: tekst, enhet: "", tall: r.score, enhetKode: r.unit };
  }
  if (!Number.isFinite(score)) return { verdi: TOM, enhet: "", tall: null, enhetKode: "" };
  const enhet = enhetFraRegel(def.scoringRule) ?? "";
  return { verdi: tallTekst(score, 1), enhet, tall: score, enhetKode: enhet };
}

/** Endring mellom to målinger: «+2,5 kg», «−1,2 prosentpoeng» (PEI lagres som brøk). */
export function endringTekst(d: number, enhetKode: string): string {
  if (Math.abs(d) < 1e-9) return "±0";
  const fortegn = d > 0 ? "+" : "−";
  if (enhetKode === "PEI") return `${fortegn}${tallTekst(Math.abs(d) * 100, 1)} prosentpoeng`;
  return `${fortegn}${tallTekst(Math.abs(d), 1)}${enhetKode ? ` ${enhetKode}` : ""}`;
}

/** Om lavere er bedre for en test. NGF: fra arket. Andre: høyere er bedre med mindre regelen sier annet. */
export function lavereErBedre(def: TestDefinisjonInfo): boolean {
  const p = tnFromDefinitionId(def.id);
  if (p) return !p.points8Ball;
  return /lavere er bedre|snitt avstand|snitt-avstand|PEI/i.test(def.scoringRule);
}

// ---------------------------------------------------------------- WG-03

export type FysMaling = { dato: Date; score: number };
export type FysSoyle = { etikett: string; tekst: string; hoydeProsent: number; siste: boolean };
export type FysKort = {
  testId: string;
  navn: string;
  enhet: string;
  verdi: string;
  vurdering: string;
  soyler: FysSoyle[];
};

/**
 * Ett kort per fysisk test (WG-03). Sammenligning bare mot elevens egne
 * målinger — det finnes ingen normtall. Uten måling: «—».
 */
export function byggFysKort(def: TestDefinisjonInfo, malinger: FysMaling[], maksSoyler = 6): FysKort {
  const enhet = enhetFraRegel(def.scoringRule) ?? "";
  const sortert = malinger.filter((m) => Number.isFinite(m.score)).toSorted((a, b) => a.dato.getTime() - b.dato.getTime());
  const siste = sortert.at(-1);
  if (!siste) {
    return { testId: def.id, navn: def.name, enhet, verdi: TOM, vurdering: "Ingen måling ennå.", soyler: [] };
  }
  const forrige = sortert.length > 1 ? sortert[sortert.length - 2] : null;
  let vurdering: string;
  if (!forrige) vurdering = "Første måling. Sammenlignes med egne målinger fra neste test.";
  else {
    const d = siste.score - forrige.score;
    vurdering = Math.abs(d) < 1e-9
      ? `Likt med egen måling ${datoTekst(forrige.dato)}.`
      : `${d > 0 ? "+" : "−"}${tallTekst(Math.abs(d), 1)} ${enhet} siden egen måling ${datoTekst(forrige.dato)}.`.replace("  ", " ");
  }
  const vist = sortert.slice(-maksSoyler);
  const maks = Math.max(...vist.map((m) => m.score)) * 1.12;
  return {
    testId: def.id,
    navn: def.name,
    enhet,
    verdi: tallTekst(siste.score, 1),
    vurdering,
    soyler: vist.map((m, i) => ({
      etikett: datoKort(m.dato),
      tekst: tallTekst(m.score, 1),
      hoydeProsent: maks > 0 ? Math.max(0, Math.round((m.score / maks) * 100)) : 0,
      siste: i === vist.length - 1,
    })),
  };
}

// ---------------------------------------------------------------- WANG-37

export type KoStatus = "Ført" | "Mangler" | "Planlagt" | "Kontrollert";
export const KO_STATUSER: readonly KoStatus[] = ["Ført", "Mangler", "Planlagt", "Kontrollert"];

export type KoDeltakerKilde = {
  id: string;
  status: "PENDING" | "DONE" | "SKIPPED" | "ABSENT";
  elevId: string;
  testDag: { id: string; title: string; scheduledAt: Date; status: "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED"; coachNavn: string };
  test: TestDefinisjonInfo;
  resultat: { id: string; score: number; details: unknown; takenAt: Date; witnessStatus: "PENDING" | "ATTESTED" | "REJECTED"; maltAv: string | null } | null;
};

export type KoOppdragKilde = {
  id: string;
  status: "OPEN" | "COMPLETED" | "CANCELLED";
  elevId: string;
  dueDate: Date | null;
  coachNavn: string;
  test: TestDefinisjonInfo;
};

export type KoRad = {
  id: string;
  elevId: string;
  test: string;
  protokoll: string;
  dato: Date | null;
  status: KoStatus;
  verdi: string;
  meta: string;
  resultatId: string | null;
  testdagId: string | null;
  /** Utkast: NGF-protokoll uten avklart skala. Kan ikke kontrolleres. */
  utkast: boolean;
};

/**
 * Alt som gjenstår etter testdagene. Deltakere og tildelte tester blir
 * rader med én av fire statuser. Avlyste testdager og trukne tester teller ikke.
 */
export function byggTestko(deltakere: KoDeltakerKilde[], oppdrag: KoOppdragKilde[], naa: Date): KoRad[] {
  const rader: KoRad[] = [];
  for (const d of deltakere) {
    if (d.testDag.status === "CANCELLED") continue;
    const prot = protokollTekst(d.test);
    if (d.resultat) {
      const vis = resultatTekst(d.test, d.resultat.score, d.resultat.details);
      const kontrollert = d.resultat.witnessStatus === "ATTESTED";
      const utkast = erNgfTest(d.test.id) && vis.tall === null;
      rader.push({
        id: `d-${d.id}`, elevId: d.elevId, test: d.test.name, protokoll: prot, dato: d.resultat.takenAt,
        status: kontrollert ? "Kontrollert" : "Ført",
        verdi: vis.enhet ? `${vis.verdi} ${vis.enhet}` : vis.verdi,
        meta: utkast && !kontrollert
          ? `Uavklart i NGF-arket · vises bare som utkast · ført av ${d.resultat.maltAv ?? TOM}`
          : `Målt av ${d.resultat.maltAv ?? TOM}`,
        resultatId: d.resultat.id, testdagId: d.testDag.id, utkast,
      });
      continue;
    }
    const fremtid = d.testDag.scheduledAt.getTime() >= naa.getTime();
    if (d.status === "PENDING" && fremtid) {
      rader.push({ id: `d-${d.id}`, elevId: d.elevId, test: d.test.name, protokoll: prot, dato: d.testDag.scheduledAt, status: "Planlagt", verdi: "", meta: `Måles av ${d.testDag.coachNavn} · ${d.testDag.title}`, resultatId: null, testdagId: d.testDag.id, utkast: false });
      continue;
    }
    const grunn = d.status === "ABSENT" ? "Fravær" : d.status === "SKIPPED" ? "Hoppet over" : "Ikke testet";
    rader.push({ id: `d-${d.id}`, elevId: d.elevId, test: d.test.name, protokoll: prot, dato: d.testDag.scheduledAt, status: "Mangler", verdi: "", meta: `${grunn} · ${d.testDag.title}`, resultatId: null, testdagId: d.testDag.id, utkast: false });
  }
  for (const o of oppdrag) {
    if (o.status !== "OPEN") continue;
    const prot = protokollTekst(o.test);
    const passert = o.dueDate !== null && o.dueDate.getTime() < naa.getTime();
    rader.push({
      id: `o-${o.id}`, elevId: o.elevId, test: o.test.name, protokoll: prot, dato: o.dueDate,
      status: passert ? "Mangler" : "Planlagt", verdi: "",
      meta: passert ? `Ikke testet · frist passert · tildelt av ${o.coachNavn}` : `Tildelt av ${o.coachNavn}${o.dueDate ? "" : " · uten frist"}`,
      resultatId: null, testdagId: null, utkast: false,
    });
  }
  const rekke = (s: KoStatus) => KO_STATUSER.indexOf(s);
  return rader.toSorted((a, b) => rekke(a.status) - rekke(b.status) || (a.dato?.getTime() ?? Infinity) - (b.dato?.getTime() ?? Infinity));
}

/** Tellerne øverst i testkøen. «Planlagt» teller bare de neste fire ukene. */
export function testkoTellere(rader: KoRad[], naa: Date): { ikkeKontrollert: number; mangler: number; planlagtFireUker: number } {
  const grense = naa.getTime() + 28 * 86_400_000;
  return {
    ikkeKontrollert: rader.filter((r) => r.status === "Ført").length,
    mangler: rader.filter((r) => r.status === "Mangler").length,
    planlagtFireUker: rader.filter((r) => r.status === "Planlagt" && r.dato !== null && r.dato.getTime() <= grense).length,
  };
}

// ---------------------------------------------------------------- WANG-22

export type ProtokollRad = {
  id: string;
  navn: string;
  kategori: "NGF" | "Fysisk";
  eier: string;
  versjon: string;
  status: "Låst" | "Uavklart";
  forsok: number | null;
  kilde: string;
  uavklart: string | null;
};

/** Team Norway-protokollene (låst versjon v3). `blocked` = poengskala ikke avklart. */
export function ngfProtokoller(): ProtokollRad[] {
  return TN_CATALOG.map((p: TnProtocol) => ({
    id: tnDefinitionId(p),
    navn: p.name,
    kategori: "NGF" as const,
    eier: "NGF / Team Norway",
    versjon: TN_VERSION,
    status: p.blocked ? ("Uavklart" as const) : ("Låst" as const),
    forsok: p.variableCount ? null : p.rows.length,
    kilde: p.source,
    uavklart: p.blocked ?? null,
  }));
}

export function fysProtokoll(def: TestDefinisjonInfo): ProtokollRad {
  return { id: def.id, navn: def.name, kategori: "Fysisk", eier: "WANG", versjon: "—", status: "Låst", forsok: null, kilde: def.scoringRule, uavklart: null };
}

// ---------------------------------------------------------------- WANG-39

export type RangInn = { elevId: string; navn: string; klasse: string | null; verdi: number | null; tekst: string; kilde: string };
export type RangRad = RangInn & { nr: number | null };

/** Med måling først, sortert etter retning. Uten måling til slutt, uten nummer. */
export function rangér(rader: RangInn[], lavestFørst: boolean): RangRad[] {
  const med = rader.filter((r) => r.verdi !== null).toSorted((a, b) => (lavestFørst ? a.verdi! - b.verdi! : b.verdi! - a.verdi!) || a.navn.localeCompare(b.navn, "nb"));
  const uten = rader.filter((r) => r.verdi === null).toSorted((a, b) => a.navn.localeCompare(b.navn, "nb"));
  return [...med.map((r, i) => ({ ...r, nr: i + 1 })), ...uten.map((r) => ({ ...r, nr: null }))];
}
