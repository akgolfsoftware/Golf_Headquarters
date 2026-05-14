"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { opprettSchedule, oppdaterSchedule, slettSchedule } from "./actions";

type Initial = {
  id: string;
  title: string;
  description: string | null;
  startAt: string; // ISO string
  endAt: string;
  location: string | null;
  recurring: string | null;
};

type Props = {
  groupId: string;
  initial?: Initial;
  triggerLabel: string;
  triggerStyle?: "primary" | "link";
};

function toLocalInput(value: string | undefined | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ScheduleForm({ groupId, initial, triggerLabel, triggerStyle = "primary" }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [startAt, setStartAt] = useState(toLocalInput(initial?.startAt));
  const [endAt, setEndAt] = useState(toLocalInput(initial?.endAt));
  const [location, setLocation] = useState(initial?.location ?? "");
  const [recurring, setRecurring] = useState(initial?.recurring ?? "NONE");

  useEffect(() => {
    if (open) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [open]);

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Tittel er påkrevd.");
      return;
    }
    if (!startAt || !endAt) {
      setError("Start- og sluttid er påkrevd.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        if (initial) {
          await oppdaterSchedule(groupId, initial.id, {
            title,
            description: description || null,
            startAt,
            endAt,
            location: location || null,
            recurring,
          });
        } else {
          await opprettSchedule(groupId, {
            title,
            description: description || null,
            startAt,
            endAt,
            location: location || null,
            recurring,
          });
          setTitle("");
          setDescription("");
          setStartAt("");
          setEndAt("");
          setLocation("");
          setRecurring("NONE");
        }
        setOpen(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunne ikke lagre.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          triggerStyle === "link"
            ? "text-xs text-primary hover:underline"
            : "rounded-md border border-input bg-card px-4 py-1.5 text-xs font-medium hover:border-border"
        }
      >
        {triggerLabel}
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        className="rounded-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-foreground/40 max-w-lg w-full"
      >
        <form onSubmit={lagre} className="p-6">
          <h2 className="font-display text-xl font-semibold leading-tight tracking-tight">
            <em className="font-normal text-primary md:italic">
              {initial ? "Endre" : "Ny"}
            </em>{" "}
            treningstid
          </h2>

          <div className="mt-6 space-y-4">
            <Felt label="Tittel">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="F.eks. «Tirsdagstrening»"
                className={input}
              />
            </Felt>
            <Felt label="Beskrivelse">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className={input}
              />
            </Felt>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Felt label="Start">
                <input
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  className={input}
                />
              </Felt>
              <Felt label="Slutt">
                <input
                  type="datetime-local"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  className={input}
                />
              </Felt>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Felt label="Lokasjon">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="F.eks. «Performance Studio»"
                  className={input}
                />
              </Felt>
              <Felt label="Gjentas">
                <select
                  value={recurring}
                  onChange={(e) => setRecurring(e.target.value)}
                  className={input}
                >
                  <option value="NONE">Engangs</option>
                  <option value="WEEKLY">Ukentlig</option>
                </select>
              </Felt>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          <div className="mt-6 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={pending}
              className="ml-auto rounded-md border border-input bg-card px-4 py-2 text-sm font-medium hover:border-border"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Lagrer…" : "Lagre"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}

export function DeleteScheduleButton({
  groupId,
  scheduleId,
  title,
}: {
  groupId: string;
  scheduleId: string;
  title: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function slett() {
    if (!confirm(`Slett treningstiden «${title}»?`)) return;
    startTransition(async () => {
      await slettSchedule(groupId, scheduleId);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={slett}
      disabled={pending}
      className="text-xs text-destructive hover:underline disabled:opacity-60"
    >
      {pending ? "…" : "Slett"}
    </button>
  );
}

const input =
  "w-full rounded-md border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

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
