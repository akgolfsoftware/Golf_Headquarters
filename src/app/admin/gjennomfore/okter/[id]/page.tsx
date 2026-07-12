/**
 * AgencyOS Økt-detalj (coach-context) — v2. Auth/Prisma-loader og all
 * avledet data (status fra tid, spiller-meta) bevart 1:1 fra legacy.
 * AvlysOktKnapp/StartOktKnapp (golfdata fjernet) gjenbrukes. Status-pill
 * bytter farge basert på tid (OM 2 TIMER / AKTIV NÅ / GJENNOMFØRT).
 *
 * NB: SESSION_DRILLS, prep-notater og "etter økt"-rating er fortsatt
 * plassholder-innhold portet fra det opprinnelige design-bundlet (ikke
 * min endring — bevart 1:1, flagges separat for datakobling).
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { Pause, ChevronsRight, GripVertical, Star } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { calculateAge } from "@/lib/auth/minor";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { T } from "@/lib/v2/tokens";
import { Caps, Tittel, Kort, StatusPill, MikroMeta, CTAPill, AvatarInit } from "@/components/v2";
import { AvlysOktKnapp } from "./avlys-okt-knapp";
import { StartOktKnapp } from "./start-okt-knapp";

export const dynamic = "force-dynamic";

type Status = "OM 2 TIMER" | "AKTIV NÅ" | "GJENNOMFØRT";

const SESSION_DRILLS = [
  { name: "Oppvarming · 5m putts", category: "PUTT", mins: "4 min", reps: "20", done: 20, target: 20 },
  { name: "Gate-putt med start-linje", category: "PUTT", mins: "5 min", reps: "8 av 10", done: 7, target: 10 },
  { name: "Lag-på-lag stige 1m → 3m", category: "PUTT", mins: "6 min", reps: "8 av 10", done: 4, target: 10 },
  { name: "Speed-kontroll 6m", category: "PUTT", mins: "3 min", reps: "70% inn ±0,5m", done: 0, target: 10 },
  { name: "Free-throw · 3 av 5 fra 2,5m", category: "PUTT", mins: "2 min", reps: "3 av 5", done: 0, target: 5 },
];

function deriveStatus(start: Date, durationMin: number): Status {
  const now = Date.now();
  const startMs = start.getTime();
  const endMs = startMs + durationMin * 60 * 1000;
  if (now < startMs) return "OM 2 TIMER";
  if (now >= startMs && now <= endMs) return "AKTIV NÅ";
  return "GJENNOMFØRT";
}

export default async function OktDetaljPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, hcp: true, dateOfBirth: true, wagrSnapshot: { select: { rank: true } } },
      },
    },
  });

  if (!booking || !booking.user) notFound();

  const facility = booking.facilityId
    ? await prisma.facility.findUnique({ where: { id: booking.facilityId }, select: { id: true, name: true } }).catch(() => null)
    : null;

  const durationMin = Math.round((booking.endAt.getTime() - booking.startAt.getTime()) / 60000);
  const status = deriveStatus(booking.startAt, durationMin);
  const dateLabel = booking.startAt.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long" });
  const startTime = booking.startAt.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
  const endTime = booking.endAt.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });

  const spiller = booking.user;
  const fornavn = spiller.name.split(" ")[0];

  const statusTone: "warn" | "lime" | "info" = status === "OM 2 TIMER" ? "warn" : status === "AKTIV NÅ" ? "lime" : "info";

  const alder = calculateAge(spiller.dateOfBirth);
  const wagrRank = spiller.wagrSnapshot?.rank ?? null;
  const spillerMeta = [
    `HCP ${spiller.hcp != null ? spiller.hcp : "—"}`,
    wagrRank != null ? `WAGR ${wagrRank.toLocaleString("nb-NO")}` : null,
    alder != null ? `${alder} år` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <V2Shell aktiv="kalender" nav={AGENCYOS_NAV} navn={coach.name} avatarUrl={coach.avatarUrl}>
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap, paddingBottom: 72 }}>
        <Link href="/admin/gjennomfore" style={{ textDecoration: "none", alignSelf: "flex-start" }}>
          <MikroMeta icon="arrow-left">Gjennomføre · Økter</MikroMeta>
        </Link>

        {/* Hode */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Caps>{fornavn} · putt-fokus</Caps>
              <StatusPill tone={statusTone}>{status}</StatusPill>
            </div>
            <div style={{ marginTop: 10 }}>
              <Tittel>{spiller.name}</Tittel>
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "10px 0 0" }}>
              {dateLabel} · {startTime}–{endTime} · {facility?.name ?? "Studio"} · {durationMin} min · TrackMan Bridge
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {status !== "GJENNOMFØRT" ? (
              <>
                <Link href="/admin/bookinger" style={{ textDecoration: "none" }}>
                  <CTAPill ghost>Reschedule</CTAPill>
                </Link>
                <AvlysOktKnapp bookingId={booking.id} spillerNavn={spiller.name} />
                <StartOktKnapp bookingId={booking.id} label={status === "AKTIV NÅ" ? "Åpne live-konsoll" : "Start økt"} />
              </>
            ) : booking.trainingSessionV2Id ? (
              <Link href={`/admin/live/${booking.trainingSessionV2Id}/summary`} style={{ textDecoration: "none" }}>
                <CTAPill icon="send">Skriv oppfølging</CTAPill>
              </Link>
            ) : (
              <CTAPill ghost>Skriv oppfølging</CTAPill>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr]" style={{ gap: T.gap }}>
          {/* Venstre */}
          <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
            {status === "AKTIV NÅ" && <LiveProgressStrip drills={SESSION_DRILLS} />}

            {/* Planlagt innhold */}
            <Kort
              eyebrow="Planlagt innhold"
              action={
                <span style={{ fontFamily: T.mono, fontSize: 10.5, textTransform: "uppercase", color: T.mut }}>
                  {SESSION_DRILLS.length} drills · {durationMin} min
                </span>
              }
            >
              {SESSION_DRILLS.map((d, i, arr) => {
                const isActive = status === "AKTIV NÅ" && i === 2;
                return (
                  <div
                    key={d.name}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "20px 1fr auto",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      marginBottom: i === arr.length - 1 ? 0 : 8,
                      borderRadius: 10,
                      border: `1px solid ${isActive ? T.lime : T.border}`,
                      background: isActive ? "color-mix(in srgb, " + T.lime + " 8%, transparent)" : T.panel2,
                    }}
                  >
                    <GripVertical size={16} color={T.mut} />
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <StatusPill tone="warn">{d.category}</StatusPill>
                        <span style={{ fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", color: T.mut }}>
                          {d.mins} · mål {d.reps}
                        </span>
                      </div>
                      <div style={{ fontFamily: T.disp, fontSize: 13.5, fontWeight: 600, color: T.fg }}>{d.name}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {status === "GJENNOMFØRT" && (
                        <div style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.up }}>
                          {d.done}/{d.target}
                        </div>
                      )}
                      {isActive && <StatusPill tone="lime">Nå</StatusPill>}
                      {status === "OM 2 TIMER" && (
                        <span style={{ fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", color: T.mut }}>Venter</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </Kort>

            {/* Notater */}
            <Kort eyebrow="Notater">
              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: T.gap }}>
                <div>
                  <Caps size={9}>Prep · du skrev</Caps>
                  <p style={{ fontFamily: T.disp, fontStyle: "italic", fontSize: 13, lineHeight: 1.6, color: T.fg2, marginTop: 8 }}>
                    «{fornavn} klagde forrige uke over at start-linja vandret på lange putts. Kjør gate-drill først for å
                    re-kalibrere — så bygge tilbake til speed-kontroll.»
                  </p>
                </div>
                <div>
                  <Caps size={9}>{fornavn.toUpperCase()} ønsket</Caps>
                  <p style={{ fontFamily: T.disp, fontStyle: "italic", fontSize: 13, lineHeight: 1.6, color: T.fg2, marginTop: 8 }}>
                    «Vil ha hjelp med å lese rake-greener — Olyo Tour på Larvik har mye sidefall.»
                  </p>
                </div>
              </div>
            </Kort>

            {/* Etter økt */}
            {status === "GJENNOMFØRT" && (
              <Kort eyebrow="Etter økt">
                <div style={{ display: "flex", alignItems: "center", gap: 14, paddingBottom: 10, borderBottom: `1px solid ${T.border}` }}>
                  <Caps size={9}>Rating</Caps>
                  <div style={{ display: "flex", gap: 3 }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={16} fill={i <= 4 ? T.lime : "none"} color={i <= 4 ? T.lime : T.border} />
                    ))}
                  </div>
                  <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>{fornavn} · 4/5</span>
                </div>
                <div style={{ padding: "12px 0" }}>
                  <Caps size={9}>Coach-oppsummering</Caps>
                  <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg, lineHeight: 1.6, marginTop: 6 }}>
                    Solid økt — start-linje 1,4° SD (mål 1,5°). Speed-drill skummelt på 6m, bør gjentas neste uke.
                  </p>
                </div>
                <CTAPill>Bok neste økt → onsdag 04.06</CTAPill>
              </Kort>
            )}
          </div>

          {/* Høyre: spiller-info */}
          <Kort eyebrow="Spiller">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <AvatarInit navn={spiller.name} size={44} />
              <div>
                <div style={{ fontFamily: T.disp, fontSize: 14.5, fontWeight: 700, color: T.fg }}>{spiller.name}</div>
                <div style={{ fontFamily: T.mono, fontSize: 10.5, textTransform: "uppercase", color: T.mut, marginTop: 3 }}>{spillerMeta}</div>
              </div>
            </div>
            <Caps size={9}>Siste 5 økter</Caps>
            <div className="grid grid-cols-5" style={{ gap: 6, marginTop: 10 }}>
              {[
                { l: "P", d: "25.05" },
                { l: "T", d: "22.05" },
                { l: "P", d: "20.05" },
                { l: "F", d: "17.05" },
                { l: "P", d: "15.05" },
              ].map((s, i) => (
                <div key={i} style={{ borderRadius: 8, background: T.panel2, padding: "8px 4px", textAlign: "center" }}>
                  <div style={{ fontFamily: T.mono, fontSize: 8.5, color: T.mut }}>{s.d}</div>
                  <div
                    style={{
                      display: "inline-grid",
                      placeItems: "center",
                      width: 20,
                      height: 20,
                      borderRadius: 9999,
                      background: T.panel3,
                      fontFamily: T.mono,
                      fontSize: 8.5,
                      fontWeight: 700,
                      color: T.fg,
                      marginTop: 4,
                    }}
                  >
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </Kort>
        </div>
      </div>

      {/* Sticky mobile CTA */}
      <div
        style={{
          position: "fixed",
          insetInline: 0,
          bottom: 0,
          zIndex: 30,
          borderTop: `1px solid ${T.border}`,
          background: T.panel,
          padding: "10px 16px",
          display: "flex",
          gap: 8,
        }}
        className="md:hidden"
      >
        {status !== "GJENNOMFØRT" ? (
          <>
            <Link href="/admin/bookinger" style={{ textDecoration: "none", flex: 1 }}>
              <CTAPill ghost>Reschedule</CTAPill>
            </Link>
            <StartOktKnapp bookingId={booking.id} label={status === "AKTIV NÅ" ? "Åpne live" : "Start"} fullWidth />
          </>
        ) : booking.trainingSessionV2Id ? (
          <Link href={`/admin/live/${booking.trainingSessionV2Id}/summary`} style={{ textDecoration: "none", flex: 1 }}>
            <CTAPill icon="send">Skriv oppfølging</CTAPill>
          </Link>
        ) : (
          <CTAPill ghost>Skriv oppfølging</CTAPill>
        )}
      </div>
    </V2Shell>
  );
}

function LiveProgressStrip({ drills }: { drills: typeof SESSION_DRILLS }) {
  const done = drills.filter((d) => d.done > 0).length;
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 16,
        padding: 20,
        color: "#fff",
        background: `linear-gradient(135deg, ${T.bg} 0%, ${T.forest} 130%)`,
      }}
    >
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <StatusPill tone="lime">Aktiv nå</StatusPill>
        <span style={{ fontFamily: T.mono, fontSize: 10.5, textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>
          14:08 · 8 min gått
        </span>
      </div>
      <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr auto", alignItems: "end", gap: 20 }}>
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 9.5, textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>
            Nåværende drill · {done}/{drills.length}
          </div>
          <div style={{ fontFamily: T.disp, fontSize: 17, fontWeight: 700, marginTop: 4 }}>Lag-på-lag stige 1m → 3m</div>
          <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.lime, marginTop: 4 }}>4 av 10 inn · 40% hit-rate</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            type="button"
            aria-label="Pause"
            style={{ display: "grid", placeItems: "center", width: 34, height: 34, borderRadius: 9999, background: "rgba(255,255,255,0.1)", border: "none", color: "#fff" }}
          >
            <Pause size={14} />
          </button>
          <button
            type="button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              height: 34,
              padding: "0 14px",
              borderRadius: 9999,
              background: T.lime,
              border: "none",
              color: T.onLime,
              fontFamily: T.mono,
              fontSize: 10.5,
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            <ChevronsRight size={13} /> Neste
          </button>
        </div>
      </div>
      <div style={{ position: "relative", marginTop: 14, display: "flex", gap: 4 }}>
        {drills.map((d, i) => {
          const pct = d.target > 0 ? (d.done / d.target) * 100 : 0;
          return (
            <div key={i} style={{ height: 5, flex: 1, borderRadius: 9999, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
              <div style={{ height: "100%", background: T.lime, width: `${Math.min(100, pct)}%` }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
