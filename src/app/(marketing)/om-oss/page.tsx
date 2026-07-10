/**
 * MARKEDSSIDE Om oss (/om-oss, retning C). OFFENTLIG: ingen auth-guard, egen
 * marketing-chrome (MRamme), IKKE V2Shell.
 */
import type { Metadata } from "next";
import { MarkedOmOssV2 } from "@/components/marketing/v2/MarkedOmOssV2";

export const metadata: Metadata = {
  title: "Om oss | AK Golf Academy",
  description:
    "Les om Anders Kristiansen og filosofien bak AK Golf Academy: personlig coaching bygd på Mac O'Grady-metodikk og moderne data-analyse.",
};

export default function OmOssPage() {
  return <MarkedOmOssV2 />;
}
