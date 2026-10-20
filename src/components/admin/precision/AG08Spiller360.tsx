"use client";

/**
 * AG-08 Spiller 360 i nytt design (designbrevet 13.10.2026). Fasit:
 * docs/design-system/utkast-agencyos/stall.html, skjerm «AG-08 Spiller 360».
 * Toppkort, «Dette krever deg nå» og fanene er nye; innholdet i fanene bruker
 * de felles Spiller 360-delene (pa-spiller360), som har fått nytt utseende.
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
import { ChevronLeft, X } from "lucide-react";
import { Feil, Knapp, KnappLenke, Laster, Varsel } from "@/components/admin/agencyos-ny/ny";
import { Avatar } from "@/components/admin/agencyos-ny/ny";
import { sendMeldingTilSpiller } from "@/app/admin/(legacy)/messages/actions";
import { FANER, type S360Fane } from "@/lib/admin-spiller/spiller360-visning";
import type { S360FaneData, S360Hode, S360RailSpiller } from "@/lib/admin-spiller/spiller360-typer";
import { AG08Iup, AG08Plan, AG08Samtaler, AG08Talent, AG08Tp } from "./AG08Faner";
import { AG08Stats } from "./AG08Stats";
import { AG08Tester } from "./AG08Tester";
import "@/styles/agencyos-ny-stall.css";

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

function Toppkort({ h, tom, onMelding, vis }: { h: S360Hode; tom: boolean; onMelding: () => void; vis: string }) {
  const alder = h.fodtAar ? new Date().getFullYear() - h.fodtAar : null;
  return <div className="s360-topp">
    <div className="st">
      <div className="navn-rad">
        <Avatar navn={h.navn} stor />
        <span><b className="navn">{h.navn}</b>
          <span className="chips-lite">
            <span className="kat">Kategori {h.kategori ?? "—"}</span>
            {h.grupper.map((g) => <span key={g} className="pille noy"><i aria-hidden />{g}</span>)}
            {alder != null && <span className="pille noy"><i aria-hidden />Født {h.fodtAar}</span>}
            <span className="kilde">{h.tilhorighet}</span>
          </span>
        </span>
      </div>
      <div className="fakta-rad">
        <div><b>{tom || h.etterlevelse.pct == null ? "—" : `${h.etterlevelse.pct} %`}</b><span>etterlevelse 4 uker</span></div>
        <div><b>{h.hcp}</b><span>HCP</span></div>
        <div><b>{h.avtale?.verdi ?? "—"}</b><span>{h.avtale?.hint || "avtale"}</span></div>
      </div>
      <p className="kilde">Neste turnering: {h.nesteTurnering ? `${h.nesteTurnering.navn} · ${h.nesteTurnering.dato}` : "—"} · Siste booking: {h.sisteBooking ? `${h.sisteBooking.dato} · ${h.sisteBooking.tjeneste}` : "—"}</p>
      <div className="knapper">
        <Knapp onClick={onMelding}>Send melding</Knapp>
        <KnappLenke href={`/admin/workbench/${h.id}`}>Åpne Workbench</KnappLenke>
        <KnappLenke href="/admin/agencyos/live">Start live</KnappLenke>
        <KnappLenke href={`/admin/spillere/${h.id}?fane=iup${vis}`}>IUP-samtale</KnappLenke>
      </div>
      <div className="knapper">
        <KnappLenke variant="spok" href={`/admin/spillere/${h.id}/rediger`}>Rediger profil</KnappLenke>
        <KnappLenke variant="spok" href={`/admin/spillere/${h.id}/profil-komplett`}>Komplett profil</KnappLenke>
        <KnappLenke variant="spok" href={`/admin/spillere/${h.id}/turneringsplan`}>Turneringsplan</KnappLenke>
        <KnappLenke variant="spok" href={`/admin/spillere/${h.id}/turnering-kobling`}>Turneringsprofil</KnappLenke>
        <KnappLenke variant="spok" href={`/admin/tester/tildel/${h.id}`}>Tildel test</KnappLenke>
      </div>
    </div>
  </div>;
}

function KreverDeg({ h, tom }: { h: S360Hode; tom: boolean }) {
  const saker = tom ? [] : h.kreverDeg;
  if (!saker.length) return <div className="kort dempet"><b className="undertittel">Dette krever deg nå</b><p className="forklar">Ingenting venter.</p></div>;
  return <div className="krever">
    <b>Dette krever deg nå</b>
    <ul>{saker.map((s) => <li key={s.id}><Link href="/admin/innboks" className="krever-lenke">{s.tittel}</Link> <span className="kilde">{s.sub}</span></li>)}</ul>
  </div>;
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

  const side = <div className="s360-stabel">
    <Toppkort h={hode} tom={tom} onMelding={() => setMelding(true)} vis={vis} />
    <KreverDeg h={hode} tom={tom} />
    <nav className="faner" aria-label="Spiller 360">
      {FANER.map(([k, l]) => <Link key={k} href={`/admin/spillere/${hode.id}?fane=${k}${vis}`} scroll={false} aria-current={k === fane ? "page" : undefined}>{l}</Link>)}
    </nav>
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
