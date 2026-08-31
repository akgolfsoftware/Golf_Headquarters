import "server-only";

/**
 * Oppfølgingskø-dataen (MASTERPLAN 15.11) — flyttet 1:1 fra
 * `admin/queue/page.tsx` (som nå er en ren redirect). Samme
 * klassifiserings-logikk som før (aktiv plan, inaktivitet, SG-fall),
 * samme coach-scope, samme manuelle overstyringer (Signal
 * OPPFOLGING_STATUS). Kun flyttet ut av siden slik at «Oppfølging»-fanen i
 * /admin/spillere kan gjenbruke den uten å duplisere.
 *
 * NB: «Løst»-kolonnen er fortsatt tom-placeholder inntil en CoachingTask-
 * modell finnes (arvet TODO, ikke denne flyttingens ansvar).
 */

import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import type { QueueKolonne, QueueKort, QueueStatus } from "@/app/admin/queue/_board";

export type OppfolgingsKoData = {
  kolonner: QueueKolonne[];
  totalAktive: number;
  spillereTotalt: number;
};

function dagerSiden(d: Date | null): number | null {
  if (!d) return null;
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export async function loadOppfolgingsKo(coach: { id: string; role: string }): Promise<OppfolgingsKoData> {
  const players = await prisma.user.findMany({
    // I0: kun coachede spillere — selvbetjente (PLATFORM_ONLY) er usynlige i AgencyOS.
    where: coachScopedPlayerWhere(coach),
    include: {
      trainingPlans: { where: { isActive: true }, select: { id: true } },
      signals: { where: { kind: "SG_TOTAL" }, orderBy: { computedAt: "desc" }, take: 1 },
    },
  });

  const risk: QueueKort[] = [];
  const watch: QueueKort[] = [];
  const check: QueueKort[] = [];

  for (const p of players) {
    const grunner: string[] = [];
    const tags: QueueKort["tags"] = [];
    const stats: QueueKort["stats"] = [];

    if (p.trainingPlans.length === 0) {
      grunner.push("Ingen aktiv plan");
      tags.push({ label: "uten plan", tone: "down" });
    }
    const dager = dagerSiden(p.lastLoginAt);
    if (!p.lastLoginAt || (dager !== null && dager > 14)) {
      grunner.push(`Ikke aktiv ${dager ?? "∞"}d`);
      tags.push({ label: "stille", tone: "warn" });
    }
    const sg = p.signals[0]?.value;
    if (sg != null) {
      stats.push({ k: "SG · siste", v: `${sg >= 0 ? "+" : ""}${sg.toFixed(1).replace(".", ",")}`, tone: sg < 0 ? "down" : "up" });
    }
    if (sg != null && sg < -0.5) tags.push({ label: "score-fall", tone: "down" });
    if (dager != null) stats.push({ k: "Siste innlogg", v: `${dager}d` });

    if (grunner.length === 0) continue;

    const kort: QueueKort = {
      id: p.id,
      navn: p.name,
      epost: p.email,
      signalTekst: grunner.join(" · "),
      signalIkon: sg != null && sg < -0.5 ? "trending-down" : grunner.length >= 2 ? "alert-triangle" : "clock",
      stats,
      tags,
      siden: p.lastLoginAt ? `sist innlogget ${dagerSiden(p.lastLoginAt) ?? 0} dager siden` : "aldri innlogget",
      prioritet: grunner.length >= 3,
    };

    if (grunner.length >= 3) risk.push(kort);
    else if (grunner.length === 2) watch.push(kort);
    else check.push(kort);
  }

  // I5: coachens manuelle overstyringer siste 7 dager (Signal
  // OPPFOLGING_STATUS — skrevet når et kort dras til en annen kolonne).
  const sjuDager = new Date();
  sjuDager.setDate(sjuDager.getDate() - 7);
  const overstyringer = await prisma.signal.findMany({
    where: { kind: "OPPFOLGING_STATUS", computedAt: { gte: sjuDager } },
    orderBy: { computedAt: "desc" },
    select: { userId: true, payload: true },
  });
  const overstyrt = new Map<string, QueueStatus>();
  for (const o of overstyringer) {
    if (overstyrt.has(o.userId)) continue; // nyeste vinner
    const st = (o.payload as { status?: string } | null)?.status;
    if (st === "risk" || st === "watch" || st === "check" || st === "ok") overstyrt.set(o.userId, st);
  }

  const ok: QueueKort[] = [];
  // Flytt overstyrte kort dit coachen la dem (nyeste signal <7d vinner).
  for (const liste of [risk, watch, check]) {
    for (let i = liste.length - 1; i >= 0; i--) {
      const maal = overstyrt.get(liste[i].id);
      if (!maal) continue;
      const [kort] = liste.splice(i, 1);
      kort.tags = [...kort.tags, { label: maal === "ok" ? "kvittert" : "manuelt plassert", tone: "up" }];
      if (maal === "risk") risk.push(kort);
      else if (maal === "watch") watch.push(kort);
      else if (maal === "check") check.push(kort);
      else ok.push(kort);
    }
  }

  const kolonner: QueueKolonne[] = [
    { status: "risk", tittel: "Risiko", beskrivelse: "Krever en samtale innen 48 timer.", kort: risk },
    { status: "watch", tittel: "Watch", beskrivelse: "Trender feil retning — følg med.", kort: watch },
    { status: "check", tittel: "Sjekk inn", beskrivelse: "Lett oppdatering — kjapp melding holder.", kort: check },
    { status: "ok", tittel: "Løst · siste 7d", beskrivelse: "Tett-tett. Du kan markere «ikke vis» per sak.", kort: ok },
  ];

  const totalAktive = risk.length + watch.length + check.length;

  return { kolonner, totalAktive, spillereTotalt: players.length };
}
