/**
 * Foreldreportal · hovedside — Paper-port PP-3 (fase 1).
 * Fasit: designsystem/paper/fase1/foreldreportal.html — ÉN skjerm med fem
 * faner (Oversikt · Samtykker · Betaling · Plan · Kontakt).
 *
 * Auth uendret: kun PARENT slippes inn (requirePortalUser). Datakilder er de
 * eksisterende loaderne (hentForelderOversikt i lib/forelder) supplert med
 * samtykke-status fra de eksisterende tabellene (guardianConsent på User,
 * LydSamtykke, HelseSamtykke via hentSamtykkeStatus). Underrutene består
 * uendret og lenkes fra fanene.
 *
 * PII: barnets data vises kun bak PARENT-gaten — samme gate som før.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { hentForelderOversikt } from "@/lib/forelder";
import { hentSamtykkeStatus } from "@/lib/health/samtykke";
import { V2Shell, FORELDER_NAV } from "@/components/v2/shell";
import {
  ForelderV2,
  type ForelderPortalData,
  type ForelderSamtykkeItem,
} from "@/components/portal/v2/ForelderV2";
import { TomTilstand } from "@/components/v2";
import type { PaymentStatus } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const OSLO_DATO = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const OSLO_DAG = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  weekday: "short",
  day: "numeric",
  month: "numeric",
});

/** «man 4.8» — fasitens dagformat i Plan-fanen. */
function dagKort(d: Date): string {
  return OSLO_DAG.format(d).replace(",", "").replace("./", ".");
}

function kr(ore: number): string {
  const heltall = Math.round(ore / 100);
  return `${String(heltall).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} kr`;
}

const STATUS_NAVN: Record<PaymentStatus, string> = {
  PENDING: "utestående",
  SUCCEEDED: "betalt",
  FAILED: "feilet",
  REFUNDED: "refundert",
  PARTIALLY_REFUNDED: "delvis refundert",
};

const UBETALT: PaymentStatus[] = ["PENDING", "FAILED"];

export default async function ForelderPage({
  searchParams,
}: {
  searchParams: Promise<{ fane?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const [sp, oversikt] = await Promise.all([
    searchParams,
    hentForelderOversikt(user.id),
  ]);

  if (!oversikt.fokusBarn) {
    return (
      <V2Shell
        bredde="kolonne"
        aktiv="oversikt"
        nav={FORELDER_NAV}
        navn={user.name}
        avatarUrl={user.avatarUrl}
      >
        <TomTilstand
          icon="users"
          title="Ingen barn er koblet ennå"
          sub="Be coachen om en forelder-invitasjon, så dukker barnets portal opp her."
        />
      </V2Shell>
    );
  }

  const childId = oversikt.fokusBarn.id;
  const childName = oversikt.fokusBarn.name;
  const fornavn = childName.split(" ")[0] ?? childName;

  const [barnRad, lyd, helse, payments, coachRad] = await Promise.all([
    prisma.user.findUnique({
      where: { id: childId },
      select: { guardianConsentGivenAt: true },
    }),
    prisma.lydSamtykke.findUnique({ where: { userId: childId } }),
    hentSamtykkeStatus(childId),
    prisma.payment.findMany({
      where: { userId: childId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        amountOre: true,
        status: true,
        type: true,
        description: true,
        createdAt: true,
      },
    }),
    // Coach-kontakt: siste booking som faktisk har en coach (samme mønster
    // som /forelder/coach).
    prisma.booking.findFirst({
      where: { userId: childId, coachId: { not: null } },
      orderBy: { startAt: "desc" },
      select: { coach: { select: { name: true, email: true } } },
    }),
  ]);

  /* ── Samtykker — kun det datamodellen faktisk bærer ─────────────── */
  const samtykker: ForelderSamtykkeItem[] = [];

  samtykker.push({
    k: "foresatt",
    navn: "Foresattbekreftelse",
    gitt: barnRad?.guardianConsentGivenAt != null,
    dato: barnRad?.guardianConsentGivenAt
      ? OSLO_DATO.format(barnRad.guardianConsentGivenAt)
      : null,
    d: `Bekrefter at du er foresatt og har godkjent at ${fornavn} bruker AK Golf HQ.`,
    kanTrekke: false,
    laasGrunn:
      "Kan ikke trekkes her. Skal avtalen avsluttes, gjøres det med coachen direkte.",
  });

  // Lyd-raden vises kun når en LydSamtykke-rad finnes (ærlig — ingen rad = ikke etterspurt).
  if (lyd) {
    samtykker.push({
      k: "lyd",
      navn: "Lydopptak i videoanalyse",
      gitt: lyd.status === "GITT",
      dato: lyd.gittAt ? OSLO_DATO.format(lyd.gittAt) : null,
      d: lyd.ordlyd,
      kanTrekke: false,
      laasGrunn:
        "Gis og trekkes via lenken i e-posten du fikk — eller ta det direkte med coachen.",
    });
  }

  const helseGitt = helse.wearable || helse.manuell;
  samtykker.push({
    k: "helse",
    navn: "Helsedata",
    gitt: helseGitt,
    dato: helse.wearableGittAt ? OSLO_DATO.format(helse.wearableGittAt) : null,
    d: "Lar coachen og appen bruke skader, belastning og søvn i planleggingen.",
    kanTrekke: true,
    merknad: `Du gir samtykket, men ser ikke innholdet. Helsedata er ${fornavn}s egne.`,
    detaljer: [
      { navn: "Hente fra treningsklokke", gitt: helse.wearable },
      { navn: "Manuell utfylling", gitt: helse.manuell },
      { navn: "Coach ser status", gitt: helse.coachInnsyn },
      { navn: "Coach ser detaljer", gitt: helse.coachDetalj },
    ],
  });

  /* ── Fakturaer ──────────────────────────────────────────────────── */
  const fakturaer = payments.map((p) => ({
    id: p.id,
    tekst: p.description ?? p.type,
    belopKr: kr(p.amountOre),
    status: STATUS_NAVN[p.status],
    utestaaende: UBETALT.includes(p.status),
    dato: OSLO_DATO.format(p.createdAt),
  }));

  /* ── Plan — kommende økter + bookinger som én ukeliste ──────────── */
  const uke = [
    ...oversikt.kommendeOkter.map((o) => ({
      id: `okt-${o.id}`,
      dato: o.scheduledAt,
      tittel: o.title,
      sub: o.pyramidArea as string,
    })),
    ...oversikt.kommendeBookinger.map((b) => ({
      id: `book-${b.id}`,
      dato: b.startAt,
      tittel: b.serviceName,
      sub: `${b.locationName} · ${b.durationMin} min`,
    })),
  ]
    .sort((a, b) => a.dato.getTime() - b.dato.getTime())
    .map((r) => ({
      id: r.id,
      dag: dagKort(r.dato),
      tittel: r.tittel,
      sub: r.sub || null,
    }));

  /* ── Abonnement + siste melding ─────────────────────────────────── */
  const [abonnementRad, sisteMeldingRad] = await Promise.all([
    prisma.subscription.findFirst({
      where: { userId: childId },
      select: { tier: true, status: true, currentPeriodEnd: true },
    }),
    prisma.notification.findFirst({
      where: { userId: childId, type: "melding" },
      orderBy: { createdAt: "desc" },
      select: { title: true, body: true, createdAt: true },
    }),
  ]);

  const data: ForelderPortalData = {
    childFirstName: fornavn,
    childName,
    klubb: oversikt.klubb,
    coachNavn: coachRad?.coach?.name ?? oversikt.coachNavn,
    coachEpost: coachRad?.coach?.email ?? null,
    samtykker,
    fakturaer,
    utestaaendeSum:
      oversikt.kpi.utestaaendeOre > 0 ? kr(oversikt.kpi.utestaaendeOre) : null,
    utestaaendeAntall: oversikt.kpi.utestaaendeAntall,
    abonnement: abonnementRad
      ? {
          plan: abonnementRad.tier,
          status: abonnementRad.status,
          periodeSlutt: abonnementRad.currentPeriodEnd
            ? OSLO_DATO.format(abonnementRad.currentPeriodEnd)
            : null,
        }
      : null,
    uke,
    sisteMelding: sisteMeldingRad
      ? {
          title: sisteMeldingRad.title,
          body: sisteMeldingRad.body,
          dato: OSLO_DATO.format(sisteMeldingRad.createdAt),
        }
      : null,
    initialFane: sp.fane ?? "oversikt",
  };

  return (
    <V2Shell
      bredde="kolonne"
      aktiv="oversikt"
      nav={FORELDER_NAV}
      navn={user.name}
      avatarUrl={user.avatarUrl}
    >
      <ForelderV2 data={data} />
    </V2Shell>
  );
}
