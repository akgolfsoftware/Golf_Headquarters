"use client";

import { useState } from "react";
import { Knapp } from "@/components/v2";
import { NyGruppeModal, type CoachValg } from "./ny-gruppe-modal";
import { bootstrapGfgkJuniorGrupper } from "./actions";
import { T } from "@/lib/v2/tokens";

export function NyGruppeButton({ coaches }: { coaches: CoachValg[] }) {
  const [aapen, setAapen] = useState(false);
  return (
    <>
      <Knapp ghost icon="plus" onClick={() => setAapen(true)}>
        Ny gruppe
      </Knapp>
      {aapen && <NyGruppeModal coaches={coaches} onClose={() => setAapen(false)} />}
    </>
  );
}

/**
 * Engangsknapp: oppretter GFGK Junior-gruppene (gfgkjunior.no-bootstrap).
 * Rendres av page.tsx kun når en eller flere av de fire gruppene mangler.
 */
export function GfgkBootstrapButton() {
  const [kjorer, setKjorer] = useState(false);
  const [melding, setMelding] = useState<string | null>(null);

  async function kjor() {
    setKjorer(true);
    setMelding(null);
    const res = await bootstrapGfgkJuniorGrupper();
    setKjorer(false);
    if ("error" in res) {
      setMelding(res.error);
      return;
    }
    const r = res.data;
    setMelding(
      r
        ? `Ferdig: ${r.grupperOpprettet.length} grupper, ${r.okterOpprettet} økter og ${r.perioderOpprettet} perioder opprettet. gfgkjunior.no synkroniserer innen 5 min.`
        : "Ferdig.",
    );
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <Knapp ghost icon="plus" onClick={kjor} disabled={kjorer}>
        {kjorer ? "Oppretter GFGK Junior …" : "Opprett GFGK Junior-gruppene"}
      </Knapp>
      {melding ? (
        <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>{melding}</span>
      ) : null}
    </span>
  );
}
