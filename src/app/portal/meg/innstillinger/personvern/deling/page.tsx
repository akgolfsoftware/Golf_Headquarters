/**
 * PlayerHQ · Meg · Deling (/portal/meg/innstillinger/personvern/deling) — PH-27 i nytt design
 * (docs/design-system/utkast-playerhq/meg.html, skjermene «PH-27 Deling» og «Deling under 16»).
 *
 * Samtykket per organisasjon og server-handlingene er de samme som før (TnSamtykkeSide):
 * giDelingsSamtykke og trekkDelingsSamtykke. Under 16 kan spilleren trekke, men ikke gi.
 * Den navngitte trenerdelingen leses bare for oversikten; den opprettes på /portal/meg/deling.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { maaHaForesattSamtykke } from "@/lib/health/samtykke-regler";
import { forelderFrist, venterPaaForelder } from "@/lib/auth/minor";
import { grupperMedEksterneLesereForSpiller, hentDelingsStatus } from "@/lib/deling/samtykke";
import { hentEgenTrenerdeling } from "@/lib/deling/navngitt";
import { hentWangTestdeling } from "@/lib/portal-tester/wang-resultat-tilgang";
import { WangTestforesporsel } from "@/components/portal/precision/WangTestforesporsel";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH27Deling, type PH27Data } from "@/components/portal/precision/PH27Deling";
import { giDelingsSamtykke, trekkDelingsSamtykke } from "@/app/portal/meg/innstillinger/personvern/deling-samtykke-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Deling · PlayerHQ" };

const DAG = 24 * 60 * 60 * 1000;
const DATO = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", timeZone: "Europe/Oslo" });

export default async function DelingPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  const krevesForesatt = maaHaForesattSamtykke(user);
  const na = new Date();

  const [grupper, wangTestdeling, wangPlandeling, enrollment, foreldre, navngitt] = await Promise.all([
    grupperMedEksterneLesereForSpiller(user.id),
    hentWangTestdeling(user.id),
    hentWangTestdeling(user.id, "TRENINGSPLAN"),
    prisma.playerEnrollment.findFirst({
      where: { userId: user.id, endedAt: null, coachId: { not: null } },
      orderBy: { enrolledAt: "desc" },
      select: { program: true, coach: { select: { name: true } } },
    }),
    prisma.parentRelation.count({ where: { childId: user.id } }),
    hentEgenTrenerdeling().catch(() => null),
  ]);
  const status = await hentDelingsStatus(user.id, grupper.map((g) => g.id));
  const kart = new Map(status.map((s) => [s.gruppeId, s]));

  async function settSamtykke(scope: string, gruppeId: string, gitt: boolean) {
    "use server";
    return gitt ? giDelingsSamtykke(scope, gruppeId) : trekkDelingsSamtykke(scope, gruppeId);
  }

  const venter = venterPaaForelder(user, na);
  const frist = forelderFrist(user.createdAt);
  const data: PH27Data = {
    organisasjoner: grupper.map((g) => ({
      gruppeId: g.id,
      navn: g.name,
      testerOgResultater: (kart.get(g.id)?.testResultater ?? false) && (kart.get(g.id)?.stats ?? false),
      komplettProfil: kart.get(g.id)?.komplettProfil ?? false,
    })),
    coach: enrollment?.coach?.name ? { navn: enrollment.coach.name, program: enrollment.program } : null,
    navngitte: (navngitt?.invitasjoner ?? [])
      .filter((r): r is typeof r & { status: "AKTIV" | "VENTER" } => r.status === "AKTIV" || r.status === "VENTER")
      .map((r) => ({ id: r.id, epost: r.epost, gruppeNavn: r.gruppeNavn, status: r.status, dato: DATO.format(new Date(r.status === "AKTIV" ? r.opprettet : r.utlop)) })),
    foreldre,
    krevesForesatt,
    venter: venter
      ? { dagerIgjen: Math.max(0, Math.ceil((frist.getTime() - na.getTime()) / DAG)), frist: DATO.format(frist), opprettet: DATO.format(user.createdAt) }
      : null,
  };

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH27Deling
        data={data}
        settSamtykke={settSamtykke}
        ekstra={
          wangTestdeling.length > 0 ? (
            <>
              {wangTestdeling.map((d) => <WangTestforesporsel key={d.gruppeId} {...d} modus={{ type: "spiller" }} />)}
              {wangPlandeling.map((d) => (
                <WangTestforesporsel key={`plan-${d.gruppeId}`} {...d} modus={{ type: "spiller" }} omfang="TRENINGSPLAN" />
              ))}
            </>
          ) : undefined
        }
      />
    </PlayerHQSkall>
  );
}
