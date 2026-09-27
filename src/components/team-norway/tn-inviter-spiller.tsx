"use client";

import { useState, useTransition } from "react";

import { inviterSpillereTilGruppe, type InviterSpillereResultat } from "@/app/admin/grupper/[id]/actions";
import { TnKnapp } from "./core";
import { TN } from "@/lib/v2/team-norway";

type VisningResultat = Extract<InviterSpillereResultat, { ok: true }>;

/** Speiler `ALLEREDE_MEDLEM_MØNSTER` i actions.ts — skiller «ingenting å gjøre» fra en reell sendefeil. */
const ALLEREDE_MEDLEM_MØNSTER = /allerede medlem/i;

/**
 * TN-19 Inviter spiller.
 * Fasit: designsystem/team-norway/templates/tn-inviter-spiller/TnInviterSpiller.dc.html
 * Avvik:
 *   - Gjenbruker AK Golf HQs eksisterende, tilgangskontrollerte gruppeinvitasjon.
 *   - Viser leveringsresultat, men måler ikke om e-posten er åpnet.
 *
 * Rettet 2026-09-14 (Codex-review samme dag): viser nå alle tre utfall
 * separat (sendt / opprettet-profil / allerede-lagt-til), skiller
 * «allerede medlem»-rader (ingenting mer å gjøre) fra reelle sendefeil (kun
 * disse legges tilbake i feltet for retry), sperrer feltet mens en
 * forespørsel er i gang, og fanger nettverks-/server-action-feil uten å
 * viske ut forrige vellykkede resultat.
 */
export function TnInviterSpiller({ groupId }: { groupId: string }) {
  const [verdi, setVerdi] = useState("");
  const [resultat, setResultat] = useState<VisningResultat | null>(null);
  const [feilmelding, setFeilmelding] = useState<string | null>(null);
  const [venter, start] = useTransition();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const eposter = verdi.split(/[\n,;]+/).map((epost) => epost.trim()).filter(Boolean);
        start(async () => {
          let svar: InviterSpillereResultat;
          try {
            svar = await inviterSpillereTilGruppe(groupId, eposter);
          } catch {
            // Nettverksfeil/kastet server action: forrige resultat (om noe)
            // blir stående synlig — vi vet ikke om dette forsøket faktisk
            // rakk fram, så feltet tømmes eller endres ikke.
            setFeilmelding("Kunne ikke nå serveren. Sjekk nettforbindelsen og prøv igjen.");
            return;
          }
          if (!svar.ok) {
            setFeilmelding(svar.feil);
            return;
          }
          setFeilmelding(null);
          setResultat(svar);
          // Kun adresser med en REELL sendefeil legges tilbake — en
          // «allerede medlem»-rad er ferdig behandlet og skal ikke sendes på
          // nytt (ny sending ville bare gitt samme svar igjen).
          const retrybare = svar.feilet.filter((f) => !ALLEREDE_MEDLEM_MØNSTER.test(f.feil));
          setVerdi(retrybare.map((f) => f.epost).join("\n"));
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
        disabled={venter}
        style={{ width: "100%", resize: "vertical", padding: 14, border: `1px solid ${TN.borderDefault}`, borderRadius: TN.radius.sm, background: TN.white, color: TN.textPrimary, fontFamily: TN.font.body, fontSize: 16, lineHeight: TN.leading.normal }}
      />
      <p style={{ margin: 0, color: TN.textSecondary, fontSize: TN.text.sm, lineHeight: TN.leading.normal }}>
        Én adresse per linje. Eksisterende spillere meldes inn; nye får invitasjon til en gratis testprofil.
      </p>
      {feilmelding ? (
        <p role="alert" style={{ margin: 0, padding: 12, borderRadius: TN.radius.sm, background: TN.status.redBg, color: TN.status.redText }}>
          {feilmelding}
        </p>
      ) : null}
      {resultat ? <TnInvitasjonResultat resultat={resultat} /> : null}
      <div><TnKnapp type="submit" variant="primaer" disabled={venter}>{venter ? "Inviterer …" : "Send invitasjon"}</TnKnapp></div>
    </form>
  );
}

function TnInvitasjonResultat({ resultat }: { resultat: VisningResultat }) {
  const { lagtTil, opprettet, invitert, feilet } = resultat;
  if (lagtTil.length === 0 && opprettet.length === 0 && invitert.length === 0 && feilet.length === 0) return null;

  const alleredeMedlem = feilet.filter((f) => ALLEREDE_MEDLEM_MØNSTER.test(f.feil));
  const sendefeil = feilet.filter((f) => !ALLEREDE_MEDLEM_MØNSTER.test(f.feil));

  return (
    <div role="status" style={{ display: "flex", flexDirection: "column", gap: 8, padding: 12, borderRadius: TN.radius.sm, background: TN.navy50, color: TN.navy900, fontSize: TN.text.sm }}>
      {invitert.length > 0 ? (
        <p style={{ margin: 0 }}>
          {invitert.length} {invitert.length === 1 ? "invitasjon sendt" : "invitasjoner sendt"}: {invitert.join(", ")}
        </p>
      ) : null}
      {opprettet.length > 0 ? (
        <p style={{ margin: 0 }}>
          {opprettet.length} {opprettet.length === 1 ? "ny testprofil opprettet" : "nye testprofiler opprettet"}: {opprettet.join(", ")}
        </p>
      ) : null}
      {lagtTil.length > 0 ? (
        <p style={{ margin: 0 }}>
          {lagtTil.length} {lagtTil.length === 1 ? "spiller er lagt til direkte" : "spillere er lagt til direkte"} (fantes allerede som bruker, ingen e-post sendes): {lagtTil.join(", ")}
        </p>
      ) : null}
      {alleredeMedlem.length > 0 ? (
        <p style={{ margin: 0, color: TN.textSecondary }}>
          {alleredeMedlem.length} {alleredeMedlem.length === 1 ? "adresse er allerede medlem" : "adresser er allerede medlemmer"} — ingenting mer å gjøre: {alleredeMedlem.map((f) => f.epost).join(", ")}
        </p>
      ) : null}
      {sendefeil.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <p style={{ margin: 0, fontWeight: TN.weight.semibold }}>
            {sendefeil.length} {sendefeil.length === 1 ? "adresse ble ikke sendt" : "adresser ble ikke sendt"} — stående i feltet for ny sending:
          </p>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {sendefeil.map((f) => (
              <li key={f.epost}>
                {f.epost} — {f.feil}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
