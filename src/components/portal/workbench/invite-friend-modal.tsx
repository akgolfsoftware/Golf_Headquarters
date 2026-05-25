"use client";

/**
 * InviteFriendModal — bottomsheet på mobile, modal på desktop.
 *
 * Brukes når host av en delt TrainingSessionV2 vil invitere spillere.
 * Tre tabs: "Min gruppe" / "Akademi" / "Søk".
 *
 * Optimistic UI med useTransition: trykk "Inviter" → server action kjører
 * i bakgrunnen, UI markerer som "Invitert" umiddelbart, ruller tilbake ved
 * feil. Maks-deltakere-counter (X av Y plasser) håndheves klient-side i
 * tillegg til server-validering.
 */

import { useMemo, useState, useTransition } from "react";
import { Check, Search, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { avatarBg, initialsFromName } from "@/lib/avatar-colors";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { inviterSpiller } from "./invite-actions";

export type InviteSpiller = {
  id: string;
  name: string;
  avatarUrl?: string;
  hcp: number | null;
  gruppe?: string;
};

export type InviteFriendModalProps = {
  open: boolean;
  onClose: () => void;
  sessionId: string;
  hostId: string;
  maxParticipants: number;
  currentParticipants: number;
  spillere: InviteSpiller[];
  /** ID-er som allerede er invitert (for å skjule eller markere). */
  alleredeInviterte?: string[];
};

type InviteState = "idle" | "pending" | "sent" | "error";

export function InviteFriendModal({
  open,
  onClose,
  sessionId,
  hostId,
  maxParticipants,
  currentParticipants,
  spillere,
  alleredeInviterte = [],
}: InviteFriendModalProps) {
  const [tab, setTab] = useState<"gruppe" | "akademi" | "sok">("gruppe");
  const [query, setQuery] = useState("");
  const [statusPerSpiller, setStatusPerSpiller] = useState<
    Record<string, InviteState>
  >(() => {
    const init: Record<string, InviteState> = {};
    for (const id of alleredeInviterte) init[id] = "sent";
    return init;
  });
  const [, startTransition] = useTransition();

  // Counter — host teller med, deltakere er separate.
  const inviterteIdag = Object.values(statusPerSpiller).filter(
    (s) => s === "sent" || s === "pending",
  ).length;
  const ledigePlasser = Math.max(0, maxParticipants - currentParticipants);
  const erFull = inviterteIdag >= ledigePlasser;

  // Filter per tab + søk
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let liste = spillere.filter((s) => s.id !== hostId);

    if (tab === "gruppe") {
      // "Min gruppe" = de som har gruppe-feltet satt
      liste = liste.filter((s) => s.gruppe != null && s.gruppe !== "");
    } else if (tab === "akademi") {
      // "Akademi" = alle (full liste)
    } else if (tab === "sok") {
      // "Søk" — krever query for å vise treff
      if (q.length === 0) return [];
    }

    if (q.length > 0) {
      liste = liste.filter((s) =>
        s.name.toLowerCase().includes(q) ||
        (s.gruppe?.toLowerCase().includes(q) ?? false),
      );
    }
    return liste;
  }, [spillere, tab, query, hostId]);

  function handleInviter(spillerId: string) {
    if (erFull) return;
    if (statusPerSpiller[spillerId] === "sent" || statusPerSpiller[spillerId] === "pending") {
      return;
    }
    // Optimistic
    setStatusPerSpiller((prev) => ({ ...prev, [spillerId]: "pending" }));
    startTransition(async () => {
      const res = await inviterSpiller({ sessionId, userId: spillerId });
      setStatusPerSpiller((prev) => ({
        ...prev,
        [spillerId]: res.ok ? "sent" : "error",
      }));
    });
  }

  if (!open) return null;

  return (
    <>
      {/* Scrim */}
      <div
        className="fixed inset-0 z-40 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet/modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Inviter spillere"
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-3xl bg-card shadow-2xl",
          "sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-h-[80vh] sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl",
        )}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pb-1 pt-2.5 shrink-0 sm:hidden">
          <div className="h-1.5 w-10 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Trene sammen
            </p>
            <h2 className="font-display mt-0.5 text-lg font-semibold tracking-tight text-foreground">
              Inviter en kompis
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Lukk"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X size={16} aria-hidden />
          </button>
        </div>

        {/* Counter */}
        <div className="shrink-0 border-b border-border bg-secondary/30 px-5 py-2.5">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            <span className="tabular-nums text-foreground">
              {currentParticipants + inviterteIdag}
            </span>{" "}
            av <span className="tabular-nums">{maxParticipants}</span> plasser
            {erFull && (
              <span className="ml-2 rounded-full bg-destructive/10 px-2 py-0.5 text-destructive">
                Fullt
              </span>
            )}
          </p>
        </div>

        {/* Tabs */}
        <div className="shrink-0 border-b border-border px-3 py-2">
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as typeof tab)}
            defaultValue="gruppe"
          >
            <TabList>
              <Tab value="gruppe">Min gruppe</Tab>
              <Tab value="akademi">Akademi</Tab>
              <Tab value="sok">Søk</Tab>
            </TabList>
          </Tabs>
        </div>

        {/* Søk-input */}
        <div className="shrink-0 border-b border-border px-5 py-3">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                tab === "sok"
                  ? "Søk etter navn eller gruppe …"
                  : "Filtrer listen …"
              }
              className="pl-10"
              aria-label="Søk"
            />
          </div>
        </div>

        {/* Spiller-liste */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                {tab === "sok" && query.length === 0
                  ? "Skriv inn et navn for å søke."
                  : "Ingen spillere funnet."}
              </p>
            </div>
          ) : (
            <ul className="space-y-1.5">
              {filtered.map((spiller) => {
                const state = statusPerSpiller[spiller.id] ?? "idle";
                const erInvitert = state === "sent" || state === "pending";
                return (
                  <li
                    key={spiller.id}
                    className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-secondary/60"
                  >
                    {/* Avatar */}
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                      style={{ background: avatarBg(spiller.name) }}
                      aria-hidden
                    >
                      {initialsFromName(spiller.name)}
                    </div>

                    {/* Navn + HCP/gruppe */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {spiller.name}
                      </p>
                      <p className="font-mono text-[11px] text-muted-foreground tabular-nums">
                        {spiller.hcp != null ? `HCP ${spiller.hcp}` : "Ingen HCP"}
                        {spiller.gruppe ? ` · ${spiller.gruppe}` : ""}
                      </p>
                    </div>

                    {/* CTA */}
                    <button
                      type="button"
                      onClick={() => handleInviter(spiller.id)}
                      disabled={erInvitert || (erFull && !erInvitert)}
                      aria-pressed={erInvitert}
                      className={cn(
                        "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                        erInvitert
                          ? "bg-primary/10 text-primary"
                          : state === "error"
                            ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                            : "bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40",
                      )}
                    >
                      {erInvitert ? (
                        <>
                          <Check size={12} strokeWidth={2.5} aria-hidden />
                          Invitert
                        </>
                      ) : state === "error" ? (
                        "Prøv igjen"
                      ) : (
                        <>
                          <UserPlus size={12} strokeWidth={2} aria-hidden />
                          Inviter
                        </>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-border bg-card px-5 py-4">
          <p className="font-mono text-[10.5px] text-muted-foreground tracking-wide">
            {inviterteIdag > 0
              ? `${inviterteIdag} invitert${inviterteIdag === 1 ? "" : "e"} nå`
              : "Ingen inviterte ennå"}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-9 items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Ferdig
          </button>
        </div>
      </div>
    </>
  );
}
