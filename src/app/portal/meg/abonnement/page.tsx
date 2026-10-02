/**
 * Abonnement (/portal/meg/abonnement) — Precision Athletics PH-25
 * (Claude Design 7d7c2994, ui_kits/playerhq/screens/PH-25.jsx).
 *
 * Tilgang, dataloader og avledninger (kan oppgradere / endre kort / avbestille) er uendret.
 * Nivået vises som TALENT eller FULL (aldri GRATIS/PRO, og aldri coaching-pakken som nivå).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getAbonnementData } from "@/lib/portal-abonnement/abonnement-data";
import { hentUleste } from "@/lib/portal-booking/uleste";
import { pakkeNavn, PLAYERHQ_PRIS_AAR_ORE, PLAYERHQ_PRIS_MND_ORE } from "@/lib/domain/abonnement";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH25Abonnement, type PH25AbonnementData } from "@/components/portal/precision/PH25Abonnement";

export const dynamic = "force-dynamic";
export const metadata = { title: "Abonnement · PlayerHQ" };

const OSLO_DATO = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Oslo" });
const formatDato = (d: Date | null) => (d ? OSLO_DATO.format(d) : null);

export default async function AbonnementPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; cancelled?: string; avbestilt?: string }>;
}) {
  const sp = await searchParams;
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const [abo, uleste] = await Promise.all([getAbonnementData(user.id), hentUleste(user.id)]);

  const harPakke = abo.monthlyCredits > 0;
  const betalingFeilet = abo.status === "PAST_DUE";
  const fullNa = user.tilgang.nivaa === "FULL";
  const betaler = abo.erPro && !harPakke;

  const data: PH25AbonnementData = {
    nivaa: fullNa ? "FULL" : "TALENT",
    pakkeNavn: harPakke ? pakkeNavn(abo.monthlyCredits) : null,
    inkludert: fullNa && !betaler && !harPakke,
    prisMndKr: PLAYERHQ_PRIS_MND_ORE / 100,
    prisAarKr: PLAYERHQ_PRIS_AAR_ORE / 100,
    fornyes: betaler ? formatDato(abo.nesteTrekk) : null,
    betalingFeilet,
    kanOppgradere: !abo.erPro && !betalingFeilet,
    kanEndreKort: abo.status === "ACTIVE" || abo.status === "PAST_DUE" || abo.status === "TRIALING",
    kanAvbestille: abo.erPro && abo.status !== "CANCELLED",
    fakturaer: abo.fakturaer.map((f) => ({
      id: f.id,
      dato: formatDato(f.paidAt) ?? "—",
      tekst: f.description ?? "Betaling",
      belopKr: f.amountOre / 100,
    })),
    flagg: { ok: sp.ok === "1", avbrutt: sp.cancelled === "1", avbestilt: sp.avbestilt === "1" },
  };

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH25Abonnement data={data} />
    </PlayerHQSkall>
  );
}
