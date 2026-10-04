// PH25ToFaktor — Precision Athletics. Data og handlinger er beholdt. Ikke målt i appen.
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
/**
 * /portal/meg/sikkerhet/2fa — B-pakke.
 * Status/steg først, én grønn handling per steg (i TwoFaClient).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { TL } from "@/lib/v2/train-lock";

import { Caps, Tittel, TilbakeLenke } from "@/components/v2";
import { TwoFaClient } from "./twofa-client";

export default async function TwoFaPage() {
  await requirePortalUser({ kreverTilgang: "INGEN" });

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <div className="pa-side">
      <div
        style={{
          maxWidth: 640,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <TilbakeLenke href="/portal/meg/innstillinger/sikkerhet">Sikkerhet</TilbakeLenke>

        <div>
          <Caps>Sikkerhet · Tofaktor</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em="tofaktor">Aktiver</Tittel>
          </div>
          <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, margin: "8px 0 0", lineHeight: 1.45, maxWidth: "42ch" }}>
            Tre raske steg. Etter aktivering trenger du en 6-sifret kode hver gang du logger inn.
          </p>
        </div>

        <TwoFaClient />
      </div>
    </div>
    </PlayerHQSkall>
  );
}
