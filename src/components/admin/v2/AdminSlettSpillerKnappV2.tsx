"use client";
import { TL } from "@/lib/v2/train-lock";

/**
 * Slett spiller-knapp + bekreftelses-dialog, v2-port 16. juli 2026. Samme
 * server action (slettSpiller, soft-delete, KUN admin) uendret. Erstatter
 * shadcn Dialog med v2-ens etablerte role="dialog"-overlegg-mønster.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Caps, Knapp } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import { slettSpiller } from "@/app/admin/(legacy)/spillere/[id]/rediger/actions";

export function AdminSlettSpillerKnappV2({ spillerId, spillerNavn }: { spillerId: string; spillerNavn: string }) {
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
        style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 9999, border: `1px solid color-mix(in srgb, ${TL.danger} 40%, transparent)`, background: "transparent", padding: "10px 18px", fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.danger, cursor: "pointer" }}
      >
        <Icon name="trash-2" size={14} />
        Slett spiller
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Slett spiller"
          onClick={(e) => { if (e.target === e.currentTarget && !pending) setOpen(false); }}
          style={{ position: "fixed", inset: 0, zIndex: 50, display: "grid", placeItems: "center", background: TL.scrim, padding: 16 }}
        >
          <div style={{ width: "100%", maxWidth: 420, borderRadius: TL.radius.card, background: TL.elev, border: `1px solid ${TL.hair}`, padding: 22, boxShadow: "none" }}>
            <Caps>Slett spiller</Caps>
            <h2 style={{ margin: "6px 0 0", fontFamily: TL.font.sans, fontWeight: 700, fontSize: 20, color: TL.text }}>{spillerNavn}</h2>
            <p style={{ marginTop: 14, fontSize: 13, lineHeight: 1.55, color: TL.text }}>
              Spilleren fjernes fra stallen og mister tilgang. Dataene beholdes og kan gjenopprettes via support. Vil du fortsette?
            </p>
            {error && <p style={{ marginTop: 10, fontSize: 13, color: TL.danger }}>{error}</p>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
              <Knapp ghost disabled={pending} onClick={() => setOpen(false)}>Avbryt</Knapp>
              <Knapp disabled={pending} onClick={bekreftSlett} style={{ background: TL.danger, color: TL.onFill }}>
                {pending ? "Sletter…" : "Slett spiller"}
              </Knapp>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
