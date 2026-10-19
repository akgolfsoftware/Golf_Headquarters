"use client";

/**
 * Endre (eller opprette) turnering i et ark — nytt design (19.10.2026).
 * Vises inni .agn-s på turneringssiden. Samme server-handlinger som før
 * (createTournament, updateTournament, deleteTournament). Sletting bekreftes
 * i arket med rust knapp.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Knapp, Varsel } from "@/components/admin/agencyos-ny/ny";
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
const RAD = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 } as const;

function toInputDate(d: Date | null): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export function TournamentForm({ initial, courses, triggerLabel }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [bekreftSlett, setBekreftSlett] = useState(false);
  const [pending, startTransition] = useTransition();
  const [slettPending, startSlettTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [startDate, setStartDate] = useState(toInputDate(initial?.startDate ?? null));
  const [endDate, setEndDate] = useState(toInputDate(initial?.endDate ?? null));
  const [courseId, setCourseId] = useState(initial?.courseId ?? "");
  const [format, setFormat] = useState(initial?.format ?? "STROKE");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !startDate) {
      setError("Navn og startdato må fylles inn.");
      return;
    }
    if (endDate && endDate < startDate) {
      setError("Sluttdato må være etter startdato.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const data = { name, startDate, endDate: endDate || null, courseId: courseId || null, format, notes: notes || null };
        if (initial) {
          await updateTournament(initial.id, data);
        } else {
          const id = await createTournament(data);
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
    startSlettTransition(async () => {
      try {
        await deleteTournament(initial.id);
      } catch {
        setError("Kunne ikke slette.");
      }
    });
  }

  const lukk = () => { if (!pending) { setOpen(false); setBekreftSlett(false); } };

  return (
    <>
      <Knapp variant={initial ? "sek" : "pri"} onClick={() => setOpen(true)}>{triggerLabel}</Knapp>

      {open && (
        <div className="ark-lag" role="dialog" aria-modal="true" aria-labelledby="turnering-ark-tittel" onClick={lukk}>
          <form className="ark" onClick={(e) => e.stopPropagation()} onSubmit={lagre}>
            <div className="ark-topp"><h2 id="turnering-ark-tittel">{initial ? "Endre turnering" : "Ny turnering"}</h2>
              <Knapp variant="spok" onClick={lukk}>Lukk</Knapp></div>
            <label className="felt"><span className="etikett">Navn</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Klubbmesterskap 2026" /></label>
            <div style={RAD}>
              <label className="felt"><span className="etikett">Startdato</span><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label>
              <label className="felt"><span className="etikett">Sluttdato (valgfritt)</span><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></label>
            </div>
            <div style={RAD}>
              <label className="felt"><span className="etikett">Bane</span>
                <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                  <option value="">Ingen</option>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select></label>
              <label className="felt"><span className="etikett">Format</span>
                <select value={format} onChange={(e) => setFormat(e.target.value)}>
                  {FORMATER.map((f) => <option key={f} value={f}>{f}</option>)}
                </select></label>
            </div>
            <label className="felt"><span className="etikett">Notater (valgfritt)</span>
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Regler, premier, intern info" style={{ resize: "vertical" }} /></label>

            {error && <Varsel tone="advarsel" tittel="Ikke lagret">{error}</Varsel>}

            {bekreftSlett && initial ? (
              <div className="kort dempet" style={{ display: "grid", gap: 10 }}>
                <b className="undertittel">Slette «{initial.name}»?</b>
                <p className="forklar">Turneringen fjernes. Det kan ikke angres.</p>
                <div className="knapper">
                  <Knapp variant="rust" disabled={slettPending} onClick={slett}>{slettPending ? "Sletter …" : "Slett turneringen"}</Knapp>
                  <Knapp variant="spok" onClick={() => setBekreftSlett(false)}>Avbryt</Knapp>
                </div>
              </div>
            ) : (
              <div className="knapper">
                <Knapp type="submit" disabled={pending}>{pending ? "Lagrer …" : "Lagre"}</Knapp>
                <Knapp variant="spok" onClick={lukk}>Avbryt</Knapp>
                {initial && <Knapp variant="spok" onClick={() => setBekreftSlett(true)} style={{ marginLeft: "auto" }}>Slett</Knapp>}
              </div>
            )}
          </form>
        </div>
      )}
    </>
  );
}
