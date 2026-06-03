/**
 * Preview-rute (offentlig, ingen auth) for Auth → Glemt passord.
 * Rendrer <ForgotSkjerm> som selvstendig full side på cream-bakgrunn — INGEN
 * app-sidebar. Matcher pixel-fasit public/design-handover/_screens/au-forgot.png.
 *
 * Cookie-banneret i fasiten leveres av den globale <CookieBanner /> i
 * root-layouten. Samme grunnlayout mobil + desktop: sentrert kort, maks ~440px.
 * INGEN Prisma/DB/auth her — kun presentasjon.
 */
import { ForgotSkjerm } from "@/components/auth/forgot-skjerm";

export default function AuthForgotPreviewPage() {
  return <ForgotSkjerm loginHref="/auth/login" />;
}
