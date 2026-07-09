/**
 * v2-forhåndsvisning — Sett nytt passord (retning C). OFFENTLIG flate: ingen
 * auth-guard, ingen dataloader (Supabase-sesjonen leses client-side fra
 * URL-hashen, ikke server-token). Egen top-level route-group (v2preview) som
 * ikke arver PortalShell.
 *
 * ResetPasswordV2 leverer sin egen dark-scope + fluid AuthRamme (BrandPanel +
 * skjema-kort) — bevisst UTEN V2Shell, siden en uinnlogget bruker ikke har
 * app-navigasjon. Den ekte reset-logikken bor i
 * src/app/auth/reset-password/reset-form.tsx.
 */

import { ResetPasswordV2 } from "@/components/portal/v2/ResetPasswordV2";

export const dynamic = "force-dynamic";

export default function V2ResetPasswordPreviewPage() {
  return <ResetPasswordV2 />;
}
