"use client";

/**
 * PH-22 Caddie-chat — Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/playerhq/screens/PH-22.jsx, etag 1790520214001258).
 *
 * Chatlogikken (strøm fra /api/coach/ai-chat, sesjon, «Ny samtale», eksport) er
 * uendret fra CoachAIV2. Bare visningen er ny.
 *
 * Bevisste avvik fra tegningen:
 *   - «KILDE · …» under svaret vises ikke: API-et returnerer ren tekst uten kilde.
 *   - Utkast-kortet («Godta og send til Anders») vises ikke: Caddie lager ikke utkast i dag.
 *   - Klokkeslett under meldingene vises ikke: meldingene lagres uten tidspunkt.
 *   - «Ny samtale» og «Eksporter» beholdes (finnes i appen, ikke i tegningen).
 */
import { useRef, useState, useEffect } from "react";
import { ArrowUp, CircleAlert, Download, Lock, MessageSquare, Plus, Sparkles } from "lucide-react";
import type { ChatMelding } from "@/lib/anthropic";
import { Ikon, Knapp, KnappLenke, Meta, TomTilstand, FeilTilstand } from "@/components/precision/pa";
import { SideHode, Side, Kort } from "@/components/precision/pa-a4";
import "@/styles/precision-a4.css";

export type PH22Tilstand = "data" | "tom" | "feil" | "pro";
export type PH22Props = {
  /** Kun for prøve/forhåndsvisning: tvinger frem tilstand. Ellers utledes den av data. */
  tilstand?: PH22Tilstand;
  erGratis: boolean;
  sessionId: string | null;
  initialMessages: ChatMelding[];
  skrivTilHref: string;
};

const CHIPS = ["Hva bør jeg trene på i dag?", "Hvordan var siste runde?", "Foreslå en turnering i oktober", "Hvor mye har jeg trent denne uka?"];
const FEIL = { title: "Caddie svarer ikke", text: "Ingen forslag er sendt og ingenting er endret. Prøv igjen, eller skriv til Anders." };

function Header({ skrivTilHref }: { skrivTilHref: string }) {
  return <SideHode kicker="Meg · Caddie" title="Caddie"
    sub="Caddie svarer ut fra dine data. Alt Caddie foreslår er utkast. Du eller Anders godtar før noe endres."
    actions={<KnappLenke variant="secondary" icon={MessageSquare} href={skrivTilHref}>Skriv til Anders</KnappLenke>} />;
}

export function PH22Caddie({ tilstand, erGratis, sessionId: sid, initialMessages, skrivTilHref }: PH22Props) {
  const [meldinger, setMeldinger] = useState<ChatMelding[]>(initialMessages);
  const [txt, setTxt] = useState("");
  const [sender, setSender] = useState(false);
  const [feilVist, setFeilVist] = useState(tilstand === "feil");
  const [sessionId, setSessionId] = useState<string | null>(sid);
  const endRef = useRef<HTMLDivElement>(null);
  /** Økes ved «Ny samtale» slik at en pågående strøm aldri skriver inn i den nye samtalen. */
  const genRef = useRef(0);

  useEffect(() => {
    if (meldinger.length > 0) endRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [meldinger]);

  if (tilstand === "pro" || (tilstand === undefined && erGratis)) {
    return <Side max={880}>
      <Header skrivTilHref={skrivTilHref} />
      <Kort>
        <TomTilstand icon={Lock} title="Caddie krever Pro" text="Caddie er en del av Pro-abonnementet."
          actions={<KnappLenke href="/portal/meg/abonnement">Oppgrader til Pro</KnappLenke>} />
      </Kort>
    </Side>;
  }

  async function send(kilde?: string) {
    const tekst = (kilde ?? txt).trim();
    if (!tekst || sender) return;
    const gen = genRef.current;
    const historikk: ChatMelding[] = [...meldinger, { role: "user", content: tekst }];
    setMeldinger([...historikk, { role: "assistant", content: "" }]);
    setTxt("");
    setSender(true);
    setFeilVist(false);
    try {
      const res = await fetch("/api/coach/ai-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId, messages: historikk }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ny = res.headers.get("x-session-id");
      if (gen === genRef.current && ny && ny !== sessionId) setSessionId(ny);
      const reader = res.body?.getReader();
      if (!reader) throw new Error("Ingen respons-strøm");
      const dekoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        if (gen !== genRef.current) { await reader.cancel(); break; }
        acc += dekoder.decode(value, { stream: true });
        setMeldinger((m) => { const k = [...m]; k[k.length - 1] = { role: "assistant", content: acc }; return k; });
      }
    } catch {
      if (gen === genRef.current) { setMeldinger((m) => m.slice(0, -1)); setFeilVist(true); }
    } finally {
      setSender(false);
    }
  }

  function nySamtale() {
    genRef.current += 1;
    setMeldinger([]); setSessionId(null); setTxt(""); setFeilVist(false);
  }

  function eksporter() {
    const md = meldinger.map((m) => `## ${m.role === "user" ? "Du" : "Caddie"}\n\n${m.content}\n`).join("\n");
    const blob = new Blob([`# Caddie-chat\n\nEksportert ${new Date().toISOString()}\n\n${md}`], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `caddie-chat-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  }

  const tom = meldinger.length === 0;
  const skriver = sender && meldinger[meldinger.length - 1]?.content === "";

  return <Side max={880}>
    <Header skrivTilHref={skrivTilHref} />
    <div className="pa-card" style={{ padding: 0, overflow: "hidden", minWidth: 0 }}>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16, minHeight: 280, minWidth: 0 }} aria-live="polite">
        {tom && !feilVist && <TomTilstand icon={Sparkles} title="Spør Caddie om treningen din" text="Caddie kjenner planen, øktene, rundene og TrackMan-tallene dine. Caddie sender og endrer ingenting selv." />}
        {meldinger.map((m, i) => m.role === "user"
          ? <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, minWidth: 0 }}>
            <div style={{ maxWidth: "min(520px,88%)", padding: "10px 14px", borderRadius: 8, background: "var(--primary)", color: "var(--text-on-primary)", font: "var(--type-body)", overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>{m.content}</div>
            <Meta>DU</Meta>
          </div>
          : m.content === "" ? null
          : <div key={i} style={{ display: "grid", gridTemplateColumns: "32px minmax(0,1fr)", gap: 10 }}>
            <span style={{ width: 32, height: 32, borderRadius: 8, background: "var(--surface-sunken)", display: "grid", placeItems: "center", color: "var(--text-primary)" }}><Ikon icon={Sparkles} size={16} /></span>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
              <p style={{ margin: 0, font: "var(--type-body)", color: "var(--text-primary)", textWrap: "pretty", overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>{m.content}</p>
              <Meta>CADDIE</Meta>
            </div>
          </div>)}
        {skriver && <Meta>CADDIE LESER PLAN OG ØKTER …</Meta>}
        {feilVist && <FeilTilstand icon={CircleAlert} title={FEIL.title} text={FEIL.text} code="FEIL · CADDIE" />}
      </div>
      <div style={{ padding: 12, borderTop: "1px solid var(--border-hairline)", display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CHIPS.map((c) => <button key={c} type="button" className="pa-filter__opt" style={{ height: 44 }} disabled={sender} onClick={() => send(c)}><span className="pa-filter__label">{c}</span></button>)}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <input className="a4-input" aria-label="Spørsmål til Caddie" placeholder="Spør Caddie" value={txt}
              onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }} />
          </div>
          <button type="button" className="pa-iconbtn pa-iconbtn--primary" aria-label="Send til Caddie" disabled={!txt.trim() || sender} onClick={() => send()}><Ikon icon={ArrowUp} size={20} /></button>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Knapp variant="ghost" size="sm" icon={Download} onClick={eksporter} disabled={tom}>Eksporter</Knapp>
          <Knapp variant="ghost" size="sm" icon={Plus} onClick={nySamtale} disabled={sender}>Ny samtale</Knapp>
        </div>
      </div>
    </div>
  </Side>;
}
