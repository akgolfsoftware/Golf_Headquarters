/**
 * Appens 404. Samme Precision-ramme som SY-01. Ingen data.
 */

import type { Metadata } from "next";
import { IkkeFunnet } from "@/components/system/ikke-funnet";

export const metadata: Metadata = {
  title: "Side ikke funnet — AK Golf Academy",
};

export default function NotFound() {
  return <IkkeFunnet hjemHref="/" />;
}
