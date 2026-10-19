"use client";

/**
 * Nytt eller endret turneringsresultat i et ark — nytt design (19.10.2026).
 * Samme server-handlinger som før (addResult, deleteResult). Sletting bekreftes
 * i arket med rust knapp.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Knapp, Varsel } from "@/components/admin/agencyos-ny/ny";
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
  const [bekreftSlett, setBekreftSlett] = useState(false);
  const [pending, startTransition] = useTransition();
  const [slettPending, startSlettTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [userId, setUserId] = useState(initial?.userId ?? "");
  const [position, setPosition] = useState<string>(initial?.position != null ? String(initial.position) : "");
  const [score, setScore] = useState<string>(initial?.score != null ? String(initial.score) : "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  function lagre(e: React.FormEvent) {
    e.preventDefault();
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

  const lukk = () => { if (!pending) { setOpen(false); setBekreftSlett(false); } };

  return (
    <>
      <Knapp variant={initial ? "spok" : "sek"} onClick={() => setOpen(true)}>{triggerLabel}</Knapp>

      {open && (
        <div className="ark-lag" role="dialog" aria-modal="true" aria-labelledby="resultat-ark-tittel" onClick={lukk}>
          <form className="ark" onClick={(e) => e.stopPropagation()} onSubmit={lagre}>
            <div className="ark-topp"><h2 id="resultat-ark-tittel">{initial ? "Endre resultat" : "Nytt resultat"}</h2>
              <Knapp variant="spok" onClick={lukk}>Lukk</Knapp></div>
            {initial ? (
              <div className="felt"><span className="etikett">Spiller</span><b>{players.find((p) => p.id === userId)?.name ?? "—"}</b></div>
            ) : (
              <label className="felt"><span className="etikett">Spiller</span>
                <select value={userId} onChange={(e) => setUserId(e.target.value)}>
                  <option value="">Velg spiller</option>
                  {players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select></label>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
              <label className="felt"><span className="etikett">Plassering</span><input type="number" inputMode="numeric" className="mono" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="1" /></label>
              <label className="felt"><span className="etikett">Score</span><input type="number" inputMode="numeric" className="mono" value={score} onChange={(e) => setScore(e.target.value)} placeholder="72" /></label>
            </div>
            <label className="felt"><span className="etikett">Notater</span><textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} style={{ resize: "vertical" }} /></label>

            {error && <Varsel tone="advarsel" tittel="Ikke lagret">{error}</Varsel>}

            {bekreftSlett && initial ? (
              <div className="kort dempet" style={{ display: "grid", gap: 10 }}>
                <b className="undertittel">Slette resultatet?</b>
                <div className="knapper">
                  <Knapp variant="rust" disabled={slettPending} onClick={slett}>{slettPending ? "Sletter …" : "Slett resultatet"}</Knapp>
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
