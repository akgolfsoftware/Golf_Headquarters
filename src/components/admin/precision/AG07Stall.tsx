"use client";

/**
 * AG-07 Stall i Precision Athletics — porting av /admin/spillere.
 * Tegning: designsystem/precision-athletics/ui_kits/agencyos/screens/AG-stall.jsx
 * (runde 27, lastes sist i screen.html og overstyrer AG-07.jsx).
 *
 * Tre bånd (beslutninger.md §SKJERMENE … RUNDE 8): I dag · Trener nå · Hele
 * stallen. Hele stallen filtreres på stall-matrisen Trenger deg · Følger planen ·
 * Hviler og sorteres etter hvem som trenger coachen først.
 *
 * Bare ekte data: det appen ikke har (neste turnering, planens sluttdato, ACWR,
 * drill-for-drill-repetisjoner) vises som «—» eller er utelatt.
 */
import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { CalendarClock, Flag, Search, Send, UserPlus, Users, X } from "lucide-react";
import { Sidehode, Knapp, KnappLenke, StatusPille, TomTilstand, Meta } from "@/components/precision/pa";
import { Sokefelt, SegmentertValg, IkonKnapp } from "@/components/precision/pa-a2";
import type { StallBaandRad } from "@/lib/admin/stall-precision-data";
import { fmtSg } from "@/lib/v2/format";
import { sendMeldingTilSpiller } from "@/app/admin/(legacy)/messages/actions";

export type AG07Props = {
  tilstand?: "data" | "tom";
  total: number;
  iDag: readonly StallBaandRad[];
  trenerNaa: readonly StallBaandRad[];
  heleStallen: readonly StallBaandRad[];
  nyttGruppeFilter: readonly { id: string; label: string }[];
};

type Matrise = "trenger" | "planen" | "hviler";
const MATRISE: Record<StallBaandRad["status"], Matrise> = {
  bak: "trenger",
  inaktiv: "trenger",
  veil: "trenger",
  aktiv: "planen",
  hviler: "hviler",
};
const MATRISE_VALG: readonly { id: Matrise; label: string }[] = [
  { id: "trenger", label: "Trenger deg" },
  { id: "planen", label: "Følger planen" },
  { id: "hviler", label: "Hviler" },
];
const REKKE: Record<Matrise, number> = { trenger: 0, planen: 1, hviler: 2 };

/** Hurtigmeldinger fra tegningen (AG-stall.jsx · MsgSheet). */
const HURTIG = ["Bra jobba!", "Husk rutinen før hvert slag", "Senk farten til 50 %", "Ta en pause på 5 min", "Send meg en video av neste slag"] as const;

const GRUPPE_LABEL: Record<string, string> = {
  WANG: "WANG Toppidrett",
  GFGK: "GFGK Junior",
  AKA: "AK Golf Academy",
};
const gruppeNavn = (r: StallBaandRad) => (r.group ? (GRUPPE_LABEL[r.group] ?? r.group) : "Uten gruppe");

const OSLO_KLOKKE = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Oslo" });
const OSLO_DATO = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Oslo" });
const klokke = (minutt: number) => `${String(Math.floor(minutt / 60)).padStart(2, "0")}.${String(minutt % 60).padStart(2, "0")}`;

function initialer(navn: string) {
  return navn.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

function Avatar({ navn, size = 32 }: { navn: string; size?: number }) {
  return <span className="pa-avatar" style={{ width: size, height: size, fontSize: Math.round(size * 0.36), flex: "none" }} aria-hidden="true">{initialer(navn)}</span>;
}

function Sparkline({ verdier, label }: { verdier: readonly number[]; label: string }) {
  if (verdier.length < 2) return <span className="pa-spark pa-spark--empty" style={{ height: 24 }}>—</span>;
  const lo = Math.min(...verdier), hi = Math.max(...verdier), span = hi - lo || 1;
  const pts = verdier.map((v, i) => `${(i / (verdier.length - 1)) * 100},${100 - ((v - lo) / span) * 100}`).join(" ");
  return <span className="pa-spark" style={{ height: 24 }} role="img" aria-label={label}>
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline className="pa-spark__line" points={pts} vectorEffect="non-scaling-stroke" /></svg>
  </span>;
}

function Baand({ tittel, meta, children }: { tittel: string; meta: string; children: React.ReactNode }) {
  return <section aria-label={tittel} className="pa-card" style={{ padding: 16, gap: 8, minWidth: 0 }}>
    <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
      <span className="kicker" style={{ flex: "1 1 auto" }}>{tittel}</span>
      <Meta>{meta}</Meta>
    </div>
    {children}
  </section>;
}

const radLenke: React.CSSProperties = { color: "inherit", textDecoration: "none", boxSizing: "border-box", width: "100%", minWidth: 0 };
const skille = (i: number) => (i ? "1px solid var(--border-hairline)" : "none");
const tekst = (vekt: number, str = 14): React.CSSProperties => ({ font: `${vekt} ${str}px/1.3 var(--font-sans)`, color: "var(--text-primary)", minWidth: 0, overflowWrap: "anywhere" });

function SpillerRad({ r, i }: { r: StallBaandRad; i: number }) {
  const m = MATRISE[r.status];
  const sgNaa = r.sgTrend.length ? fmtSg(r.sgTrend[r.sgTrend.length - 1]!) : "—";
  const avtale = r.avtaleUtlopIso ? `${r.pakke} · fornyes ${OSLO_DATO.format(new Date(r.avtaleUtlopIso))}` : r.pakkeAktiv ? r.pakke : "—";
  const celler: [string, string][] = [
    ["ETTERLEVELSE · UKA", r.adhPct == null ? "—" : `${r.adhPct} %`],
    ["SG-FORM", sgNaa],
    ["SG-ENDRING", r.sgDelta == null ? "—" : fmtSg(r.sgDelta)],
    ["SISTE AKTIVITET", r.sisteAktivitetLabel],
    ["NESTE TURNERING", "—"],
    ["PLAN SLUTTER", "—"],
    ["AVTALE", r.skylder ? `${avtale} · betaling feilet` : avtale],
    ["ACWR", "—"],
  ];
  return <Link role="listitem" href={`/admin/spillere/${r.id}`} aria-label={`${r.name} · ${r.statusLabel}`} style={{ ...radLenke, display: "flex", flexDirection: "column", gap: 8, padding: "12px 0", borderTop: skille(i) }}>
    <span style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
      <Avatar navn={r.name} />
      <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={tekst(600)}>{r.name}</span>
        <Meta>HCP {r.hcp} · {gruppeNavn(r).toUpperCase()}</Meta>
      </span>
      {r.sgTrend.length >= 2 && <span style={{ width: 80, flex: "none", display: "flex", flexDirection: "column", gap: 2 }}>
        <Sparkline verdier={r.sgTrend} label={`SG-form siste målinger, ${r.name}`} />
        <Meta>SG · TREND</Meta>
      </span>}
    </span>
    {m !== "planen" && <span style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", minWidth: 0 }}>
      <StatusPille tone={m === "hviler" ? "neutral" : "warn"}>{m === "hviler" ? "Hviler" : "Trenger deg"}</StatusPille>
      <span style={tekst(500, 13)}>{r.statusLabel}</span>
    </span>}
    <span style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 112px), 1fr))", gap: "6px 12px", minWidth: 0 }}>
      {celler.map(([k, v]) => <span key={k} style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <Meta>{k}</Meta>
        <span style={{ font: "500 13px/1.3 var(--font-mono)", color: "var(--text-primary)", overflowWrap: "anywhere" }}>{v}</span>
      </span>)}
    </span>
  </Link>;
}

function MeldingArk({ r, onClose }: { r: StallBaandRad; onClose: () => void }) {
  const [valgt, setValgt] = useState<string | null>(null);
  const [fritekst, setFritekst] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [sendt, setSendt] = useState(false);
  const [sender, start] = useTransition();
  const melding = valgt ?? fritekst.trim();
  const send = () => start(async () => {
    setFeil(null);
    const res = await sendMeldingTilSpiller(r.id, melding);
    if (res.ok) setSendt(true);
    else setFeil(res.error ?? "Kunne ikke sende meldingen.");
  });
  return <div className="pa-sheet-layer">
    <div className="pa-sheet-scrim" onClick={onClose} />
    <div role="dialog" aria-modal="true" aria-label={`Melding til ${r.name}`} className="pa-sheet pa-sheet--auto">
      <header className="pa-sheet__head">
        <span className="pa-sheet__grip" aria-hidden="true" />
        <div className="pa-sheet__titles">
          <div className="kicker">Under økta · {r.paagaaende?.tittel ?? "—"}</div>
          <div className="pa-sheet__title">Melding til {r.name}</div>
        </div>
        <IkonKnapp icon={X} name="x" aria-label="Lukk" onClick={onClose} />
      </header>
      <div className="pa-sheet__body">
        {sendt ? <p style={{ margin: 0, font: "var(--type-body)", color: "var(--text-body)" }}>Meldingen er sendt til {r.name}.</p> : <>
          <Meta>HURTIGMELDING</Meta>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {HURTIG.map((h) => <button key={h} type="button" className="pa-choice" aria-pressed={valgt === h} onClick={() => { setValgt(valgt === h ? null : h); setFritekst(""); }}>{h}</button>)}
          </div>
          <label className="pa-field">
            <span className="pa-field__label">Eller skriv selv</span>
            <span className="pa-control"><input value={fritekst} maxLength={2000} placeholder="Kort melding" onChange={(e) => { setFritekst(e.target.value); setValgt(null); }} /></span>
          </label>
          {feil && <p role="alert" style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-primary)" }}>{feil}</p>}
        </>}
      </div>
      <div className="pa-sheet__foot">
        {sendt
          ? <Knapp variant="secondary" fullWidth onClick={onClose}>Lukk</Knapp>
          : <>
            <Knapp fullWidth icon={Send} iconName="send" disabled={!melding || sender} loading={sender} loadingText="Sender …" onClick={send}>Send melding</Knapp>
            <Knapp variant="ghost" fullWidth onClick={onClose}>Avbryt</Knapp>
          </>}
      </div>
    </div>
  </div>;
}

export function AG07Stall({ tilstand = "data", total, iDag, trenerNaa, heleStallen, nyttGruppeFilter }: AG07Props) {
  const tom = tilstand === "tom";
  const [q, setQ] = useState("");
  const [grp, setGrp] = useState<string>("alle");
  const [mat, setMat] = useState<"alle" | Matrise>("alle");
  const [melding, setMelding] = useState<StallBaandRad | null>(null);

  const innlogget = useMemo(() => heleStallen.filter((r) => !r.neverLoggedIn), [heleStallen]);
  const venter = useMemo(() => heleStallen.filter((r) => r.neverLoggedIn), [heleStallen]);

  const sortert = useMemo(() => [...innlogget].sort((a, b) =>
    REKKE[MATRISE[a.status]] - REKKE[MATRISE[b.status]] || (a.adhPct ?? 101) - (b.adhPct ?? 101)), [innlogget]);

  const sokFilter = (r: StallBaandRad) => {
    const s = q.trim().toLowerCase();
    return (!s || r.name.toLowerCase().includes(s)) && (grp === "alle" || (r.group ?? "").toUpperCase() === grp.toUpperCase());
  };
  const etterSok = sortert.filter(sokFilter);
  const vist = mat === "alle" ? etterSok : etterSok.filter((r) => MATRISE[r.status] === mat);
  const venterVist = venter.filter(sokFilter);

  const dag = <Baand tittel="I dag" meta={tom || iDag.length === 0 ? "INGEN" : `${iDag.length} ${iDag.length === 1 ? "ØKT" : "ØKTER"} RESTEN AV DAGEN`}>
    {tom || iDag.length === 0 ? <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Ingen av spillerne dine har flere økter i dag.</p>
      : <div role="list">{iDag.map((r, i) => <Link key={r.id} role="listitem" href={`/admin/spillere/${r.id}`} style={{ ...radLenke, display: "grid", gridTemplateColumns: "56px minmax(0,1fr)", gap: 12, alignItems: "center", minHeight: 52, borderTop: skille(i) }}>
        <span style={{ font: "600 15px/1 var(--font-mono)", color: "var(--text-primary)" }}>{r.nesteOkt ? OSLO_KLOKKE.format(new Date(r.nesteOkt)).replace(":", ".") : "—"}</span>
        <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          <span style={tekst(500)}>{r.name}</span>
          <Meta>{gruppeNavn(r).toUpperCase()}</Meta>
        </span>
      </Link>)}</div>}
  </Baand>;

  const live = <Baand tittel="Trener nå" meta={tom || trenerNaa.length === 0 ? "INGEN" : `${trenerNaa.length} ${trenerNaa.length === 1 ? "ØKT" : "ØKTER"} I GANG`}>
    {tom || trenerNaa.length === 0 ? <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Ingen er i gang med en økt.</p>
      : <div role="list">{trenerNaa.map((r, i) => <div role="listitem" key={r.id} style={{ display: "flex", flexDirection: "column", gap: 8, padding: "10px 0", borderTop: skille(i), minWidth: 0 }}>
        <Link href={`/admin/spillere/${r.id}`} style={{ ...radLenke, display: "flex", flexDirection: "column", justifyContent: "center", gap: 2, minHeight: 44 }}>
          <span style={tekst(600)}>{r.name} · {r.paagaaende?.tittel ?? "—"}</span>
          <Meta>{r.paagaaende ? `PLANLAGT ${klokke(r.paagaaende.startMinute)}–${klokke(r.paagaaende.startMinute + r.paagaaende.durationMinutes)}` : "—"}</Meta>
        </Link>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Knapp size="sm" icon={Send} iconName="send" onClick={() => setMelding(r)}>Send melding</Knapp>
        </div>
      </div>)}</div>}
  </Baand>;

  const alle = <Baand tittel="Hele stallen" meta={tom ? "0 SPILLERE" : `${sortert.length} SPILLERE · TRENGER DEG FØRST`}>
    {tom ? <TomTilstand icon={Users} title="Ingen spillere i stallen" text="Legg til første spiller for å se tilstand, plan og oppfølging her." actions={<KnappLenke href="/admin/spillere/ny" icon={UserPlus}>Ny spiller</KnappLenke>} /> : <>
      <div role="group" aria-label="Stall-matrise" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" className="pa-choice" aria-pressed={mat === "alle"} onClick={() => setMat("alle")}>Alle · {etterSok.length}</button>
        {MATRISE_VALG.map((v) => <button key={v.id} type="button" className="pa-choice" aria-pressed={mat === v.id} onClick={() => setMat(v.id)}>{v.label} · {etterSok.filter((r) => MATRISE[r.status] === v.id).length}</button>)}
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end", minWidth: 0 }}>
        <Sokefelt label="Søk etter navn" value={q} onChange={setQ} />
        <SegmentertValg label="Gruppe" value={grp} onChange={setGrp} options={nyttGruppeFilter} />
      </div>
      {vist.length === 0
        ? <TomTilstand icon={Search} title="Ingen treff" text="Ingen spillere passer søket og filteret." actions={<Knapp variant="ghost" onClick={() => { setQ(""); setGrp("alle"); setMat("alle"); }}>Nullstill</Knapp>} />
        : <div role="list">{vist.map((r, i) => <SpillerRad key={r.id} r={r} i={i} />)}</div>}
      {venterVist.length > 0 && <details style={{ borderTop: "1px solid var(--border-hairline)", paddingTop: 8 }}>
        <summary style={{ cursor: "pointer", minHeight: 44, display: "flex", alignItems: "center", ...tekst(600) }}>Venter på innlogging · {venterVist.length}</summary>
        <div role="list">{venterVist.map((r, i) => <SpillerRad key={r.id} r={r} i={i} />)}</div>
      </details>}
      <Meta>ACWR VISES «—» TIL DET ER AVKLART</Meta>
    </>}
  </Baand>;

  return <div className="pa-side">
    <Sidehode kicker={`Stall · ${tom ? "0 spillere" : `${total} spillere`}`} title="Stall" />
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <KnappLenke variant="secondary" size="sm" icon={CalendarClock} href="/admin/kalender?fane=stall">Dagsvisning</KnappLenke>
      <KnappLenke variant="secondary" size="sm" icon={Flag} href="/admin/agencyos/ak-stigen">AK-stigen</KnappLenke>
      {!tom && <KnappLenke variant="secondary" size="sm" icon={UserPlus} href="/admin/spillere/ny">Ny spiller</KnappLenke>}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: 16, alignItems: "start", minWidth: 0 }}>
      {dag}
      {live}
    </div>
    {alle}
    {melding && <MeldingArk r={melding} onClose={() => setMelding(null)} />}
  </div>;
}
