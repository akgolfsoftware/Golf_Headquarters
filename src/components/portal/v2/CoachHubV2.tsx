"use client";

/**
 * PlayerHQ Coach-hub — v2 Presis + B-pakke (status + én primær «skriv/book»).
 * Coachkort, kommende økter, meldingstråd. T.* only. Tom = grønn vei.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  T,
  Caps,
  Tittel,
  Kort,
  Rad,
  StatusPill,
  CTAPill,
  AvatarFoto,
  InnsiktChip,
  TomTilstand,
  MeldingsTraad,
  Icon,
  type Melding,
  type StatusTone,
} from "@/components/v2";

/* ── Datakontrakt (speiler /portal/coach sin loader) ───────────────── */

export type CoachHubData = {
  /** Primær coach (enrollment → direkte session → første coach), eller null. */
  coach: { id: string; name: string; initials: string; avatarUrl: string | null } | null;
  /** Spillerens fornavn (for tom-tilstand i tråden). */
  meFornavn: string;
  /** Nyeste ikke-private coach-notat brukt som ukes-fokus, eller null. */
  fokus: { title: string | null; content: string } | null;
  /** Direkte meldingstråd (eldste→nyeste). */
  meldinger: { id: string; role: "me" | "coach"; body: string; ts: string }[];
  /** Kommende bookinger + planøkter med coach (sortert stigende). */
  kommende: { id: string; title: string; startAt: Date; endAt: Date; locationName: string | null; status: string }[];
};

/* ── Rene hjelpere (norsk bokmål) ──────────────────────────────────── */

const UKEDAG_KORT = ["søn", "man", "tir", "ons", "tor", "fre", "lør"];
const MND_KORT = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];

function klokke(d: Date): string {
  return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Oslo" });
}

/** «I dag» eller «man 14. jul». */
function datoKort(d: Date): string {
  const naa = new Date();
  if (d.toDateString() === naa.toDateString()) return "I dag";
  return `${UKEDAG_KORT[d.getDay()]} ${d.getDate()}. ${MND_KORT[d.getMonth()]}`;
}

/** Varighet start→slutt: «1,5 t» (≥60) eller «45 min». */
function varighet(start: Date, end: Date): string {
  const min = Math.round((end.getTime() - start.getTime()) / 60_000);
  if (min >= 60) return `${(min / 60).toFixed(1).replace(".", ",")} t`;
  return `${min} min`;
}

/** ISO-ts → «09:15» (ugyldig ts → tom streng). */
function tidFraTs(ts: string): string {
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? "" : klokke(d);
}

/** Nærhets-status for en kommende økt (i dag / snart), ellers ingen pill. */
function naerhet(d: Date): { l: string; tone: StatusTone } | null {
  const naa = new Date();
  if (d.toDateString() === naa.toDateString()) return { l: "I dag", tone: "lime" };
  const dager = Math.ceil((d.getTime() - naa.getTime()) / 86_400_000);
  if (dager <= 7) return { l: "Snart", tone: "info" };
  return null;
}

/** true på klient etter mount når viewport < 768px (styrer kun tallstørrelser). */
function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

/* ── Snarvei-CTA (Link + CTAPill — v2-idiomet, jf. GjorV2) ──────────── */

function Snarvei({ href, icon, ghost, children }: { href: string; icon: string; ghost?: boolean; children: string }) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <CTAPill icon={icon} ghost={ghost}>{children}</CTAPill>
    </Link>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function CoachHubV2({ data }: { data: CoachHubData }) {
  const mobile = useMobile();
  const { coach, fokus, meldinger, kommende } = data;

  const nyeFraCoach = meldinger.filter((m) => m.role === "coach").length;
  const sisteMeldinger: Melding[] = meldinger.slice(-4).map((m) => ({
    meg: m.role === "me",
    fra: m.role === "coach" ? coach?.name : undefined,
    tekst: m.body,
    tid: tidFraTs(m.ts),
  }));

  const timeline = kommende.slice(0, 4);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode + B: status først */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <Caps>{coach ? `Coach · ${coach.name}` : "Coach"}</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel mobile={mobile} em="coach">Din</Tittel>
          </div>
        </div>
        {coach ? (
          <StatusPill tone={kommende.length > 0 ? "lime" : "info"}>
            {kommende.length > 0 ? `${kommende.length} kommende` : "Ingen time booket"}
          </StatusPill>
        ) : (
          <StatusPill tone="warn">Ingen coach</StatusPill>
        )}
      </div>

      {/* B: én primær CTA */}
      {coach ? (
        <Link href="/portal/coach/melding" style={{ textDecoration: "none", display: "block" }}>
          <CTAPill icon="send" full>
            {meldinger.length > 0 ? "Skriv til coach" : `Start samtalen med ${coach.name.split(" ")[0]}`}
          </CTAPill>
        </Link>
      ) : (
        <Link href="/portal/booking" style={{ textDecoration: "none", display: "block" }}>
          <CTAPill icon="calendar" full>
            Book en time
          </CTAPill>
        </Link>
      )}

      {/* Coachkort + tidslinje */}
      <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr]" style={{ gap: T.gap, alignItems: "start" }}>
        <Kort tint eyebrow="Din coach">
          {coach ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                <AvatarFoto src={coach.avatarUrl} navn={coach.name} size={48} ring />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg, lineHeight: 1.2 }}>{coach.name}</div>
                  <Caps size={9} style={{ marginTop: 5 }}>Head Coach · AK Golf Academy</Caps>
                </div>
              </div>

              {fokus ? (
                <div style={{ marginTop: 14 }}>
                  <InnsiktChip>
                    {fokus.title ? <strong style={{ color: T.fg, fontWeight: 700 }}>{fokus.title}: </strong> : null}
                    {fokus.content.slice(0, 160)}
                    {fokus.content.length > 160 ? "…" : ""}
                  </InnsiktChip>
                </div>
              ) : (
                <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.6, margin: "14px 0 0" }}>
                  Ingen fokusnotat fra coach denne uka.
                </p>
              )}

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
                <Snarvei href={`/portal/coach/${coach.id}`} icon="user" ghost>Se profil</Snarvei>
                <Snarvei href="/portal/booking" icon="calendar" ghost>Booking</Snarvei>
              </div>
            </>
          ) : (
            <TomTilstand icon="user" title="Ingen coach tildelt ennå" sub="Book en time eller kontakt AK Golf for tildeling." />
          )}
        </Kort>

        <Kort eyebrow="Kommende med coach" action={kommende.length > 0 ? <Caps size={9}>{kommende.length} økter</Caps> : undefined}>
          {timeline.length > 0 ? (
            <>
              {timeline.map((s, i) => {
                const naer = naerhet(s.startAt);
                const sub = [s.locationName, varighet(s.startAt, s.endAt)].filter(Boolean).join(" · ");
                return (
                  <Rad
                    key={s.id}
                    leading={
                      <span style={{ width: 52, flex: "none", display: "flex", flexDirection: "column", gap: 2 }}>
                        <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: naer?.tone === "lime" ? T.lime : T.fg, fontVariantNumeric: "tabular-nums" }}>{klokke(s.startAt)}</span>
                        <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: T.mut }}>{datoKort(s.startAt)}</span>
                      </span>
                    }
                    title={s.title}
                    sub={sub}
                    meta={naer ? <StatusPill tone={naer.tone}>{naer.l}</StatusPill> : undefined}
                    trailing={null}
                    last={i === timeline.length - 1}
                  />
                );
              })}
              {kommende.length > timeline.length && (
                <Link href="/portal/booking" style={{ textDecoration: "none", display: "block", marginTop: 12 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.lime }}>
                    Se alle {kommende.length} <Icon name="arrow-right" size={12} style={{ color: T.lime }} />
                  </span>
                </Link>
              )}
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <TomTilstand icon="calendar" title="Ingen kommende økter" sub="Book en time med coachen din." />
              {coach && (
                <Link href="/portal/booking" style={{ textDecoration: "none", display: "block" }}>
                  <CTAPill ghost full icon="calendar">
                    Book time
                  </CTAPill>
                </Link>
              )}
            </div>
          )}
        </Kort>
      </div>

      {/* Meldinger — primær CTA er øverst; her kun forhåndsvisning */}
      <Kort
        eyebrow="Meldinger"
        action={coach && nyeFraCoach > 0 ? <StatusPill tone="lime">{nyeFraCoach} fra coach</StatusPill> : undefined}
      >
        {coach ? (
          sisteMeldinger.length > 0 ? (
            <MeldingsTraad meldinger={sisteMeldinger} />
          ) : (
            <TomTilstand icon="message-circle" title="Ingen meldinger ennå" sub="Bruk knappen øverst for å starte samtalen." />
          )
        ) : (
          <TomTilstand icon="message-circle" title="Ingen meldinger" sub="Du får en coach tildelt før dere kan skrive sammen." />
        )}
      </Kort>
    </div>
  );
}
