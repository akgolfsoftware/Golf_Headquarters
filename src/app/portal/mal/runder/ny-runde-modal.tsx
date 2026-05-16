"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createRound } from "./actions";

type Course = { id: string; name: string; par: number };

export function NyRundeModal({ courses }: { courses: Course[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const [playedAt, setPlayedAt] = useState(today);
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [score, setScore] = useState("");
  const [sgTotal, setSgTotal] = useState("");
  const [sgOtt, setSgOtt] = useState("");
  const [sgApp, setSgApp] = useState("");
  const [sgArg, setSgArg] = useState("");
  const [sgPutt, setSgPutt] = useState("");
  // Granulære SG-felter
  const [sgTee, setSgTee] = useState("");
  const [sgApp200, setSgApp200] = useState("");
  const [sgApp150, setSgApp150] = useState("");
  const [sgApp100, setSgApp100] = useState("");
  const [sgApp50, setSgApp50] = useState("");
  const [sgChip, setSgChip] = useState("");
  const [sgPitch, setSgPitch] = useState("");
  const [sgLob, setSgLob] = useState("");
  const [sgBunker, setSgBunker] = useState("");
  const [sgPutt0_3, setSgPutt0_3] = useState("");
  const [sgPutt3_5, setSgPutt3_5] = useState("");
  const [sgPutt5_10, setSgPutt5_10] = useState("");
  const [sgPutt10_15, setSgPutt10_15] = useState("");
  const [sgPutt15_25, setSgPutt15_25] = useState("");
  const [sgPutt25_40, setSgPutt25_40] = useState("");
  const [sgPutt40plus, setSgPutt40plus] = useState("");
  const [notes, setNotes] = useState("");

  const num = (s: string) => (s ? Number(s) : undefined);

  useEffect(() => {
    if (open) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [open]);

  function reset() {
    setPlayedAt(today);
    setScore("");
    setSgTotal("");
    setSgOtt("");
    setSgApp("");
    setSgArg("");
    setSgPutt("");
    setSgTee("");
    setSgApp200("");
    setSgApp150("");
    setSgApp100("");
    setSgApp50("");
    setSgChip("");
    setSgPitch("");
    setSgLob("");
    setSgBunker("");
    setSgPutt0_3("");
    setSgPutt3_5("");
    setSgPutt5_10("");
    setSgPutt10_15("");
    setSgPutt15_25("");
    setSgPutt25_40("");
    setSgPutt40plus("");
    setNotes("");
    setError(null);
  }

  function lukk() {
    setOpen(false);
    reset();
  }

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    if (!courseId) {
      setError("Velg bane.");
      return;
    }
    if (!score || isNaN(Number(score))) {
      setError("Score må være et tall.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await createRound({
          courseId,
          playedAt,
          score: Number(score),
          sgTotal: num(sgTotal),
          sgOtt: num(sgOtt),
          sgApp: num(sgApp),
          sgArg: num(sgArg),
          sgPutt: num(sgPutt),
          sgTee: num(sgTee),
          sgApp200: num(sgApp200),
          sgApp150: num(sgApp150),
          sgApp100: num(sgApp100),
          sgApp50: num(sgApp50),
          sgChip: num(sgChip),
          sgPitch: num(sgPitch),
          sgLob: num(sgLob),
          sgBunker: num(sgBunker),
          sgPutt0_3: num(sgPutt0_3),
          sgPutt3_5: num(sgPutt3_5),
          sgPutt5_10: num(sgPutt5_10),
          sgPutt10_15: num(sgPutt10_15),
          sgPutt15_25: num(sgPutt15_25),
          sgPutt25_40: num(sgPutt25_40),
          sgPutt40plus: num(sgPutt40plus),
          notes: notes || undefined,
        });
        lukk();
        router.refresh();
      } catch {
        setError("Kunne ikke lagre. Prøv igjen.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={courses.length === 0}
        className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        Ny runde
      </button>

      <dialog
        ref={dialogRef}
        onClose={lukk}
        className="rounded-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-foreground/40 max-w-lg w-full"
      >
        <form onSubmit={lagre} className="p-6">
          <h2 className="font-display text-xl font-semibold leading-tight tracking-tight">
            <em className="font-normal text-primary md:italic">Registrer</em> ny runde
          </h2>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            Fyll inn det du har — SG-feltene er valgfrie.
          </p>

          <div className="space-y-4">
            <Felt label="Dato">
              <input
                type="date"
                value={playedAt}
                onChange={(e) => setPlayedAt(e.target.value)}
                required
                className={input}
              />
            </Felt>
            <Felt label="Bane">
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                required
                className={input}
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (par {c.par})
                  </option>
                ))}
              </select>
            </Felt>
            <Felt label="Score">
              <input
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                required
                className={input}
              />
            </Felt>

            <details className="rounded-md border border-input bg-muted/30 px-4 py-4">
              <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                SG-felter (valgfrie)
              </summary>

              {/* Hovedkategorier */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <Felt label="SG total">
                  <input type="number" step="0.1" value={sgTotal} onChange={(e) => setSgTotal(e.target.value)} className={input} />
                </Felt>
                <Felt label="OTT (off the tee)">
                  <input type="number" step="0.1" value={sgOtt} onChange={(e) => setSgOtt(e.target.value)} className={input} />
                </Felt>
                <Felt label="APP (approach)">
                  <input type="number" step="0.1" value={sgApp} onChange={(e) => setSgApp(e.target.value)} className={input} />
                </Felt>
                <Felt label="ARG (around green)">
                  <input type="number" step="0.1" value={sgArg} onChange={(e) => setSgArg(e.target.value)} className={input} />
                </Felt>
                <Felt label="PUTT">
                  <input type="number" step="0.1" value={sgPutt} onChange={(e) => setSgPutt(e.target.value)} className={input} />
                </Felt>
              </div>

              {/* Tee */}
              <details className="mt-4 rounded-md border border-input/60 bg-card px-4 py-3">
                <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Tee
                </summary>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <Felt label="Tee Total">
                    <input type="number" step="0.1" value={sgTee} onChange={(e) => setSgTee(e.target.value)} className={input} />
                  </Felt>
                </div>
              </details>

              {/* Approach */}
              <details className="mt-3 rounded-md border border-input/60 bg-card px-4 py-3">
                <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Approach (per distanse)
                </summary>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <Felt label="Approach 200+ m">
                    <input type="number" step="0.1" value={sgApp200} onChange={(e) => setSgApp200(e.target.value)} className={input} />
                  </Felt>
                  <Felt label="Approach 150–200 m">
                    <input type="number" step="0.1" value={sgApp150} onChange={(e) => setSgApp150(e.target.value)} className={input} />
                  </Felt>
                  <Felt label="Approach 100–150 m">
                    <input type="number" step="0.1" value={sgApp100} onChange={(e) => setSgApp100(e.target.value)} className={input} />
                  </Felt>
                  <Felt label="Approach 50–100 m">
                    <input type="number" step="0.1" value={sgApp50} onChange={(e) => setSgApp50(e.target.value)} className={input} />
                  </Felt>
                </div>
              </details>

              {/* Nærspill */}
              <details className="mt-3 rounded-md border border-input/60 bg-card px-4 py-3">
                <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Nærspill
                </summary>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <Felt label="Chip">
                    <input type="number" step="0.1" value={sgChip} onChange={(e) => setSgChip(e.target.value)} className={input} />
                  </Felt>
                  <Felt label="Pitch">
                    <input type="number" step="0.1" value={sgPitch} onChange={(e) => setSgPitch(e.target.value)} className={input} />
                  </Felt>
                  <Felt label="Lob">
                    <input type="number" step="0.1" value={sgLob} onChange={(e) => setSgLob(e.target.value)} className={input} />
                  </Felt>
                  <Felt label="Bunker">
                    <input type="number" step="0.1" value={sgBunker} onChange={(e) => setSgBunker(e.target.value)} className={input} />
                  </Felt>
                </div>
              </details>

              {/* Putt */}
              <details className="mt-3 rounded-md border border-input/60 bg-card px-4 py-3">
                <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Putt (per distanse)
                </summary>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <Felt label="Putt 0–3 ft">
                    <input type="number" step="0.1" value={sgPutt0_3} onChange={(e) => setSgPutt0_3(e.target.value)} className={input} />
                  </Felt>
                  <Felt label="Putt 3–5 ft">
                    <input type="number" step="0.1" value={sgPutt3_5} onChange={(e) => setSgPutt3_5(e.target.value)} className={input} />
                  </Felt>
                  <Felt label="Putt 5–10 ft">
                    <input type="number" step="0.1" value={sgPutt5_10} onChange={(e) => setSgPutt5_10(e.target.value)} className={input} />
                  </Felt>
                  <Felt label="Putt 10–15 ft">
                    <input type="number" step="0.1" value={sgPutt10_15} onChange={(e) => setSgPutt10_15(e.target.value)} className={input} />
                  </Felt>
                  <Felt label="Putt 15–25 ft">
                    <input type="number" step="0.1" value={sgPutt15_25} onChange={(e) => setSgPutt15_25(e.target.value)} className={input} />
                  </Felt>
                  <Felt label="Putt 25–40 ft">
                    <input type="number" step="0.1" value={sgPutt25_40} onChange={(e) => setSgPutt25_40(e.target.value)} className={input} />
                  </Felt>
                  <Felt label="Putt 40+ ft">
                    <input type="number" step="0.1" value={sgPutt40plus} onChange={(e) => setSgPutt40plus(e.target.value)} className={input} />
                  </Felt>
                </div>
              </details>
            </details>

            <Felt label="Notat (valgfritt)">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                rows={3}
                className={input}
              />
            </Felt>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          <div className="mt-6 flex gap-4">
            <button
              type="button"
              onClick={lukk}
              disabled={pending}
              className="rounded-md border border-input bg-card px-4 py-2 text-sm font-medium text-foreground hover:border-border"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Lagrer…" : "Lagre runde"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}

const input =
  "w-full rounded-md border border-input bg-card px-4 py-2 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30";

function Felt({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
