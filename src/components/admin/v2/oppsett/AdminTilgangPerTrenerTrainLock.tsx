"use client";

/**
 * G6 — «Per trener»-fanen på AgencyOS Tilgang, Train-lock (T13, 27.08.2026).
 * ADMIN velger en coach og toggler capabilities; bryteren viser EFFEKTIV
 * tilstand (rolle-default ± override). Toggle skriver GRANT/REVOKE-override
 * — eller sletter overriden når valget matcher defaulten
 * (settCapabilityOverride, UENDRET fra Paper-versjonen).
 *
 * Designport av `AdminTilgangPerTrenerV2` — ingen egen fasit, mønster-port
 * til tl-kit. Funksjonelt — trenger fasit-runde for endelig utseende
 * (samme forbehold som Paper-versjonen hadde).
 *
 * Tokens: KUN TL — CLAUDE.md invariant 2.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TL } from "@/lib/v2/train-lock";
import { settCapabilityOverride } from "@/app/admin/settings/tilgang/actions";
import { TlBadge, TlKort, TlSwitchRad } from "./tl-kit";

export type PerTrenerRad = {
  capability: string;
  beskrivelse: string;
  standard: boolean;
  override: "GRANT" | "REVOKE" | null;
  effektiv: boolean;
};

export type PerTrenerCoach = {
  id: string;
  navn: string;
  epost: string;
  rader: PerTrenerRad[];
};

export function AdminTilgangPerTrenerTrainLock({ trenere }: { trenere: PerTrenerCoach[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [valgtId, setValgtId] = useState<string>(trenere[0]?.id ?? "");
  const [feil, setFeil] = useState<string | null>(null);

  const valgt = trenere.find((t) => t.id === valgtId) ?? null;

  function toggle(capability: string, aktivert: boolean) {
    if (!valgt || pending) return;
    setFeil(null);
    startTransition(async () => {
      const res = await settCapabilityOverride({ coachId: valgt.id, capability, aktivert });
      if (!res.ok) {
        setFeil(res.error);
        return;
      }
      router.refresh();
    });
  }

  if (trenere.length === 0) {
    return (
      <TlKort>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center", padding: "34px 24px" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: TL.text }}>Ingen trenere</div>
          <p style={{ margin: 0, fontSize: 13, color: TL.mute, lineHeight: 1.55, maxWidth: "44ch" }}>
            Inviter en coach fra Team-siden — så kan tilgangen styres her.
          </p>
        </div>
      </TlKort>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <TlKort>
        <label htmlFor="g6-velg-coach-tl" style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: TL.text, marginBottom: 6 }}>
          Velg trener
        </label>
        <select
          id="g6-velg-coach-tl"
          value={valgtId}
          onChange={(e) => setValgtId(e.target.value)}
          style={{
            width: "100%",
            maxWidth: 420,
            height: 44,
            padding: "0 12px",
            borderRadius: TL.radius.field,
            background: TL.dock,
            boxShadow: `inset 0 0 0 1px ${TL.hair}`,
            color: TL.text,
            fontSize: 14,
            fontFamily: TL.font.sans,
            border: "none",
          }}
        >
          {trenere.map((t) => (
            <option key={t.id} value={t.id}>
              {t.navn} ({t.epost})
            </option>
          ))}
        </select>
      </TlKort>

      {valgt && (
        <TlKort pad="18px 20px 4px">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: TL.text }}>Tilganger for {valgt.navn}</div>
            {pending && <TlBadge>Lagrer…</TlBadge>}
          </div>
          <p style={{ margin: "0 0 8px", fontSize: 11.5, color: TL.mute, lineHeight: 1.55 }}>
            Bryteren viser effektiv tilgang. Avvik fra trener-standarden lagres som unntak for denne treneren og kan slås tilbake når
            som helst.
          </p>
          {feil && (
            <p role="alert" style={{ margin: "0 0 8px", fontSize: 12, color: TL.danger, fontWeight: 600 }}>
              {feil}
            </p>
          )}
          <div>
            {valgt.rader.map((rad, i) => (
              <TlSwitchRad
                key={rad.capability}
                title={rad.beskrivelse}
                sub={
                  rad.override
                    ? rad.override === "GRANT"
                      ? "Unntak: gitt i tillegg til trener-standarden"
                      : "Unntak: fjernet fra trener-standarden"
                    : rad.standard
                      ? "Trener-standard"
                      : "Ikke i trener-standarden"
                }
                on={rad.effektiv}
                disabled={pending}
                onChange={() => toggle(rad.capability, !rad.effektiv)}
                last={i === valgt.rader.length - 1}
              />
            ))}
          </div>
        </TlKort>
      )}
    </div>
  );
}
