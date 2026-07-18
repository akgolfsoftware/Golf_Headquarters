"use client";

/**
 * AgencyOS — «+ Legg til forelder»-knapp med invitasjons-dialog, v2-port
 * 16. juli 2026. Samme server action (inviterForelderForSpiller) uendret.
 */

import { useState, useTransition } from "react";
import { T, Caps, Knapp } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import { inviterForelderForSpiller } from "@/app/admin/(legacy)/spillere/[id]/profil/actions";

const RELATIONS = [
  { value: "FATHER", label: "Far" },
  { value: "MOTHER", label: "Mor" },
  { value: "GUARDIAN", label: "Verge / annen foresatt" },
] as const;

type Relation = (typeof RELATIONS)[number]["value"];

export function InviteParentButtonV2({ playerId, playerName }: { playerId: string; playerName: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{ background: "none", border: "none", cursor: "pointer", fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: T.lime }}
      >
        + Legg til forelder
      </button>
      {open && <InviteModal playerId={playerId} playerName={playerName} onClose={() => setOpen(false)} />}
    </>
  );
}

function InviteModal({ playerId, playerName, onClose }: { playerId: string; playerName: string; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [relation, setRelation] = useState<Relation>("GUARDIAN");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await inviterForelderForSpiller({ playerId, email, relation });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSent(true);
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Inviter forelder"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "grid", placeItems: "center", background: "rgba(0,0,0,0.55)", padding: 16 }}
    >
      <div style={{ width: "100%", maxWidth: 420, borderRadius: T.rCard, background: T.panel, border: `1px solid ${T.borderS}`, padding: 22, boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <Caps>AgencyOS · Foreldre</Caps>
            <h2 style={{ margin: "6px 0 0", fontFamily: T.disp, fontWeight: 700, fontSize: 22, color: T.fg }}>
              Inviter <em style={{ fontStyle: "italic", color: T.lime }}>forelder</em>
            </h2>
          </div>
          <button onClick={onClose} aria-label="Lukk" style={{ display: "grid", placeItems: "center", width: 28, height: 28, borderRadius: 8, background: T.panel2, border: `1px solid ${T.border}`, color: T.mut, cursor: "pointer" }}>
            <Icon name="x" size={14} />
          </button>
        </div>

        {sent ? (
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: 14, fontSize: 13, color: T.fg, margin: 0 }}>
              Invitasjon sendt til <strong>{email}</strong>. Forelderen får en e-post med en lenke som er gyldig i 7 dager, og kobles til {playerName} når den godtas.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Knapp onClick={onClose}>Lukk</Knapp>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            <label style={{ display: "block" }}>
              <span style={{ display: "block", marginBottom: 6, fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.10em", color: T.mut }}>E-postadresse</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="forelder@eksempel.no"
                style={{ width: "100%", borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: "10px 12px", fontSize: 13, color: T.fg, outline: "none", boxSizing: "border-box" }}
              />
            </label>

            <label style={{ display: "block" }}>
              <span style={{ display: "block", marginBottom: 6, fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.10em", color: T.mut }}>Relasjon</span>
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value as Relation)}
                style={{ width: "100%", borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: "10px 12px", fontSize: 13, color: T.fg, outline: "none", boxSizing: "border-box" }}
              >
                {RELATIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </label>

            {error && (
              <div style={{ borderRadius: 10, background: `color-mix(in srgb, ${T.down} 10%, transparent)`, padding: "10px 14px", fontSize: 13, color: T.down }}>{error}</div>
            )}

            <p style={{ fontSize: 11, color: T.mut, margin: 0 }}>Forelderen får en e-post med en lenke som er gyldig i 7 dager.</p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Knapp ghost type="button" disabled={pending} onClick={onClose}>Avbryt</Knapp>
              <Knapp type="submit" disabled={pending}>{pending ? "Sender…" : "Send invitasjon"}</Knapp>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
