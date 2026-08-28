"use client";
import { TL } from "@/lib/v2/train-lock";

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
import { Kort, Bryter, StatusPill, TomTilstand } from "@/components/v2";
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
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Kort>
        <label
          htmlFor="g6-velg-coach"
          style={{ display: "block", fontFamily: TL.font.sans, fontSize: 12.5, fontWeight: 600, color: TL.text, marginBottom: 6 }}
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
            border: `1px solid ${TL.hair}`,
            background: TL.dock,
            color: TL.text,
            fontFamily: TL.font.sans,
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
            <div style={{ fontFamily: TL.font.sans, fontSize: 15, fontWeight: 700, color: TL.text }}>
              Tilganger for {valgt.navn}
            </div>
            {pending && <StatusPill tone="info">Lagrer…</StatusPill>}
          </div>
          <p style={{ margin: "0 0 8px", fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute, lineHeight: 1.55 }}>
            Bryteren viser effektiv tilgang. Avvik fra trener-standarden lagres
            som unntak for denne treneren og kan slås tilbake når som helst.
          </p>
          {feil && (
            <p role="alert" style={{ margin: "0 0 8px", fontFamily: TL.font.sans, fontSize: 12, color: TL.text, fontWeight: 600 }}>
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
