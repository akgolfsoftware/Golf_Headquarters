"use client";

import { useState, useTransition } from "react";

import { inviterSpillereTilGruppe } from "@/app/admin/grupper/[id]/actions";
import { TnKnapp } from "./core";
import { TN } from "@/lib/v2/team-norway";

/**
 * TN-19 Inviter spiller.
 * Fasit: designsystem/team-norway/templates/tn-inviter-spiller/TnInviterSpiller.dc.html
 * Avvik:
 *   - Gjenbruker AK Golf HQs eksisterende, tilgangskontrollerte gruppeinvitasjon.
 *   - Viser leveringsresultat, men måler ikke om e-posten er åpnet.
 */
export function TnInviterSpiller({ groupId }: { groupId: string }) {
  const [verdi, setVerdi] = useState("");
  const [melding, setMelding] = useState<string | null>(null);
  const [venter, start] = useTransition();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const eposter = verdi.split(/[\n,;]+/).map((epost) => epost.trim()).filter(Boolean);
        start(async () => {
          const resultat = await inviterSpillereTilGruppe(groupId, eposter);
          if (!resultat.ok) {
            setMelding(resultat.feil);
            return;
          }
          const fullfort = resultat.lagtTil.length + resultat.invitert.length;
          setMelding(`${fullfort} ${fullfort === 1 ? "spiller er" : "spillere er"} lagt til eller invitert.${resultat.feilet.length ? ` ${resultat.feilet.length} kunne ikke inviteres.` : ""}`);
          if (resultat.feilet.length === 0) setVerdi("");
        });
      }}
      style={{ display: "flex", flexDirection: "column", gap: 14 }}
    >
      <label htmlFor="tn-inviter-epost" style={{ fontWeight: TN.weight.semibold, color: TN.navy900 }}>
        E-postadresser
      </label>
      <textarea
        id="tn-inviter-epost"
        value={verdi}
        onChange={(event) => setVerdi(event.target.value)}
        placeholder="spiller@eksempel.no"
        rows={5}
        required
        style={{ width: "100%", resize: "vertical", padding: 14, border: `1px solid ${TN.borderDefault}`, borderRadius: TN.radius.sm, background: TN.white, color: TN.textPrimary, fontFamily: TN.font.body, fontSize: 16, lineHeight: TN.leading.normal }}
      />
      <p style={{ margin: 0, color: TN.textSecondary, fontSize: TN.text.sm, lineHeight: TN.leading.normal }}>
        Én adresse per linje. Eksisterende spillere meldes inn; nye får invitasjon til en gratis testprofil.
      </p>
      {melding ? <p role="status" style={{ margin: 0, padding: 12, borderRadius: TN.radius.sm, background: TN.navy50, color: TN.navy900 }}>{melding}</p> : null}
      <div><TnKnapp type="submit" variant="primaer" disabled={venter}>{venter ? "Inviterer …" : "Send invitasjon"}</TnKnapp></div>
    </form>
  );
}
