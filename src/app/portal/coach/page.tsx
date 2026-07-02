/**
 * PlayerHQ Coach Hub (/portal/coach) — hybrid-design 2026-06-17.
 *
 * Layout (mobil-første, etter design-fasit):
 *   1. Mono eyebrow "Coach · <coachName>"  +  display-tittel "Din coach"
 *   2. Coach insight card — lime venstre-border, avatar, ukes-fokus, CTA-knapper
 *   3. Event timeline card — "Kommende med coach" med tidslinje-prikker
 *   4. Meldinger preview — chat-bobler + inline send-felt
 *
 * Alle knapper er koblet til ekte ruter — ingen døde lenker.
 */

import Link from "next/link";
import { Calendar, Send, User } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { MessageThread } from "@/components/portal/coach/MessageThread";
import {
  getCoachProfile,
  getMessages,
  sendMessage,
  getUpcomingSessions,
  getCoachNotes,
} from "./actions";

export const dynamic = "force-dynamic";

// ── helpers ───────────────────────────────────────────────────────

function formatEventDate(d: Date): string {
  const now = new Date();
  const todayStr = now.toDateString();
  const isToday = d.toDateString() === todayStr;
  const timeStr = d.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Oslo",
  });
  if (isToday) return `I dag ${timeStr}`;
  const dateStr = d.toLocaleDateString("nb-NO", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Europe/Oslo",
  });
  const capitalised = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  return `${capitalised} ${timeStr}`;
}

function formatDuration(start: Date, end: Date): string {
  const diffMin = Math.round((end.getTime() - start.getTime()) / 60_000);
  if (diffMin >= 60) {
    const h = Math.floor(diffMin / 60);
    const m = diffMin % 60;
    return m === 0 ? `${h} t` : `${h} t ${m} min`;
  }
  return `${diffMin} min`;
}

// ── page ──────────────────────────────────────────────────────────

export default async function CoachPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN", "GUEST"] });

  const coach = await getCoachProfile();

  const [messages, upcomingSessions, coachNotes] = await Promise.all([
    coach ? getMessages(coach.id) : Promise.resolve([]),
    getUpcomingSessions(),
    getCoachNotes(),
  ]);

  const meInitials = user.name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const meName = user.name.split(" ")[0] ?? "Deg";

  // Vis kun de 4 første kommende sesjonene i timelinjen
  const timelineEvents = upcomingSessions.slice(0, 4);

  return (
    <div className="mx-auto max-w-[430px] space-y-0 px-0 pb-24 md:max-w-[860px] md:pb-0">

      {/* ── 1. Header ──────────────────────────────────────────── */}
      <div className="px-4 pb-4 pt-2 md:px-6">
        <span className="mb-2.5 block font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Coach · {coach?.name ?? "Din coach"}
        </span>
        <h1 className="font-display text-[28px] font-bold leading-[1.04] tracking-[-0.035em] text-foreground">
          Din{" "}
          <em className="font-medium italic text-primary">coach</em>
        </h1>
      </div>

      {/* ── 2. Coach insight card ───────────────────────────────── */}
      <div className="mx-3 mb-3.5 overflow-hidden rounded-xl border border-l-[3px] border-border border-l-accent bg-card shadow-sm md:mx-0">
        <div className="p-4">
          {coach ? (
            <>
              {/* Avatar + navn */}
              <div className="mb-3 flex items-center gap-2.5">
                <div className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full bg-primary font-mono text-[13px] font-bold text-primary-foreground">
                  {coach.initials}
                </div>
                <div>
                  <div className="font-display text-[14.5px] font-bold leading-tight text-foreground">
                    {coach.name}
                  </div>
                  <div className="font-mono text-[9.5px] text-muted-foreground">
                    Head Coach · AK Golf Academy
                  </div>
                </div>
              </div>

              {/* Ukes-fokus (bruker nyeste coach-notat som fokustekst, eller placeholder) */}
              {coachNotes.length > 0 ? (
                <p className="mb-3 text-[13.5px] leading-[1.55] text-foreground">
                  <em className="font-medium italic text-primary">
                    {coachNotes[0].title ?? "Fokus fra coach:"}
                  </em>{" "}
                  {coachNotes[0].content.slice(0, 140)}
                  {coachNotes[0].content.length > 140 ? "…" : ""}
                </p>
              ) : (
                <p className="mb-3 text-[13.5px] leading-[1.55] text-muted-foreground">
                  Ingen fokusnotat fra coach denne uka.
                </p>
              )}

              {/* CTA-knapper */}
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/portal/coach/melding"
                  className="flex flex-1 items-center justify-center rounded-lg bg-primary px-3 py-2.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.06em] text-primary-foreground transition hover:brightness-95"
                >
                  Send melding
                </Link>
                <Link
                  href={`/portal/coach/${coach.id}`}
                  className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-secondary px-3.5 py-2.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.06em] text-foreground transition hover:bg-secondary/70"
                >
                  Se profil
                </Link>
                <Link
                  href="/portal/booking"
                  className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-secondary px-3.5 py-2.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.06em] text-foreground transition hover:bg-secondary/70"
                >
                  Booking
                </Link>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4 py-2">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground">
                <User className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="font-display text-[15px] font-semibold">Ingen coach tildelt ennå</h2>
                <p className="text-[13px] text-muted-foreground">
                  Kontakt AK Golf for å komme i gang.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 3. Event timeline card ─────────────────────────────── */}
      <div className="mx-3 mb-3.5 rounded-xl border border-border bg-card p-4 shadow-sm md:mx-0">
        <div className="mb-3 font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          Kommende med coach
        </div>

        {timelineEvents.length === 0 ? (
          <div className="flex items-center gap-3 py-3 text-[13px] text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            <span>Ingen kommende coaching-sesjoner.</span>
          </div>
        ) : (
          <div className="relative pl-[18px]">
            {/* Vertikal strek */}
            <div
              className="absolute bottom-1 left-[5px] top-1 w-px bg-border"
              aria-hidden
            />

            {timelineEvents.map((s, i) => {
              const now = new Date();
              const isToday = s.startAt.toDateString() === now.toDateString();
              const daysUntil = Math.ceil((s.startAt.getTime() - now.getTime()) / 86_400_000);
              const isSoon = !isToday && daysUntil <= 7;
              const durationStr = formatDuration(s.startAt, s.endAt);
              const locationMeta = s.locationName
                ? `${s.locationName} · ${durationStr}`
                : durationStr;

              return (
                <div key={s.id} className={`relative ${i < timelineEvents.length - 1 ? "pb-3.5" : ""}`}>
                  {/* Dot — 3 states: lime=i dag, forest-border=snart, grå=langt frem */}
                  <span
                    className="absolute left-[-13px] top-[3px] h-[9px] w-[9px] rounded-full"
                    style={
                      isToday
                        ? { background: "var(--accent)", border: "2px solid var(--primary)" }
                        : isSoon
                          ? { background: "white", border: "2px solid var(--primary)" }
                          : { background: "white", border: "2px solid var(--border)" }
                    }
                    aria-hidden
                  />
                  <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                    {formatEventDate(s.startAt)}
                  </div>
                  <div className="mt-0.5 text-[13.5px] font-semibold text-foreground">
                    {s.title}
                  </div>
                  <div className="text-[12px] text-muted-foreground">{locationMeta}</div>
                </div>
              );
            })}
          </div>
        )}

        {upcomingSessions.length > 4 && (
          <Link
            href="/portal/booking"
            className="mt-3 block border-t border-border pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-primary hover:underline"
          >
            Se alle {upcomingSessions.length} sesjoner →
          </Link>
        )}
      </div>

      {/* ── 4. Meldinger card ──────────────────────────────────── */}
      {coach ? (
        <div className="mx-3 mb-3.5 overflow-hidden rounded-xl border border-border bg-card shadow-sm md:mx-0">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 px-3.5 py-3">
            <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              Meldinger
            </span>
            {messages.filter((m) => m.role === "coach").length > 0 && (
              <span className="rounded-full bg-accent px-1.5 py-0.5 font-mono text-[9px] font-bold text-foreground">
                {messages.filter((m) => m.role === "coach").length} nye
              </span>
            )}
          </div>

          {/* Message preview — siste 3 meldinger */}
          <div className="flex flex-col gap-2.5 px-3.5 py-3">
            {messages.length === 0 ? (
              <p className="py-2 text-[13px] text-muted-foreground">
                Ingen meldinger ennå. Start samtalen med {coach.name.split(" ")[0]}.
              </p>
            ) : (
              messages.slice(-3).map((m) => {
                const isMe = m.role === "me";
                return (
                  <div
                    key={m.id}
                    className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}
                  >
                    {/* Avatar */}
                    <div
                      className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full font-mono text-[9px] font-bold"
                      style={
                        isMe
                          ? { background: "var(--border)", color: "var(--muted-foreground)" }
                          : { background: "var(--primary)", color: "var(--primary-foreground)" }
                      }
                    >
                      {isMe ? meInitials : coach.initials}
                    </div>
                    {/* Boble */}
                    <div
                      className="max-w-[78%] rounded-2xl px-3 py-2 text-[13.5px] leading-snug"
                      style={
                        isMe
                          ? {
                              borderRadius: "14px 14px 4px 14px",
                              background: "var(--primary)",
                              color: "var(--primary-foreground)",
                            }
                          : {
                              borderRadius: "14px 14px 14px 4px",
                              background: "var(--secondary)",
                              color: "var(--foreground)",
                            }
                      }
                    >
                      {m.body}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Inline send-felt */}
          <div className="flex items-center gap-2 border-t border-border/60 px-3.5 py-2.5">
            <Link
              href="/portal/coach/melding"
              className="flex flex-1 items-center gap-3 rounded-full border border-border bg-secondary px-3 py-2 text-[13px] text-muted-foreground"
            >
              Skriv til coach …
            </Link>
            <Link
              href="/portal/coach/melding"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary"
              aria-label="Gå til meldinger"
            >
              <Send className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={2} />
            </Link>
          </div>
        </div>
      ) : null}

      {/* ── 5. Full message thread (desktop / sekundær visning) ── */}
      {coach && messages.length > 0 && (
        <div className="mx-3 mt-3.5 hidden md:mx-0 md:block">
          <MessageThread
            coachName={coach.name}
            coachInitials={coach.initials}
            coachAvatarUrl={coach.avatarUrl}
            meName={meName}
            meInitials={meInitials}
            initialMessages={messages}
            onSend={async (body) => {
              "use server";
              await sendMessage({ coachId: coach.id, content: body });
            }}
          />
        </div>
      )}
    </div>
  );
}
