"use client";

/**
 * AgencyOS Grupper — T8 Train-lock (liste + valgt gruppe).
 * Samme datakontrakt som før. Primær: Ny gruppe / Åpne gruppe.
 */

import { useState } from "react";
import { TL } from "@/lib/v2/train-lock";
import { TlBadge, TlKort, TlKnapp, TlRad, TlTittel, TlTomTilstand } from "@/components/admin/v2/oppsett/tl-kit";

export interface FastTid {
  id: string;
  dag: string;
  tid: string;
  tittel: string;
  sted: string | null;
}
export interface GruppeV2 {
  id: string;
  navn: string;
  antallMedlemmer: number;
  nesteOkt: string | null;
  faste: FastTid[];
}
export interface GrupperData {
  grupper: GruppeV2[];
}

export interface GrupperV2Actions {
  NyGruppeButton: React.ComponentType<{ coaches: { id: string; name: string }[] }>;
}

const spillere = (n: number) => `${n} ${n === 1 ? "spiller" : "spillere"}`;
const grupperOrd = (n: number) => `${n} ${n === 1 ? "gruppe" : "grupper"}`;

export function GrupperV2({
  data,
  actions: A,
  coaches,
}: {
  data: GrupperData;
  actions: GrupperV2Actions;
  coaches: { id: string; name: string }[];
}) {
  const { grupper } = data;
  const [valgtId, setValgtId] = useState<string | null>(grupper[0]?.id ?? null);
  const valgt = grupper.find((g) => g.id === valgtId) ?? null;
  const totalMedlemmer = grupper.reduce((s, g) => s + g.antallMedlemmer, 0);

  const primaer = valgt?.faste[0] ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 960, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div>
          <TlTittel sub={`${grupperOrd(grupper.length)} · ${spillere(totalMedlemmer)}`}>Grupper</TlTittel>
        </div>
        <TlBadge tone={grupper.length > 0 ? "nøytral" : "varsel"}>
          {grupper.length === 0 ? "Ingen grupper" : grupperOrd(grupper.length)}
        </TlBadge>
      </div>

      <A.NyGruppeButton coaches={coaches} />

      <div className="grid grid-cols-1 lg:[grid-template-columns:2fr_3fr]" style={{ gap: 16, alignItems: "start" }}>
        <TlKort eyebrow="Alle grupper">
          {grupper.length === 0 ? (
            <TlTomTilstand
              icon="users"
              title="Ingen grupper ennå"
              sub="Opprett den første gruppen for å samle spillere."
            />
          ) : (
            grupper.map((g, i) => (
              <TlRad
                key={g.id}
                onClick={() => setValgtId(g.id)}
                title={g.navn}
                sub={g.nesteOkt ? `Neste økt: ${g.nesteOkt}` : "Ingen treningstid satt"}
                meta={spillere(g.antallMedlemmer)}
                chevron={false}
                last={i === grupper.length - 1}
              />
            ))
          )}
        </TlKort>

        {valgt && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
            <TlKort
              eyebrow={valgt.navn}
              action={<TlBadge>{spillere(valgt.antallMedlemmer)}</TlBadge>}
            >
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>
                {primaer
                  ? `${primaer.dag} ${primaer.tid}${primaer.sted ? ` · ${primaer.sted}` : ""}`
                  : "Ingen fast treningstid satt"}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                <TlKnapp variant="primaer" href={`/admin/grupper/${valgt.id}`}>
                  Åpne gruppe
                </TlKnapp>
                <TlKnapp variant="sekundaer" href={`/admin/grupper/${valgt.id}/workbench`}>
                  Workbench
                </TlKnapp>
                <TlKnapp variant="tertiaer" href={`/admin/grupper/${valgt.id}/timeplan`}>
                  Timeplan
                </TlKnapp>
              </div>
            </TlKort>

            <TlKort eyebrow="Faste treningstider">
              {valgt.faste.length === 0 ? (
                <TlTomTilstand
                  icon="calendar"
                  title="Ingen treningstider"
                  sub="Legg til faste treningstider for gruppen i timeplanen."
                />
              ) : (
                valgt.faste.map((f, i) => (
                  <TlRad
                    key={f.id}
                    title={f.tittel}
                    sub={f.sted ?? undefined}
                    meta={`${f.dag} ${f.tid}`}
                    chevron={false}
                    last={i === valgt.faste.length - 1}
                  />
                ))
              )}
            </TlKort>
          </div>
        )}
      </div>
    </div>
  );
}
