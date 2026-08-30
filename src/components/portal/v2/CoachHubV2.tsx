"use client";
import { TL } from "@/lib/v2/train-lock";
/**
 * PlayerHQ Coach-hub — Train-lock (status + én primær «skriv/book»).
 * Fasit: designsystem/train-lock/ME-04 Coach-hub.dc.html
 * Coachkort, kommende økter, meldingstråd. Kun TL. Tom = grønn vei.
 */

import Link from "next/link";
import { Caps, Kort, Rad, StatusPill, AvatarFoto, TomTilstand, Icon, type StatusTone } from "@/components/v2";
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

/** Nærhets-status for en kommende økt (i dag / snart), ellers ingen pill. */
function naerhet(d: Date): { l: string; tone: StatusTone } | null {
  const naa = new Date();
  if (d.toDateString() === naa.toDateString()) return { l: "I dag", tone: "lime" };
  const dager = Math.ceil((d.getTime() - naa.getTime()) / 86_400_000);
  if (dager <= 7) return { l: "Snart", tone: "info" };
  return null;
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function CoachHubV2({ data }: { data: CoachHubData }) {
  const { coach, fokus, meldinger, kommende } = data;

  const nyeFraCoach = meldinger.filter((m) => m.role === "coach").length;
  const timeline = kommende.slice(0, 4);

  const sisteMeldingSnippet = meldinger.length > 0 ? meldinger[meldinger.length - 1] : null;
  const meldingerSub = sisteMeldingSnippet
    ? `${sisteMeldingSnippet.role === "coach" ? coach?.name.split(" ")[0] ?? "Coach" : "Deg"} · «${sisteMeldingSnippet.body.slice(0, 40)}${sisteMeldingSnippet.body.length > 40 ? "…" : ""}»${nyeFraCoach > 0 ? ` · ${nyeFraCoach} nye` : ""}`
    : "Send den første meldingen til coachen din";

  return (
    <div data-paper-wave-g="coachhub" data-paper-slug="playerhq-coach-hub" data-paper-portal-coach-hub style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, margin: "0 auto", width: "100%" }}>
      {/* Hode — tittel + undertekst (fasit: «Fokus, meldinger og timene dine») */}
      <div>
        <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>Coach</h1>
        <span style={{ display: "block", fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute, marginTop: 2 }}>Fokus, meldinger og timene dine</span>
      </div>

      {/* Fasit (fase2/playerhq/playerhq-coach-hub.html + w3-base.css §@media min-width:1024px:
          `.kropp > * { max-width:720px; margin-inline:auto }`) er ÉN stablet kolonne på desktop —
          coachtopp → Fokus nå → Meldinger → Timene dine → Fra coach. Ingen sidestilt kolonne. */}
      {/* Coachtopp — avatar + navn, ingen kortramme (matcher fasit .coachtopp) */}
      <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
        <AvatarFoto src={coach?.avatarUrl ?? null} navn={coach?.name ?? "?"} size={52} ring />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 17, color: TL.text, lineHeight: 1.2 }}>{coach?.name ?? "Ingen coach ennå"}</div>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>
            {coach ? "Hovedcoach" : "Venter på tildeling"}
          </span>
        </div>
      </div>

      {/* Fokus nå — tint-kort, egen flate under coachtopp (fasit .kort.tint) */}
      {coach && (
        <Kort tint eyebrow="Fokus nå">
          {fokus ? (
            <>
              {fokus.title && <div style={{ fontFamily: TL.font.sans, fontWeight: 600, fontSize: 14.5, color: TL.text, marginBottom: 6 }}>{fokus.title}</div>}
              <p style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, lineHeight: 1.6, margin: 0 }}>
                {fokus.content.slice(0, 200)}
                {fokus.content.length > 200 ? "…" : ""}
              </p>
            </>
          ) : (
            <p style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, lineHeight: 1.6, margin: 0 }}>
              Ingen fokusnotat fra coach denne uka.
            </p>
          )}
        </Kort>
      )}

      {/* Meldinger — én rad, fasit har ikke forhåndsvisning av bobler på hub-nivå */}
      <Kort pad="4px 6px">
        <Link href="/portal/coach/melding" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
          <Rad
            last
            leading={<Icon name="message-circle" size={16} style={{ color: TL.mute }} />}
            title="Meldinger"
            sub={meldingerSub}
            meta={nyeFraCoach > 0 ? <StatusPill tone="lime">{nyeFraCoach}</StatusPill> : undefined}
          />
        </Link>
      </Kort>

      {!coach && (
        <Link href="/portal/booking" style={{ textDecoration: "none", display: "block" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 56, width: "100%", padding: "10px 16px",
            borderRadius: 12, background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600,
          }}>Book en time</span>
        </Link>
      )}

      {/* Timene dine */}
      <Kort eyebrow="Timene dine" action={kommende.length > 0 ? <Caps size={9}>{kommende.length} bookinger</Caps> : undefined}>
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
                      <span style={{ fontFamily: TL.font.mono, fontSize: 12, fontWeight: 700, color: naer?.tone === "lime" ? TL.fill : TL.text, fontVariantNumeric: "tabular-nums" }}>{klokke(s.startAt)}</span>
                      <span style={{ fontFamily: TL.font.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: TL.mute }}>{datoKort(s.startAt)}</span>
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
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: TL.fill }}>
                  Se alle {kommende.length} <Icon name="arrow-right" size={12} style={{ color: TL.fill }} />
                </span>
              </Link>
            )}
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <TomTilstand icon="calendar" title="Ingen kommende timer" sub="Book en time med coachen din." />
            {coach && (
              <Link href="/portal/booking" style={{ textDecoration: "none", display: "block" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 56, width: "100%", padding: "10px 16px",
                  borderRadius: 12, background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600,
                }}>Book time</span>
              </Link>
            )}
          </div>
        )}
      </Kort>

      {/* Fra coach — snarveier til videoer/øvelser/spørsmål (fasit «Fra Anders») */}
      {coach && (
        <Kort eyebrow={`Fra ${coach.name.split(" ")[0]}`} pad="4px 6px">
          <Link href="/portal/coach/videoer" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
            <Rad leading={<Icon name="video" size={16} style={{ color: TL.mute }} />} title="Videoer" sub="Klipp coachen har delt med deg" />
          </Link>
          <Link href="/portal/coach/ovelser" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
            <Rad leading={<Icon name="dumbbell" size={16} style={{ color: TL.mute }} />} title="Øvelser til deg" sub="Denne periodens øvelser" />
          </Link>
          <Link href="/portal/coach/sporsmal" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
            <Rad last leading={<Icon name="help-circle" size={16} style={{ color: TL.mute }} />} title="Spørsmål" sub="Still et spørsmål mellom timene" />
          </Link>
        </Kort>
      )}
    </div>
  );
}
