"use client";

/**
 * PlayerHQ «Skriv til oss» og «Sendt» (/portal/meg/help/kontakt) — nytt design, pakke 15 (utkast 1, 16.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/hjelp.html, skjermene «Skriv til oss» og «Sendt».
 * Ett skjema for spørsmål, feil, forslag og ros (sendSkrivTilOss). Kontakt og Tilbakemelding er slått sammen;
 * /portal/meg/feedback sender hit med «Forslag» valgt.
 *
 * Avvik:
 *   - «Vi legger ved siden du var på, appversjon og enhet» vises ikke: appen sender bare siden du kom fra
 *     (?fra=), ikke versjon eller enhet.
 *   - Ingen svartid lovet (vedtak: ikke før Jarvis er i drift).
 */
import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, ChevronLeft } from "lucide-react";
import { sendSkrivTilOss } from "@/app/portal/meg/help/kontakt/actions";
import type { SkrivTilOssType } from "@/lib/portal-hjelp/saksnummer";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";
import "@/styles/playerhq-ny-hjelp.css";

const TYPER: { t: SkrivTilOssType; navn: string; hint: string }[] = [
  { t: "sporsmal", navn: "Spørsmål", hint: "Noe du lurer på" },
  { t: "bug", navn: "Feil i appen", hint: "Noe virker ikke" },
  { t: "forslag", navn: "Forslag", hint: "Noe som kan bli bedre" },
  { t: "ros", navn: "Ros", hint: "Noe som virker bra" },
];

export type PHSkrivTilOssData = { navn: string; epost: string; type: SkrivTilOssType; fra: string | null };

export function PHSkrivTilOss({ data }: { data: PHSkrivTilOssData }) {
  const [type, setType] = useState<SkrivTilOssType>(data.type);
  const [emne, setEmne] = useState("");
  const [tekst, setTekst] = useState("");
  const [fornoyd, setFornoyd] = useState<number | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [sender, start] = useTransition();

  function send() {
    setFeil(null);
    if (!emne.trim()) return setFeil("Skriv et emne.");
    if (!tekst.trim()) return setFeil("Beskriv det du vil si.");
    start(async () => {
      const svar = await sendSkrivTilOss({ type, emne, tekst, fornoyd, side: data.fra });
      if (svar && !svar.ok) setFeil(svar.feil);
    });
  }

  return <div className="phn phn-meg phn-hjelp"><div className="side">
    <div className="topp">
      <Link className="tilbake" href="/portal/meg/help"><ChevronLeft size={18} aria-hidden />Hjelp</Link>
      <div><div className="phn-dato">Hjelp · skriv til oss</div><h1 className="phn-tittel">Skriv til oss</h1></div>
    </div>
    <div className="hj-grid">
      <div>
        <div className="phn-felt"><span>Hva gjelder det?</span>
          <div className="hj-typevalg" role="group" aria-label="Hva gjelder det?">
            {TYPER.map((x) => <button key={x.t} type="button" aria-pressed={type === x.t} onClick={() => setType(x.t)}><b>{x.navn}</b><span>{x.hint}</span></button>)}
          </div>
        </div>
        <label className="phn-felt">Emne<input value={emne} maxLength={200} onChange={(e) => setEmne(e.target.value)} /></label>
        <label className="phn-felt">Beskriv det<textarea rows={5} maxLength={1000} value={tekst} onChange={(e) => setTekst(e.target.value)} /><span className="hj-teller" aria-live="polite">{tekst.length} / 1000</span></label>
        <div className="phn-felt"><span>Hvor fornøyd er du med PlayerHQ? <span className="phn-kilde" style={{ display: "inline" }}>Valgfritt</span></span>
          <div className="hj-skala" role="group" aria-label="Fra 0 til 10">
            {Array.from({ length: 11 }, (_, n) => <button key={n} type="button" aria-pressed={fornoyd === n} onClick={() => setFornoyd(fornoyd === n ? null : n)}>{n}</button>)}
          </div>
          <div className="hj-skala-tekst"><span>Lite</span><span>Svært</span></div>
        </div>
      </div>
      <aside>
        <div className="phn-kort">
          <ul className="hj-oppsummering">
            <li><span>Fra</span><b>{data.navn || "—"}</b></li>
            <li><span>Svar til</span><b>{data.epost || "—"}</b></li>
            <li><span>Til</span><b>AK Golf, post@akgolf.no</b></li>
          </ul>
          {feil && <div className="hj-melding" role="alert">{feil}</div>}
          <button type="button" className="phn-knapp pri stor" onClick={send} disabled={sender}>{sender ? "Sender …" : "Send"}</button>
          <p className="phn-kilde">Meldingen havner hos AK Golf. Svaret kommer på e-post.</p>
        </div>
      </aside>
    </div>
  </div></div>;
}

export type PHSendtData = { tid: string; type: string; emne: string; epost: string; saksnummer: string };

export function PHSendt({ data }: { data: PHSendtData }) {
  return <div className="phn phn-meg phn-hjelp"><div className="side smal">
    <div className="topp">
      <Link className="tilbake" href="/portal/meg/help"><ChevronLeft size={18} aria-hidden />Hjelp</Link>
      <span className="hj-hake" aria-hidden><Check size={32} strokeWidth={2.5} /></span>
      <div><div className="phn-dato">Sendt {data.tid}</div><h1 className="phn-tittel">Takk, vi har fått meldingen</h1></div>
    </div>
    <div className="phn-kort">
      <ul className="hj-oppsummering">
        <li><span>Type</span><b>{data.type}</b></li>
        <li><span>Emne</span><b>{data.emne || "—"}</b></li>
        <li><span>Svar til</span><b>{data.epost || "—"}</b></li>
        <li><span>Saksnummer</span><b style={{ fontFamily: "var(--phn-mono)" }}>{data.saksnummer}</b></li>
      </ul>
      <p className="phn-forklar">Meldingen ligger hos AK Golf. Svaret kommer på e-post. Oppgi saksnummeret hvis du skriver om det samme igjen.</p>
    </div>
    <div className="phn-knapper"><Link className="phn-knapp pri" href="/portal/meg/help">Til Hjelp</Link><Link className="phn-knapp sek" href="/portal/meg">Til Meg</Link></div>
  </div></div>;
}
