/**
 * v2-forhåndsvisning — Login (retning C). OFFENTLIG flate: ingen auth-guard,
 * ingen dataloader (login er inngangen, ikke en datadrevet skjerm). Egen
 * top-level route-group (v2preview) som ikke arver PortalShell.
 *
 * LoginV2 leverer sin egen dark-scope + fluid AuthRamme (BrandPanel + login-kort)
 * — bevisst UTEN V2Shell, siden en uinnlogget bruker ikke har app-navigasjon.
 * Den ekte innloggings-logikken bor i src/app/auth/login/login-form.tsx.
 */

import { LoginV2 } from "@/components/portal/v2/LoginV2";

export const dynamic = "force-dynamic";

export default function V2LoginPreviewPage() {
  return <LoginV2 />;
}
