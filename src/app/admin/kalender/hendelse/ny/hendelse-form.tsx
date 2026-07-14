"use client";

/**
 * Skjema for å opprette en kalenderhendelse (I3). Kalles fra
 * HurtigOpprett («Ny hendelse»-valget) med dato+klokkeslett forhåndsutfylt.
 * Samme T.*-tokens og panel-mønster som hurtig-opprett.tsx.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { T } from "@/lib/v2/tokens";
import { Caps, Knapp } from "@/components/v2/core";
import { opprettHendelse } from "@/lib/kalender-hendelse/actions";

const feltStil: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  fontFamily: T.ui,
  fontSize: 13,
  color: T.fg,
  background: T.panel2,
  border: `1px solid ${T.border}`,
  borderRadius: T.rRow,
  padding: "10px 12px",
};

const labelStil: React.CSSProperties = {
  fontFamily: T.ui,
  fontSize: 11.5,
  fontWeight: 600,
  color: T.fg2,
  marginBottom: 6,
  display: "block",
};

export function HendelseForm({
  startDato,
  startKlokkeslett,
}: {
  startDato: string;
  startKlokkeslett: string;
}) {
  const router = useRouter();
  const [pending, startPending] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [sDato, setSDato] = useState(startDato);
  const [sTid, setSTid] = useState(startKlokkeslett);
  const [eDato, setEDato] = useState(startDato);
  const [eTid, setETid] = useState(() => {
    const [h, m] = startKlokkeslett.split(":").map(Number);
    const min = Math.min(23 * 60 + 59, h * 60 + m + 60);
    return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
  });
  const [notes, setNotes] = useState("");

  function submit() {
    setFeil(null);
    if (!title.trim()) {
      setFeil("Tittel er påkrevd");
      return;
    }
    const startAt = new Date(`${sDato}T${sTid}`);
    const endAt = new Date(`${eDato}T${eTid}`);
    if (endAt <= startAt) {
      setFeil("Slutt må være etter start");
      return;
    }
    startPending(async () => {
      try {
        await opprettHendelse({ title: title.trim(), startAt, endAt, notes: notes.trim() || undefined });
      } catch (err) {
        // redirect() kaster internt ved suksess — fang kun ekte feil.
        if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) return;
        setFeil(err instanceof Error ? err.message : "Kunne ikke lagre hendelsen");
      }
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 420 }}>
      <div>
        <label style={labelStil} htmlFor="hendelse-tittel">Tittel</label>
        <input
          id="hendelse-tittel"
          style={feltStil}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ferie, stengt anlegg, møte …"
          maxLength={200}
        />
      </div>

      <div className="grid grid-cols-2" style={{ gap: 12 }}>
        <div>
          <label style={labelStil} htmlFor="hendelse-start-dato">Start</label>
          <input id="hendelse-start-dato" type="date" style={{ ...feltStil, marginBottom: 8 }} value={sDato} onChange={(e) => setSDato(e.target.value)} />
          <input type="time" style={feltStil} value={sTid} onChange={(e) => setSTid(e.target.value)} />
        </div>
        <div>
          <label style={labelStil} htmlFor="hendelse-slutt-dato">Slutt</label>
          <input id="hendelse-slutt-dato" type="date" style={{ ...feltStil, marginBottom: 8 }} value={eDato} onChange={(e) => setEDato(e.target.value)} />
          <input type="time" style={feltStil} value={eTid} onChange={(e) => setETid(e.target.value)} />
        </div>
      </div>

      <div>
        <label style={labelStil} htmlFor="hendelse-notat">Notat (valgfritt)</label>
        <textarea
          id="hendelse-notat"
          style={{ ...feltStil, minHeight: 72, resize: "vertical" }}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={2000}
        />
      </div>

      {feil && <Caps style={{ color: T.down }}>{feil}</Caps>}

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <Knapp ghost onClick={() => router.push("/admin/kalender")}>Avbryt</Knapp>
        <Knapp onClick={submit} disabled={pending}>{pending ? "Lagrer …" : "Lagre hendelse"}</Knapp>
      </div>
    </div>
  );
}
