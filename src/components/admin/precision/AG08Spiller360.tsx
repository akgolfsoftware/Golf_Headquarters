"use client";

/**
 * AG-08 Spiller 360, designløftet 20.10.2026. Fasit: canvaset «AgencyOS
 * nøkkelskjermer» (https://claude.ai/artifact/SLdHBGbdK1hiJcep9e42Cy), tavlene
 * Spiller360 og Spiller360-mobil (godkjent 20.10). Hode med navn og handlinger,
 * fire nøkkeltall, «Dette krever deg nå» som kort, og fanene (mobil: nedtrekk).
 * IUP-fanen vises bare for aktive WANG- og Team Norway-medlemmer.
 *
 * Spillerkort og «Dette krever deg nå» øverst, deretter fanene Plan · Stats ·
 * Teknisk plan · Tester · IUP · Samtaler · Talent. Fanene er lenker (?fane=),
 * så serveren henter bare data for fanen som er åpen. Talent og sammenligning
 * med stallen er bare for coach — hele /admin er coach og admin.
 *
 * Send melding bruker den eksisterende handlingen sendMeldingTilSpiller
 * (samme tilgangssjekk som stallens melding-knapp).
 */
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, X } from "lucide-react";
import { Feil, Knapp, KnappLenke, Laster, Varsel } from "@/components/admin/agencyos-ny/ny";
import { Avatar } from "@/components/admin/agencyos-ny/ny";
import { sendMeldingTilSpiller } from "@/app/admin/(legacy)/messages/actions";
import { FANER, type S360Fane } from "@/lib/admin-spiller/spiller360-visning";
import type { S360FaneData, S360Hode, S360RailSpiller } from "@/lib/admin-spiller/spiller360-typer";
import { AG08Iup, AG08Plan, AG08Samtaler, AG08Talent, AG08Tp } from "./AG08Faner";
import { AG08Stats } from "./AG08Stats";
import { AG08Tester } from "./AG08Tester";
import { Nedtrekk } from "@/components/precision/Nedtrekk";
import { formaterTall } from "@/lib/format-tall";
import "@/styles/agencyos-ny-stall.css";
import "@/styles/agencyos-ny-spiller360.css";

export type AG08Props = {
  tilstand: "data" | "tom" | "laster" | "feil";
  hode: S360Hode | null;
  fane: S360Fane;
  faneData: S360FaneData | null;
  /** Arbeidsvisning (?vis=360): spillerliste ved siden av. null = vanlig visning. */
  rail: S360RailSpiller[] | null;
  /** Stats-del som åpnes først (?del=snitt|sg|tren|test). */
  statsDel?: string | null;
};

function SendMelding({ spillerId, navn, onClose }: { spillerId: string; navn: string; onClose: () => void }) {
  const [tekst, setTekst] = useState("");
  const [svar, setSvar] = useState<{ ok: boolean; tekst: string } | null>(null);
  const [pending, start] = useTransition();
  const send = () => start(async () => {
    const r = await sendMeldingTilSpiller(spillerId, tekst);
    if (r?.ok) { setTekst(""); setSvar({ ok: true, tekst: "Meldingen er sendt." }); }
    else setSvar({ ok: false, tekst: r?.error ?? "Meldingen ble ikke sendt. Prøv igjen." });
  });
  return <div className="ark-lag" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div role="dialog" aria-modal="true" aria-label={`Melding til ${navn}`} className="ark">
      <div className="ark-topp"><div><div className="dato">Melding</div><h2>Til {navn}</h2></div>
        <button type="button" className="lukk" aria-label="Lukk" onClick={onClose}><X className="ikon" aria-hidden /></button></div>
      <label className="felt"><span className="etikett">Melding</span>
        <textarea rows={4} value={tekst} onChange={(e) => { setTekst(e.target.value); setSvar(null); }} maxLength={4000} /></label>
      {svar && <Varsel tone={svar.ok ? "ok" : "advarsel"}>{svar.tekst}</Varsel>}
      <p className="kilde">Meldingen går i direktetråden mellom deg og spilleren.</p>
      <div className="knapper">
        <Knapp stor disabled={pending || !tekst.trim()} onClick={send}>{pending ? "Sender …" : "Send"}</Knapp>
        <Knapp variant="spok" stor onClick={onClose}>Lukk</Knapp>
      </div>
    </div>
  </div>;
}

const tall = (v: number | null) => formaterTall(v, 1, true);

/** Brutto siste 10 tellende runder som linje. Lavere score tegnes høyere. */
function Kurve({ verdier }: { verdier: number[] }) {
  if (verdier.length < 2) return null;
  const min = Math.min(...verdier), maks = Math.max(...verdier), spenn = Math.max(1, maks - min);
  const x = (i: number) => (i / (verdier.length - 1)) * 88;
  const y = (v: number) => 4 + ((v - min) / spenn) * 24;
  const r1 = (n: number) => Math.round(n * 10) / 10;
  const pkt = verdier.map((v, i) => `${r1(x(i))},${r1(y(v))}`).join(" ");
  return <svg className="s3-kurve" width="88" height="32" viewBox="0 0 88 32" role="img" aria-label={`Brutto siste ${verdier.length} runder: ${verdier.join(", ")}`}>
    <polyline points={pkt} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <circle cx={x(verdier.length - 1)} cy={y(verdier.at(-1)!)} r="3" fill="currentColor" />
  </svg>;
}

function Hode({ h, onMelding, vis }: { h: S360Hode; onMelding: () => void; vis: string }) {
  const alder = h.fodtAar ? new Date().getFullYear() - h.fodtAar : null;
  const meta = [h.kategori ? `Kategori ${h.kategori}` : "Kategori —", `HCP ${h.hcp}`, alder != null ? `${alder} år` : null, ...h.grupper].filter(Boolean).join(" · ");
  return <header className="s3-hode">
    <div className="s3-hvem">
      <Avatar navn={h.navn} stor />
      <div className="s3-navn">
        <span className="meta">{meta}</span>
        <h1>{h.navn}</h1>
        <span className="s3-under">{h.tilhorighet === "AK GOLF" ? "AK Golf" : "WANG · Team Norway"}{h.sisteBooking ? ` · siste booking ${h.sisteBooking.dato}, ${h.sisteBooking.tjeneste}` : ""}</span>
      </div>
    </div>
    <div className="s3-handlinger">
      <KnappLenke variant="pri" href={`/admin/workbench/${h.id}`}>Åpne Workbench</KnappLenke>
      <Knapp variant="sek" onClick={onMelding}>Send melding</Knapp>
      <KnappLenke href="/admin/agencyos/live">Start live</KnappLenke>
      {h.iup && <KnappLenke href={`/admin/spillere/${h.id}?fane=iup${vis}`}>IUP-samtale</KnappLenke>}
    </div>
    <nav aria-label="Mer om spilleren" className="s3-lenker">
      <Link href={`/admin/spillere/${h.id}/rediger`}>Rediger profil</Link>
      <Link href={`/admin/spillere/${h.id}/profil-komplett`}>Komplett profil</Link>
      <Link href={`/admin/spillere/${h.id}/turneringsplan`}>Turneringsplan</Link>
      <Link href={`/admin/spillere/${h.id}/turnering-kobling`}>Turneringsprofil</Link>
      <Link href={`/admin/tester/tildel/${h.id}`}>Tildel test</Link>
    </nav>
  </header>;
}

function Nokkeltall({ h, tom }: { h: S360Hode; tom: boolean }) {
  const s = tom ? { siste10: null, forrige10: null, antall: 0, kurve: [] } : h.snitt;
  const endring = s.siste10 != null && s.forrige10 != null ? s.siste10 - s.forrige10 : null;
  const pct = tom ? null : h.etterlevelse.pct;
  const t = tom ? null : h.nesteTurnering;
  const dager = tom ? null : h.turneringOmDager;
  return <section aria-label="Nøkkeltall" className="s3-kpi">
    <div className="s3-k">
      <span className="e">Snitt brutto, 10 runder</span>
      <div className="s3-k-rad"><b className="t">{tall(s.siste10)}</b><Kurve verdier={s.kurve} /></div>
      <span className="s">{endring == null ? (s.antall ? `${s.antall} tellende runder` : "Under 4 tellende runder") : endring === 0 ? "Som forrige 10" : `${endring < 0 ? "↓" : "↑"} ${tall(Math.abs(endring))} slag fra forrige 10`}</span>
    </div>
    <div className="s3-k">
      <span className="e">HCP</span>
      <b className="t">{h.hcp}</b>
      <span className="s">{h.avtale ? `${h.avtale.verdi} · ${h.avtale.hint.toLocaleLowerCase("nb-NO")}` : "Ingen coachingavtale"}</span>
    </div>
    <div className="s3-k">
      <span className="e">Mot plan, 4 uker</span>
      <b className="t">{pct == null ? "—" : <>{pct}<small> %</small></>}</b>
      <span className="s3-bar" role="img" aria-label={pct == null ? "Ingen forfalte økter" : `${pct} prosent av planlagt tid gjennomført`}><i style={{ width: `${Math.min(100, pct ?? 0)}%` }} /></span>
      <span className="s">Gjennomført tid mot planlagt</span>
    </div>
    <div className="s3-k">
      <span className="e">Neste turnering</span>
      <b className="t">{t ? t.dato.slice(0, 5) : "—"}</b>
      <span className="s">{t ? `${t.navn}${dager != null ? ` · ${dager === 0 ? "i dag" : dager === 1 ? "i morgen" : `om ${dager} dager`}` : ""}` : "Ingen påmelding"}</span>
    </div>
  </section>;
}

function KreverDeg({ h, tom }: { h: S360Hode; tom: boolean }) {
  const saker = tom ? [] : h.kreverDeg.slice(0, 2);
  if (!saker.length) return <p className="s3-ingen">Ingenting krever deg nå for {h.navn.split(" ")[0]}.</p>;
  return <section aria-label="Dette krever deg nå" className="s3-krever">
    {saker.map((s, i) => <Link key={s.id} href={`/admin/innboks?filter=godkjenn&sak=plan:${s.id}`} className={i === 0 ? "s3-krav forst" : "s3-krav"}>
      <span className="e">Krever deg nå · Innboks</span>
      <b>{s.tittel}</b>
      <span className="s">{s.sub.toLocaleLowerCase("nb-NO")} · se saken →</span>
    </Link>)}
    {h.kreverDeg.length > 2 && <Link href="/admin/innboks?filter=godkjenn" className="s3-flere">{h.kreverDeg.length - 2} til i Innboks →</Link>}
  </section>;
}

function Faner({ h, fane, vis }: { h: S360Hode; fane: S360Fane; vis: string }) {
  const router = useRouter();
  const faner = FANER.filter(([k]) => k !== "iup" || h.iup);
  const href = (k: string) => `/admin/spillere/${h.id}?fane=${k}${vis}`;
  return <>
    <nav className="s3-faner" aria-label="Spiller 360">
      {faner.map(([k, l]) => <Link key={k} href={href(k)} scroll={false} aria-current={k === fane ? "page" : undefined}>{l}{k === "talent" && <span className="meta">Bare coach</span>}</Link>)}
    </nav>
    <div className="s3-fane-velger">
      <Nedtrekk etikett="Fane" bred valg={faner.map(([k, l]) => ({ verdi: k, navn: k === "talent" ? `${l} · bare coach` : l }))} verdi={fane} onVelg={(v) => router.push(href(v), { scroll: false })} />
    </div>
  </>;
}

function Rail({ rail, aktivId, fane }: { rail: S360RailSpiller[]; aktivId: string; fane: S360Fane }) {
  return <details className="detaljer s360-rail" open>
    <summary>Stallen · {rail.length}</summary>
    <nav aria-label="Bytt spiller" className="liste">
      {rail.map((r) => <Link key={r.id} href={`/admin/spillere/${r.id}?vis=360&fane=${fane}`} aria-current={r.id === aktivId ? "page" : undefined}>
        <Avatar navn={r.navn} liten lys /><span><b>{r.navn}</b>{r.sub && <span className="kilde">{r.sub}</span>}</span><span />
      </Link>)}
    </nav>
  </details>;
}

function FaneInnhold({ d, tom, spillerId, statsDel }: { d: S360FaneData; tom: boolean; spillerId: string; statsDel?: string | null }) {
  switch (d.fane) {
    case "plan": return <AG08Plan d={d.data} tom={tom} spillerId={spillerId} />;
    case "stats": return <AG08Stats d={d.data} tom={tom} spillerId={spillerId} start={statsDel} />;
    case "tp": return <AG08Tp d={d.data} tom={tom} spillerId={spillerId} />;
    case "test": return <AG08Tester d={d.data} tom={tom} spillerId={spillerId} />;
    case "iup": return <AG08Iup d={d.data} tom={tom} />;
    case "samtaler": return <AG08Samtaler d={d.data} tom={tom} />;
    case "talent": return <AG08Talent d={d.data} tom={tom} />;
  }
}

export function AG08Spiller360({ tilstand, hode, fane, faneData, rail, statsDel }: AG08Props) {
  const [melding, setMelding] = useState(false);
  const tom = tilstand === "tom";
  const vis = rail ? "&vis=360" : "";
  const tilbake = <Link href="/admin/spillere" className="ag-tilbake"><ChevronLeft className="ikon" aria-hidden />Stall</Link>;

  if (tilstand === "laster") return <div className="agn-s">{tilbake}<Laster tekst="Henter spilleren …" hoyder={[220, 80, 320]} /></div>;
  if (tilstand === "feil" || !hode) return <div className="agn-s">{tilbake}<Feil tittel="Spilleren kunne ikke hentes" tekst="Ingen felt er endret. Prøv igjen." kode="FEIL · SPILLER 360" /></div>;

  const side = <div className="s360-stabel s3">
    <Hode h={hode} onMelding={() => setMelding(true)} vis={vis} />
    <Nokkeltall h={hode} tom={tom} />
    <KreverDeg h={hode} tom={tom} />
    <Faner h={hode} fane={fane} vis={vis} />
    <div role="region" aria-label={FANER.find(([k]) => k === fane)?.[1]} className="pa-root s360-fane">
      {faneData ? <FaneInnhold d={faneData} tom={tom} spillerId={hode.id} statsDel={statsDel} /> : <p className="forklar">—</p>}
    </div>
  </div>;

  return <div className="agn-s">
    {tilbake}
    {rail ? <div className="s360-arbeid"><Rail rail={rail} aktivId={hode.id} fane={fane} />{side}</div> : side}
    {melding && <SendMelding spillerId={hode.id} navn={hode.navn} onClose={() => setMelding(false)} />}
  </div>;
}
