/**
 * AgencyOS — GRUPPE-WORKBENCH (8c.3): gruppens EGEN årsplan på samme
 * canvas som spillerens (WorkbenchAarsplan gjenbrukt 1:1 — Anders:
 * gruppen har egen periodisering, spillerne beholder individuelle planer).
 * Perioder-paletten står i venstre kolonne; gruppens faste tider vises
 * under canvaset (lesevisning — timeplanen redigeres på gruppe-detalj).
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke, Kort, Caps } from "@/components/v2";
import { GruppeAarsplanKlient } from "./gruppe-aarsplan-klient";
import { coachLagreGruppePeriode, coachSlettGruppePeriode, coachRullUtGruppeAarsplan } from "@/lib/workbench/gruppe-periode-actions";
import { parseSessionBudget } from "@/lib/workbench/perioder";

export const dynamic = "force-dynamic";

const DAGNAVN = ["man", "tir", "ons", "tor", "fre", "lør", "søn"];

export default async function GruppeWorkbenchPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const gruppe = await prisma.group.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      _count: { select: { members: true } },
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
    <V2Shell aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <div>
        <TilbakeLenke href={`/admin/grupper/${gruppe.id}`}>{gruppe.name}</TilbakeLenke>
      </div>
      <GruppeAarsplanKlient
        gruppeNavn={gruppe.name}
        medlemmer={gruppe._count.members}
        seasonBlocks={seasonBlocks}
        onLagre={coachLagreGruppePeriode.bind(null, gruppe.id)}
        onSlett={coachSlettGruppePeriode.bind(null, gruppe.id)}
        onRullUt={coachRullUtGruppeAarsplan.bind(null, gruppe.id)}
      />
      <Kort eyebrow="Faste gruppetider" action={<Link href={`/admin/grupper/${gruppe.id}/timeplan`} style={{ textDecoration: "none" }}><Caps size={9}>Rediger timeplan →</Caps></Link>}>
        {gruppe.schedules.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {gruppe.schedules.map((s, i) => (
              <span key={i} style={{ fontFamily: "var(--v2-font-mono, monospace)", fontSize: 11, color: "var(--v2-fg2)", background: "var(--v2-panel2)", border: "1px solid var(--v2-border)", borderRadius: 9, padding: "6px 10px" }}>
                {DAGNAVN[(s.startAt.getDay() + 6) % 7]} {String(s.startAt.getHours()).padStart(2, "0")}:{String(s.startAt.getMinutes()).padStart(2, "0")}–{String(s.endAt.getHours()).padStart(2, "0")}:{String(s.endAt.getMinutes()).padStart(2, "0")}{s.location ? ` · ${s.location}` : ""}
              </span>
            ))}
          </div>
        ) : (
          <span style={{ fontFamily: "Inter,system-ui,sans-serif", fontSize: 12, color: "var(--v2-mut)" }}>Ingen faste tider registrert.</span>
        )}
      </Kort>
    </V2Shell>
  );
}
