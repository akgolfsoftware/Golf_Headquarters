"use client";

/**
 * AgencyOS · Live (v2) — «Mission Control», rekomponert fra
 * src/app/admin/(legacy)/agencyos/live/mission-control.tsx med v2-biblioteket
 * (src/components/v2). Fortsatt et visuelt skall med statisk seed-data
 * (src/lib/agencyos/live-data.ts) — live-integrasjoner (Gmail/Beeper/Notion/
 * Kalender) kobles senere.
 *
 * Funksjon bevart 1:1: klokke, synk-ticker, søk på tvers av kalender/e-post/
 * meldinger, prioritetsfilter på e-post, svar/les/arkiver, oppgave-toggle,
 * skriptet innkommende melding (stream-in), detalj-drawer (e-post/hendelse/
 * melding), toast-bekreftelse.
 *
 * Ingen ad-hoc UI, ingen rå hex (kun T.*). Mobil: bento stables i én kolonne.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  KpiFlis,
  StatusPill,
  Knapp,
  TomTilstand,
  Icon,
  T,
} from "@/components/v2";
import {
  ANTALL_AVTALER,
  DAGENS_TRE,
  type CalEvent,
  type Email,
  EMAILS,
  EVENTS,
  EVENTS_MORE,
  INCOMING,
  type Message,
  MESSAGES,
  MODULES,
  NOTION,
  type Priority,
  SCENE_DATE,
  type Task,
  TASKS,
} from "@/lib/agencyos/live-data";

/* ---------- prioritet ---------- */
const PRIO: Record<Priority, { label: string; color: string; icon: string }> = {
  urgent: { label: "Haster", color: T.down, icon: "flame" },
  followup: { label: "Følg opp", color: T.warn, icon: "flag" },
  open: { label: "Ubesvart", color: T.mut, icon: "circle" },
};

/* ---------- klokke / sync ---------- */
const pad = (n: number) => String(n).padStart(2, "0");
const fmtTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setNow(new Date()));
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(t);
    };
  }, []);
  return now;
}

function useSyncTicker() {
  const [since, setSince] = useState(0);
  const [syncing, setSyncing] = useState(false);
  useEffect(() => {
    const t = setInterval(() => {
      setSince((s) => {
        if (s >= 48) {
          setSyncing(true);
          setTimeout(() => setSyncing(false), 1200);
          return 0;
        }
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  return { since, syncing };
}

/* ---------- avatar ---------- */
function LiveAvatar({ initials, tone = "neutral", size = 32 }: { initials: string; tone?: "neutral" | "lime" | "urgent"; size?: number }) {
  const bg = tone === "lime" ? T.lime : tone === "urgent" ? T.forest : T.panel3;
  const fg = tone === "lime" ? T.onLime : tone === "urgent" ? T.lime : T.fg2;
  return (
    <span
      style={{
        width: size, height: size, borderRadius: 9999, background: bg, color: fg, flex: "none",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontFamily: T.disp, fontWeight: 700, fontSize: size * 0.36, lineHeight: 1,
      }}
    >
      {initials}
    </span>
  );
}

/* ---------- svarboks ---------- */
function SvarBoks({ onSend, placeholder }: { onSend: () => void; placeholder?: string }) {
  const [v, setV] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <div style={{ marginTop: 10, display: "flex", gap: 8 }} onClick={(e) => e.stopPropagation()}>
      <input
        ref={ref}
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder={placeholder || "Skriv et hurtigsvar…"}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSend();
        }}
        style={{
          height: 34, flex: 1, borderRadius: 9, border: `1px solid ${T.lime}`, background: "rgba(209,248,67,0.06)",
          padding: "0 12px", fontFamily: T.ui, fontSize: 13, color: T.fg, outline: "none",
        }}
      />
      <button
        type="button"
        onClick={onSend}
        className="v2-press v2-focus"
        style={{
          height: 34, display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 9, background: T.lime,
          padding: "0 13px", fontFamily: T.disp, fontSize: 12, fontWeight: 700, color: T.onLime, border: "none", cursor: "pointer",
        }}
      >
        <Icon name="send" size={13} /> Send
      </button>
    </div>
  );
}

/* ---------- handlingsknapp ---------- */
function ActBtn({ icon, label, onClick, primary }: { icon: string; label: string; onClick: () => void; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="v2-press v2-focus"
      style={{
        height: 28, display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 8,
        padding: "0 10px", fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
        color: primary ? T.onLime : T.fg2,
        background: primary ? T.lime : "transparent",
        border: `1px solid ${primary ? T.lime : T.borderS}`,
        cursor: "pointer",
      }}
    >
      <Icon name={icon} size={12} /> {label}
    </button>
  );
}

/* ---------- kort-header ---------- */
function KortHode({ icon, title, children }: { icon: string; title: string; children?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, paddingBottom: 12, marginBottom: 4, borderBottom: `1px solid ${T.border}` }}>
      <Icon name={icon} size={15} style={{ color: T.fg }} />
      <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: T.fg }}>{title}</span>
      {children}
    </div>
  );
}

/* ---------- drawer-state ---------- */
type Drawer = { kind: "email"; item: Email } | { kind: "event"; item: CalEvent } | { kind: "msg"; item: Message };

/* ============================================================ */

export function AgencyLiveV2({ coachFirstName = "Anders" }: { coachFirstName?: string }) {
  const now = useClock();
  const { since, syncing } = useSyncTicker();

  const [emails, setEmails] = useState<Email[]>(() => EMAILS.map((e) => ({ ...e })));
  const [messages, setMessages] = useState<Message[]>(() => MESSAGES.map((m) => ({ ...m })));
  const [tasks, setTasks] = useState<Task[]>(() => TASKS.map((t) => ({ ...t })));
  const [toast, setToast] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [pf, setPf] = useState<"alle" | Priority>("alle");
  const [reply, setReply] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<Drawer | null>(null);

  const flash = useCallback((m: string) => setToast(m), []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1900);
    return () => clearTimeout(t);
  }, [toast]);

  // skriptet innkommende melding → stream-in + varsel
  useEffect(() => {
    const t = setTimeout(() => {
      setMessages((m) => (m.some((x) => x.id === INCOMING.id) ? m : [{ ...INCOMING }, ...m]));
      flash("Ny melding · Sofie Kvam");
    }, 6500);
    return () => clearTimeout(t);
  }, [flash]);

  const readEmail = useCallback(
    (id: string, verb = "Merket som lest") => {
      setEmails((es) => es.filter((e) => e.id !== id));
      flash(verb);
    },
    [flash],
  );
  const readMessage = useCallback(
    (id: string, verb = "Merket som lest") => {
      setMessages((ms) => ms.filter((m) => m.id !== id));
      flash(verb);
    },
    [flash],
  );
  const toggleTask = useCallback(
    (id: string) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t))),
    [],
  );

  const counts = {
    avtaler: ANTALL_AVTALER,
    oppgaver: tasks.filter((t) => !t.done).length,
    ubesvarte: emails.length,
    uleste: messages.reduce((s, m) => s + (m.unread || 1), 0),
  };

  const ql = q.trim().toLowerCase();
  const match = (...s: string[]) => !ql || s.join(" ").toLowerCase().includes(ql);
  const fEmails = emails.filter((e) => (pf === "alle" || e.priority === pf) && match(e.subject, e.from, e.name, e.snippet));
  const fMessages = messages.filter((m) => match(m.name, m.source, m.snippet));
  const fEvents = EVENTS.filter((e) => match(e.title, e.who, e.source));
  const beeper = fMessages.filter((m) => m.channel === "beeper");
  const imsg = fMessages.filter((m) => m.channel === "imessage");

  return (
    <>
      {/* DEMO-banner */}
      <Kort pad="10px 16px" style={{ borderColor: `color-mix(in srgb, ${T.warn} 35%, ${T.border})`, background: `color-mix(in srgb, ${T.warn} 8%, ${T.panel})` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="alert-triangle" size={15} style={{ color: T.warn, flex: "none" }} />
          <span style={{ fontFamily: T.ui, fontSize: 12, color: T.warn, lineHeight: 1.5 }}>
            DEMO — visuelt skall, ikke ekte sanntidsdata. Tallene og hendelsene er statiske eksempler; kobles til ekte kilder (Gmail · Beeper · Notion · Kalender) senere.
          </span>
        </div>
      </Kort>

      {/* Hode */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div>
          <Caps>{SCENE_DATE} · OPS-OVERSIKT</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em={`${coachFirstName}.`}>God morgen,</Tittel>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <StatusPill>LIVE · alle kilder tilkoblet</StatusPill>
          <div style={{ textAlign: "right", lineHeight: 1.1 }}>
            <div style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: syncing ? T.lime : T.mut, display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end" }}>
              <Icon name="refresh-cw" size={11} className={syncing ? "animate-spin" : undefined} />
              {syncing ? "Synker…" : `for ${since} s siden`}
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 16, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>
              {now ? fmtTime(now) : "––:––:––"}
            </div>
          </div>
        </div>
      </div>

      {/* Søk */}
      <Kort pad="10px 16px">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="search" size={15} style={{ color: T.mut, flex: "none" }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Søk på tvers av Gmail, Notion, kalender, meldinger…"
            style={{ flex: 1, border: "none", background: "transparent", fontFamily: T.ui, fontSize: 13, color: T.fg, outline: "none" }}
          />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label="Tøm søk" className="v2-focus" style={{ background: "none", border: "none", cursor: "pointer", display: "inline-flex" }}>
              <Icon name="x" size={13} style={{ color: T.mut }} />
            </button>
          )}
        </div>
      </Kort>

      {/* KPI-strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: T.gap }}>
        <KpiFlis label="Avtaler i dag" value={counts.avtaler} />
        <KpiFlis label="Aktive oppgaver" value={counts.oppgaver} />
        <KpiFlis label="Ubesvarte e-poster" value={counts.ubesvarte} varsle />
        <KpiFlis label="Uleste meldinger" value={counts.uleste} tint />
      </div>

      {/* Modul-launcher */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7" style={{ gap: 8 }}>
        {MODULES.map((m) => {
          const inner = (
            <>
              <span
                style={{
                  width: 34, height: 34, borderRadius: 10, display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: m.app ? T.forest : T.panel2, color: m.app ? T.lime : T.mut,
                }}
              >
                <Icon name={m.icon} size={16} />
              </span>
              <span style={{ fontFamily: T.disp, fontSize: 13, fontWeight: 700, color: T.fg, letterSpacing: "-0.01em" }}>{m.label}</span>
              {m.href && <Icon name="arrow-up-right" size={12} style={{ position: "absolute", right: 12, top: 12, color: T.mut }} />}
            </>
          );
          const style: React.CSSProperties = {
            position: "relative", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12,
            borderRadius: 14, border: `1px solid ${T.border}`, background: T.panel, padding: 12, textDecoration: "none",
            color: T.fg, cursor: m.href ? "pointer" : "not-allowed", opacity: m.href ? 1 : 0.5,
          };
          return m.href ? (
            <Link key={m.key} href={m.href} className="v2-kort-h" style={style}>
              {inner}
            </Link>
          ) : (
            <button key={m.key} type="button" disabled title="Kommer" style={{ ...style, textAlign: "left", font: "inherit" }}>
              {inner}
            </button>
          );
        })}
      </div>

      {/* Dagens tre */}
      <Kort tint style={{ padding: "18px 20px" }}>
        <Caps color={T.lime}>DAGENS TRE · IKKE-FORHANDLINGSBART</Caps>
        <div style={{ marginTop: 13, display: "flex", flexWrap: "wrap", gap: 10 }}>
          {DAGENS_TRE.map((t) => (
            <span
              key={t.n}
              style={{
                display: "inline-flex", alignItems: "center", gap: 9, borderRadius: 9999,
                border: `1px solid color-mix(in srgb, ${T.lime} 45%, transparent)`, background: "rgba(0,0,0,0.2)",
                padding: "10px 16px 10px 12px", fontFamily: T.disp, fontSize: 15, fontWeight: 700, color: T.fg,
              }}
            >
              <b style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 800, color: T.lime }}>{t.n}</b>
              <Icon name={t.icon} size={14} />
              {t.label}
            </span>
          ))}
        </div>
      </Kort>

      {/* BENTO */}
      <div className="flex flex-col lg:flex-row" style={{ gap: T.gap, alignItems: "flex-start" }}>
        {/* venstre kolonne */}
        <div className="flex w-full flex-col lg:flex-[1.3]" style={{ gap: T.gap, minWidth: 0 }}>
          {/* Kalender */}
          <Kort>
            <KortHode icon="calendar" title="Dagens kalender">
              <span style={{ marginLeft: 4, fontFamily: T.mono, fontSize: 10, fontWeight: 800, color: T.mut }}>{counts.avtaler} AVTALER</span>
              <span style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.mut }}>Google Kalender</span>
            </KortHode>
            <div>
              {fEvents.map((ev, i) => (
                <Rad
                  key={ev.id}
                  last={i === fEvents.length - 1}
                  onClick={() => setDrawer({ kind: "event", item: ev })}
                  leading={
                    <span style={{ width: 56, flex: "none", fontFamily: T.mono, fontSize: 12, fontWeight: 800, color: T.fg, fontVariantNumeric: "tabular-nums" }}>
                      {ev.allday ? "Hele dagen" : ev.time}
                    </span>
                  }
                  title={
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {ev.title}
                      {ev.next && <StatusPill>Neste</StatusPill>}
                    </span>
                  }
                  sub={ev.loc ? `${ev.who} · ${ev.loc}` : ev.who}
                />
              ))}
              {!ql && (
                <Link
                  href="/admin/kalender"
                  className="v2-press v2-focus"
                  style={{
                    marginTop: 6, display: "flex", width: "100%", alignItems: "center", justifyContent: "center", gap: 6,
                    borderRadius: 10, border: `1px dashed ${T.border}`, padding: "9px 0", fontFamily: T.mono, fontSize: 10,
                    fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.mut, textDecoration: "none",
                  }}
                >
                  <Icon name="chevron-down" size={13} /> +{EVENTS_MORE} flere avtaler i dag
                </Link>
              )}
            </div>
          </Kort>

          {/* Gmail */}
          <Kort>
            <KortHode icon="mail" title="Gmail">
              <span style={{ marginLeft: 4, fontFamily: T.mono, fontSize: 10, fontWeight: 800, color: T.down }}>{emails.length} UBESVART</span>
            </KortHode>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              {(
                [
                  ["alle", "Alle"],
                  ["urgent", "Haster"],
                  ["followup", "Følg opp"],
                  ["open", "Ubesvart"],
                ] as const
              ).map(([k, l]) => {
                const on = pf === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setPf(k)}
                    className="v2-press v2-focus"
                    style={{
                      height: 28, borderRadius: 9999, padding: "0 12px", fontFamily: T.mono, fontSize: 10, fontWeight: 700,
                      textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer",
                      color: on ? T.onLime : T.fg2, background: on ? T.lime : "transparent", border: `1px solid ${on ? T.lime : T.border}`,
                    }}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
            {fEmails.length === 0 ? (
              <TomTilstand icon="check-check" title="Innboks tom" sub="Godt jobba." />
            ) : (
              <div>
                {fEmails.map((e, i) => {
                  const Pri = PRIO[e.priority];
                  return (
                    <div
                      key={e.id}
                      onClick={() => setDrawer({ kind: "email", item: e })}
                      className="v2-row-h"
                      style={{ display: "flex", gap: 11, borderRadius: 10, padding: "12px 8px", cursor: "pointer", borderBottom: i < fEmails.length - 1 ? `1px solid ${T.border}` : "none" }}
                    >
                      <LiveAvatar initials={e.initials} tone={e.priority === "urgent" ? "urgent" : "neutral"} size={34} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                          <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 700, color: T.fg }}>{e.name}</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, borderRadius: 9999, border: `1px solid ${Pri.color}`, padding: "2px 7px 2px 6px", fontFamily: T.mono, fontSize: 8.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: Pri.color }}>
                            <Icon name={Pri.icon} size={10} style={{ color: Pri.color }} />
                            {Pri.label}
                          </span>
                          <span style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 10, color: T.mut }}>{e.when}</span>
                        </div>
                        <div style={{ marginTop: 3, fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>{e.subject}</div>
                        <div style={{ marginTop: 3, fontFamily: T.ui, fontSize: 12, lineHeight: 1.45, color: T.mut, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{e.snippet}</div>
                        {reply === e.id ? (
                          <SvarBoks
                            onSend={() => {
                              setReply(null);
                              readEmail(e.id, `Svar sendt · ${e.name}`);
                            }}
                          />
                        ) : (
                          <div style={{ marginTop: 10, display: "flex", gap: 6 }} onClick={(ev) => ev.stopPropagation()}>
                            <ActBtn primary icon="reply" label="Svar" onClick={() => setReply(e.id)} />
                            <ActBtn icon="check" label="Les" onClick={() => readEmail(e.id)} />
                            <ActBtn icon="archive" label="Arkiver" onClick={() => readEmail(e.id, "Arkivert")} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Kort>

          {/* Oppgaver */}
          <Kort>
            <KortHode icon="check-check" title="Oppgaver">
              <span style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.mut }}>Notion ↗</span>
            </KortHode>
            <Caps size={9} style={{ margin: "4px 0 8px" }}>FORFALLER I DAG</Caps>
            <div>
              {tasks.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTask(t.id)}
                  className="v2-row-h v2-focus"
                  style={{ display: "flex", width: "100%", gap: 11, borderRadius: 10, padding: "11px 8px", textAlign: "left", cursor: "pointer", border: "none", background: "none", borderBottom: i < tasks.length - 1 ? `1px solid ${T.border}` : "none" }}
                >
                  <span
                    style={{
                      marginTop: 1, width: 18, height: 18, borderRadius: 6, flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center",
                      border: `1px solid ${t.done ? T.lime : T.border}`, background: t.done ? T.lime : "transparent", color: T.onLime,
                    }}
                  >
                    {t.done && <Icon name="check" size={12} strokeWidth={2.4} />}
                  </span>
                  <span>
                    <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: t.done ? T.mut : T.fg, textDecoration: t.done ? "line-through" : "none" }}>{t.title}</span>
                    <span style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8, fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.mut }}>
                      <span style={{ borderRadius: 5, padding: "2px 6px", fontSize: 8.5, fontWeight: 800, letterSpacing: "0.04em", color: t.prio === "P1" ? T.down : T.warn, background: `color-mix(in srgb, ${t.prio === "P1" ? T.down : T.warn} 14%, transparent)` }}>{t.prio}</span>
                      <span style={{ borderRadius: 5, background: T.panel3, padding: "2px 7px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{t.tag}</span>
                      {t.due}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </Kort>
        </div>

        {/* høyre kolonne */}
        <div className="flex w-full flex-col lg:flex-1" style={{ gap: T.gap, minWidth: 0 }}>
          {/* Meldinger */}
          <Kort>
            <KortHode icon="message-square" title="Uleste meldinger">
              <span style={{ marginLeft: 4, display: "inline-flex", height: 22, minWidth: 22, alignItems: "center", justifyContent: "center", borderRadius: 9999, background: T.lime, padding: "0 7px", fontFamily: T.mono, fontSize: 10, fontWeight: 800, color: T.onLime }}>
                {counts.uleste}
              </span>
            </KortHode>
            <Caps size={9} style={{ margin: "4px 0 8px" }}>BEEPER · {beeper.reduce((s, m) => s + m.unread, 0)} ULESTE</Caps>
            <div>
              {beeper.map((m, i) => (
                <MsgRad key={m.id} m={m} last={i === beeper.length - 1} reply={reply} setReply={setReply} onOpen={() => setDrawer({ kind: "msg", item: m })} onRead={(verb) => readMessage(m.id, verb)} />
              ))}
            </div>
            <Caps size={9} style={{ margin: "12px 0 8px", paddingTop: 12, borderTop: `1px solid ${T.border}` }}>IMESSAGE · {imsg.reduce((s, m) => s + m.unread, 0)} ULESTE</Caps>
            <div>
              {imsg.map((m, i) => (
                <MsgRad key={m.id} m={m} last={i === imsg.length - 1} reply={reply} setReply={setReply} onOpen={() => setDrawer({ kind: "msg", item: m })} onRead={(verb) => readMessage(m.id, verb)} />
              ))}
            </div>
          </Kort>

          {/* Notion-prosjekt */}
          <Kort>
            <KortHode icon="book-open" title="Notion-prosjekt">
              <span style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.mut }}>Notion ↗</span>
            </KortHode>
            <div style={{ fontFamily: T.disp, fontSize: 16, fontWeight: 700, color: T.fg, letterSpacing: "-0.015em" }}>{NOTION.project}</div>
            <div style={{ margin: "8px 0 14px", display: "flex", alignItems: "center", gap: 12, fontFamily: T.mono, fontSize: 10, color: T.mut }}>
              <span style={{ fontWeight: 800, textTransform: "uppercase", color: T.lime }}>{NOTION.status}</span>
              <span>{NOTION.sprint}</span>
            </div>
            <div style={{ height: 8, borderRadius: 9999, background: T.track, overflow: "hidden" }}>
              <span style={{ display: "block", height: "100%", borderRadius: 9999, width: `${NOTION.progress}%`, background: `linear-gradient(90deg, ${T.forest}, ${T.lime})` }} />
            </div>
            <div style={{ marginTop: 7, fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.mut }}>{NOTION.progress}% fullført</div>
            <div className="grid grid-cols-2 sm:grid-cols-5" style={{ gap: 8, marginTop: 16 }}>
              {NOTION.columns.map((c) => (
                <div key={c.name} style={{ borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: "10px 6px", textAlign: "center" }}>
                  <b style={{ display: "block", fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: T.fg }}>{c.count}</b>
                  <span style={{ marginTop: 4, display: "block", fontFamily: T.mono, fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: T.mut }}>{c.name}</span>
                </div>
              ))}
            </div>
          </Kort>
        </div>
      </div>

      {/* drawer */}
      {drawer && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div onClick={() => setDrawer(null)} style={{ position: "absolute", inset: 0, background: "rgba(6,7,6,0.62)", backdropFilter: "blur(2px)" }} />
          <DrawerBody drawer={drawer} onClose={() => setDrawer(null)} onReadEmail={readEmail} onReadMessage={readMessage} />
        </div>
      )}

      {/* toast */}
      {toast && (
        <div
          className="fixed z-[70]"
          style={{
            right: 18, top: 18, display: "flex", alignItems: "center", gap: 8, borderRadius: 12, background: T.lime,
            padding: "12px 16px", fontFamily: T.disp, fontSize: 13, fontWeight: 700, color: T.onLime, boxShadow: "0 12px 28px rgba(0,0,0,0.35)",
          }}
        >
          <Icon name="check" size={15} strokeWidth={2.4} /> {toast}
        </div>
      )}
    </>
  );
}

/* ---------- meldings-rad ---------- */
function MsgRad({
  m,
  last,
  reply,
  setReply,
  onOpen,
  onRead,
}: {
  m: Message;
  last: boolean;
  reply: string | null;
  setReply: (id: string | null) => void;
  onOpen: () => void;
  onRead: (verb?: string) => void;
}) {
  return (
    <div
      onClick={onOpen}
      className="v2-row-h"
      style={{ display: "flex", gap: 11, borderRadius: 10, padding: "10px 8px", cursor: "pointer", borderBottom: last ? "none" : `1px solid ${T.border}` }}
    >
      <LiveAvatar initials={m.initials} tone={m.fresh ? "lime" : "neutral"} size={32} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 7 }}>
          <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 700, color: T.fg }}>{m.name}</span>
          {m.unread > 1 && (
            <span style={{ display: "inline-flex", height: 17, minWidth: 17, alignItems: "center", justifyContent: "center", borderRadius: 9999, background: T.down, padding: "0 5px", fontFamily: T.mono, fontSize: 9, fontWeight: 800, color: T.fg }}>
              {m.unread}
            </span>
          )}
          <span style={{ borderRadius: 5, background: T.panel3, padding: "2px 7px", fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: T.mut }}>{m.source}</span>
          {m.fresh && <span style={{ width: 7, height: 7, borderRadius: 9999, background: T.lime }} />}
          <span style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 10, color: T.mut }}>{m.when}</span>
        </div>
        <div style={{ marginTop: 3, fontFamily: T.ui, fontSize: 12, lineHeight: 1.45, color: T.mut, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.snippet}</div>
        {reply === m.id ? (
          <SvarBoks
            onSend={() => {
              setReply(null);
              onRead(`Svar sendt · ${m.name}`);
            }}
          />
        ) : (
          <div style={{ marginTop: 8, display: "flex", gap: 6 }} onClick={(e) => e.stopPropagation()}>
            <ActBtn primary icon="reply" label="Svar" onClick={() => setReply(m.id)} />
            <ActBtn icon="check" label="Les" onClick={() => onRead()} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- drawer-innhold ---------- */
function DrawerBody({
  drawer,
  onClose,
  onReadEmail,
  onReadMessage,
}: {
  drawer: Drawer;
  onClose: () => void;
  onReadEmail: (id: string, verb?: string) => void;
  onReadMessage: (id: string, verb?: string) => void;
}) {
  const { kind, item } = drawer;
  const title = kind === "email" ? item.subject : kind === "event" ? item.title : item.name;
  const eyebrow = kind === "email" ? "GMAIL" : kind === "event" ? "GOOGLE KALENDER" : (item.source || "MELDING").toUpperCase();
  const loc = kind === "event" ? item.loc : undefined;
  const body = "snippet" in item ? item.snippet : loc || "Ingen forhåndsvisning.";

  return (
    <div
      style={{
        position: "relative", width: 420, maxWidth: "88%", height: "100%", display: "flex", flexDirection: "column",
        background: T.panel, borderLeft: `1px solid ${T.borderS}`, boxShadow: "-20px 0 60px rgba(0,0,0,0.4)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${T.border}` }}>
        <Caps size={9} color={T.lime}>{eyebrow}</Caps>
        <button type="button" onClick={onClose} aria-label="Lukk" className="v2-focus" style={{ width: 34, height: 34, borderRadius: 9, border: `1px solid ${T.border}`, background: "none", color: T.fg, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="x" size={16} />
        </button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "22px 20px" }}>
        <h3 style={{ margin: 0, fontFamily: T.disp, fontSize: 19, fontWeight: 700, lineHeight: 1.25, letterSpacing: "-0.015em", color: T.fg }}>{title}</h3>
        {kind === "email" && (
          <div style={{ marginTop: 8, fontFamily: T.mono, fontSize: 10, color: T.mut }}>{item.name} · {item.from} · {item.when}</div>
        )}
        {kind === "event" && (
          <div style={{ marginTop: 8, fontFamily: T.mono, fontSize: 10, color: T.mut }}>{item.allday ? "Hele dagen" : item.time} · {item.who}</div>
        )}
        {kind === "msg" && (
          <div style={{ marginTop: 8, fontFamily: T.mono, fontSize: 10, color: T.mut }}>{item.source} · {item.when} · {item.unread} uleste</div>
        )}
        <p style={{ marginTop: 18, fontFamily: T.ui, fontSize: 14, lineHeight: 1.6, color: T.fg2 }}>{body}</p>
        {loc && (
          <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 7, fontFamily: T.mono, fontSize: 11, color: T.mut }}>
            <Icon name="map-pin" size={14} /> {loc}
          </div>
        )}
        {(kind === "email" || kind === "msg") && (
          <SvarBoks
            placeholder={`Svar til ${item.name}…`}
            onSend={() => {
              if (kind === "email") onReadEmail(item.id, "Svar sendt");
              else onReadMessage(item.id, "Svar sendt");
              onClose();
            }}
          />
        )}
      </div>
      <div style={{ display: "flex", gap: 10, padding: "16px 20px", borderTop: `1px solid ${T.border}` }}>
        {(kind === "email" || kind === "msg") && (
          <Knapp
            icon="check"
            onClick={() => {
              if (kind === "email") onReadEmail(item.id);
              else onReadMessage(item.id);
              onClose();
            }}
          >
            Merk som lest
          </Knapp>
        )}
        <Knapp ghost onClick={onClose}>Lukk</Knapp>
      </div>
    </div>
  );
}
