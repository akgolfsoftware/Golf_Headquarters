"use client";

/**
 * PH-24 Meg › Helse og fravær i nytt design: dager borte siste fire uker, registrert fravær og
 * Ytelsesbilde (søvn, energi, mat). Helsetall er særlige kategorier (GDPR art. 9): skjermen vises
 * bare med samtykke, og lagring går som før via lagreHelseEntry, som sjekker samtykket selv.
 * Fasit: docs/design-system/utkast-playerhq/meg.html (utkast 1, skjermen «Helse og fravær»).
 * Stil: src/styles/playerhq-ny-meg.css.
 *
 * Avvik:
 *   - «Registrer fravær» er ikke med: appen har ingen lagring av fravær fra spilleren. Fravær som
 *     coachen har lagt inn, vises. I stedet står «Logg søvn og puls», som lagrer dagsloggen.
 *   - Energi og mat vises som «—»: de registreres ikke i appen.
 *   - Hvilepuls, HRV, belastning og fysisk form er beholdt fra forrige versjon.
 *   - Teksten om hvem som ser registreringene, sier coachen og trenere med deling, uten navn.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-24-HELSE.
 */
import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, HeartPulse, Plane, Thermometer, X } from "lucide-react";
import { formaterTall } from "@/lib/format-tall";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";
import "@/styles/playerhq-ny-pakke5-skra.css";

export type PH24Fravaer = { id: string; tittel: string; periode: string; type: "skade" | "sykdom" | "annet"; status: "Pågår" | "Over" | "Planlagt" };

export type PH24HelseData = {
  samtykke: boolean;
  dagerBorte: number;
  fravaer: PH24Fravaer[];
  sistLogget: string | null;
  sovnSnitt: number | null;
  sovnAntall: number;
  siste: { restingHr: number | null; hrv: number | null } | null;
  belastningPst: number | null;
  fysScore: number | null;
  initial: { date: string; restingHr: number | null; hrv: number | null; sleepHours: number | null; weightKg: number | null; notes: string | null };
};

type Lagre = (input: { date: string; restingHr: number | null; hrv: number | null; sleepHours: number | null; weightKg: number | null; notes: string | null }) => Promise<void>;

const tallEllerNull = (s: string) => {
  const v = s.replace(",", ".").trim();
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export function PH24Helse({ data, lagre }: { data: PH24HelseData; lagre: Lagre }) {
  const router = useRouter();
  const ark = useRef<HTMLDialogElement>(null);
  const i = data.initial;
  const [dato, setDato] = useState(i.date);
  const [sovn, setSovn] = useState(i.sleepHours != null ? String(i.sleepHours).replace(".", ",") : "");
  const [puls, setPuls] = useState(i.restingHr != null ? String(i.restingHr) : "");
  const [hrv, setHrv] = useState(i.hrv != null ? String(i.hrv) : "");
  const [vekt, setVekt] = useState(i.weightKg != null ? String(i.weightKg).replace(".", ",") : "");
  const [notat, setNotat] = useState(i.notes ?? "");
  const [melding, setMelding] = useState<{ ok: boolean; tekst: string } | null>(null);
  const [pending, start] = useTransition();

  if (!data.samtykke) {
    return <div className="phn phn-meg"><div className="side smal">
      <div className="topp">
        <Link className="tilbake" href="/portal/meg"><ChevronLeft size={18} aria-hidden />Meg</Link>
        <div><div className="phn-dato">Meg · helse og fravær</div><h1 className="phn-tittel">Helse og fravær</h1></div>
      </div>
      <div className="phn-kort dempet">
        <b className="phn-undertittel">Helse-loggen er slått av</b>
        <p className="phn-forklar">Søvn, puls, vekt og skader er sensitive opplysninger, så vi lagrer dem ikke før du sier ja. Treningen din går som før uansett hva du velger.</p>
        <Link className="phn-knapp pri" href="/portal/meg/innstillinger/personvern" style={{ justifySelf: "start" }}>Slå på i Samtykker</Link>
      </div>
    </div></div>;
  }

  function lagreLogg(e: React.FormEvent) {
    e.preventDefault();
    setMelding(null);
    start(async () => {
      try {
        await lagre({ date: dato, sleepHours: tallEllerNull(sovn), restingHr: tallEllerNull(puls), hrv: tallEllerNull(hrv), weightKg: tallEllerNull(vekt), notes: notat.trim() || null });
        ark.current?.close();
        setMelding({ ok: true, tekst: "Dagsloggen er lagret." });
        router.refresh();
      } catch { setMelding({ ok: false, tekst: "Kunne ikke lagre. Sjekk tallene og prøv igjen." }); }
    });
  }

  return <div className="phn phn-meg phn-skra">
    <SkraTopp
      lav
      etikett="Meg"
      bilde="/images/playerhq/fys-styrke.jpg" bildePosisjon="50% 50%"
      overlinje={<>Meg · helse og fravær</>}
      tittel={<>Helse og fravær</>}
      handling={<span className="skra-tilbake"><Link className="tilbake" href="/portal/meg"><ChevronLeft size={18} aria-hidden />Meg</Link></span>}
    />
    <SkraFlyt lav><div className="side">

    <div className="to-del">
      <div>
        <div className="phn-kort">
          <div className="phn-hoved"><strong>{data.dagerBorte}</strong><span className="phn-forklar">{data.dagerBorte === 1 ? "dag" : "dager"} borte de siste 4 ukene</span></div>
          <p className="phn-kilde">{data.fravaer.length ? "Fra fraværet som er registrert." : "Ingen skade eller sykdom registrert."}</p>
        </div>
        <section className="phn-seksjon" aria-labelledby="helse-reg">
          <div className="phn-sek-topp"><h2 id="helse-reg">Registrert</h2></div>
          {data.fravaer.length
            ? <ul className="fravaer">{data.fravaer.map((f) => <li key={f.id}>
              <span className="ikonboks" aria-hidden>{f.type === "skade" ? <HeartPulse size={18} /> : f.type === "sykdom" ? <Thermometer size={18} /> : <Plane size={18} />}</span>
              <span><b>{f.tittel}</b><span className="phn-kilde">{f.periode}</span></span>
              <span className={`phn-pille ${f.status === "Over" ? "ok" : f.status === "Pågår" ? "vent" : "noy"}`}><i />{f.status}</span>
            </li>)}</ul>
            : <p className="phn-forklar">Ingenting registrert.</p>}
        </section>
        <div className="phn-meldinger" aria-live="polite">{melding && <p className="phn-melding" role={melding.ok ? "status" : "alert"}>{melding.tekst}</p>}</div>
        <div className="phn-knapper"><button type="button" className="phn-knapp pri" onClick={() => { setMelding(null); ark.current?.showModal(); }}>Logg søvn og puls</button></div>
        <p className="phn-kilde">Coachen din ser det du registrerer her. Trenere du deler med, ser det også.</p>
      </div>

      <div>
        <section className="phn-seksjon" aria-labelledby="helse-yb">
          <div className="phn-sek-topp"><h2 id="helse-yb">Ytelsesbilde</h2><span className="phn-pille ok"><i />Samtykke gitt</span></div>
          <div className="ytelse">
            <div><span>Søvn</span><b>{data.sovnSnitt != null ? formaterTall(data.sovnSnitt, 1, true) : "—"}{data.sovnSnitt != null && <small>t</small>}</b></div>
            <div><span>Energi</span><b>—</b></div>
            <div><span>Mat</span><b>—</b></div>
          </div>
          <p className="phn-kilde">{data.sovnAntall ? `Søvn er snitt siste 7 dager, ${data.sovnAntall} ${data.sovnAntall === 1 ? "logg" : "logger"}.` : "Ingen søvn logget siste 7 dager."} Energi og mat registreres ikke ennå.</p>
          <div className="ytelse">
            <div><span>Hvilepuls</span><b>{data.siste?.restingHr ?? "—"}</b></div>
            <div><span>HRV</span><b>{data.siste?.hrv ?? "—"}</b></div>
            <div><span>Belastning</span><b>{data.belastningPst != null ? `${data.belastningPst}` : "—"}{data.belastningPst != null && <small>%</small>}</b></div>
          </div>
          <p className="phn-kilde">{data.sistLogget ? `Hvilepuls og HRV fra siste logg, ${data.sistLogget}.` : "Ingen dagslogg ennå."} Belastning er siste uke mot snittet for fire uker.{data.fysScore != null ? ` Fysisk form fra testene: ${data.fysScore}.` : ""}</p>
        </section>
        <div className="phn-kort dempet">
          <b className="phn-undertittel">Hvorfor vi spør</b>
          <p className="phn-forklar">Søvn, puls og fravær hjelper coachen å se når belastningen bør ned. Du kan slå helse-loggen av i Samtykker.</p>
          <Link className="lenke" href="/portal/meg/innstillinger/personvern">Samtykker</Link>
        </div>
      </div>
    </div>

    <dialog ref={ark} className="phn-ark" aria-labelledby="helse-ark-tittel" onClick={(e) => { if (e.target === ark.current) ark.current?.close(); }}>
      <form className="phn-ark-kropp" onSubmit={lagreLogg}>
        <div className="phn-ark-topp"><h2 id="helse-ark-tittel">Logg søvn og puls</h2><button type="button" className="phn-lukk" aria-label="Lukk" onClick={() => ark.current?.close()}><X size={20} aria-hidden /></button></div>
        <label className="phn-felt">Dato<input type="date" value={dato} onChange={(e) => setDato(e.target.value)} required /></label>
        <label className="phn-felt">Søvn i timer<input inputMode="decimal" value={sovn} onChange={(e) => setSovn(e.target.value)} placeholder="7,5" /></label>
        <label className="phn-felt">Hvilepuls<input inputMode="numeric" value={puls} onChange={(e) => setPuls(e.target.value)} placeholder="slag per minutt" /></label>
        <label className="phn-felt">HRV<input inputMode="numeric" value={hrv} onChange={(e) => setHrv(e.target.value)} placeholder="ms" /></label>
        <label className="phn-felt">Vekt<input inputMode="decimal" value={vekt} onChange={(e) => setVekt(e.target.value)} placeholder="kg" /></label>
        <label className="phn-felt">Notat<textarea rows={2} value={notat} onChange={(e) => setNotat(e.target.value)} maxLength={500} placeholder="Kort, for coachen" /></label>
        <div className="phn-ark-fot"><button type="submit" className="phn-knapp pri stor" disabled={pending}>{pending ? "Lagrer …" : "Lagre"}</button></div>
      </form>
    </dialog>
  </div></SkraFlyt></div>;
}
