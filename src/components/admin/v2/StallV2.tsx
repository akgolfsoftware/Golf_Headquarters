"use client";
import { TL } from "@/lib/v2/train-lock";
/**
 * AgencyOS Stall — v2 Presis + B-idé (tilstand 5s, én hovedhandling per spiller).
 * Ekte data loadStallen. Kun v2 / T.*. Standard mørk AgencyOS-chrome.
 *
 * Desktop: hode + KPI → filtre → grid liste | sammendrag.
 * Mobil: liste + BunnArk for valgt spiller.
 *
 * GO V3: rad = detalj (velger spiller, åpner sammendrag), Workbench er CTA-en
 * derfra. Lista sorterer «trenger deg» øverst, sterkeste signal først.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { Caps, Kort, Rad, AvatarInit, SevChip, DeltaChip, TallHero, Trend, AkseBar, CTAPill, TomTilstand, BunnArk, HjelpTips, Icon, type SevKey } from "@/components/v2";
import type { AkseKey } from "@/lib/v2/format";

/** true på klient etter mount når viewport < 768px (M3-mobilvariant). */
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

// ── Datakontrakt (mappes fra StallenData i ruten) ───────────────
export interface StallV2Adherence {
  akse: AkseKey;
  pct: number;
}
export interface StallV2Player {
  id: string;
  navn: string;
  hcp: string;
  gruppe: string;
  sg: string;
  delta: string | null;
  dir: "up" | "down";
  sev: SevKey;
  statusLabel: string;
  /** status !== ok — for «Trenger deg»-filteret. */
  trenger: boolean;
  /** Hvilken av fasitens tre bolker spilleren hører til. */
  bolk: "trenger" | "planen" | "hviler";
  /** SG-serie eldst → nyest (ekte målepunkter). */
  sgTrend: number[];
  /** Plan-etterlevelse per akse denne uka (% av planlagte minutter). */
  adherence: StallV2Adherence[];
  /** Aggregert etterlevelse denne uka. null = ingen planlagte økter. */
  adhPct: number | null;
  /** Aldri logget inn — bulk-importert plassholderprofil uten aktivitet ennå. */
  venter: boolean;
  /** Dager siden siste innlogging — bærer fasitens «Stille over 7 dager». */
  dagerSiden: number | null;
  /** Abonnements-pakke («Drop-in» uten abonnement) — fra cockpit-lista (B2). */
  pakke: string;
  pakkeAktiv: boolean;
  /** Minst én feilet betaling. */
  skylder: boolean;
}
export interface StallV2Data {
  total: number;
  spillere: StallV2Player[];
}

/** Paper `agencyos-spillere.html` §GRUPPER — ordlyden er fasitens egen. */
const BOLKER = [
  { k: "trenger", n: "Trenger deg nå", note: "Noe venter på deg, eller spilleren har vært stille for lenge." },
  { k: "planen", n: "Følger planen", note: "Logger som avtalt. Ingen handling nødvendig." },
  { k: "hviler", n: "Hviler", note: "Planlagt pause eller retur-til-spill. Teller ikke som stille." },
] as const;

/**
 * Paper `agencyos-spillere.html` §FILTRE — ÉN rad enkeltvalg med teller per
 * chip. Fasiten filtrerer på program, ikke på status/betaling: coachen tenker
 * «hvem i WANG», ikke «hvem er abonnent».
 */
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

/** Sorteringsvekt for signalstyrke — sterkeste øverst i lista (GO V3). */
const SEV_RANG: Record<SevKey, number> = { sterk: 0, medium: 1, lav: 2, ok: 3 };

/** Fasitens `.chip` — enkeltvalg med teller. Egen her fordi delte FilterChips
 *  er flervalg og mangler telleren. */
function ProgramChip({
  navn,
  antall,
  aktiv,
  onClick,
  odId,
}: {
  navn: string;
  antall: number;
  aktiv: boolean;
  onClick: () => void;
  odId: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={aktiv}
      className="v2-press v2-focus"
      data-od-id={odId}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        minHeight: 44,
        padding: "0 14px",
        borderRadius: 999,
        whiteSpace: "nowrap",
        cursor: "pointer",
        fontFamily: TL.font.sans,
        fontSize: 12.5,
        background: aktiv ? TL.text : TL.elev,
        color: aktiv ? TL.scene : TL.text,
        border: `1px solid ${aktiv ? TL.text : TL.hair}`,
      }}
    >
      {navn}
      <span style={{ fontFamily: TL.font.mono, fontSize: 11, opacity: 0.7, fontVariantNumeric: "tabular-nums" }}>
        {antall}
      </span>
    </button>
  );
}

function SpillerRadEnkel({
  s,
  onClick,
  valgt,
  last,
}: {
  s: StallV2Player;
  onClick: () => void;
  valgt: boolean;
  last: boolean;
}) {
  return (
    <Rad
      onClick={onClick}
      leading={<AvatarInit navn={s.navn} size={34} />}
      title={s.navn}
      sub={`Hcp ${s.hcp} · ${s.gruppe} · ${s.statusLabel}`}
      meta={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          {/* Fasitens .kol: etikett «SG total» + verdi der FORTEGNET bestemmer
              fargen — alltid (agencyos-spillere.html §SG). */}
          <span style={{ display: "inline-flex", flexDirection: "column", gap: 2, alignItems: "flex-end" }}>
            <Caps size={8}>SG total</Caps>
            <span
              style={{
                fontFamily: TL.font.mono,
                fontSize: 15,
                fontWeight: 700,
                color: s.sg.startsWith("+") ? TL.ok : s.sg.startsWith("−") || s.sg.startsWith("-") ? TL.danger : TL.text,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {s.sg}
            </span>
          </span>
          {s.delta && <DeltaChip v={s.delta} dir={s.dir} />}
          <SevChip s={s.sev} />
        </span>
      }
      trailing={valgt ? <span style={{ width: 2, height: 20, borderRadius: 2, background: TL.fill, flex: "none" }} /> : undefined}
      last={last}
    />
  );
}

function SpillerSammendrag({ s }: { s: StallV2Player }) {
  const harTrend = s.sgTrend.length >= 2;
  const lo = harTrend ? Math.min(...s.sgTrend) : 0;
  const hi = harTrend ? Math.max(...s.sgTrend) : 0;
  const pad = Math.max(0.5, (hi - lo) * 0.15);

  return (
    <Kort tint eyebrow="Spillersammendrag" action={<SevChip s={s.sev} />}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <AvatarInit navn={s.navn} size={44} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 18, color: TL.text }}>{s.navn}</div>
          <div style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute, marginTop: 2 }}>
            Hcp{" "}
            <span style={{ fontFamily: TL.font.mono, fontVariantNumeric: "tabular-nums" }}>{s.hcp}</span> · {s.gruppe} ·{" "}
            <span style={{ color: s.pakkeAktiv ? TL.mute : TL.mute }}>{s.pakke}</span>
            {s.skylder && <span style={{ color: TL.danger, fontWeight: 600 }}> · skylder</span>}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <TallHero
          label="Strokes Gained · form"
          hjelp="sgTotal"
          value={s.sg}
          delta={s.delta ?? undefined}
          dir={s.dir}
          sub={s.statusLabel}
          size={44}
          accent={s.sg.startsWith("+")}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        {harTrend ? (
          <Trend series={s.sgTrend} yMin={lo - pad} yMax={hi + pad} height={64} />
        ) : (
          <TomTilstand icon="activity" title="For få målepunkter" sub="Trenger minst to SG-registreringer for en trendkurve." />
        )}
      </div>

      <div style={{ marginTop: 12 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <Caps size={9}>Uka · plan-etterlevelse per akse</Caps>
          <HjelpTips k="planEtterlevelse" size={11} />
        </span>
        <div style={{ marginTop: 4 }}>
          {s.adhPct != null ? (
            s.adherence.map((x, i) => (
              <AkseBar
                key={x.akse}
                a={x.akse}
                v={x.pct}
                m={100}
                max={100}
                enhet="%"
                last={i === s.adherence.length - 1}
              />
            ))
          ) : (
            <TomTilstand icon="calendar" title="Ingen planlagte økter" sub="Ingen plan-økter denne uka å måle etterlevelse mot." />
          )}
        </div>
      </div>

      {/* B: én primær (Workbench) · profil er sekundær */}
      <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
        <Link href={`/admin/spillere/${s.id}/workbench`} style={{ display: "inline-flex", textDecoration: "none" }}>
          <CTAPill icon="arrow-right">
            {s.trenger ? "Følg opp i Workbench" : "Åpne Workbench"}
          </CTAPill>
        </Link>
        {/* PP-3: profilen er et artefakt-panel på denne flaten (?profil=<id>);
            full side lever videre som fallback via panelets «Full side». */}
        <Link href={`/admin/spillere?profil=${s.id}`} style={{ display: "inline-flex", textDecoration: "none" }}>
          <CTAPill ghost>Se profil</CTAPill>
        </Link>
      </div>
    </Kort>
  );
}

export function StallV2({ data }: { data: StallV2Data }) {
  /* Wave B: Paper agencyos-spillere */
  const mobile = useMobile();
  const [filter, setFilter] = useState<FilterKey>("alle");
  // Fasit agencyos-spillere-mobil.html: «Søk er synlig, ikke gjemt» — med
  // tømmeknapp, fordi tomt søk ellers krever like mange trykk som søket selv.
  const [sok, setSok] = useState("");
  // Audit-funn 6: når ALLE spillere venter på innlogging må seksjonen starte
  // åpen — ellers er coachens hovedliste en tom, svart kolonne.
  const alleVenter = data.spillere.length > 0 && data.spillere.every((p) => p.venter);
  const [venterApen, setVenterApen] = useState(alleVenter);
  // Standard: velg første AKTIVE profil, ikke en tom «venter»-plassholder.
  const [valgtId, setValgtId] = useState<string | null>(
    data.spillere.find((p) => !p.venter)?.id ?? data.spillere[0]?.id ?? null,
  );
  // Mobil: sammendrag i BunnArk (valg via desktop-panel / initial valgtId).
  const [arkApen, setArkApen] = useState(false);

  const sokTrim = sok.trim().toLowerCase();
  const aktivtFilter = FILTRE.find((f) => f.k === filter) ?? FILTRE[0];
  const filtered = data.spillere.filter((p) => {
    const sokOk =
      sokTrim === "" ||
      p.navn.toLowerCase().includes(sokTrim) ||
      p.gruppe.toLowerCase().includes(sokTrim);
    return sokOk && aktivtFilter.f(p);
  });
  // Hub-tall (5 sek): på plan / trenger deg / skylder — kun fra ekte rader.
  const stallKpi = {
    total: data.spillere.filter((p) => !p.venter).length,
    trenger: data.spillere.filter((p) => !p.venter && p.trenger).length,
    iRute: data.spillere.filter((p) => !p.venter && !p.trenger).length,
    skylder: data.spillere.filter((p) => !p.venter && p.skylder).length,
  };
  // Aktive/komplette profiler først — aldri-aktiverte bulk-import-rader
  // grupperes bak en egen, kollapsbar «Venter på innlogging»-seksjon.
  // GO V3: «trenger deg» sorteres øverst, sterkeste signal først — coachen skal
  // ikke lete etter hvem som haster. Navn er tiebreak så rekkefølgen er stabil.
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

  const filtre = (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Søk — fasitens .sok: synlig felt med tømmeknapp. */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          minHeight: 44,
          padding: "0 12px",
          borderRadius: 12,
          background: TL.elev,
          border: `1px solid ${TL.hair}`,
        }}
      >
        <Icon name="search" size={15} style={{ color: TL.mute, flex: "none" }} />
        <input
          type="search"
          value={sok}
          onChange={(e) => setSok(e.target.value)}
          placeholder="Søk på navn eller gruppe"
          autoComplete="off"
          aria-label="Søk etter spiller"
          data-od-id="sp-sok"
          style={{
            flex: 1,
            minWidth: 0,
            appearance: "none",
            background: "transparent",
            border: "none",
            outline: "none",
            fontFamily: TL.font.sans,
            fontSize: 13,
            color: TL.text,
          }}
        />
        {sok !== "" && (
          <button
            type="button"
            onClick={() => setSok("")}
            aria-label="Tøm søket"
            className="v2-press v2-focus"
            data-od-id="sp-tom-sok"
            style={{
              appearance: "none",
              background: "transparent",
              border: "none",
              padding: 4,
              cursor: "pointer",
              display: "inline-flex",
              color: TL.mute,
            }}
          >
            <Icon name="x" size={14} />
          </button>
        )}
      </div>
      {/* Fasitens ene filterrad: program + «stille», hver med teller. Chips
          som ikke treffer noen spiller rendres ikke — tomme valg er støy. */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 2 }}>
        {FILTRE.filter((f) => f.k === "alle" || data.spillere.some(f.f)).map((f) => (
          <ProgramChip
            key={f.k}
            navn={f.n}
            antall={data.spillere.filter(f.f).length}
            aktiv={filter === f.k}
            onClick={() => setFilter(f.k)}
            odId={`sp-filter-${f.k}`}
          />
        ))}
      </div>
    </div>
  );

  // GO V3: rad = detalj. Klikk på en rad åpner spillersammendraget (desktop:
  // høyre panel · mobil: BunnArk) — Workbench er CTA-en derfra, ikke en
  // utilsiktet navigasjon vekk fra lista.
  const velg = (id: string) => {
    setValgtId(id);
    if (mobile) setArkApen(true);
  };

  const aktivListe =
    filtered.length === 0 ? (
      <Kort>
        <TomTilstand icon="users" title="Ingen spillere her" sub="Ingen spillere passer filteret akkurat nå." />
      </Kort>
    ) : aktiveRader.length === 0 ? null : (
      /* Paper-fasitens tre bolker. Hver har sin forklaring — poenget er at
         coachen skal skjønne HVORFOR en spiller ligger der, uten å spørre.
         Tomme bolker rendres ikke. */
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {BOLKER.map((b) => {
          const rader = aktiveRader.filter((x) => x.bolk === b.k);
          if (rader.length === 0) return null;
          return (
            <Kort key={b.k} pad="4px 20px">
              <div style={{ padding: "12px 0 8px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <Caps size={9}>{b.n}</Caps>
                  <span style={{ fontFamily: TL.font.mono, fontSize: 11, color: TL.mute }}>{rader.length}</span>
                </div>
                <p style={{ margin: "4px 0 0", fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute, lineHeight: 1.45 }}>
                  {b.note}
                </p>
              </div>
              {rader.map((x, i) => (
                <SpillerRadEnkel
                  key={x.id}
                  s={x}
                  valgt={valgt?.id === x.id}
                  onClick={() => velg(x.id)}
                  last={i === rader.length - 1}
                />
              ))}
            </Kort>
          );
        })}
      </div>
    );

  const venterSeksjon =
    venterRader.length === 0 ? null : (
      <Kort pad="4px 20px">
        <Rad
          onClick={() => setVenterApen((v) => !v)}
          title={`Venter på innlogging (${venterRader.length})`}
          sub="Bulk-importert, ingen aktivitet ennå"
          trailing={<Icon name={venterApen ? "chevron-up" : "chevron-down"} size={14} style={{ color: TL.mute }} />}
          last={!venterApen}
        />
        {venterApen &&
          venterRader.map((x, i) => (
            <SpillerRadEnkel
              key={x.id}
              s={x}
              valgt={valgt?.id === x.id}
              onClick={() => velg(x.id)}
              last={i === venterRader.length - 1}
            />
          ))}
      </Kort>
    );

  const tilstandKort = (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)",
        gap: 10,
      }}
      data-stall-kpi
    >
      {([
        { l: "Aktive", v: String(stallKpi.total), c: TL.text },
        { l: "I rute", v: String(stallKpi.iRute), c: TL.ok },
        { l: "Trenger deg", v: String(stallKpi.trenger), c: stallKpi.trenger > 0 ? TL.danger : TL.text },
        { l: "Skylder", v: String(stallKpi.skylder), c: stallKpi.skylder > 0 ? TL.warn : TL.text },
      ] as const).map((k) => (
        <Kort key={k.l} pad="12px 14px">
          <Caps size={9}>{k.l}</Caps>
          <div
            style={{
              fontFamily: TL.font.mono,
              fontSize: mobile ? 22 : 26,
              fontWeight: 700,
              color: k.c,
              marginTop: 6,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {k.v}
          </div>
        </Kort>
      ))}
    </div>
  );

  /** Fasitens «Én ting nå»: øverste spiller i «Trenger deg nå» innenfor det
   *  valgte filteret — ikke et nytt filter coachen må skru av igjen. */
  const forsteTrenger = aktiveRader.find((p) => p.trenger) ?? null;
  const foelgOpp = () => {
    if (!forsteTrenger) return;
    setValgtId(forsteTrenger.id);
    if (mobile) setArkApen(true);
  };

  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <span style={{ fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute }}>{data.total} spillere · {stallKpi.trenger} trenger deg</span>
        <div style={{ marginTop: 10 }}>
          <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>Spillere</h1>
        </div>
      </div>
      {/* B: én primær i hode — «følg opp» når noen trenger deg; ellers ghost «Ny spiller» */}
      <div className="hidden md:inline-flex" style={{ gap: 8 }}>
        {forsteTrenger ? (
          <button type="button" onClick={foelgOpp} style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
<span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
              minHeight: 44, padding: "10px 16px", borderRadius: 12,
              background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600,
            }} data-paper-en-ting="true">Åpne {forsteTrenger.navn.split(" ")[0]}</span>
          </button>
        ) : (
          <Link href="/admin/spillere/ny" style={{ textDecoration: "none" }}>
            <CTAPill ghost icon="user-plus">Ny spiller</CTAPill>
          </Link>
        )}
      </div>
    </div>
  );

  /**
   * Fasitens `.bunn` (agencyos-spillere-mobil.html): fast dokk nederst med
   * hint + én full-bredde handling. Gotcha: bunnforankret chrome må legge
   * `--ak-cookie-h` til bunn-paddingen, ellers dekker cookie-banneret knappen.
   */
  const mobilDokk = (
    <div
      data-od-id="spm-bunn"
      style={{
        position: "sticky",
        bottom: 0,
        marginLeft: -16,
        marginRight: -16,
        padding: "12px 16px calc(12px + env(safe-area-inset-bottom) + var(--ak-cookie-h, 0px))",
        borderTop: `1px solid ${TL.hair}`,
        background: TL.elev,
        zIndex: 5,
      }}
    >
      {forsteTrenger ? (
        <>
          <span style={{ display: "block", fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, marginBottom: 8 }}>
            Øverst i «Trenger deg nå»: {forsteTrenger.navn}.
          </span>
          <button
            type="button"
            onClick={foelgOpp}
            data-od-id="spm-one-thing-now"
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", width: "100%" }}
          >
            <span
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                minHeight: 44, padding: "10px 16px", borderRadius: 10, width: "100%",
                background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600,
              }}
              data-paper-en-ting="true"
            >
              Åpne {forsteTrenger.navn.split(" ")[0]}
            </span>
          </button>
        </>
      ) : (
        <>
          <span style={{ display: "block", fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, marginBottom: 8 }}>
            Ingen spiller venter på deg i dette utvalget.
          </span>
          <Link href="/admin/kalender" style={{ textDecoration: "none", display: "block" }} data-od-id="spm-bunn-kalender">
            <span
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                minHeight: 44, padding: "10px 16px", borderRadius: 10, width: "100%",
                background: TL.elev, color: TL.text, border: `1px solid ${TL.hair}`,
                fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600,
              }}
            >
              Åpne kalenderen
            </span>
          </Link>
        </>
      )}
    </div>
  );

  if (data.spillere.length === 0) {
    return (
      <div data-paper-agencyos-spillere data-paper-wave-b="spillere" data-od-id="agency-spillere" style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }} data-paper-slug="agencyos-spillere">
        <div>
          <Caps>AgencyOS</Caps>
          <div style={{ marginTop: 10 }}>
            <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>Spillere</h1>
          </div>
        </div>
        <Kort>
          <TomTilstand
            icon="users"
            title="Ingen spillere i stallen"
            sub="Legg til første spiller for å se tilstand, plan og oppfølging her."
          />
        </Kort>
        <Link href="/admin/spillere/ny" style={{ textDecoration: "none", display: "block" }}>
<span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
              minHeight: 44, padding: "10px 16px", borderRadius: 10, width: "100%",
              background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600,
            }}>Legg til første spiller</span>
        </Link>
      </div>
    );
  }

  if (mobile) {
    return (
      <div data-paper-agencyos-spillere data-paper-wave-b="spillere" data-od-id="agency-spillere" style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
        {hode}
        {tilstandKort}
        {filtre}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {aktivListe}
          {venterSeksjon}
        </div>
        {mobilDokk}
        <BunnArk open={arkApen && !!valgt} onClose={() => setArkApen(false)} tittel={valgt?.navn}>
          {valgt && <SpillerSammendrag s={valgt} />}
        </BunnArk>
      </div>
    );
  }

  return (
    <div data-paper-agencyos-spillere data-paper-wave-b="spillere" data-od-id="agency-spillere" style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
      {hode}
      {tilstandKort}
      {filtre}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr]" style={{ gap: 16, alignItems: "start" }}>
        <div className="min-w-0" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {aktivListe}
          {venterSeksjon}
        </div>
        {valgt && <SpillerSammendrag s={valgt} />}
      </div>
    </div>
  );
}
