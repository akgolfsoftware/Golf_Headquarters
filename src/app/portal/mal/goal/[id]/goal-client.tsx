"use client";

/**
 * GoalDetailClient — interaktive handlinger for ett mål.
 *
 * Tre actions med modaler:
 *   - Endre mål           — modal med tittel/targetValue/targetDate
 *   - Marker som oppnådd  — feiring-modal med animasjon + bekreftelse
 *   - Avbryt mål          — modal som krever grunn (lagres på Goal.payload)
 *
 * Bruker server actions fra `mal/goals-actions.ts`.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Loader2,
  Pencil,
  PartyPopper,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";

import {
  avbrytGoal,
  endreGoal,
  markeerGoalSomOppnaadd,
  type GoalInput,
} from "../../goals-actions";

type Props = {
  goalId: string;
  isDummy?: boolean;
  initial: {
    title: string;
    type: string;
    targetValue: number | null;
    targetDate: string | null;
  };
};

export function GoalDetailClient({ goalId, isDummy = false, initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [openModal, setOpenModal] = useState<
    "endre" | "feire" | "avbryt" | null
  >(null);

  function lukk() {
    if (!pending) setOpenModal(null);
  }

  function bekreftEndre(input: GoalInput) {
    startTransition(async () => {
      await endreGoal(goalId, input);
      router.refresh();
      setOpenModal(null);
    });
  }

  function bekreftOppnadd() {
    startTransition(async () => {
      await markeerGoalSomOppnaadd(goalId);
      router.refresh();
      setOpenModal(null);
    });
  }

  function bekreftAvbryt(grunn: string) {
    startTransition(async () => {
      await avbrytGoal(goalId, grunn);
      router.push("/portal/mal");
    });
  }

  return (
    <>
      <section
        aria-label="Mål-handlinger"
        className="flex flex-wrap items-center gap-2 border-t border-border pt-8"
      >
        <button
          type="button"
          onClick={() => setOpenModal("endre")}
          disabled={pending || isDummy}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
        >
          <Pencil className="h-4 w-4" strokeWidth={1.75} />
          Endre mål
        </button>

        <button
          type="button"
          onClick={() => setOpenModal("feire")}
          disabled={pending || isDummy}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
          ) : (
            <Check className="h-4 w-4" strokeWidth={1.75} />
          )}
          Marker som oppnådd
        </button>

        <button
          type="button"
          onClick={() => setOpenModal("avbryt")}
          disabled={pending || isDummy}
          className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/5 px-6 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
          Avbryt mål
        </button>

        {isDummy && (
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Demo · handlinger ikke aktive
          </span>
        )}
      </section>

      {openModal === "endre" && (
        <EndreModal
          initial={initial}
          pending={pending}
          onClose={lukk}
          onConfirm={bekreftEndre}
        />
      )}
      {openModal === "feire" && (
        <FeireModal
          title={initial.title}
          pending={pending}
          onClose={lukk}
          onConfirm={bekreftOppnadd}
        />
      )}
      {openModal === "avbryt" && (
        <AvbrytModal
          title={initial.title}
          pending={pending}
          onClose={lukk}
          onConfirm={bekreftAvbryt}
        />
      )}
    </>
  );
}

/* -------- Modal-shell -------- */

function ModalShell({
  title,
  eyebrow,
  onClose,
  children,
}: {
  title: string;
  eyebrow: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-6 py-12 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <header className="flex items-start justify-between border-b border-border px-6 py-6">
          <div>
            <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {eyebrow}
            </span>
            <h2 className="mt-1 font-display text-[20px] font-semibold leading-tight tracking-tight">
              {title}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Lukk"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}

/* -------- Endre-modal -------- */

const GOAL_TYPES: Array<{ value: string; label: string }> = [
  { value: "HCP_TARGET", label: "Handicap-mål" },
  { value: "ROUNDS_PER_MONTH", label: "Runder per måned" },
  { value: "SG_AREA", label: "SG-område" },
  { value: "FREE_TEXT", label: "Fritekst" },
];

function EndreModal({
  initial,
  pending,
  onClose,
  onConfirm,
}: {
  initial: Props["initial"];
  pending: boolean;
  onClose: () => void;
  onConfirm: (input: GoalInput) => void;
}) {
  const [title, setTitle] = useState(initial.title);
  const [type, setType] = useState(initial.type);
  const [targetValue, setTargetValue] = useState<string>(
    initial.targetValue != null ? String(initial.targetValue) : "",
  );
  const [targetDate, setTargetDate] = useState<string>(
    initial.targetDate ?? "",
  );

  const dirty =
    title !== initial.title ||
    type !== initial.type ||
    targetValue !==
      (initial.targetValue != null ? String(initial.targetValue) : "") ||
    targetDate !== (initial.targetDate ?? "");

  function submit() {
    if (!title.trim()) return;
    onConfirm({
      type,
      title,
      targetValue: targetValue ? Number(targetValue) : null,
      targetDate: targetDate || null,
    });
  }

  return (
    <ModalShell
      eyebrow="MÅL · ENDRE"
      title="Endre mål"
      onClose={onClose}
    >
      <div className="space-y-4 px-6 py-6">
        <ModalField label="Tittel" required>
          <input
            className={modalInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </ModalField>
        <ModalField label="Type">
          <select
            className={modalInput}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {GOAL_TYPES.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </ModalField>
        <div className="grid grid-cols-2 gap-2">
          <ModalField label="Målverdi">
            <input
              type="number"
              className={`${modalInput} font-mono`}
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder="—"
            />
          </ModalField>
          <ModalField label="Frist">
            <input
              type="date"
              className={`${modalInput} font-mono`}
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </ModalField>
        </div>
      </div>

      <footer className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          Avbryt
        </button>
        <button
          type="button"
          disabled={!dirty || pending || !title.trim()}
          onClick={submit}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
          ) : (
            <Check className="h-3.5 w-3.5" strokeWidth={2} />
          )}
          Lagre endringer
        </button>
      </footer>
    </ModalShell>
  );
}

/* -------- Feire-modal -------- */

function FeireModal({
  title,
  pending,
  onClose,
  onConfirm,
}: {
  title: string;
  pending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalShell eyebrow="GRATULERER" title="Mål oppnådd" onClose={onClose}>
      <div className="space-y-6 px-6 py-8 text-center">
        <div className="relative mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary/15 text-primary">
          <Trophy className="h-10 w-10" strokeWidth={1.75} />
          <Sparkles
            className="absolute -right-1 -top-1 h-5 w-5 text-accent-foreground"
            strokeWidth={1.75}
          />
          <PartyPopper
            className="absolute -bottom-1 -left-1 h-5 w-5 text-primary"
            strokeWidth={1.75}
          />
        </div>
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
            Du markerer at du har nådd
          </p>
          <p className="mt-2 font-display text-[22px] font-semibold leading-tight">
            <em className="not-italic text-primary">«{title}»</em>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Målet flyttes til arkivet og coach blir varslet. Du kan se det
            igjen under «Oppnådde mål».
          </p>
        </div>
      </div>
      <footer className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          Ikke ennå
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
          ) : (
            <Check className="h-3.5 w-3.5" strokeWidth={2} />
          )}
          Bekreft og feir
        </button>
      </footer>
    </ModalShell>
  );
}

/* -------- Avbryt-modal -------- */

const AVBRYT_GRUNNER = [
  "Skade eller helse",
  "Endret prioritet",
  "Urealistisk frist",
  "Annet",
];

function AvbrytModal({
  title,
  pending,
  onClose,
  onConfirm,
}: {
  title: string;
  pending: boolean;
  onClose: () => void;
  onConfirm: (grunn: string) => void;
}) {
  const [grunn, setGrunn] = useState<string>("");
  const [annet, setAnnet] = useState<string>("");

  const samletGrunn = grunn === "Annet" ? annet : grunn;
  const kanAvbryte = !!samletGrunn.trim();

  return (
    <ModalShell eyebrow="MÅL · AVBRYT" title="Avbryt mål" onClose={onClose}>
      <div className="space-y-4 px-6 py-6">
        <p className="text-sm text-muted-foreground">
          Er du sikker på at du vil avbryte{" "}
          <em className="font-medium not-italic text-foreground">
            «{title}»
          </em>
          ? Målet beholdes i historikken, men markeres som avbrutt.
        </p>
        <ModalField label="Grunn" required>
          <div className="grid grid-cols-2 gap-2">
            {AVBRYT_GRUNNER.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGrunn(g)}
                className={`rounded-md border px-4 py-2 text-left text-sm transition-colors ${
                  grunn === g
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-foreground hover:bg-secondary"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </ModalField>
        {grunn === "Annet" && (
          <ModalField label="Beskriv">
            <textarea
              className={modalInput}
              rows={3}
              value={annet}
              onChange={(e) => setAnnet(e.target.value)}
              placeholder="Hvorfor avbryter du?"
            />
          </ModalField>
        )}
      </div>
      <footer className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          Behold mål
        </button>
        <button
          type="button"
          onClick={() => onConfirm(samletGrunn)}
          disabled={pending || !kanAvbryte}
          className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-6 py-2 text-sm font-semibold text-destructive hover:bg-destructive/20 disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
          ) : (
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          )}
          Avbryt mål
        </button>
      </footer>
    </ModalShell>
  );
}

/* -------- Subs -------- */

const modalInput =
  "w-full rounded-md border border-input bg-card px-4 py-2.5 text-sm text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30";

function ModalField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}
