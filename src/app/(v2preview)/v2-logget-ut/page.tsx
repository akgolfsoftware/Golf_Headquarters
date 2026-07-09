/**
 * v2-forhåndsvisning — Logget ut (retning C). OFFENTLIG flate: ingen
 * auth-guard, ingen dataloader (ren presentasjon, samme som den ekte
 * /auth/logget-ut). Egen top-level route-group (v2preview) som ikke arver
 * PortalShell.
 *
 * LoggetUtV2 leverer sin egen dark-scope + fluid AuthRamme (BrandPanel +
 * bekreftelses-kort) — bevisst UTEN V2Shell, siden en utlogget bruker ikke
 * har app-navigasjon. Samme props som den ekte skjermen
 * src/app/auth/logget-ut/page.tsx (→ LoggetUtSkjerm).
 */

import { LoggetUtV2 } from "@/components/portal/v2/LoggetUtV2";

export const dynamic = "force-dynamic";

export default function V2LoggetUtPreviewPage() {
  return (
    <LoggetUtV2
      hjemHref="/"
      loggInnHref="/auth/login"
      marketingHref="/"
      feedbackEpost="post@akgolf.no"
    />
  );
}
