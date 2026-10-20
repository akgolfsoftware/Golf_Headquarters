/**
 * Prøver datagolf_maalestokk() slik Supabase-klienten ville kalt den: utlogget (anon), innlogget
 * trener, innlogget spiller og Anders. Alt skjer i én transaksjon som rulles tilbake. Med
 * --med-oppretting kjøres migration.sql først i samme transaksjon (prøv før funksjonen finnes).
 * Med --ut <fil> skrives svaret for Anders til fila (eksempel for siden som leser det).
 *
 *   npx tsx scripts/sjekk-datagolf-maalestokk-2026-10-20.ts [--med-oppretting] [--ut <fil>]
 */
import "./_env";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";

type Resultat = { navn: string; ok: boolean; detalj: string };
type Spiller = { id: string; navn: string; land: string; plass: number | null; gruppe: string };
type Svar = {
  asOf: string;
  rangertAv: string;
  spillere: Spiller[];
  uten: { navn: string; runder: number; tourer: string[] }[];
  innspill: Record<string, (number | null)[]>;
  veien: unknown[] | null;
};

const ANDERS = "cmacgoers0000andersadmin01";

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");
  const utIdx = process.argv.indexOf("--ut");
  const utFil = utIdx > 0 ? process.argv[utIdx + 1] : null;
  const client = new Client({ connectionString: url });
  await client.connect();
  const res: Resultat[] = [];
  const sjekk = (navn: string, ok: boolean, detalj = "") => res.push({ navn, ok, detalj });
  let svar: Svar | null = null;
  try {
    await client.query("BEGIN");
    if (process.argv.includes("--med-oppretting")) {
      await client.query(
        readFileSync(join(__dirname, "..", "prisma/migrations/20261020160000_datagolf_maalestokk/migration.sql"), "utf-8"),
      );
    }
    const konto = async (where: string) =>
      (await client.query(
        `SELECT u."authId" FROM "users" u WHERE ${where} AND u."deletedAt" IS NULL AND u."authId" ~ '^[0-9a-f-]{36}$' LIMIT 1`,
      )).rows[0]?.authId as string | undefined;
    const anders = await konto(`u."id" = '${ANDERS}'`);
    const trener = await konto(`u."role" = 'COACH'`);
    const spiller = await konto(`u."role" = 'PLAYER'`);
    if (!anders || !trener || !spiller) throw new Error("Fant ikke testkontoer (Anders, trener og spiller)");

    const somRolle = async (rolle: "anon" | "authenticated", authId: string | null) => {
      await client.query(`SET LOCAL ROLE ${rolle}`);
      await client.query(`SELECT set_config('request.jwt.claims', $1, true)`, [
        JSON.stringify(authId ? { sub: authId, role: rolle } : { role: rolle }),
      ]);
    };
    const kall = async () => {
      await client.query("SAVEPOINT s");
      try {
        const r = await client.query(`SELECT "datagolf_maalestokk"() AS d`);
        await client.query("RELEASE SAVEPOINT s");
        return { feil: null as string | null, kode: null as string | null, data: r.rows[0]?.d as Svar | null };
      } catch (e) {
        await client.query("ROLLBACK TO SAVEPOINT s");
        return { feil: (e as Error).message, kode: (e as { code?: string }).code ?? null, data: null };
      }
    };

    await somRolle("anon", null);
    const a = await kall();
    sjekk("utlogget får nei (42501)", a.kode === "42501", a.feil ?? "fikk svar");
    await client.query("RESET ROLE");

    await somRolle("authenticated", trener);
    const t = await kall();
    sjekk("trener får ingenting", (!!t.feil && t.kode === "42501") || (!t.feil && t.data === null), t.feil ?? JSON.stringify(t.data)?.slice(0, 60));
    await client.query("RESET ROLE");

    await somRolle("authenticated", spiller);
    const s = await kall();
    sjekk("spiller får ingenting", (!!s.feil && s.kode === "42501") || (!s.feil && s.data === null), s.feil ?? JSON.stringify(s.data)?.slice(0, 60));
    await client.query("RESET ROLE");

    await somRolle("authenticated", anders);
    const d = await kall();
    await client.query("RESET ROLE");
    sjekk("Anders får data", !d.feil && !!d.data, d.feil ?? "");
    if (d.data) {
      svar = d.data;
      const fasit = await client.query(
        `SELECT max(as_of)::text AS as_of,
                (SELECT count(*)::int FROM dashboard.dg_skill_ratings k JOIN dashboard.dg_players p ON p.dg_id = k.dg_id
                  WHERE k.as_of = (SELECT max(as_of) FROM dashboard.dg_skill_ratings) AND p.country_iso3 = 'NOR') AS nor_med,
                (SELECT count(*)::int FROM dashboard.dg_players p WHERE p.country_iso3 = 'NOR'
                  AND NOT EXISTS (SELECT 1 FROM dashboard.dg_skill_ratings k
                    WHERE k.dg_id = p.dg_id AND k.as_of = (SELECT max(as_of) FROM dashboard.dg_skill_ratings))) AS nor_uten
           FROM dashboard.dg_skill_ratings`,
      );
      const f = fasit.rows[0] as { as_of: string; nor_med: number; nor_uten: number };
      const topp = svar.spillere.filter((x) => x.gruppe === "topp");
      const norskeISvar = svar.spillere.filter((x) => x.land === "NOR");
      sjekk("asOf er siste dato", svar.asOf === f.as_of, `${svar.asOf} / ${f.as_of}`);
      sjekk("rangertAv er gyldig", svar.rangertAv === "dg_rank" || svar.rangertAv === "sg_total", svar.rangertAv);
      sjekk("50 i topp", topp.length === 50, `${topp.length}`);
      sjekk("topp har plass 1–50 i rekkefølge", topp.every((x, i) => typeof x.plass === "number" && (i === 0 || x.plass >= (topp[i - 1].plass ?? 0))) && topp[0]?.plass === 1, `${topp[0]?.plass}–${topp.at(-1)?.plass}`);
      sjekk("alle norske med tall er med", norskeISvar.length === f.nor_med, `${norskeISvar.length} / ${f.nor_med}`);
      sjekk("norske utenfor topp er «norsk»", svar.spillere.filter((x) => x.gruppe === "norsk").every((x) => x.land === "NOR"));
      sjekk("norske uten tall er i «uten»", svar.uten.length === f.nor_uten, `${svar.uten.length} / ${f.nor_uten}`);
      sjekk("navn er «Fornavn Etternavn»", svar.spillere.every((x) => !x.navn.includes(",")) && svar.uten.every((x) => !x.navn.includes(",")));
      const ider = new Set(svar.spillere.map((x) => x.id));
      sjekk("innspill bare for spillere i lista, fire tall", Object.entries(svar.innspill).every(([k, v]) => ider.has(k) && v.length === 4), `${Object.keys(svar.innspill).length} spillere`);
      sjekk("veien er liste eller null", svar.veien === null || Array.isArray(svar.veien), svar.veien === null ? "null" : `${svar.veien.length} tourer`);
    }
  } finally {
    await client.query("ROLLBACK").catch(() => {});
    await client.end();
  }
  console.table(res.map((r) => ({ sjekk: r.navn, resultat: r.ok ? "OK" : "FEIL", detalj: r.detalj })));
  if (utFil && svar) {
    writeFileSync(utFil, JSON.stringify(svar, null, 1) + "\n");
    console.log(`Skrev ${utFil}`);
  }
  if (res.some((r) => !r.ok)) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
