/**
 * PlayerHQ · Meg (/portal/meg) — Precision Athletics PH-24
 * (Claude Design 7d7c2994, ui_kits/playerhq/screens/PH-24.jsx).
 * Data og tilgang som før (hentProfil, abonnement, bookinger, foreldre, helse);
 * visningen er PH24Meg. Helsedata leses bare når spilleren har samtykket.
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
import { formaterTall } from "@/lib/format-tall";
import { pakkeNavn } from "@/lib/domain/abonnement";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH24Meg, type PH24Props, type PH24Rad } from "@/components/portal/precision/PH24Meg";

export const dynamic = "force-dynamic";
export const metadata = { title: "Meg · PlayerHQ" };

const OSLO = { timeZone: "Europe/Oslo" } as const;
const DMA = new Intl.DateTimeFormat("nb-NO", { ...OSLO, day: "2-digit", month: "2-digit", year: "numeric" });
const DM = new Intl.DateTimeFormat("nb-NO", { ...OSLO, day: "2-digit", month: "2-digit" });
const KL = new Intl.DateTimeFormat("nb-NO", { ...OSLO, hour: "2-digit", minute: "2-digit" });
const MND = new Intl.DateTimeFormat("nb-NO", { ...OSLO, month: "long", year: "numeric" });
const dma = (d: Date) => DMA.format(d).replaceAll("/", ".");
const dm = (d: Date) => DM.format(d).replaceAll("/", ".");

function alderFra(fodt: Date | null, na: Date): number | null {
  if (!fodt) return null;
  let a = na.getUTCFullYear() - fodt.getUTCFullYear();
  if (na.getUTCMonth() < fodt.getUTCMonth() || (na.getUTCMonth() === fodt.getUTCMonth() && na.getUTCDate() < fodt.getUTCDate())) a -= 1;
  return a;
}
function relasjon(r: string): string {
  const l = r.toLowerCase();
  if (l === "father" || l === "far") return "FAR";
  if (l === "mother" || l === "mor") return "MOR";
  if (l === "guardian" || l === "verge") return "VERGE";
  return r.toUpperCase();
}
const FRAVAER_NAVN: Record<string, string> = { SKADE: "Skade", SYKDOM: "Sykdom", REISE: "Reise", JOBB: "Jobb", STUDIER: "Studier", ANNET: "Annet" };

export default async function MegPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const na = new Date();
  let props: Omit<PH24Props, "hrefs"> | null = null;
  let uleste = 0;
  try {
    const helseSamtykke = await harManuellHelseSamtykke(user.id);
    const [profil, ekstra, abo, utstyr, bookinger, foreldre, fasiliteter, enrollment, utfordringer, venner, dash, helse] = await Promise.all([
      hentProfil(),
      hentProfilEkstra(user.id),
      getAbonnementData(user.id),
      hentUtstyrFlate(user.id),
      prisma.booking.findMany({
        where: { userId: user.id, startAt: { gte: na }, status: { in: ["CONFIRMED", "PENDING"] } },
        include: { serviceType: { select: { name: true } }, location: { select: { name: true } } },
        orderBy: { startAt: "asc" },
        take: 3,
      }),
      prisma.parentRelation.findMany({
        where: { childId: user.id },
        include: { parent: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.playerFacility.findMany({ where: { userId: user.id }, select: { id: true, name: true }, orderBy: { sortOrder: "asc" } }),
      prisma.playerEnrollment.findFirst({
        where: { userId: user.id, endedAt: null, coachId: { not: null } },
        orderBy: { enrolledAt: "desc" },
        select: { program: true, enrolledAt: true, coach: { select: { name: true } } },
      }),
      prisma.drillChallenge.findMany({
        where: { status: "ACTIVE", OR: [{ ownerId: user.id }, { participants: { some: { userId: user.id } } }] },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { id: true, name: true, endAt: true },
      }),
      prisma.friendship.count({ where: { status: "ACCEPTED", OR: [{ userAId: user.id }, { userBId: user.id }] } }),
      getUnreadNotifications(user.id, 1).catch(() => null),
      helseSamtykke ? hentHelse(user.id, na) : null,
    ]);
    uleste = dash?.count ?? 0;

    const plan = pakkeNavn(abo.monthlyCredits) ?? (abo.erPro ? "PlayerHQ FULL" : "TALENT · gratis");
    props = {
      tilstand: "data",
      profil: {
        navn: profil.user.name,
        alder: alderFra(profil.user.dateOfBirth, na),
        klubb: profil.user.homeClub,
        fodt: profil.user.dateOfBirth ? dma(profil.user.dateOfBirth) : null,
        hcp: profil.user.hcp != null ? formaterTall(profil.user.hcp, 1, true) : null,
        golfId: ekstra.ngfId,
        epost: profil.user.email,
        telefon: profil.user.phone,
      },
      fasiliteter: fasiliteter.map((f) => ({ id: f.id, navn: f.name })),
      bookinger: bookinger.map((b): PH24Rad => ({
        id: b.id,
        tittel: b.serviceType.name,
        status: { tekst: b.status === "CONFIRMED" ? "Bekreftet" : "Venter på betaling", tone: b.status === "CONFIRMED" ? "ok" : "neutral" },
        meta: `${dm(b.startAt)} KL ${KL.format(b.startAt)} · ${(b.location?.name ?? "—").toUpperCase()}`,
      })),
      klipp: abo.monthlyCredits > 0 ? { igjen: abo.creditsRemaining, totalt: abo.monthlyCredits, fornyes: abo.nesteTrekk ? dma(abo.nesteTrekk) : null } : null,
      abo: { plan, fornyes: abo.nesteTrekk ? dma(abo.nesteTrekk) : null, pris: null },
      foreldre: foreldre.map((f): PH24Rad => ({ id: f.id, tittel: f.parent.name ?? f.parent.email, meta: `${relasjon(f.relationship)} · ${f.parent.email.toUpperCase()}` })),
      helse: helse ? { samtykke: true, ...helse } : { samtykke: false, sovnSnitt: null, skadeNa: false, fravaer: [] },
      utstyr: utstyr.bagFelter.concat(utstyr.tilbehor).map((f) => ({ kode: f.kort, spec: f.verdi, carry: null })),
      utstyrMalt: null,
      coach: enrollment ? { navn: enrollment.coach!.name, program: enrollment.program, siden: MND.format(enrollment.enrolledAt).toUpperCase() } : null,
      venner,
      utfordringer: utfordringer.map((u): PH24Rad => ({ id: u.id, tittel: u.name, status: { tekst: "Pågår", tone: "neutral" }, meta: `${u.endAt ? "SLUTT " + dma(u.endAt) : "UTEN SLUTTDATO"} · TELLER IKKE SOM TRENING` })),
    };
  } catch {
    props = null;
  }

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH24Meg
        {...(props ?? { tilstand: "feil" as const, profil: { navn: "", alder: null, klubb: null, fodt: null, hcp: null, golfId: null, epost: null, telefon: null }, fasiliteter: [], bookinger: [], klipp: null, abo: { plan: "—", fornyes: null, pris: null }, foreldre: [], helse: { samtykke: false, sovnSnitt: null, skadeNa: false, fravaer: [] }, utstyr: [], utstyrMalt: null, coach: null, venner: 0, utfordringer: [] })}
        ukjentKode={props ? undefined : "FEIL 503 · PROFIL"}
        hrefs={{
          profil: "/portal/meg/profil", fasiliteter: "/portal/meg/innstillinger/anlegg", book: "/portal/booking/ny", bookinger: "/portal/meg/bookinger",
          abo: "/portal/meg/abonnement", foreldre: "/portal/meg/foreldre", deling: "/portal/meg/innstillinger/personvern/deling", fravaer: "/portal/meg/helse/symptom/ny",
          helse: "/portal/meg/helse", utstyr: "/portal/meg/utstyr", utfordringer: "/portal/utfordringer", venner: "/portal/venner", hjelp: "/portal/meg/help",
          innstillinger: "/portal/meg/innstillinger", mal: "/portal/mal", personvern: "/portal/meg/innstillinger/personvern",
        }}
      />
    </PlayerHQSkall>
  );
}

async function hentHelse(userId: string, na: Date) {
  const ukeGrense = new Date(na);
  ukeGrense.setUTCHours(0, 0, 0, 0);
  ukeGrense.setUTCDate(ukeGrense.getUTCDate() - 6);
  const [sovn, leaves, aktivSkade] = await Promise.all([
    prisma.healthEntry.findMany({ where: { userId, date: { gte: ukeGrense }, sleepHours: { not: null } }, select: { sleepHours: true } }),
    prisma.leave.findMany({
      where: { userId, OR: [{ endAt: null }, { endAt: { gte: new Date(na.getTime() - 30 * 86400000) } }] },
      orderBy: { startAt: "desc" },
      take: 4,
    }),
    prisma.leave.count({ where: { userId, isInjury: true, returnedAt: null, OR: [{ endAt: null }, { endAt: { gte: na } }] } }),
  ]);
  const snitt = sovn.length ? sovn.reduce((s, e) => s + (e.sleepHours ?? 0), 0) / sovn.length : null;
  const fravaer: PH24Rad[] = leaves.map((l) => {
    const paagar = l.returnedAt == null && (l.endAt == null || l.endAt >= na);
    const planlagt = l.startAt > na;
    return {
      id: l.id,
      tittel: `${FRAVAER_NAVN[l.reason] ?? l.reason} · ${dm(l.startAt)}–${l.endAt ? dm(l.endAt) : "pågår"}`,
      status: { tekst: planlagt ? "Planlagt" : paagar ? "Pågår" : "Avsluttet", tone: "neutral" as const },
      meta: l.description ? l.description.slice(0, 80).toUpperCase() : null,
    };
  });
  return { sovnSnitt: snitt != null ? `${formaterTall(snitt, 1, true)} t` : null, skadeNa: aktivSkade > 0, fravaer };
}
