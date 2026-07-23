"use client";

// src/components/meg/dispatch-ui.tsx — delte klient-komponenter for
// /meg/dispatch og /meg/morgenbrief. MeldingRad er en ny komponent (SLA-
// meldingsrad m/ svarutkast) som ikke fantes i v2-core — bygget av v2-core-
// primitiver (Rad-idiomet, StatusPill, CTAPill), godkjent designmønster fra
// Claude Design-prosjektet (ui_kits/v2/agencyos-meg-ui.jsx). Lime har ÉN
// jobb på disse skjermene: hero-tallet (TallHero accent) — NESTE-merket og
// "svar kopiert" er derfor bevisst nøytrale/grønne, aldri lime.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { StatusPill, CTAPill, Kort } from "@/components/v2/core";
import { Icon } from "@/components/v2/icon";
import { T } from "@/lib/v2/tokens";
import type { Kilde, Melding } from "@/lib/meg/dispatch-data";

type Seg = { t: string } | { b: string };

const KANAL_IKON: Record<Melding["kanal"], string> = {
  gmail: "mail",
  imessage: "message-circle",
  beeper: "message-square",
};
const KANAL_LABEL: Record<Melding["kanal"], string> = {
  gmail: "E-post",
  imessage: "iMessage",
  beeper: "Beeper",
};
export function kanalLabel(m: Melding): string {
  return m.kanal === "beeper" && m.nett ? `${m.nett} · Beeper` : KANAL_LABEL[m.kanal];
}

const TIER_TONE: Record<Melding["tier"], "down" | "warn" | "up"> = { brudd: "down", haster: "warn", ok: "up" };
const TIER_LABEL: Record<Melding["tier"], string> = { brudd: "BRUDD", haster: "HASTER", ok: "OK" };
export function SlaPill({ tier }: { tier: Melding["tier"] }) {
  return <StatusPill tone={TIER_TONE[tier]}>{TIER_LABEL[tier]}</StatusPill>;
}

/* NESTE-etikett — bevisst NØYTRAL (ikke lime). Skjermens hero-tall (TallHero
   accent) eier skjermens ENE lime-moment. */
function NesteChip() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", height: 18, padding: "0 7px", borderRadius: 9999, background: T.panel3, color: T.fg2, border: `1px solid ${T.borderS}`, fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.08em", flex: "none" }}>
      NESTE
    </span>
  );
}

export function KildePill({ kilde }: { kilde: Kilde }) {
  const ok = kilde.status === "ok";
  const lbl = kilde.status === "nede" ? "NEDE" : kilde.status === "av" ? "IKKE TILKOBLET" : null;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 22, padding: "0 9px", borderRadius: 9999, background: T.panel2, border: `1px solid ${T.border}`, flex: "none" }}>
      <span style={{ width: 5, height: 5, borderRadius: 9999, background: ok ? T.up : T.mut, flex: "none" }} />
      <span style={{ fontFamily: T.mono, fontSize: 8.5, color: ok ? T.fg2 : T.mut, textTransform: "uppercase", letterSpacing: "0.07em" }}>
        {kilde.navn}{lbl ? ` · ${lbl}` : ""}
      </span>
    </span>
  );
}

export function VaktStripe({ vakt, kilder, notis, mobile }: { vakt: { sist: string; neste: string }; kilder: Kilde[]; notis: string | null; mobile?: boolean }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "9px 0", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
        <Icon name="refresh-cw" size={12} style={{ color: T.mut }} />
        <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut, textTransform: "uppercase", letterSpacing: "0.07em" }}>
          Sist sjekket {vakt.sist} · Neste {vakt.neste}
        </span>
        <span style={{ flex: 1, minWidth: 8 }} />
        {kilder.map((k) => <KildePill key={k.id} kilde={k} />)}
      </div>
      {notis && (
        <div style={{ display: "flex", gap: 7, alignItems: "flex-start", padding: "8px 2px 0" }}>
          <Icon name="info" size={12} style={{ color: T.mut, flex: "none", marginTop: 1 }} />
          <span style={{ fontFamily: T.ui, fontSize: mobile ? 12.5 : 12, color: T.fg2, lineHeight: 1.5 }}>{notis}</span>
        </div>
      )}
    </div>
  );
}

export function SegTekst({ seg, strongColor = T.fg }: { seg: Seg[]; strongColor?: string }) {
  return (
    <>
      {seg.map((s, i) =>
        "b" in s
          ? <strong key={i} style={{ fontWeight: 650, color: strongColor, fontVariantNumeric: "tabular-nums" }}>{s.b}</strong>
          : <span key={i}>{s.t}</span>
      )}
    </>
  );
}

async function kopierTekst(t: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(t);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = t;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

function utkastTekst(m: Melding): string {
  return m.utkast.map((s) => ("b" in s ? s.b : s.t)).join("");
}

export function MeldingRad({ m, vakt, neste, mobile, onKopiert, onHandtert }: { m: Melding; vakt: { sist: string }; neste?: boolean; mobile?: boolean; onKopiert?: (id: string) => void; onHandtert?: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [kopiert, setKopiert] = useState(false);
  const [, setToast] = useMegToastCtx();
  const chip = mobile ? 34 : 30;

  const kopier = async () => {
    const ok = await kopierTekst(utkastTekst(m));
    setToast(ok ? `Svar kopiert — lim inn i ${kanalLabel(m)}.` : "Kunne ikke kopiere automatisk — marker teksten manuelt.");
    if (ok) {
      setKopiert(true);
      onKopiert?.(m.id);
    }
  };

  return (
    <div style={{ borderBottom: `1px solid ${T.border}` }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{ appearance: "none", display: "flex", gap: 11, width: "100%", textAlign: "left", alignItems: "flex-start", padding: mobile ? "13px 2px" : "11px 2px", border: "none", background: "transparent", cursor: "pointer", minHeight: 44 }}
      >
        <span style={{ width: chip, height: chip, flex: "none", borderRadius: 9999, background: T.panel3, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name={KANAL_IKON[m.kanal]} size={chip * 0.44} style={{ color: T.fg2 }} />
        </span>
        <span style={{ flex: 1, minWidth: 0, display: "block" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontFamily: T.ui, fontSize: mobile ? 15 : 13.5, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.navn}</span>
            {neste && <NesteChip />}
            <span style={{ flex: 1 }} />
            <span style={{ fontFamily: T.mono, fontSize: mobile ? 10 : 9.5, color: T.mut }}>{m.alder} siden</span>
          </span>
          <span style={{ display: "block", fontFamily: T.ui, fontSize: mobile ? 13 : 12, color: T.fg2, lineHeight: 1.5, marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {m.emne ? `${m.emne} — ` : ""}{m.siste}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <SlaPill tier={m.tier} />
            <span style={{ fontFamily: T.mono, fontSize: 8.5, color: T.mut, textTransform: "uppercase", letterSpacing: "0.06em" }}>{kanalLabel(m)}</span>
            {kopiert && <StatusPill tone="up">SVAR KOPIERT</StatusPill>}
          </span>
        </span>
        <Icon name={open ? "chevron-up" : "chevron-down"} size={14} style={{ color: T.mut, flex: "none", marginTop: 3 }} />
      </button>
      {open && (
        <div style={{ padding: mobile ? "0 2px 14px" : "0 2px 13px" }}>
          <span style={{ display: "block", fontFamily: T.mono, fontSize: 8.5, color: T.mut, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Mottatt {m.mottatt} · {kanalLabel(m)}
          </span>
          <div style={{ marginTop: 9, padding: mobile ? 13 : 12, borderRadius: 12, background: T.panel2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
              <Icon name="sparkles" size={11} style={{ color: T.mut }} />
              <span style={{ fontFamily: T.mono, fontSize: 8, color: T.mut, textTransform: "uppercase", letterSpacing: "0.09em" }}>Svarutkast · vakt {vakt.sist}</span>
            </div>
            <div style={{ fontFamily: T.ui, fontSize: mobile ? 14 : 13, color: T.fg2, lineHeight: 1.55 }}>
              <SegTekst seg={m.utkast} />
            </div>
          </div>
          {/* Kopier svar bevisst ghost, ikke lime — lime er reservert til hero-tallet på skjermen */}
          <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", gap: 8, marginTop: 11 }}>
            <CTAPill icon="copy" ghost full={mobile} onClick={kopier}>Kopier svar</CTAPill>
            {m.gmailUtkast && (
              <CTAPill icon="external-link" ghost full={mobile} onClick={() => setToast(`Åpne Gmail og finn utkastet til ${m.navn}.`)}>
                Åpne i Gmail
              </CTAPill>
            )}
            {onHandtert && (
              <CTAPill icon="check" ghost full={mobile} onClick={() => { onHandtert(m.id); setToast(`${m.navn} markert som håndtert.`); }}>
                Marker håndtert
              </CTAPill>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function KanVente({ items, mobile }: { items: { id: string; navn: string; kanal: Melding["kanal"]; siste: string; alder: string }[]; mobile?: boolean }) {
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;
  return (
    <Kort pad="0">
      <button onClick={() => setOpen((v) => !v)} aria-expanded={open} style={{ appearance: "none", display: "flex", alignItems: "center", gap: 9, width: "100%", minHeight: 46, padding: "0 16px", border: "none", background: "transparent", cursor: "pointer", textAlign: "left" }}>
        <Icon name="archive" size={13} style={{ color: T.mut }} />
        <span style={{ fontFamily: T.ui, fontSize: mobile ? 13.5 : 12.5, fontWeight: 600, color: T.fg2 }}>Kan vente</span>
        <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut, background: T.panel3, borderRadius: 9999, padding: "2px 7px" }}>{items.length}</span>
        <span style={{ flex: 1 }} />
        <Icon name={open ? "chevron-up" : "chevron-down"} size={14} style={{ color: T.mut }} />
      </button>
      {open && items.map((m) => (
        <div key={m.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "9px 16px", borderTop: `1px solid ${T.border}` }}>
          <Icon name={KANAL_IKON[m.kanal]} size={12} style={{ color: T.mut, flex: "none" }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: T.ui, fontSize: mobile ? 13 : 12, fontWeight: 500, color: T.fg2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.navn}</div>
            <div style={{ fontFamily: T.ui, fontSize: mobile ? 12 : 11, color: T.mut, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.siste}</div>
          </div>
          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut }}>{m.alder}</span>
        </div>
      ))}
    </Kort>
  );
}

/* ── Toast (kopiert-bekreftelse) — enkel context uten ekstern avhengighet ── */
import { createContext, useContext } from "react";
const ToastCtx = createContext<[string | null, (msg: string) => void]>([null, () => {}]);
function useMegToastCtx() {
  return useContext(ToastCtx);
}

export function MegToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const ref = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const si = (t: string) => {
    setMsg(t);
    clearTimeout(ref.current);
    ref.current = setTimeout(() => setMsg(null), 3200);
  };
  useEffect(() => () => clearTimeout(ref.current), []);
  return (
    <ToastCtx.Provider value={[msg, si]}>
      {children}
      {msg && (
        <div role="status" style={{ position: "absolute", left: 0, right: 0, bottom: 18, display: "flex", justifyContent: "center", pointerEvents: "none", zIndex: 40 }}>
          <span style={{ maxWidth: "88%", padding: "10px 15px", borderRadius: 12, background: T.panel2, border: `1px solid ${T.borderS}`, boxShadow: "0 12px 32px rgba(0,0,0,.4)", fontFamily: T.ui, fontSize: 13, color: T.fg, lineHeight: 1.4 }}>{msg}</span>
        </div>
      )}
    </ToastCtx.Provider>
  );
}
