"use client";

/**
 * G6 — «Per trener»-fanen på AgencyOS Tilgang. ADMIN velger en coach og
 * toggler capabilities; bryteren viser EFFEKTIV tilstand (rolle-default ±
 * override). Toggle skriver GRANT/REVOKE-override — eller sletter overriden
 * når valget matcher defaulten (settCapabilityOverride).
 *
 * Funksjonelt — trenger fasit-runde for endelig utseende (flagget i PR).
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Kort, Bryter, StatusPill, TomTilstand, T } from "@/components/v2";
import { settCapabilityOverride } from "@/app/admin/settings/tilgang/actions";

export type PerTrenerRad = {
  capability: string;
  beskrivelse: string;
  /** can("COACH", capability) — rolle-defaulten. */
  standard: boolean;
  override: "GRANT" | "REVOKE" | null;
  /** standard ± override — det bryteren viser. */
  effektiv: boolean;
};

export type PerTrenerCoach = {
  id: string;
  navn: string;
  epost: string;
  rader: PerTrenerRad[];
};

export function AdminTilgangPerTrenerV2({ trenere }: { trenere: PerTrenerCoach[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [valgtId, setValgtId] = useState<string>(trenere[0]?.id ?? "");
  const [feil, setFeil] = useState<string | null>(null);

  const valgt = trenere.find((t) => t.id === valgtId) ?? null;

  function toggle(capability: string, aktivert: boolean) {
    if (!valgt || pending) return;
    setFeil(null);
    startTransition(async () => {
      const res = await settCapabilityOverride({
        coachId: valgt.id,
        capability,
        aktivert,
      });
      if (!res.ok) {
        setFeil(res.error);
        return;
      }
      router.refresh();
    });
  }

  if (trenere.length === 0) {
    return (
      <Kort>
        <TomTilstand
          icon="users"
          title="Ingen trenere"
          sub="Inviter en coach fra Team-siden — så kan tilgangen styres her."
        />
      </Kort>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <Kort>
        <label
          htmlFor="g6-velg-coach"
          style={{ display: "block", fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg, marginBottom: 6 }}
        >
          Velg trener
        </label>
        <select
          id="g6-velg-coach"
          value={valgtId}
          onChange={(e) => setValgtId(e.target.value)}
          className="v2-focus"
          style={{
            width: "100%",
            maxWidth: 420,
            height: 38,
            padding: "0 10px",
            borderRadius: 8,
            border: `1px solid ${T.border}`,
            background: T.panel2,
            color: T.fg,
            fontFamily: T.ui,
            fontSize: 13,
          }}
        >
          {trenere.map((t) => (
            <option key={t.id} value={t.id}>
              {t.navn} ({t.epost})
            </option>
          ))}
        </select>
      </Kort>

      {valgt && (
        <Kort>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
            <div style={{ fontFamily: T.disp, fontSize: 15, fontWeight: 700, color: T.fg }}>
              Tilganger for {valgt.navn}
            </div>
            {pending && <StatusPill tone="info">Lagrer…</StatusPill>}
          </div>
          <p style={{ margin: "0 0 8px", fontFamily: T.ui, fontSize: 11.5, color: T.mut, lineHeight: 1.55 }}>
            Bryteren viser effektiv tilgang. Avvik fra trener-standarden lagres
            som unntak for denne treneren og kan slås tilbake når som helst.
          </p>
          {feil && (
            <p role="alert" style={{ margin: "0 0 8px", fontFamily: T.ui, fontSize: 12, color: T.fg, fontWeight: 600 }}>
              {feil}
            </p>
          )}
          <div>
            {valgt.rader.map((rad) => (
              <Bryter
                key={rad.capability}
                label={rad.beskrivelse}
                sub={
                  rad.override
                    ? rad.override === "GRANT"
                      ? "Unntak: gitt i tillegg til trener-standarden"
                      : "Unntak: fjernet fra trener-standarden"
                    : rad.standard
                      ? "Trener-standard"
                      : "Ikke i trener-standarden"
                }
                checked={rad.effektiv}
                onChange={(on) => toggle(rad.capability, on)}
              />
            ))}
          </div>
        </Kort>
      )}
    </div>
  );
}
