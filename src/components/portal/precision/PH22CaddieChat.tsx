"use client";

/**
 * PH-22 Caddie — nytt design (pakke 7 Kommunikasjon, godkjent av Anders 14.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/kommunikasjon.html, mal «caddie».
 * Stil: src/styles/playerhq-ny.css og src/styles/playerhq-ny-kommunikasjon.css.
 *
 * Samme oppførsel som før: strømmende svar fra /api/coach/ai-chat (navnet byttes med et pseudonym
 * på serveren), ny samtale, eksport til Markdown, hurtigspørsmål, utkast med Godkjenn · Avvis og
 * Pro-sperre for Gratis.
 *
 * Avvik:
 *   - Svaret vises som tekst. Strokes Gained-stolper, øktkort og turneringskort i svaret er ikke med:
 *     Caddie sender bare tekst, ikke tall eller økter appen kan tegne.
 *   - «Dette ser Caddie» lister hvilke kilder Caddie leser, uten tall: siden har ikke tallene.
 *   - Utkast godkjennes bare i samtalen (som før). Caddie lagrer ikke utkast i Innboks ennå.
 *   - «Send til coach» på utkast er fjernet (vedtak 28.09): spilleren godkjenner selv.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-22.
 */

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUp, BarChart3, Download, RotateCcw, Sparkles } from "lucide-react";
import type { Tier } from "@/generated/prisma/client";
import {
  PH22_HURTIGSPORSMAL,
  genererCaddieEksportMarkdown,
  formaterKlokkeslett,
  harCaddieTilgang,
  type PH22CaddieMelding,
  type PH22CaddieDraft,
} from "@/lib/portal-caddie/ph22-caddie-data";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-kommunikasjon.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";
import "@/styles/playerhq-ny-pakke4-skra.css";

export interface PH22CaddieChatProps {
  tier: Tier;
  fornavn: string;
  initialer: string;
  sessionId: string | null;
  initialMessages: PH22CaddieMelding[];
  coachNavn?: string;
  userRole?: string;
  stateOverride?: "data" | "tom" | "laster" | "feil";
}

const CaddieMerke = ({ liten = false }: { liten?: boolean }) => (
  <span className="phn-k-avatar caddie" aria-hidden style={liten ? { width: 28, height: 28 } : undefined}>
    <Sparkles className="phn-ikon" style={liten ? { width: 16, height: 16 } : undefined} />
  </span>
);

const SER: { navn: string; tekst: string }[] = [
  { navn: "Plan", tekst: "Ukene, periodene og øktene du har lagt inn" },
  { navn: "Gjennomført", tekst: "Øktene du har fullført og tiden du har brukt" },
  { navn: "Runder", tekst: "Brutto score og Strokes Gained fra rundene dine" },
  { navn: "TrackMan", tekst: "Øktene og tallene du har lastet opp" },
  { navn: "Teknisk plan", tekst: "Oppgavene coachen har satt opp" },
];

export function PH22CaddieChat({
  tier,
  fornavn,
  sessionId: initialSessionId,
  initialMessages,
  coachNavn = "Anders",
  userRole = "PLAYER",
  stateOverride,
}: PH22CaddieChatProps) {
  const harTilgang = harCaddieTilgang(tier, userRole);

  const [meldinger, setMeldinger] = useState<PH22CaddieMelding[]>(stateOverride === "tom" ? [] : initialMessages);
  const [inputTekst, setInputTekst] = useState("");
  const [sender, setSender] = useState(false);
  const [feil, setFeil] = useState<string | null>(
    stateOverride === "feil" ? "Caddie svarer ikke. Ingen forslag er sendt og ingenting er endret." : null,
  );
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId);
  const [toastMelding, setToastMelding] = useState<string | null>(null);

  const bunnRef = useRef<HTMLDivElement>(null);
  const genRef = useRef(0);
  const idCounterRef = useRef(0);
  const streamAccRef = useRef("");

  const forsteVisning = useRef(true);
  useEffect(() => {
    // Ikke rull ved første visning; bare når samtalen vokser.
    if (forsteVisning.current) { forsteVisning.current = false; return; }
    bunnRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [meldinger, sender]);

  useEffect(() => {
    if (!toastMelding) return;
    const t = setTimeout(() => setToastMelding(null), 3600);
    return () => clearTimeout(t);
  }, [toastMelding]);

  if (!harTilgang) return <PH22ProGate />;

  async function sendMelding(valgtTekst?: string) {
    const tekst = (valgtTekst || inputTekst).trim();
    if (!tekst || sender) return;

    const klokke = formaterKlokkeslett();
    const gen = genRef.current;
    idCounterRef.current += 1;
    const uId = `u-${idCounterRef.current}`;
    idCounterRef.current += 1;
    const cId = `c-${idCounterRef.current}`;

    const brukerMelding: PH22CaddieMelding = { id: uId, role: "user", content: tekst, timestamp: klokke };
    const assisterendePlaceholder: PH22CaddieMelding = {
      id: cId, role: "assistant", content: "", timestamp: klokke, source: "Plan og økter",
    };

    setMeldinger((m) => [...m, brukerMelding, assisterendePlaceholder]);
    setInputTekst("");
    setSender(true);
    setFeil(null);

    try {
      const payloadMessages = [...meldinger, brukerMelding].map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/coach/ai-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId, messages: payloadMessages }),
      });

      if (!res.ok) {
        const feilMelding = await res.text();
        throw new Error(feilMelding || `HTTP ${res.status}`);
      }

      const nySessionId = res.headers.get("x-session-id");
      if (gen === genRef.current && nySessionId && nySessionId !== sessionId) {
        setSessionId(nySessionId);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Ingen respons-stream mottatt fra Caddie");

      const decoder = new TextDecoder();
      streamAccRef.current = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (gen !== genRef.current) {
          await reader.cancel();
          break;
        }
        streamAccRef.current += decoder.decode(value, { stream: true });
        const gjeldendeTekst = streamAccRef.current;
        setMeldinger((tidligere) => {
          const nyListe = [...tidligere];
          const siste = nyListe[nyListe.length - 1];
          if (siste && siste.role === "assistant") nyListe[nyListe.length - 1] = { ...siste, content: gjeldendeTekst };
          return nyListe;
        });
      }
    } catch (err) {
      if (gen === genRef.current) {
        setMeldinger((m) => m.filter((msg) => msg.id !== assisterendePlaceholder.id));
        setFeil(
          err instanceof Error
            ? `Caddie svarer ikke: ${err.message}`
            : "Kunne ikke nå Caddie. Kontroller nettverk eller prøv igjen om et øyeblikk.",
        );
      }
    } finally {
      setSender(false);
    }
  }

  function nullstillSamtale() {
    genRef.current += 1;
    setMeldinger([]);
    setSessionId(null);
    setInputTekst("");
    setFeil(null);
  }

  function eksporterSamtale() {
    const md = genererCaddieEksportMarkdown(meldinger, fornavn);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `caddie-samtale-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function oppdaterDraftStatus(meldingId: string, status: "godtatt" | "forkastet") {
    setMeldinger((m) => m.map((msg) => (msg.id === meldingId && msg.draft ? { ...msg, draft: { ...msg.draft, status } } : msg)));
    setToastMelding(status === "godtatt" ? `Utkastet er godkjent. ${coachNavn} ser det du godkjenner.` : "Utkastet er avvist. Planen er uendret.");
  }

  const erTom = meldinger.length === 0;
  const laster = stateOverride === "laster";

  return <div className="phn phn-skra">
    <SkraTopp
      lav
      etikett="Caddie"
      bilde="/images/playerhq/tek-video.jpg" bildePosisjon="50% 50%"
      overlinje="Caddie"
      tittel="Spør Caddie"
      ingress="Caddie ser tallene og planen din. Navnet ditt sendes ikke til AI, så ikke skriv navn på andre i spørsmålet. Alt Caddie foreslår er et utkast til du godkjenner det."
    />
    <SkraFlyt lav>
    <div className="phn-knapper" style={{ marginBottom: 12 }}>
      <Link href="/portal/coach" className="phn-knapp sek">Skriv til {coachNavn}</Link>
      <button type="button" className="phn-knapp sek" onClick={eksporterSamtale} disabled={erTom || laster}><Download className="phn-ikon" aria-hidden />Last ned samtalen</button>
      <button type="button" className="phn-knapp sek" onClick={nullstillSamtale} disabled={erTom || laster}><RotateCcw className="phn-ikon" aria-hidden />Ny samtale</button>
    </div>

    <div className="phn-k-caddie-grid">
      <div className="phn-k-traad" aria-live="polite" aria-busy={laster || sender || undefined}>
        {laster ? <>
          <span className="phn-skjelett" style={{ height: 72, width: "70%", justifySelf: "end" }} />
          <span className="phn-skjelett" style={{ height: 160 }} />
          <p className="phn-kilde" role="status">Caddie leser dataene dine …</p>
        </> : erTom ? <div className="phn-k-tom-chat">
          <h2>Spør Caddie om treningen din</h2>
          <p className="phn-forklar">Caddie kjenner planen, øktene, rundene og TrackMan-tallene dine. Caddie sender og endrer ingenting selv.</p>
        </div> : meldinger.map((m) => m.role === "user"
          ? <div key={m.id} className="phn-k-boble meg"><span>{m.content}</span><time>{m.timestamp}</time></div>
          : (m.content || m.draft) ? <div key={m.id} className="phn-k-svar">
            <div className="phn-k-svar-topp"><CaddieMerke liten />Caddie<time>{m.timestamp}</time></div>
            {m.content && <p>{m.content}</p>}
            {m.draft && <PH22DraftBox draft={m.draft} onAccept={() => oppdaterDraftStatus(m.id, "godtatt")} onDrop={() => oppdaterDraftStatus(m.id, "forkastet")} />}
            {m.source && <ul className="phn-k-kilder"><li><BarChart3 className="phn-ikon" aria-hidden />Kilde: {m.source}</li></ul>}
          </div> : null)}

        {sender && meldinger.at(-1)?.content === "" && <div className="phn-k-skriver" aria-label="Caddie skriver"><i /><i /><i /></div>}

        {feil && <div className="phn-k-feil" role="alert">
          <b>Caddie svarer ikke.</b> {feil.replace(/^Caddie svarer ikke[.:]\s*/, "")}
          <div className="phn-knapper" style={{ marginTop: 8 }}><button type="button" className="phn-knapp sek" onClick={() => setFeil(null)}>Lukk</button></div>
        </div>}

        <div className="phn-k-forslag-chips" aria-label="Forslag til spørsmål">
          {PH22_HURTIGSPORSMAL.map((s) => <button key={s} type="button" disabled={sender || laster} onClick={() => void sendMelding(s)}>{s}</button>)}
        </div>

        <form className="phn-k-skrivefelt" onSubmit={(e: FormEvent) => { e.preventDefault(); void sendMelding(); }}>
          <label className="phn-felt" style={{ gap: 0 }}>
            <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Spørsmål til Caddie</span>
            <textarea rows={1} value={inputTekst} placeholder="Spør Caddie" disabled={laster} onChange={(e) => setInputTekst(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMelding(); } }} />
          </label>
          <button type="submit" className="phn-k-ikonknapp pri" aria-label="Send" disabled={!inputTekst.trim() || sender || laster}><ArrowUp className="phn-ikon" aria-hidden /></button>
        </form>
        <div ref={bunnRef} />
      </div>

      <aside>
        <div className="phn-kort">
          <b className="phn-k-undertittel">Dette ser Caddie</b>
          <ul className="phn-k-ser-liste">
            {SER.map((s) => <li key={s.navn}>{s.navn}<span>{s.tekst}</span></li>)}
          </ul>
        </div>
        <div className="phn-kort phn-k-dempet">
          <b className="phn-k-undertittel">Caddie endrer ingenting selv</b>
          <p className="phn-forklar">Forslag er utkast til du godkjenner eller avviser dem. {coachNavn} ser det du godkjenner.</p>
        </div>
      </aside>
    </div>
    {toastMelding && <div className="phn-k-toast" role="status">{toastMelding}</div>}
  </SkraFlyt></div>;
}

/** Utkast fra Caddie: Godkjenn · Avvis. Caddie endrer ikke planen selv. */
function PH22DraftBox({ draft, onAccept, onDrop }: { draft: PH22CaddieDraft; onAccept: () => void; onDrop: () => void }) {
  const avgjort = draft.status !== "utkast";
  return <div className="phn-k-forslagskort">
    <div className="phn-k-fk-topp">
      <b>Utkast: {draft.title}</b>
      <span className={`phn-pille ${draft.status === "godtatt" ? "ok" : draft.status === "forkastet" ? "noy" : "vent"}`}>
        {draft.status === "godtatt" ? "Godkjent" : draft.status === "forkastet" ? "Avvist" : "Forslag"}
      </span>
    </div>
    <p className="phn-k-kildetekst">{draft.meta}</p>
    {!avgjort && <div className="phn-knapper">
      <button type="button" className="phn-knapp pri" onClick={onAccept}>Godkjenn</button>
      <button type="button" className="phn-knapp sek" onClick={onDrop}>Avvis</button>
    </div>}
  </div>;
}

/** Sperre for Gratis: Caddie krever Full. */
function PH22ProGate() {
  return <div className="phn phn-skra">
    <SkraTopp lav etikett="Caddie" bilde="/images/playerhq/tek-video.jpg" bildePosisjon="50% 50%" overlinje="Caddie" tittel="Spør Caddie" />
    <SkraFlyt lav>
    <section className="phn-kort" style={{ maxWidth: 640 }}>
      <b className="phn-k-undertittel">Caddie er med i Full</b>
      <p className="phn-forklar">Caddie leser planene, øktene og rundene dine, og hjelper deg med spørsmål og forslag til treningen.</p>
      <div className="phn-knapper"><Link href="/portal/meg/abonnement" className="phn-knapp pri">Se abonnement</Link></div>
    </section>
  </SkraFlyt></div>;
}
