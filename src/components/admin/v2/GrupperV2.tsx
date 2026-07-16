"use client";

/**
 * AgencyOS Grupper — v2 (retning C «Presis»). 1:1 med mockup-fasit
 * ui_kits/v2/agencyos.jsx → Grupper + GruppeDetalj + EgentreningVindu, men
 * drevet av EKTE gruppedata (Prisma: Group + GroupMember + GroupSchedule).
 * Bygget utelukkende av v2-komponentbiblioteket (src/components/v2) — ingen
 * ad-hoc UI, ingen rå hex (kun T.*).
 *
 * Desktop: hode → grid 2fr/3fr (gruppeliste | valgt gruppes detalj).
 * Mobil (stack): hode → liste → detalj.
 *
 * Ærlighet: mockupens «gruppeøkt-mal» (blokk-for-blokk oppvarming/stasjoner/
 * avslutning) og egentrening-vinduets per-spiller-planer finnes IKKE i
 * datamodellen. I stedet vises de reelle faste treningstidene, og egentrening-
 * vinduet får en ærlig tom-tilstand. Se gaps i retur-JSON.
 */

import Link from "next/link";
import { useState } from "react";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  StatusPill,
  CTAPill,
  Knapp,
  MikroMeta,
  TomTilstand,
  Icon,
} from "@/components/v2";
import { T } from "@/lib/v2/tokens";
import { OpprettGruppeModal, type CoachValg } from "@/app/admin/grupper/opprett-gruppe-modal";

export interface FastTid {
  id: string;
  dag: string; // «Ons»
  tid: string; // «08:00–10:00»
  tittel: string;
  sted: string | null;
}
export interface GruppeV2 {
  id: string;
  navn: string;
  antallMedlemmer: number;
  /** «Ons 08:00 · WANG Fredrikstad» — null når ingen treningstid er satt. */
  nesteOkt: string | null;
  faste: FastTid[];
}
export interface GrupperData {
  grupper: GruppeV2[];
  coaches: CoachValg[];
}

const spillere = (n: number) => `${n} ${n === 1 ? "spiller" : "spillere"}`;
const grupperOrd = (n: number) => `${n} ${n === 1 ? "gruppe" : "grupper"}`;

export function GrupperV2({ data }: { data: GrupperData }) {
  const { grupper, coaches } = data;
  const [valgtId, setValgtId] = useState<string | null>(grupper[0]?.id ?? null);
  const [opprettApen, setOpprettApen] = useState(false);
  const valgt = grupper.find((g) => g.id === valgtId) ?? null;
  const totalMedlemmer = grupper.reduce((s, g) => s + g.antallMedlemmer, 0);

  // ── Hode ────────────────────────────────────────────────────────
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>{grupperOrd(grupper.length)} · {spillere(totalMedlemmer)}</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel>Grupper</Tittel>
        </div>
      </div>
      <div className="hidden md:block">
        <Knapp ghost icon="plus" onClick={() => setOpprettApen(true)}>
          Ny gruppe
        </Knapp>
      </div>
    </div>
  );

  // ── Gruppeliste ─────────────────────────────────────────────────
  const liste = (
    <Kort eyebrow="Alle grupper">
      {grupper.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start" }}>
          <TomTilstand
            icon="users"
            title="Ingen grupper ennå"
            sub="Opprett den første gruppen for å samle spillere på tvers av klubbene dine."
          />
          <Knapp icon="plus" onClick={() => setOpprettApen(true)}>Opprett gruppe</Knapp>
        </div>
      ) : (
        grupper.map((g, i) => {
          const on = g.id === valgtId;
          return (
            <Rad
              key={g.id}
              onClick={() => setValgtId(g.id)}
              leading={
                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9999,
                    background: on ? T.panel3 : T.panel2,
                    border: `1px solid ${on ? T.borderS : T.border}`,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "none",
                  }}
                >
                  <Icon name="users" size={14} style={{ color: on ? T.fg : T.fg2 }} />
                </span>
              }
              title={g.navn}
              sub={g.nesteOkt ? `Neste økt: ${g.nesteOkt}` : "Ingen treningstid satt"}
              meta={
                <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.fg2, fontVariantNumeric: "tabular-nums" }}>
                  {g.antallMedlemmer}
                  <span style={{ color: T.mut, fontWeight: 400 }}> spillere</span>
                </span>
              }
              last={i === grupper.length - 1}
            />
          );
        })
      )}
    </Kort>
  );

  // ── Valgt gruppes detalj ────────────────────────────────────────
  const primaer = valgt?.faste[0] ?? null;
  const detalj = valgt ? (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <Kort tint eyebrow={valgt.navn} action={<StatusPill tone="up">{spillere(valgt.antallMedlemmer)}</StatusPill>}>
        {primaer ? (
          <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 20, color: T.fg }}>
            {primaer.dag} {primaer.tid}{primaer.sted ? ` · ${primaer.sted}` : ""}
          </div>
        ) : (
          <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 20, color: T.fg2 }}>
            Ingen fast treningstid satt
          </div>
        )}
        {(primaer || valgt.antallMedlemmer > 0) && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
            {primaer && <MikroMeta icon="repeat">Gjentas hver {primaer.dag.toLowerCase()}.</MikroMeta>}
            {primaer?.sted && <MikroMeta icon="map-pin">{primaer.sted}</MikroMeta>}
            <MikroMeta icon="users">{spillere(valgt.antallMedlemmer)}</MikroMeta>
          </div>
        )}
        {/* I8-funn: gruppe-detaljsiden (timeplan + mal-utrulling) var unåbar herfra. */}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <Link href={`/admin/grupper/${valgt.id}`} style={{ textDecoration: "none" }}>
            <CTAPill icon="arrow-right">Åpne gruppe</CTAPill>
          </Link>
          <Link href={`/admin/grupper/${valgt.id}/timeplan`} style={{ textDecoration: "none" }}>
            <CTAPill ghost icon="calendar">Timeplan</CTAPill>
          </Link>
        </div>
      </Kort>

      <Kort
        eyebrow="Faste treningstider"
        action={valgt.faste.length > 0 ? <Caps size={9}>{valgt.faste.length} {valgt.faste.length === 1 ? "tid" : "tider"}</Caps> : undefined}
      >
        {valgt.faste.length === 0 ? (
          <TomTilstand
            icon="calendar"
            title="Ingen treningstider"
            sub="Legg til faste treningstider for gruppen i timeplanen."
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {valgt.faste.map((f) => (
              <div
                key={f.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  background: T.panel2,
                  border: `1px solid ${T.border}`,
                  borderRadius: T.rRow,
                  padding: "10px 12px",
                }}
              >
                <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.fg2, width: 34, flex: "none", fontVariantNumeric: "tabular-nums" }}>
                  {f.dag}
                </span>
                <span style={{ flex: 1, minWidth: 0, fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {f.tittel}
                </span>
                {f.sted && <MikroMeta icon="map-pin">{f.sted}</MikroMeta>}
                <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, flex: "none", fontVariantNumeric: "tabular-nums" }}>
                  {f.tid}
                </span>
              </div>
            ))}
          </div>
        )}
      </Kort>

      <Kort eyebrow="Egentrening-vindu">
        <TomTilstand
          icon="clock"
          title="Ikke tatt i bruk ennå"
          sub="Egentrening-vinduet lar spillerne planlegge egen økt innenfor gruppeøkta, mens du ser planene og kan anbefale justeringer. Ingen slike vinduer er registrert på denne gruppen ennå."
        />
      </Kort>
    </div>
  ) : null;

  // ── Layout ──────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      <div className="grid grid-cols-1 lg:[grid-template-columns:2fr_3fr]" style={{ gap: T.gap, alignItems: "start" }}>
        {liste}
        {detalj}
      </div>
      {opprettApen && (
        <OpprettGruppeModal coaches={coaches} onClose={() => setOpprettApen(false)} />
      )}
    </div>
  );
}
