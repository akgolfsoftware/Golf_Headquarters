/**
 * v2-forhåndsvisning — Glemt passord (retning C). OFFENTLIG flate: ingen
 * auth-guard, ingen dataloader (Supabase-flyten kjører client-side via
 * ForgotForm-mønsteret, ikke server-token). Egen top-level route-group
 * (v2preview) som ikke arver PortalShell.
 *
 * ForgotPasswordV2 leverer sin egen dark-scope + fluid AuthRamme (BrandPanel +
 * skjema-kort) — bevisst UTEN V2Shell, siden en uinnlogget bruker ikke har
 * app-navigasjon. Den ekte glemt-passord-logikken bor i
 * src/app/auth/forgot-password/forgot-form.tsx.
 */

import { ForgotPasswordV2 } from "@/components/portal/v2/ForgotPasswordV2";

export const dynamic = "force-dynamic";

export default function V2ForgotPasswordPreviewPage() {
  return <ForgotPasswordV2 />;
}
