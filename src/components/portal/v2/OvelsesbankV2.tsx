"use client";

/**
 * PlayerHQ Øvelsesbank — v2 (retning C «Presis»). Komponert 1:1 fra
 * ui_kits/v2/ovelsesbank.jsx → funksjonen Bank, men med EKTE data fra
 * getDrillLibraryRich (src/lib/portal-drills/drills-data.ts → ExerciseDefinition).
 *
 * Kun v2-primitiver fra "@/components/v2" (Kort, AkseChip, CTAPill, PillTabs,
 * FilterChips, Caps, Tittel, InnsiktChip, TomTilstand, Icon). De skjerm-lokale
 * komposisjonene (NivaBadge, ParamChip, ChipGruppe, HeroBilde, OvelseKort,
 * DetaljPanel, AutoTilpasning, FilterTopp) speiler mockupens egne lokale
 * subkomponenter og er bygget av v2-primitiver + T-tokens. Ingen rå hex.
 *
 * ÆRLIGHET: alt som vises kommer fra ekte kolonner. Felt som ikke finnes på
 * ExerciseDefinition (press-nivå/PR, P-posisjoner, per-spiller-anbefaling med
 * SG-begrunnelse, tekstlige mål/justeringer per nivå) er bevisst utelatt — se
 * gap-listen i retur-JSON. csTargetByKategori gir den ekte A–K-tilpasningen.
 */

import { useEffect, useState } from "react";
import type { DrillDetail } from "@/lib/portal-drills/drills-data";
import type { AkseKey } from "@/lib/v2/tokens";
import {
  T,
  Caps,
  Tittel,
  CTAPill,
  Knapp,
  Kort,
  AkseChip,
  PillTabs,
  FilterChips,
  InnsiktChip,
  TomTilstand,
  Icon,
} from "@/components/v2";

/* ── Ordbok: enum → norsk visningstekst (ærlig, ingen dikting) ───────── */

const SKILL_NB: Record<string, string> = {
  TEE_TOTAL: "Tee",
  TILNAERMING: "Tilnærming",
  AROUND_GREEN: "Nærspill",
  PUTTING: "Putting",
  SPILL: "Spill",
};
const KATEGORIER = ["Tee", "Tilnærming", "Nærspill", "Putting", "Spill"];

const LFASE_NB: Record<string, string> = {
  GRUNN: "Grunn",
  SPESIAL: "Spesial",
  TURNERING: "Turnering",
};
const LFASE_ALLE = ["GRUNN", "SPESIAL", "TURNERING"];

const METODE_NB: Record<string, string> = {
  BLOKK: "Blokk",
  VARIABEL: "Variabel",
  KONKURRANSE: "Konkurranse",
  SPILL_TEST: "Spilltest",
};
const METODE_ALLE = ["BLOKK", "VARIABEL", "KONKURRANSE", "SPILL_TEST"];

const MILJO_NB: Record<string, string> = {
  RANGE: "Range",
  BANE: "Bane",
  STUDIO: "Studio",
  HJEM: "Hjem",
  SIMULATOR: "Simulator",
  GYM: "Gym",
};

const FASILITET_NB: Record<string, string> = {
  RADAR: "Radar",
  MAT_NET: "Matte + nett",
  BUNKER: "Bunker",
  KAMERA: "Kamera",
  PUTTING_GREEN_KORT: "Putting-green kort",
  PUTTING_GREEN_LANG: "Putting-green lang",
  SHORT_GAME_AREA: "Nærspillsareal",
  DRIVING_RANGE: "Driving range",
  BANE: "Bane",
  SIMULATOR: "Simulator",
  VEKTSTANG: "Vektstang",
  TRAPBAR: "Trapbar",
  LOPEBANE: "Løpebane",
  MED_BALL: "Medisinball",
};

/** NGF-kategori-skala A–L (nivåspenn øvelsene dekker). */
const NIVAER = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

const TYPER = ["Alle", "Drill", "Øvelse", "Test", "Fysisk"];
const AKSER: AkseKey[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

/** Ikon per akse — brukt i media-fallback når øvelsen mangler bilde/video. */
const AKSE_IKON: Record<AkseKey, string> = {
  FYS: "dumbbell",
  TEK: "target",
  SLAG: "circle-dot",
  SPILL: "flag",
  TURN: "trophy",
};

/* ── Rene avledninger fra ekte felter ───────────────────────────────── */

type DrillType = "Drill" | "Øvelse" | "Test" | "Fysisk";

/** Type-etikett avledet av ekte felter (akse + øvingsmetode) — ingen dikting. */
function drillType(d: DrillDetail): DrillType {
  if (d.axis === "FYS") return "Fysisk";
  if (d.practiceType === "SPILL_TEST") return "Test";
  if (d.practiceType === "KONKURRANSE") return "Øvelse";
  return "Drill";
}

/** CS-etikett fra csMin/csMax, eller null når begge mangler. */
function csLabel(d: DrillDetail): string | null {
  if (d.csMin != null && d.csMax != null)
    return d.csMin === d.csMax ? `CS${d.csMin}` : `CS${d.csMin}–${d.csMax}`;
  if (d.csMin != null) return `CS${d.csMin}+`;
  if (d.csMax != null) return `CS≤${d.csMax}`;
  return null;
}

/** Standard dose fra sett×reps eller fritekst, ellers null. */
function doseLabel(d: DrillDetail): string | null {
  if (d.defaultSets != null && d.defaultReps != null)
    return `${d.defaultSets} × ${d.defaultReps}`;
  if (d.defaultRepsSets) return d.defaultRepsSets;
  return null;
}

/** Varighet i minutter → «1,5 t» (≥60) eller «25 min». */
function varighet(min: number | null): string | null {
  if (min == null) return null;
  if (min >= 60) return `${(min / 60).toFixed(1).replace(".", ",")} t`;
  return `${min} min`;
}

/** Nivåspenn-etikett («A–K») fra minKategori/maxKategori, ellers null. */
function nivaSpenn(d: DrillDetail): string | null {
  if (d.minKategori && d.maxKategori) return `${d.minKategori}–${d.maxKategori}`;
  if (d.minKategori) return `${d.minKategori}+`;
  if (d.maxKategori) return `–${d.maxKategori}`;
  return null;
}

/** true når nivået n ligger innenfor øvelsens spenn (min..max). */
function dekkerNiva(d: DrillDetail, n: string): boolean {
  if (!d.minKategori || !d.maxKategori) return false;
  const i = NIVAER.indexOf(n);
  return i >= NIVAER.indexOf(d.minKategori) && i <= NIVAER.indexOf(d.maxKategori);
}

/** true på klient etter mount når viewport < 768px (styrer layout + tallstørrelser). */
function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

/* ── Skjerm-lokale primitiver (speiler mockupens Bank-subkomponenter) ── */

/** Nivåspenn-badge (mono, over hero). */
function NivaBadge({ spenn }: { spenn: string }) {
  return (
    <span
      style={{
        fontFamily: T.mono,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.06em",
        color: T.fg,
        background: "rgba(13,14,13,0.72)",
        border: `1px solid ${T.borderS}`,
        borderRadius: 5,
        padding: "3px 7px",
        backdropFilter: "blur(4px)",
      }}
    >
      NIVÅ {spenn}
    </span>
  );
}

/** AK-formel-verdi som mono-chip. */
function ParamChip({ children, aktiv }: { children: React.ReactNode; aktiv?: boolean }) {
  return (
    <span
      style={{
        fontFamily: T.mono,
        fontSize: 10,
        fontWeight: 700,
        color: aktiv ? T.onLime : T.fg2,
        background: aktiv ? T.lime : T.panel2,
        border: `1px solid ${aktiv ? "transparent" : T.border}`,
        borderRadius: 6,
        padding: "4px 8px",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

/** Etikett + hjelp-ikon + chip-rad. */
function ChipGruppe({
  label,
  hjelp,
  children,
}: {
  label: string;
  hjelp?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
        <Caps size={9} style={{ display: "inline" }}>
          {label}
        </Caps>
        {hjelp && (
          <span title={hjelp} style={{ display: "inline-flex", cursor: "help" }}>
            <Icon name="help-circle" size={12} style={{ color: T.mut }} />
          </span>
        )}
      </div>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{children}</div>
    </div>
  );
}

/** Hero: ekte bilde hvis satt, ellers video-play-plassholder, ellers ikon-plassholder. */
function HeroBilde({ o, h = 118, stor }: { o: DrillDetail; h?: number; stor?: boolean }) {
  const spenn = nivaSpenn(o);
  const harMedia = !!o.imageUrl || !!o.videoUrl;
  const akseFarge = T.ax[o.axis] ?? T.mut;
  return (
    <div
      style={{
        height: h,
        background: harMedia
          ? `linear-gradient(140deg, ${T.panel3}, ${T.bg})`
          : `linear-gradient(140deg, color-mix(in srgb, ${akseFarge} 22%, transparent), color-mix(in srgb, ${akseFarge} 5%, transparent) 65%, ${T.bg})`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "none",
        overflow: "hidden",
      }}
    >
      {o.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={o.imageUrl}
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : o.videoUrl ? (
        <span
          style={{
            width: stor ? 52 : 36,
            height: stor ? 52 : 36,
            borderRadius: 9999,
            background: "rgba(209,248,67,0.14)",
            border: "1px solid rgba(209,248,67,0.35)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="play" size={stor ? 20 : 14} style={{ color: T.lime }} />
        </span>
      ) : (
        // Ingen bilde/video ennå: aksefarget flate + aksens ikon i stedet for
        // ett identisk grått plassholder-ikon for alle øvelser i banken.
        <Icon name={AKSE_IKON[o.axis]} size={stor ? 30 : 22} style={{ color: akseFarge, opacity: 0.85 }} />
      )}
      <span style={{ position: "absolute", top: 10, left: 12 }}>
        <span
          style={{
            fontFamily: T.mono,
            fontSize: 8.5,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: T.fg2,
            background: "rgba(13,14,13,0.72)",
            border: `1px solid ${T.border}`,
            borderRadius: 5,
            padding: "3px 7px",
            backdropFilter: "blur(4px)",
          }}
        >
          {drillType(o)}
        </span>
      </span>
      {spenn && (
        <span style={{ position: "absolute", top: 10, right: 12 }}>
          <NivaBadge spenn={spenn} />
        </span>
      )}
      {stor && o.videoUrl && (
        <span
          style={{
            position: "absolute",
            bottom: 10,
            right: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontFamily: T.mono,
            fontSize: 9,
            fontWeight: 700,
            color: T.fg2,
            background: "rgba(13,14,13,0.72)",
            borderRadius: 5,
            padding: "3px 7px",
          }}
        >
          <Icon name="play" size={10} />
          VIDEO
        </span>
      )}
    </div>
  );
}

/** Galleri-kort. */
function OvelseKort({ o, on, onClick }: { o: DrillDetail; on: boolean; onClick: () => void }) {
  const cs = csLabel(o);
  const dose = doseLabel(o);
  const varigh = varighet(o.durationMin);
  const undertekst =
    o.axis === "FYS"
      ? [o.muscleGroups[0], varigh].filter(Boolean).join(" · ")
      : [o.skillArea ? SKILL_NB[o.skillArea] : null, o.environment[0] ? MILJO_NB[o.environment[0]] : null, varigh]
          .filter(Boolean)
          .join(" · ");
  return (
    <Kort
      pad="0"
      hover
      style={{
        overflow: "hidden",
        borderColor: on ? `color-mix(in srgb,${T.lime} 55%,transparent)` : T.border,
        cursor: "pointer",
      }}
    >
      <div onClick={onClick}>
        <HeroBilde o={o} />
        <div style={{ padding: "12px 14px 14px" }}>
          <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14.5, color: T.fg, lineHeight: 1.2 }}>
            {o.title}
          </div>
          {undertekst && (
            <div style={{ fontFamily: T.ui, fontSize: 11, color: T.mut, marginTop: 4 }}>{undertekst}</div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 10, flexWrap: "wrap" }}>
            <AkseChip a={o.axis} />
            {o.lPhase && <ParamChip>{LFASE_NB[o.lPhase]}</ParamChip>}
            {cs && <ParamChip>{cs}</ParamChip>}
            {o.axis === "FYS" && dose && <ParamChip>{dose}</ParamChip>}
          </div>
        </div>
      </div>
    </Kort>
  );
}

/** Ekte A–K-tilpasning: CS-mål per NGF-kategori (csTargetByKategori). */
function AutoTilpasning({ o }: { o: DrillDetail }) {
  const rader = o.csTargetByKategori
    ? Object.entries(o.csTargetByKategori)
        .filter(([k]) => NIVAER.indexOf(k) !== -1)
        .sort((a, b) => NIVAER.indexOf(a[0]) - NIVAER.indexOf(b[0]))
    : [];
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <Caps size={9} style={{ display: "inline" }}>
          Automatisk A–K-tilpasning
        </Caps>
        <span
          title="Banken justerer klubbhastighets-målet etter spillerens NGF-kategori — én øvelse, riktig krav for alle."
          style={{ display: "inline-flex", cursor: "help" }}
        >
          <Icon name="help-circle" size={12} style={{ color: T.mut }} />
        </span>
      </div>
      {rader.length > 0 ? (
        <>
          {rader.map(([kat, cs], i) => (
            <div
              key={kat}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 0",
                borderBottom: i === rader.length - 1 ? "none" : `1px solid ${T.border}`,
              }}
            >
              <span
                style={{
                  width: 44,
                  flex: "none",
                  fontFamily: T.mono,
                  fontSize: 10,
                  fontWeight: 700,
                  color: T.fg2,
                  background: T.panel2,
                  border: `1px solid ${T.border}`,
                  borderRadius: 5,
                  padding: "3px 0",
                  textAlign: "center",
                }}
              >
                {kat}
              </span>
              <span style={{ flex: 1, fontFamily: T.ui, fontSize: 12, fontWeight: 500, color: T.fg2 }}>
                Kategori {kat}
              </span>
              <span
                style={{
                  fontFamily: T.mono,
                  fontSize: 11,
                  fontWeight: 700,
                  color: T.fg,
                  textAlign: "right",
                  whiteSpace: "nowrap",
                }}
              >
                CS {cs}
              </span>
            </div>
          ))}
          <div style={{ marginTop: 9 }}>
            <InnsiktChip>Klubbhastighets-målet justeres automatisk etter NGF-kategorien din.</InnsiktChip>
          </div>
        </>
      ) : (
        <p style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, lineHeight: 1.6, margin: "2px 0 0" }}>
          Ingen nivådifferensierte mål er lagt inn for denne øvelsen ennå.
        </p>
      )}
    </div>
  );
}

/** Detaljpanel (desktop: sticky høyre · mobil: fullskjerm-stabel). */
function DetaljPanel({ o, mobile, onLukk }: { o: DrillDetail; mobile?: boolean; onLukk: () => void }) {
  const cs = csLabel(o);
  const dose = doseLabel(o);
  const varigh = varighet(o.durationMin);
  const type = drillType(o);
  const metaLinje = [type, varigh, o.skillArea ? SKILL_NB[o.skillArea] : null].filter(Boolean).join(" · ");
  const spenn = nivaSpenn(o);
  return (
    <Kort pad="0" style={{ overflow: "hidden", position: mobile ? "relative" : "sticky", top: mobile ? 0 : 16 }}>
      <HeroBilde o={o} h={mobile ? 170 : 190} stor />
      <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Tittel + lukk */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
          <div>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: mobile ? 20 : 19, color: T.fg, lineHeight: 1.15 }}>
              {o.title}
            </div>
            {metaLinje && (
              <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 5 }}>{metaLinje}</div>
            )}
          </div>
          <span
            onClick={onLukk}
            style={{
              width: 26,
              height: 26,
              flex: "none",
              borderRadius: 9999,
              background: T.panel2,
              border: `1px solid ${T.border}`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Icon name={mobile ? "chevron-down" : "x"} size={13} style={{ color: T.fg2 }} />
          </span>
        </div>

        {/* Beskrivelse — ekte, eller ærlig tom */}
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: o.description ? T.fg2 : T.mut, lineHeight: 1.65, margin: 0 }}>
          {o.description ?? "Ingen beskrivelse er lagt inn for denne øvelsen ennå."}
        </p>

        {/* AK-formel-parametere som chip-grupper */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "13px 14px" }}>
          <ChipGruppe label="Akse" hjelp="Hvilken av de fem treningsaksene øvelsen teller på i AK-formelen.">
            <AkseChip a={o.axis} />
          </ChipGruppe>
          <ChipGruppe label="Fokus" hjelp="Slagområdet øvelsen hører til: Tee, Tilnærming, Nærspill, Putting eller Spill.">
            <ParamChip aktiv>{o.skillArea ? SKILL_NB[o.skillArea] : "—"}</ParamChip>
          </ChipGruppe>
          <ChipGruppe label="Miljø" hjelp="Hvor øvelsen gjennomføres — miljøet påvirker overføringsverdien.">
            {o.environment.length ? (
              o.environment.map((m) => <ParamChip key={m}>{MILJO_NB[m]}</ParamChip>)
            ) : (
              <ParamChip>—</ParamChip>
            )}
          </ChipGruppe>
          <ChipGruppe label="L-fase" hjelp="Læringsfase: Grunn, Spesial eller Turnering.">
            {LFASE_ALLE.map((x) => (
              <ParamChip key={x} aktiv={x === o.lPhase}>
                {LFASE_NB[x]}
              </ParamChip>
            ))}
          </ChipGruppe>
          <ChipGruppe label="CS-nivå" hjelp="Klubbhastighets-nivået øvelsen er kalibrert mot.">
            <ParamChip aktiv={!!cs}>{cs ?? "—"}</ParamChip>
          </ChipGruppe>
          <ChipGruppe label="Metode" hjelp="Øvingsmetode: Blokk, Variabel, Konkurranse eller Spilltest.">
            {METODE_ALLE.map((x) => (
              <ParamChip key={x} aktiv={x === o.practiceType}>
                {METODE_NB[x]}
              </ParamChip>
            ))}
          </ChipGruppe>
          {spenn && (
            <ChipGruppe label="Nivåspenn" hjelp="NGF-kategoriene (A–L) øvelsen er ment for.">
              <ParamChip aktiv>NIVÅ {spenn}</ParamChip>
            </ChipGruppe>
          )}
          {o.fasilitetKrav.length > 0 && (
            <ChipGruppe label="Fasilitet" hjelp="Utstyr/anlegg som kreves for å gjennomføre øvelsen.">
              {o.fasilitetKrav.map((f) => (
                <ParamChip key={f}>{FASILITET_NB[f] ?? f}</ParamChip>
              ))}
            </ChipGruppe>
          )}
        </div>

        {/* Fysisk-blokk: muskelgruppe · utstyr · dose */}
        {(o.axis === "FYS" || o.muscleGroups.length > 0) && (
          <div
            style={{
              background: T.panel2,
              border: `1px solid ${T.border}`,
              borderRadius: 14,
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 11,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Icon name="dumbbell" size={13} style={{ color: T.ax.FYS, flex: "none" }} />
              <Caps size={9} color={T.fg2} style={{ display: "inline" }}>
                Fysisk øvelse
              </Caps>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "11px 14px" }}>
              <ChipGruppe label="Muskelgruppe">
                {o.muscleGroups.length ? (
                  o.muscleGroups.map((m) => (
                    <ParamChip key={m} aktiv>
                      {m}
                    </ParamChip>
                  ))
                ) : (
                  <ParamChip>—</ParamChip>
                )}
              </ChipGruppe>
              <ChipGruppe label="Utstyr">
                {o.utstyr.length ? o.utstyr.map((u) => <ParamChip key={u}>{u}</ParamChip>) : <ParamChip>—</ParamChip>}
              </ChipGruppe>
            </div>
            {dose && (
              <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
                <Caps size={9}>Standard dose</Caps>
                <span style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: T.fg, lineHeight: 1 }}>
                  {dose}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Ekte A–K-tilpasning */}
        <AutoTilpasning o={o} />

        {/* Handlinger (forhåndsvisning) */}
        <div style={{ display: "flex", gap: 8 }}>
          <CTAPill icon="plus">Legg i økt</CTAPill>
          <CTAPill icon="copy" ghost>
            Dupliser
          </CTAPill>
        </div>
      </div>
    </Kort>
  );
}

/** Filter-topp: type · akse · fokus · nivå A–L · søk. */
function FilterTopp({
  mobile,
  type,
  setType,
  akser,
  toggleAkse,
  kats,
  toggleKat,
  niva,
  setNiva,
  sok,
  setSok,
}: {
  mobile?: boolean;
  type: string;
  setType: (v: string) => void;
  akser: string[];
  toggleAkse: (a: string) => void;
  kats: string[];
  toggleKat: (k: string) => void;
  niva: string | null;
  setNiva: (n: string | null) => void;
  sok: string;
  setSok: (v: string) => void;
}) {
  const sokFelt = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        height: 36,
        padding: "0 13px",
        borderRadius: 9999,
        background: T.panel2,
        border: `1px solid ${T.border}`,
        flex: mobile ? 1 : "none",
        minWidth: mobile ? 0 : 220,
      }}
    >
      <Icon name="search" size={14} style={{ color: T.mut, flex: "none" }} />
      <input
        value={sok}
        onChange={(e) => setSok(e.target.value)}
        placeholder="Søk i banken …"
        style={{
          appearance: "none",
          background: "transparent",
          border: "none",
          outline: "none",
          fontFamily: T.ui,
          fontSize: 12.5,
          color: T.fg,
          width: "100%",
        }}
      />
    </div>
  );
  if (mobile)
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sokFelt}
        <PillTabs tabs={TYPER.map((t) => ({ id: t, l: t }))} value={type} onChange={setType} />
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
          <FilterChips items={AKSER} active={akser} onToggle={toggleAkse} axis />
        </div>
      </div>
    );
  return (
    <Kort pad="14px 18px">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <PillTabs tabs={TYPER.map((t) => ({ id: t, l: t }))} value={type} onChange={setType} />
        {sokFelt}
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 22, marginTop: 13, flexWrap: "wrap" }}>
        <div>
          <Caps size={9} style={{ marginBottom: 7 }}>
            Akse
          </Caps>
          <FilterChips items={AKSER} active={akser} onToggle={toggleAkse} axis />
        </div>
        <div>
          <Caps size={9} style={{ marginBottom: 7 }}>
            Fokus
          </Caps>
          <FilterChips items={KATEGORIER} active={kats} onToggle={toggleKat} />
        </div>
        <div>
          <Caps size={9} style={{ marginBottom: 7 }}>
            Nivå A–L
          </Caps>
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            {NIVAER.map((n) => {
              const on = niva === n;
              return (
                <button
                  key={n}
                  onClick={() => setNiva(on ? null : n)}
                  className="v2-press v2-focus"
                  style={{
                    appearance: "none",
                    cursor: "pointer",
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    background: on ? T.lime : T.panel2,
                    border: `1px solid ${on ? "transparent" : T.border}`,
                    color: on ? T.onLime : T.fg2,
                    fontFamily: T.mono,
                    fontSize: 10.5,
                    fontWeight: 700,
                  }}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Kort>
  );
}

/* ── Skjerm ──────────────────────────────────────────────────────────── */

/** Kort per side i «Vis flere»-paginering. */
const SIDE_STORRELSE = 48;

export function OvelsesbankV2({ data }: { data: DrillDetail[] }) {
  const mobile = useMobile();
  const [type, setType] = useState("Alle");
  const [akser, setAkser] = useState<string[]>([]);
  const [kats, setKats] = useState<string[]>([]);
  const [niva, setNiva] = useState<string | null>(null);
  const [sok, setSok] = useState("");
  const [valgt, setValgt] = useState<string | null>(null);
  const [visAntall, setVisAntall] = useState(SIDE_STORRELSE);

  const toggleAkse = (a: string) =>
    setAkser((p) => (p.indexOf(a) !== -1 ? p.filter((x) => x !== a) : [...p, a]));
  const toggleKat = (k: string) =>
    setKats((p) => (p.indexOf(k) !== -1 ? p.filter((x) => x !== k) : [...p, k]));

  // Fokus-filteret sammenligner mot norsk skillArea-etikett (Tee/Nærspill/…).
  const treff = data.filter(
    (o) =>
      (type === "Alle" || drillType(o) === type) &&
      (akser.length === 0 || akser.indexOf(o.axis) !== -1) &&
      (kats.length === 0 || (o.skillArea != null && kats.indexOf(SKILL_NB[o.skillArea]) !== -1)) &&
      (!niva || dekkerNiva(o, niva)) &&
      (!sok || o.title.toLowerCase().indexOf(sok.toLowerCase()) !== -1),
  );

  // Filtrering nullstiller paginering til første side — render-tid synk
  // (Reacts anbefalte mønster, samme teknikk som synketVinduId i BookingV2),
  // ikke useEffect.
  const filterNokkel = `${type}|${akser.join(",")}|${kats.join(",")}|${niva}|${sok}`;
  const [synketFilterNokkel, setSynketFilterNokkel] = useState(filterNokkel);
  if (filterNokkel !== synketFilterNokkel) {
    setSynketFilterNokkel(filterNokkel);
    setVisAntall(SIDE_STORRELSE);
  }

  const synligeTreff = treff.slice(0, visAntall);
  const flereSkjult = treff.length > visAntall;

  // Velg første treff automatisk på desktop (ikke på mobil — der er lista primær).
  const gjeldendeValgt = valgt ?? (!mobile && treff.length > 0 ? treff[0].id : null);
  const valgtO = data.find((o) => o.id === gjeldendeValgt) ?? null;

  const tomBank = data.length === 0;

  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
      <div>
        <Caps>
          Bibliotek · {data.length} {data.length === 1 ? "øvelse" : "øvelser"}
        </Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel mobile={mobile} em="øvelsesbank">
            Din
          </Tittel>
        </div>
      </div>
      {!mobile && (
        <CTAPill icon="plus" ghost>
          Ny øvelse
        </CTAPill>
      )}
    </div>
  );

  const grid = (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: mobile ? "1fr" : "repeat(auto-fill, minmax(228px, 1fr))",
          gap: T.gap,
        }}
      >
        {synligeTreff.map((o) => (
          <OvelseKort key={o.id} o={o} on={gjeldendeValgt === o.id} onClick={() => setValgt(o.id)} />
        ))}
        {treff.length === 0 && (
          <div style={{ gridColumn: "1 / -1" }}>
            <Kort>
              {tomBank ? (
                <TomTilstand
                  icon="book-open"
                  title="Ingen øvelser ennå"
                  sub="Øvelsesbanken er tom. Coachen din legger inn øvelser, eller du kan lage dine egne."
                />
              ) : (
                <TomTilstand
                  icon="search"
                  title="Ingen treff"
                  sub="Ingen øvelser matcher filtrene — juster type, akse eller nivå."
                />
              )}
            </Kort>
          </div>
        )}
      </div>
      {flereSkjult && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Knapp icon="chevron-down" ghost onClick={() => setVisAntall((v) => v + SIDE_STORRELSE)}>
            Vis flere ({treff.length - visAntall} til)
          </Knapp>
        </div>
      )}
    </div>
  );

  // MOBIL: liste → detalj som fullskjerm-stabel
  if (mobile)
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {valgtO ? (
          <>
            <div
              onClick={() => setValgt(null)}
              style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}
            >
              <Icon name="chevron-left" size={15} style={{ color: T.fg2 }} />
              <span style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg2 }}>
                Tilbake til banken
              </span>
            </div>
            <DetaljPanel o={valgtO} mobile onLukk={() => setValgt(null)} />
          </>
        ) : (
          <>
            {hode}
            <FilterTopp
              mobile
              type={type}
              setType={setType}
              akser={akser}
              toggleAkse={toggleAkse}
              kats={kats}
              toggleKat={toggleKat}
              niva={niva}
              setNiva={setNiva}
              sok={sok}
              setSok={setSok}
            />
            {grid}
          </>
        )}
      </div>
    );

  // DESKTOP: filter-topp → galleri + detaljpanel til høyre
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      <FilterTopp
        type={type}
        setType={setType}
        akser={akser}
        toggleAkse={toggleAkse}
        kats={kats}
        toggleKat={toggleKat}
        niva={niva}
        setNiva={setNiva}
        sok={sok}
        setSok={setSok}
      />
      <div
        style={{ display: "grid", gridTemplateColumns: valgtO ? "1fr 400px" : "1fr", gap: T.gap, alignItems: "start" }}
      >
        {grid}
        {valgtO && <DetaljPanel o={valgtO} onLukk={() => setValgt(null)} />}
      </div>
    </div>
  );
}
