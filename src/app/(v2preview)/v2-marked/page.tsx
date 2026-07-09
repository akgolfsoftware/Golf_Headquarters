/**
 * v2-forhåndsvisning — Marketing Forside (akgolf.no, retning C). OFFENTLIG
 * flate: ingen auth-guard, ingen dataloader (dette er markedsføringssiden,
 * ikke en datadrevet app-skjerm). Egen top-level route-group (v2preview) som
 * ikke arver PortalShell — MarkedForsideV2 leverer sin egen dark-scope +
 * marketing-chrome (MNav/MFot), bevisst UTEN V2Shell.
 */

import { MarkedForsideV2 } from "@/components/marketing/v2/MarkedForsideV2";

export const dynamic = "force-dynamic";

export default function V2MarkedPreviewPage() {
  return <MarkedForsideV2 />;
}
