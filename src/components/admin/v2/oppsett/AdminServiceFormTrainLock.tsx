"use client";

/**
 * AgencyOS — Tjeneste-skjema (opprett/endre/slett), Train-lock
 * (T13-detaljer, 27.08.2026). Port av `ServiceFormV2` (Paper/T.*) — samme
 * server actions (createService/updateService/deleteService) uendret.
 */

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import { createService, updateService, deleteService } from "@/app/admin/(legacy)/services/actions";
import { TlCaps, TlKnapp } from "./tl-kit";

type ServiceFormTrainLockProps = {
  initial?: {
    id: string;
    name: string;
    description: string | null;
    priceOre: number;
    durationMin: number;
    active: boolean;
  };
  triggerLabel: string;
  triggerVariant?: "primaer" | "lenke";
};

function Felt({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ marginBottom: 6 }}><TlCaps size={10}>{label}</TlCaps></div>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 40,
  borderRadius: TL.radius.field,
  border: "none",
  boxShadow: `inset 0 0 0 1px ${TL.hair}`,
  background: TL.dock,
  padding: "0 12px",
  fontSize: 13,
  color: TL.text,
  outline: "none",
  boxSizing: "border-box",
};

export function ServiceFormTrainLock({ initial, triggerLabel, triggerVariant = "primaer" }: ServiceFormTrainLockProps) {
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
      {triggerVariant === "primaer" ? (
        <TlKnapp variant="primaer" icon="plus" full onClick={() => setOpen(true)}>
          {triggerLabel}
        </TlKnapp>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: TL.text, padding: 0 }}
        >
          {triggerLabel}
        </button>
      )}

      <style>{`dialog[data-tl-service-form]::backdrop { background: var(--tl-scrim); }`}</style>
      <dialog
        ref={dialogRef}
        data-tl-service-form
        onClose={() => setOpen(false)}
        style={{
          borderRadius: TL.radius.sheet,
          border: "none",
          background: TL.elev,
          padding: 0,
          boxShadow: `inset 0 0 0 1px ${TL.hair}`,
          maxWidth: 420,
          width: "100%",
          color: TL.text,
        }}
      >
        <form onSubmit={lagre} style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div>
              <TlCaps>{initial ? "Endre" : "Ny"} tjeneste</TlCaps>
              <h2 style={{ margin: "6px 0 0", fontWeight: 700, fontSize: 20, color: TL.text }}>{name || (initial ? "Endre tjeneste" : "Ny tjeneste")}</h2>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Lukk"
              style={{ display: "grid", placeItems: "center", width: 28, height: 28, borderRadius: 8, background: TL.dock, border: "none", boxShadow: `inset 0 0 0 1px ${TL.hair}`, color: TL.mute, cursor: "pointer" }}
            >
              <Icon name="x" size={14} />
            </button>
          </div>

          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
            <Felt label="Navn">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="f.eks. Coaching 60 min" style={inputStyle} />
            </Felt>
            <Felt label="Beskrivelse (valgfritt)">
              <textarea value={description ?? ""} onChange={(e) => setDescription(e.target.value.slice(0, 300))} rows={2} style={{ ...inputStyle, height: "auto", padding: "10px 12px", resize: "vertical" }} />
            </Felt>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Felt label="Pris (kr)">
                <input type="number" step="50" min="0" value={priceKr} onChange={(e) => setPriceKr(e.target.value)} style={inputStyle} />
              </Felt>
              <Felt label="Varighet (min)">
                <input type="number" step="5" min="5" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} style={inputStyle} />
              </Felt>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: TL.text }}>
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} style={{ width: 16, height: 16, accentColor: TL.fill }} />
              Aktiv (kan bookes)
            </label>
          </div>

          {error && (
            <div role="alert" style={{ marginTop: 14, borderRadius: 10, boxShadow: `inset 0 0 0 1px ${TL.danger}`, padding: "10px 14px", fontSize: 13, color: TL.danger }}>
              {error}
            </div>
          )}

          <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            {initial && (
              <TlKnapp variant="fare" disabled={pending} onClick={slett}>
                Slett
              </TlKnapp>
            )}
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <TlKnapp variant="tertiaer" disabled={pending} onClick={() => setOpen(false)}>
                Avbryt
              </TlKnapp>
              <TlKnapp type="submit" variant="primaer" disabled={pending}>
                {pending ? "Lagrer…" : "Lagre"}
              </TlKnapp>
            </div>
          </div>
        </form>
      </dialog>
    </>
  );
}
