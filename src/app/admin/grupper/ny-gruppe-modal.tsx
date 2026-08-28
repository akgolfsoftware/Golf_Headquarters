"use client";
import { TL } from "@/lib/v2/train-lock";
// AgencyOS Grupper — «Ny gruppe»-modal. Bygget av v2-komponentbiblioteket
// (Inndata/Velger/Icon/T) per design-system-regel.md — ingen tailwind, ingen
// rå hex. Native <dialog> for fokusfelle/backdrop (samme mønster som
// [id]/legg-til-medlem-modal.tsx), styling via T-tokens siden GrupperV2 er en
// ren v2-skjerm.

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon, Inndata, Velger } from "@/components/v2";
import { createGroup } from "./actions";
export type CoachValg = { id: string; name: string };

const NIVAA_VALG = [
  { value: "", label: "Ingen (klubb)" },
  { value: "A1", label: "A1" },
  { value: "A2", label: "A2" },
  { value: "A3", label: "A3" },
  { value: "A4", label: "A4" },
  { value: "A5", label: "A5" },
];

function ensureNyGruppeStyle(): void {
  if (typeof document === "undefined" || document.getElementById("ny-gruppe-modal-style")) return;
  const el = document.createElement("style");
  el.id = "ny-gruppe-modal-style";
  el.textContent = ".ny-gruppe-dialog::backdrop{background:rgba(6,7,6,0.62);backdrop-filter:blur(2px);}";
  document.head.appendChild(el);
}
if (typeof document !== "undefined") ensureNyGruppeStyle();

export function NyGruppeModal({
  coaches,
  onClose,
}: {
  coaches: CoachValg[];
  onClose: () => void;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const [navn, setNavn] = useState("");
  const [nivaa, setNivaa] = useState("");
  const [coachId, setCoachId] = useState("");
  const [maxDeltagere, setMaxDeltagere] = useState("");

  useEffect(() => {
    dialogRef.current?.showModal();
    requestAnimationFrame(() => dialogRef.current?.querySelector("input")?.focus());
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        lukk();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function lukk() {
    dialogRef.current?.close();
    onClose();
  }

  function bekreft() {
    if (!navn.trim()) {
      setFeil("Navn er påkrevd.");
      return;
    }
    setFeil(null);
    startTransition(async () => {
      const res = await createGroup({
        name: navn,
        level: nivaa || null,
        coachId: coachId || null,
        maxParticipants: maxDeltagere.trim() ? Number(maxDeltagere) : null,
      });
      if ("error" in res) {
        setFeil(res.error);
        return;
      }
      const groupId = res.data?.groupId;
      lukk();
      if (groupId) router.push(`/admin/grupper/${groupId}`);
    });
  }

  const coachValg = [
    { value: "", label: "Ingen coach satt" },
    ...coaches.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-modal="true"
      aria-labelledby="ny-gruppe-title"
      className="ny-gruppe-dialog"
      style={{
        margin: "auto",
        padding: 0,
        border: `1px solid ${TL.hair}`,
        borderRadius: 20,
        background: TL.elev,
        boxShadow: "none",
        width: "min(480px, calc(100vw - 32px))",
        color: TL.text,
      }}
    >
      <div style={{ padding: "22px 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontFamily: TL.font.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.10em", color: TL.mute }}>
              Grupper · ny gruppe
            </div>
            <h2
              id="ny-gruppe-title"
              style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em", color: TL.text, margin: "4px 0 0" }}
            >
              Opprett gruppe
            </h2>
          </div>
          <button
            type="button"
            onClick={lukk}
            aria-label="Lukk"
            style={{ width: 28, height: 28, borderRadius: 8, background: TL.dock, border: `1px solid ${TL.hair}`, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flex: "none" }}
          >
            <Icon name="x" size={14} style={{ color: TL.mute }} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 20 }}>
          <Inndata label="Navn" value={navn} onChange={setNavn} placeholder="F.eks. WANG Toppidrett A1" />
          <Velger label="Nivå" options={NIVAA_VALG} value={nivaa} onChange={setNivaa} />
          <Velger label="Coach" options={coachValg} value={coachId} onChange={setCoachId} />
          <Inndata label="Maks deltagere" value={maxDeltagere} onChange={setMaxDeltagere} type="number" placeholder="Valgfritt" />
        </div>

        {feil && (
          <div
            role="alert"
            style={{
              marginTop: 16,
              borderRadius: 10,
              border: `1px solid color-mix(in srgb,${TL.danger} 30%,transparent)`,
              background: `color-mix(in srgb,${TL.danger} 10%,${TL.elev})`,
              padding: "9px 12px",
              fontFamily: TL.font.sans,
              fontSize: 12.5,
              color: TL.danger,
            }}
          >
            {feil}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 22 }}>
          <button
            type="button"
            onClick={lukk}
            disabled={pending}
            style={{
              fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.text,
              background: TL.dim, border: `1px solid ${TL.hair}`, borderRadius: 9999,
              padding: "9px 16px", cursor: pending ? "default" : "pointer", opacity: pending ? 0.6 : 1,
            }}
          >
            Avbryt
          </button>
          <button
            type="button"
            onClick={bekreft}
            disabled={pending || !navn.trim()}
            style={{
              fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.onFill,
              background: TL.fill, border: "none", borderRadius: 9999, padding: "9px 18px",
              cursor: pending || !navn.trim() ? "default" : "pointer", opacity: pending || !navn.trim() ? 0.5 : 1,
            }}
          >
            {pending ? "Oppretter…" : "Opprett gruppe"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
