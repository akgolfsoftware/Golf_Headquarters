/**
 * v2-forhåndsvisning — Sjekk e-post (retning C). OFFENTLIG flate: ingen
 * auth-guard, ingen dataloader (statisk venteskjerm etter registrering, samme
 * som den ekte /auth/check-email). Egen top-level route-group (v2preview) som
 * ikke arver PortalShell.
 *
 * CheckEmailV2 leverer sin egen dark-scope + fluid AuthRamme (BrandPanel +
 * bekreftelses-kort) — bevisst UTEN V2Shell, siden en uinnlogget bruker ikke
 * har app-navigasjon. Den ekte skjermen er ren presentasjon:
 * src/app/auth/check-email/page.tsx.
 */

import { CheckEmailV2 } from "@/components/portal/v2/CheckEmailV2";

export const dynamic = "force-dynamic";

export default function V2CheckEmailPreviewPage() {
  return <CheckEmailV2 />;
}
