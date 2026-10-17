/**
 * PlayerHQ · Meg (/portal/meg) — PH-24 i nytt design (docs/design-system/utkast-playerhq/meg.html).
 * Data og tilgang som før (hentProfil, abonnement, bookinger, foreldre, helse, deling);
 * visningen er PH24Meg. Helsestatus leses bare når spilleren har samtykket.
 * Talentradar vises aldri.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentProfil } from "@/app/portal/meg/actions";
import { prisma } from "@/lib/prisma";
import { hentProfilEkstra } from "@/lib/portal/profil-flate-data";
import { getAbonnementData } from "@/lib/portal-abonnement/abonnement-data";
import { hentUtstyrFlate } from "@/lib/portal/utstyr-data";
import { harManuellHelseSamtykke } from "@/lib/health/samtykke";
import { grupperMedEksterneLesereForSpiller, hentDelingsStatus } from "@/lib/deling/samtykke";
import { formaterTall } from "@/lib/format-tall";
import { pakkeNavn } from "@/lib/domain/abonnement";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH24Meg, type PH24Props } from "@/components/portal/precision/PH24Meg";
import { ANTALL_FASILITETER } from "@/lib/portal/fasilitet-katalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Meg · PlayerHQ" };

const OSLO = { timeZone: "Europe/Oslo" } as const;
const NESTE = new Intl.DateTimeFormat("nb-NO", { ...OSLO, weekday: "long", day: "numeric", month: "long" });
const KL = new Intl.DateTimeFormat("nb-NO", { ...OSLO, hour: "2-digit", minute: "2-digit" });

const HREFS: PH24Props["hrefs"] = {
  profil: "/portal/meg/profil", fasiliteter: "/portal/meg/innstillinger/anlegg", utstyr: "/portal/meg/utstyr",
  helse: "/portal/meg/helse", coach: "/portal/coach", bookinger: "/portal/meg/bookinger", mal: "/portal/mal",
  foreldre: "/portal/meg/foreldre", deling: "/portal/meg/innstillinger/personvern/deling", utfordringer: "/portal/utfordringer",
  abo: "/portal/meg/abonnement", innstillinger: "/portal/meg/innstillinger", hjelp: "/portal/meg/help",
};

const FEIL: PH24Props = {
  tilstand: "feil", navn: "", undertekst: null, gruppe: null, kategori: null, hcp: null, pakke: null,
  niva: { navn: "Gratis", tekst: "" }, deling: null, fasiliteter: { valgte: 0, totalt: ANTALL_FASILITETER, steder: 0 },
  utstyr: 0, helse: "", coach: null, nesteBooking: null, foreldre: { navn: null, antall: 0 }, utfordringer: 0, hrefs: HREFS,
};

export default async function MegPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const na = new Date();
  let props: PH24Props = FEIL;
  let uleste = 0;
  try {
    const helseSamtykke = await harManuellHelseSamtykke(user.id);
    const [profil, ekstra, abo, utstyr, neste, foreldre, steder, valgte, enrollment, utfordringer, dash, aktivSkade, delingsgrupper] = await Promise.all([
      hentProfil(),
      hentProfilEkstra(user.id),
      getAbonnementData(user.id),
      hentUtstyrFlate(user.id),
      prisma.booking.findFirst({
        where: { userId: user.id, startAt: { gte: na }, status: { in: ["CONFIRMED", "PENDING"] } },
        orderBy: { startAt: "asc" },
        select: { startAt: true },
      }),
      prisma.parentRelation.findMany({
        where: { childId: user.id },
        include: { parent: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.playerFacility.count({ where: { userId: user.id } }),
      prisma.user.findUnique({ where: { id: user.id }, select: { tilgjengeligeFasiliteter: true } }),
      prisma.playerEnrollment.findFirst({
        where: { userId: user.id, endedAt: null, coachId: { not: null } },
        orderBy: { enrolledAt: "desc" },
        select: { program: true, coach: { select: { name: true } } },
      }),
      prisma.drillChallenge.count({ where: { status: "ACTIVE", OR: [{ ownerId: user.id }, { participants: { some: { userId: user.id } } }] } }),
      getUnreadNotifications(user.id, 1).catch(() => null),
      helseSamtykke
        ? prisma.leave.count({ where: { userId: user.id, isInjury: true, returnedAt: null, OR: [{ endAt: null }, { endAt: { gte: na } }] } })
        : Promise.resolve(0),
      grupperMedEksterneLesereForSpiller(user.id),
    ]);
    uleste = dash?.count ?? 0;
    const delingStatus = await hentDelingsStatus(user.id, delingsgrupper.map((g) => g.id)).catch(() => null);

    const pakke = pakkeNavn(abo.monthlyCredits);
    const coachNavn = enrollment?.coach?.name ?? null;
    props = {
      tilstand: "data",
      navn: profil.user.name,
      undertekst: [profil.user.homeClub, coachNavn ? `coach ${coachNavn}` : null].filter(Boolean).join(" · ") || null,
      gruppe: ekstra.stallNavn,
      kategori: null,
      hcp: profil.user.hcp != null ? formaterTall(profil.user.hcp, 1, true) : null,
      pakke: pakke ? { navn: pakke, igjen: abo.creditsRemaining, totalt: abo.monthlyCredits } : null,
      niva: abo.erPro
        ? { navn: "Full", tekst: pakke ? `inkludert i ${pakke}` : "aktivt abonnement" }
        : { navn: "Gratis", tekst: "Full gir Plan, Workbench og Caddie" },
      deling: delingStatus ? delingStatus.filter((s) => s.testResultater || s.stats || s.komplettProfil).length : null,
      fasiliteter: { valgte: valgte?.tilgjengeligeFasiliteter.length ?? 0, totalt: ANTALL_FASILITETER, steder },
      utstyr: utstyr.bagFelter.length + utstyr.tilbehor.length,
      helse: !helseSamtykke ? "Helse-loggen er slått av" : aktivSkade > 0 ? "Skade registrert" : "Ingen skade registrert",
      coach: enrollment && coachNavn ? { navn: coachNavn, program: enrollment.program } : null,
      nesteBooking: neste ? `${NESTE.format(neste.startAt)} kl. ${KL.format(neste.startAt)}` : null,
      foreldre: { navn: foreldre[0] ? foreldre[0].parent.name ?? foreldre[0].parent.email : null, antall: foreldre.length },
      utfordringer,
      hrefs: HREFS,
    };
  } catch {
    props = FEIL;
  }

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH24Meg {...props} />
    </PlayerHQSkall>
  );
}
