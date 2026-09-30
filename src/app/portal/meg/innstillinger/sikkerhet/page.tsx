/**
 * Sikkerhet (/portal/meg/innstillinger/sikkerhet) — Precision Athletics PH-25.
 * Kanonisk sikkerhetsflate (D7, 17. juli 2026): passord og e-post endres mot Supabase Auth i
 * komponenten; tofaktor går til /portal/meg/sikkerhet/2fa. Den tidligere sikkerhetsscoren
 * (80 eller 55 utledet av at e-posten finnes) er fjernet: den var ikke en måling.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentUleste } from "@/lib/portal-booking/uleste";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH25Sikkerhet } from "@/components/portal/precision/PH25Abonnement";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sikkerhet · PlayerHQ" };

function formatSiste(d: Date | null | undefined): string {
  if (!d) return "—";
  return `${d.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Oslo" })} · ${d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Oslo" })}`;
}

export default async function SikkerhetPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  const uleste = await hentUleste(user.id);
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH25Sikkerhet sisteInnlogging={formatSiste(user.lastLoginAt)} />
    </PlayerHQSkall>
  );
}
