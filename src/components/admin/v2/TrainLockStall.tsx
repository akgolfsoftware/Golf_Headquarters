"use client";

/**
 * AgencyOS Stall — Train-lock (T4, 26.08.2026).
 *
 * Fasit: `AG-04 Stall.dc.html` (mobil), `AG-16 iPad Stall split.dc.html`
 * (iPad/desktop skinne 380 + detalj), `B5 Lys Agency.dc.html` (lys-variant —
 * ingen egne literal-farger her, TL.* løser lys/mørk via CSS-variablene).
 *
 * Tokens: KUN TL (src/lib/v2/train-lock.ts) — se CLAUDE.md invariant 2.
 * Erstatter `StallV2` (Paper T.*-tokens) på denne ruten. Datakontrakten
 * (`StallV2Data`/`StallV2Player`, definert i StallV2.tsx) og all
 * forretningslogikk (filtre, søk, sortering «trenger deg» øverst, bolk-
 * gruppering, KPI-tall, «venter på innlogging»-seksjon) er UENDRET —
 * kun visningslaget er byttet.
 *
 * Avvik fra fasiten (dokumentert, se docs/natt/T4-DONE.md):
 * - AG-04/AG-16 viser en flat liste; koden beholder Paper-fasitens tre
 *   bolker (Trenger deg nå / Følger planen / Hviler) fordi det er
 *   eksisterende, forklart forretningslogikk — CLAUDE.md ber om porting av
 *   oppførsel/hierarki, ikke fjerning av funksjonalitet.
 * - Status vises som caps mute-tekst (aldri fargeprikk/SevChip), i tråd med
 *   AG-04s mono-caption «flagg som caps, ikke fargeprikk».
 * - Negativ SG bruker opacity 0.45 på samme tekstfarge, aldri rødt
 *   (DESIGN-SYSTEM §1 forbudt-liste).
 * - Detaljpanelet (desktop) gjenbruker eksisterende data (SG-trend,
 *   akse-etterlevelse) fremfor fasitens uke-prikk-kalender og
 *   SG-per-kategori-søylediagram, som krever nye datafelt appen ikke har i
 *   dag (ukentlig oppmøte, SG-nedbrutt-på-uke). Strukturen (avatar+navn,
 *   «I dag»-rad, CTA) er portet; de to bento-visualiseringene er erstattet
 *   av eksisterende akse-rader inntil datalaget utvides.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { TL } from "@/lib/v2/train-lock";
import type { StallV2Data, StallV2Player } from "./StallV2";

const PRESS =
  "motion-safe:transition-transform motion-safe:duration-[180ms] motion-safe:ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]";

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

function CapsLabel({ children, size = 11 }: { children: React.ReactNode; size?: number }) {
  return (
    <span
      style={{
        fontSize: size,
        fontWeight: TL.vekt.caps,
        letterSpacing: TL.track.capsSm,
        textTransform: "uppercase",
        color: TL.mute,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function Avatar({ navn, size = 36 }: { navn: string; size?: number }) {
  const initialer = navn
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: TL.avatar,
        color: TL.onAvatar,
        fontSize: size >= 44 ? 15 : 12,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {initialer}
    </div>
  );
}

/** SG-verdi: tabular-nums, negativ = samme tekstfarge · opacity 0.45 (aldri rødt). */
function SgVerdi({ verdi, size = 13 }: { verdi: string; size?: number }) {
  const negativ = verdi.startsWith("−") || verdi.startsWith("-");
  return (
    <span
      style={{
        fontFamily: TL.font.mono,
        fontSize: size,
        fontWeight: 600,
        color: TL.text,
        opacity: negativ ? 0.45 : 1,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {verdi}
    </span>
  );
}

/** Radens ene varsel-prikk (15.11): fylt = trenger deg, åpen ring = følg med,
 *  ingen = på planen. Tom span bevarer justeringen (canvas-fasiten). */
function VarselPrikk({ prikk }: { prikk: StallV2Player["prikk"] }) {
  const felles: React.CSSProperties = { width: 8, height: 8, borderRadius: 999, flexShrink: 0 };
  if (prikk === "fylt") return <span aria-label="Trenger deg" style={{ ...felles, background: TL.text }} />;
  if (prikk === "aapen")
    return <span aria-label="Følg med" style={{ ...felles, boxShadow: `inset 0 0 0 1px ${TL.text}` }} />;
  return <span aria-hidden style={felles} />;
}

/** Rad — fire ting: navn, neste økt, siste aktivitet, én prikk (MASTERPLAN
 *  15.11, beslutning 6.5). SG-form, hcp, etterlevelse, pakke og skyldig er
 *  lese-informasjon og bor i spillerkortet (SpillerDetalj + /admin/spillere/[id]). */
function SpillerRad({
  s,
  onClick,
  valgt,
}: {
  s: StallV2Player;
  onClick: () => void;
  valgt: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={PRESS}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        borderRadius: TL.radius.row,
        background: valgt ? TL.dock : "transparent",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <Avatar navn={s.navn} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: TL.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {s.navn}
        </div>
        <div
          style={{
            marginTop: 2,
            fontSize: 13,
            fontWeight: 400,
            color: TL.mute,
            fontVariantNumeric: "tabular-nums",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {s.nesteOktLabel}
        </div>
      </div>
      <span
        style={{
          flexShrink: 0,
          fontFamily: TL.font.mono,
          fontSize: 12.5,
          color: TL.mute,
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap",
        }}
      >
        {s.sisteAktivitetLabel}
      </span>
      <VarselPrikk prikk={s.prikk} />
    </button>
  );
}

/** Fasitens tre bolker (agencyos-spillere.html §GRUPPER) — uendret ordlyd. */
const BOLKER = [
  { k: "trenger", n: "Trenger deg nå", note: "Noe venter på deg, eller spilleren har vært stille for lenge." },
  { k: "planen", n: "Følger planen", note: "Logger som avtalt. Ingen handling nødvendig." },
  { k: "hviler", n: "Hviler", note: "Planlagt pause eller retur-til-spill. Teller ikke som stille." },
] as const;

type FilterKey = "alle" | "akademi" | "wang" | "gfgk" | "stille";
const FILTRE: { k: FilterKey; n: string; f: (s: StallV2Player) => boolean }[] = [
  { k: "alle", n: "Alle", f: () => true },
  { k: "akademi", n: "AK Golf Academy", f: (s) => s.gruppe === "AK Golf Academy" },
  { k: "wang", n: "WANG Toppidrett", f: (s) => s.gruppe === "WANG Toppidrett" },
  { k: "gfgk", n: "GFGK Junior", f: (s) => s.gruppe === "GFGK Junior" },
  {
    k: "stille",
    n: "Stille over 7 dager",
    f: (s) => s.dagerSiden != null && s.dagerSiden >= 7 && s.bolk !== "hviler",
  },
];

const SEV_RANG: Record<StallV2Player["sev"], number> = { sterk: 0, medium: 1, lav: 2, ok: 3 };

function FilterChip({
  navn,
  antall,
  aktiv,
  onClick,
}: {
  navn: string;
  antall: number;
  aktiv: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={aktiv}
      className={PRESS}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        minHeight: 44,
        padding: "0 14px",
        borderRadius: TL.radius.pill,
        whiteSpace: "nowrap",
        cursor: "pointer",
        fontSize: 12.5,
        border: "none",
        background: aktiv ? TL.fill : TL.dock,
        color: aktiv ? TL.onFill : TL.text,
      }}
    >
      {navn}
      <span style={{ fontFamily: TL.font.mono, fontSize: 11, opacity: 0.7, fontVariantNumeric: "tabular-nums" }}>{antall}</span>
    </button>
  );
}

function SokFelt({ verdi, onEndre }: { verdi: string; onEndre: (v: string) => void }) {
  return (
    <div
      style={{
        height: 48,
        borderRadius: TL.radius.field,
        background: TL.dock,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 16px",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{ color: TL.mute }}>
        <circle cx="11" cy="11" r="6.5" />
        <path d="M16 16 L21 21" />
      </svg>
      <input
        type="search"
        value={verdi}
        onChange={(e) => onEndre(e.target.value)}
        placeholder="Søk i stallen"
        autoComplete="off"
        aria-label="Søk etter spiller"
        style={{
          flex: 1,
          minWidth: 0,
          appearance: "none",
          background: "transparent",
          border: "none",
          outline: "none",
          fontSize: 15,
          color: TL.text,
        }}
      />
    </div>
  );
}

function Tomtilstand({ tittel, sub }: { tittel: string; sub: string }) {
  return (
    <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: "28px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: TL.text }}>{tittel}</div>
      <div style={{ marginTop: 6, fontSize: 13, color: TL.mute, lineHeight: 1.45 }}>{sub}</div>
    </div>
  );
}

/** Detaljpanel (desktop AG-16 / mobil-ark) — se filhode for dokumenterte avvik. */
function SpillerDetalj({ s }: { s: StallV2Player }) {
  return (
    <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Avatar navn={s.navn} size={44} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>{s.navn}</div>
          <div style={{ marginTop: 2, fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
            HCP {s.hcp} · SG <SgVerdi verdi={s.sg} size={13} /> · {s.gruppe}
            {" · "}
            {s.pakke}
            {!s.pakkeAktiv && s.pakke !== "Drop-in" && " (inaktiv)"}
            {s.skylder && <span style={{ color: TL.warn }}> · skylder</span>}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <CapsLabel>Status</CapsLabel>
        <div style={{ marginTop: 8, padding: "14px 0", borderTop: `1px solid ${TL.hair}` }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: TL.text }}>{s.statusLabel}</div>
          <div style={{ marginTop: 2, fontSize: 13, color: TL.mute }}>
            {s.venter
              ? "Aldri logget inn — bulk-importert profil uten aktivitet ennå."
              : s.dagerSiden != null
                ? `Sist aktiv for ${s.dagerSiden} dager siden.`
                : "Aktiv denne uka."}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <CapsLabel>Uka · plan-etterlevelse per akse</CapsLabel>
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
          {s.adhPct != null ? (
            s.adherence.map((a) => (
              <div key={a.akse} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 48, fontSize: 11, fontWeight: 600, color: TL.mute }}>{a.akse}</span>
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: TL.dim, overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(100, a.pct)}%`, height: "100%", background: TL.text, borderRadius: 3 }} />
                </div>
                <span style={{ width: 36, textAlign: "right", fontSize: 11, fontFamily: TL.font.mono, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
                  {a.pct}%
                </span>
              </div>
            ))
          ) : (
            <div style={{ fontSize: 13, color: TL.mute }}>Ingen plan-økter denne uka å måle etterlevelse mot.</div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap" }}>
        <Link
          href={`/admin/workbench/${s.id}`}
          className={PRESS}
          style={{
            height: 44,
            padding: "0 18px",
            borderRadius: TL.radius.pill,
            background: TL.fill,
            color: TL.onFill,
            fontSize: 15,
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          {s.trenger ? "Følg opp i Workbench" : "Åpne Workbench"}
        </Link>
        <Link
          href={`/admin/spillere/${s.id}`}
          className={PRESS}
          style={{
            height: 44,
            padding: "0 18px",
            borderRadius: TL.radius.pill,
            background: "transparent",
            border: `1px solid ${TL.hair}`,
            color: TL.mute,
            fontSize: 15,
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          Se profil
        </Link>
      </div>
    </div>
  );
}

export function TrainLockStall({ data }: { data: StallV2Data }) {
  const mobile = useMobile();
  const [filter, setFilter] = useState<FilterKey>("alle");
  const [sok, setSok] = useState("");
  const alleVenter = data.spillere.length > 0 && data.spillere.every((p) => p.venter);
  const [venterApen, setVenterApen] = useState(alleVenter);
  const [valgtId, setValgtId] = useState<string | null>(
    data.spillere.find((p) => !p.venter)?.id ?? data.spillere[0]?.id ?? null,
  );
  const [arkApen, setArkApen] = useState(false);

  const sokTrim = sok.trim().toLowerCase();
  const aktivtFilter = FILTRE.find((f) => f.k === filter) ?? FILTRE[0];
  const filtered = data.spillere.filter((p) => {
    const sokOk = sokTrim === "" || p.navn.toLowerCase().includes(sokTrim) || p.gruppe.toLowerCase().includes(sokTrim);
    return sokOk && aktivtFilter.f(p);
  });

  const aktiveRader = filtered
    .filter((p) => !p.venter)
    .slice()
    .sort(
      (a, b) =>
        Number(b.trenger) - Number(a.trenger) ||
        SEV_RANG[a.sev] - SEV_RANG[b.sev] ||
        a.navn.localeCompare(b.navn, "nb"),
    );
  const venterRader = filtered.filter((p) => p.venter);
  const valgt =
    aktiveRader.find((p) => p.id === valgtId) ??
    aktiveRader[0] ??
    filtered.find((p) => p.id === valgtId) ??
    filtered[0] ??
    null;

  const trengerAntall = data.spillere.filter((p) => !p.venter && p.trenger).length;

  const velg = (id: string) => {
    setValgtId(id);
    if (mobile) setArkApen(true);
  };

  if (data.spillere.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <CapsLabel>Academy</CapsLabel>
          <h1 style={{ margin: "6px 0 0", fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", color: TL.text }}>Stall</h1>
        </div>
        <Tomtilstand tittel="Ingen spillere i stallen" sub="Legg til første spiller for å se tilstand, plan og oppfølging her." />
        <Link
          href="/admin/spillere/ny"
          className={PRESS}
          style={{
            height: 48,
            borderRadius: TL.radius.pill,
            background: TL.fill,
            color: TL.onFill,
            fontSize: 16,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Legg til første spiller
        </Link>
      </div>
    );
  }

  const listeInnhold = (
    <>
      {aktiveRader.length > 0 &&
        BOLKER.map((b) => {
          const rader = aktiveRader.filter((x) => x.bolk === b.k);
          if (rader.length === 0) return null;
          return (
            <div key={b.k} style={{ background: TL.elev, borderRadius: TL.radius.card, padding: "4px 12px" }}>
              <div style={{ padding: "12px 8px 8px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <CapsLabel size={9}>{b.n}</CapsLabel>
                  <span style={{ fontFamily: TL.font.mono, fontSize: 11, color: TL.mute }}>{rader.length}</span>
                </div>
                <p style={{ margin: "4px 0 0", fontSize: 11.5, color: TL.mute, lineHeight: 1.45 }}>{b.note}</p>
              </div>
              {rader.map((x) => (
                <SpillerRad key={x.id} s={x} valgt={valgt?.id === x.id} onClick={() => velg(x.id)} />
              ))}
            </div>
          );
        })}
      {filtered.length === 0 && <Tomtilstand tittel="Ingen spillere her" sub="Ingen spillere passer filteret akkurat nå." />}
      {venterRader.length > 0 && (
        <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: "4px 12px" }}>
          <button
            type="button"
            onClick={() => setVenterApen((v) => !v)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 8px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: TL.text }}>Venter på innlogging ({venterRader.length})</div>
              <div style={{ marginTop: 2, fontSize: 13, color: TL.mute }}>Bulk-importert, ingen aktivitet ennå</div>
            </div>
            <span style={{ fontSize: 13, color: TL.mute }}>{venterApen ? "Skjul" : "Vis"}</span>
          </button>
          {venterApen && venterRader.map((x) => <SpillerRad key={x.id} s={x} valgt={valgt?.id === x.id} onClick={() => velg(x.id)} />)}
        </div>
      )}
    </>
  );

  const filterRad = (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SokFelt verdi={sok} onEndre={setSok} />
      <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 2 }}>
        {FILTRE.filter((f) => f.k === "alle" || data.spillere.some(f.f)).map((f) => (
          <FilterChip
            key={f.k}
            navn={f.n}
            antall={data.spillere.filter(f.f).length}
            aktiv={filter === f.k}
            onClick={() => setFilter(f.k)}
          />
        ))}
      </div>
    </div>
  );

  const hode = (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
      <div>
        <CapsLabel>Academy</CapsLabel>
        <h1 style={{ margin: "6px 0 0", fontSize: mobile ? 34 : 26, fontWeight: 700, letterSpacing: "-0.02em", color: TL.text }}>Stall</h1>
        <div style={{ marginTop: 4, fontSize: 11, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
          {data.total} spillere · {trengerAntall} trenger deg
        </div>
      </div>
      <Link
        href="/admin/kalender?fane=stall"
        className={PRESS}
        style={{
          flexShrink: 0,
          marginTop: 4,
          height: 36,
          padding: "0 14px",
          borderRadius: TL.radius.pill,
          background: TL.dock,
          color: TL.text,
          fontSize: 13,
          fontWeight: 600,
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        Dag
      </Link>
    </div>
  );

  if (mobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {hode}
        {filterRad}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{listeInnhold}</div>
        {arkApen && valgt && (
          <div
            role="dialog"
            aria-label={valgt.navn}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 90,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              background: TL.scrim,
            }}
            onClick={() => setArkApen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: TL.scene,
                borderRadius: "24px 24px 0 0",
                maxHeight: "88vh",
                overflowY: "auto",
                padding: "12px 16px calc(20px + env(safe-area-inset-bottom))",
              }}
            >
              <div style={{ width: 36, height: 5, borderRadius: 3, background: TL.grabber, margin: "0 auto 12px" }} />
              <SpillerDetalj s={valgt} />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {hode}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr]" style={{ gap: 18, alignItems: "start" }}>
        <div className="min-w-0" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filterRad}
          {listeInnhold}
        </div>
        <div className="min-w-0">{valgt && <SpillerDetalj s={valgt} />}</div>
      </div>
    </div>
  );
}
