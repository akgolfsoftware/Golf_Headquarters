"use client";

/**
 * AG-19 Jarvis i nytt design (designbrevet 13.10.2026) — /admin/jarvis.
 * Fasit: docs/design-system/utkast-agencyos/jarvis.html, skjerm «AG-19 Jarvis».
 *
 * Egen side fra hurtigknappen «Spør Jarvis». Samtalen er administrator-Caddie: den går mot
 * /api/caddie/chat, som tar ut navn, e-post og telefon før teksten sendes til AI
 * (src/lib/caddie/privacy.ts) og lagrer forslag som utkast. Jarvis sender ingenting: et
 * forslag utføres først når coachen trykker Godkjenn (/api/caddie/approve).
 *
 * Under samtalen: agentkjøringene fra loggen og skillene (bare visning), som før.
 *
 * Avvik:
 *   - Samtalen er bare for head coach (ADMIN), fordi API-rutene krever det. Andre ser kjøringene.
 *   - AG-A08 Forslag ligger i Innboks › Godkjenn (én innboks, 28.09), og lenkes herfra.
 *   - AG-A05 Datakvalitet bygges ikke her: import, dubletter og manglende kilde har egne sider
 *     (Drift, Turneringer › Dubletter) og lenkes fra sidepanelet.
 *   - Kildelista under hvert svar finnes ikke i API-et og vises ikke.
 */

import { useState, type FormEvent } from "react";
import { ArrowRight, Send, Sparkles, Square } from "lucide-react";
import { Knapp, KnappLenke, Pille, Seksjon, Tom, Topp, Varsel } from "@/components/admin/agencyos-ny/ny";
import { useCaddieChat } from "@/components/admin/caddie/use-caddie-chat";
import type { CaddieMessage, CaddieToolCall } from "@/components/admin/caddie/types";
import type { AG19Data } from "@/components/admin/precision/AG19CaddieHub";
import "@/styles/agencyos-ny-jarvis.css";

const FORSLAG = ["Hvem bør jeg snakke med i dag?", "Hva står i kalenderen min denne uka?", "Hvilke betalinger er forfalt?"];

function Verktoy({ tc, status, onSvar }: { tc: CaddieToolCall; status?: string; onSvar: (ja: boolean) => void }) {
  if (!tc.needsApproval || !tc.approvalPreview) {
    return <span className="kilde">{tc.state === "calling" ? "Henter …" : "Har lest data."}</span>;
  }
  const ferdig = status === "done" || status === "rejected" || status === "failed";
  return <div className="utkast-kort">
    <span className="hode">Utkast · ikke sendt{tc.approvalPreview.recipient ? ` · til ${tc.approvalPreview.recipient}` : ""}</span>
    <b>{tc.approvalPreview.title}</b>
    <p style={{ whiteSpace: "pre-wrap" }}>{tc.approvalPreview.body}</p>
    {ferdig
      ? <Pille tone={status === "done" ? "ok" : status === "failed" ? "feil" : "noy"}>{status === "done" ? "Godkjent og utført" : status === "failed" ? "Feilet" : "Avvist"}</Pille>
      : <div className="knapper">
        <Knapp disabled={status === "executing"} onClick={() => onSvar(true)}>{status === "executing" ? "Utfører …" : "Godkjenn"}</Knapp>
        <Knapp variant="sek" disabled={status === "executing"} onClick={() => onSvar(false)}>Avvis</Knapp>
      </div>}
  </div>;
}

function Melding({ m, approvals, onSvar }: { m: CaddieMessage; approvals: Record<string, { status: string }>; onSvar: (tc: CaddieToolCall, ja: boolean) => void }) {
  const tekst = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("").trim();
  if (m.role === "user") {
    if (tekst.startsWith("[System]")) return null;
    return <div className="boble-meg">{tekst}</div>;
  }
  return <div className="svar">
    <div className="svar-topp"><span className="jarvis-ikon"><Sparkles className="ikon" aria-hidden /></span>Jarvis</div>
    {tekst && <p style={{ whiteSpace: "pre-wrap" }}>{tekst}</p>}
    {m.parts.map((p) => p.type === "tool-call"
      ? <Verktoy key={p.toolCall.id} tc={p.toolCall} status={approvals[p.toolCall.id]?.status} onSvar={(ja) => onSvar(p.toolCall, ja)} />
      : null)}
  </div>;
}

function Samtale({ conversationId }: { conversationId: string }) {
  const { messages, status, sendMessage, stop, updateToolApproval, approvals } = useCaddieChat({ conversationId });
  const [tekst, setTekst] = useState("");
  const jobber = status === "streaming" || status === "submitted";
  const send = (t: string) => { if (!t.trim() || jobber) return; void sendMessage(t); setTekst(""); };
  const onSubmit = (e: FormEvent) => { e.preventDefault(); send(tekst); };
  return <div className="samtale">
    {messages.length <= 1 && <div className="forslag-chips">{FORSLAG.map((f) => <button key={f} type="button" onClick={() => send(f)}>{f}</button>)}</div>}
    {messages.map((m) => <Melding key={m.id} m={m} approvals={approvals} onSvar={(tc, ja) => void updateToolApproval(tc.id, ja, { toolName: tc.toolName, toolInput: tc.input })} />)}
    {status === "submitted" && <div className="skriver" aria-label="Jarvis skriver"><i /><i /><i /></div>}
    {status === "error" && <Varsel tone="advarsel" tittel="Jarvis kunne ikke svare">Ingenting er sendt. Prøv igjen.</Varsel>}
    <form className="skrivefelt" onSubmit={onSubmit}>
      <textarea rows={1} value={tekst} placeholder="Spør Jarvis" aria-label="Spør Jarvis" maxLength={4000}
        onChange={(e) => setTekst(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(tekst); } }} />
      {jobber
        ? <button type="button" className="ikonknapp" aria-label="Stopp" onClick={() => stop()}><Square className="ikon" aria-hidden /></button>
        : <button type="submit" className="ikonknapp" aria-label="Send" disabled={!tekst.trim()}><Send className="ikon" aria-hidden /></button>}
    </form>
    <p className="personvern">Navn, e-post og telefonnummer tas ut før teksten sendes til AI.</p>
  </div>;
}

export function AG19Jarvis({ conversationId, data }: { conversationId: string | null; data: AG19Data }) {
  const feilet = data.runs.filter((r) => r.st === "Feilet").length;
  return <div className="agn-s">
    <Topp dato="Fra hurtigknappen" tittel="Jarvis" />
    <div className="jarvis-grid">
      <div>
        {conversationId
          ? <Samtale conversationId={conversationId} />
          : <Tom tittel="Samtalen er for head coach" tekst="Jarvis-samtalen leser økonomi og innboks, og er derfor bare åpen for head coach. Kjøringene under ser alle coacher." />}
      </div>
      <aside>
        <div className="kort dempet"><b className="undertittel">Jarvis sender aldri</b><p className="forklar">Jarvis lager utkast. Ingenting går ut før du trykker Godkjenn.</p></div>
        <div className="kort dempet"><b className="undertittel">Forslag som venter</b><p className="forklar">Forslag fra Caddie og motoren ligger i Innboks.</p>
          <div className="knapper"><KnappLenke href="/admin/innboks?filter=godkjenn"><ArrowRight className="ikon" aria-hidden />Åpne forslagene</KnappLenke></div></div>
        <div className="kort dempet"><b className="undertittel">Datakvalitet</b><p className="forklar">Import, feillogg og dubletter i turneringsdata.</p>
          <div className="knapper"><KnappLenke href="/admin/drift">Drift</KnappLenke><KnappLenke href="/admin/tournaments/dubletter">Dubletter</KnappLenke></div></div>
      </aside>
    </div>

    <Seksjon tittel="Agentkjøringer" kilde={feilet > 0 ? `${feilet} feilet` : "Fra loggen"}>
      {data.runs.length === 0
        ? <p className="forklar">Ingen kjøringer ennå.</p>
        : <div className="kort rader">
          {data.runs.slice(0, 12).map((r) => <div key={r.id} className="j-rad">
            <span className="mono kilde">{r.t}</span>
            <span><b>{r.agent}</b><span className="kilde">{r.dur}{r.err ? ` · ${r.err}` : ""}</span></span>
            <Pille tone={r.st === "Kjørt" ? "ok" : "feil"}>{r.st}</Pille>
          </div>)}
        </div>}
    </Seksjon>

    {data.skills.length > 0 && <Seksjon tittel="Skills" kilde="Bare visning">
      <div className="kort rader">
        {data.skills.map(([id, navn, beskrivelse, paa]) => <div key={id} className="j-rad">
          <span className="ikonboks"><Sparkles className="ikon" aria-hidden /></span>
          <span><b>{navn}</b><span className="kilde">{beskrivelse}</span></span>
          <Pille tone={paa ? "ok" : "noy"}>{paa ? "På" : "Av"}</Pille>
        </div>)}
      </div>
    </Seksjon>}
  </div>;
}
