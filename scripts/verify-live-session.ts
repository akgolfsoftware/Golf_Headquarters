/**
 * Live Session — DB-verifisering (READ-ONLY).
 *
 * Inspiserer DB-tilstand for Live Session-flyten under manuell testing, slik at
 * man slipper å klikke i Supabase Studio. Scriptet skriver ALDRI til databasen
 * (ingen update/delete/create) — det leser og rapporterer.
 *
 *   npx tsx scripts/verify-live-session.ts <sessionId>     # inspiser én økt
 *   npx tsx scripts/verify-live-session.ts --user <id|epost> # pågående økter for bruker
 *   npx tsx scripts/verify-live-session.ts --my-test-data    # Anders' tre testkontoer
 *   npx tsx scripts/verify-live-session.ts --help
 *
 * Exit-koder:  0 = alt OK · 1 = FAIL-flagg funnet · 2 = WARN-flagg funnet ·
 *              3 = script-feil (DB utilgjengelig, ugyldig argument, ikke funnet)
 *
 * Datamodell (PR #5, fix/live-session-persistence):
 *   TrainingPlanSession.liveSnapshot  {startedAtISO,totalSec,updatedAtISO,drills[]}
 *   TrainingPlanSessionLog            frosset ved complete/abandon (totalReps,
 *                                     drillAggregates[], abandonReason, rating, notes)
 *   userId ligger på plan-relasjonen (plan.userId), ikke på økta.
 */

import "./_env";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { parseLiveSnapshot } from "@/lib/portal-live/data";

// ───────────────────────── flagg-akkumulator ─────────────────────────
// Styrer exit-koden. mark() returnerer prefiks-strengen OG setter flagget.

let sawFail = false;
let sawWarn = false;

function mark(level: "OK" | "WARN" | "FAIL"): string {
  if (level === "FAIL") sawFail = true;
  if (level === "WARN") sawWarn = true;
  return level === "OK" ? "[ OK ]" : level === "WARN" ? "[WARN]" : "[FAIL]";
}

function exitCode(): 0 | 1 | 2 {
  return sawFail ? 1 : sawWarn ? 2 : 0;
}

// ───────────────────────── formattering ─────────────────────────

/** Oslo-tid som `YYYY-MM-DD HH:mm:ss`. */
function fmtOslo(d: Date): string {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Oslo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
}

/** Relativ tid, kompakt: "nå", "47s siden", "4m 34s siden", "2t 11m siden", "3d siden". */
function relTid(d: Date, now: Date): string {
  const sek = Math.round((now.getTime() - d.getTime()) / 1000);
  if (sek < 0) return "i fremtiden";
  if (sek < 10) return "nå";
  if (sek < 60) return `${sek}s siden`;
  const min = Math.floor(sek / 60);
  if (min < 60) return `${min}m ${sek % 60}s siden`;
  const t = Math.floor(min / 60);
  if (t < 24) return `${t}t ${min % 60}m siden`;
  const dager = Math.floor(t / 24);
  return `${dager}d siden`;
}

function fmtMedRel(d: Date, now: Date): string {
  return `${fmtOslo(d)}  (${relTid(d, now)})`;
}

/** Varighet i sekunder → "8m 56s" / "2t 04m" / "12s". */
function fmtVarighet(sek: number): string {
  if (sek < 60) return `${sek}s`;
  const min = Math.floor(sek / 60);
  if (min < 60) return `${min}m ${sek % 60}s`;
  const t = Math.floor(min / 60);
  return `${t}t ${String(min % 60).padStart(2, "0")}m`;
}

/** Byte-størrelse på en JSON-blob → "842 bytes" / "1.2 KB". */
function fmtBytes(value: unknown): string {
  const n = Buffer.byteLength(JSON.stringify(value ?? null), "utf8");
  if (n < 1024) return `${n} bytes`;
  return `${(n / 1024).toFixed(1)} KB`;
}

/** Etikett-kolonne: venstrejuster til fast bredde, alltid minst ett mellomrom. */
function row(label: string, value: string | number): string {
  const l = label + ":";
  return `${l.length >= 17 ? l + " " : l.padEnd(17)}${value}`;
}

function pad(s: string, n: number): string {
  return s.length >= n ? s + "  " : s.padEnd(n);
}

function kuttId(id: string): string {
  return id.length > 11 ? `${id.slice(0, 6)}...${id.slice(-3)}` : id;
}

// ───────────────────────── drillAggregates-parsing ─────────────────────────
// Samme form som liveSnapshot.drills. status gjøres valgfri for robusthet —
// et diagnose-script skal vise mest mulig, ikke feile på en manglende nøkkel.

const DrillAggregatesSchema = z.array(
  z.object({
    drillId: z.string(),
    reps: z.number(),
    elapsedSec: z.number(),
    status: z.enum(["done", "active", "queued"]).optional(),
  }),
);

type DrillAgg = z.infer<typeof DrillAggregatesSchema>;

function parseDrillAggregates(json: unknown): DrillAgg | null {
  if (json == null) return null;
  const r = DrillAggregatesSchema.safeParse(json);
  return r.success ? r.data : null;
}

// ───────────────────────── argument-validering ─────────────────────────

function looksLikeId(s: string): boolean {
  const cuid = /^c[a-z0-9]{20,}$/i;
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return cuid.test(s) || uuid.test(s);
}

// ───────────────────────── modus 1: én økt ─────────────────────────

async function modusSession(sessionId: string, now: Date): Promise<number> {
  const session = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    include: {
      plan: {
        include: {
          effectiveness: { select: { id: true } },
          user: { select: { id: true, email: true, role: true } },
        },
      },
      log: true,
      drills: { select: { id: true } },
    },
  });

  if (!session) {
    console.error(`[FAIL] Fant ingen TrainingPlanSession med id=${sessionId}`);
    return 3;
  }

  const snap = parseLiveSnapshot(session.liveSnapshot);
  const snapPresent = session.liveSnapshot != null;
  const log = session.log;
  const drillAgg = parseDrillAggregates(log?.drillAggregates ?? null);
  const planlagteDrills = session.drills.length;

  // ── TrainingPlanSession ──
  console.log("=== TrainingPlanSession ===");
  console.log(row("id", session.id));
  console.log(row("userId", `${session.plan.userId}  (${session.plan.user.email})`));
  console.log(row("status", session.status));
  console.log(row("createdAt", fmtMedRel(session.createdAt, now)));
  console.log(row("updatedAt", fmtMedRel(session.updatedAt, now)));
  console.log(row("plan", `"${session.plan.name}" (id: ${session.plan.id})`));
  console.log("");

  // ── liveSnapshot ──
  console.log("=== liveSnapshot ===");
  console.log(row("present", snapPresent ? "YES" : "NO"));
  if (snapPresent) {
    console.log(row("size", fmtBytes(session.liveSnapshot)));
    if (snap) {
      console.log("content:");
      console.log(`  drills:        ${snap.drills.length} drills`);
      snap.drills.forEach((d, i) => {
        console.log(
          `    [${i}] drillId=${d.drillId}, reps=${d.reps}, elapsedSec=${d.elapsedSec}, status=${d.status}`,
        );
      });
      console.log(`  totalSec:      ${snap.totalSec}  (${fmtVarighet(snap.totalSec)})`);
      console.log(`  startedAtISO:  ${snap.startedAtISO}`);
      console.log(`  updatedAtISO:  ${snap.updatedAtISO}`);
    } else {
      console.log(`content:       ${mark("WARN")} blob har uventet form — viser rått:`);
      console.log(JSON.stringify(session.liveSnapshot, null, 2).replace(/^/gm, "  "));
    }
  }
  console.log("");

  // ── TrainingPlanSessionLog ──
  console.log("=== TrainingPlanSessionLog ===");
  if (!log) {
    const forventet =
      session.status === "ACTIVE" || session.status === "PAUSED" || session.status === "PLANNED";
    console.log(
      row("present", `NO${forventet ? "  (forventet før completeSession/abandon)" : ""}`),
    );
  } else {
    console.log(row("present", "YES"));
    console.log(row("startedAt", fmtMedRel(log.startedAt, now)));
    if (log.completedAt) {
      const varighet = Math.round((log.completedAt.getTime() - log.startedAt.getTime()) / 1000);
      console.log(row("completedAt", `${fmtOslo(log.completedAt)}  (varighet: ${fmtVarighet(varighet)})`));
    } else {
      console.log(row("completedAt", "null"));
    }
    console.log(row("totalReps", log.totalReps ?? "null"));
    if (drillAgg) {
      console.log(row("drillAggregates", `${drillAgg.length} drills`));
      drillAgg.forEach((d) => {
        const status = d.status ? `, status=${d.status}` : "";
        console.log(`  [${d.drillId}] reps=${d.reps}, elapsedSec=${d.elapsedSec}${status}`);
      });
    } else if (log.drillAggregates != null) {
      console.log(row("drillAggregates", `${mark("WARN")} uventet form — rått:`));
      console.log(JSON.stringify(log.drillAggregates, null, 2).replace(/^/gm, "  "));
    } else {
      console.log(row("drillAggregates", "null"));
    }
    console.log(row("abandonReason", log.abandonReason != null ? `"${log.abandonReason}"` : "null"));
    console.log(row("rating", log.rating ?? "null"));
    console.log(row("notes", log.notes != null ? `"${log.notes}"` : "null"));
  }
  console.log("");

  // ── Plan-status ──
  const planTeller = await prisma.trainingPlanSession.groupBy({
    by: ["status"],
    where: { planId: session.planId },
    _count: { _all: true },
  });
  const planTotal = planTeller.reduce((s, t) => s + t._count._all, 0);
  const planFullfort = planTeller.find((t) => t.status === "COMPLETED")?._count._all ?? 0;
  const planGjenst = planTotal - planFullfort;

  console.log("=== Plan-status ===");
  console.log(row("plan.status", session.plan.status));
  console.log(row("remainingSessions", `${planGjenst} (totalt ${planTotal})`));
  if (session.status === "COMPLETED") {
    console.log(row("PlanEffectiveness", session.plan.effectiveness ? `YES (id: ${session.plan.effectiveness.id})` : "NO"));
    console.log(
      row("Plan auto-arkivert", session.plan.status === "ARCHIVED" ? "YES" : `NO (${planGjenst} økter igjen)`),
    );
  }
  console.log("");

  // ── Verifisering (status-spesifikk) ──
  console.log("=== Verifisering ===");
  verifiser(session.status, snapPresent, log, drillAgg, planlagteDrills);

  return exitCode();
}

/** Bygger verifiserings-linjene etter status. Flagg settes via mark(). */
function verifiser(
  status: string,
  snapPresent: boolean,
  log: { totalReps: number | null; completedAt: Date | null; startedAt: Date; abandonReason: string | null; drillAggregates: unknown } | null,
  drillAgg: DrillAgg | null,
  planlagteDrills: number,
): void {
  const linje = (level: "OK" | "WARN" | "FAIL", tekst: string) => console.log(`${mark(level)} ${tekst}`);

  switch (status) {
    case "ACTIVE":
      if (snapPresent) linje("OK", "ACTIVE har liveSnapshot");
      else linje("WARN", "ACTIVE uten liveSnapshot — skal ikke skje");
      break;

    case "PAUSED":
      if (snapPresent) linje("OK", "PAUSED har liveSnapshot (gjenoppta mulig)");
      else linje("FAIL", "PAUSED uten liveSnapshot — ingenting å gjenoppta");
      break;

    case "COMPLETED": {
      linje("OK", "status er terminal (COMPLETED)");
      if (snapPresent) linje("FAIL", "liveSnapshot er IKKE nulled — completeSession sviktet");
      else linje("OK", "liveSnapshot er nulled");
      if (!log) {
        linje("FAIL", "TrainingPlanSessionLog mangler");
        break;
      }
      linje("OK", "Logg eksisterer");
      if (log.totalReps == null && drillAgg == null) {
        linje("WARN", "totalReps/drillAggregates er null (direkte fullføring uten snapshot) — kan ikke verifisere reps-sum");
      } else if (drillAgg != null && log.totalReps != null) {
        const sum = drillAgg.reduce((s, d) => s + d.reps, 0);
        if (sum === log.totalReps) {
          linje("OK", `totalReps matcher drillAggregates-sum (${log.totalReps} = ${drillAgg.map((d) => d.reps).join("+") || 0})`);
        } else {
          linje("FAIL", `totalReps mismatch: ${log.totalReps} ≠ sum(${drillAgg.map((d) => d.reps).join("+")}) = ${sum}`);
        }
      } else {
        linje("WARN", `delvis reps-data: totalReps=${log.totalReps ?? "null"}, drillAggregates=${drillAgg ? `${drillAgg.length} drills` : "null"}`);
      }
      if (log.completedAt) {
        if (log.completedAt.getTime() > log.startedAt.getTime()) linje("OK", "completedAt > startedAt");
        else linje("FAIL", "completedAt er ikke etter startedAt");
      }
      break;
    }

    case "ABANDONED":
      if (!log) {
        linje("FAIL", "ABANDONED uten logg — abandon skal opprette TrainingPlanSessionLog");
        break;
      }
      linje("OK", "Logg eksisterer");
      if (snapPresent) linje("FAIL", "liveSnapshot er IKKE nulled etter abandon");
      else linje("OK", "liveSnapshot er nulled");
      if (log.abandonReason != null) linje("OK", `abandonReason satt ("${log.abandonReason}")`);
      else linje("WARN", "abandonReason er null (tillatt, men flagges)");
      if (drillAgg != null) {
        linje("OK", `delvis logg: ${drillAgg.length} drills (av ${planlagteDrills} planlagte)`);
      }
      break;

    case "PLANNED":
    case "SKIPPED":
    case "CANCELLED":
    default:
      console.log(`[ -- ] ${status}: ingen verifisering (kun grunninfo)`);
      break;
  }
}

// ───────────────────────── modus 2: pågående for bruker ─────────────────────────

async function modusUser(arg: string, now: Date): Promise<number> {
  const user = arg.includes("@")
    ? await prisma.user.findUnique({ where: { email: arg }, select: { id: true, email: true, role: true } })
    : await prisma.user.findUnique({ where: { id: arg }, select: { id: true, email: true, role: true } });

  if (!user) {
    console.error(`[FAIL] Fant ingen bruker med ${arg.includes("@") ? "e-post" : "id"}=${arg}`);
    return 3;
  }

  const sessions = await prisma.trainingPlanSession.findMany({
    where: { plan: { userId: user.id }, status: { in: ["ACTIVE", "PAUSED"] } },
    include: { plan: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
  });

  console.log(`=== Pågående økter for ${user.email} (${user.role}) ===`);
  if (sessions.length === 0) {
    console.log("Ingen ACTIVE/PAUSED økter.");
    return 0;
  }

  console.log(`${pad("status", 9)}${pad("sessionId", 13)}${pad("plan", 18)}${pad("updatedAt", 20)}snapshot`);
  for (const s of sessions) {
    const snapPresent = s.liveSnapshot != null;
    const flagg = !snapPresent && s.status === "PAUSED" ? "  [FAIL]" : "";
    if (!snapPresent && s.status === "PAUSED") sawFail = true;
    console.log(
      pad(s.status, 9) +
        pad(kuttId(s.id), 13) +
        pad(s.plan.name.slice(0, 16), 18) +
        pad(relTid(s.updatedAt, now), 20) +
        (snapPresent ? fmtBytes(s.liveSnapshot) : "—") +
        flagg,
    );
  }

  if (sessions.length > 1) {
    sawWarn = true;
    console.log("");
    console.log(`${mark("WARN")} Mer enn én pågående økt — nyligste vinner i "Fortsett pågående?"-banner.`);
    console.log("Eldre PAUSED-økt kan ryddes manuelt (sett status=ABANDONED) hvis ikke ønsket.");
  }

  return exitCode();
}

// ───────────────────────── modus 3: testkontoer ─────────────────────────

const TEST_EMAILS = [
  "templates+placeholder@akgolf.no",
  "anders+spiller@akgolfgroup.com",
  "anders@akgolf.no",
];

async function modusTestData(): Promise<number> {
  console.log("=== Test-kontoer ===");
  const bredde = Math.max(...TEST_EMAILS.map((e) => e.length)) + 2;

  for (const email of TEST_EMAILS) {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } });
    if (!user) {
      console.log(`${email.padEnd(bredde)}(ikke funnet i User-tabellen)`);
      continue;
    }
    const teller = await prisma.trainingPlanSession.groupBy({
      by: ["status"],
      where: { plan: { userId: user.id } },
      _count: { _all: true },
    });
    const antall = (s: string) => teller.find((t) => t.status === s)?._count._all ?? 0;
    const oppsummering = `${antall("PLANNED")} PLANNED, ${antall("ACTIVE")} ACTIVE, ${antall("PAUSED")} PAUSED, ${antall("COMPLETED")} COMPLETED, ${antall("ABANDONED")} ABANDONED`;
    console.log(`${email.padEnd(bredde)}(${(user.role + "):").padEnd(8)} ${oppsummering}`);
  }

  console.log("");
  console.log("=== Etter dagens tester ===");
  console.log("Forventer at tallene endres (PLANNED→COMPLETED) etter manuell testing.");
  console.log("Re-kjør denne kommandoen for å se nye tall.");
  return 0;
}

// ───────────────────────── hjelpetekst ─────────────────────────

function printHelp(): void {
  console.log(`Live Session — DB-verifisering (READ-ONLY)

Bruk:
  npx tsx scripts/verify-live-session.ts <sessionId>        Inspiser én økt + verifiser tilstand
  npx tsx scripts/verify-live-session.ts --user <id|epost>  Pågående (ACTIVE/PAUSED) økter for bruker
  npx tsx scripts/verify-live-session.ts --my-test-data     Sammendrag for de tre testkontoene
  npx tsx scripts/verify-live-session.ts --help             Denne teksten

Exit-koder:  0 = alt OK · 1 = FAIL-flagg · 2 = WARN-flagg · 3 = script-feil

Read-only: scriptet endrer aldri databasen.`);
}

// ───────────────────────── feilhåndtering ─────────────────────────

function printDbError(e: unknown): void {
  const msg = e instanceof Error ? e.message : String(e);
  const erConn = /P100[0-9]|reach|ECONNREFUSED|ETIMEDOUT|getaddrinfo|pooler|connection|Environment variable not found/i.test(msg);
  console.error("");
  console.error("[FAIL] Script-feil.");
  if (erConn) {
    console.error("Kunne ikke koble til databasen.");
    console.error("Sjekk at DATABASE_URL er satt riktig i .env.local (Supabase pooler, port 6543, ?pgbouncer=true).");
  }
  console.error(`Detalj: ${msg}`);
}

// ───────────────────────── entrypoint ─────────────────────────

async function main(): Promise<number> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printHelp();
    return 0;
  }

  const now = new Date();

  if (args[0] === "--my-test-data") {
    return modusTestData();
  }

  if (args[0] === "--user") {
    const arg = args[1];
    if (!arg) {
      console.error("[FAIL] --user krever <userId> eller <epost>.");
      return 3;
    }
    return modusUser(arg, now);
  }

  const sessionId = args[0];
  if (!looksLikeId(sessionId)) {
    console.error(`[FAIL] '${sessionId}' ser ikke ut som en gyldig sessionId (forventet cuid- eller uuid-form).`);
    console.error("Tips: kjør --user <id|epost> for å liste økt-id-er, eller --help.");
    return 3;
  }
  return modusSession(sessionId, now);
}

main()
  .then(async (code) => {
    await prisma.$disconnect();
    process.exit(code);
  })
  .catch(async (e) => {
    await prisma.$disconnect().catch(() => {});
    printDbError(e);
    process.exit(3);
  });
