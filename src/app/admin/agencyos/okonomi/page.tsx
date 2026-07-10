/**
 * v2-preview: AgencyOS Økonomi (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver AdminShell — kun root-layout — så V2Shell leverer
 * all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth + data følger de to ekte økonomi-flatene (src/app/admin/okonomi +
 * src/app/admin/agencyos/okonomi): samme requirePortalUser-guard (ADMIN/COACH)
 * og samme Prisma-loader (Payment-aggregater + siste transaksjoner + aktive
 * PRO-abonnement). Mapper til AdminOkonomiV2Data (ærlige tomrom, ingen
 * fabrikerte tall). MRR utledes ærlig fra aktive PRO-abonnement × 299 kr
 * (kanonisk pris — ELITE finnes ikke i UI).
 *
 * Server component.
 */

import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  AdminOkonomiV2,
  type AdminOkonomiV2Data,
  type AdminOkonomiV2Betaling,
  type BetalingStatusKey,
} from "@/components/admin/v2/AdminOkonomiV2";

// Payment.metadata er ustrukturert JSON fra to historiske importer
// (WooCommerce/akgolf.no og Acuity Scheduling) — begge felt er valgfrie
// og valideres tolerant, aldri `as unknown as`.
const PaymentMetadataSchema = z
  .object({ customer_name: z.string().optional(), source: z.string().optional() })
  .partial();

/**
 * Ekte betalernavn når `userId` mangler (importerte betalinger uten
 * kontokobling): WooCommerce-metadata har `customer_name` direkte; Acuity-
 * importen bærer navnet i `description` («<id> - Navn - ...»). Ingen treff →
 * ærlig «Ukjent» (aldri fabrikert).
 */
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

export const dynamic = "force-dynamic";
export const metadata = { title: "Økonomi · AgencyOS (v2)" };

const MND_KORT = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
const MND_LANG = ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"];

// Kanonisk PRO-pris (kr/mnd). ELITE er dødt enum — ekskluderes fra MRR.
const PRO_PRIS_KR = 299;

const ore = (v: number) => v / 100;

export default async function V2AdminOkonomiPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const now = new Date();
  const mndStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const mndSlutt = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const forrigeMndStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const femTilbake = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [denneMnd, forrigeMnd, alleSeks, utestaende, sisteFakturaer, proAktive] = await Promise.all([
    prisma.payment.aggregate({
      _sum: { amountOre: true },
      _count: true,
      where: { status: "SUCCEEDED", paidAt: { gte: mndStart, lt: mndSlutt } },
    }),
    prisma.payment.aggregate({
      _sum: { amountOre: true },
      where: { status: "SUCCEEDED", paidAt: { gte: forrigeMndStart, lt: mndStart } },
    }),
    prisma.payment.findMany({
      where: { status: "SUCCEEDED", paidAt: { gte: femTilbake } },
      select: { paidAt: true, amountOre: true },
    }),
    prisma.payment.aggregate({
      _sum: { amountOre: true },
      _count: true,
      where: { status: "PENDING" },
    }),
    prisma.payment.findMany({
      orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
      take: 20,
      include: { user: { select: { name: true } } },
    }),
    prisma.subscription.count({
      where: { tier: "PRO", status: { in: ["ACTIVE", "TRIALING", "PAST_DUE"] } },
    }),
  ]);

  // Månedlig serie (6 mnd, i kr).
  const serie: { label: string; kr: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const dSlutt = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const sumOre = alleSeks
      .filter((p) => p.paidAt && p.paidAt >= d && p.paidAt < dSlutt)
      .reduce((s, p) => s + p.amountOre, 0);
    serie.push({ label: MND_KORT[d.getMonth()], kr: ore(sumOre) });
  }

  const denneOre = denneMnd._sum.amountOre ?? 0;
  const forrigeOre = forrigeMnd._sum.amountOre ?? 0;
  const endringPct = forrigeOre > 0 ? Math.round(((denneOre - forrigeOre) / forrigeOre) * 100) : null;

  const betalinger: AdminOkonomiV2Betaling[] = sisteFakturaer.map((p) => ({
    id: p.id,
    navn: betalerNavn(p.user?.name ?? null, p.metadata, p.description),
    beskrivelse: p.description ?? null,
    type: p.type,
    belopKr: ore(p.amountOre),
    refundertKr: ore(p.amountRefundedOre),
    dato: (p.paidAt ?? p.createdAt).toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" }),
    status: p.status as BetalingStatusKey,
  }));

  const data: AdminOkonomiV2Data = {
    periodeLabel: `${MND_LANG[now.getMonth()]} ${now.getFullYear()}`,
    mrrKr: proAktive * PRO_PRIS_KR,
    proAktive,
    innbetaltMndKr: ore(denneOre),
    endringPct,
    utestaendeKr: ore(utestaende._sum.amountOre ?? 0),
    utestaendeAntall: utestaende._count ?? 0,
    betalteAntall: denneMnd._count ?? 0,
    serie,
    betalinger,
    stripeHref: "https://dashboard.stripe.com",
    oppfolgHref: "/admin/okonomi",
  };

  return (
    <V2Shell aktiv="okonomi" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AdminOkonomiV2 data={data} />
    </V2Shell>
  );
}
