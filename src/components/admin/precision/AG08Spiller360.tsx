"use client";

/**
 * AG-08 Spiller 360 i Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/agencyos/screens/AG-360.jsx, runde 27; IUP fra AG-08-IUP.jsx).
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
import { ClipboardList, Layers, Link2, MessagesSquare, Pencil, Play, Send } from "lucide-react";
import { FeilTilstand, Knapp, KnappLenke, LasterTilstand, Meta, Sidehode } from "@/components/precision/pa";
import { Ark } from "@/components/precision/pa-a4";
import { Initialer } from "@/components/precision/pa-a3";
import { Dempet, Etikett, FaneLenker, Liste, Rad, Seksjon, Verdi } from "@/components/precision/pa-spiller360";
import { sendMeldingTilSpiller } from "@/app/admin/(legacy)/messages/actions";
import { FANER, type S360Fane } from "@/lib/admin-spiller/spiller360-visning";
import type { S360FaneData, S360Hode, S360RailSpiller } from "@/lib/admin-spiller/spiller360-typer";
import { AG08Iup, AG08Plan, AG08Samtaler, AG08Talent, AG08Tp } from "./AG08Faner";
import { AG08Stats } from "./AG08Stats";
import { AG08Tester } from "./AG08Tester";
import { CircleAlert } from "lucide-react";

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

function SendMelding({ spillerId, navn, open, onClose }: { spillerId: string; navn: string; open: boolean; onClose: () => void }) {
  const [tekst, setTekst] = useState("");
  const [svar, setSvar] = useState<{ ok: boolean; tekst: string } | null>(null);
  const [pending, start] = useTransition();
  const lukk = () => { setSvar(null); onClose(); };
  const send = () => start(async () => {
    const r = await sendMeldingTilSpiller(spillerId, tekst);
    if (r?.ok) { setTekst(""); setSvar({ ok: true, tekst: "Meldingen er sendt." }); }
    else setSvar({ ok: false, tekst: r?.error ?? "Meldingen ble ikke sendt. Prøv igjen." });
  });
  return (
    <Ark open={open} onClose={lukk} kicker="Melding" title={`Til ${navn}`}
      footer={<><Knapp fullWidth icon={Send} iconName="send" loading={pending} loadingText="Sender …" disabled={!tekst.trim()} onClick={send}>Send</Knapp><Knapp variant="ghost" fullWidth onClick={lukk}>Lukk</Knapp></>}>
      <label className="a8-etikett">Melding
        <textarea className="a8-felt" value={tekst} onChange={(e) => { setTekst(e.target.value); setSvar(null); }} maxLength={4000} />
      </label>
      {svar && <p role="status" className="a8-dempet" style={{ color: svar.ok ? "var(--text-primary)" : "var(--text-secondary)" }}>{svar.tekst}</p>}
      <Meta>MELDINGEN GÅR I DIREKTETRÅDEN MELLOM DEG OG SPILLEREN</Meta>
    </Ark>
  );
}

function Spillerkort({ h, tom, onMelding, vis }: { h: S360Hode; tom: boolean; onMelding: () => void; vis: string }) {
  const meta = [h.kategori ? `KATEGORI ${h.kategori}` : "KATEGORI —", `HCP ${h.hcp}`, h.fodtAar ? `FØDT ${h.fodtAar}` : null, h.tilhorighet].filter(Boolean).join(" · ");
  return (
    <Seksjon k="Spiller" meta={h.grupper.length ? h.grupper.join(" · ").toUpperCase() : "INGEN GRUPPE"} gap={12}>
      <div className="a8-kort-hode">
        <Initialer navn={h.navn} size={48} />
        <span className="a8-kort-hode__tekst"><Meta>{meta}</Meta></span>
      </div>
      <Liste>
        <Rad><Etikett a="Etterlevelse 4 uker" sub={h.etterlevelse.kilde} /><Verdi>{tom || h.etterlevelse.pct == null ? "—" : `${h.etterlevelse.pct} %`}</Verdi></Rad>
        <Rad><Etikett a="Avtale" sub={h.avtale?.hint || "—"} /><Verdi>{h.avtale?.verdi ?? "—"}</Verdi></Rad>
        <Rad><Etikett a="Neste turnering" sub={h.nesteTurnering?.dato} /><Verdi>{h.nesteTurnering?.navn ?? "—"}</Verdi></Rad>
        <Rad><Etikett a="Siste booking" sub={h.sisteBooking?.tjeneste.toUpperCase()} /><Verdi>{h.sisteBooking?.dato ?? "—"}</Verdi></Rad>
      </Liste>
      <div className="a8-knapper">
        <Knapp size="sm" icon={Send} iconName="send" onClick={onMelding}>Send melding</Knapp>
        <KnappLenke size="sm" variant="secondary" icon={Layers} iconName="layers" href={`/admin/workbench/${h.id}`}>Åpne Workbench</KnappLenke>
        <KnappLenke size="sm" variant="secondary" icon={Play} iconName="play" href="/admin/agencyos/live">Start live</KnappLenke>
        <KnappLenke size="sm" variant="secondary" icon={MessagesSquare} iconName="messages-square" href={`/admin/spillere/${h.id}?fane=iup${vis}`}>IUP-samtale</KnappLenke>
      </div>
      <div className="a8-knapper">
        <KnappLenke size="sm" variant="ghost" icon={Pencil} iconName="pencil" href={`/admin/spillere/${h.id}/rediger`}>Rediger profil</KnappLenke>
        <KnappLenke size="sm" variant="ghost" icon={Link2} iconName="link" href={`/admin/spillere/${h.id}/turnering-kobling`}>Turneringsprofil</KnappLenke>
        <KnappLenke size="sm" variant="ghost" icon={ClipboardList} iconName="clipboard-list" href={`/admin/tester/tildel/${h.id}`}>Tildel test</KnappLenke>
      </div>
    </Seksjon>
  );
}

function KreverDeg({ h, tom }: { h: S360Hode; tom: boolean }) {
  const saker = tom ? [] : h.kreverDeg;
  return (
    <Seksjon k="Dette krever deg nå" meta={saker.length ? `${saker.length} SAKER` : "INGENTING"}>
      {!saker.length ? <Dempet>Ingenting venter.</Dempet> : (
        <div role="list" className="a8-liste">
          {saker.map((s) => (
            <Link key={s.id} role="listitem" href="/admin/innboks" className="a8-krav">
              <Etikett a={s.tittel} sub={`${s.sub} · ÅPNES I INNBOKS`} />
            </Link>
          ))}
        </div>
      )}
    </Seksjon>
  );
}

function Rail({ rail, aktivId, fane }: { rail: S360RailSpiller[]; aktivId: string; fane: S360Fane }) {
  return (
    <details className="pa-card a8-rail" open>
      <summary>Stallen · {rail.length}</summary>
      <nav aria-label="Bytt spiller" className="a8-rail__liste">
        {rail.map((r) => (
          <Link key={r.id} href={`/admin/spillere/${r.id}?vis=360&fane=${fane}`} className="a8-rail__rad" aria-current={r.id === aktivId ? "page" : undefined}>
            <span className="a8-rail__navn">{r.navn}</span>
            {r.sub && <Meta>{r.sub.toUpperCase()}</Meta>}
          </Link>
        ))}
      </nav>
    </details>
  );
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
  const navn = hode?.navn ?? "Spiller 360";

  const innhold = tilstand === "laster" ? <LasterTilstand text="Henter spilleren …" />
    : tilstand === "feil" || !hode ? <FeilTilstand icon={CircleAlert} title="Spilleren kunne ikke hentes" text="Ingen felt er endret. Prøv igjen." code="FEIL · SPILLER 360" />
    : <>
      <div className="a8-to">
        <Spillerkort h={hode} tom={tom} onMelding={() => setMelding(true)} vis={vis} />
        <KreverDeg h={hode} tom={tom} />
      </div>
      <FaneLenker label="Spiller 360" faner={FANER.map(([k, l]) => ({ href: `/admin/spillere/${hode.id}?fane=${k}${vis}`, navn: l, aktiv: k === fane }))} />
      <div role="region" aria-label={FANER.find(([k]) => k === fane)?.[1]} className="a8-stabel">
        {faneData ? <FaneInnhold d={faneData} tom={tom} spillerId={hode.id} statsDel={statsDel} /> : <Dempet>—</Dempet>}
      </div>
      <SendMelding spillerId={hode.id} navn={hode.navn} open={melding} onClose={() => setMelding(false)} />
    </>;

  const side = (
    <div className="a8-stabel">
      <Sidehode kicker="Stall · Spiller 360" title={navn} />
      {innhold}
    </div>
  );

  return (
    <div className="a8-side">
      {rail && hode ? <div className="a8-arbeid"><Rail rail={rail} aktivId={hode.id} fane={fane} />{side}</div> : side}
    </div>
  );
}
