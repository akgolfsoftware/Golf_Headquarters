"use client";

// Foreldre-fane: informasjon, foreldremøter og gruppechat (lokal demo-state).
// Portert fra designets Foreldre-seksjon.

import { useState } from "react";
import { Send } from "lucide-react";

import type { WangLiveData } from "../_data/hent-wang-gruppe";
import { CHAT_SEED, PARENT_MEETINGS, type ChatMelding } from "../_data/wang-plan";
import { GruppeRoster } from "./live-seksjoner";
import { IconChip } from "./primitiver";

export function FaneForeldre({ live = null }: { live?: WangLiveData | null }) {
  const [meldinger, setMeldinger] = useState<ChatMelding[]>(CHAT_SEED);
  const [tekst, setTekst] = useState("");

  const send = () => {
    const t = tekst.trim();
    if (!t) return;
    setMeldinger((m) => [...m, { id: m.length + 1, sender: "Deg", text: t, time: "nå", own: true }]);
    setTekst("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <h1 style={{ margin: 0, fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 24, color: "var(--text-primary)" }}>Foreldre</h1>

      <GruppeRoster live={live} />

      <div className="wang-card" style={{ padding: 20, display: "flex", gap: 14, alignItems: "flex-start" }}>
        <IconChip icon="users" color="navy" size={46} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>Til foreldre og foresatte</div>
          <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.55, color: "var(--text-secondary)", maxWidth: 680 }}>
            Her finner dere foreldremøtene gjennom sesongen og en felles kanal for spørsmål til trenerne. All praktisk informasjon om reise, samlinger og turneringer deles her og i PlayerHQ.
          </p>
        </div>
      </div>

      <section>
        <SeksjonTittel>Foreldremøter</SeksjonTittel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12 }}>
          {PARENT_MEETINGS.map((p) => (
            <div key={p.iso} className="wang-card" style={{ padding: 16, display: "flex", gap: 12, alignItems: "flex-start" }}>
              <IconChip icon="calendar" color="blue" size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)" }}>{p.tema}</div>
                <div className="wang-num" style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-secondary)", marginTop: 3 }}>{p.dato} · kl. {p.tid}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-secondary)", marginTop: 2 }}>{p.hvor}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SeksjonTittel>Gruppechat</SeksjonTittel>
        <div className="wang-card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: 20, maxHeight: 460, overflowY: "auto" }}>
            {meldinger.map((m) => (
              <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: m.own ? "flex-end" : "flex-start", gap: 3 }}>
                {!m.own ? <span style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 11.5, color: "var(--text-secondary)", padding: "0 4px" }}>{m.sender}</span> : null}
                <div style={{ maxWidth: "78%", padding: "10px 14px", borderRadius: 18, borderBottomRightRadius: m.own ? 4 : 18, borderBottomLeftRadius: m.own ? 18 : 4, background: m.own ? "var(--wang-navy)" : "var(--neutral-50)", color: m.own ? "var(--white)" : "var(--text-primary)", fontFamily: "var(--font-body)", fontSize: 13.5, lineHeight: 1.45 }}>
                  {m.text}
                </div>
                <span className="wang-num" style={{ fontFamily: "var(--font-body)", fontSize: 10.5, color: "var(--text-secondary)", padding: "0 4px" }}>{m.time}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", padding: 14, borderTop: "1px solid var(--border-subtle)" }}>
            <input
              value={tekst}
              onChange={(e) => setTekst(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); send(); } }}
              placeholder="Skriv en melding …"
              aria-label="Skriv en melding"
              style={{ flex: 1, minWidth: 0, height: 44, padding: "0 16px", borderRadius: 999, border: "1px solid var(--border-subtle)", background: "var(--neutral-50)", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)", outline: "none" }}
            />
            <button onClick={send} aria-label="Send melding" className="wang-pressable" style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 999, border: "none", cursor: "pointer", background: "var(--wang-navy)", color: "var(--white)" }}>
              <Send size={18} strokeWidth={2.2} aria-hidden />
            </button>
          </div>
        </div>
        <p style={{ margin: "10px 2px 0", fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)" }}>Demo-visning – meldinger lagres ikke ennå. Kobles til ekte gruppechat i PlayerHQ senere.</p>
      </section>
    </div>
  );
}

function SeksjonTittel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 17, margin: "2px 2px 12px", color: "var(--text-primary)" }}>{children}</div>;
}
