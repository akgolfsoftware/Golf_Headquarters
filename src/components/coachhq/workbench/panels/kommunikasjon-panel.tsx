"use client";

/**
 * KommunikasjonPanel — Meldingshistorikk mellom coach og spiller.
 *
 * Pure presentational komponent. Brukes i Coach Workbench (AgencyOS Individuelt)
 * for å vise all kommunikasjon med en spiller: spørsmål, beskjeder,
 * plan-godkjenninger, og system-varsler. Støtter trådvisning hvis en melding
 * har oppfølgende svar.
 *
 * TODO: Prisma-modell `Message` finnes ikke ennå. Når den opprettes:
 *   - id, type (enum), avsender (enum), dato, innhold, status (enum),
 *   - parentMessageId (FK self), spillerId (FK User), coachId (FK User)
 *   - Eksisterende `CaddieMessage` er coach->caddie, ikke coach<->spiller.
 */

import { useMemo } from "react";
import {
  Bell,
  CheckCircle2,
  ClipboardCheck,
  HelpCircle,
  Mail,
  MessageSquare,
  Plus,
  Send,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { AthleticButton } from "@/components/athletic/button";
import { AthleticCard } from "@/components/athletic/card";
import { AthleticBadge } from "@/components/athletic/badge";
import { EmptyState } from "@/components/ui/empty-state";

// ─── Typer ───────────────────────────────────────────────────────────────────

export type MeldingType =
  | "SPORSMAL"
  | "BESKJED"
  | "PLAN_GODKJENNING"
  | "VARSEL";

export type MeldingAvsender = "COACH" | "SPILLER" | "SYSTEM";

export type MeldingStatus = "UVENTET" | "LEST" | "BESVART" | "LOEST";

export type MeldingTraad = {
  avsender: string;
  innhold: string;
  dato: Date;
};

export type KommunikasjonMelding = {
  id: string;
  type: MeldingType;
  dato: Date;
  avsender: MeldingAvsender;
  innhold: string;
  status?: MeldingStatus;
  trad?: MeldingTraad[];
};

type KommunikasjonPanelProps = {
  spillerId: string;
  meldinger: KommunikasjonMelding[];
  onNyMelding?: () => void;
};

// ─── Konstanter ──────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<MeldingType, string> = {
  SPORSMAL: "Spørsmål",
  BESKJED: "Beskjed",
  PLAN_GODKJENNING: "Plan-godkjenning",
  VARSEL: "Varsel",
};

const TYPE_ICON: Record<MeldingType, LucideIcon> = {
  SPORSMAL: HelpCircle,
  BESKJED: MessageSquare,
  PLAN_GODKJENNING: ClipboardCheck,
  VARSEL: Bell,
};

const TYPE_VARIANT: Record<
  MeldingType,
  "primary" | "lime" | "neutral" | "warn" | "urgent" | "ok"
> = {
  SPORSMAL: "warn",
  BESKJED: "neutral",
  PLAN_GODKJENNING: "ok",
  VARSEL: "primary",
};

const STATUS_LABEL: Record<MeldingStatus, string> = {
  UVENTET: "Uventet",
  LEST: "Lest",
  BESVART: "Besvart",
  LOEST: "Løst",
};

const STATUS_VARIANT: Record<
  MeldingStatus,
  "primary" | "lime" | "neutral" | "warn" | "urgent" | "ok"
> = {
  UVENTET: "urgent",
  LEST: "neutral",
  BESVART: "primary",
  LOEST: "ok",
};

const AVSENDER_LABEL: Record<MeldingAvsender, string> = {
  COACH: "Du",
  SPILLER: "Spiller",
  SYSTEM: "System",
};

// ─── Hjelpere ────────────────────────────────────────────────────────────────

const DATO_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
};

function formaterKortDato(dato: Date): string {
  return new Intl.DateTimeFormat("nb-NO", DATO_FORMAT).format(dato);
}

function formaterTraadDato(dato: Date): string {
  return new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dato);
}

type Stats = {
  sendt: number;
  besvart: number;
  uleste: number;
};

function regnStats(meldinger: KommunikasjonMelding[]): Stats {
  let sendt = 0;
  let besvart = 0;
  let uleste = 0;
  for (const m of meldinger) {
    if (m.avsender === "COACH") sendt += 1;
    if (m.status === "BESVART" || m.status === "LOEST") besvart += 1;
    if (m.status === "UVENTET") uleste += 1;
  }
  return { sendt, besvart, uleste };
}

// ─── Komponenter ─────────────────────────────────────────────────────────────

type StatsRadProps = {
  stats: Stats;
};

function StatsRad({ stats }: StatsRadProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      <span className="font-mono uppercase tracking-[0.05em]">
        <span className="font-bold text-foreground">{stats.sendt}</span> sendt
      </span>
      <span className="text-border" aria-hidden>
        ·
      </span>
      <span className="font-mono uppercase tracking-[0.05em]">
        <span className="font-bold text-foreground">{stats.besvart}</span>{" "}
        besvart
      </span>
      {stats.uleste > 0 && (
        <>
          <span className="text-border" aria-hidden>
            ·
          </span>
          <span className="font-mono uppercase tracking-[0.05em] text-destructive">
            <span className="font-bold">{stats.uleste}</span> uleste
          </span>
        </>
      )}
    </div>
  );
}

type MeldingKortProps = {
  melding: KommunikasjonMelding;
};

function MeldingKort({ melding }: MeldingKortProps) {
  const Ikon = TYPE_ICON[melding.type];
  const harTraad = (melding.trad?.length ?? 0) > 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 md:p-6">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <Ikon size={14} strokeWidth={1.75} aria-hidden />
        </span>
        <AthleticBadge variant={TYPE_VARIANT[melding.type]}>
          {TYPE_LABEL[melding.type]}
        </AthleticBadge>
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground">
          {formaterKortDato(melding.dato)}
        </span>
        {melding.status && (
          <span className="ml-auto">
            <AthleticBadge variant={STATUS_VARIANT[melding.status]}>
              {STATUS_LABEL[melding.status]}
            </AthleticBadge>
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <p className="text-sm leading-relaxed">
          <span className="font-semibold text-foreground">
            {AVSENDER_LABEL[melding.avsender]}:
          </span>{" "}
          <span className="text-foreground/90">{melding.innhold}</span>
        </p>

        {harTraad && melding.trad && (
          <div className="mt-2 space-y-2 border-l-2 border-border pl-4">
            {melding.trad.map((svar, idx) => (
              <div key={idx} className="text-sm leading-relaxed">
                <div className="mb-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {svar.avsender}
                  </span>
                  <span aria-hidden>·</span>
                  <span className="font-mono uppercase tracking-[0.05em]">
                    {formaterTraadDato(svar.dato)}
                  </span>
                </div>
                <p className="text-foreground/90">{svar.innhold}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {melding.status === "LOEST" && !harTraad && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <CheckCircle2
            size={12}
            strokeWidth={1.75}
            className="text-emerald-600"
            aria-hidden
          />
          <span>Markert som løst</span>
        </div>
      )}
    </div>
  );
}

export function KommunikasjonPanel({
  meldinger,
  onNyMelding,
}: KommunikasjonPanelProps) {
  const stats = useMemo(() => regnStats(meldinger), [meldinger]);

  const sortert = useMemo(
    () =>
      [...meldinger].sort((a, b) => b.dato.getTime() - a.dato.getTime()),
    [meldinger],
  );

  const harMeldinger = meldinger.length > 0;

  return (
    <AthleticCard
      label="Meldingshistorikk"
      action={
        harMeldinger && onNyMelding ? (
          <AthleticButton
            variant="lime"
            size="sm"
            onClick={onNyMelding}
            type="button"
          >
            <Plus size={14} strokeWidth={2} />
            Ny melding
          </AthleticButton>
        ) : undefined
      }
    >
      {harMeldinger && (
        <div className="mb-4">
          <StatsRad stats={stats} />
        </div>
      )}

      {harMeldinger ? (
        <div className="space-y-2">
          {sortert.map((melding) => (
            <MeldingKort key={melding.id} melding={melding} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Mail}
          title="Ingen meldinger ennå"
          description="Start en samtale med spilleren — still et spørsmål eller send en beskjed."
          action={
            onNyMelding ? (
              <AthleticButton
                variant="lime"
                size="sm"
                onClick={onNyMelding}
                type="button"
              >
                <Send size={14} strokeWidth={2} />
                Send første melding
              </AthleticButton>
            ) : undefined
          }
        />
      )}
    </AthleticCard>
  );
}
