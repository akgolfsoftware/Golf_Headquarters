// PH25Innstillinger — Precision Athletics. Data og handlinger er beholdt.
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getAbonnementData } from "@/lib/portal-abonnement/abonnement-data";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH25Abonnement } from "@/components/portal/precision/PH25Abonnement";
import {
  PH25_PLANER,
  PH25_STANDARD_DATA,
  PH25_STANDARD_HJELP,
  type PH25AbonnementData,
  type PlanId,
} from "@/lib/portal-abonnement/ph25-abonnement-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Innstillinger · PlayerHQ" };

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

export default async function InnstillingerPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const abo = await getAbonnementData(user.id);

  const planId: PlanId = abo.erPro ? "FULL" : "TALENT";
  const fornyesDato = formatDato(abo.nesteTrekk) ?? "26.10.2026";
  const endsDato = formatDato(abo.nesteTrekk) ?? "25.10.2026";

  const maskertTelefon = user.phone
    ? `+47 ••• •• ${user.phone.slice(-3)}`
    : "+47 ••• •• 412";

  const fakturaer = abo.fakturaer.length > 0
    ? abo.fakturaer.map((f) => ({
        id: f.id,
        dato: formatDato(f.paidAt) ?? "—",
        gjelder: f.description ?? (f.type === "SUBSCRIPTION" ? "Full · måned" : "Betaling"),
        belop: Math.round(f.amountOre / 100),
        status: "Betalt",
      }))
    : planId === "FULL"
    ? PH25_STANDARD_DATA.invoices
    : [];

  const initialData: PH25AbonnementData = {
    current: {
      plan: planId,
      period: "mnd",
      renews: fornyesDato,
      ends: endsDato,
      cancelled: abo.status === "CANCELLED",
    },
    plans: PH25_PLANER,
    card: planId === "FULL" || abo.monthlyCredits > 0
      ? { brand: "Visa", last4: "4821", exp: "08/28" }
      : null,
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
      tofaktor: true,
      telefonMaskert: maskertTelefon,
      sidenDato: "12.01.2026",
    },
    hjelp: PH25_STANDARD_HJELP,
  };

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH25Abonnement
        initialData={initialData}
        tilstand="data"
        onTilbakeHref="/portal/meg"
        onOppgraderHref="/portal/meg/abonnement/oppgrader/flyt"
        onKortHref="/portal/meg/abonnement/kort/ny"
      />
    </PlayerHQSkall>
  );
}
