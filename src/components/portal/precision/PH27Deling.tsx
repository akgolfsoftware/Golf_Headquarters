"use client";

/**
 * PH-27 Deling i nytt design: hvem som ser profilen, hva de ser, og «Trekk tilgang» med rust
 * bekreftelse. Under 16 viser skjermen at deling venter på forelderen, med frist (D-63).
 * Fasit: docs/design-system/utkast-playerhq/meg.html (utkast 1, skjermene «PH-27 Deling» og
 * «Deling under 16»). Stil: src/styles/playerhq-ny-meg.css.
 *
 * Team Norway har ett nivå (beslutning 22.10, #1614): ingen brytere, bare navngitt deling av hele IUP-en.
 * For andre organisasjoner har samtykket to nivåer som før (TnSamtykkeSide): «Tester og resultater» og
 * «Komplett profil». Samme server-handlinger og samme kaskade: Komplett profil løfter testene med
 * seg, og av på testene slår alt av. Under 16 kan spilleren trekke, men ikke slå på selv.
 *
 * Avvik:
 *   - 20.10: tegningens kolonner er byttet (Hvem har tilgang til venstre, Del med en trener og Det treneren ser til høyre).
 *   - 20.10: skjemaet for trenerens e-post ligger fortsatt på /portal/meg/deling; «Send på nytt» og «Trekk tilbake» for navngitte trenere finnes ikke som handling.
 *   - Eldre avvik, fra 14.10:
 *   - «Innsyn er alt» stemmer ikke med datamodellen: deling har to nivåer per organisasjon. Skjermen
 *     viser nivåene og hva hvert nivå gir.
 *   - «Del med trener» åpner den navngitte trenerdelingen (/portal/meg/deling), som eier lenken og
 *     domenesjekken (@wang.no, @golfforbundet.no, sju dager). Skjemaet er ikke flyttet hit.
 *   - «Venter på deg» (forespørsel fra trener) er ikke med: appen har ingen forespørsler fra trenere.
 *     WANGs testforespørsel vises med sin egen komponent under.
 *   - Under 16: «Send påminnelse» og «Endre forelderens e-post» er ikke med (ingen handling finnes).
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-27 og PH-27-U16.
 */
import { useRef, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, ShieldAlert, Users } from "lucide-react";
import { initialer } from "@/lib/portal/initialer";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";
import "@/styles/playerhq-ny-pakke5-skra.css";

export type PH27Organisasjon = { gruppeId: string; navn: string; testerOgResultater: boolean; komplettProfil: boolean };
export type PH27Navngitt = { id: string; epost: string; gruppeNavn: string; status: "AKTIV" | "VENTER"; dato: string };
export type PH27Data = {
  organisasjoner: PH27Organisasjon[];
  coach: { navn: string; program: string } | null;
  navngitte: PH27Navngitt[];
  foreldre: number;
  krevesForesatt: boolean;
  /** Bare når forelderen ikke har godkjent: frist og dager igjen. */
  venter: { dagerIgjen: number; frist: string; opprettet: string } | null;
};
type SettSamtykke = (scope: string, gruppeId: string, gitt: boolean) => Promise<{ ok: true } | { ok: false; feil: string }>;

const erTn = (navn: string) => /team norway/i.test(navn);

function Bryter({ paa, tittel, kilde, onChange, laast }: { paa: boolean; tittel: string; kilde: string; onChange: (v: boolean) => void; laast: boolean }) {
  return <div className="bryter-rad">
    <span><b>{tittel}</b><span className="phn-kilde">{kilde}</span></span>
    <button type="button" className="bryter" role="switch" aria-checked={paa} aria-label={tittel} disabled={laast} onClick={() => onChange(!paa)} />
  </div>;
}

export function PH27Deling({ data, settSamtykke, ekstra }: { data: PH27Data; settSamtykke: SettSamtykke; ekstra?: ReactNode }) {
  const [orgs, setOrgs] = useState(data.organisasjoner);
  const [feil, setFeil] = useState<string | null>(null);
  const [trekk, setTrekk] = useState<PH27Organisasjon | null>(null);
  const [pending, start] = useTransition();
  const dialog = useRef<HTMLDialogElement>(null);

  const deler = orgs.filter((o) => o.testerOgResultater || o.komplettProfil).length;
  const antall = deler + (data.coach ? 1 : 0) + data.navngitte.filter((n) => n.status === "AKTIV").length;

  function endre(gruppeId: string, felt: "testerOgResultater" | "komplettProfil", ny: boolean) {
    if (pending) return;
    if (data.krevesForesatt && ny) return;
    setFeil(null);
    const forrige = orgs;
    setOrgs((prev) => prev.map((o) => {
      if (o.gruppeId !== gruppeId) return o;
      if (felt === "komplettProfil" && ny) return { ...o, komplettProfil: true, testerOgResultater: true };
      if (felt === "testerOgResultater" && !ny) return { ...o, testerOgResultater: false, komplettProfil: false };
      return { ...o, [felt]: ny };
    }));
    const kall: [string, boolean][] = felt === "komplettProfil"
      ? ny ? [["TEST_RESULTATER", true], ["STATS", true], ["KOMPLETT_PROFIL", true]] : [["KOMPLETT_PROFIL", false]]
      : ny ? [["TEST_RESULTATER", true], ["STATS", true]] : [["TEST_RESULTATER", false], ["STATS", false], ["KOMPLETT_PROFIL", false]];
    start(async () => {
      for (const [scope, gitt] of kall) {
        try {
          const svar = await settSamtykke(scope, gruppeId, gitt);
          if (!svar.ok) { setOrgs(forrige); setFeil(svar.feil); return; }
        } catch { setOrgs(forrige); setFeil("Kunne ikke lagre. Prøv igjen."); return; }
      }
    });
  }

  return <div className="phn phn-meg phn-skra">
    <SkraTopp
      lav
      etikett="Plan"
      bilde="/images/playerhq/tek-video.jpg" bildePosisjon="50% 50%"
      overlinje={<>Meg · deling</>}
      tittel={<>Deling</>}
      handling={<span className="skra-tilbake"><Link className="tilbake" href="/portal/meg"><ChevronLeft size={18} aria-hidden />Meg</Link></span>}
    />
    <SkraFlyt lav><div className={`side${data.krevesForesatt ? " smal" : ""}`}>
    <p className="phn-forklar">Du bestemmer hvem som ser testene og resten av PlayerHQ.</p>

    {data.venter && <>
      <div className="u16-merke" role="status">
        <ShieldAlert size={22} aria-hidden />
        <span><b>Venter på forelder</b><span className="phn-forklar">Du er under 16. Deling og opptak er sperret til forelderen din har godkjent.</span></span>
      </div>
      <div className="phn-kort">
        <div className="phn-hoved"><strong>{data.venter.dagerIgjen}</strong><span className="phn-forklar">{data.venter.dagerIgjen === 1 ? "dag" : "dager"} igjen til forelderen må godkjenne</span></div>
        <div className="stolpe" aria-hidden><span style={{ width: `${Math.round((7 - Math.min(7, data.venter.dagerIgjen)) / 7 * 100)}%` }} /></div>
        <p className="phn-kilde">Kontoen ble opprettet {data.venter.opprettet}. Godkjenner ikke forelderen innen {data.venter.frist}, låses kontoen til godkjenningen kommer.</p>
      </div>
    </>}

    <div className="to-del">
      <div>
        <section className="phn-seksjon" aria-labelledby="del-tilgang">
          <div className="phn-sek-topp"><h2 id="del-tilgang">Hvem har tilgang</h2></div>
          {data.coach && <article className="tilgang">
            <div className="tilgang-topp">
              <span className="avatar" aria-hidden>{initialer(data.coach.navn)}</span>
              <span><b>{data.coach.navn}</b><span className="phn-kilde">AK-coach · {data.coach.program}</span></span>
              <span className="phn-pille ok"><i />Coach</span>
            </div>
            <p className="phn-forklar">Endrer planen direkte. Du kan angre det coachen endrer.</p>
          </article>}
          {orgs.map((o) => {
            const paa = o.testerOgResultater || o.komplettProfil;
            return <article key={o.gruppeId} className="tilgang">
              <div className="tilgang-topp">
                <span className={`avatar ${erTn(o.navn) ? "tn" : "wang"}`} aria-hidden>{erTn(o.navn) ? "TN" : initialer(o.navn).slice(0, 1)}</span>
                <span><b>{o.navn}</b><span className="phn-kilde">Trenerne i gruppa di</span></span>
                <span className="gruppe-merke"><Users size={14} aria-hidden />Gruppe</span>
              </div>
              {erTn(o.navn) ? (
                // Team Norway har ett delingsnivå (beslutning 22.10, #1614): treneren ser hele IUP-en når du deler med en navngitt trener.
                <div className="boks" style={{ display: "grid", gap: 4, padding: "12px 14px" }}>
                  <p className="phn-forklar">Team Norway-trenerne ser hele IUP-en din når du deler med en navngitt trener. Uten deling ser de bare navn, klubb, fødselsår og WAGR-plass.</p>
                  <Link className="phn-lenke" href="/portal/meg/deling">Del med en Team Norway-trener</Link>
                </div>
              ) : <div className="boks">
                <Bryter paa={o.testerOgResultater} tittel="Tester og resultater" kilde="Testresultater, turneringer og statistikk" laast={pending || (data.krevesForesatt && !o.testerOgResultater)} onChange={(v) => endre(o.gruppeId, "testerOgResultater", v)} />
                <Bryter paa={o.komplettProfil} tittel="Komplett profil" kilde="I tillegg plan, TrackMan, analyse og fremgang" laast={pending || (data.krevesForesatt && !o.komplettProfil)} onChange={(v) => endre(o.gruppeId, "komplettProfil", v)} />
              </div>}
              {data.krevesForesatt && !erTn(o.navn) && <p className="phn-kilde">Under 16 år: forelderen godkjenner deling i foreldreportalen. Å trekke tilbake kan du alltid gjøre selv.</p>}
              {paa && <div className="phn-knapper"><button type="button" className="phn-knapp sek" disabled={pending} onClick={() => { setTrekk(o); dialog.current?.showModal(); }}>Trekk tilgang</button></div>}
            </article>;
          })}
          {!data.coach && orgs.length === 0 && <div className="phn-kort dempet"><p className="phn-forklar">Ingen klubb, krets eller forbund har tilgang til profilen din. Blir du tatt inn i en satsing, dukker organisasjonen opp her, og du bestemmer selv hva de får se.</p></div>}
          <div className="phn-meldinger" aria-live="polite">{(pending || feil) && <p className="phn-melding" role={feil ? "alert" : "status"}>{feil ?? "Lagrer …"}</p>}</div>
        </section>
        {ekstra}
      </div>

      <div>
        <div className="phn-kort">
          <div className="phn-hoved"><strong>{antall}</strong><span className="phn-forklar">ser profilen din</span></div>
          <p className="phn-kilde">{data.foreldre > 0 ? `Pluss ${data.foreldre === 1 ? "forelderen" : "foreldrene"} din${data.foreldre === 1 ? "" : "e"}.` : "Ingen forelder er koblet til."}</p>
        </div>
        <section className="del-trener" aria-labelledby="del-trener-t">
          <h2 id="del-trener-t">Del med en trener</h2>
          <p className="phn-forklar">Bare adresser som slutter på @wang.no eller @golfforbundet.no. Lenken gjelder i sju dager. Er du under 16, må en forelder godkjenne først.</p>
          {data.venter
            ? <><button type="button" className="phn-knapp pri stor" disabled>Del med trener</button><p className="phn-kilde">Du kan dele med en trener når forelderen din har godkjent.</p></>
            : <Link className="phn-knapp pri stor" href="/portal/meg/deling">Del med trener</Link>}
        </section>
        <div className="innsyn-alt">
          <b>Det treneren ser</b>
          <ul>
            {(orgs.length === 0 || orgs.some((o) => !erTn(o.navn))) && <>
              <li><b>Tester og resultater:</b> testresultater, turneringer og rundestatistikk</li>
              <li><b>Komplett profil:</b> i tillegg treningsplan og økter, TrackMan, analyse og fremgang</li>
            </>}
            {orgs.some((o) => erTn(o.navn)) && <li><b>Team Norway:</b> hele IUP-en når du deler med en navngitt trener, ellers bare navn, klubb, fødselsår og WAGR-plass</li>}
          </ul>
        </div>
        {data.navngitte.length > 0 && <section className="phn-seksjon" aria-labelledby="del-navngitt">
          <div className="phn-sek-topp"><h2 id="del-navngitt">Navngitte trenere</h2></div>
          {data.navngitte.map((n) => <article key={n.id} className="tilgang">
            <div className="tilgang-topp">
              <span className={`avatar ${erTn(n.gruppeNavn) ? "tn" : "wang"}`} aria-hidden>{initialer(n.epost.split("@")[0]?.replace(/[._-]/g, " ") ?? "")}</span>
              <span><b>{n.epost}</b><span className="phn-kilde">{n.gruppeNavn} · {n.status === "AKTIV" ? `delt ${n.dato}` : `lenken gjelder til ${n.dato}`}</span></span>
              <span className={`phn-pille ${n.status === "AKTIV" ? "ok" : "noy"}`}><i />{n.status === "AKTIV" ? "Ser profilen" : "Ikke åpnet"}</span>
            </div>
          </article>)}
        </section>}
      </div>
    </div>

    <dialog ref={dialog} className="phn-ark dialog" role="alertdialog" aria-labelledby="trekk-tittel" onClose={() => setTrekk(null)}>
      <div className="phn-ark-kropp">
        <h2 id="trekk-tittel">Trekke tilgangen til {trekk?.navn ?? "gruppa"}?</h2>
        <p className="phn-forklar">Trenerne i {trekk?.navn ?? "gruppa"} ser ingenting fra deg lenger, med en gang. Du kan dele igjen senere.</p>
        <div className="phn-knapper">
          <button type="button" className="phn-knapp rust stor" onClick={() => { if (trekk) endre(trekk.gruppeId, "testerOgResultater", false); dialog.current?.close(); }}>Trekk tilgang</button>
          <button type="button" className="phn-knapp sek stor" onClick={() => dialog.current?.close()}>Avbryt</button>
        </div>
      </div>
    </dialog>
  </div></SkraFlyt></div>;
}
