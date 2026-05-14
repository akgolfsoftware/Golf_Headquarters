"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Send,
  Pencil,
  FileDown,
  Archive,
  Trash2,
  Copy,
  BookmarkPlus,
  Users,
  UserPlus,
  Search,
  X,
} from "lucide-react";
import {
  godkjennPlan,
  arkiverPlan,
  slettPlan,
  lagreSomMal,
  kopierPlan,
  sendTilSpiller,
} from "./actions";
import { dupliserPlan } from "../actions";

export type SpillerKandidat = {
  id: string;
  name: string;
  hcp: number | null;
  homeClub: string | null;
};

type Props = {
  planId: string;
  isActive: boolean;
  isAdmin: boolean;
  originalPlanNavn: string;
  originalUserId: string;
  spillere: SpillerKandidat[];
};

export function PlanActions({
  planId,
  isActive,
  isAdmin,
  originalPlanNavn,
  originalUserId,
  spillere,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [malModalOpen, setMalModalOpen] = useState(false);
  const [kopierModalOpen, setKopierModalOpen] = useState(false);

  function godkjenn() {
    startTransition(async () => {
      await godkjennPlan(planId);
      router.refresh();
    });
  }

  function arkiver() {
    if (!confirm("Arkivere planen? Den blir inaktiv, men beholdes i historikken.")) {
      return;
    }
    startTransition(async () => {
      await arkiverPlan(planId);
      router.refresh();
    });
  }

  function slett() {
    if (
      !confirm(
        "Slette planen permanent? Dette kan ikke angres. Alle økter og drills slettes også.",
      )
    ) {
      return;
    }
    startTransition(async () => {
      await slettPlan(planId);
    });
  }

  function dupliser() {
    startTransition(async () => {
      const newId = await dupliserPlan(planId);
      if (newId) router.push(`/admin/plans/${newId}`);
    });
  }

  function sendSpiller() {
    if (
      !confirm(
        "Sende planen til spiller for godkjenning? Spilleren får varsling og kan godta eller be om endring.",
      )
    ) {
      return;
    }
    startTransition(async () => {
      await sendTilSpiller(planId);
      router.refresh();
    });
  }

  function rediger() {
    // Plan-detalj-siden har inline redigering: drag-and-drop pluss
    // EditSessionModal pr. økt. "Rediger" scroller derfor til økt-listen
    // og fokuserer "Legg til økt"-knappen.
    if (typeof window === "undefined") return;
    const target = document.getElementById("plan-okter");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function eksportPdf() {
    // Åpne PDF-en i nytt vindu — nettleseren håndterer Content-Disposition
    // og laster ned med filnavnet vi setter i route-handleren.
    window.open(`/api/admin/plans/${planId}/pdf`, "_blank", "noopener");
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {!isActive && (
          <button
            type="button"
            onClick={godkjenn}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <Check className="h-4 w-4" strokeWidth={1.5} />
            Godkjenn
          </button>
        )}

        {isActive && (
          <button
            type="button"
            onClick={sendSpiller}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <Send className="h-4 w-4" strokeWidth={1.5} />
            Send til spiller
          </button>
        )}

        <button
          type="button"
          onClick={rediger}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
        >
          <Pencil className="h-4 w-4" strokeWidth={1.5} />
          Rediger
        </button>

        <button
          type="button"
          onClick={dupliser}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
        >
          <Copy className="h-4 w-4" strokeWidth={1.5} />
          Dupliser
        </button>

        <button
          type="button"
          onClick={() => setMalModalOpen(true)}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
        >
          <BookmarkPlus className="h-4 w-4" strokeWidth={1.5} />
          Lagre som mal
        </button>

        <button
          type="button"
          onClick={() => setKopierModalOpen(true)}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
        >
          <Users className="h-4 w-4" strokeWidth={1.5} />
          Kopier plan
        </button>

        <button
          type="button"
          onClick={eksportPdf}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
        >
          <FileDown className="h-4 w-4" strokeWidth={1.5} />
          Eksport PDF
        </button>

        {isActive && (
          <button
            type="button"
            onClick={arkiver}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-60"
          >
            <Archive className="h-4 w-4" strokeWidth={1.5} />
            Arkiver
          </button>
        )}

        {isAdmin && (
          <button
            type="button"
            onClick={slett}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-md border border-destructive/40 bg-card px-4 py-2 text-[13px] font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
            aria-label="Slett plan"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {malModalOpen && (
        <LagreSomMalModal
          planId={planId}
          onClose={() => setMalModalOpen(false)}
        />
      )}

      {kopierModalOpen && (
        <KopierPlanModal
          planId={planId}
          originalPlanNavn={originalPlanNavn}
          spillere={spillere.filter((s) => s.id !== originalUserId)}
          onClose={() => setKopierModalOpen(false)}
        />
      )}
    </>
  );
}

function KopierPlanModal({
  planId,
  originalPlanNavn,
  spillere,
  onClose,
}: {
  planId: string;
  originalPlanNavn: string;
  spillere: SpillerKandidat[];
  onClose: () => void;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const sokRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  const [sok, setSok] = useState("");
  const [valgtSpiller, setValgtSpiller] = useState<SpillerKandidat | null>(null);
  const [nyNavn, setNyNavn] = useState(`Kopi av ${originalPlanNavn}`);

  useEffect(() => {
    dialogRef.current?.showModal();
    requestAnimationFrame(() => sokRef.current?.focus());
  }, []);

  const filtrerteSpillere = useMemo(() => {
    const q = sok.trim().toLowerCase();
    if (!q) return spillere.slice(0, 20);
    return spillere
      .filter((s) => {
        const navn = s.name.toLowerCase();
        const klubb = (s.homeClub ?? "").toLowerCase();
        return navn.includes(q) || klubb.includes(q);
      })
      .slice(0, 20);
  }, [spillere, sok]);

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    if (!valgtSpiller) {
      setFeil("Velg en spiller å kopiere planen til.");
      return;
    }
    const navnTrimmet = nyNavn.trim();
    if (!navnTrimmet) {
      setFeil("Plan-navnet kan ikke være tomt.");
      return;
    }
    setFeil(null);
    startTransition(async () => {
      try {
        const res = await kopierPlan(planId, valgtSpiller.id, navnTrimmet);
        dialogRef.current?.close();
        onClose();
        router.push(`/admin/plans/${res.newPlanId}`);
      } catch {
        setFeil("Kunne ikke kopiere planen. Prøv igjen.");
      }
    });
  }

  function lukk() {
    dialogRef.current?.close();
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-modal="true"
      aria-labelledby="kopier-plan-title"
      className="w-full max-w-xl rounded-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-foreground/40"
    >
      <form onSubmit={lagre} className="p-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Kopier plan
            </div>
            <h3
              id="kopier-plan-title"
              className="mt-1 font-display text-xl leading-tight tracking-tight"
            >
              Kopier til{" "}
              <span className="font-display italic text-primary">
                annen spiller
              </span>
            </h3>
          </div>
          <button
            type="button"
            onClick={lukk}
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Lukk"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <p className="mb-4 text-sm text-muted-foreground">
          Kopierer hele planen med økter og drills. Den nye planen lagres som
          inaktiv (DRAFT) under valgt spiller.
        </p>

        <div className="space-y-4">
          <div>
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Velg mottaker
            </span>
            {valgtSpiller ? (
              <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-secondary/40 px-4 py-2">
                <div className="flex min-w-0 items-center gap-2 text-sm">
                  <UserPlus
                    className="h-4 w-4 shrink-0 text-primary"
                    strokeWidth={1.5}
                  />
                  <span className="truncate font-medium text-foreground">
                    {valgtSpiller.name}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="truncate text-muted-foreground">
                    {valgtSpiller.homeClub ?? "Uten klubb"}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    HCP {valgtSpiller.hcp ?? "–"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setValgtSpiller(null)}
                  className="shrink-0 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Endre
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    strokeWidth={1.5}
                  />
                  <input
                    ref={sokRef}
                    type="text"
                    value={sok}
                    onChange={(e) => setSok(e.target.value)}
                    placeholder="Søk på navn eller klubb…"
                    className="w-full rounded-md border border-input bg-card py-2 pl-8 pr-4 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                    autoComplete="off"
                  />
                </div>

                <div className="mt-2 max-h-56 overflow-y-auto rounded-md border border-border bg-background">
                  {filtrerteSpillere.length === 0 ? (
                    <div className="px-4 py-4 text-center text-sm text-muted-foreground">
                      Ingen spillere matcher søket.
                    </div>
                  ) : (
                    <ul className="divide-y divide-border">
                      {filtrerteSpillere.map((s) => (
                        <li key={s.id}>
                          <button
                            type="button"
                            onClick={() => setValgtSpiller(s)}
                            className="flex w-full items-center justify-between gap-4 px-4 py-2 text-left text-sm transition-colors hover:bg-secondary"
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              <UserPlus
                                className="h-4 w-4 shrink-0 text-muted-foreground"
                                strokeWidth={1.5}
                              />
                              <span className="truncate font-medium text-foreground">
                                {s.name}
                              </span>
                            </span>
                            <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                              <span className="max-w-[12rem] truncate">
                                {s.homeClub ?? "Uten klubb"}
                              </span>
                              <span>·</span>
                              <span className="font-mono tabular-nums">
                                HCP {s.hcp ?? "–"}
                              </span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>

          <label className="block">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Plan-navn på kopien
            </span>
            <input
              type="text"
              value={nyNavn}
              onChange={(e) => setNyNavn(e.target.value)}
              placeholder={`Kopi av ${originalPlanNavn}`}
              className="w-full rounded-md border border-input bg-card px-4 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              maxLength={200}
              required
            />
          </label>
        </div>

        {feil && (
          <div
            role="alert"
            className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
          >
            {feil}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-2 border-t border-border pt-4">
          <button
            type="button"
            onClick={lukk}
            disabled={pending}
            className="rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
          >
            Avbryt
          </button>
          <button
            type="submit"
            disabled={pending || !valgtSpiller}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Copy className="h-4 w-4" strokeWidth={1.5} />
            {pending ? "Kopierer…" : "Kopier plan"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

function LagreSomMalModal({
  planId,
  onClose,
}: {
  planId: string;
  onClose: () => void;
}) {
  const [malNavn, setMalNavn] = useState("");
  const [beskrivelse, setBeskrivelse] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [suksess, setSuksess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function lagre() {
    setFeil(null);
    setSuksess(null);
    startTransition(async () => {
      const res = await lagreSomMal(planId, malNavn, beskrivelse || undefined);
      if (res.ok) {
        setSuksess("Malen ble lagret. Den er nå tilgjengelig i mal-biblioteket.");
        setMalNavn("");
        setBeskrivelse("");
      } else {
        setFeil(res.feil);
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Lagre som mal
            </div>
            <h3 className="mt-1 font-display text-xl leading-tight tracking-tight">
              Gjør planen{" "}
              <span className="font-display italic text-primary">gjenbrukbar</span>
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Lukk"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {suksess ? (
          <div className="space-y-4">
            <div className="rounded-md border border-primary/30 bg-primary/5 px-4 py-4 text-sm text-foreground">
              {suksess}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Ferdig
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Mal-navn
              </label>
              <input
                value={malNavn}
                onChange={(e) => setMalNavn(e.target.value)}
                placeholder="F.eks. 8-ukers turneringsprep"
                className="w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Beskrivelse <span className="text-muted-foreground/60">(valgfri)</span>
              </label>
              <textarea
                value={beskrivelse}
                onChange={(e) => setBeskrivelse(e.target.value)}
                placeholder="Kort om når malen passer best."
                rows={3}
                className="w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm"
              />
            </div>

            {feil && (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-4 text-sm text-destructive">
                {feil}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={pending}
                className="rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
              >
                Avbryt
              </button>
              <button
                type="button"
                onClick={lagre}
                disabled={pending || malNavn.trim().length < 2}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <BookmarkPlus className="h-4 w-4" strokeWidth={1.8} />
                {pending ? "Lagrer…" : "Lagre mal"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
