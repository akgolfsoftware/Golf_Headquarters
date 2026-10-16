"use client";

/**
 * PH-21 Spørsmål (én tråd, /portal/coach/sporsmal/[id]) — nytt design (pakke 11).
 * Fasit: docs/design-system/utkast-playerhq/kommunikasjon.html, mal «traad» (boblene i Meldinger).
 *
 * Samme data og handling som før: spørsmålet og coachens svar, og svarPaSporsmal for coach og admin.
 *
 * Avvik:
 *   - Tråden vises som to bobler (spørsmål og svar), ikke som en løpende samtale: et spørsmål har ett svar.
 *   - «Liknende spørsmål» og reaksjonsknappene er tatt ut: de var plassholdere uten data.
 *   - Svarfeltet vises bare for den som kan svare (coach og admin). Spilleren ser status.
 */
import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Send } from "lucide-react";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-kommunikasjon.css";

export type PH21SporsmalTraadData = {
  id: string;
  askerNavn: string;
  tittel: string;
  body: string;
  besvart: boolean;
  svar: string | null;
  /** «dd.mm hh:mm» (Oslo) */
  stiltTid: string;
  besvartTid: string | null;
  /** Den innloggede spurte selv. */
  erMeg: boolean;
  kanSvare: boolean;
};

export function PH21SporsmalTraad({ data, svarAction, tilbakeHref }: {
  data: PH21SporsmalTraadData;
  svarAction: (questionId: string, answer: string) => Promise<void>;
  tilbakeHref: string;
}) {
  const router = useRouter();
  const [svar, setSvar] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const send = (e: FormEvent) => {
    e.preventDefault();
    const t = svar.trim();
    if (!t) return;
    setFeil(null);
    start(async () => {
      try {
        await svarAction(data.id, t);
        setSvar("");
        router.refresh();
      } catch {
        setFeil("Svaret ble ikke sendt. Prøv igjen.");
      }
    });
  };

  return <div className="phn">
    <div className="phn-k-smal">
      <div className="phn-k-topp">
        <Link href={tilbakeHref} className="phn-k-tilbake"><ChevronLeft className="phn-ikon" aria-hidden />Spørsmål</Link>
        <div><div className="phn-dato">Spørsmål · stilt {data.stiltTid}</div><h1 className="phn-tittel">{data.tittel}</h1></div>
        <div className="phn-k-status-linje">
          <span className={`phn-pille ${data.besvart ? "ok" : "vent"}`}>{data.besvart ? "Besvart" : "Venter på svar"}</span>
          {data.besvartTid && <span className="phn-k-kildetekst">Besvart {data.besvartTid}</span>}
        </div>
      </div>
      <section className="phn-k-traad" aria-label="Spørsmål og svar">
        <div className="phn-k-bobler">
          <div className={`phn-k-boble${data.erMeg ? " meg" : ""}`}>
            <span>{data.body || data.tittel}</span>
            <time>{data.erMeg ? "Du" : data.askerNavn} · {data.stiltTid}</time>
          </div>
          {data.besvart && data.svar
            ? <div className={`phn-k-boble${data.erMeg ? "" : " meg"}`}><span>{data.svar}</span><time>Coach · {data.besvartTid ?? "—"}</time></div>
            : !data.kanSvare && <p className="phn-forklar">Coachen svarer skriftlig eller i neste time. Du får beskjed i Innboks.</p>}
        </div>
        {data.kanSvare && !data.besvart && <form className="phn-k-skrivefelt" onSubmit={send}>
          <label className="phn-felt" style={{ gap: 0 }}>
            <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Svar til {data.askerNavn}</span>
            <textarea rows={2} value={svar} placeholder={`Svar til ${data.askerNavn.split(" ")[0]}`} onChange={(e) => setSvar(e.target.value)} />
          </label>
          <button type="submit" className="phn-k-ikonknapp pri" aria-label="Send svar" disabled={!svar.trim() || pending}><Send className="phn-ikon" aria-hidden /></button>
        </form>}
        {feil && <p className="phn-k-feil" role="alert">{feil}</p>}
      </section>
    </div>
  </div>;
}
