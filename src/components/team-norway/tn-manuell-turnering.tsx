"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { leggTilTurnering } from "@/app/portal/(legacy)/tren/turneringer/actions";
import { TnInput, TnKnapp } from "./core";
import { TN } from "@/lib/v2/team-norway";

/**
 * TN-17 Legg inn turnering manuelt.
 * Fasit: designsystem/team-norway/templates/tn-turnering-manuell/TnTurneringManuell.dc.html
 * Avvik:
 *   - AK Golf HQs funksjon lagrer turneringen på den innloggede spillerens plan.
 *   - Kilde vises som manuelt registrert; dokumentbelegg finnes ikke i modellen.
 */
export function TnManuellTurnering() {
  const router = useRouter();
  const [navn, setNavn] = useState("");
  const [dato, setDato] = useState("");
  const [kategori, setKategori] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [venter, start] = useTransition();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        start(async () => {
          const resultat = await leggTilTurnering({ manualName: navn, manualDate: dato, category: kategori || undefined, priority: "NORMAL" });
          if (!resultat.ok) { setFeil(resultat.feil); return; }
          router.push("/team-norway/turneringer");
          router.refresh();
        });
      }}
      style={{ display: "grid", gap: 16 }}
    >
      <TnInput label="Turneringsnavn" value={navn} onChange={setNavn} required />
      <TnInput label="Startdato" type="date" value={dato} onChange={setDato} required />
      <TnInput label="Kategori" value={kategori} onChange={setKategori} placeholder="For eksempel internasjonal amatør" />
      <div style={{ padding: 12, borderRadius: TN.radius.sm, background: TN.navy50, color: TN.navy900, fontSize: TN.text.sm }}>
        Kilde: manuelt registrert av spilleren. AK Golf HQ verifiserer ikke påmeldingen hos arrangøren.
      </div>
      {feil ? <p role="alert" style={{ margin: 0, color: TN.status.redText }}>{feil}</p> : null}
      <div><TnKnapp type="submit" variant="primaer" disabled={venter}>{venter ? "Lagrer …" : "Legg til i planen"}</TnKnapp></div>
    </form>
  );
}
