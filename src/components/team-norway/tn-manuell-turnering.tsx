"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { leggTilTurnering } from "@/app/portal/(legacy)/tren/turneringer/actions";
import { TnInput, TnKnapp } from "./core";
import { TN } from "@/lib/v2/team-norway";

/**
 * TN-17 Legg inn turnering manuelt.
 * Fasit: docs/design-system/utkast-tn/daglig.html, skjerm Legg inn turnering (pakke 2).
 * Avvik:
 *   - Bane, par, påmeldingsfrist og resultatlenke fra tegningen har ingen felt i
 *     modellen. Skjemaet har navn, startdato og kategori.
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
      <div style={{ padding: "12px 14px", borderRadius: TN.radius.sm, background: TN.ink50, border: `1px solid ${TN.ink200}`, color: TN.ink700, fontSize: 14.5, lineHeight: 1.55 }}>
        Kilde: manuelt registrert av spilleren. AK Golf HQ verifiserer ikke påmeldingen hos arrangøren.
      </div>
      {feil ? <p role="alert" style={{ margin: 0, color: TN.status.redText, fontSize: 13.5, fontWeight: 700 }}>{feil}</p> : null}
      <div><TnKnapp type="submit" variant="primaer" disabled={venter}>{venter ? "Lagrer …" : "Legg til i planen"}</TnKnapp></div>
    </form>
  );
}
