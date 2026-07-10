/**
 * MARKEDSSIDE Jobb (/jobb, retning C). OFFENTLIG: ingen auth-guard, egen
 * marketing-chrome (MRamme), IKKE V2Shell.
 */
import type { Metadata } from "next";
import { MarkedJobbV2 } from "@/components/marketing/v2/MarkedJobbV2";

export const metadata: Metadata = {
  title: "Jobb hos oss i AK Golf Academy",
  description:
    "Se ledige stillinger i AK Golf Academy og AK Golf Group. Send spontansøknad eller søk på aktive utlysninger.",
};

export default function JobbPage() {
  return <MarkedJobbV2 />;
}
