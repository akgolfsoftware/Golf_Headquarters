"use client";

/**
 * NyOvelseArk — «Legg til øvelse» i banken, v2 (Bølge 4, 2026-07-13).
 * BunnArk-basert (bunn-ark på mobil, sentrert kort på desktop). Brukes fra
 * Øvelsesbanken og fra opprett-i-økt-flyten (Workbench/live) — kalleren får
 * {id, name} tilbake via onOpprettet og kan koble øvelsen rett inn i økta.
 * Erstatter den foreldreløse, lys-stilede AddExerciseSheet for v2-flatene.
 */

import { useState, type CSSProperties } from "react";
import { T, Caps, Knapp, BunnArk } from "@/components/v2";
import type { AkseKey } from "@/lib/v2/tokens";
import { opprettOvelseIBanken } from "@/lib/ovelsesbank/opprett-action";

const AKSER: { v: AkseKey; l: string }[] = [
  { v: "FYS", l: "Fysisk" },
  { v: "TEK", l: "Teknikk" },
  { v: "SLAG", l: "Slag" },
  { v: "SPILL", l: "Spill" },
  { v: "TURN", l: "Turnering" },
];

const inputStil: CSSProperties = {
  width: "100%",
  appearance: "none",
  background: T.panel2,
  border: `1px solid ${T.border}`,
  borderRadius: 10,
  padding: "9px 11px",
  color: T.fg,
  fontFamily: T.ui,
  fontSize: 13,
  outline: "none",
};

export function NyOvelseArk({ defaultAkse, onLukk, onOpprettet }: {
  defaultAkse?: AkseKey;
  onLukk: () => void;
  /** Kalles ved suksess — f.eks. legg øvelsen inn i økta eller refresh lista. */
  onOpprettet: (ovelse: { id: string; name: string }) => void;
}) {
  const [navn, setNavn] = useState("");
  const [beskrivelse, setBeskrivelse] = useState("");
  const [akse, setAkse] = useState<AkseKey>(defaultAkse ?? "TEK");
  const [settReps, setSettReps] = useState("");
  const [intensitet, setIntensitet] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [lagrer, setLagrer] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  const lagre = async () => {
    if (!navn.trim() || lagrer) return;
    setLagrer(true);
    setFeil(null);
    const intens = parseInt(intensitet, 10);
    const res = await opprettOvelseIBanken({
      navn: navn.trim(),
      beskrivelse: beskrivelse.trim() || null,
      pyramidArea: akse,
      defaultRepsSets: settReps.trim() || null,
      intensitet: Number.isFinite(intens) ? Math.max(1, Math.min(10, intens)) : null,
      videoUrl: videoUrl.trim() || null,
    });
    setLagrer(false);
    if (res.ok && res.id) {
      onOpprettet({ id: res.id, name: res.name ?? navn.trim() });
      onLukk();
    } else {
      setFeil(res.error ?? "Kunne ikke lagre øvelsen.");
    }
  };

  return (
    <BunnArk tittel="Legg til øvelse" under="Lagres i øvelsesbanken din — coach ser den også." onLukk={onLukk} laast={lagrer}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
        <label style={{ display: "block" }}>
          <Caps size={8.5}>Navn</Caps>
          <input
            style={{ ...inputStil, marginTop: 6 }}
            value={navn}
            onChange={(e) => setNavn(e.target.value)}
            placeholder="F.eks. Wedge-stige 40–80 m"
            maxLength={200}
            autoFocus
          />
        </label>
        <label style={{ display: "block" }}>
          <Caps size={8.5}>Beskrivelse — valgfri</Caps>
          <textarea
            style={{ ...inputStil, marginTop: 6, resize: "none" }}
            rows={3}
            value={beskrivelse}
            onChange={(e) => setBeskrivelse(e.target.value)}
            placeholder="Utførelse, mål, tips …"
            maxLength={2000}
          />
        </label>
        <div>
          <Caps size={8.5}>Område</Caps>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
            {AKSER.map((a) => {
              const on = akse === a.v;
              return (
                <button
                  key={a.v}
                  type="button"
                  disabled={lagrer}
                  onClick={() => setAkse(a.v)}
                  style={{
                    appearance: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "7px 11px", borderRadius: 9999, border: `1px solid ${on ? "transparent" : T.border}`,
                    background: on ? T.lime : T.panel2, color: on ? T.onLime : T.fg2,
                    fontFamily: T.ui, fontSize: 11.5, fontWeight: 600,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: 9999, background: on ? T.onLime : T.ax[a.v] }} />
                  {a.l}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <label style={{ display: "block", flex: 1 }}>
            <Caps size={8.5}>Sett × reps — valgfri</Caps>
            <input style={{ ...inputStil, marginTop: 6 }} value={settReps} onChange={(e) => setSettReps(e.target.value)} placeholder="3 × 12" maxLength={100} disabled={lagrer} />
          </label>
          <label style={{ display: "block", flex: 1 }}>
            <Caps size={8.5}>Intensitet 1–10 — valgfri</Caps>
            <input type="number" inputMode="numeric" min={1} max={10} style={{ ...inputStil, marginTop: 6 }} value={intensitet} onChange={(e) => setIntensitet(e.target.value)} placeholder="7" disabled={lagrer} />
          </label>
        </div>
        <label style={{ display: "block" }}>
          <Caps size={8.5}>Video-lenke (YouTube/Vimeo) — valgfri</Caps>
          <input type="url" style={{ ...inputStil, marginTop: 6 }} value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/…" maxLength={500} disabled={lagrer} />
        </label>

        {feil && <span style={{ fontFamily: T.ui, fontSize: 12, color: T.down }}>{feil}</span>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
          <Knapp ghost onClick={onLukk} disabled={lagrer}>Avbryt</Knapp>
          <Knapp icon="check" onClick={lagre} disabled={lagrer || !navn.trim()}>
            {lagrer ? "Lagrer…" : "Lagre øvelse"}
          </Knapp>
        </div>
      </div>
    </BunnArk>
  );
}
