"use client";

/**
 * Delte v2-byggeklosser for turnerings-skjermene (liste, detalj, ny, dubletter).
 * Ekte interaktivt overlay-mønster (fixed inset-0 + backdrop-blur + panel) —
 * samme idiom som WorkbenchV2Sheets sine ark, ikke overlays.tsx sine statiske
 * galleri-demoer. Alt bruker v2-tokens (T.*) — ingen rå hex, ingen Tailwind
 * shadcn-klasser.
 */

import { useEffect, useState, type ReactNode } from "react";
import { Caps, Knapp, T } from "@/components/v2";
import { Icon } from "@/components/v2/icon";

/** md-breakpoint-speil (matcher V2Shell/AdminBookingerV2). */
export function useMobile(): boolean {
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

/** Sentrert modal-panel (desktop) — bunn-ark på mobil. Lukkes ved backdrop-klikk. */
export function TurneringModal({
  title,
  eyebrow,
  onLukk,
  children,
  wide,
  busy,
}: {
  title: ReactNode;
  eyebrow?: ReactNode;
  onLukk: () => void;
  children: ReactNode;
  wide?: boolean;
  busy?: boolean;
}) {
  const mobile = useMobile();
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 80, display: "flex", alignItems: mobile ? "flex-end" : "center", justifyContent: "center", padding: mobile ? 0 : 16 }}>
      <div onClick={busy ? undefined : onLukk} style={{ position: "absolute", inset: 0, background: "rgba(6,7,6,0.62)", backdropFilter: "blur(2px)" }} />
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: wide ? 640 : 480,
          maxHeight: mobile ? "88vh" : "86vh",
          overflowY: "auto",
          background: T.panel,
          border: `1px solid ${T.borderS}`,
          borderRadius: mobile ? "20px 20px 0 0" : 20,
          padding: mobile ? "10px 20px 24px" : "22px 24px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
      >
        {mobile && <span style={{ display: "block", width: 36, height: 4, borderRadius: 9999, background: T.borderS, margin: "0 auto 14px" }} />}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            {eyebrow && <Caps size={9} style={{ marginBottom: 6 }}>{eyebrow}</Caps>}
            <h2 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 19, letterSpacing: "-0.02em", color: T.fg, margin: 0, lineHeight: 1.2 }}>{title}</h2>
          </div>
          <button
            type="button"
            onClick={onLukk}
            disabled={busy}
            className="v2-press v2-focus"
            style={{ width: 28, height: 28, borderRadius: 8, background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: busy ? "default" : "pointer", flex: "none", opacity: busy ? 0.5 : 1 }}
          >
            <Icon name="x" size={14} style={{ color: T.fg2 }} />
          </button>
        </div>
        <div style={{ marginTop: 18 }}>{children}</div>
      </div>
    </div>
  );
}

/** Feilbanner inne i modaler — konsistent med resten av v2-skjemaene. */
export function ModalFeil({ children }: { children: ReactNode }) {
  return (
    <div role="alert" style={{ marginTop: 16, borderRadius: 11, background: `color-mix(in srgb, ${T.down} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${T.down} 35%, transparent)`, padding: "10px 13px", fontFamily: T.ui, fontSize: 12.5, color: T.down }}>
      {children}
    </div>
  );
}

/** Footer med Avbryt/Slett (valgfri)/Lagre — matcher WorkbenchV2Sheets-mønsteret. */
export function ModalFooter({
  onAvbryt,
  onSlett,
  onLagre,
  slettTekst = "Slett",
  lagreTekst = "Lagre",
  busy,
  slettBusy,
  submitForm,
  lagreDisabled,
}: {
  onAvbryt: () => void;
  onSlett?: () => void;
  /** Klikk-handler når knappen IKKE er inne i et <form> (submitForm=false/utelatt). */
  onLagre?: () => void;
  slettTekst?: string;
  lagreTekst?: string;
  busy?: boolean;
  slettBusy?: boolean;
  /** true → render som submit-knapp inne i et <form> (onLagre ignoreres, skjemaets onSubmit styrer). */
  submitForm?: boolean;
  lagreDisabled?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 22 }}>
      {onSlett && (
        <button
          type="button"
          onClick={onSlett}
          disabled={busy || slettBusy}
          className="v2-press v2-focus"
          style={{ appearance: "none", cursor: "pointer", borderRadius: 9999, padding: "9px 16px", fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.down, background: `color-mix(in srgb, ${T.down} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${T.down} 30%, transparent)`, opacity: busy || slettBusy ? 0.6 : 1 }}
        >
          {slettBusy ? "Sletter…" : slettTekst}
        </button>
      )}
      <span style={{ marginLeft: "auto" }} />
      <button
        type="button"
        onClick={onAvbryt}
        disabled={busy}
        className="v2-press v2-focus"
        style={{ appearance: "none", cursor: "pointer", borderRadius: 9999, padding: "9px 16px", fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg, background: T.panel3, border: `1px solid ${T.borderS}`, opacity: busy ? 0.6 : 1 }}
      >
        Avbryt
      </button>
      <button
        type={submitForm ? "submit" : "button"}
        onClick={submitForm ? undefined : onLagre}
        disabled={busy || lagreDisabled}
        className="v2-press v2-focus"
        style={{ appearance: "none", cursor: busy || lagreDisabled ? "default" : "pointer", borderRadius: 9999, padding: "9px 18px", fontFamily: T.ui, fontSize: 12.5, fontWeight: 700, color: T.onLime, background: T.lime, border: "none", opacity: busy || lagreDisabled ? 0.6 : 1 }}
      >
        {busy ? "Lagrer…" : lagreTekst}
      </button>
    </div>
  );
}

/** Ghost-tekstknapp for "Endre"/"+ Nytt resultat"-triggere i lister. */
export function TekstTrigger({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="v2-focus"
      style={{ appearance: "none", cursor: "pointer", background: "none", border: "none", padding: 0, fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: T.lime }}
    >
      {children}
    </button>
  );
}

export { Knapp };
