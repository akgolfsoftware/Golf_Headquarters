"use client";

// ============================================================
// CoachActions — interaktive coach-handlinger i Workbench-inspektøren
// (kun role="coach"). Erstatter de døde `type="button"`-knappene fra
// den portede v10-inspektøren.
//
// Workbench er foreløpig et visuelt demo-skall (økt-data har ingen
// stabil id/backend her), så vi fabrikkerer ikke falsk «lagret»-følelse:
//   • Notat / video / oppgave  → modal med felt → bekreftet-state som
//     tydelig sier at lagring kobles på når økt-data finnes.
//   • Godkjenn / løft           → modal «Bekreft» → bekreftet-state.
//   • Send melding              → navigerer til /admin/innboks (ekte flate),
//     med ?spiller=<id> som kontekst når coach-ruten gir spiller-id.
// Knapp-stilen (.coach-act) er uendret fra v10 så designet holder.
// ============================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

type CoachActionsProps = {
  /** spiller-id (coach-rute) — gir kontekst til innboks-lenken. */
  playerId?: string;
  /** spillernavn for etiketter (demo: «Øyvind»). */
  playerName: string;
  /** tittel på valgt økt — vises i modalen for kontekst. */
  sessionTitle: string;
};

/** Hvilken modal som er åpen. */
type ModalKind = "note" | "video" | "task" | "approve" | "elevate" | null;

export function CoachActions({ playerId, playerName, sessionTitle }: CoachActionsProps) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalKind>(null);

  function sendMelding() {
    // Innboksen er den kanoniske meldingsflaten. Ta med spiller-kontekst
    // når coach-ruten ga oss en id (ren demo uten id → bare innboksen).
    const href = playerId
      ? `/admin/innboks?spiller=${encodeURIComponent(playerId)}`
      : "/admin/innboks";
    router.push(href);
  }

  return (
    <div className="insp-sec">
      <div className="sec-lbl">COACH-HANDLINGER</div>
      <div className="coach-actions">
        <button
          type="button"
          className="coach-act pri"
          onClick={() => setModal("note")}
        >
          <Icon n="pencil-line" w={14} h={14} />
          Legg til notat på økt
        </button>
        <button type="button" className="coach-act" onClick={() => setModal("video")}>
          <Icon n="video" w={14} h={14} />
          Legg til video / link
        </button>
        <button type="button" className="coach-act" onClick={() => setModal("task")}>
          <Icon n="check-square" w={14} h={14} />
          Opprett oppgave til {playerName}
        </button>
        <button type="button" className="coach-act" onClick={sendMelding}>
          <Icon n="send" w={14} h={14} />
          Send melding
        </button>
        <button type="button" className="coach-act" onClick={() => setModal("approve")}>
          <Icon n="check-circle-2" w={14} h={14} />
          Godkjenn plan-endring
        </button>
        <button type="button" className="coach-act" onClick={() => setModal("elevate")}>
          <Icon n="arrow-up-right" w={14} h={14} />
          Løft til hovedcoach
        </button>
      </div>

      {/* Felt-modaler: notat / video / oppgave */}
      <InputActionModal
        open={modal === "note"}
        onClose={() => setModal(null)}
        title="Legg til notat på økt"
        description={sessionTitle}
        fieldLabel="Notat"
        placeholder="Skriv et kort notat til denne økten …"
        submitLabel="Lagre notat"
        multiline
      />
      <InputActionModal
        open={modal === "video"}
        onClose={() => setModal(null)}
        title="Legg til video / link"
        description={sessionTitle}
        fieldLabel="Video- eller lenke-URL"
        placeholder="https://…"
        submitLabel="Legg til"
      />
      <InputActionModal
        open={modal === "task"}
        onClose={() => setModal(null)}
        title={`Opprett oppgave til ${playerName}`}
        description={sessionTitle}
        fieldLabel="Oppgave"
        placeholder={`Hva skal ${playerName} gjøre …`}
        submitLabel="Opprett oppgave"
        multiline
      />

      {/* Bekreft-modaler: godkjenn / løft */}
      <ConfirmActionModal
        open={modal === "approve"}
        onClose={() => setModal(null)}
        title="Godkjenn plan-endring"
        body="Godkjenn den foreslåtte endringen i denne planen?"
        confirmLabel="Godkjenn"
      />
      <ConfirmActionModal
        open={modal === "elevate"}
        onClose={() => setModal(null)}
        title="Løft til hovedcoach"
        body="Send denne økten til hovedcoach for gjennomgang?"
        confirmLabel="Løft"
      />
    </div>
  );
}

// ── Felt-modal: ett felt + lagre → bekreftet-state ────────────
function InputActionModal({
  open,
  onClose,
  title,
  description,
  fieldLabel,
  placeholder,
  submitLabel,
  multiline = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  fieldLabel: string;
  placeholder: string;
  submitLabel: string;
  multiline?: boolean;
}) {
  const [value, setValue] = useState("");
  const [done, setDone] = useState(false);

  function close() {
    setValue("");
    setDone(false);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? undefined : close())}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          {done ? (
            <ConfirmedNote />
          ) : (
            <label className="block space-y-2">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {fieldLabel}
              </span>
              {multiline ? (
                <Textarea
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={placeholder}
                  rows={4}
                  autoFocus
                />
              ) : (
                <Input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={placeholder}
                  autoFocus
                />
              )}
            </label>
          )}
        </DialogBody>
        <DialogFooter>
          {done ? (
            <Button onClick={close}>Lukk</Button>
          ) : (
            <>
              <Button variant="ghost-light" onClick={close}>
                Avbryt
              </Button>
              <Button onClick={() => setDone(true)} disabled={value.trim().length === 0}>
                {submitLabel}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Bekreft-modal: ja/nei → bekreftet-state ───────────────────
function ConfirmActionModal({
  open,
  onClose,
  title,
  body,
  confirmLabel,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  body: string;
  confirmLabel: string;
}) {
  const [done, setDone] = useState(false);

  function close() {
    setDone(false);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? undefined : close())}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          {done ? <ConfirmedNote /> : <p className="text-sm text-foreground">{body}</p>}
        </DialogBody>
        <DialogFooter>
          {done ? (
            <Button onClick={close}>Lukk</Button>
          ) : (
            <>
              <Button variant="ghost-light" onClick={close}>
                Avbryt
              </Button>
              <Button onClick={() => setDone(true)}>{confirmLabel}</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Ærlig bekreftelse — ingen falsk «lagret på server»-påstand.
function ConfirmedNote() {
  return (
    <div className="flex items-start gap-3 rounded-md border border-border bg-secondary/50 p-4">
      <span className="mt-0.5 text-[var(--success)]">
        <Icon n="check-circle-2" w={18} h={18} />
      </span>
      <p className="text-sm leading-relaxed text-foreground">
        Registrert. Lagring kobles til når økt-dataen er på plass.
      </p>
    </div>
  );
}
