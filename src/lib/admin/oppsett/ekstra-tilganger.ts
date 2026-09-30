import { Capability, CAPABILITY_BESKRIVELSER } from "@/lib/auth/cbac";

/** G6: ekstra-tilganger utover COACH-defaulten som ADMIN kan gi ved invitasjon. */
export const EKSTRA_TILGANGER = [
  Capability.VIEW_FINANCE,
  Capability.MANAGE_FACILITIES,
  Capability.MANAGE_USERS,
  Capability.USE_AGENTS,
  Capability.INVITE_USERS,
].map((id) => ({ id, label: CAPABILITY_BESKRIVELSER[id] }));
