/**
 * PlayerHQ · AI mal-bygger (/portal/mal/bygger) — v2.
 * v2-port 17. juli 2026: ruten flyttet ut av (legacy), tynn server-side
 * over samme loader (hentByggerKontekst — auth via requirePortalUser i
 * actions.ts, flyttet verbatim). All wizard-logikk bor i MalByggerV2.
 */

import { hentByggerKontekst } from "./actions";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { MalByggerV2 } from "@/components/portal/v2/MalByggerV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "AI mal-bygger — PlayerHQ" };

export default async function MalByggerPage() {
  const kontekst = await hentByggerKontekst();
  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={kontekst.spiller.navn}>
      <TilbakeLenke href="/portal/mal">Mål</TilbakeLenke>
      <MalByggerV2 kontekst={kontekst} />
    </V2Shell>
  );
}
