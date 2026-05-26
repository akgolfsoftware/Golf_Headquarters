"use client";

/**
 * NyNotatModal — modal for å opprette eller redigere coach-notater.
 *
 * Bruker Modal-shellen fra src/components/shared/modal.tsx (sheet-stil mobil,
 * sentrert desktop). Tags er chip-input: skriv ord + Enter → chip, klikk × for
 * å fjerne. Toggle for privat vs. synlig for spiller.
 */

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, X } from "lucide-react";

import { Modal } from "@/components/shared/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AthleticButton } from "@/components/athletic/button";
import { AthleticBadge } from "@/components/athletic/badge";

import {
  opprettCoachNotat,
  oppdaterCoachNotat,
  slettCoachNotat,
} from "./notater-actions";

export type EditingNote = {
  id: string;
  title?: string | null;
  content: string;
  tags: string[];
  isPrivate: boolean;
};

type NyNotatModalProps = {
  open: boolean;
  onClose: () => void;
  playerId: string;
  playerName: string;
  editingNote?: EditingNote;
};

const MIN_CONTENT = 2;
const MAX_CONTENT = 5000;
const MAX_TAGS = 20;
const MAX_TAG_LEN = 40;

export function NyNotatModal({
  open,
  onClose,
  playerId,
  playerName,
  editingNote,
}: NyNotatModalProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);

  const erRedigering = !!editingNote;

  // Resett/hydrer state når modal åpnes (prop-drevet reset).
  useEffect(() => {
    if (!open) return;
    if (editingNote) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(editingNote.title ?? "");
      setContent(editingNote.content);
      setTags(editingNote.tags ?? []);
      setIsPrivate(editingNote.isPrivate);
    } else {
      setTitle("");
      setContent("");
      setTags([]);
      setIsPrivate(true);
    }
    setTagInput("");
    setFeil(null);
  }, [open, editingNote]);

  function leggTilTag(raw: string) {
    const t = raw.trim().slice(0, MAX_TAG_LEN);
    if (!t) return;
    if (tags.length >= MAX_TAGS) return;
    if (tags.some((x) => x.toLowerCase() === t.toLowerCase())) return;
    setTags((prev) => [...prev, t]);
    setTagInput("");
  }

  function fjernTag(t: string) {
    setTags((prev) => prev.filter((x) => x !== t));
  }

  function onTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      leggTilTag(tagInput);
    } else if (
      e.key === "Backspace" &&
      tagInput.length === 0 &&
      tags.length > 0
    ) {
      // Fjern siste tag når input er tomt og brukeren backspacer
      e.preventDefault();
      setTags((prev) => prev.slice(0, -1));
    }
  }

  function handleLagre(e: React.FormEvent) {
    e.preventDefault();
    setFeil(null);

    const trimmedContent = content.trim();
    if (trimmedContent.length < MIN_CONTENT) {
      setFeil(`Innholdet må være minst ${MIN_CONTENT} tegn.`);
      return;
    }
    if (trimmedContent.length > MAX_CONTENT) {
      setFeil(`Innholdet kan maks være ${MAX_CONTENT} tegn.`);
      return;
    }

    // Hvis bruker har et halvskrevet tag-ord, ta det med
    const finalTags = tagInput.trim()
      ? Array.from(
          new Set([
            ...tags,
            tagInput.trim().slice(0, MAX_TAG_LEN),
          ]),
        )
      : tags;

    const titleVal = title.trim() ? title.trim() : undefined;

    startTransition(async () => {
      try {
        if (erRedigering && editingNote) {
          await oppdaterCoachNotat({
            id: editingNote.id,
            playerId,
            title: titleVal,
            content: trimmedContent,
            tags: finalTags,
            isPrivate,
          });
        } else {
          await opprettCoachNotat({
            playerId,
            title: titleVal,
            content: trimmedContent,
            tags: finalTags,
            isPrivate,
          });
        }
        onClose();
        router.refresh();
      } catch (err) {
        const melding =
          err instanceof Error ? err.message : "Kunne ikke lagre notatet.";
        setFeil(melding);
      }
    });
  }

  function handleSlett() {
    if (!editingNote) return;
    const ok = window.confirm("Slett notatet? Dette kan ikke angres.");
    if (!ok) return;
    setFeil(null);

    startTransition(async () => {
      try {
        await slettCoachNotat(editingNote.id);
        onClose();
        router.refresh();
      } catch (err) {
        const melding =
          err instanceof Error ? err.message : "Kunne ikke slette notatet.";
        setFeil(melding);
      }
    });
  }

  return (
    <Modal
      open={open}
      onClose={pending ? () => undefined : onClose}
      title={erRedigering ? "Rediger notat" : "Ny notat"}
      description={`Om ${playerName}`}
      size="md"
      footer={
        <>
          {erRedigering && (
            <AthleticButton
              type="button"
              variant="ghost-light"
              size="sm"
              onClick={handleSlett}
              disabled={pending}
              className="mr-auto border-destructive/30 text-destructive hover:bg-destructive/5"
            >
              <Trash2 size={14} strokeWidth={1.75} />
              Slett
            </AthleticButton>
          )}
          <AthleticButton
            type="button"
            variant="ghost-light"
            size="sm"
            onClick={onClose}
            disabled={pending}
          >
            Avbryt
          </AthleticButton>
          <AthleticButton
            type="submit"
            form="ny-notat-form"
            variant="lime"
            size="sm"
            disabled={pending}
          >
            {pending && (
              <Loader2 size={14} strokeWidth={2} className="animate-spin" />
            )}
            {erRedigering ? "Lagre endringer" : "Lagre notat"}
          </AthleticButton>
        </>
      }
    >
      <form
        id="ny-notat-form"
        onSubmit={handleLagre}
        className="space-y-4"
      >
        <Felt label="Tittel" hint="Valgfri">
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Kort oppsummering"
            maxLength={200}
            disabled={pending}
          />
        </Felt>

        <Felt
          label="Innhold"
          hint={`${content.length}/${MAX_CONTENT}`}
        >
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Hva vil du notere om denne spilleren?"
            rows={6}
            maxLength={MAX_CONTENT}
            disabled={pending}
            required
            aria-required
          />
        </Felt>

        <Felt label="Tags" hint={`${tags.length}/${MAX_TAGS}`}>
          <div className="rounded-md border border-input bg-card px-3 py-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1"
                >
                  <AthleticBadge variant="neutral">{tag}</AthleticBadge>
                  <button
                    type="button"
                    onClick={() => fjernTag(tag)}
                    disabled={pending}
                    className="grid h-5 w-5 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Fjern ${tag}`}
                  >
                    <X size={12} strokeWidth={1.75} aria-hidden />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={onTagKeyDown}
                onBlur={() => {
                  if (tagInput.trim()) leggTilTag(tagInput);
                }}
                placeholder={
                  tags.length === 0
                    ? "Skriv tag og trykk Enter"
                    : ""
                }
                maxLength={MAX_TAG_LEN}
                disabled={pending || tags.length >= MAX_TAGS}
                className="min-w-[120px] flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        </Felt>

        <Felt label="Synlighet">
          <div className="flex items-center justify-between rounded-md border border-input bg-card px-3 py-3">
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground">
                {isPrivate ? "Privat" : "Synlig for spiller"}
              </div>
              <div className="text-xs text-muted-foreground">
                {isPrivate
                  ? "Kun du som coach ser dette notatet."
                  : "Spilleren kan også se dette notatet i sin profil."}
              </div>
            </div>
            <Switch
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              disabled={pending}
              aria-label="Privat notat"
            />
          </div>
        </Felt>

        {feil && (
          <div
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {feil}
          </div>
        )}
      </form>
    </Modal>
  );
}

// ─── Hjelper ─────────────────────────────────────────────────────────────────

function Felt({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </label>
        {hint && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
