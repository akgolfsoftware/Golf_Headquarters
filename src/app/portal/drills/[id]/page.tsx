// PH13DrillDetalj — nytt design (pakke 4, godkjent av Anders 14.10.2026). Data og handlinger er beholdt.
/**
 * PH-13 Øvelse. Fasit: docs/design-system/utkast-playerhq/ovelser.html, skjerm «ovelse».
 * Avvik:
 *   - Avvikene mot utkastet står øverst i PH13DrillDetalj.tsx.
 * Tilgang som før: bare øvelser spilleren har tilgang til (samme filter som banken). Ukjent eller
 * utilgjengelig øvelse gir tom tilstand med vei tilbake. Ingen eksempeløvelser.
 */
import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentOvelse } from "@/lib/portal-drills/ovelser-data";
import { ukeDager } from "@/lib/portal-drills/ovelser-visning";
import { ukenummer } from "@/lib/uke-helpers";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH13DrillDetalj } from "@/components/portal/precision/PH13DrillDetalj";
import { OvTilbake } from "@/components/portal/precision/PH13Felles";

export const dynamic = "force-dynamic";
export const metadata = { title: "Øvelse · PlayerHQ" };

export default async function DrillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePortalUser({ allow: ["PLAYER", "PARENT"] });
  const { id } = await params;
  const naa = new Date();
  const [ovelse, uleste] = await Promise.all([hentOvelse(user.id, id), getUnreadNotifications(user.id, 1)]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      {ovelse
        ? <PH13DrillDetalj ovelse={ovelse} playerId={user.role === "PLAYER" ? user.id : null} uke={{ nr: ukenummer(naa), dager: ukeDager(naa) }} />
        : <div className="phn">
            <OvTilbake href="/portal/drills" tekst="Øvelsesbank" />
            <section className="phn-kort" style={{ background: "var(--phn-sand-100)" }}>
              <b className="phn-ov-under">Fant ikke øvelsen</b>
              <p className="phn-forklar">Øvelsen finnes ikke, eller den er ikke delt med deg.</p>
              <div className="phn-knapper"><Link className="phn-knapp pri" href="/portal/drills">Til øvelsesbanken</Link></div>
            </section>
          </div>}
    </PlayerHQSkall>
  );
}
