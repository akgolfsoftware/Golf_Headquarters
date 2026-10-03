/**
 * PH25Kontakt — kontakt support i PlayerHQSkall.
 * Samme skjema og samme ticket. Svar på e-post er uendret.
 */

import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { StatusPille } from "@/components/precision/pa";
import { KontaktSupportForm } from "./kontakt-support-form";

export default async function KontaktSupportPage({ searchParams }: { searchParams: Promise<{ ticket?: string }> }) {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  const [sp, ulest] = await Promise.all([searchParams, getUnreadNotifications(user.id, 1)]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side ph25k">
        <Link href="/portal/meg/help" className="ph-tilbake">Hjelp</Link>
        <header>
          <div>
            <p>Støtte · Direkte kontakt</p>
            <h1>Kontakt support</h1>
            <p>Beskriv problemet — jo mer kontekst, desto raskere svar.</p>
          </div>
          <StatusPille tone="ok">Omtrent 4 timer · hverdager 08–17</StatusPille>
        </header>
        {sp?.ticket && <p className="ph25k-kvittering" role="status">Melding sendt. Ticket-ID #{sp.ticket}. Du får svar på e-post.</p>}
        <KontaktSupportForm bruker={{ navn: user.name ?? "", epost: user.email ?? "" }} />
      </div>
    </PlayerHQSkall>
  );
}
