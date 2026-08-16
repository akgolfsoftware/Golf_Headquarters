/**
 * PlayerHQ · AI mal-bygger (/portal/mal/bygger) — v2.
 * v2-port 17. juli 2026: ruten flyttet ut av (legacy), tynn server-side
 * over samme loader (hentByggerKontekst — auth via requirePortalUser i
 * actions.ts, flyttet verbatim). All wizard-logikk bor i MalByggerV2.
 */

import { hentByggerKontekst } from "./actions";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { MalByggerV2 } from "@/components/portal/v2/MalByggerV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "AI mal-bygger — PlayerHQ" };

export default async function MalByggerPage() {
  // Rot-layouten krever kun innlogging (16.08) — tilgangsnivået håndheves her.
  // Mal-byggeren står ikke på talent-allowlisten: FULL. (Loaderen i actions.ts
  // guarder også, men siden må si det selv — rutekontrakten leses per side.)
  await requirePortalUser({ kreverTilgang: "FULL" });
  const kontekst = await hentByggerKontekst();
  return (
    <V2Shell bredde="kolonne" aktiv="meg" nav={PLAYERHQ_NAV} navn={kontekst.spiller.navn}>
      <TilbakeLenke href="/portal/mal">Mål</TilbakeLenke>
      <MalByggerV2 kontekst={kontekst} />
    </V2Shell>
  );
}
