/**
 * v2-forhåndsvisning — Signup (retning C). OFFENTLIG flate: ingen auth-guard,
 * ingen dataloader (signup er en inngang, ikke en datadrevet skjerm). Egen
 * top-level route-group (v2preview) som ikke arver PortalShell.
 *
 * SignupV2 leverer sin egen dark-scope + fluid AuthRamme (BrandPanel + signup-kort)
 * — bevisst UTEN V2Shell, siden en uinnlogget bruker ikke har app-navigasjon.
 * Den ekte registreringslogikken bor i src/app/auth/signup/signup-form.tsx.
 * ?epost=… speiles til SignupV2 som prefill (samme gjeste-bro som ekte skjerm).
 */

import { SignupV2 } from "@/components/portal/v2/SignupV2";

export const dynamic = "force-dynamic";

export default async function V2SignupPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ epost?: string }>;
}) {
  const { epost } = await searchParams;
  return <SignupV2 defaultEmail={epost} />;
}
