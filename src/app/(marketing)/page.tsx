/**
 * Forsiden (akgolf.no). OFFENTLIG flate: ingen auth-guard, ingen dataloader.
 *
 * Siden 04.10.2026 (Anders: «Bytt til Precision») i «AK Golf Precision
 * Athletics» — lyst tema, samme skall (MarkedNav + MarkedFot) som resten av
 * markedet. Den mørke, filmatiske forsiden fra 22.09.2026 er erstattet.
 */

import type { Metadata } from "next";

import { ForsidePrecision } from "@/components/marketing/ds-sider/ForsidePrecision";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Coaching og Player HQ i Fredrikstad",
  description:
    "Coaching med Anders Kristiansen på bane, i studio og i gruppe, og Player HQ for deg som trener videre mellom timene.",
};

export default function MarketingHjemPage() {
  return <ForsidePrecision />;
}
