"use client";

/**
 * AG-08 Spiller 360 i Skrå-drakten (bølge 1, pakke A2; skissen
 * https://claude.ai/artifact/NCP3fcTH2qNSYJtYVfWwNa seksjon 2, godkjent av Anders 22.10.2026).
 * Kilde: docs/design-system/utkast-skra/komponist/bolge-1.html. Byggeklosser: src/components/precision/skra/.
 *
 * Toppen: utslagsbildet, spillerens navn og fire tall (Kategori, HCP, Etterlevelse 4 uker, SG 30 dager).
 * Hovedkortet «Dette krever deg nå» med Send melding · Åpne Workbench · Start live · IUP-samtale.
 * Under: fanene Plan · Stats · Teknisk plan · Tester · IUP · Samtaler · Talent (bryter over to linjer,
 * ingen sidelengs rulling), og på PC en høyre kolonne med neste økt, avtale, plan og turnering.
 * Fanene er lenker (?fane=), så serveren henter bare data for fanen som er åpen. IUP-fanen og
 * IUP-samtale vises bare for aktive WANG- og Team Norway-medlemmer. Talent er bare for coach,
 * og hele /admin er coach og admin.
 *
 * Send melding bruker den eksisterende handlingen sendMeldingTilSpiller.
 * Mangler et tall, står «—».
 *
 * Avvik:
 *   - Snittkurven for brutto (forrige topp) står i Stats-fanen, ikke i toppen; skissen har fire andre tall.
 *   - «Dette krever deg nå» teller forslag i Innboks og en plan som slutter innen 14 dager.
 */
import Link from "next/link";
import { useState, useTransition } from "react";
import { ChevronLeft, X } from "lucide-react";
import { Avatar, Feil, Knapp, Laster, Varsel } from "@/components/admin/agencyos-ny/ny";
import { SkraFlyt, SkraHelt, SkraKort, SkraStat, SkraTom, SkraTopp, type SkraHandling } from "@/components/precision/skra/Skra";
import { sendMeldingTilSpiller } from "@/app/admin/(legacy)/messages/actions";
import { FANER, sg, type S360Fane } from "@/lib/admin-spiller/spiller360-visning";
import type { S360FaneData, S360Hode, S360RailSpiller } from "@/lib/admin-spiller/spiller360-typer";
import { AG08Iup, AG08Plan, AG08Samtaler, AG08Talent, AG08Tp } from "./AG08Faner";
import { AG08Stats } from "./AG08Stats";
import { AG08Tester } from "./AG08Tester";
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

const SKRA_BILDE = "/images/playerhq/slag-utslag.jpg";

/** Hovedkortet: det som krever coachen nå (forslag i Innboks, eller planen som snart slutter), med de fire handlingene. */
function KreverDeg({ h, tom, vis, onMelding }: { h: S360Hode; tom: boolean; vis: string; onMelding: () => void }) {
  const fornavn = h.navn.split(" ")[0];
  const planSnart = !tom && h.planSlutt && h.planSlutt.omDager >= 0 && h.planSlutt.omDager <= 14 ? h.planSlutt : null;
  const saker = tom ? [] : h.kreverDeg;
  const antall = saker.length + (planSnart ? 1 : 0);
  const tittel = saker[0]?.tittel
    ?? (planSnart ? `Planen slutter ${planSnart.omDager === 0 ? "i dag" : planSnart.omDager === 1 ? "i morgen" : `om ${planSnart.omDager} dager`}` : `Ingenting krever deg nå for ${fornavn}`);
  const meta = saker.length
    ? <>{saker[0]!.sub.toLocaleLowerCase("nb-NO")} · <Link className="s3s-helt-lenke" href={`/admin/innboks?filter=godkjenn&sak=plan:${saker[0]!.id}`}>{saker.length > 1 ? `Se alle ${saker.length} i Innboks` : "Se saken i Innboks"}</Link></>
    : planSnart ? `${planSnart.navn} · slutter ${planSnart.dato}` : "Ingen forslag venter og planen løper.";
  const handlinger: SkraHandling[] = [
    { tekst: "Send melding", onClick: onMelding },
    { tekst: "Åpne Workbench", href: `/admin/workbench/${h.id}`, sekundaer: true },
    { tekst: "Start live", href: "/admin/agencyos/live", sekundaer: true },
    ...(h.iup ? [{ tekst: "IUP-samtale", href: `/admin/spillere/${h.id}?fane=iup${vis}`, sekundaer: true }] : []),
  ];
  return <SkraHelt etikett="Dette krever deg nå" overlinje="Dette krever deg nå" tid={antall} tidEtter={antall === 1 ? " sak" : " saker"} tittel={tittel} meta={meta} handlinger={handlinger} />;
}

function Faner({ h, fane, vis }: { h: S360Hode; fane: S360Fane; vis: string }) {
  const faner = FANER.filter(([k]) => k !== "iup" || h.iup);
  return <nav className="s3s-faner" aria-label="Spiller 360">
    {faner.map(([k, l]) => <Link key={k} href={`/admin/spillere/${h.id}?fane=${k}${vis}`} scroll={false} aria-current={k === fane ? "page" : undefined}>{l}{k === "talent" && <span className="meta">Bare coach</span>}</Link>)}
  </nav>;
}

/** Høyre kolonne på PC, under fanen på mobil: neste økt, avtale, plan og turnering, og lenkene videre. */
function Side({ h, tom }: { h: S360Hode; tom: boolean }) {
  const okt = tom ? null : h.nesteOkt;
  const plan = tom ? null : h.planSlutt;
  const t = tom ? null : h.nesteTurnering;
  const dager = tom ? null : h.turneringOmDager;
  const naar = (n: number) => n === 0 ? "i dag" : n === 1 ? "i morgen" : `om ${n} dager`;
  return <aside className="s3s-side" aria-label="Om spilleren">
    <SkraKort tittel="Neste økt" lenke={{ href: `/admin/workbench/${h.id}`, tekst: "Workbench" }}>
      {okt ? <div className="s3s-fakta"><b className="num">{okt.klokke}</b><span><b>{okt.tittel}</b><span>{okt.dato} · {naar(okt.omDager)} · {okt.minutter} min</span></span></div>
        : <SkraTom>Ingen planlagte økter.</SkraTom>}
    </SkraKort>
    <SkraKort tittel="Avtale" meta={h.sisteBooking ? `Siste booking ${h.sisteBooking.dato}` : undefined}>
      {h.avtale ? <div className="s3s-fakta enkel"><span><b>{h.avtale.verdi} igjen</b><span>{h.avtale.hint.toLocaleLowerCase("nb-NO")}</span></span></div>
        : <SkraTom>Ingen coachingavtale.</SkraTom>}
    </SkraKort>
    <SkraKort tittel="Plan og turnering">
      <dl className="s3s-dl">
        <div><dt>Planen slutter</dt><dd>{plan ? <><b className="num">{plan.dato}</b><span>{plan.navn} · {plan.omDager < 0 ? "utløpt" : naar(plan.omDager)}</span></> : "—"}</dd></div>
        <div><dt>Neste turnering</dt><dd>{t ? <><b className="num">{t.dato}</b><span>{t.navn}{dager != null ? ` · ${naar(dager)}` : ""}</span></> : "—"}</dd></div>
      </dl>
    </SkraKort>
    <SkraKort tittel="Mer om spilleren" meta={h.grupper.length ? h.grupper.join(" · ") : undefined}>
      <nav aria-label="Mer om spilleren" className="s3s-lenker">
        <Link href={`/admin/spillere/${h.id}/rediger`}>Rediger profil</Link>
        <Link href={`/admin/spillere/${h.id}/profil-komplett`}>Komplett profil</Link>
        <Link href={`/admin/spillere/${h.id}/turneringsplan`}>Turneringsplan</Link>
        <Link href={`/admin/spillere/${h.id}/turnering-kobling`}>Turneringsprofil</Link>
        <Link href={`/admin/tester/tildel/${h.id}`}>Tildel test</Link>
      </nav>
    </SkraKort>
  </aside>;
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

  const h = hode;
  const alder = h.fodtAar ? new Date().getFullYear() - h.fodtAar : null;
  const under = [h.tilhorighet === "AK GOLF" ? "AK Golf" : "WANG · Team Norway", alder != null ? `${alder} år` : null].filter(Boolean).join(" · ");
  const pct = tom ? null : h.etterlevelse.pct;
  const sg30 = tom ? null : h.sg30.verdi;

  return <div className="agn-s s3s">
    <SkraTopp
      etikett="Spiller 360"
      bilde={SKRA_BILDE}
      bildePosisjon="50% 40%"
      overlinje={<Link href="/admin/spillere" className="s3s-tilbake"><ChevronLeft className="ikon" aria-hidden />Stall · Spiller</Link>}
      tittel={h.navn}
      ingress={under}
      tall={<>
        <SkraStat verdi={tom || !h.kategori ? "—" : h.kategori} etikett="Kategori" />
        <SkraStat verdi={tom ? "—" : h.hcp} etikett="HCP" />
        <SkraStat verdi={pct == null ? "—" : pct} enhet={pct == null ? undefined : "%"} etikett="Etterlevelse 4 uker" />
        <SkraStat verdi={sg(sg30)} etikett="SG 30 dager" ariaLabel={sg30 == null ? "SG siste 30 dager: ingen runder med SG" : `SG siste 30 dager: ${sg(sg30)}, ${h.sg30.runder} runder`} />
      </>}
    />
    <SkraFlyt>
      <KreverDeg h={h} tom={tom} vis={vis} onMelding={() => setMelding(true)} />
      <div className="s3s-to">
        <div className="s3s-hoved s3">
          {rail && <Rail rail={rail} aktivId={h.id} fane={fane} />}
          <SkraKort etikett="Faner">
            <Faner h={h} fane={fane} vis={vis} />
            <div role="region" aria-label={FANER.find(([k]) => k === fane)?.[1]} className="pa-root s360-fane">
              {faneData ? <FaneInnhold d={faneData} tom={tom} spillerId={h.id} statsDel={statsDel} /> : <p className="forklar">—</p>}
            </div>
          </SkraKort>
        </div>
        <Side h={h} tom={tom} />
      </div>
    </SkraFlyt>
    {melding && <SendMelding spillerId={h.id} navn={h.navn} onClose={() => setMelding(false)} />}
  </div>;
}
