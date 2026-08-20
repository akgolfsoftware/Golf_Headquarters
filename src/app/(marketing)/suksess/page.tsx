/**
 * MARKEDSSIDE Suksesshistorier (/suksess). OFFENTLIG: ingen auth-guard.
 * Ryddet 20.08.2026 — se MarkedSuksessV2 for begrunnelse.
 */
import type { Metadata } from "next";
import { MarkedSuksessV2 } from "@/components/marketing/v2/MarkedSuksessV2";

export const metadata: Metadata = {
  title: "Suksesshistorier · AK Golf Academy",
  description:
    "Bli neste suksesshistorie hos AK Golf Academy — se turneringsresultater eller book en kartleggingsøkt.",
};

export default function SuksessPage() {
  return <MarkedSuksessV2 />;
}
