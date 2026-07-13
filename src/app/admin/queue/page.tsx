/**
 * AgencyOS Oppfølgingskø — v2 (retning C «Presis»). Coachens kontrolltårn:
 * "Hvem trenger en samtale denne uka?" Rekomponert fra legacy (admin/
 * (legacy)/queue): KPI-strip, aktivitets-stripe, 4-kolonners kanban
 * (Risiko/Watch/Sjekk inn/Løst) med signal-kort per spiller.
 *
 * All klassifiserings-logikk beholdt 1:1 (aktiv plan, inaktivitet,
 * SG-fall). Ekte Prisma. Ærlig tomtilstand per kolonne.
 * NB: "Løst"-kolonnen er fortsatt tom-placeholder inntil en
 * CoachingTask-modell finnes (arvet TODO, ikke min endring).
 */

import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { T } from "@/lib/v2/tokens";
import { Caps, Tittel, Kort, KpiFlis, MikroMeta, CTAPill, TilbakeLenke } from "@/components/v2";
import { QueueBoard, type QueueKolonne, type QueueKort, type QueueStatus } from "./_board";

type Status = QueueStatus;
type Kort_ = QueueKort;

function dagerSiden(d: Date | null): number | null {
  if (!d) return null;
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}


export default async function OppfolgingsKoPage() {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const players = await prisma.user.findMany({
    // I0: kun coachede spillere — selvbetjente (PLATFORM_ONLY) er usynlige i AgencyOS.
    where: coachScopedPlayerWhere(coach),
    include: {
      trainingPlans: { where: { isActive: true }, select: { id: true } },
      signals: { where: { kind: "SG_TOTAL" }, orderBy: { computedAt: "desc" }, take: 1 },
    },
  });

  const risk: Kort_[] = [];
  const watch: Kort_[] = [];
  const check: Kort_[] = [];

  for (const p of players) {
    const grunner: string[] = [];
    const tags: Kort_["tags"] = [];
    const stats: Kort_["stats"] = [];

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

    const kort: Kort_ = {
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
  const overstyrt = new Map<string, Status>();
  for (const o of overstyringer) {
    if (overstyrt.has(o.userId)) continue; // nyeste vinner
    const st = (o.payload as { status?: string } | null)?.status;
    if (st === "risk" || st === "watch" || st === "check" || st === "ok") overstyrt.set(o.userId, st);
  }

  const ok: Kort_[] = [];
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

  const kolonner: { status: Status; tittel: string; beskrivelse: string; kort: Kort_[] }[] = [
    { status: "risk", tittel: "Risiko", beskrivelse: "Krever en samtale innen 48 timer.", kort: risk },
    { status: "watch", tittel: "Watch", beskrivelse: "Trender feil retning — følg med.", kort: watch },
    { status: "check", tittel: "Sjekk inn", beskrivelse: "Lett oppdatering — kjapp melding holder.", kort: check },
    { status: "ok", tittel: "Løst · siste 7d", beskrivelse: "Tett-tett. Du kan markere «ikke vis» per sak.", kort: ok },
  ];

  const totalAktive = risk.length + watch.length + check.length;

  return (
    <V2Shell aktiv="cockpit" nav={AGENCYOS_NAV} navn={coach.name} avatarUrl={coach.avatarUrl}>
      <TilbakeLenke href="/admin/innboks">Innboks</TilbakeLenke>
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {/* Hode */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
          <div>
            <Caps>AgencyOS · Oppfølgingskø</Caps>
            <div style={{ marginTop: 10 }}>
              <Tittel em="samtale">Hvem trenger en</Tittel>
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "10px 0 0" }}>
              Plattformen flagger — du bestemmer.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/admin/settings" style={{ textDecoration: "none" }}>
              <CTAPill ghost icon="settings">
                Justere regler
              </CTAPill>
            </Link>
            <CTAPill ghost icon="sparkles">
              Generer AI-aksjoner
            </CTAPill>
          </div>
        </div>

        {/* KPI-strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: T.gap }}>
          <KpiFlis label="Risiko" value={risk.length} delta="krever samtale < 48 t" />
          <KpiFlis label="Watch" value={watch.length} delta="trender feil retning" />
          <KpiFlis label="Sjekk inn" value={check.length} delta="lett oppdatering" />
          <KpiFlis label="Løst · 7d" value={ok.length} delta="markert ferdig" />
        </div>

        {/* Aktivitets-stripe */}
        <Kort pad="12px 18px">
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18 }}>
            <Caps>Aktivitet · siste 7d</Caps>
            <MikroMeta icon="check-circle">
              Løst <b style={{ color: T.fg }}>{ok.length}</b> saker
            </MikroMeta>
            <MikroMeta icon="bell">
              Flagget <b style={{ color: T.fg }}>{totalAktive}</b> aktive
            </MikroMeta>
            <span style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", color: T.mut }}>
              Av {players.length} spillere totalt
            </span>
          </div>
        </Kort>

        {/* Board — I5: kanban med drag-and-drop (klient) */}
        <QueueBoard kolonner={kolonner as QueueKolonne[]} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
          <span style={{ fontFamily: T.mono, fontSize: 10.5, textTransform: "uppercase", color: T.mut }}>AgencyOS · Oppfølgingskø</span>
          <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>{totalAktive} aktive saker</span>
        </div>
      </div>
    </V2Shell>
  );
}
