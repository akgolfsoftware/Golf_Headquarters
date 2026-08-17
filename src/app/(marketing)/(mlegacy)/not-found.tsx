/**
 * 404 for ruter under (marketing)/(mlegacy) — Paper, samme mønster som
 * src/app/not-found.tsx (samme publikum: marketing/offentlig). (mlegacy)
 * er en rutegruppe og eier sin egen not-found-grense i Next.js'
 * nærmeste-ancestor-mønster — duplisert fil, ikke duplisert design.
 */

import type { Metadata } from "next";
import { IkkeFunnet } from "@/components/system/ikke-funnet";

export const metadata: Metadata = {
  title: "Side ikke funnet — AK Golf Academy",
};

export default function MarketingLegacyNotFound() {
  return <IkkeFunnet />;
}
