/**
 * Preview-rute (offentlig, ingen auth) for system-siden 404 · Ikke funnet.
 * Rendrer <IkkeFunnet> som selvstendig full side — minimal sentrert blokk
 * på cream-bakgrunn, INGEN app-sidebar. Matcher v10-fasiten
 * (public/design-handover/_screens/mx-404.png).
 *
 * INGEN Prisma/DB/auth her — kun presentasjon.
 */

import { IkkeFunnet } from "@/components/system/ikke-funnet";

export default function IkkeFunnetPreviewPage() {
  return <IkkeFunnet hjemHref="/" />;
}
