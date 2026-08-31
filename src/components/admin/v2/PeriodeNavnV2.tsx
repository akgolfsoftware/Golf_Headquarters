"use client";
import { TL } from "@/lib/v2/train-lock";
/**
 * AgencyOS · Innstillinger · Periodenavn.
 * Viser periodenavn (TrainingPeriod.name) som ikke gjenkjennes av den
 * hardkodede ordboken i periode-navn.ts — økter i disse periodene valideres
 * ikke mot CANON i dag. Coach kobler navnet til en periodetype her, uten
 * kodeendring. Kun T-tokens, ingen rå hex.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Caps, Tittel, Kort, StatusPill, Knapp, Icon } from "@/components/v2";
import { Velger } from "@/components/v2/skjema";
import type { PeriodeType } from "@/generated/prisma/client";
import { leggTilPeriodeNavnMapping, slettPeriodeNavnMapping, type PeriodeNavnOversikt } from "@/app/admin/settings/periode-navn/actions";
import type { PeriodeNavnLabel } from "@/app/admin/settings/periode-navn/labels";

export function PeriodeNavnV2({
  oversikt,
  typer,
  somFane = false,
}: {
  oversikt: PeriodeNavnOversikt;
  typer: PeriodeNavnLabel[];
  /** True når komponenten står som «Perioder»-fanen i /admin/oppsett (MASTERPLAN 15.3). */
  somFane?: boolean;
}) {
  const statusTone = oversikt.ukjente.length > 0 ? ("warn" as const) : ("lime" as const);
  const statusTekst =
    oversikt.ukjente.length > 0
      ? `${oversikt.ukjente.length} ukjent${oversikt.ukjente.length === 1 ? "" : "e"}`
      : "Alle navn gjenkjent";

  return (
    <div data-paper-slug="agencyos-oppsett" style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 900 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <div>
          {!somFane && (
            <>
              <Caps>Metodikk</Caps>
              <Tittel em="navn">Periode</Tittel>
            </>
          )}
          <p style={{ fontFamily: TL.font.sans, fontSize: 13.5, color: TL.mute, lineHeight: 1.55, margin: somFane ? 0 : "10px 0 0", maxWidth: 680 }}>
            Et periodenavn som ikke gjenkjennes (f.eks. «Sommersamling») valideres aldri mot
            CANON — heller ikke, det gjettes ikke feil krav. Koble navnet til en periodetype her
            for å slå på validering for den perioden.
          </p>
        </div>
        <StatusPill tone={statusTone}>{statusTekst}</StatusPill>
      </div>

      {oversikt.ukjente.length > 0 && (
        <Kort pad="18px 20px">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Icon name="triangle-alert" size={15} style={{ color: TL.warn }} />
            <span style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 16, color: TL.text }}>
              Ukjente navn
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {oversikt.ukjente.map((navn) => (
              <UkjentNavnRad key={navn} navn={navn} typer={typer} />
            ))}
          </div>
        </Kort>
      )}

      <Kort pad="18px 20px">
        <span style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 16, color: TL.text, display: "block", marginBottom: 14 }}>
          Lagrede mappinger
        </span>
        {oversikt.lagrede.length === 0 ? (
          <div style={{ textAlign: "center", padding: "16px 12px", fontFamily: TL.font.sans, fontSize: 13, color: TL.mute }}>
            Ingen egne mappinger lagt til ennå.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {oversikt.lagrede.map((rad) => (
              <LagretNavnRad key={rad.navn} navn={rad.navn} periodeTypeLabel={rad.periodeTypeLabel} />
            ))}
          </div>
        )}
      </Kort>
    </div>
  );
}

function UkjentNavnRad({ navn, typer }: { navn: string; typer: PeriodeNavnLabel[] }) {
  const router = useRouter();
  const [valgt, setValgt] = useState<PeriodeType>(typer[0]?.verdi ?? "GRUNN");
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function lagre() {
    setFeil(null);
    start(async () => {
      try {
        await leggTilPeriodeNavnMapping({ navn, periodeType: valgt });
        router.refresh();
      } catch (e) {
        setFeil(e instanceof Error ? e.message : "Kunne ikke lagre.");
      }
    });
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <span style={{ fontFamily: TL.font.mono, fontSize: 13, color: TL.text, background: TL.dock, border: `1px solid ${TL.hair}`, borderRadius: 8, padding: "6px 10px" }}>
        {navn}
      </span>
      <div style={{ width: 200 }}>
        <Velger
          options={typer.map((t) => ({ value: t.verdi, label: t.navn }))}
          value={valgt}
          onChange={(v) => setValgt(v as PeriodeType)}
        />
      </div>
      <Knapp onClick={lagre} disabled={pending}>{pending ? "Lagrer…" : "Koble til"}</Knapp>
      {feil && <span style={{ fontFamily: TL.font.mono, fontSize: 11, color: TL.danger }}>{feil}</span>}
    </div>
  );
}

function LagretNavnRad({ navn, periodeTypeLabel }: { navn: string; periodeTypeLabel: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  function slett() {
    setFeil(null);
    start(async () => {
      try {
        await slettPeriodeNavnMapping(navn);
        router.refresh();
      } catch (e) {
        setFeil(e instanceof Error ? e.message : "Kunne ikke fjerne.");
      }
    });
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontFamily: TL.font.mono, fontSize: 13, color: TL.text }}>{navn}</span>
        <span style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute }}>→ {periodeTypeLabel}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {feil && <span style={{ fontFamily: TL.font.mono, fontSize: 11, color: TL.danger }}>{feil}</span>}
        <Knapp ghost onClick={slett} disabled={pending}>{pending ? "Fjerner…" : "Fjern"}</Knapp>
      </div>
    </div>
  );
}
