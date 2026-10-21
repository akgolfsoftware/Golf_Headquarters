"use client";

/**
 * PlayerHQ Opptatt tid (/portal/planlegge/opptatt) — nytt design, pakke 17b (utkast 1, 16.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/plan-hjelpere.html, skjermen «Opptatt tid».
 * Handlingene er uendret: leggTilOpptattTid, endreOpptattTid og slettOpptattTid (bare egne avtaler).
 * Uka: egne avtaler, Google-kalenderen og øktene i planen (lib/portal-plan/opptatt-uke.ts).
 *
 * Avvik:
 *   - Uka kan blas med piler (utkastet viser bare én uke).
 *   - Google-avtaler vises som «Opptatt» også for spilleren selv, slik coachen ser dem.
 *   - Google-kortet viser kontoen og siste synk; koblingen endres i Meg › Innstillinger › Integrasjoner.
 *     «Begge veier» står bare når en kalender er satt til å sende øktene ut.
 *   - Skole fra skoleruta og gruppetreninger vises ikke her; de ligger i Plan.
 *   - Typen (skole, avtale osv.) beholdes når en avtale endres; nye avtaler lagres som «avtale».
 */
import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarClock, ChevronLeft, ChevronRight, Lock, Repeat, X } from "lucide-react";
import { endreOpptattTid, leggTilOpptattTid, slettOpptattTid, type OpptattInput } from "@/app/portal/kalender/opptatt-actions";
import type { FastAvtale, UkeDag } from "@/lib/portal-plan/opptatt-uke";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";
import "@/styles/playerhq-ny-plan-hjelpere.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";
import "@/styles/playerhq-ny-pakke5-skra.css";

export type PHOpptattAvtale = FastAvtale & { startISO: string; sluttISO: string; kind: string };
export type PHOpptattData = {
  ukeNr: number; ukeTekst: string; forrigeHref: string; nesteHref: string;
  dager: UkeDag[];
  avtaler: PHOpptattAvtale[];
  google: { epost: string; synket: string | null; beggeVeier: boolean; status: string } | null;
};

function tilLokal(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function Skjema({ avtale, lukk }: { avtale: PHOpptattAvtale | null; lukk: () => void }) {
  const router = useRouter();
  const naa = new Date();
  naa.setMinutes(0, 0, 0);
  naa.setHours(naa.getHours() + 1);
  const [tittel, setTittel] = useState(avtale?.tittel ?? "");
  const [fra, setFra] = useState(avtale ? tilLokal(avtale.startISO) : tilLokal(naa.toISOString()));
  const [til, setTil] = useState(avtale ? tilLokal(avtale.sluttISO) : tilLokal(new Date(naa.getTime() + 3_600_000).toISOString()));
  const [ukentlig, setUkentlig] = useState(avtale?.ukentlig ?? false);
  const [privat, setPrivat] = useState(avtale?.privat ?? false);
  const [feil, setFeil] = useState<string | null>(null);
  const [jobber, start] = useTransition();

  function kjor(f: () => Promise<{ ok: true } | { ok: false; feil: string }>) {
    setFeil(null);
    start(async () => {
      const r = await f();
      if (!r.ok) { setFeil(r.feil); return; }
      lukk();
      router.refresh();
    });
  }
  function lagre() {
    const startD = new Date(fra), sluttD = new Date(til);
    if (!tittel.trim()) { setFeil("Skriv hva det er"); return; }
    if (Number.isNaN(startD.getTime()) || Number.isNaN(sluttD.getTime())) { setFeil("Velg fra og til"); return; }
    // Typen valideres på serveren (zod); en ukjent verdi avvises der.
    const input: OpptattInput = {
      title: tittel.trim(), startAt: startD.toISOString(), endAt: sluttD.toISOString(),
      kind: (avtale?.kind ?? "AVTALE") as OpptattInput["kind"], recurring: ukentlig ? "WEEKLY" : "NONE", isPrivate: privat,
    };
    kjor(() => (avtale ? endreOpptattTid(avtale.id, input) : leggTilOpptattTid(input)));
  }

  return <div className="phn-ark-kropp">
    <div className="phn-ark-topp">
      <h2 id="ph-opp-t">{avtale ? "Endre avtalen" : "Legg til opptatt tid"}</h2>
      <button type="button" className="phn-lukk" aria-label="Lukk" onClick={lukk}><X className="phn-ikon" aria-hidden /></button>
    </div>
    <label className="phn-felt">Hva<input value={tittel} maxLength={120} onChange={(e) => setTittel(e.target.value)} placeholder="For eksempel skole eller tannlege" /></label>
    <div className="ph-to-felt">
      <label className="phn-felt">Fra<input type="datetime-local" value={fra} onChange={(e) => setFra(e.target.value)} /></label>
      <label className="phn-felt">Til<input type="datetime-local" value={til} onChange={(e) => setTil(e.target.value)} /></label>
    </div>
    <div className="phn-felt"><span className="etikett">Gjentas</span>
      <div className="phn-valg" role="group" aria-label="Gjentas">
        <button type="button" aria-pressed={!ukentlig} onClick={() => setUkentlig(false)}>Én gang</button>
        <button type="button" aria-pressed={ukentlig} onClick={() => setUkentlig(true)}>Hver uke</button>
      </div>
    </div>
    <label className="ph-avkryss"><input type="checkbox" checked={privat} onChange={(e) => setPrivat(e.target.checked)} /><span>Privat: coachen ser bare «Opptatt»</span></label>
    {feil && <div className="ph-melding" role="alert">{feil}</div>}
    <div className="phn-ark-fot">
      <button type="button" className="phn-knapp pri stor" disabled={jobber} onClick={lagre}>{jobber ? "Lagrer …" : "Lagre"}</button>
      {avtale && <button type="button" className="phn-knapp sek stor" disabled={jobber} onClick={() => kjor(() => slettOpptattTid(avtale.id))}>Slett avtalen</button>}
    </div>
  </div>;
}

export function PHOpptattTid({ data }: { data: PHOpptattData }) {
  const ark = useRef<HTMLDialogElement>(null);
  const [valgt, setValgt] = useState<PHOpptattAvtale | null>(null);
  const [nokkel, setNokkel] = useState(0);
  function aapne(a: PHOpptattAvtale | null) {
    setValgt(a);
    setNokkel((n) => n + 1);
    ark.current?.showModal();
  }
  const lukk = () => ark.current?.close();
  const g = data.google;

  return <div className="phn phn-meg phn-ph phn-skra">
    <SkraTopp
      lav
      etikett="Plan"
      bilde="/images/playerhq/spill-bane.jpg" bildePosisjon="50% 50%"
      overlinje={<>Plan · uke {data.ukeNr}</>}
      tittel={<>Opptatt tid</>}
      handling={<span className="skra-tilbake"><Link className="tilbake" href="/portal/planlegge"><ChevronLeft size={18} aria-hidden />Plan</Link></span>}
    />
    <SkraFlyt lav><div className="side">
    <p className="ingress">Når du ikke kan trene. Coachen ser at tiden er opptatt, aldri hva det er når avtalen er privat.</p>
    <div className="to-del">
      <section className="phn-seksjon" aria-labelledby="ph-opp-uka">
        <div className="phn-sek-topp">
          <h2 id="ph-opp-uka">Uka</h2>
          <span className="ph-ukepil"><span className="phn-kilde">{data.ukeTekst}</span>
            <span className="phn-pil"><Link href={data.forrigeHref} aria-label="Forrige uke"><ChevronLeft size={18} aria-hidden /></Link><Link href={data.nesteHref} aria-label="Neste uke"><ChevronRight size={18} aria-hidden /></Link></span>
          </span>
        </div>
        <div className="ph-uke">
          {data.dager.map((d) => <div key={d.kort} className="ph-dag">
            <b className={d.idag ? "idag" : undefined}>{d.kort}<small>{d.dato}</small></b>
            {d.blokker.map((b, i) => <div key={i} className={`ph-blokk ${b.type}${b.akse ? ` ${b.akse.toLowerCase()}` : ""}`}>{b.tekst}</div>)}
          </div>)}
        </div>
        <div className="phn-lg-rad">
          <span className="phn-lg"><i className="ph-lg-opptatt" />Opptatt</span>
          <span className="phn-lg"><i className="ph-lg-google" />Google</span>
          <span className="phn-lg"><i className="akse-slag" />Økter i planen</span>
        </div>
      </section>
      <div>
        <section className="phn-seksjon" aria-labelledby="ph-opp-faste">
          <div className="phn-sek-topp"><h2 id="ph-opp-faste">Faste avtaler</h2><span className="phn-kilde">{data.avtaler.length}</span></div>
          {data.avtaler.length === 0
            ? <div className="phn-kort dempet"><b className="phn-undertittel">Ingen opptatt tid</b><p className="phn-forklar">Legg inn skole og andre faste avtaler, så planlegger coachen rundt dem.</p></div>
            : <div className="ph-avtaler">{data.avtaler.map((a) => <button key={a.id} type="button" onClick={() => aapne(a)}>
              <span className="ph-ikonboks" aria-hidden>{a.privat ? <Lock size={18} /> : a.ukentlig ? <Repeat size={18} /> : <CalendarClock size={18} />}</span>
              <span><b>{a.tittel}</b><span className="phn-kilde">{a.under}</span></span>
              <ChevronRight size={20} aria-hidden />
            </button>)}</div>}
          <button type="button" className="phn-knapp pri" style={{ justifySelf: "start" }} onClick={() => aapne(null)}>Legg til opptatt tid</button>
        </section>
        <section className="phn-seksjon" aria-labelledby="ph-opp-google">
          <div className="phn-sek-topp"><h2 id="ph-opp-google">Google-kalender</h2></div>
          <div className="ph-avtaler">
            <Link href="/portal/meg/innstillinger/integrasjoner">
              <span className="ph-ikonboks" aria-hidden>G</span>
              {g
                ? <span><b>{g.status === "ACTIVE" ? (g.beggeVeier ? "Koblet, begge veier" : "Koblet") : "Koblingen må fornyes"}</b><span className="phn-kilde">{g.epost}{g.synket ? ` · synket ${g.synket}` : ""}</span></span>
                : <span><b>Ikke koblet</b><span className="phn-kilde">Koble til i Meg › Innstillinger</span></span>}
              {g && g.status === "ACTIVE" ? <span className="phn-pille ok"><i />På</span> : <ChevronRight size={20} aria-hidden />}
            </Link>
          </div>
          <p className="phn-kilde">Avtaler fra Google vises her som «Opptatt».{g?.beggeVeier ? " Øktene i planen legges i Google-kalenderen." : ""}</p>
        </section>
      </div>
    </div>
    <dialog ref={ark} className="phn-ark" aria-labelledby="ph-opp-t">
      <Skjema key={nokkel} avtale={valgt} lukk={lukk} />
    </dialog>
  </div></SkraFlyt></div>;
}
