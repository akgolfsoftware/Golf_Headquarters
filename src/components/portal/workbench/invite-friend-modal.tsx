"use client";

/**
 * InviteFriendModal — v2-overlay (mørkt bakteppe + panel-kort).
 *
 * Brukes når host av en delt TrainingSessionV2 vil invitere spillere.
 * Tre faner: "Min gruppe" / "Akademi" / "Søk".
 *
 * Optimistic UI med useTransition: trykk "Inviter" → server action kjører
 * i bakgrunnen, UI markerer som "Invitert" umiddelbart, ruller tilbake ved
 * feil. Maks-deltakere-counter (X av Y plasser) håndheves klient-side i
 * tillegg til server-validering.
 *
 * v2-restyling 17. juli 2026 (Team F3): ModalSkall-idiomet (jf. MalDetaljV2)
 * med T-tokens/v2-primitiver erstatter legacy bottomsheet/Tailwind.
 * Invitasjons-logikken (inviterSpiller-action, optimistic state, filter,
 * counter) er uendret.
 */

import { useMemo, useState, useTransition } from "react";
import { T, Caps, PillTabs, AvatarInit, TomTilstand, Knapp } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
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
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Inviter spillere"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ position: "fixed", inset: 0, zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", background: "rgba(0,0,0,0.55)" }}
    >
      <div
        className="v2-sheet-in"
        style={{ width: "100%", maxWidth: 480, maxHeight: "86vh", display: "flex", flexDirection: "column", background: T.panel, border: `1px solid ${T.borderS}`, borderRadius: 20, boxShadow: "0 24px 60px rgba(0,0,0,0.5)", overflow: "hidden" }}
      >
        {/* Header */}
        <div style={{ flex: "none", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, padding: "18px 20px 14px", borderBottom: `1px solid ${T.border}` }}>
          <div>
            <Caps size={9}>Trene sammen</Caps>
            <h2 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 19, letterSpacing: "-0.02em", color: T.fg, margin: "6px 0 0", lineHeight: 1.2 }}>
              Inviter en kompis
            </h2>
          </div>
          <button
            type="button"
            aria-label="Lukk"
            onClick={onClose}
            className="v2-press v2-focus"
            style={{ appearance: "none", width: 28, height: 28, borderRadius: 8, background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flex: "none", color: T.fg2 }}
          >
            <Icon name="x" size={14} />
          </button>
        </div>

        {/* Counter */}
        <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 8, padding: "9px 20px", borderBottom: `1px solid ${T.border}`, background: T.panel2 }}>
          <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, fontVariantNumeric: "tabular-nums", letterSpacing: "0.04em", textTransform: "uppercase", color: T.fg2 }}>
            <span style={{ color: T.fg }}>{currentParticipants + inviterteIdag}</span> av{" "}
            {maxParticipants} plasser
          </span>
          {erFull && (
            <span style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: T.down, background: `color-mix(in srgb, ${T.down} 13%, transparent)`, borderRadius: 9999, padding: "3px 9px" }}>
              Fullt
            </span>
          )}
        </div>

        {/* Faner + søk */}
        <div style={{ flex: "none", padding: "12px 20px 12px" }}>
          <PillTabs
            tabs={[
              { id: "gruppe", l: "Min gruppe" },
              { id: "akademi", l: "Akademi" },
              { id: "sok", l: "Søk" },
            ]}
            value={tab}
            onChange={(id) => setTab(id as typeof tab)}
          />
          <div style={{ position: "relative", marginTop: 10 }}>
            <Icon
              name="search"
              size={14}
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: T.mut, pointerEvents: "none" }}
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                tab === "sok"
                  ? "Søk etter navn eller gruppe …"
                  : "Filtrer listen …"
              }
              aria-label="Søk"
              className="v2-focus"
              style={{ width: "100%", boxSizing: "border-box", appearance: "none", borderRadius: 11, border: `1px solid ${T.borderS}`, background: T.panel2, padding: "9px 12px 9px 34px", fontFamily: T.ui, fontSize: 13, color: T.fg, outline: "none" }}
            />
          </div>
        </div>

        {/* Spiller-liste */}
        <div style={{ flex: 1, minHeight: 120, overflowY: "auto", padding: "0 12px 10px" }}>
          {filtered.length === 0 ? (
            <TomTilstand
              icon="users"
              title={
                tab === "sok" && query.length === 0
                  ? "Søk etter spillere"
                  : "Ingen spillere funnet"
              }
              sub={
                tab === "sok" && query.length === 0
                  ? "Skriv inn et navn for å søke."
                  : "Prøv en annen fane eller et annet søkeord."
              }
            />
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              {filtered.map((spiller) => {
                const state = statusPerSpiller[spiller.id] ?? "idle";
                const erInvitert = state === "sent" || state === "pending";
                return (
                  <li
                    key={spiller.id}
                    style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 11, padding: "8px 8px" }}
                  >
                    <AvatarInit navn={spiller.name} size={34} />

                    {/* Navn + HCP/gruppe */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>
                        {spiller.name}
                      </p>
                      <p style={{ margin: "2px 0 0", fontFamily: T.mono, fontSize: 10.5, fontVariantNumeric: "tabular-nums", color: T.mut }}>
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
                      className="v2-press v2-focus"
                      style={{
                        appearance: "none",
                        cursor: erInvitert || (erFull && !erInvitert) ? "default" : "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        flex: "none",
                        minHeight: 32,
                        borderRadius: 9999,
                        border: "1px solid transparent",
                        padding: "5px 14px",
                        fontFamily: T.ui,
                        fontSize: 12,
                        fontWeight: 600,
                        opacity: erFull && !erInvitert ? 0.4 : 1,
                        background: erInvitert
                          ? `color-mix(in srgb, ${T.lime} 13%, transparent)`
                          : state === "error"
                            ? `color-mix(in srgb, ${T.down} 13%, transparent)`
                            : T.lime,
                        color: erInvitert
                          ? T.lime
                          : state === "error"
                            ? T.down
                            : T.onLime,
                      }}
                    >
                      {erInvitert ? (
                        <>
                          <Icon name="check" size={12} strokeWidth={2.5} />
                          Invitert
                        </>
                      ) : state === "error" ? (
                        "Prøv igjen"
                      ) : (
                        <>
                          <Icon name="user-plus" size={12} strokeWidth={2} />
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
        <div style={{ flex: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 20px", borderTop: `1px solid ${T.border}` }}>
          <span style={{ fontFamily: T.mono, fontSize: 10.5, fontVariantNumeric: "tabular-nums", color: T.mut }}>
            {inviterteIdag > 0
              ? `${inviterteIdag} invitert${inviterteIdag === 1 ? "" : "e"} nå`
              : "Ingen inviterte ennå"}
          </span>
          <Knapp icon="check" onClick={onClose}>
            Ferdig
          </Knapp>
        </div>
      </div>
    </div>
  );
}
