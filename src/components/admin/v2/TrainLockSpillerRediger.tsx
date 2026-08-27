"use client";

import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import { ToppbarHoyde } from "@/components/v2/toppbar-hoyde";
import { TrainLockSlettSpillerKnapp } from "./TrainLockSlettSpillerKnapp";
import { TrainLockValgtCoachSelect, type CoachValg } from "./TrainLockValgtCoachSelect";
import { lagreSpiller } from "@/app/admin/(legacy)/spillere/[id]/rediger/actions";

/**
 * AgencyOS — Rediger spiller, Train-lock (T4, 27.08.2026).
 *
 * Ingen egen fasit tegnet for dette skjemaet i designsystem/train-lock/
 * (verifisert mot SCREEN-INDEX.md). Portet mekanisk fra rene TL-tokens +
 * feltmønstrene i TrainLockStall.tsx (dock-bakgrunn, radius.field, elev-
 * kort), samme presedens som lys-avledningen i beslutninger.md §A4/§T-S5.
 * Erstatter AdminSpillerRedigerV2 (T.*-tokens). 2-kol skjema med sticky
 * lagre-bar topp + bunn, endrings-historikk høyre — struktur og server
 * action (lagreSpiller) uendret, kun visningslaget byttet.
 */

export interface RedigerForelder {
  id: string;
  navn: string;
  relasjon: string;
}
export interface RedigerHistorikk {
  id: string;
  datoLabel: string;
  handling: string;
  aktorNavn: string | null;
}
export interface TrainLockSpillerRedigerData {
  spillerId: string;
  spillerNavn: string;
  fornavn: string;
  etternavn: string;
  fodselsdatoYmd: string;
  telefon: string;
  epost: string;
  hjemmeklubb: string;
  skole: string;
  klassetrinn: string;
  hcpInput: string;
  ambisjon: string;
  valgtCoachId: string | null;
  coacher: CoachValg[];
  foreldre: RedigerForelder[];
  historikk: RedigerHistorikk[];
}

function CapsLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: TL.vekt.caps,
        letterSpacing: TL.track.capsSm,
        textTransform: "uppercase",
        color: TL.mute,
      }}
    >
      {children}
    </span>
  );
}

function feltStil(): React.CSSProperties {
  return {
    display: "block",
    width: "100%",
    height: 44,
    marginTop: 6,
    borderRadius: TL.radius.field,
    border: "none",
    background: TL.dock,
    padding: "0 14px",
    fontSize: 15,
    color: TL.text,
    outline: "none",
    boxSizing: "border-box",
  };
}

function Felt({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  hint,
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label style={{ display: "block" }}>
      <CapsLabel>
        {label}
        {required && <span style={{ color: TL.warn }}> *</span>}
      </CapsLabel>
      <input type={type} name={name} defaultValue={defaultValue} required={required} style={feltStil()} />
      {hint && <span style={{ display: "block", marginTop: 4, fontSize: 12, color: TL.mute }}>{hint}</span>}
    </label>
  );
}

function SelectFelt({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label style={{ display: "block" }}>
      <CapsLabel>{label}</CapsLabel>
      <select name={name} defaultValue={defaultValue} style={{ ...feltStil(), appearance: "none" }}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function FeltOmraade({ label, name, defaultValue, hint }: { label: string; name: string; defaultValue: string; hint?: string }) {
  return (
    <label style={{ display: "block" }}>
      <CapsLabel>{label}</CapsLabel>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={4}
        style={{ ...feltStil(), height: "auto", padding: "12px 14px", resize: "vertical", lineHeight: 1.5 }}
      />
      {hint && <span style={{ display: "block", marginTop: 4, fontSize: 12, color: TL.mute }}>{hint}</span>}
    </label>
  );
}

/** Lagre-knapp utenfor <form>-taggen (sticky bars) — form-attributt kobler den til skjemaet. */
function LagreKnapp({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      form="rediger-form"
      style={{
        appearance: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontSize: 14,
        fontWeight: 700,
        color: TL.onFill,
        background: TL.fill,
        border: "none",
        borderRadius: TL.radius.pill,
        height: 44,
        padding: "0 20px",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function GhostKnapp({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        height: 44,
        padding: "0 20px",
        borderRadius: TL.radius.pill,
        border: `1px solid ${TL.hair}`,
        color: TL.mute,
        fontSize: 14,
        fontWeight: 600,
        textDecoration: "none",
      }}
    >
      {children}
    </Link>
  );
}

function Kort({ children }: { children: React.ReactNode }) {
  return <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: 20 }}>{children}</div>;
}

function TomTilstand({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ padding: "20px 4px", textAlign: "center" }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: TL.text }}>{title}</div>
      <div style={{ marginTop: 6, fontSize: 12.5, color: TL.mute, lineHeight: 1.45 }}>{sub}</div>
    </div>
  );
}

export function TrainLockSpillerRediger({ data }: { data: TrainLockSpillerRedigerData }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 960, margin: "0 auto", width: "100%" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: TL.scene, padding: "10px 0" }}>
        <ToppbarHoyde />
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <Link
              href={`/admin/spillere/${data.spillerId}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}
            >
              <Icon name="arrow-left" size={12} style={{ color: TL.mute }} />
              <CapsLabel>{data.spillerNavn} · Rediger</CapsLabel>
            </Link>
            <h1 style={{ margin: "6px 0 0", fontWeight: 700, fontSize: 24, letterSpacing: "-0.01em", color: TL.text }}>Rediger spiller</h1>
            <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: TL.mute }}>
                {data.foreldre.length > 0
                  ? `${data.foreldre.length} foresatt${data.foreldre.length === 1 ? "" : "e"}`
                  : "Ingen foresatte"}
              </span>
              <span style={{ fontSize: 12, color: TL.mute }}>·</span>
              <span style={{ fontSize: 12, color: TL.mute }}>
                {data.historikk.length > 0
                  ? `${data.historikk.length} endring${data.historikk.length === 1 ? "" : "er"} logget`
                  : "Ingen endringer ennå"}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <GhostKnapp href={`/admin/spillere/${data.spillerId}`}>Avbryt</GhostKnapp>
            <LagreKnapp>Lagre</LagreKnapp>
          </div>
        </div>
      </div>

      <form id="rediger-form" action={lagreSpiller} style={{ gap: 18, alignItems: "start" }} className="grid grid-cols-1 lg:grid-cols-[3fr_2fr]">
        <input type="hidden" name="id" value={data.spillerId} />

        <div className="min-w-0" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Kort>
            <CapsLabel>Personalia</CapsLabel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginTop: 14 }}>
              <Felt label="Fornavn" name="fornavn" defaultValue={data.fornavn} required />
              <Felt label="Etternavn" name="etternavn" defaultValue={data.etternavn} />
              <Felt label="Fødselsdato" name="fodselsdato" type="date" defaultValue={data.fodselsdatoYmd} />
              <Felt label="Telefon" name="telefon" defaultValue={data.telefon} />
              <Felt label="E-post" name="email" type="email" defaultValue={data.epost} required />
              <Felt label="Hjemmeklubb" name="hjemmeklubb" defaultValue={data.hjemmeklubb} />
              <Felt label="Skole / VGS" name="skole" defaultValue={data.skole} />
              <SelectFelt
                label="Klassetrinn"
                name="klassetrinn"
                defaultValue={data.klassetrinn}
                options={[
                  { value: "", label: "Ikke satt" },
                  { value: "VG1", label: "VG1" },
                  { value: "VG2", label: "VG2" },
                  { value: "VG3", label: "VG3" },
                ]}
              />
              <Felt label="HCP" name="hcp" defaultValue={data.hcpInput} hint="Bruk komma · f.eks 4,8 eller +0,5" />
            </div>
          </Kort>

          <Kort>
            <CapsLabel>Coaching</CapsLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
              <TrainLockValgtCoachSelect spillerId={data.spillerId} valgtCoachId={data.valgtCoachId} coacher={data.coacher} />
              <Felt label="Ambisjon" name="ambisjon" defaultValue={data.ambisjon} hint="Hva spilleren jobber mot — vises i hero" />
              <FeltOmraade label="Interne notater" name="notater" defaultValue="" hint="Kun coach ser dette" />
            </div>
          </Kort>

          <Kort>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
              <CapsLabel>Foresatte</CapsLabel>
              <span style={{ fontFamily: TL.font.mono, fontSize: 11, color: TL.mute }}>{data.foreldre.length}</span>
            </div>
            {data.foreldre.length === 0 ? (
              <TomTilstand title="Ingen foresatte registrert" sub="Legg til foresatte fra spillerens profil når det trengs." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.foreldre.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      borderRadius: TL.radius.row,
                      background: TL.dock,
                      padding: 14,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: TL.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.navn}
                      </div>
                      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: TL.track.capsSm, color: TL.mute }}>{p.relasjon}</div>
                    </div>
                    <Link href={`/admin/spillere/${data.spillerId}/profil`} style={{ fontSize: 12, fontWeight: 600, color: TL.text, textDecoration: "none" }}>
                      Rediger →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Kort>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 18 }} className="min-w-0 lg:sticky lg:top-32 lg:self-start">
          <Kort>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
              <CapsLabel>Endrings-historikk</CapsLabel>
              <span style={{ fontFamily: TL.font.mono, fontSize: 11, color: TL.mute }}>{data.historikk.length}</span>
            </div>
            {data.historikk.length === 0 ? (
              <TomTilstand title="Ingen endringer ennå" sub="Endringer du lagrer vises her." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.historikk.map((h) => (
                  <div key={h.id} style={{ borderLeft: `2px solid ${TL.hair}`, paddingLeft: 14 }}>
                    <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: TL.track.capsSm, color: TL.mute }}>{h.datoLabel}</div>
                    <div style={{ marginTop: 2, fontSize: 13, color: TL.text }}>{h.handling}</div>
                    {h.aktorNavn && <div style={{ marginTop: 2, fontSize: 11, color: TL.mute }}>av {h.aktorNavn}</div>}
                  </div>
                ))}
              </div>
            )}
          </Kort>
        </aside>
      </form>

      <div style={{ position: "sticky", bottom: 0, zIndex: 20, background: TL.scene, padding: "10px 0" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <TrainLockSlettSpillerKnapp spillerId={data.spillerId} spillerNavn={data.spillerNavn} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <GhostKnapp href={`/admin/spillere/${data.spillerId}`}>Avbryt</GhostKnapp>
            <LagreKnapp>Lagre endringer</LagreKnapp>
          </div>
        </div>
      </div>
    </div>
  );
}
