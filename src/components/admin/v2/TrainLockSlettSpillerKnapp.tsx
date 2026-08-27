"use client";

/**
 * Slett spiller-knapp + bekreftelses-dialog — Train-lock (T4, 27.08.2026).
 * TL-port av AdminSlettSpillerKnappV2. Samme server action (slettSpiller,
 * soft-delete, KUN admin) uendret. TL.danger brukt for destruktiv handling
 * — nærmeste semantiske token for en irreversibel slett-bekreftelse.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import { slettSpiller } from "@/app/admin/(legacy)/spillere/[id]/rediger/actions";

export function TrainLockSlettSpillerKnapp({ spillerId, spillerNavn }: { spillerId: string; spillerNavn: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function bekreftSlett() {
    setError(null);
    startTransition(async () => {
      const res = await slettSpiller(spillerId);
      if (res.ok) router.push("/admin/spillere");
      else setError(res.error ?? "Sletting feilet. Prøv igjen.");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          borderRadius: TL.radius.pill,
          border: "none",
          background: "transparent",
          padding: "10px 18px",
          fontSize: 13,
          fontWeight: 600,
          color: TL.danger,
          cursor: "pointer",
        }}
      >
        <Icon name="trash-2" size={14} />
        Slett spiller
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Slett spiller"
          onClick={(e) => {
            if (e.target === e.currentTarget && !pending) setOpen(false);
          }}
          style={{ position: "fixed", inset: 0, zIndex: 50, display: "grid", placeItems: "center", background: TL.scrim, padding: 16 }}
        >
          <div style={{ width: "100%", maxWidth: 420, borderRadius: TL.radius.card, background: TL.elev, padding: 22 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: TL.vekt.caps,
                letterSpacing: TL.track.capsSm,
                textTransform: "uppercase",
                color: TL.mute,
              }}
            >
              Slett spiller
            </span>
            <h2 style={{ margin: "6px 0 0", fontWeight: 700, fontSize: 20, color: TL.text }}>{spillerNavn}</h2>
            <p style={{ marginTop: 14, fontSize: 13, lineHeight: 1.55, color: TL.text }}>
              Spilleren fjernes fra stallen og mister tilgang. Dataene beholdes og kan gjenopprettes via support. Vil du fortsette?
            </p>
            {error && <p style={{ marginTop: 10, fontSize: 13, color: TL.danger }}>{error}</p>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
              <button
                type="button"
                disabled={pending}
                onClick={() => setOpen(false)}
                style={{
                  height: 44,
                  padding: "0 18px",
                  borderRadius: TL.radius.pill,
                  background: "transparent",
                  border: `1px solid ${TL.hair}`,
                  color: TL.mute,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: pending ? "default" : "pointer",
                }}
              >
                Avbryt
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={bekreftSlett}
                style={{
                  height: 44,
                  padding: "0 18px",
                  borderRadius: TL.radius.pill,
                  background: TL.danger,
                  color: TL.onDanger,
                  border: "none",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: pending ? "default" : "pointer",
                  opacity: pending ? 0.7 : 1,
                }}
              >
                {pending ? "Sletter…" : "Slett spiller"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
