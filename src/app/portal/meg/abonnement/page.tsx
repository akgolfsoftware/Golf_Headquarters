// PH25AboOversikt — Precision Athletics. Data og handlinger er beholdt.
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getAbonnementData } from "@/lib/portal-abonnement/abonnement-data";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH25Abonnement } from "@/components/portal/precision/PH25Abonnement";
import {
  PH25_PLANER,
  PH25_STANDARD_HJELP,
  type PH25AbonnementData,
  type PlanId,
} from "@/lib/portal-abonnement/ph25-abonnement-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Abonnement og innstillinger · PlayerHQ" };

const OSLO = { timeZone: "Europe/Oslo" } as const;
const DMA = new Intl.DateTimeFormat("nb-NO", {
  ...OSLO,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
function formatDato(d: Date | null): string | null {
  if (!d) return null;
  return DMA.format(d).replaceAll("/", ".");
}

export default async function AbonnementPage({
  searchParams,
}: {
  searchParams: Promise<{
    ok?: string;
    cancelled?: string;
    avbestilt?: string;
    fra?: string;
    state?: string;
  }>;
}) {
  const sp = await searchParams;
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const [abo, appSubscription] = await Promise.all([
    getAbonnementData(user.id),
    prisma.subscription.findUnique({ where: { userId_kind: { userId: user.id, kind: "PLAYERHQ" } },
      select: { status: true, interval: true, plan: true, currentPeriodEnd: true, cancelAtPeriodEnd: true } }),
  ]);

  const planId: PlanId = abo.erPro ? "FULL" : "TALENT";
  const fornyesDato = formatDato(appSubscription?.currentPeriodEnd ?? null) ?? "—";
  const endsDato = fornyesDato;
  const erAvbestilt = appSubscription?.status === "CANCELLED" || appSubscription?.cancelAtPeriodEnd === true;

  const maskertTelefon = user.phone
    ? `+47 ••• •• ${user.phone.slice(-3)}`
    : "—";

  const fakturaer = abo.fakturaer.length > 0
    ? abo.fakturaer.map((f) => ({
        id: f.id,
        dato: formatDato(f.paidAt) ?? "—",
        gjelder: f.description ?? (f.type === "SUBSCRIPTION" ? "Full · måned" : "Betaling"),
        belop: Math.round(f.amountOre / 100),
        status: "Betalt",
      }))
    : [];

  const initialData: PH25AbonnementData = {
    current: {
      plan: planId,
      period: appSubscription?.interval === "year" || appSubscription?.plan === "PLAYERHQ_AAR" ? "ar" : "mnd",
      renews: fornyesDato,
      ends: endsDato,
      cancelled: erAvbestilt,
    },
    plans: PH25_PLANER,
    card: null,
    invoices: fakturaer,
    samtykker: {
      coach: true,
      data: true,
      bilder: false,
      forsk: false,
    },
    varsler: {
      plan: true,
      meld: true,
      turn: true,
      digest: true,
      caddie: false,
    },
    sikkerhet: {
      tofaktor: false,
      telefonMaskert: maskertTelefon,
      sidenDato: "—",
    },
    hjelp: PH25_STANDARD_HJELP,
  };

  const visGameplanAlert = sp.fra === "laast" || sp.fra === "gameplan";
  const tilstand = sp.state === "tom" ? "tom" : "data";

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH25Abonnement
        initialData={initialData}
        tilstand={tilstand}
        visGameplanAlert={visGameplanAlert}
        onTilbakeHref="/portal/meg"
        onOppgraderHref="/portal/meg/abonnement/oppgrader/flyt"
        onKortHref="/portal/meg/abonnement/kort/ny"
        paymentFailed={appSubscription?.status === "PAST_DUE"}
      />
    </PlayerHQSkall>
  );
}
