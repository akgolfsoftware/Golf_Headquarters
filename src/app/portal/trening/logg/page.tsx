/**
 * PH26TreningLogg — PlayerHQ Trening Logg i PlayerHQSkall (Precision Athletics).
 * Registrer treningsøkt: dato, område, varighet, øvelse, kvalitet 1–5 og notater.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { TreningLoggV2 } from "@/components/portal/v2/TreningLoggV2";

export const dynamic = "force-dynamic";

export default async function PH26TreningLoggPage() {
  const user = await requirePortalUser();
  const ulest = await getUnreadNotifications(user.id, 1).catch(() => ({ count: 0 }));

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side ph26l">
        <header>
          <p className="ph26l-kicker">PlayerHQ · Trening</p>
          <h1>Logg treningsøkt</h1>
          <p>Registrer gjennomført økt med dato, område, varighet og kvalitet.</p>
        </header>
        <section className="pa-card ph26l-kort">
          <TreningLoggV2 />
        </section>
      </div>
    </PlayerHQSkall>
  );
}
