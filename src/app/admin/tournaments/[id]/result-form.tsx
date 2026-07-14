"use client";

/**
 * Nytt/endre resultat — v2. Logikk bevart 1:1 fra legacy result-form.tsx —
 * kun visuelt portert til TurneringModal + skjema.tsx-primitiver.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Inndata, Velger, TekstOmraade } from "@/components/v2/skjema";
import { Caps, T } from "@/components/v2";
import { TurneringModal, ModalFeil, ModalFooter, TekstTrigger } from "@/components/admin/v2/turnering-ui";
import { Knapp } from "@/components/v2";
import { addResult, deleteResult } from "@/app/admin/tournaments/actions";

type Player = { id: string; name: string };

type Props = {
  tournamentId: string;
  players: Player[];
  initial?: {
    id: string;
    userId: string;
    position: number | null;
    score: number | null;
    notes: string | null;
  };
  triggerLabel: string;
};

export function ResultForm({ tournamentId, players, initial, triggerLabel }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [slettPending, startSlettTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [userId, setUserId] = useState(initial?.userId ?? "");
  const [position, setPosition] = useState<string>(initial?.position != null ? String(initial.position) : "");
  const [score, setScore] = useState<string>(initial?.score != null ? String(initial.score) : "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  function lagre() {
    if (!userId) {
      setError("Velg en spiller.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await addResult(tournamentId, {
          userId,
          position: position ? Number(position) : null,
          score: score ? Number(score) : null,
          notes: notes || null,
        });
        setOpen(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunne ikke lagre.");
      }
    });
  }

  function slett() {
    if (!initial) return;
    if (!confirm("Slett dette resultatet?")) return;
    startSlettTransition(async () => {
      try {
        await deleteResult(tournamentId, initial.id);
        setOpen(false);
        router.refresh();
      } catch {
        setError("Kunne ikke slette.");
      }
    });
  }

  return (
    <>
      {initial ? (
        <TekstTrigger onClick={() => setOpen(true)}>{triggerLabel}</TekstTrigger>
      ) : (
        <Knapp ghost onClick={() => setOpen(true)}>
          {triggerLabel}
        </Knapp>
      )}

      {open && (
        <TurneringModal title={initial ? "Endre resultat" : "Nytt resultat"} onLukk={() => (pending ? undefined : setOpen(false))} busy={pending}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {initial ? (
              <div>
                <Caps size={9} style={{ marginBottom: 7 }}>Spiller</Caps>
                <div style={{ borderRadius: 11, background: T.panel2, border: `1px solid ${T.border}`, padding: "10px 13px", fontFamily: T.ui, fontSize: 13.5, color: T.mut }}>
                  {players.find((p) => p.id === userId)?.name ?? "—"}
                </div>
              </div>
            ) : (
              <Velger
                label="Spiller"
                value={userId}
                onChange={setUserId}
                options={[{ value: "", label: "— Velg —" }, ...players.map((p) => ({ value: p.id, label: p.name }))]}
              />
            )}
            <div className="grid grid-cols-2" style={{ gap: 14 }}>
              <Inndata label="Plassering" type="number" mono value={position} onChange={setPosition} placeholder="1" />
              <Inndata label="Score" type="number" mono value={score} onChange={setScore} placeholder="72" />
            </div>
            <TekstOmraade label="Notater" value={notes} onChange={setNotes} rows={2} />
          </div>

          {error && <ModalFeil>{error}</ModalFeil>}

          <ModalFooter
            onAvbryt={() => setOpen(false)}
            onSlett={initial ? slett : undefined}
            onLagre={lagre}
            busy={pending}
            slettBusy={slettPending}
          />
        </TurneringModal>
      )}
    </>
  );
}
