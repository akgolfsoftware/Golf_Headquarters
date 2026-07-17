"use client";

/**
 * AgencyOS — Tjeneste-skjema (opprett/endre/slett), v2-port 16. juli 2026.
 * Samme server actions (createService/updateService/deleteService) uendret.
 *
 * Fikset samtidig: komponenten støttet alltid rediger+slett via `initial`-
 * proppen, men /admin/services sin tabell kalte den aldri med `initial` per
 * rad — kun "+ Ny tjeneste" var koblet. Nå rendres «Endre» per rad, som gir
 * ekte rediger/slett-UI uten noen ny funksjon (samme komponent, samme
 * actions — bare faktisk brukt slik den var bygget for).
 */

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { T, Caps, Knapp } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import { createService, updateService, deleteService } from "@/app/admin/(legacy)/services/actions";

type ServiceFormV2Props = {
  initial?: {
    id: string;
    name: string;
    description: string | null;
    priceOre: number;
    durationMin: number;
    active: boolean;
  };
  triggerLabel: string;
  triggerVariant?: "cta" | "lenke";
};

function Felt({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", marginBottom: 6, fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.10em", color: T.mut }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = { width: "100%", borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: "10px 12px", fontSize: 13, color: T.fg, outline: "none", boxSizing: "border-box" };

export function ServiceFormV2({ initial, triggerLabel, triggerVariant = "cta" }: ServiceFormV2Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priceKr, setPriceKr] = useState(initial ? String(initial.priceOre / 100) : "");
  const [durationMin, setDurationMin] = useState(initial ? String(initial.durationMin) : "60");
  const [active, setActive] = useState(initial?.active ?? true);

  useEffect(() => {
    if (open) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [open]);

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Navn er påkrevd.");
      return;
    }
    const pris = Number(priceKr);
    const varighet = Number(durationMin);
    if (isNaN(pris) || pris < 0) {
      setError("Pris må være et tall.");
      return;
    }
    if (isNaN(varighet) || varighet < 5) {
      setError("Varighet må være minst 5 min.");
      return;
    }
    setError(null);
    const data = { name, description, priceOre: Math.round(pris * 100), durationMin: varighet, active };
    startTransition(async () => {
      try {
        if (initial) await updateService(initial.id, data);
        else await createService(data);
        setOpen(false);
        router.refresh();
      } catch {
        setError("Kunne ikke lagre.");
      }
    });
  }

  function slett() {
    if (!initial) return;
    if (!confirm(`Slett tjenesten «${initial.name}»?`)) return;
    startTransition(async () => {
      try {
        await deleteService(initial.id);
      } catch {
        setError("Kunne ikke slette.");
      }
    });
  }

  return (
    <>
      {triggerVariant === "cta" ? (
        <Knapp icon="plus" onClick={() => setOpen(true)}>{triggerLabel}</Knapp>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{ background: "none", border: "none", cursor: "pointer", fontFamily: T.mono, fontSize: 11, color: T.lime, textTransform: "uppercase", letterSpacing: "0.06em" }}
        >
          {triggerLabel}
        </button>
      )}

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        style={{ borderRadius: T.rCard, border: `1px solid ${T.borderS}`, background: T.panel, padding: 0, boxShadow: "0 24px 60px rgba(0,0,0,0.5)", maxWidth: 420, width: "100%", color: T.fg }}
      >
        <form onSubmit={lagre} style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div>
              <Caps>{initial ? "Endre" : "Ny"} tjeneste</Caps>
              <h2 style={{ margin: "6px 0 0", fontFamily: T.disp, fontWeight: 700, fontSize: 20, color: T.fg }}>{name || (initial ? "Endre tjeneste" : "Ny tjeneste")}</h2>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Lukk" style={{ display: "grid", placeItems: "center", width: 28, height: 28, borderRadius: 8, background: T.panel2, border: `1px solid ${T.border}`, color: T.mut, cursor: "pointer" }}>
              <Icon name="x" size={14} />
            </button>
          </div>

          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
            <Felt label="Navn">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="f.eks. Coaching 60 min" style={inputStyle} />
            </Felt>
            <Felt label="Beskrivelse (valgfritt)">
              <textarea value={description} onChange={(e) => setDescription(e.target.value.slice(0, 300))} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
            </Felt>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Felt label="Pris (kr)">
                <input type="number" step="50" min="0" value={priceKr} onChange={(e) => setPriceKr(e.target.value)} style={inputStyle} />
              </Felt>
              <Felt label="Varighet (min)">
                <input type="number" step="5" min="5" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} style={inputStyle} />
              </Felt>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: T.fg }}>
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              Aktiv (kan bookes)
            </label>
          </div>

          {error && (
            <div role="alert" style={{ marginTop: 14, borderRadius: 10, border: `1px solid color-mix(in srgb, ${T.down} 30%, transparent)`, background: `color-mix(in srgb, ${T.down} 10%, transparent)`, padding: "10px 14px", fontSize: 13, color: T.down }}>
              {error}
            </div>
          )}

          <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            {initial && (
              <button
                type="button"
                onClick={slett}
                disabled={pending}
                style={{ borderRadius: 9999, border: `1px solid color-mix(in srgb, ${T.down} 35%, transparent)`, background: `color-mix(in srgb, ${T.down} 6%, transparent)`, padding: "8px 16px", fontSize: 12, fontWeight: 600, color: T.down, cursor: "pointer", opacity: pending ? 0.6 : 1 }}
              >
                Slett
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={pending}
              style={{ marginLeft: "auto", borderRadius: 9999, border: `1px solid ${T.border}`, background: T.panel2, padding: "10px 18px", fontSize: 13, fontWeight: 600, color: T.fg, cursor: "pointer", opacity: pending ? 0.6 : 1 }}
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={pending}
              style={{ borderRadius: 9999, border: "1px solid transparent", background: T.lime, padding: "10px 18px", fontSize: 13, fontWeight: 600, color: T.onLime, cursor: "pointer", opacity: pending ? 0.6 : 1 }}
            >
              {pending ? "Lagrer…" : "Lagre"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
