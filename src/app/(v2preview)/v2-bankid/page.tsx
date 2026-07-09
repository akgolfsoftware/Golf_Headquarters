/**
 * v2-forhåndsvisning — BankID (retning C). OFFENTLIG flate: ingen auth-guard,
 * ingen dataloader (den ekte /auth/bankid er en post-BETA-placeholder uten
 * loader — søsken-rutene har heller ingen guard). Egen top-level route-group
 * (v2preview) som ikke arver PortalShell.
 *
 * BankIDV2 leverer sin egen dark-scope + fluid AuthRamme (BrandPanel + kort)
 * — bevisst UTEN V2Shell, siden en uinnlogget bruker ikke har app-navigasjon.
 * Den ekte BankID-flyten (verge-verifisering) kommer post-BETA.
 */

import { BankIDV2 } from "@/components/portal/v2/BankIDV2";

export const dynamic = "force-dynamic";

export default function V2BankIDPreviewPage() {
  return <BankIDV2 />;
}
