/**
 * Preview-rute (offentlig, ingen auth) for Foreldreportal · oversikt
 * (foresatt-info). Rendrer <ForeldreInfo> som selvstendig full side.
 *
 * Visuell fasit: public/design-handover/_screens/pl-forelder.png — tom tilstand
 * (foresatt ikke koblet til noe barn). Foreldreportalen er bevisst frittstående:
 * INGEN spiller-/coach-sidebar, kun innhold i en sentrert kolonne på cream-bg,
 * mobil-først og responsiv mot desktop.
 *
 * INGEN Prisma/DB/auth her — kun presentasjon med hardkodet demo-data som
 * matcher fasiten (tom-tilstand via FORELDRE_INFO_DEFAULT).
 */

import {
  FORELDRE_INFO_DEFAULT,
  ForeldreInfo,
} from "@/components/portal/meg/foreldre-info";

export default function PlayerHqForeldreInfoPreviewPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="min-h-screen">
        <ForeldreInfo data={FORELDRE_INFO_DEFAULT} />
      </main>
    </div>
  );
}
