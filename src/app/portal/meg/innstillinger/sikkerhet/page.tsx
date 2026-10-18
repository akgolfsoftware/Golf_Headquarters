// PH-25 Sikkerhet — Precision Athletics, pakke 14 (utkast meg-resten.html, 16.10.2026).
/**
 * PlayerHQ · Innstillinger · Sikkerhet. Kanonisk sikkerhetsskjerm etter D7-konsolideringen
 * (17.07.2026): /portal/meg/sikkerhet sender hit.
 *
 * Innloggingsmåte og tofaktor leses fra Supabase-økta (identiteter og faktorer), ikke gjettet.
 * Passord og e-post byttes klientside mot Supabase Auth i komponenten.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/auth/logout";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH25Sikkerhet } from "@/components/portal/precision/PH25Sikkerhet";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sikkerhet · PlayerHQ" };

const OSLO = "Europe/Oslo";
const DAG = new Intl.DateTimeFormat("sv-SE", { timeZone: OSLO, year: "numeric", month: "2-digit", day: "2-digit" });
const KL = new Intl.DateTimeFormat("nb-NO", { timeZone: OSLO, hour: "2-digit", minute: "2-digit" });
const DATO = new Intl.DateTimeFormat("nb-NO", { timeZone: OSLO, day: "numeric", month: "long" });

function sistInnlogget(d: Date | null | undefined): string | null {
  if (!d) return null;
  const iDag = DAG.format(new Date()) === DAG.format(d);
  return `${iDag ? "i dag" : DATO.format(d)} ${KL.format(d)}`;
}

export default async function SikkerhetPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  const supabase = await createClient();
  const [{ data: auth }, { data: faktorer }, uleste] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.mfa.listFactors(),
    getUnreadNotifications(user.id, 1),
  ]);

  const leverandorer = new Set((auth.user?.identities ?? []).map((i) => i.provider));
  const google = leverandorer.has("google");
  // E-post-identiteten er passordinnloggingen. Uten kjent identitet antas passord, som før.
  const passord = leverandorer.has("email") || leverandorer.size === 0;

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PH25Sikkerhet
        data={{
          epost: user.email ?? "—",
          google,
          passord,
          tofaktorPaa: (faktorer?.totp ?? []).some((f) => f.status === "verified"),
          sisteInnlogging: sistInnlogget(user.lastLoginAt),
        }}
        loggUt={logout}
      />
    </PlayerHQSkall>
  );
}
