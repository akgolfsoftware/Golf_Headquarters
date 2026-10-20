/**
 * PH-14 Tester-oversikt i designløftet 20.10.2026: testbatteriet (19 tester i Golfslag, Teknikk og Fysisk)
 * formet til skjermen. Ren funksjon, ingen Prisma. Bare målte tall: mangler noe, blir det null, og
 * skjermen viser «—». Listen kommer fra testbatteri.ts (én felles liste for alle flater).
 */
import { BATTERI_DELER, PRIORITERTE, TESTBATTERI, batteritestFor, fremdrift, trenerKanFore, type BatteriDel, type Batteritest } from "./testbatteri";
import type { TestRow } from "./tester-data";

export type BatteriRad = {
  id: string;
  navn: string;
  del: BatteriDel;
  minst: number | null;
  /** Antall ganger testen er tatt (alle varianter samlet). */
  antall: number;
  /** «1 av 2» for prioriterte tester. */
  fremdrift: string | null;
  /** Siste resultat formatert med enhet, null når testen ikke er tatt. */
  vis: string | null;
  dato: string | null;
  /** true = trener førte (Kontrollert), false = spilleren selv (Egenført), null = ikke tatt. */
  kontrollert: boolean | null;
  endring: { tekst: string; tone: "pos" | "neg" | "flat" } | null;
  historikk: number[];
  lavereErBedre: boolean;
  /** Siste resultat (detalj) når testen er tatt, ellers null. */
  resultatHref: string | null;
  startHref: string;
  trenerKanFore: boolean;
};

export type BatteriDelData = { del: BatteriDel; rader: BatteriRad[]; tatt: number };

export type BatteriData = {
  deler: BatteriDelData[];
  totalt: number;
  tatt: number;
  prioriterte: { id: string; navn: string; antall: number; minst: number; ok: boolean }[];
  prioriterteOk: number;
};

const KORT = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "2-digit", month: "2-digit" });

function startFor(t: Batteritest): string {
  const p = t.protokoller[0];
  return p ? `/portal/tren/tester/team-norway?test=${p}` : "/portal/tren/tester/ny";
}

export function byggBatteri(rader: readonly TestRow[]): BatteriData {
  const perTest = new Map<string, TestRow[]>();
  for (const r of rader) {
    const b = batteritestFor({ id: r.id, name: r.name });
    if (!b) continue;
    perTest.set(b.id, [...(perTest.get(b.id) ?? []), r]);
  }

  const ut: BatteriRad[] = TESTBATTERI.map((b) => {
    const rs = perTest.get(b.id) ?? [];
    const antall = rs.reduce((s, r) => s + r.attempts, 0);
    const siste = rs
      .filter((r) => r.attempts > 0 && r.latestAt)
      .sort((a, c) => new Date(c.latestAt!).getTime() - new Date(a.latestAt!).getTime())[0];
    return {
      id: b.id,
      navn: b.navn,
      del: b.del,
      minst: b.minst,
      antall,
      fremdrift: b.minst == null ? null : fremdrift(b, antall),
      vis: siste?.latest ?? null,
      dato: siste?.latestAt ? KORT.format(new Date(siste.latestAt)) : null,
      kontrollert: siste ? siste.latestKontrollert ?? null : null,
      endring: siste?.delta ? { tekst: siste.delta.text, tone: siste.delta.tone } : null,
      historikk: siste ? siste.history : [],
      lavereErBedre: siste?.lowerIsBetter ?? false,
      resultatHref: siste ? siste.href : null,
      startHref: startFor(b),
      trenerKanFore: trenerKanFore({ batteriId: b.id }),
    };
  });

  const deler = BATTERI_DELER.map((del) => {
    const rs = ut.filter((r) => r.del === del);
    return { del, rader: rs, tatt: rs.filter((r) => r.antall > 0).length };
  });

  const prioriterte = PRIORITERTE.map((b) => {
    const r = ut.find((x) => x.id === b.id)!;
    return { id: b.id, navn: b.navn, antall: r.antall, minst: b.minst!, ok: r.antall >= b.minst! };
  });

  return {
    deler,
    totalt: ut.length,
    tatt: ut.filter((r) => r.antall > 0).length,
    prioriterte,
    prioriterteOk: prioriterte.filter((p) => p.ok).length,
  };
}
