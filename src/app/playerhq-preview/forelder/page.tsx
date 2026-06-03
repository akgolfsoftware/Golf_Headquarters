/**
 * Preview-rute (offentlig, ingen auth) for Foreldreportal · "Mine barn".
 * Rendrer <ForelderHjem> som selvstendig full side (INGEN app-sidebar) med
 * hardkodet demo-data som matcher v10-fasiten
 * (public/design-handover/_screens/fo-barn.png) — tom-tilstand: ingen barn
 * koblet til kontoen.
 *
 * Mobil-først: ren, sentrert innholds-kolonne. Desktop: samme kolonne
 * sentrert på cream-bakgrunn. INGEN Prisma/DB/auth her — kun presentasjon.
 */

import {
  ForelderHjem,
  type ForelderHjemData,
} from "@/components/forelder/forelder-hjem";

// ── Demo-data — matcher fo-barn.png (tom-tilstand) ──
const demo: ForelderHjemData = {
  eyebrow: "Foreldreportal · Barn",
  titleLead: "Mine",
  titleItalic: "barn",
  helper: "Velg et barn for å følge treningen.",
  barn: [],
  emptyTitle: "Ingen barn koblet til kontoen din",
  emptyBody: "Be spilleren sende en invitasjon, eller kontakt coachen din.",
};

export default function ForelderHjemPreviewPage() {
  return <ForelderHjem data={demo} />;
}
