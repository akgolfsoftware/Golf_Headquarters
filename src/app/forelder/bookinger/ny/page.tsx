/**
 * Foreldreportal · Book ny time — barnevalg (STEG 9.8). Har forelderen kun
 * ett barn, hopper vi rett til `/forelder/bookinger/ny/[barnId]` (vanligste
 * tilfelle). Flere barn: enkel liste bygget av eksisterende fo-kit-
 * primitiver (FoKort/FoRad/FoChevron) — INGEN ny visuell komponent, kun
 * gjenbruk av mønsteret FO-01/03/05/10 allerede bruker for lister.
 *
 * Selve booking-wizarden gjenbrukes 1:1 fra /portal/booking/ny (Train-lock)
 * via byggBookingNyData — se src/lib/portal-booking/ny-wizard-data.ts.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnForForelder } from "@/lib/forelder";
import { V2Shell, FORELDER_NAV, FORELDER_MER } from "@/components/v2/shell";
import { FoSkjerm, FoHode, FoKort, FoRad, FoChevron, FoTom } from "@/components/forelder/fo-kit";

export const dynamic = "force-dynamic";
export const metadata = { title: "Book ny time · Foreldreportal" };

export default async function ForelderBookNyPage() {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const barn = await hentBarnForForelder(user.id);

  if (barn.length === 1) {
    redirect(`/forelder/bookinger/ny/${barn[0].child.id}`);
  }

  return (
    <V2Shell bredde="kolonne" aktiv="oversikt" nav={FORELDER_NAV} mer={FORELDER_MER} navn={user.name} avatarUrl={user.avatarUrl}>
      <FoSkjerm>
        <FoHode caps="Forelder" tittel="Book ny time" under={barn.length > 0 ? "Hvem gjelder timen?" : undefined} />
        {barn.length === 0 ? (
          <FoTom
            tittel="Ingen barn er koblet ennå"
            sub="Coachen sender invitasjon når barnet er registrert i klubben."
          />
        ) : (
          <div style={{ marginTop: 14 }}>
            <FoKort pad="4px 18px">
              {barn.map((b, i) => (
                <Link
                  key={b.child.id}
                  href={`/forelder/bookinger/ny/${b.child.id}`}
                  style={{ textDecoration: "none", display: "block" }}
                >
                  <FoRad title={b.child.name} last={i === barn.length - 1} right={<FoChevron />} />
                </Link>
              ))}
            </FoKort>
          </div>
        )}
      </FoSkjerm>
    </V2Shell>
  );
}
