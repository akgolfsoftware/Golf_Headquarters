import type { ReactNode } from "react";

import { krevTnTrenerflate } from "@/lib/domain/tn-flate-tilgang";

/**
 * Alle Team Norway-skjermer ligger i denne rutegruppen, og bare
 * /team-norway/logg-inn står utenfor. Porten her er første linje; hver skjerm
 * kaller den samme porten selv (hentSkjermbruker), fordi en delt layout ikke
 * kjøres på nytt ved navigering mellom sider.
 */
export const dynamic = "force-dynamic";

export default async function TeamNorwayTrenerLayout({ children }: { children: ReactNode }) {
  await krevTnTrenerflate();
  return children;
}
