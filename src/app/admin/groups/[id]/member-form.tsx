"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addMember, removeMember } from "../actions";

type Player = { id: string; name: string };

type Props = {
  groupId: string;
  players: Player[];
};

export function MemberForm({ groupId, players }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("PLAYER");

  useEffect(() => {
    if (open) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [open]);

  function leggTil(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) {
      setError("Velg en spiller.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await addMember(groupId, userId, role);
        setUserId("");
        setRole("PLAYER");
        setOpen(false);
        router.refresh();
      } catch {
        setError("Kunne ikke legge til.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-input bg-card px-3 py-1.5 text-xs font-medium hover:border-border"
      >
        + Legg til medlem
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        className="rounded-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-foreground/40 max-w-sm w-full"
      >
        <form onSubmit={leggTil} className="p-6">
          <h2 className="font-display text-xl font-semibold leading-tight tracking-tight">
            <em className="font-normal text-primary md:italic">Nytt</em> medlem
          </h2>

          <div className="mt-5 space-y-3">
            <Felt label="Spiller">
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className={input}
              >
                <option value="">— Velg —</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Felt>
            <Felt label="Rolle">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={input}
              >
                <option value="PLAYER">Spiller</option>
                <option value="ASSISTANT">Assistent</option>
              </select>
            </Felt>
          </div>

          {error && (
            <div role="alert" className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
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
              {pending ? "Lagrer…" : "Legg til"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}

export function RemoveMemberButton({
  groupId,
  memberId,
  memberName,
}: {
  groupId: string;
  memberId: string;
  memberName: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function fjern() {
    if (!confirm(`Fjern ${memberName} fra gruppen?`)) return;
    startTransition(async () => {
      await removeMember(groupId, memberId);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={fjern}
      disabled={pending}
      className="text-xs text-destructive hover:underline disabled:opacity-60"
    >
      {pending ? "…" : "Fjern"}
    </button>
  );
}

const input =
  "w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

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
