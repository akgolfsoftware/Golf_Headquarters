/**
 * Forsiden (akgolf.no). OFFENTLIG flate: ingen auth-guard, ingen dataloader.
 *
 * Siden 04.10.2026 (Anders: «Bytt til Precision») i «AK Golf Precision
 * Athletics» — lyst tema, samme skall (MarkedNav + MarkedFot) som resten av
 * markedet. Den mørke, filmatiske forsiden fra 22.09.2026 er erstattet.
 */

import { ForsidePrecision } from "@/components/marketing/ds-sider/ForsidePrecision";

export default function MarketingHjemPage() {
  return <ForsidePrecision />;
}
