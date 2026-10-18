import type { Metadata } from "next";
import { getCurrentUserRaw } from "@/lib/auth/getCurrentUser";
import { PrecisionTilstand } from "@/components/system/precision-tilstand";
import { logout } from "@/lib/auth/logout";

export const metadata: Metadata = {
  title: "Ikke tilgang — AK Golf HQ",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ROLLE: Record<string, { navn: string; hjem: string; hjemTekst: string }> = {
  PLAYER: { navn: "spiller", hjem: "/portal", hjemTekst: "Til PlayerHQ" },
  PARENT: { navn: "forelder", hjem: "/forelder", hjemTekst: "Til forelder" },
  COACH: { navn: "coach", hjem: "/admin/agencyos", hjemTekst: "Til AgencyOS" },
  ADMIN: { navn: "administrator", hjem: "/admin/agencyos", hjemTekst: "Til AgencyOS" },
};

/**
 * SY-01 Ikke tilgang (403) i nytt design. For lenker som peker til en flate brukeren ikke har rolle til.
 * Innloggingsvakten sender fortsatt rett til egen hjemmeside ved rollefeil (unngår løkker), se nattplanen §6.
 */
export default async function IkkeTilgangPage() {
  const user = await getCurrentUserRaw();
  const r = user ? ROLLE[user.role] : undefined;
  return (
    <PrecisionTilstand
      kicker="403"
      tittel="Du har ikke tilgang til denne siden"
      tekst={r ? `Du er logget inn som ${r.navn}. Siden er for en annen rolle.` : "Logg inn med kontoen som har tilgang."}
      primar={r ? { label: r.hjemTekst, href: r.hjem } : { label: "Logg inn", href: "/auth/login" }}
      barn={
        user ? (
          <form action={logout}>
            <button type="submit" className="knapp sek">Logg inn med en annen konto</button>
          </form>
        ) : undefined
      }
    />
  );
}
