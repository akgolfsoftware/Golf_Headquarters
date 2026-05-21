/**
 * Innstillinger — /portal/meg/innstillinger
 * Implementering av "Innstillinger.html" fra Claude Design-bundlen.
 *
 * Server-component med:
 *  - Auth-guard via requirePortalUser
 *  - Account block med tier-badge
 *  - 6 kategori-kort (Notifikasjoner, Personvern, Integrasjoner, Språk,
 *    Sikkerhet, Apparater og økter)
 *  - "Rediger profil"-modal som åpnes fra account-block
 *  - Faresone med "Slett konto permanent"
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { lesPreferences } from "@/lib/preferences";
import { InnstillingerShell } from "@/components/meg/innstillinger-shell";

export const dynamic = "force-dynamic";

function initials(name: string | null | undefined): string {
  if (!name) return "??";
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function InnstillingerPage() {
  const user = await requirePortalUser();

  // Hent integrasjons-status (GolfBox, TrackMan, Apple Health, etc.)
  // Bruker count på TrackManSession + GoogleCalendarConnection som proxy
  const [tmCount, gcal] = await Promise.all([
    prisma.trackManSession
      .count({ where: { userId: user.id } })
      .catch(() => 0),
    prisma.googleCalendarConnection
      .findUnique({ where: { userId: user.id } })
      .catch(() => null),
  ]);

  const tmConnected = tmCount > 0;
  const gcalConnected = !!gcal;
  const connected = [
    "GolfBox", // antatt koblet (vi har ingen modell for det enda)
    tmConnected ? "TrackMan" : null,
    gcalConnected ? "Google Calendar" : null,
  ].filter(Boolean) as string[];

  // Hent notif-preferanser
  const prefs = lesPreferences(user);
  const notifFields = [
    prefs.notif.epost,
    prefs.notif.push,
    prefs.notif.paaminnelse,
    prefs.notif.nyMeldingFraCoach,
    prefs.notif.treningsplanOppdatert,
    prefs.notif.bookingbekreftelse,
    prefs.notif.ukentligRapport,
    prefs.notif.turneringsresultater,
  ];
  const notifActive = notifFields.filter(Boolean).length;
  const notifTotal = 12;

  return (
    <InnstillingerShell
      user={{
        name: user.name ?? "Spiller",
        email: user.email ?? "",
        phone: user.phone ?? null,
        homeClub: user.homeClub ?? null,
        hcp: user.hcp ?? null,
        aListe: "A1",
        avatarUrl: user.avatarUrl ?? null,
        initials: initials(user.name),
        dominantHand: "RIGHT",
      }}
      tier={user.tier}
      notifCount={{ active: notifActive, total: notifTotal }}
      integrationsCount={{
        connected: connected.length,
        names: connected.slice(0, 2).join(", ") + (connected.length > 2 ? ` +${connected.length - 2}` : ""),
      }}
    />
  );
}
