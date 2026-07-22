/**
 * /portal/meg/sikkerhet/2fa — B-pakke.
 * Status/steg først, én grønn handling per steg (i TwoFaClient).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { T } from "@/lib/v2/tokens";
import { Caps, Tittel, TilbakeLenke } from "@/components/v2";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TwoFaClient } from "./twofa-client";

export default async function TwoFaPage() {
  const user = await requirePortalUser();

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <div
        style={{
          maxWidth: 640,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: T.gap,
        }}
      >
        <TilbakeLenke href="/portal/meg/innstillinger/sikkerhet">Sikkerhet</TilbakeLenke>

        <div>
          <Caps>Sikkerhet · Tofaktor</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em="tofaktor">Aktiver</Tittel>
          </div>
          <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, margin: "8px 0 0", lineHeight: 1.45, maxWidth: "42ch" }}>
            Tre raske steg. Etter aktivering trenger du en 6-sifret kode hver gang du logger inn.
          </p>
        </div>

        <TwoFaClient />
      </div>
    </V2Shell>
  );
}
