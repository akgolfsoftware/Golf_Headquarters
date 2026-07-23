"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitSupportTicket } from "./actions";
import { T } from "@/lib/v2/tokens";
import { Caps, Kort, Knapp, Icon } from "@/components/v2";

type Kategori = "booking" | "coach-meldinger" | "app-feil" | "konto" | "data-synk" | "annet";

const KATEGORIER: { id: Kategori; navn: string; eksempel: string; icon: string }[] = [
  { id: "booking", navn: "Booking & betaling", eksempel: "Faktura, refunderinger", icon: "credit-card" },
  { id: "coach-meldinger", navn: "Coach-meldinger", eksempel: "Mangler svar, vedlegg", icon: "message-square" },
  { id: "app-feil", navn: "App-feil / bug", eksempel: "Krasj, frys, layout", icon: "triangle-alert" },
  { id: "konto", navn: "Konto & login", eksempel: "Passord, 2FA", icon: "lock" },
  { id: "data-synk", navn: "Data & synk", eksempel: "GolfBox, TrackMan", icon: "refresh-cw" },
  { id: "annet", navn: "Annet", eksempel: "Generelle spørsmål", icon: "help-circle" },
];

const feltStil: React.CSSProperties = {
  width: "100%",
  borderRadius: 12,
  border: `1px solid ${T.borderS}`,
  background: T.panel2,
  padding: "11px 13px",
  fontFamily: T.ui,
  fontSize: 13.5,
  color: T.fg,
  outline: "none",
  boxSizing: "border-box",
};

export function KontaktSupportForm({
  bruker,
}: {
  bruker: { navn: string; epost: string };
}) {
  const [kategori, setKategori] = useState<Kategori>("app-feil");
  const [emne, setEmne] = useState("");
  const [beskrivelse, setBeskrivelse] = useState("");
  const [tillatInnsyn, setTillatInnsyn] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function send() {
    startTransition(async () => {
      await submitSupportTicket({
        kategori,
        emne,
        beskrivelse,
        tillatInnsyn,
      });
    });
  }

  const kanSende = emne.trim().length >= 5 && beskrivelse.trim().length >= 20;

  return (
    <form
      style={{ display: "flex", flexDirection: "column", gap: T.gap }}
      onSubmit={(e) => {
        e.preventDefault();
        if (kanSende) send();
      }}
    >
      <Kort>
        <Caps style={{ marginBottom: 12 }}>01 · Hva gjelder det?</Caps>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 8,
          }}
        >
          {KATEGORIER.map((k) => {
            const valgt = kategori === k.id;
            return (
              <button
                key={k.id}
                type="button"
                onClick={() => setKategori(k.id)}
                className="v2-press v2-focus"
                style={{
                  appearance: "none",
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  borderRadius: T.rRow,
                  border: `1px solid ${valgt ? T.lime : T.border}`,
                  background: valgt ? `color-mix(in srgb, ${T.lime} 10%, ${T.panel})` : T.panel2,
                  padding: 12,
                  cursor: "pointer",
                }}
              >
                <Icon name={k.icon} size={15} style={{ color: valgt ? T.lime : T.mut }} />
                <span style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg }}>{k.navn}</span>
                <span style={{ fontFamily: T.ui, fontSize: 11, color: T.mut, lineHeight: 1.35 }}>{k.eksempel}</span>
              </button>
            );
          })}
        </div>
      </Kort>

      <Kort>
        <Caps style={{ marginBottom: 12 }}>02 · Beskriv problemet</Caps>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <Caps style={{ marginBottom: 7 }}>Emne</Caps>
            <input
              id="emne"
              type="text"
              maxLength={100}
              required
              value={emne}
              onChange={(e) => setEmne(e.target.value)}
              placeholder="Kort tittel på problemet"
              style={feltStil}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontFamily: T.ui, fontSize: 11, color: T.mut }}>Kort tittel — enklere å sortere</span>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut }}>{emne.length} / 100</span>
            </div>
          </div>
          <div>
            <Caps style={{ marginBottom: 7 }}>Beskrivelse</Caps>
            <textarea
              id="besk"
              maxLength={1000}
              required
              rows={6}
              value={beskrivelse}
              onChange={(e) => setBeskrivelse(e.target.value)}
              placeholder="Hva skjedde, hvilke steg du tok, hvilken side, tid/dato."
              style={{ ...feltStil, resize: "vertical", lineHeight: 1.55 }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontFamily: T.ui, fontSize: 11, color: T.mut }}>Minst 20 tegn</span>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut }}>{beskrivelse.length} / 1000</span>
            </div>
          </div>
        </div>
      </Kort>

      <Kort>
        <Caps style={{ marginBottom: 12 }}>03 · Tilgang</Caps>
        <label
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            borderRadius: T.rRow,
            border: `1px solid ${T.border}`,
            background: T.panel2,
            padding: 12,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={tillatInnsyn}
            onChange={(e) => setTillatInnsyn(e.target.checked)}
            style={{ marginTop: 2, accentColor: "var(--v2-lime)" }}
          />
          <div>
            <div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>
              Tillat at support kan se profilen min
            </div>
            <div style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, marginTop: 3, lineHeight: 1.45 }}>
              Lar oss finne problemet raskere. Du kan trekke tilgangen i Personvern.
            </div>
          </div>
        </label>
        <div style={{ marginTop: 12, fontFamily: T.mono, fontSize: 11, color: T.mut, lineHeight: 1.6 }}>
          Sendes som: {bruker.navn || "—"} · {bruker.epost || "—"}
        </div>
      </Kort>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 10,
          borderTop: `1px solid ${T.border}`,
          paddingTop: 14,
        }}
      >
        <span style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, flex: 1, minWidth: 160 }}>
          Eller e-post{" "}
          <a href="mailto:post@akgolf.no" style={{ color: T.forest, fontWeight: 600, textDecoration: "none" }}>
            post@akgolf.no
          </a>
        </span>
        <Knapp ghost onClick={() => router.push("/portal/meg/help")}>
          Avbryt
        </Knapp>
        <Knapp type="submit" icon="send" disabled={!kanSende || pending}>
          {pending ? "Sender …" : "Send melding"}
        </Knapp>
      </div>
    </form>
  );
}
