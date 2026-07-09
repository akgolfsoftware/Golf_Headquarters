"use client";

// AI Golf Coach — utfellbart chat-panel under en AKTIV live-økt (plan-session
// eller session-v2). Flyter over bunn/høyre som en fast boks, blokkerer aldri
// tapper/rep-logging under. Gjenbruker samtale-familien fra @/components/v2
// (SamtaleBoble/Skrivefelt/SamtaleSkriver/AiMerke) — kun T-tokens, ingen rå hex.
//
// Streamer mot /api/live/coach-chat (text/plain, samme mønster som CoachAIV2).
// Video-opplasting er splittet ut i useLiveCoachVideoUpload.ts.

import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import Link from "next/link";
import {
  T,
  Icon,
  AiMerke,
  SamtaleBoble,
  SamtaleSkriver,
  SamtaleFeil,
  Skrivefelt,
  ForslagRad,
  Knapp,
} from "@/components/v2";
import type { LiveCoachChatRow, LiveCoachPanelData } from "./types";
import { useLiveCoachVideoUpload } from "./useLiveCoachVideoUpload";

const FORSLAG = [
  "Hva skal jeg fokusere på nå?",
  "Jeg slår det feil — hva gjør jeg?",
  "Se på videoen jeg lastet opp",
];

function feilFraStatus(status: number, feltFeil?: string): string {
  switch (status) {
    case 402:
      return "Oppgrader for AI-coach under trening.";
    case 403:
      return "Du har ikke tilgang til denne økta.";
    case 404:
      return "Fant ikke økta.";
    case 409:
      return "Økta er avsluttet.";
    case 429:
      return "For mange meldinger — vent litt og prøv igjen.";
    default:
      return feltFeil ?? "Noe gikk galt. Prøv igjen.";
  }
}

export function LiveCoachPanel({
  data,
  activeDrillId,
}: {
  data: LiveCoachPanelData;
  activeDrillId?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [meldinger, setMeldinger] = useState<LiveCoachChatRow[]>(data.initialMessages);
  const [input, setInput] = useState("");
  const [sender, setSender] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const upload = useLiveCoachVideoUpload({
    userId: data.userId,
    sessionId: data.sessionId,
    kind: data.kind,
    drillId: activeDrillId,
  });

  const harUlest = !open && meldinger.some((m) => m.role === "assistant");

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [meldinger, open]);

  async function send(tekstOverride?: string) {
    const tekst = (tekstOverride ?? input).trim();
    if (!tekst || sender) return;

    const nyHistorikk = [...meldinger, { role: "user" as const, content: tekst }];
    setMeldinger([...nyHistorikk, { role: "assistant" as const, content: "" }]);
    setInput("");
    setSender(true);
    setFeil(null);

    try {
      const res = await fetch("/api/live/coach-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sessionId: data.sessionId,
          kind: data.kind,
          drillId: activeDrillId ?? undefined,
          messages: nyHistorikk,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(feilFraStatus(res.status, body?.error));
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Ingen respons-stream");
      const decoder = new TextDecoder();
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMeldinger((m) => {
          const kopi = [...m];
          kopi[kopi.length - 1] = { role: "assistant", content: acc };
          return kopi;
        });
      }
    } catch (err) {
      setMeldinger((m) => m.slice(0, -1));
      setFeil(err instanceof Error ? err.message : "Kunne ikke sende melding.");
    } finally {
      setSender(false);
    }
  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setVideoInfo(null);
    const res = await upload.last(file);
    if (res.ok) {
      setMeldinger((m) => [...m, { role: "user", content: `Lastet opp video: ${file.name}` }]);
      setVideoInfo("Video sendt til AI Golf Coach — svar kommer i tråden om litt.");
    }
  }

  if (data.tier === "GRATIS") {
    return (
      <FloatingShell open={open} onToggle={() => setOpen((v) => !v)} harUlest={false}>
        <PanelHeader onClose={() => setOpen(false)} />
        <div style={{ padding: "18px 18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.6, margin: 0 }}>
            Oppgrader for AI-coach under trening.
          </p>
          <Link href="/portal/meg/abonnement" style={{ textDecoration: "none", alignSelf: "flex-start" }}>
            <Knapp icon="arrow-up-right">Oppgrader til Pro</Knapp>
          </Link>
        </div>
      </FloatingShell>
    );
  }

  return (
    <FloatingShell open={open} onToggle={() => setOpen((v) => !v)} harUlest={harUlest}>
      <PanelHeader onClose={() => setOpen(false)} />
      <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {meldinger.length === 0 ? (
          <div style={{ margin: "auto 0", display: "flex", flexDirection: "column", gap: 14, alignItems: "center", padding: "10px 4px", textAlign: "center" }}>
            <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Spør om noe underveis i økta.</span>
            <ForslagRad items={FORSLAG} onPick={setInput} sentrert />
          </div>
        ) : (
          meldinger.map((m, i) =>
            m.role === "assistant" && m.content === "" ? (
              <SamtaleSkriver key={i} />
            ) : (
              <SamtaleBoble key={i} rolle={m.role} initialer={data.initialer}>
                {m.content}
              </SamtaleBoble>
            ),
          )
        )}
      </div>

      <div style={{ padding: "10px 14px 14px", borderTop: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: 8 }}>
        {feil && <SamtaleFeil>{feil}</SamtaleFeil>}
        {videoInfo && (
          <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>{videoInfo}</span>
        )}
        {upload.feil && <SamtaleFeil>{upload.feil}</SamtaleFeil>}
        <div style={{ display: "flex", gap: 8, alignItems: "end" }}>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={upload.busy}
            aria-label="Last opp video"
            className="v2-press v2-focus"
            style={{ width: 40, height: 40, flex: "none", borderRadius: 10, border: `1px solid ${T.borderS}`, background: T.panel3, color: T.fg2, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: upload.busy ? "default" : "pointer", opacity: upload.busy ? 0.5 : 1 }}
          >
            <Icon name="video" size={17} />
          </button>
          <input ref={fileRef} type="file" accept="video/*" onChange={handleFile} style={{ display: "none" }} />
          <div style={{ flex: 1 }}>
            <Skrivefelt value={input} onChange={setInput} onSend={() => void send()} sender={sender} placeholder="Spør AI Golf Coach …" />
          </div>
        </div>
        {meldinger.length > 0 && <ForslagRad items={FORSLAG} onPick={(s) => void send(s)} />}
      </div>
    </FloatingShell>
  );
}

/* ── Flytende skall — kollapset FAB eller utfelt panel ────────────────── */

function FloatingShell({
  open,
  onToggle,
  harUlest,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  harUlest: boolean;
  children: ReactNode;
}) {
  if (!open) {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-label="Åpne AI Golf Coach"
        className="v2-press v2-focus"
        style={{
          position: "fixed",
          right: 16,
          bottom: "max(env(safe-area-inset-bottom) + 16px, 16px)",
          zIndex: 60,
          width: 56,
          height: 56,
          borderRadius: 9999,
          background: T.panel2,
          border: `1px solid ${T.borderS}`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 12px 28px rgba(0,0,0,0.4)",
        }}
      >
        <Icon name="sparkles" size={22} style={{ color: T.lime }} />
        {harUlest && (
          <span style={{ position: "absolute", top: 2, right: 2, width: 11, height: 11, borderRadius: 9999, background: T.lime, border: `2px solid ${T.panel2}` }} />
        )}
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        right: 16,
        bottom: "max(env(safe-area-inset-bottom) + 16px, 16px)",
        zIndex: 60,
        width: "min(400px, calc(100vw - 32px))",
        maxHeight: "min(70vh, 620px)",
        display: "flex",
        flexDirection: "column",
        background: T.panel,
        border: `1px solid ${T.border}`,
        borderRadius: 20,
        boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

function PanelHeader({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "12px 14px", borderBottom: `1px solid ${T.border}`, flex: "none" }}>
      <AiMerke navn="AI Golf Coach" sub="Under økta" />
      <button
        type="button"
        onClick={onClose}
        aria-label="Lukk AI Golf Coach"
        className="v2-press v2-focus"
        style={{ width: 32, height: 32, borderRadius: 9999, border: `1px solid ${T.border}`, background: T.panel3, color: T.mut, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
      >
        <Icon name="x" size={15} />
      </button>
    </div>
  );
}
