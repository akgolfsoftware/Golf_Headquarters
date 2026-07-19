// src/lib/tripletex/client.ts
// LES-KUN Tripletex-klient (Agentic OS Steg 2). Se .claude/rules/admin-tripletex.md:
// «Økonomi-tall LESES fra Tripletex(-eksport), aldri estimeres» og agenten
// «UTFØRER aldri betalinger, lønnskjøringer eller bokføringer».
//
// Klienten eksponerer BEVISST kun GET-hentere. Det finnes ingen generisk
// request()-metode som kunne gjort POST/PUT/DELETE mot regnskapsdata — les-
// tilgangen er dermed håndhevet i klient-designet, ikke bare i dokumentasjonen.
// Unntaket er selve session-opprettelsen (PUT mot /token/session/:create) —
// det er en auth-handling (oppretter en midlertidig sesjonstoken), ikke
// skriving av regnskapsdata.
//
// TODO(verifiser-mot-api): ALLE endepunkt-stier og respons-scheman under er
// satt opp etter Tripletex' offentlige API-konvensjoner (liste-responser i
// { values: [...] }, enkelt-ressurser i { value: {...} }) men er IKKE
// verifisert mot et ekte kall ennå. Før agentene stoler på tallene i prod:
// gjør ett manuelt testkall per endepunkt med ekte nøkler og juster
// sti/feltnavn i schemaene her ved behov. Ugyldig/uventet svar gir alltid
// null + én warn-logg — ALDRI et gjettet tall.
import "server-only";
import { z } from "zod";
import { readTripletexEnv, type TripletexEnv } from "./env";

const TIMEOUT_MS = 10_000;

function loggUgyldigSvar(sted: string, feil: unknown): void {
  console.warn(
    `[tripletex/client] ugyldig/uventet svar fra ${sted} — ignorerer (returnerer null, gjetter aldri et tall)`,
    feil,
  );
}

async function fetchMedTimeout(url: string, init: RequestInit): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    return res;
  } catch (err) {
    console.warn("[tripletex/client] nettverksfeil eller timeout", err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ── Session-token (auth) ─────────────────────────────────────────────────────
// TODO(verifiser-mot-api): PUT /token/session/:create er dokumentert av
// Tripletex, men parameterrekkefølgen og respons-nøkkelen `value.token` bør
// bekreftes ved første ekte kall.

const sessionTokenResponseSchema = z.object({
  value: z.object({ token: z.string().min(1) }),
});

async function opprettSesjonsToken(env: TripletexEnv): Promise<string | null> {
  // expirationDate: kort levetid (i morgen) — vi cacher token i minnet uansett
  // (se SESSION_CACHE_MS), så en lang levetid gir ingen fordel og øker
  // eksponeringsvinduet for et lekket token.
  const utloper = new Date();
  utloper.setUTCDate(utloper.getUTCDate() + 1);
  const expirationDate = utloper.toISOString().slice(0, 10);

  const url =
    `${env.baseUrl}/token/session/:create` +
    `?consumerToken=${encodeURIComponent(env.consumerToken)}` +
    `&employeeToken=${encodeURIComponent(env.employeeToken)}` +
    `&expirationDate=${expirationDate}`;

  const res = await fetchMedTimeout(url, { method: "PUT" });
  if (!res || !res.ok) return null;

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    return null;
  }
  const parsed = sessionTokenResponseSchema.safeParse(json);
  if (!parsed.success) {
    loggUgyldigSvar("token/session/:create", parsed.error);
    return null;
  }
  return parsed.data.value.token;
}

// Sesjonstoken cachet i minnet i prosessens levetid. Ikke persistert — en
// serverless kaldstart lager bare en ny (billig, og trygt: aldri delt på tvers
// av instanser via disk/DB).
let cachedSessionToken: { token: string; hentetAt: number } | null = null;
const SESSION_CACHE_MS = 60 * 60 * 1000; // 1 time — godt innenfor expirationDate

async function hentSesjonsToken(env: TripletexEnv): Promise<string | null> {
  if (cachedSessionToken && Date.now() - cachedSessionToken.hentetAt < SESSION_CACHE_MS) {
    return cachedSessionToken.token;
  }
  const token = await opprettSesjonsToken(env);
  if (!token) return null;
  cachedSessionToken = { token, hentetAt: Date.now() };
  return token;
}

/** GET mot Tripletex med Basic auth (brukernavn "0", passord = sesjonstoken). */
async function authorizedGet(env: TripletexEnv, path: string): Promise<unknown | null> {
  const sessionToken = await hentSesjonsToken(env);
  if (!sessionToken) return null;

  const basic = Buffer.from(`0:${sessionToken}`).toString("base64");
  const res = await fetchMedTimeout(`${env.baseUrl}${path}`, {
    method: "GET",
    headers: { Authorization: `Basic ${basic}`, Accept: "application/json" },
  });
  if (!res || !res.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// ── Ansatte (til lønnsgrunnlag-sjekk) ────────────────────────────────────────
// TODO(verifiser-mot-api): sti antatt /employee, feltnavn antatt
// firstName/lastName/email — bekreft mot ekte respons.

const ansattSchema = z.object({
  id: z.number(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
});

const ansatteResponseSchema = z.object({
  values: z.array(ansattSchema),
});

export type Ansatt = {
  id: number;
  navn: string;
  epost: string | null;
};

/**
 * Henter ansattlisten fra Tripletex (til lønnsgrunnlag-sjekklisten).
 * Returnerer null ved manglende config, nettverksfeil eller ugyldig svar —
 * aldri en gjettet/tom liste fremstilt som ekte data.
 */
export async function hentAnsatte(): Promise<Ansatt[] | null> {
  const env = readTripletexEnv();
  if (!env) return null;

  const json = await authorizedGet(env, "/employee");
  if (json == null) return null;

  const parsed = ansatteResponseSchema.safeParse(json);
  if (!parsed.success) {
    loggUgyldigSvar("/employee", parsed.error);
    return null;
  }
  return parsed.data.values.map((a) => ({
    id: a.id,
    navn: [a.firstName, a.lastName].filter(Boolean).join(" ") || `Ansatt #${a.id}`,
    epost: a.email ?? null,
  }));
}

// ── Resultatrapport (til månedsavslutning) ──────────────────────────────────
// TODO(verifiser-mot-api): sti antatt /ledger/report/result — Tripletex'
// rapport-API kan ha en annen sti og/eller returnere en kolonne/rad-matrise i
// stedet for flate linjer. Verifiser og juster schema FØR agenten stoler på
// tallene i prod. Inntil da: hentResultatrapport returnerer null for et ekte
// kall som ikke matcher schemaet, og runMaanedsavslutning viser da
// «tall mangler — les i Tripletex» (aldri et estimat).

const resultatLinjeSchema = z.object({
  navn: z.string(),
  belop: z.number(),
});

const resultatrapportResponseSchema = z.object({
  value: z.object({
    linjer: z.array(resultatLinjeSchema).default([]),
    sumInntekt: z.number().optional(),
    sumKostnad: z.number().optional(),
    resultat: z.number().optional(),
  }),
});

export type Resultatrapport = {
  linjer: { navn: string; belop: number }[];
  sumInntekt: number | null;
  sumKostnad: number | null;
  resultat: number | null;
};

/**
 * Henter resultatrapport for perioden [fraDato, tilDato] (YYYY-MM-DD, Oslo-dato).
 * Returnerer null ved manglende config, nettverksfeil eller ugyldig svar.
 */
export async function hentResultatrapport(
  fraDato: string,
  tilDato: string,
): Promise<Resultatrapport | null> {
  const env = readTripletexEnv();
  if (!env) return null;

  const path = `/ledger/report/result?dateFrom=${fraDato}&dateTo=${tilDato}`;
  const json = await authorizedGet(env, path);
  if (json == null) return null;

  const parsed = resultatrapportResponseSchema.safeParse(json);
  if (!parsed.success) {
    loggUgyldigSvar("/ledger/report/result", parsed.error);
    return null;
  }
  return {
    linjer: parsed.data.value.linjer,
    sumInntekt: parsed.data.value.sumInntekt ?? null,
    sumKostnad: parsed.data.value.sumKostnad ?? null,
    resultat: parsed.data.value.resultat ?? null,
  };
}

// Eksportert kun for enhetstester av zod-parsing (gyldig/ugyldig svar) —
// ikke bruk utenfor tester.
export const _test = {
  sessionTokenResponseSchema,
  ansatteResponseSchema,
  resultatrapportResponseSchema,
};
