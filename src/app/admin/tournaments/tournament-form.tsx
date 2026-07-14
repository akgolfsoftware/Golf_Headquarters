"use client";

/**
 * Ny/endre turnering (kort skjema, brukt fra listetopp + detaljsidens
 * «Endre»-knapp) — v2. Logikk bevart 1:1 fra legacy tournament-form.tsx —
 * kun visuelt portert til TurneringModal + skjema.tsx-primitiver.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Inndata, Velger, TekstOmraade } from "@/components/v2/skjema";
import { TurneringModal, ModalFeil, ModalFooter, TekstTrigger } from "@/components/admin/v2/turnering-ui";
import { Knapp } from "@/components/v2";
import { createTournament, updateTournament, deleteTournament } from "./actions";

type Course = { id: string; name: string };

type Props = {
  initial?: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date | null;
    courseId: string | null;
    format: string;
    notes: string | null;
  };
  courses: Course[];
  triggerLabel: string;
};

const FORMATER = ["STROKE", "MATCH", "STABLEFORD", "OTHER"];

function toInputDate(d: Date | null): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export function TournamentForm({ initial, courses, triggerLabel }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [slettPending, startSlettTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [startDate, setStartDate] = useState(toInputDate(initial?.startDate ?? null));
  const [endDate, setEndDate] = useState(toInputDate(initial?.endDate ?? null));
  const [courseId, setCourseId] = useState(initial?.courseId ?? "");
  const [format, setFormat] = useState(initial?.format ?? "STROKE");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  function lagre() {
    if (!name.trim() || !startDate) {
      setError("Navn og startdato er påkrevd.");
      return;
    }
    if (endDate && endDate < startDate) {
      setError("Sluttdato må være etter startdato.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        if (initial) {
          await updateTournament(initial.id, {
            name,
            startDate,
            endDate: endDate || null,
            courseId: courseId || null,
            format,
            notes: notes || null,
          });
        } else {
          const id = await createTournament({
            name,
            startDate,
            endDate: endDate || null,
            courseId: courseId || null,
            format,
            notes: notes || null,
          });
          router.push(`/admin/tournaments/${id}`);
        }
        setOpen(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunne ikke lagre.");
      }
    });
  }

  function slett() {
    if (!initial) return;
    if (!confirm(`Slett turneringen «${initial.name}»?`)) return;
    startSlettTransition(async () => {
      try {
        await deleteTournament(initial.id);
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
        <Knapp onClick={() => setOpen(true)}>{triggerLabel}</Knapp>
      )}

      {open && (
        <TurneringModal title={initial ? "Endre turnering" : "Ny turnering"} onLukk={() => (pending ? undefined : setOpen(false))} busy={pending}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Inndata label="Navn" value={name} onChange={setName} placeholder="Klubbmesterskap 2026" />
            <div className="grid grid-cols-2" style={{ gap: 14 }}>
              <Inndata label="Startdato" type="date" value={startDate} onChange={setStartDate} />
              <Inndata label="Sluttdato (valgfri)" type="date" value={endDate} onChange={setEndDate} />
            </div>
            <div className="grid grid-cols-2" style={{ gap: 14 }}>
              <Velger
                label="Bane"
                value={courseId}
                onChange={setCourseId}
                options={[{ value: "", label: "— Ingen —" }, ...courses.map((c) => ({ value: c.id, label: c.name }))]}
              />
              <Velger label="Format" value={format} onChange={setFormat} options={FORMATER.map((f) => ({ value: f, label: f }))} />
            </div>
            <TekstOmraade label="Notater (valgfri)" value={notes} onChange={setNotes} rows={3} placeholder="Intern info, regler, premier…" />
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
