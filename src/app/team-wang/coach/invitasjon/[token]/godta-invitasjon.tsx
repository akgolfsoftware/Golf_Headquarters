"use client";

import React from "react";
import Link from "next/link";
import { aksepterTrenerInvitasjon } from "@/app/team-wang/coach/admin-actions";

/**
 * Godta-steget i invitasjonen (canvas rad 13). Viser hvilken konto som er logget inn før treneren godtar,
 * fordi invitasjonen gjelder én bestemt e-post. Ingenting lagres før «Godta invitasjonen».
 */
export function GodtaInvitasjon({ token, epost }: { token: string; epost?: string | null }) {
  const [svar, setSvar] = React.useState<{ ok: true } | { ok: false; feil: string } | null>(null);
  const [venter, start] = React.useTransition();
  const godta = () => start(async () => setSvar(await aksepterTrenerInvitasjon(token)));

  if (svar?.ok) {
    return (
      <div role="status" style={{ display: "grid", gap: 14 }}>
        <span className="wg-system-lagt-til">Lagt til</span>
        <p className="wg-system-tekst">Du er lagt til som trener. Du ser elevene i gruppa, men bare det hver elev har delt med WANG.</p>
        <div className="wg-system-knapper">
          <Link href="/team-wang/coach" className="wg-btn wg-btn-primary">Gå til trenerflaten</Link>
        </div>
      </div>
    );
  }
  return (
    <>
      <p className="wg-system-tekst">
        Sportssjefen ved WANG Fredrikstad har invitert deg som trener for golfgruppa. Du får se elevene i gruppa og
        det de har delt med WANG. Kontoen din endres ikke ellers.
      </p>
      <dl className="wg-system-fakta-rad">
        <div className="wg-system-fakta"><dt>Rolle</dt><dd>Trener</dd></div>
        <div className="wg-system-fakta"><dt>Logget inn som</dt><dd>{epost ?? "—"}</dd></div>
      </dl>
      <div className="wg-system-knapper">
        <button type="button" className="wg-btn wg-btn-primary" disabled={venter} onClick={godta}>
          {venter ? "Godtar …" : "Godta invitasjonen"}
        </button>
        <Link href="/wang" className="wg-btn wg-btn-secondary">Feil konto? Logg inn på nytt</Link>
      </div>
      {svar && !svar.ok ? (
        <p className="wg-system-tekst" role="alert" style={{ color: "var(--wg-rosa-tekst)", fontSize: 15 }}>{svar.feil}</p>
      ) : null}
      <p className="wg-kilde">Gjelder invitasjonen en annen e-postadresse, får du beskjed her.</p>
    </>
  );
}
