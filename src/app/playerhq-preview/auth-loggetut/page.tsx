/**
 * Preview-rute (offentlig, ingen auth) for Auth · Logget ut.
 * Rendrer <LoggetUtSkjerm> som selvstendig full side — sentrert kort på
 * cream-bakgrunn, INGEN app-sidebar. Matcher v10-fasiten
 * (public/design-handover/_screens/au-loggetut.png).
 *
 * INGEN Prisma/DB/auth her — kun presentasjon.
 */

import { LoggetUtSkjerm } from "@/components/auth/logget-ut";

export default function AuthLoggetUtPreviewPage() {
  return (
    <LoggetUtSkjerm
      hjemHref="/"
      loggInnHref="/auth/login"
      marketingHref="/"
      feedbackEpost="post@akgolf.no"
    />
  );
}
