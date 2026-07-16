"use client";

/**
 * Opprett gruppe — v2-native overlay (samme fixed/backdrop/T.*-mønster som
 * HurtigOpprett i src/components/v2/hurtig-opprett.tsx). Ekte createGroup-
 * server-action. Bygget av v2-skjema-primitiver (Inndata/Velger/SkjemaFelt)
 * — ingen ad-hoc UI, ingen rå hex.
 */

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { T, Caps, Icon, Knapp, SkjemaFelt, Inndata, Velger, ValideringsChip } from "@/components/v2";
import { createGroup } from "./actions";

export type CoachValg = { id: string; name: string };

export function OpprettGruppeModal({
  coaches,
  onClose,
}: {
  coaches: CoachValg[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const [navn, setNavn] = useState("");
  const [nivaa, setNivaa] = useState("");
  const [coachId, setCoachId] = useState<string>("");
  const [maxDeltagere, setMaxDeltagere] = useState("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const coachValg = ["Ingen coach satt", ...coaches.map((c) => c.name)];
  const coachLabel = coachId ? (coaches.find((c) => c.id === coachId)?.name ?? "Ingen coach satt") : "Ingen coach satt";

  function bekreft() {
    if (!navn.trim()) {
      setFeil("Navn er påkrevd.");
      return;
    }
    setFeil(null);
    startTransition(async () => {
      const maxN = maxDeltagere.trim() === "" ? null : Number(maxDeltagere);
      if (maxN !== null && (!Number.isFinite(maxN) || maxN < 1)) {
        setFeil("Maks deltagere må være et positivt tall.");
        return;
      }
      const res = await createGroup({
        name: navn.trim(),
        level: nivaa.trim() || null,
        coachId: coachId || null,
        maxParticipants: maxN,
      });
      if ("error" in res) {
        setFeil(res.error);
        return;
      }
      if (res.success && res.data) {
        router.push(`/admin/grupper/${res.data.groupId}`);
      }
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="opprett-gruppe-title"
      style={{ position: "fixed", inset: 0, zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
    >
      <div
        onClick={pending ? undefined : onClose}
        style={{ position: "absolute", inset: 0, background: `color-mix(in srgb, ${T.bg} 62%, transparent)`, backdropFilter: "blur(2px)" }}
      />
      <div
        style={{
          position: "relative",
          width: "min(460px, 100%)",
          background: T.panel,
          border: `1px solid ${T.borderS}`,
          borderRadius: T.rCard,
          padding: "20px 22px 22px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <Caps size={8.5}>Grupper · ny gruppe</Caps>
            <h2 id="opprett-gruppe-title" style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 19, letterSpacing: "-0.02em", color: T.fg, margin: "6px 0 0" }}>
              Opprett gruppe
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Lukk"
            className="v2-focus"
            style={{ appearance: "none", cursor: "pointer", width: 28, height: 28, borderRadius: 8, background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}
          >
            <Icon name="x" size={14} style={{ color: T.fg2 }} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}>
          <SkjemaFelt label="Navn" hjelp={undefined}>
            <Inndata label={null} value={navn} onChange={setNavn} placeholder="F.eks. WANG Toppidrett" />
          </SkjemaFelt>
          <SkjemaFelt label="Nivå (valgfritt)" hjelp="Styrer type-visning på gruppedetaljen — f.eks. A1–A5 (Selektert), S-prefiks (Skole).">
            <Inndata label={null} value={nivaa} onChange={setNivaa} placeholder="F.eks. A1" />
          </SkjemaFelt>
          <Velger
            label="Coach (valgfritt)"
            options={coachValg}
            value={coachLabel}
            onChange={(label) => setCoachId(coaches.find((c) => c.name === label)?.id ?? "")}
          />
          <SkjemaFelt label="Maks deltagere (valgfritt)" hjelp="Brukes som standard-tak for gruppens treningstider.">
            <Inndata label={null} mono value={maxDeltagere} onChange={setMaxDeltagere} placeholder="F.eks. 12" />
          </SkjemaFelt>
        </div>

        {feil && (
          <div style={{ marginTop: 14 }}>
            <ValideringsChip tone="advarsel" tekst={feil} />
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
          <Knapp ghost onClick={onClose} disabled={pending}>Avbryt</Knapp>
          <Knapp icon="plus" onClick={bekreft} disabled={pending}>
            {pending ? "Oppretter…" : "Opprett gruppe"}
          </Knapp>
        </div>
      </div>
    </div>
  );
}
