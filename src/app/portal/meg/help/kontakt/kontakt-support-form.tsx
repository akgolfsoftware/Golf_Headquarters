"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitSupportTicket } from "./actions";
import { TL } from "@/lib/v2/train-lock";

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
  border: `1px solid ${TL.hair}`,
  background: TL.dock,
  padding: "11px 13px",
  fontFamily: TL.font.sans,
  fontSize: 13.5,
  color: TL.text,
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
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
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
                  borderRadius: TL.radius.row,
                  border: `1px solid ${valgt ? TL.fill : TL.hair}`,
                  background: valgt ? `color-mix(in srgb, ${TL.fill} 10%, ${TL.elev})` : TL.dock,
                  padding: 12,
                  cursor: "pointer",
                }}
              >
                <Icon name={k.icon} size={15} style={{ color: valgt ? TL.fill : TL.mute }} />
                <span style={{ fontFamily: TL.font.sans, fontSize: 12.5, fontWeight: 600, color: TL.text }}>{k.navn}</span>
                <span style={{ fontFamily: TL.font.sans, fontSize: 11, color: TL.mute, lineHeight: 1.35 }}>{k.eksempel}</span>
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
              <span style={{ fontFamily: TL.font.sans, fontSize: 11, color: TL.mute }}>Kort tittel — enklere å sortere</span>
              <span style={{ fontFamily: TL.font.mono, fontSize: 10, color: TL.mute }}>{emne.length} / 100</span>
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
              <span style={{ fontFamily: TL.font.sans, fontSize: 11, color: TL.mute }}>Minst 20 tegn</span>
              <span style={{ fontFamily: TL.font.mono, fontSize: 10, color: TL.mute }}>{beskrivelse.length} / 1000</span>
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
            borderRadius: TL.radius.row,
            border: `1px solid ${TL.hair}`,
            background: TL.dock,
            padding: 12,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={tillatInnsyn}
            onChange={(e) => setTillatInnsyn(e.target.checked)}
            style={{ marginTop: 2, accentColor: "var(--tl-fill)" }}
          />
          <div>
            <div style={{ fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.text }}>
              Tillat at support kan se profilen min
            </div>
            <div style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, marginTop: 3, lineHeight: 1.45 }}>
              Lar oss finne problemet raskere. Du kan trekke tilgangen i Personvern.
            </div>
          </div>
        </label>
        <div style={{ marginTop: 12, fontFamily: TL.font.mono, fontSize: 11, color: TL.mute, lineHeight: 1.6 }}>
          Sendes som: {bruker.navn || "—"} · {bruker.epost || "—"}
        </div>
      </Kort>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 10,
          borderTop: `1px solid ${TL.hair}`,
          paddingTop: 14,
        }}
      >
        <span style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, flex: 1, minWidth: 160 }}>
          Eller e-post{" "}
          <a href="mailto:post@akgolf.no" style={{ color: TL.fill, fontWeight: 600, textDecoration: "none" }}>
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
