// PH14EgenTest — Precision Athletics. Data og handlinger er beholdt. Ikke målt i appen.
import { TL } from "@/lib/v2/train-lock";
/**
 * PlayerHQ · Tren · Tester · Ny egen test (/portal/tren/tester/ny/egen) — v2.
 * v2-port 17. juli 2026 (Team F3): `NyTestEgenV2` erstatter legacy
 * EgenTestWizard, ruten flyttet ut av (legacy). Auth (PLAYER/COACH/ADMIN) er
 * uendret; server action `opprettCustomTest` er flyttet byte-identisk til
 * ./actions.ts. Kun presentasjonslaget er nytt.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { TilbakeLenke, Caps, Tittel } from "@/components/v2";
import { NyTestEgenV2 } from "@/components/portal/v2/NyTestEgenV2";

export const dynamic = "force-dynamic";

export default async function NyEgenTestPage() {
  const user = await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER", "COACH", "ADMIN"] });

  return (
        <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <div className="pa-side">
      <TilbakeLenke href="/portal/tren/tester">Tilbake til tester</TilbakeLenke>
      <div style={{ maxWidth: 720, width: "100%", margin: "0 auto" }}>
        <Caps>Trening · Tester</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="egen test">Lag en</Tittel>
        </div>
        <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, lineHeight: 1.55, margin: "10px 0 0" }}>
          Fem steg — navn, protokoll, måleenhet, synlighet og forhåndsvisning
          {user.name ? `, ${user.name.split(" ")[0]}` : ""}.
        </p>
      </div>
      <NyTestEgenV2 rolle={user.role} />
          </div>
    </PlayerHQSkall>
  );
}
