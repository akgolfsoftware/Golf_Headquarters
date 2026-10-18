"use client";

import React from "react";
import Link from "next/link";
import { aksepterTrenerInvitasjon } from "@/app/team-wang/coach/admin-actions";

export function GodtaInvitasjon({ token }: { token: string }) {
  const [svar, setSvar] = React.useState<{ ok: true } | { ok: false; feil: string } | null>(null);
  const [venter, start] = React.useTransition();
  const godta = () => start(async () => setSvar(await aksepterTrenerInvitasjon(token)));

  if (svar?.ok) {
    return (
      <div className="wg-kort wg-fyll" role="status">
        <b>Du er lagt til som trener</b>
        <p className="wg-kilde">Du ser elevene i gruppa, men bare det hver elev har delt med WANG.</p>
        <div className="wg-knapper">
          <Link href="/team-wang/coach" className="wg-btn wg-btn-primary">Gå til trenerflaten</Link>
        </div>
      </div>
    );
  }
  return (
    <div className="wg-kort wg-fyll">
      <p className="wg-forklar" style={{ margin: 0 }}>
        Sportssjefen ved WANG Fredrikstad har invitert deg som trener for golfgruppa. Du får se elevene i gruppa og det
        de har delt med WANG. Kontoen din endres ikke ellers.
      </p>
      <div className="wg-knapper">
        <button type="button" className="wg-btn wg-btn-primary" disabled={venter} onClick={godta}>
          {venter ? "Godtar …" : "Godta invitasjonen"}
        </button>
      </div>
      {svar && !svar.ok && (
        <p className="wg-hjelp" role="alert" style={{ color: "var(--wg-rosa-tekst)" }}>{svar.feil}</p>
      )}
    </div>
  );
}
