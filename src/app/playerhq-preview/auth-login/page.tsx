/**
 * Preview-rute (offentlig, ingen auth) for Auth · Logg inn.
 * Rendrer <LoginSkjerm> som selvstendig full side — sentrert kort på
 * cream-bakgrunn, INGEN app-sidebar. Matcher v10-fasiten
 * (public/design-handover/_screens/au-login.png).
 *
 * INGEN Prisma/DB/auth her — kun presentasjon.
 */

import { LoginSkjerm } from "@/components/auth/login-skjerm";

export default function AuthLoginPreviewPage() {
  return (
    <LoginSkjerm
      hjemHref="/"
      glemtPassordHref="/auth/forgot-password"
      bookHref="/booking"
    />
  );
}
