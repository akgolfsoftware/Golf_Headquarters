/**
 * Prøver låsen i alle_norske_sok() og alle_norske_profil() slik Supabase-klienten på teamnorwayref
 * kaller dem (rollen anon), og sammenligner fem kontrollspillere med den åpne profilsiden i HQ
 * (ryddProfilResultater). Alt skjer i én transaksjon som rulles tilbake. Med --med-oppretting kjøres
 * migration.sql først i samme transaksjon (prøv før funksjonene finnes). Med --ut <fil> skrives de
 * fem profilene til fila.
 *
 *   npx tsx scripts/sjekk-alle-norske-sok-2026-10-20.ts [--med-oppretting] [--ut <fil>]
 *   TIDER=1 … skriver også svartiden for hvert søk
 */
import "./_env";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";
import { ryddProfilResultater, parseRunder, type ProfilEntry } from "../src/lib/stats/profil-resultater";

type Resultat = { navn: string; ok: boolean; detalj: string };
type Treff = { id: string; navn: string; fodt: number | null; klubb: string | null; tourer: string[] };
type Rad = { id: string; kilde: string; klasse: string | null; total: number | null; plass: number | null; runder: number[] };
type Profil = { id: string; navn: string; fodt: number; klubb: string | null; resultater: Rad[] };

// Kontrollspillere med mange runder på flere tourer. Max Risvåg (Anders' forslag) er født 2008 og
// er derfor utenfor første runde; han brukes i stedet som sjekk på at låsen holder.
const KONTROLL = [
  "herman-huus-2003",
  "silje-torvund-ohma-2003",
  "sebastian-eidsaether-syr-11365f",
  "filip-svendsen-2005",
  "anna-cathrine-krekling-2000",
];
const LAAST = ["max-risvag-2008", "max-risvaag"];

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");
  const utIdx = process.argv.indexOf("--ut");
  const utFil = utIdx > 0 ? process.argv[utIdx + 1] : null;
  const client = new Client({ connectionString: url });
  await client.connect();
  const res: Resultat[] = [];
  const sjekk = (navn: string, ok: boolean, detalj = "") => res.push({ navn, ok, detalj });
  const profiler: Profil[] = [];
  try {
    await client.query("BEGIN");
    if (process.argv.includes("--med-oppretting")) {
      await client.query(
        readFileSync(join(__dirname, "..", "prisma/migrations/20261020180000_alle_norske_sok/migration.sql"), "utf-8"),
      );
    }

    // Fasit hentes som eier, før rollen byttes.
    const synlig = new Map<string, boolean>(
      (await client.query(
        `SELECT "id", coalesce("country" = 'NO' AND "birthYear" BETWEEN 1900 AND 2005 AND "isActive", false) AS ok
           FROM "public_players"`,
      )).rows.map((r) => [r.id as string, r.ok as boolean]),
    );
    const idFor = async (slug: string) =>
      (await client.query(`SELECT "id" FROM "public_players" WHERE "slug" = $1`, [slug])).rows[0]?.id as string | undefined;
    const kontrollId = await Promise.all(KONTROLL.map(idFor));
    const laastId = (await Promise.all(LAAST.map(idFor))).filter(Boolean) as string[];
    const skjulte = (await client.query(
      `(SELECT "id" FROM "public_players" WHERE "country" = 'NO' AND "birthYear" > 2005 ORDER BY random() LIMIT 25)
       UNION ALL (SELECT "id" FROM "public_players" WHERE "birthYear" IS NULL ORDER BY random() LIMIT 25)
       UNION ALL (SELECT "id" FROM "public_players" WHERE "country" <> 'NO' AND "birthYear" <= 2005 ORDER BY random() LIMIT 10)`,
    )).rows.map((r) => r.id as string);

    // HQ-siden sin rydding av de samme spillerne, til sammenligning (som eier).
    const hq = new Map<string, ProfilEntry[]>();
    for (const id of kontrollId) {
      if (!id) continue;
      const { rows } = await client.query(
        `SELECT e."id", e."status", e."position", e."scoreToPar", e."totalScore", e."klasseNavn", e."rounds",
                t."sourceOrigin", t."startDate"
           FROM "public_player_entries" e JOIN "tournaments" t ON t."id" = e."tournamentId"
          WHERE e."playerId" = $1 AND t."mergedIntoId" IS NULL
          ORDER BY t."startDate" DESC, e."id"`,
        [id],
      );
      hq.set(id, ryddProfilResultater(rows.map((r) => ({
        id: r.id, status: r.status, position: r.position, scoreToPar: r.scoreToPar, totalScore: r.totalScore,
        klasseNavn: r.klasseNavn, rounds: r.rounds, tournament: { sourceOrigin: r.sourceOrigin, startDate: r.startDate },
      }))));
    }

    // Alle spillere utenfor låsen, ikke bare et utvalg: profilen skal være tom for hver eneste.
    const alle = (await client.query(
      `SELECT count(*)::int AS n, count(*) FILTER (WHERE "alle_norske_profil"("id") IS NOT NULL)::int AS lekk
         FROM "public_players"
        WHERE NOT coalesce("country" = 'NO' AND "birthYear" BETWEEN 1900 AND 2005 AND "isActive", false)`,
    )).rows[0];
    sjekk("Profil er tom for ALLE utenfor låsen", alle.lekk === 0, `${alle.n} spillere, ${alle.lekk} lekket`);

    await client.query(`SET LOCAL ROLE anon`);
    await client.query(`SELECT set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ role: "anon" })]);
    const kall = async <T,>(sql: string, args: unknown[] = []) => {
      await client.query("SAVEPOINT s");
      try {
        const r = await client.query(sql, args);
        await client.query("RELEASE SAVEPOINT s");
        return { feil: null as string | null, kode: null as string | null, data: r.rows[0]?.d as T };
      } catch (e) {
        await client.query("ROLLBACK TO SAVEPOINT s");
        return { feil: (e as Error).message, kode: (e as { code?: string }).code ?? null, data: null as T | null };
      }
    };
    const sok = (navn: string | null, klubb: string | null, fodt: number | null, tour: string | null) =>
      kall<Treff[]>(`SELECT "alle_norske_sok"($1, $2, $3, $4) AS d`, [navn, klubb, fodt, tour]);
    const profil = (id: string) => kall<Profil | null>(`SELECT "alle_norske_profil"($1) AS d`, [id]);

    // 1. Søk: ingen treff utenfor låsen, uansett input. Fødselsår 2006–2015 skal gi tomt.
    const soek: [string | null, string | null, number | null, string | null][] = [
      ["a", null, null, null], ["e", null, null, null], ["n", null, null, null], ["max", null, null, null],
      ["risvåg", null, null, null], ["risvaag", null, null, null], [null, "golf", null, null],
      [null, null, null, "OLYO"], [null, null, null, "SRIXON"], [null, null, 2005, null], [null, null, 1999, null],
      ...Array.from({ length: 10 }, (_, i) => [null, null, 2006 + i, null] as [null, null, number, null]),
      ["a", null, 2010, "OLYO"], [null, null, null, "DATAGOLF"], ["' OR 1=1 --", null, null, null],
    ];
    let utenfor = 0, totalt = 0, over50 = 0, feil = 0, tregest = 0, tregestSok = "";
    for (const [n, k, f, t] of soek) {
      const start = Date.now();
      const r = await sok(n, k, f, t);
      if (process.env.TIDER) console.log(Date.now() - start, "ms", JSON.stringify([n, k, f, t]));
      if (Date.now() - start > tregest) { tregest = Date.now() - start; tregestSok = JSON.stringify([n, k, f, t]); }
      if (r.feil) { feil++; continue; }
      const l = r.data ?? [];
      totalt += l.length;
      if (l.length > 50) over50++;
      utenfor += l.filter((x) => !synlig.get(x.id) || x.fodt == null || x.fodt > 2005).length;
      if (f != null && f > 2005) sjekk(`Søk på fødselsår ${f} gir tomt`, l.length === 0, `${l.length} treff`);
      if (t === "DATAGOLF") sjekk("Søk på tour DATAGOLF gir tomt", l.length === 0, `${l.length} treff`);
    }
    sjekk("Søk gir aldri spillere utenfor låsen", utenfor === 0 && feil === 0, `${totalt} treff i ${soek.length} søk, ${utenfor} utenfor, ${feil} feil`);
    sjekk("Søk gir maks 50 treff", over50 === 0);
    sjekk("Tregeste søk under 3 sekunder", tregest < 3000, `${tregest} ms ${tregestSok}`);
    const tomt = await sok(null, null, null, null);
    sjekk("Søk uten noe å søke på gir tom liste", !tomt.feil && (tomt.data ?? []).length === 0);
    const max = await sok("max risvåg", null, null, null);
    sjekk("Max Risvåg (f. 2008) finnes ikke i søket", !max.feil && (max.data ?? []).length === 0);

    // 2. Profil ved direkte id: NULL for alle utenfor låsen.
    let lekk = 0;
    for (const id of [...skjulte, ...laastId]) {
      const r = await profil(id);
      if (r.feil || r.data != null) lekk++;
    }
    sjekk("Profil ved direkte id er tom utenfor låsen", lekk === 0, `${skjulte.length + laastId.length} prøvd, ${lekk} lekket`);
    sjekk("Profil for ukjent id er tom", (await profil("finnes-ikke")).data == null);

    // 3. Hjelpereglene kan ikke kalles av anon.
    for (const [navn, sql] of [
      ["alle_norske_synlig", `SELECT "alle_norske_synlig"('NO', 2010, true) AS d`],
      ["alle_norske_er_netto", `SELECT "alle_norske_er_netto"('G19N') AS d`],
      ["alle_norske_nokkel", `SELECT "alle_norske_nokkel"('Å') AS d`],
    ] as const) {
      const r = await kall(sql);
      sjekk(`anon kan ikke kalle ${navn}`, r.kode === "42501", r.kode ?? "ingen feil");
    }

    // 4. Kontrollspillerne: bare brutto, ingen DataGolf, og samme rader og score som HQ-siden.
    for (const [i, id] of kontrollId.entries()) {
      if (!id) { sjekk(`Kontroll ${KONTROLL[i]} finnes`, false); continue; }
      const r = await profil(id);
      const p = r.data;
      if (!p) { sjekk(`Kontroll ${KONTROLL[i]} har profil`, false, r.feil ?? "NULL"); continue; }
      profiler.push(p);
      const fasit = hq.get(id) ?? [];
      const dg = p.resultater.filter((x) => x.kilde === "DATAGOLF").length;
      const netto = p.resultater.filter((x) => /netto/i.test(x.klasse ?? "") || /\dN$/.test(x.klasse ?? "")).length;
      const ulikRad = fasit.filter((f, j) => {
        const x = p.resultater[j];
        const total = f.totalScore ?? (parseRunder(f.rounds).reduce((s, v) => s + v.score, 0) || null);
        return !x || x.id !== f.id || x.total !== total || x.plass !== f.position
          || JSON.stringify(x.runder) !== JSON.stringify(parseRunder(f.rounds).map((v) => v.score));
      });
      sjekk(
        `${p.navn}: lik HQ-profilen`,
        dg === 0 && netto === 0 && fasit.length === p.resultater.length && ulikRad.length === 0,
        `${p.resultater.length} resultater (HQ ${fasit.length}), ${ulikRad.length} ulike, ${dg} DataGolf, ${netto} netto`,
      );
    }
  } finally {
    await client.query("ROLLBACK").catch(() => {});
    await client.end();
  }
  console.table(res);
  if (utFil) {
    writeFileSync(utFil, JSON.stringify(profiler, null, 2));
    console.log(`Skrev ${profiler.length} profiler til ${utFil}`);
  }
  if (res.some((r) => !r.ok)) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
