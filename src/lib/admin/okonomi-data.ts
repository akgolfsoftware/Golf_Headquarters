/**
 * AgencyOS Økonomi-loader (EC-01 / C10).
 *
 * Tripletex = lesing. Mangler tall = null («mangler» i UI). Stripe PAST_DUE
 * vises som Forfalt. Ingen Invoice-modell — booking→faktura er ikke bygd.
 */

import { z } from "zod";
import type { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { can, Capability } from "@/lib/auth/cbac";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { parseMaanedsrapport } from "@/lib/agents/maanedsrapport";
import { readTripletexEnv } from "@/lib/tripletex/env";
import { hentResultatrapport } from "@/lib/tripletex/client";
import { startOfYear } from "@/lib/uke-helpers";
import type { ReportsV2Data } from "@/components/admin/v2/AdminReportsV2";
import { fakturaStatusFraStripe, klippBrukt, oreTilKr, type FakturaStatusVisning } from "./okonomi-visning";
import { fmtDatoNb, fornavnAv } from "@/lib/portal-stats/datagolf-kort";

const PaymentMetadataSchema = z
  .object({ customer_name: z.string().optional(), source: z.string().optional() })
  .partial();

function betalerNavn(brukerNavn: string | null, metadata: unknown, description: string | null): string {
  if (brukerNavn) return brukerNavn;
  const parsed = PaymentMetadataSchema.safeParse(metadata);
  const meta = parsed.success ? parsed.data : {};
  if (meta.customer_name) return meta.customer_name;
  if (meta.source === "Acuity Scheduling" && description) {
    const m = description.match(/^\d+\s*-\s*([^-]+)-/);
    if (m) return m[1].trim();
  }
  return "Ukjent";
}

function isoLokal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dag = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dag}`;
}

export type OkonomiFaktura = {
  id: string;
  navn: string;
  beskrivelse: string | null;
  dato: string;
  belopKr: number | null;
  status: FakturaStatusVisning;
};

export type OkonomiTimeklipp = {
  id: string;
  navn: string;
  fornavn: string;
  brukt: number;
  totalt: number;
};

export type AdminOkonomiV2Data = {
  aar: number;
  visKroner: boolean;
  visRapporter: boolean;
  tripletexKonfigurert: boolean;
  ytd: { budsjettKr: number | null; resultatKr: number | null };
  fakturaer: OkonomiFaktura[];
  timeklipp: OkonomiTimeklipp[];
  stripeHref: string;
  rapporter: ReportsV2Data | null;
  hull: {
    invoiceModell: false;
    bookingTilFaktura: false;
    budsjettkilde: false;
  };
};

type Viewer = { id: string; role: UserRole };

export async function hentOkonomiFlate(viewer: Viewer): Promise<AdminOkonomiV2Data> {
  const visKroner = can(viewer.role, Capability.VIEW_FINANCE);
  const visRapporter = can(viewer.role, Capability.VIEW_REPORTS);
  const now = new Date();
  const aar = now.getFullYear();
  const tripletexKonfigurert = readTripletexEnv() != null;

  const [rapport, betalinger, pastDue, klipp, spillere, okter, rapportRader] = await Promise.all([
    visKroner && tripletexKonfigurert
      ? hentResultatrapport(isoLokal(startOfYear(now)), isoLokal(now))
      : Promise.resolve(null),
    visKroner
      ? prisma.payment.findMany({
          orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
          take: 20,
          include: { user: { select: { name: true } } },
        })
      : Promise.resolve([]),
    visKroner
      ? prisma.subscription.findMany({
          where: { status: "PAST_DUE" },
          include: {
            user: { select: { name: true } },
            payments: { orderBy: { createdAt: "desc" }, take: 1, select: { amountOre: true } },
          },
        })
      : Promise.resolve([]),
    prisma.subscription.findMany({
      where: {
        kind: "COACHING",
        monthlyCredits: { gt: 0 },
        status: { in: ["ACTIVE", "TRIALING"] },
        user: coachScopedPlayerWhere(viewer),
      },
      include: { user: { select: { id: true, name: true } } },
      take: 20,
    }),
    visRapporter
      ? prisma.user.count({ where: { AND: [coachScopedPlayerWhere(viewer), { deletedAt: null }] } })
      : Promise.resolve(0),
    visRapporter ? prisma.trainingPlanSession.count({ where: { status: "COMPLETED" } }) : Promise.resolve(0),
    visRapporter
      ? prisma.monthlyReport.findMany({
          orderBy: [{ year: "desc" }, { month: "desc" }],
          take: 12,
          select: { payload: true },
        })
      : Promise.resolve([]),
  ]);

  const ytd = {
    budsjettKr: null as number | null,
    resultatKr: visKroner ? (rapport?.resultat ?? null) : null,
  };

  const fraBetalinger: OkonomiFaktura[] = betalinger.map((p) => ({
    id: p.id,
    navn: betalerNavn(p.user?.name ?? null, p.metadata, p.description),
    beskrivelse: p.description ?? p.type.toLowerCase(),
    dato: fmtDatoNb(p.paidAt ?? p.createdAt),
    belopKr: visKroner ? oreTilKr(p.amountOre) : null,
    status: fakturaStatusFraStripe({ paymentStatus: p.status }),
  }));

  const fraPastDue: OkonomiFaktura[] = pastDue.map((s) => ({
    id: `sub-${s.id}`,
    navn: s.user.name,
    beskrivelse: "Abonnement",
    dato: fmtDatoNb(s.updatedAt),
    belopKr: visKroner ? oreTilKr(s.payments[0]?.amountOre ?? null) : null,
    status: fakturaStatusFraStripe({ subscriptionStatus: s.status }),
  }));

  const fakturaer = [...fraPastDue, ...fraBetalinger]
    .filter((a, i, arr) => arr.findIndex((b) => b.id === a.id) === i)
    .slice(0, 20);

  const timeklipp: OkonomiTimeklipp[] = klipp.map((s) => ({
    id: s.id,
    navn: s.user.name,
    fornavn: fornavnAv(s.user.name),
    brukt: klippBrukt(s.monthlyCredits, s.creditsRemaining),
    totalt: s.monthlyCredits,
  }));

  const maanedsrapporter = rapportRader
    .map((r) => parseMaanedsrapport(r.payload))
    .filter((r): r is NonNullable<typeof r> => r != null)
    .map((r) =>
      visKroner
        ? r
        : {
            ...r,
            totalt: { ...r.totalt, bookingVerdiOre: 0, innbetaltOre: 0 },
            perSelskap: r.perSelskap.map((sel) => ({ ...sel, bookingVerdiOre: 0, innbetaltOre: 0 })),
          },
    );

  const rapporter: ReportsV2Data | null = visRapporter
    ? {
        spillere,
        okter,
        sesong: aar,
        maanedsrapporter,
        visKroner,
      }
    : null;

  return {
    aar,
    visKroner,
    visRapporter,
    tripletexKonfigurert,
    ytd,
    fakturaer,
    timeklipp,
    stripeHref: "https://dashboard.stripe.com",
    rapporter,
    hull: {
      invoiceModell: false,
      bookingTilFaktura: false,
      budsjettkilde: false,
    },
  };
}


