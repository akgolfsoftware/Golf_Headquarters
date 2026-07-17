"use client";

/**
 * InviteFriendTrigger — knapp som åpner InviteFriendModal.
 *
 * Tynn client-wrapper for å brukes fra server-komponenter (RSC). Server-siden
 * gjør authz og henter spiller-listen; denne håndterer kun open/close-state.
 *
 * v2-restyling 17. juli 2026 (Team F3): rendrer v2 `Knapp` i stedet for
 * legacy Tailwind-pille. Props-API og invitasjons-logikk er uendret.
 */

import { useState } from "react";
import { Knapp } from "@/components/v2";
import {
  InviteFriendModal,
  type InviteSpiller,
} from "./invite-friend-modal";

export type InviteFriendTriggerProps = {
  sessionId: string;
  hostId: string;
  maxParticipants: number;
  currentParticipants: number;
  spillere: InviteSpiller[];
  alleredeInviterte?: string[];
  label?: string;
  variant?: "primary" | "ghost";
  className?: string;
};

export function InviteFriendTrigger({
  sessionId,
  hostId,
  maxParticipants,
  currentParticipants,
  spillere,
  alleredeInviterte,
  label = "Inviter en kompis",
  variant = "primary",
  className,
}: InviteFriendTriggerProps) {
  const [open, setOpen] = useState(false);

  const knapp = (
    <Knapp ghost={variant === "ghost"} icon="users" onClick={() => setOpen(true)}>
      {label}
    </Knapp>
  );

  return (
    <>
      {className ? <span className={className}>{knapp}</span> : knapp}

      <InviteFriendModal
        open={open}
        onClose={() => setOpen(false)}
        sessionId={sessionId}
        hostId={hostId}
        maxParticipants={maxParticipants}
        currentParticipants={currentParticipants}
        spillere={spillere}
        alleredeInviterte={alleredeInviterte}
      />
    </>
  );
}
