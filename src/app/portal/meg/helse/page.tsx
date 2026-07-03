/**
 * Helse — /portal/meg/helse, portet FRA fersk Claude Design-fasit:
 *   (historisk juni-fasit, fjernet fra repo) playerhq-app/ph-screens.jsx
 *   (HelseScreen, linje 710–734) via MeSub/SetGroup/SetRow-primitivene.
 *
 * Element-liste (fasit, topp → bunn):
 *   1. MeSub-header: MEG · HELSE + "Helse & readiness." + lead
 *   2. 3-KPI-grid: FYS-score (stall-relativ testbatteri-form 0–100, Anders' formel 2026-06-22;
 *      «—» hvis spilleren mangler FYS-tester) · Hvilepuls bpm · Søvn t (EKTE siste HealthEntry)
 *   3. DENNE UKA: Søvn (ekte snitt siste 7 døgn) · Belastning · HRV
 *      («—» der data/formel mangler — aldri liksom-tall)
 *   4. SKADE & STATUS: ekte Leave-data (isInjury); «Ingen aktive skader» ellers
 *   5. Accent-kort (lime venstrekant): plassholder-disclaimer fra fasiten
 *   6. Primary-knapp «Logg søvn / status» → åpner eksisterende logg-form
 *      (HelseForm, samme lagre-action som før)
 *
 * Server component. Auth-guard beholdt (requirePortalUser).
 */

import { Activity, BatteryMedium, CircleCheck, Moon, Stethoscope } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { hentFysScore } from "@/lib/fys-data";
import { hentBelastning } from "@/lib/health/belastning";
import { MeSub, SetGroup, SetRow, SetVal } from "@/components/portal/meg/meg-sub";
import { AthleticBadge } from "@/components/athletic/badge";
import { KpiCard } from "@/components/athletic/kpi";
import { HelseForm } from "./helse-form";

function formatDatoKort(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}

function formatTimer(t: number): string {
  return t.toFixed(1).replace(".", ",");
}

export default async function HelsePage() {
  const user = await requirePortalUser();

  // Siste 14 dagers logg, nyest først.
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - 13);

  const now = new Date();
  const [entries, aktivSkade, tidligereSkader, fys, belastning] = await Promise.all([
    prisma.healthEntry.findMany({
      where: { userId: user.id, date: { gte: since } },
      orderBy: { date: "desc" },
    }),
    prisma.leave.findFirst({
      where: {
        userId: user.id,
        isInjury: true,
        returnedAt: null,
        OR: [{ endAt: null }, { endAt: { gte: now } }],
      },
      orderBy: { startAt: "desc" },
    }),
    prisma.leave.count({
      where: {
        userId: user.id,
        isInjury: true,
        OR: [{ returnedAt: { not: null } }, { endAt: { lt: now } }],
      },
    }),
    hentFysScore(user.id),
    hentBelastning(user.id),
  ]);

  const siste = entries[0];
  const iDagIso = new Date().toISOString().slice(0, 10);
  const initial = {
    date: iDagIso,
    restingHr: siste?.restingHr ?? null,
    hrv: siste?.hrv ?? null,
    sleepHours: siste?.sleepHours ?? null,
    weightKg: siste?.weightKg ?? null,
    notes: siste?.notes ?? null,
  };

  // Ekte søvn-snitt siste 7 døgn (kun logger med sleepHours).
  const ukeGrense = new Date();
  ukeGrense.setUTCHours(0, 0, 0, 0);
  ukeGrense.setUTCDate(ukeGrense.getUTCDate() - 6);
  const sovnUke = entries.filter(
    (e): e is typeof e & { sleepHours: number } =>
      e.sleepHours !== null && e.date >= ukeGrense,
  );
  const sovnSnitt =
    sovnUke.length > 0
      ? sovnUke.reduce((sum, e) => sum + e.sleepHours, 0) / sovnUke.length
      : null;

  return (
    <MeSub
      eyebrow="MEG · HELSE"
      title="Helse &"
      italic="readiness."
      lead="Søvn, puls, HRV, belastning og FYS-form — alt fra dine egne ekte logger og tester."
    >
      <div className="mb-[22px] grid grid-cols-3 gap-3">
        {/* FYS-score: testbatteri → stall-relativ samlet form (Anders' formel 2026-06-22). */}
        <KpiCard
          label="FYS-score"
          value={fys.harTester && fys.score != null ? String(fys.score) : "—"}
          trend={{
            value: fys.harTester ? `${fys.antallTester}/5 tester` : "Ingen FYS-tester",
            tone: "neutral",
          }}
        />
        <KpiCard
          label="Hvilepuls"
          value={siste?.restingHr != null ? String(siste.restingHr) : "—"}
          unit={siste?.restingHr != null ? "bpm" : undefined}
        />
        <KpiCard
          label="Søvn"
          value={siste?.sleepHours != null ? formatTimer(siste.sleepHours) : "—"}
          unit={siste?.sleepHours != null ? "t" : undefined}
        />
      </div>

      <SetGroup label="DENNE UKA">
        <SetRow
          icon={Moon}
          title="Søvn"
          meta={
            sovnSnitt != null
              ? `Snitt siste 7 døgn · ${sovnUke.length} logger`
              : "Ingen søvn-logger siste 7 døgn"
          }
          right={<SetVal>{sovnSnitt != null ? `${formatTimer(sovnSnitt)} t` : "—"}</SetVal>}
        />
        <SetRow
          icon={Activity}
          title="Belastning"
          meta={
            belastning.harData
              ? "Siste uke vs 4-ukers snitt (trening + runder)"
              : "For lite trenings-historikk siste 4 uker"
          }
          right={
            <SetVal>
              {belastning.prosentAvNormalt != null
                ? `${belastning.prosentAvNormalt}%`
                : "—"}
            </SetVal>
          }
        />
        <SetRow
          icon={BatteryMedium}
          title="HRV"
          meta={siste?.hrv != null ? "Restitusjon (RMSSD, ms)" : "Restitusjon · logg HRV i skjemaet"}
          right={<SetVal>{siste?.hrv != null ? `${siste.hrv} ms` : "—"}</SetVal>}
        />
      </SetGroup>

      <SetGroup label="SKADE & STATUS">
        {aktivSkade ? (
          <SetRow
            icon={Stethoscope}
            title="Aktiv skade"
            meta={`Siden ${formatDatoKort(aktivSkade.startAt)}`}
            right={<AthleticBadge variant="warn">Aktiv</AthleticBadge>}
          />
        ) : (
          <SetRow
            icon={CircleCheck}
            title="Ingen aktive skader"
            meta={siste ? `Sist logget ${formatDatoKort(siste.date)}` : "Ingen logger ennå"}
            right={<AthleticBadge variant="ok">Frisk</AthleticBadge>}
          />
        )}
        {tidligereSkader > 0 && (
          <SetRow
            icon={Stethoscope}
            title="Skadehistorikk"
            meta="Tidligere skadeperioder"
            right={<SetVal>{tidligereSkader}</SetVal>}
          />
        )}
      </SetGroup>

      <div className="rounded-xl border border-border border-l-[3px] border-l-accent bg-card px-4 py-3.5 text-[13px] leading-[1.55] text-muted-foreground">
        <b className="font-semibold text-foreground">FYS-score</b> er din samlede testbatteri-form
        (0–100, relativt til stallen). <b className="font-semibold text-foreground">Belastning</b> viser
        siste ukes trening + runder som prosent av ditt eget 4-ukers snitt (100 % = som vanlig).{" "}
        <b className="font-semibold text-foreground">HRV</b> (RMSSD i ms) logger du selv ved siden av
        hvilepuls — en wearable-sync kan fylle samme felt senere.
      </div>

      <div className="mt-4">
        <HelseForm initial={initial} />
      </div>
    </MeSub>
  );
}
