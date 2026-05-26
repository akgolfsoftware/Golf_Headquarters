"use client";

/**
 * Del-runde-modal — gjenbrukbar fra PlayerHQ.
 *
 * Brukes fra /portal/mal/runder/[id] og /portal/mal/runder/[id]/shot-by-shot.
 * Spiller velger format (Story / Post / PDF / Lenke), synlighet (privat,
 * coach kan se, offentlig) og inkluderings-toggles. "Del" trigger
 * server action `shareRound`, som ev. varsler coach.
 *
 * Migrert fra public/design/batch4/playerhq-03-del-runde.html.
 */
import { useState, useTransition } from "react";
import {
  Check,
  Copy,
  FileText,
  Globe,
  Image as ImageIcon,
  Link as LinkIcon,
  Lock,
  Send,
  Square,
  User2,
  X,
} from "lucide-react";
import { shareRound } from "@/app/portal/mal/runder/[id]/actions";
import type {
  ShareFormat,
  ShareRoundInput,
  ShareVisibility,
} from "@/app/portal/mal/runder/[id]/actions";

type Inkluder = ShareRoundInput["inkluder"];

type Props = {
  open: boolean;
  onClose: () => void;
  roundId: string;
  /** Brukes til preview-kortet. */
  spiller: {
    name: string;
    hcpLabel: string;
    initialer: string;
  };
  runde: {
    bane: string;
    dato: string;
    score: number;
    vsPar: number;
    sgPills?: { label: string; value: number }[];
  };
};

export function DelRundeModal({
  open,
  onClose,
  roundId,
  spiller,
  runde,
}: Props) {
  const [format, setFormat] = useState<ShareFormat>("story");
  const [visibility, setVisibility] = useState<ShareVisibility>("coach");
  const [inkluder, setInkluder] = useState<Inkluder>({
    score: true,
    statistikk: true,
    foto: false,
    notater: false,
  });
  const [melding, setMelding] = useState("");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) return null;

  const handleShare = () => {
    startTransition(async () => {
      try {
        const res = await shareRound(roundId, {
          format,
          visibility,
          message: melding || undefined,
          inkluder,
        });
        setShareUrl(res.shareUrl);
        setFeedback(
          visibility === "coach"
            ? "Delt med coach — varsel sendt"
            : "Runde delt",
        );
        setTimeout(() => setFeedback(null), 2400);
      } catch {
        setFeedback("Kunne ikke dele — prøv igjen");
        setTimeout(() => setFeedback(null), 2400);
      }
    });
  };

  const handleCopyLink = async () => {
    startTransition(async () => {
      try {
        const res = await shareRound(roundId, {
          format: "link",
          visibility,
          message: melding || undefined,
          inkluder,
        });
        await navigator.clipboard.writeText(res.shareUrl);
        setShareUrl(res.shareUrl);
        setFeedback("Lenke kopiert");
        setTimeout(() => setFeedback(null), 2400);
      } catch {
        setFeedback("Kunne ikke kopiere lenke");
        setTimeout(() => setFeedback(null), 2400);
      }
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="del-runde-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-background/60 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-[95vh] w-full flex-col overflow-hidden rounded-t-2xl bg-card shadow-2xl sm:max-h-[calc(100vh-48px)] sm:w-[560px] sm:max-w-full sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-2 border-b border-border px-6 py-6">
          <div>
            <h2
              id="del-runde-title"
              className="font-display text-xl font-semibold tracking-tight"
            >
              Del runde
            </h2>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              <strong className="text-foreground">{runde.bane}</strong> ·{" "}
              {runde.dato} ·{" "}
              <strong className="text-foreground">
                {runde.score} ({runde.vsPar >= 0 ? "+" : ""}
                {runde.vsPar})
              </strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Lukk"
            className="-mr-2 -mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:h-9 sm:w-9"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </header>

        {/* Body */}
        <div className="flex flex-col gap-6 overflow-y-auto px-6 py-6">
          {/* Preview */}
          <PreviewCard
            spiller={spiller}
            runde={runde}
            inkluder={inkluder}
            format={format}
          />

          {/* Format */}
          <div>
            <label
              htmlFor="format-grid"
              className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground"
            >
              Format
            </label>
            <div
              id="format-grid"
              className="grid grid-cols-2 gap-2 sm:grid-cols-4"
            >
              <FormatButton
                aktiv={format === "story"}
                onClick={() => setFormat("story")}
                icon={ImageIcon}
                name="Story"
                dim="1080 × 1920"
              />
              <FormatButton
                aktiv={format === "post"}
                onClick={() => setFormat("post")}
                icon={Square}
                name="Post"
                dim="1080 × 1080"
              />
              <FormatButton
                aktiv={format === "pdf"}
                onClick={() => setFormat("pdf")}
                icon={FileText}
                name="PDF"
                dim="Full SG-data"
              />
              <FormatButton
                aktiv={format === "link"}
                onClick={() => setFormat("link")}
                icon={LinkIcon}
                name="Lenke"
                dim="Delbar URL"
              />
            </div>
          </div>

          {/* Synlighet */}
          <div>
            <label
              htmlFor="vis-row"
              className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground"
            >
              Synlighet
            </label>
            <div
              id="vis-row"
              className="grid grid-cols-3 gap-1 rounded-md border border-border bg-secondary/40 p-1"
            >
              <VisButton
                aktiv={visibility === "privat"}
                onClick={() => setVisibility("privat")}
                icon={Lock}
                label="Privat"
              />
              <VisButton
                aktiv={visibility === "coach"}
                onClick={() => setVisibility("coach")}
                icon={User2}
                label="Coach kan se"
              />
              <VisButton
                aktiv={visibility === "offentlig"}
                onClick={() => setVisibility("offentlig")}
                icon={Globe}
                label="Offentlig"
              />
            </div>
          </div>

          {/* Inkludér-toggles */}
          <div>
            <label
              htmlFor="inkluder-grid"
              className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground"
            >
              Inkludér
            </label>
            <div id="inkluder-grid" className="grid grid-cols-2 gap-2">
              <Toggle
                aktiv={inkluder.score}
                onClick={() => setInkluder((s) => ({ ...s, score: !s.score }))}
                label="Score"
              />
              <Toggle
                aktiv={inkluder.statistikk}
                onClick={() =>
                  setInkluder((s) => ({ ...s, statistikk: !s.statistikk }))
                }
                label="Statistikk (SG)"
              />
              <Toggle
                aktiv={inkluder.foto}
                onClick={() => setInkluder((s) => ({ ...s, foto: !s.foto }))}
                label="Foto"
              />
              <Toggle
                aktiv={inkluder.notater}
                onClick={() =>
                  setInkluder((s) => ({ ...s, notater: !s.notater }))
                }
                label="Notater"
              />
            </div>
          </div>

          {/* Melding */}
          <div>
            <label
              htmlFor="del-melding"
              className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground"
            >
              Melding (valgfri)
            </label>
            <textarea
              id="del-melding"
              value={melding}
              onChange={(e) => setMelding(e.target.value)}
              rows={2}
              placeholder="Skriv en kort kommentar til mottakeren…"
              className="w-full resize-none rounded-md border border-border bg-background px-4 py-2 text-sm text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 placeholder:text-muted-foreground focus:border-primary"
            />
          </div>

          {shareUrl && (
            <div className="rounded-md border border-primary/30 bg-primary/5 px-4 py-2 font-mono text-[11px] text-foreground">
              <span className="text-muted-foreground">Delbar lenke: </span>
              <span className="select-all text-primary">{shareUrl}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="flex flex-wrap items-center gap-2 border-t border-border bg-secondary/30 px-6 py-4">
          <button
            type="button"
            onClick={handleCopyLink}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
          >
            <Copy size={14} strokeWidth={1.75} />
            Generer lenke
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground"
          >
            Avbryt
          </button>
          <button
            type="button"
            onClick={handleShare}
            disabled={isPending}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-accent px-6 py-2 text-[13px] font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Send size={14} strokeWidth={1.75} />
            {isPending ? "Sender…" : "Del"}
          </button>
        </footer>

        {feedback && (
          <div className="pointer-events-none absolute bottom-20 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-[12px] font-medium text-background shadow-lg">
            <span className="inline-flex items-center gap-2">
              <Check size={14} strokeWidth={2.5} className="text-accent" />
              {feedback}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// --------- Preview-kort ---------

function PreviewCard({
  spiller,
  runde,
  inkluder,
  format,
}: {
  spiller: Props["spiller"];
  runde: Props["runde"];
  inkluder: Inkluder;
  format: ShareFormat;
}) {
  const aspect =
    format === "post"
      ? "aspect-square"
      : format === "pdf"
        ? "aspect-[8.5/11] max-h-[280px]"
        : format === "link"
          ? "aspect-[4/3] max-h-[240px]"
          : "aspect-[9/16] max-h-[320px]";

  const erMork = format === "story" || format === "post";

  return (
    <div className="rounded-xl bg-secondary/40 p-4">
      <div
        className={`relative mx-auto flex w-full ${aspect} flex-col overflow-hidden rounded-lg p-6 ${
          erMork
            ? "bg-gradient-to-br from-[#006C50] to-[#003A2A] text-white"
            : format === "pdf"
              ? "border border-border bg-card text-foreground"
              : "bg-gradient-to-br from-secondary/60 to-secondary text-foreground"
        }`}
      >
        {/* Header */}
        <div className="relative z-10 flex items-center gap-2">
          <div
            className={`grid h-9 w-9 place-items-center rounded-full font-display text-[12px] font-bold ${
              erMork ? "bg-accent text-foreground" : "bg-primary text-accent"
            }`}
          >
            {spiller.initialer}
          </div>
          <div>
            <div className="font-display text-[13px] font-semibold leading-tight">
              {spiller.name}
            </div>
            <div
              className={`mt-0.5 font-mono text-[9px] uppercase tracking-[0.08em] ${
                erMork ? "text-accent/75" : "text-muted-foreground"
              }`}
            >
              HCP {spiller.hcpLabel} · AK GOLF
            </div>
          </div>
        </div>

        {/* Score */}
        {inkluder.score && (
          <div className="relative z-10 mt-auto flex flex-col gap-0.5">
            <span
              className={`font-mono text-[9px] font-bold uppercase tracking-[0.16em] ${
                erMork ? "text-accent/70" : "text-muted-foreground"
              }`}
            >
              Runde · 18 hull
            </span>
            <span
              className={`font-display text-[64px] font-bold leading-none tracking-tight ${
                erMork ? "text-accent" : "text-primary"
              }`}
            >
              {runde.score}
            </span>
            <span
              className={`mt-1 inline-flex items-center gap-2 font-mono text-[11px] font-semibold ${
                erMork ? "text-white/80" : "text-muted-foreground"
              }`}
            >
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  erMork ? "bg-accent/20 text-accent" : "bg-primary/15 text-primary"
                }`}
              >
                {runde.vsPar >= 0 ? "+" : ""}
                {runde.vsPar}
              </span>
              <span>
                {runde.bane.toUpperCase()} · {runde.dato.toUpperCase()}
              </span>
            </span>
          </div>
        )}

        {/* SG-pills */}
        {inkluder.statistikk && runde.sgPills && runde.sgPills.length > 0 && (
          <div className="relative z-10 mt-2 flex flex-wrap gap-1">
            {runde.sgPills.map((s) => (
              <span
                key={s.label}
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.06em] ${
                  erMork
                    ? "border-white/15 bg-white/10 text-white"
                    : "border-border bg-card text-foreground"
                }`}
              >
                {s.label}{" "}
                <span
                  className={
                    s.value >= 0
                      ? erMork
                        ? "text-accent"
                        : "text-primary"
                      : erMork
                        ? "text-[#FFB4A8]"
                        : "text-destructive"
                  }
                >
                  {s.value >= 0 ? "+" : ""}
                  {s.value.toFixed(1).replace(".", ",")}
                </span>
              </span>
            ))}
          </div>
        )}

        {/* Brand */}
        <div
          className={`absolute bottom-3 right-4 font-display text-[10px] font-bold uppercase tracking-[0.16em] z-10 ${
            erMork ? "text-accent" : "text-primary"
          }`}
        >
          AK GOLF
        </div>
      </div>
    </div>
  );
}

// --------- Subkomponenter ---------

function FormatButton({
  aktiv,
  onClick,
  icon: Icon,
  name,
  dim,
}: {
  aktiv: boolean;
  onClick: () => void;
  icon: typeof ImageIcon;
  name: string;
  dim: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-md border p-2.5 text-center transition-all ${
        aktiv
          ? "border-accent bg-accent/10 ring-2 ring-accent"
          : "border-border bg-card hover:bg-secondary/40"
      }`}
    >
      <span
        className={`grid h-7 w-7 place-items-center rounded-md ${
          aktiv ? "bg-primary text-accent" : "bg-secondary text-muted-foreground"
        }`}
      >
        <Icon size={13} strokeWidth={1.75} />
      </span>
      <span className="font-display text-[11.5px] font-semibold leading-tight text-foreground">
        {name}
      </span>
      <span className="font-mono text-[9px] uppercase tracking-[0.04em] text-muted-foreground">
        {dim}
      </span>
    </button>
  );
}

function VisButton({
  aktiv,
  onClick,
  icon: Icon,
  label,
}: {
  aktiv: boolean;
  onClick: () => void;
  icon: typeof Lock;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2 text-[12px] font-semibold transition-all ${
        aktiv
          ? "bg-card text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon size={12} strokeWidth={1.75} />
      {label}
    </button>
  );
}

function Toggle({
  aktiv,
  onClick,
  label,
}: {
  aktiv: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="switch"
      aria-checked={aktiv}
      className={`flex items-center justify-between gap-2 rounded-md border px-4 py-2 text-[12px] font-medium transition-colors ${
        aktiv
          ? "border-primary/30 bg-primary/5 text-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      <span>{label}</span>
      <span
        className={`grid h-4 w-4 place-items-center rounded-sm border ${
          aktiv
            ? "border-primary bg-primary text-accent"
            : "border-border bg-card"
        }`}
      >
        {aktiv && <Check size={10} strokeWidth={2.5} />}
      </span>
    </button>
  );
}
