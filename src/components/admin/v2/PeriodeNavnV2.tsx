"use client";
import { CoachLabel as Caps } from "@/components/admin/precision/agency-completion/CoachLabel";
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
import { Tittel, Kort, Knapp, Icon } from "@/components/v2";
import { StatusPille } from "@/components/precision/pa";
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
            Koble egne periodenavn til riktig periodetype. Da kan planens krav kontrolleres etter CANON. Navn som ikke er koblet, får ingen gjettede krav.
          </p>
        </div>
        <StatusPille tone={oversikt.ukjente.length > 0 ? "warn" : "neutral"}>{statusTekst}</StatusPille>
      </div>

      {oversikt.ukjente.length > 0 && (
        <Kort pad="18px 20px">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Icon name="triangle-alert" size={15} style={{ color: TL.text }} />
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
          Lagrede navnkoblinger
        </span>
        {oversikt.lagrede.length === 0 ? (
          <div style={{ textAlign: "center", padding: "16px 12px", fontFamily: TL.font.sans, fontSize: 13, color: TL.mute }}>
            Ingen egne navnkoblinger er lagt til ennå.
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
      <span style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.text, background: TL.dock, border: `1px solid ${TL.hair}`, borderRadius: 8, padding: "6px 10px" }}>
        {navn}
      </span>
      <div style={{ width: 200 }}>
        <label className="pa-field"><span className="pa-field__label">Periodetype</span>
          <select className="pa-control" style={{ padding: "0 12px", width: "100%" }} value={valgt} disabled={pending} onChange={e => setValgt(e.target.value as PeriodeType)}>
            {typer.map(t => <option key={t.verdi} value={t.verdi}>{t.navn}</option>)}
          </select>
        </label>
      </div>
      <Knapp onClick={lagre} disabled={pending}>{pending ? "Lagrer…" : "Koble til"}</Knapp>
      {feil && <span role="alert" style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.text }}>{feil}</span>}
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
        <span style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.text }}>{navn}</span>
        <span style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute }}>→ {periodeTypeLabel}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {feil && <span role="alert" style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.text }}>{feil}</span>}
        <Knapp ghost onClick={slett} disabled={pending}>{pending ? "Fjerner…" : "Fjern"}</Knapp>
      </div>
    </div>
  );
}
