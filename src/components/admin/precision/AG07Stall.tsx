"use client";

/**
 * AG-07 Stall i nytt design (designbrevet 13.10.2026) — /admin/spillere.
 * Fasit: docs/design-system/utkast-agencyos/stall.html, skjerm «AG-07 Stall».
 *
 * Tre bånd (beslutninger.md §SKJERMENE … RUNDE 8): I dag · Trener nå · Hele
 * stallen. Hele stallen filtreres på stall-matrisen Trenger deg · Følger planen ·
 * Hviler og sorteres etter hvem som trenger coachen først.
 *
 * Bare ekte data: det appen ikke har (neste turnering, planens sluttdato, ACWR,
 * drill-for-drill-repetisjoner) vises som «—» eller er utelatt.
 *
 * Avvik:
 *   - I dag og Trener nå er nøytrale (grafitt): raden har ingen akse å farge etter.
 *   - Trener nå viser ikke tellere per drill; repetisjonene finnes ikke i stalldataene.
 *   - Neste turnering, plan slutter og ACWR mangler i stalldataene og er utelatt.
 */
import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Avatar, Knapp, KnappLenke, Tom, Topp, Varsel } from "@/components/admin/agencyos-ny/ny";
import type { StallBaandRad } from "@/lib/admin/stall-precision-data";
import { fmtSg } from "@/lib/v2/format";
import { sendMeldingTilSpiller } from "@/app/admin/(legacy)/messages/actions";
import "@/styles/agencyos-ny-stall.css";

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
const OSLO_DATO = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short", timeZone: "Europe/Oslo" });
const klokke = (minutt: number) => `${String(Math.floor(minutt / 60)).padStart(2, "0")}:${String(minutt % 60).padStart(2, "0")}`;
const KLASSE: Record<Matrise, string> = { trenger: "trenger", planen: "folger", hviler: "hviler" };

function SpillerRad({ r }: { r: StallBaandRad }) {
  const m = MATRISE[r.status];
  const sgNaa = r.sgTrend.length ? fmtSg(r.sgTrend[r.sgTrend.length - 1]!) : "—";
  const avtale = r.avtaleUtlopIso ? `${r.pakke} · fornyes ${OSLO_DATO.format(new Date(r.avtaleUtlopIso))}` : r.pakkeAktiv ? r.pakke : null;
  const lav = r.adhPct != null && r.adhPct < 70;
  return <Link role="listitem" href={`/admin/spillere/${r.id}`} aria-label={`${r.name} · ${r.statusLabel}`} className={`sp-rad ${KLASSE[m]}`}>
    <Avatar navn={r.name} />
    <span>
      <b className="n">{r.name}</b>
      <span className="sp-fakta">
        <span>HCP {r.hcp}</span><span>{gruppeNavn(r)}</span><span>SG {sgNaa}{r.sgDelta != null ? ` (${fmtSg(r.sgDelta)})` : ""}</span>
        <span>Siste: {r.sisteAktivitetLabel}</span>
        {avtale && <span>{avtale}</span>}
      </span>
      {m !== "planen" && <span className={`sp-grunn${m === "hviler" ? " hvil" : ""}`}>{m === "hviler" ? "Hviler" : "Trenger deg"} · {r.statusLabel}</span>}
      {r.skylder && <span className="sp-grunn">Betaling feilet</span>}
    </span>
    <span className="sp-etl"><b className={lav ? "lav" : undefined}>{r.adhPct == null ? "—" : `${r.adhPct} %`}</b><span>4 uker</span></span>
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
  return <div className="ark-lag" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div role="dialog" aria-modal="true" aria-label={`Melding til ${r.name}`} className="ark">
      <div className="ark-topp">
        <div><div className="dato">Under økta · {r.paagaaende?.tittel ?? "—"}</div><h2>Melding til {r.name}</h2></div>
        <button type="button" className="lukk" aria-label="Lukk" onClick={onClose}><X className="ikon" aria-hidden /></button>
      </div>
      {sendt ? <p className="forklar">Meldingen er sendt til {r.name}.</p> : <>
        <span className="etikett undertittel">Hurtigmelding</span>
        <div className="chips">
          {HURTIG.map((h) => <button key={h} type="button" aria-pressed={valgt === h} onClick={() => { setValgt(valgt === h ? null : h); setFritekst(""); }}>{h}</button>)}
        </div>
        <label className="felt"><span className="etikett">Eller skriv selv</span>
          <input value={fritekst} maxLength={2000} placeholder="Kort melding" onChange={(e) => { setFritekst(e.target.value); setValgt(null); }} /></label>
        {feil && <Varsel tone="advarsel">{feil}</Varsel>}
      </>}
      <div className="knapper">
        {sendt ? <Knapp variant="sek" stor onClick={onClose}>Lukk</Knapp> : <>
          <Knapp stor disabled={!melding || sender} onClick={send}>{sender ? "Sender …" : "Send melding"}</Knapp>
          <Knapp variant="spok" stor onClick={onClose}>Avbryt</Knapp>
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
    return (!s || r.name.toLowerCase().includes(s) || gruppeNavn(r).toLowerCase().includes(s)) && (grp === "alle" || (r.group ?? "").toUpperCase() === grp.toUpperCase());
  };
  const etterSok = sortert.filter(sokFilter);
  const vist = mat === "alle" ? etterSok : etterSok.filter((r) => MATRISE[r.status] === mat);
  const venterVist = venter.filter(sokFilter);

  const handlinger = <>
    <KnappLenke href="/admin/kalender?fane=stall">Dagsvisning</KnappLenke>
    <KnappLenke href="/admin/agencyos/ak-stigen">AK-stigen</KnappLenke>
    {!tom && <KnappLenke href="/admin/spillere/ny">Ny spiller</KnappLenke>}
  </>;

  if (tom) return <div className="agn-s">
    <Topp dato="0 spillere" tittel="Stall" handlinger={handlinger} />
    <Tom tittel="Ingen spillere i stallen" tekst="Legg til første spiller for å se tilstand, plan og oppfølging her." handling={<KnappLenke variant="pri" href="/admin/spillere/ny">Ny spiller</KnappLenke>} />
  </div>;

  return <div className="agn-s">
    <Topp dato={`${total} ${total === 1 ? "spiller" : "spillere"}`} tittel="Stall" handlinger={handlinger} />
    <div className="stall-grid">
      <div>
        <section className="baand" aria-label="I dag">
          <div className="sek-topp"><h2>I dag</h2><span className="kilde">{iDag.length ? `${iDag.length} ${iDag.length === 1 ? "økt" : "økter"} resten av dagen` : "Ingen"}</span></div>
          {iDag.length === 0 ? <p className="forklar">Ingen av spillerne dine har flere økter i dag.</p>
            : <div className="idag-rad" role="list">{iDag.map((r) => <Link key={r.id} role="listitem" href={`/admin/spillere/${r.id}`} className="idag-kort">
              <span className="kl">{r.nesteOkt ? OSLO_KLOKKE.format(new Date(r.nesteOkt)) : "—"}</span>
              <span><b>{r.name}</b><span className="i">{gruppeNavn(r)}</span></span>
            </Link>)}</div>}
        </section>
        <section className="baand" aria-label="Trener nå">
          <div className="sek-topp"><h2>Trener nå</h2><span className="kilde">{trenerNaa.length ? `${trenerNaa.length} ${trenerNaa.length === 1 ? "spiller" : "spillere"}` : "Ingen"}</span></div>
          {trenerNaa.length === 0 ? <p className="forklar">Ingen er i gang med en økt.</p>
            : trenerNaa.map((r) => <div key={r.id} className="naa-kort">
              <div className="topp-rad">
                <Link href={`/admin/spillere/${r.id}`} className="naa-lenke"><b className="n">{r.name}</b><span className="naa-sub">{r.paagaaende?.tittel ?? "—"}</span></Link>
                <span className="pulse"><i />Pågår</span>
              </div>
              {r.paagaaende && <span className="naa-sub">Planlagt {klokke(r.paagaaende.startMinute)}–{klokke(r.paagaaende.startMinute + r.paagaaende.durationMinutes)}</span>}
              <div className="hurtigsvar"><button type="button" className="pri" onClick={() => setMelding(r)}>Send melding</button></div>
              <span className="naa-sub dempet">Du følger økta, men endrer den ikke.</span>
            </div>)}
        </section>
      </div>
      <div>
        <section className="baand" aria-label="Hele stallen">
          <div className="sek-topp"><h2>Hele stallen</h2><span className="kilde">Sortert etter hvem som trenger deg</span></div>
          <div className="matrise" role="group" aria-label="Stall-matrise">
            {MATRISE_VALG.map((v) => <button key={v.id} type="button" className={KLASSE[v.id]} aria-pressed={mat === v.id} onClick={() => setMat(mat === v.id ? "alle" : v.id)}>
              <b>{etterSok.filter((r) => MATRISE[r.status] === v.id).length}</b><span>{v.label}</span></button>)}
          </div>
          <div className="sok">
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Søk spiller eller gruppe" aria-label="Søk spiller eller gruppe" />
          </div>
          <div className="valg" role="group" aria-label="Gruppe">
            {nyttGruppeFilter.map((g) => <button key={g.id} type="button" aria-pressed={grp === g.id} onClick={() => setGrp(g.id)}>{g.label}</button>)}
          </div>
          {vist.length === 0
            ? <Tom tittel="Ingen treff" tekst="Ingen spillere passer søket og filteret." handling={<Knapp variant="sek" onClick={() => { setQ(""); setGrp("alle"); setMat("alle"); }}>Nullstill</Knapp>} />
            : <div className="baand" role="list">{vist.map((r) => <SpillerRad key={r.id} r={r} />)}</div>}
          {venterVist.length > 0 && <details className="detaljer">
            <summary>Venter på innlogging · {venterVist.length}</summary>
            <div className="baand" role="list">{venterVist.map((r) => <SpillerRad key={r.id} r={r} />)}</div>
          </details>}
          <p className="kilde">Etterlevelse: gjennomført tid mot planlagt, siste fire uker. ACWR vises når tallet regnes ut.</p>
        </section>
      </div>
    </div>
    {melding && <MeldingArk r={melding} onClose={() => setMelding(null)} />}
  </div>;
}
