/**
 * AgencyOS — GRUPPE-WORKBENCH (8c.3): gruppens EGEN årsplan på samme
 * canvas som spillerens (WorkbenchAarsplan gjenbrukt 1:1 — Anders:
 * gruppen har egen periodisering, spillerne beholder individuelle planer).
 * Perioder-paletten står i venstre kolonne; gruppens faste tider vises
 * under canvaset (lesevisning — timeplanen redigeres på gruppe-detalj).
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TlKort, TlTilbake } from "@/components/admin/v2/oppsett/tl-kit";
import { GruppeFaner } from "@/components/admin/v2/GruppeFaner";
import { GruppeAarsplanKlient } from "./gruppe-aarsplan-klient";
import { coachLagreGruppePeriode, coachSlettGruppePeriode, coachRullUtGruppeAarsplan } from "@/lib/workbench/gruppe-periode-actions";
import { parseSessionBudget } from "@/lib/workbench/perioder";
import { dagNavnKort } from "@/lib/uke-helpers";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gruppe-workbench · AgencyOS" };

const OSLO_TID = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function GruppeWorkbenchPage({ params }: { params: Promise<{ id: string }> }) {
  // G6: gruppe-workbench redigerer gruppens årsplan → EDIT_GROUP_PLANS.
  const user = await requireCapability(Capability.EDIT_GROUP_PLANS);
  const { id } = await params;

  const gruppe = await prisma.group.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      _count: { select: { members: { where: { endedAt: null } } } },
      schedules: { select: { startAt: true, endAt: true, location: true }, orderBy: { startAt: "asc" }, take: 6 },
    },
  });
  if (!gruppe) notFound();

  const blokker = await prisma.groupPeriodBlock.findMany({
    where: { groupId: id },
    orderBy: { startDate: "asc" },
    select: {
      id: true,
      lPhase: true,
      startDate: true,
      endDate: true,
      focus: true,
      weeklyVolMin: true,
      weeklyVolMax: true,
      weeklySessionBudget: true,
    },
  });

  const seasonBlocks = blokker.map((b) => ({
    id: b.id,
    lPhase: b.lPhase,
    startDate: b.startDate.toISOString(),
    endDate: b.endDate.toISOString(),
    focus: b.focus,
    weeklyVolMin: b.weeklyVolMin,
    weeklyVolMax: b.weeklyVolMax,
    budsjett: parseSessionBudget(b.weeklySessionBudget),
  }));

  return (
    <V2Shell bredde="full" aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <div>
        <TlTilbake href={`/admin/grupper/${gruppe.id}`}>{gruppe.name}</TlTilbake>
      </div>
      <GruppeFaner groupId={gruppe.id} aktiv="workbench" />
      <GruppeAarsplanKlient
        gruppeNavn={gruppe.name}
        medlemmer={gruppe._count.members}
        seasonBlocks={seasonBlocks}
        onLagre={coachLagreGruppePeriode.bind(null, gruppe.id)}
        onSlett={coachSlettGruppePeriode.bind(null, gruppe.id)}
        onRullUt={coachRullUtGruppeAarsplan.bind(null, gruppe.id)}
      />
      <TlKort
        eyebrow="Faste gruppetider"
        action={
          <Link href={`/admin/grupper/${gruppe.id}/timeplan`} style={{ fontSize: 13, color: "var(--tl-mute)", textDecoration: "none" }}>
            Rediger timeplan
          </Link>
        }
      >
        {gruppe.schedules.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {gruppe.schedules.map((s, i) => (
              <span
                key={i}
                style={{
                  fontSize: 12,
                  color: "var(--tl-mute)",
                  background: "var(--tl-dock)",
                  boxShadow: "inset 0 0 0 1px var(--tl-hair)",
                  borderRadius: 9,
                  padding: "6px 10px",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {dagNavnKort(s.startAt)} {OSLO_TID.format(s.startAt)}–{OSLO_TID.format(s.endAt)}
                {s.location ? ` · ${s.location}` : ""}
              </span>
            ))}
          </div>
        ) : (
          <span style={{ fontSize: 13, color: "var(--tl-mute)" }}>Ingen faste tider registrert.</span>
        )}
      </TlKort>
    </V2Shell>
  );
}
