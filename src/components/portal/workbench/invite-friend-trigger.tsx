"use client";

/**
 * InviteFriendTrigger — knapp som åpner InviteFriendModal.
 *
 * Tynn client-wrapper for å brukes fra server-komponenter (RSC). Server-siden
 * gjør authz og henter spiller-listen; denne håndterer kun open/close-state.
 */

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
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

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
          variant === "primary"
            ? "bg-primary text-primary-foreground hover:opacity-90"
            : "border border-border bg-card text-foreground hover:bg-secondary",
          className,
        )}
      >
        <UserPlus size={14} strokeWidth={2} aria-hidden />
        {label}
      </button>

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
