"use client";

/**
 * NotaterPanel — Coach-private notater om en enkelt spiller.
 *
 * Pure presentational komponent. Brukes i Coach Workbench (CoachHQ Individuelt)
 * for å vise notater coach har skrevet om spilleren. Inkluderer søkefelt for å
 * filtrere på tittel, innhold eller tag.
 *
 * TODO: Prisma-modell `CoachNote` finnes ikke ennå. Når den opprettes:
 *   - id, dato, tittel, innhold, tags (String[]), privat (Boolean),
 *   - coachId (FK User), spillerId (FK User)
 *   - Index på (spillerId, dato DESC)
 *
 * onNyNotat åpner modal i parent (modal-skjelett ligger nederst i fila som
 * referanse, men er ikke koblet til en route ennå).
 */

import { useMemo, useState } from "react";
import { FileText, Lock, Pencil, Plus, Search, Tag } from "lucide-react";

import { AthleticButton } from "@/components/athletic/button";
import { AthleticCard } from "@/components/athletic/card";
import { AthleticBadge } from "@/components/athletic/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";

// ─── Typer ───────────────────────────────────────────────────────────────────

export type CoachNotat = {
  id: string;
  dato: Date;
  tittel: string;
  innhold: string;
  tags: string[];
  privat: boolean;
};

type NotaterPanelProps = {
  spillerId: string;
  notater: CoachNotat[];
  onNyNotat?: () => void;
  onRedigerNotat?: (id: string) => void;
};

// ─── Hjelpere ────────────────────────────────────────────────────────────────

const DATO_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
};

function formaterDato(dato: Date): string {
  return new Intl.DateTimeFormat("nb-NO", DATO_FORMAT).format(dato);
}

function matcherSok(notat: CoachNotat, sok: string): boolean {
  if (!sok.trim()) return true;
  const q = sok.trim().toLowerCase();
  if (notat.tittel.toLowerCase().includes(q)) return true;
  if (notat.innhold.toLowerCase().includes(q)) return true;
  if (notat.tags.some((tag) => tag.toLowerCase().includes(q))) return true;
  return false;
}

// ─── Komponenter ─────────────────────────────────────────────────────────────

type NotatKortProps = {
  notat: CoachNotat;
  onRediger?: (id: string) => void;
};

function NotatKort({ notat, onRediger }: NotatKortProps) {
  const [utvidet, setUtvidet] = useState(false);
  const erLangtInnhold = notat.innhold.length > 280;
  const visning =
    !utvidet && erLangtInnhold
      ? notat.innhold.slice(0, 280).trimEnd() + "…"
      : notat.innhold;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 md:p-6">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono uppercase tracking-[0.05em]">
              {formaterDato(notat.dato)}
            </span>
            {notat.privat && (
              <span
                className="inline-flex items-center gap-1 text-muted-foreground"
                title="Kun synlig for coach"
              >
                <Lock size={12} strokeWidth={1.75} />
                <span className="font-mono uppercase tracking-[0.05em]">
                  Privat
                </span>
              </span>
            )}
          </div>
          <h3 className="font-display mt-1 text-base font-semibold text-foreground">
            {notat.tittel}
          </h3>
        </div>
        {onRediger && (
          <button
            type="button"
            onClick={() => onRediger(notat.id)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Pencil size={12} strokeWidth={1.75} />
            Rediger
          </button>
        )}
      </div>

      <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
        {visning}
      </p>
      {erLangtInnhold && (
        <button
          type="button"
          onClick={() => setUtvidet((v) => !v)}
          className="mt-2 text-xs font-medium text-primary underline-offset-2 hover:underline"
        >
          {utvidet ? "Vis mindre" : "Les hele"}
        </button>
      )}

      {notat.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Tag
            size={12}
            strokeWidth={1.75}
            className="text-muted-foreground"
            aria-hidden
          />
          {notat.tags.map((tag) => (
            <AthleticBadge key={tag} variant="neutral">
              {tag}
            </AthleticBadge>
          ))}
        </div>
      )}
    </div>
  );
}

export function NotaterPanel({
  notater,
  onNyNotat,
  onRedigerNotat,
}: NotaterPanelProps) {
  const [sok, setSok] = useState("");

  const filtrert = useMemo(
    () =>
      notater
        .filter((n) => matcherSok(n, sok))
        .sort((a, b) => b.dato.getTime() - a.dato.getTime()),
    [notater, sok],
  );

  const harNotater = notater.length > 0;

  return (
    <AthleticCard
      label="Coach-notater (privat)"
      action={
        harNotater && onNyNotat ? (
          <AthleticButton
            variant="lime"
            size="sm"
            onClick={onNyNotat}
            type="button"
          >
            <Plus size={14} strokeWidth={2} />
            Ny notat
          </AthleticButton>
        ) : undefined
      }
    >
      {harNotater && (
        <div className="mb-4 flex items-center gap-2">
          <div className="relative w-full max-w-sm">
            <Search
              size={14}
              strokeWidth={1.75}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              value={sok}
              onChange={(e) => setSok(e.target.value)}
              placeholder="Søk i notater, tags eller innhold"
              className="pl-8"
              aria-label="Søk i notater"
            />
          </div>
        </div>
      )}

      {harNotater ? (
        filtrert.length > 0 ? (
          <div className="space-y-2">
            {filtrert.map((notat) => (
              <NotatKort
                key={notat.id}
                notat={notat}
                onRediger={onRedigerNotat}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title="Ingen treff"
            description={`Fant ingen notater som matcher "${sok}".`}
          />
        )
      ) : (
        <EmptyState
          icon={FileText}
          title="Ingen notater ennå"
          description="Skriv din første notat om denne spilleren."
          action={
            onNyNotat ? (
              <AthleticButton
                variant="lime"
                size="sm"
                onClick={onNyNotat}
                type="button"
              >
                <Plus size={14} strokeWidth={2} />
                Skriv første notat
              </AthleticButton>
            ) : undefined
          }
        />
      )}
    </AthleticCard>
  );
}
