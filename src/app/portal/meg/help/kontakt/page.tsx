/**
 * /portal/meg/help/kontakt — B-pakke.
 * Status (svartid) først, deretter skjema med én grønn send-CTA.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { TL } from "@/lib/v2/train-lock";

import { Caps, Tittel, Kort, TilbakeLenke, StatusPill } from "@/components/v2";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { KontaktSupportForm } from "./kontakt-support-form";

export default async function KontaktSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ ticket?: string }>;
}) {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  const sp = await searchParams;

  return (
    <V2Shell aktiv="meg" bredde="kolonne" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <TilbakeLenke href="/portal/meg/help">Hjelp</TilbakeLenke>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <Caps>Støtte · Direkte kontakt</Caps>
            <div style={{ marginTop: 10 }}>
              <Tittel em="support">Kontakt</Tittel>
            </div>
            <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, margin: "8px 0 0", lineHeight: 1.45, maxWidth: "42ch" }}>
              Beskriv problemet — jo mer kontekst, desto raskere svar.
            </p>
          </div>
          <StatusPill tone="up">~4 t · hverdager 08–17</StatusPill>
        </div>

        {sp?.ticket && (
          <Kort style={{ borderColor: `color-mix(in srgb, ${TL.ok} 30%, ${TL.hair})` }}>
            <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 13.5, color: TL.text, lineHeight: 1.5 }}>
              Melding sendt. Ticket-ID{" "}
              <span style={{ fontFamily: TL.font.mono, fontWeight: 700 }}>#{sp.ticket}</span>. Du får svar på e-post.
            </p>
          </Kort>
        )}

        <KontaktSupportForm
          bruker={{
            navn: user.name ?? "",
            epost: user.email ?? "",
          }}
        />
      </div>
    </V2Shell>
  );
}
