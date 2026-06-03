/**
 * Preview-rute (offentlig, ingen auth) for Marketing-forsiden (akgolf.no landing).
 * Rendrer <Forside> som selvstendig full side — egen full-bredde layout,
 * INGEN app-sidebar. Matcher v10-fasiten public/design-handover/_screens/mk-forside.png.
 *
 * Demo-data (forsideDemo) er hardkodet i komponenten. Ingen Prisma/DB/auth her.
 */

import { Forside } from "@/components/marketing/forside";

export default function MarketingForsidePreviewPage() {
  return <Forside />;
}
