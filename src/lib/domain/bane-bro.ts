/**
 * Bro `CourseDefinition` → `Bane` — navnematching (ren, uten prisma).
 *
 * `Round` peker på `CourseDefinition` (navn, par, slope), mens all
 * banegeometri (hull, tee/green-GPS, kart) henger på `Bane`. Koblingen er
 * `CourseDefinition.baneId`, og den ble aldri satt av kode — derfor sto
 * gameplan-spredning per hull tom og runde-føringen manglet hull-lengder.
 * AP0.4 i docs/plan-baneguide-sg-app-2026-08-16.md.
 *
 * REGEL: aldri gjett. Normaliserte navn er ikke unike (verken `Bane.navn`
 * eller `CourseDefinition.name` har unik-constraint), så to baner KAN
 * normalisere likt. Da returneres «flertydig» og ingen bro settes — en feil
 * bro ville sendt spilleren til feil banekart, noe som er verre enn ingen bro.
 */

export type BaneKandidat = {
  id: string;
  navn: string;
  kortNavn: string | null;
  klubb: string;
};

export type BaneTreff =
  | { status: "treff"; baneId: string }
  | { status: "ingen" }
  | { status: "flertydig"; antall: number };

/**
 * «Onsøy Golfklubb» / «Onsøy GK» / «Onsøy golfbane» → «onsøy».
 * Beholder æ/ø/å — norske banenavn skiller på dem.
 */
export function normaliserBanenavn(navn: string): string {
  return navn
    .toLowerCase()
    .replace(/golfklubb|golfbane|golfpark|golfsenter|\bgk\b/g, "")
    .replace(/[^a-zæøå0-9]+/g, " ")
    .trim();
}

/**
 * Finn entydig bane for et banenavn. Hver bane bidrar med opptil tre nøkler
 * (navn, kortnavn, klubb) — alle peker på samme id, så en bane blir aldri
 * flertydig med seg selv.
 */
export function velgEntydigBane(navn: string, baner: BaneKandidat[]): BaneTreff {
  const nokkel = normaliserBanenavn(navn);
  if (!nokkel) return { status: "ingen" };

  const indeks = new Map<string, Set<string>>();
  for (const bane of baner) {
    for (const kandidat of [bane.navn, bane.kortNavn, bane.klubb]) {
      if (!kandidat) continue;
      const k = normaliserBanenavn(kandidat);
      if (!k) continue;
      const sett = indeks.get(k) ?? new Set<string>();
      sett.add(bane.id);
      indeks.set(k, sett);
    }
  }

  const treff = indeks.get(nokkel);
  if (!treff || treff.size === 0) return { status: "ingen" };
  if (treff.size > 1) return { status: "flertydig", antall: treff.size };
  return { status: "treff", baneId: [...treff][0] };
}
