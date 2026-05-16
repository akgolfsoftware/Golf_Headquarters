import Link from "next/link";
import { CalendarCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { DisconnectButton } from "./disconnect-button";
import { SubscriptionsForm, type SubscriptionRow } from "./subscriptions-form";

type SearchParams = Promise<{ ok?: string; error?: string }>;

export default async function CalendarSettings({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { ok, error } = await searchParams;
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const conn = await prisma.googleCalendarConnection.findUnique({
    where: { userId: user.id },
    include: {
      subscriptions: {
        orderBy: [{ syncPush: "desc" }, { calendarName: "asc" }],
      },
    },
  });

  const rader: SubscriptionRow[] =
    conn?.subscriptions.map((s) => ({
      id: s.id,
      googleCalendarId: s.googleCalendarId,
      calendarName: s.calendarName,
      color: s.color,
      syncPush: s.syncPush,
      syncPull: s.syncPull,
      active: s.active,
      lastSyncAt: s.lastSyncAt ? s.lastSyncAt.toISOString() : null,
      lastError: s.lastError,
      watchExpiresAt: s.watchExpiresAt ? s.watchExpiresAt.toISOString() : null,
    })) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CoachHQ · Innstillinger · Google Calendar"
        titleLead="Google"
        titleItalic="Calendar"
        titleTrail="2-way sync"
        sub="Koble din Google-konto og velg hvilke kalendere som skal pushe bookinger og blokkere tider. Endringer i Google Calendar reflekteres tilbake hit."
      />

      {ok === "1" && (
        <div className="flex items-start gap-4 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm text-foreground">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-primary" strokeWidth={1.75} />
          <span>Google Calendar er koblet til. Velg hvilke kalendere du vil synke.</span>
        </div>
      )}
      {error && (
        <div className="flex items-start gap-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 flex-shrink-0" strokeWidth={1.75} />
          <span>Kobling feilet: {error.replace(/-/g, " ")}</span>
        </div>
      )}

      {conn ? (
        <>
          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <CalendarCheck className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold tracking-tight">
                    Koblet til
                  </h3>
                  <p className="text-sm text-muted-foreground">{conn.googleEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/api/google-calendar/connect"
                  className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:border-border"
                >
                  Koble på nytt
                </Link>
                <DisconnectButton />
              </div>
            </div>

            <dl className="mt-6 grid gap-4 sm:grid-cols-3 text-sm">
              <Rad label="Status" value={conn.status} />
              <Rad
                label="Siste sync"
                value={
                  conn.lastSyncAt
                    ? conn.lastSyncAt.toLocaleString("nb-NO", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "Aldri"
                }
              />
              <Rad
                label="Antall kalendere"
                value={String(rader.length)}
              />
              {conn.lastError && (
                <div className="sm:col-span-3">
                  <Rad label="Siste feil" value={conn.lastError} error />
                </div>
              )}
            </dl>
          </section>

          <SubscriptionsForm rows={rader} />
        </>
      ) : (
        <section className="rounded-2xl border border-border bg-card p-8 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CalendarCheck className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <h3 className="mt-4 font-display text-xl font-semibold tracking-tight">
            Ikke koblet til
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Klikk under for å koble til Google Calendar. Du blir sendt til Google
            for å bekrefte tilgang. Vi ber om lese- og skrive-tilgang for å unngå
            dobbel-booking.
          </p>
          <Link
            href="/api/google-calendar/connect"
            className="mt-6 inline-block rounded-md bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Koble til Google Calendar
          </Link>
        </section>
      )}

      <section className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-display text-base font-semibold tracking-tight">
          Slik fungerer det
        </h3>
        <ol className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>
            <span className="font-mono text-foreground">1.</span>{" "}
            <strong className="text-foreground">Pull</strong> — kalendere med
            denne på blokkerer ledige slots i AK Golf HQ.
          </li>
          <li>
            <span className="font-mono text-foreground">2.</span>{" "}
            <strong className="text-foreground">Push</strong> — bekreftede
            bookinger pushes til kalendere med denne på.
          </li>
          <li>
            <span className="font-mono text-foreground">3.</span> Endringer i
            Google (event flyttet eller slettet) reflekteres tilbake til
            Booking-tabellen via webhook.
          </li>
          <li>
            <span className="font-mono text-foreground">4.</span> Du kan slå av
            individuelle kalendere uten å koble fra hele tilkoblingen.
          </li>
        </ol>
      </section>
    </div>
  );
}

function Rad({
  label,
  value,
  error,
}: {
  label: string;
  value: string;
  error?: boolean;
}) {
  return (
    <div className="space-y-2">
      <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </dt>
      <dd
        className={
          error ? "text-sm text-destructive" : "font-mono text-sm text-foreground"
        }
      >
        {value}
      </dd>
    </div>
  );
}
