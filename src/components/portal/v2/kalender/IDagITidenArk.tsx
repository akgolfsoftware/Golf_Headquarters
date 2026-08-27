"use client";

/**
 * KA-04 — «I dag i tiden» (Loop 7/C3, natt-plan bølge 2).
 *
 * Fasit: `designsystem/train-lock/KA-04 Player I dag i tiden ark.dc.html» —
 * «Player har ingen kalender-fane — "I dag i tiden" er ark fra I dag: dagen
 * som lesevisning, økter redigeres i Plan.»
 *
 * Selvstendig TL-ark (scrim + bunn-forankret sheet). Bruker IKKE
 * `src/components/v2/bunn-ark.tsx` — den er bygget på `T` (Paper-tokens), og
 * CLAUDE.md invariant 2 forbyr å blande T.* og TL.* på samme flate. Arket er
 * en isolert overlay, så det får sitt eget minimale sheet-oppsett i TL.
 *
 * Kun TL. Norsk bokmål.
 */

import { useEffect, useRef } from "react";
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import { klokkeslett, LAG_LABEL, type KalenderHendelse } from "@/lib/domain/kalender-lag";

const FOKUSERBAR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function tidCelle(h: KalenderHendelse): string {
  if (h.startMin !== null) return klokkeslett(h.startMin);
  return h.lag === "TESTER" ? "FRIST" : "";
}

export function IDagITidenArk({
  open,
  onClose,
  dagLabel,
  hendelser,
}: {
  open: boolean;
  onClose: () => void;
  /** F.eks. «Lørdag 22.» — norsk ukedag + dato, ingen måned (fasitens format). */
  dagLabel: string;
  hendelser: KalenderHendelse[];
}) {
  const arkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const forrigeFokus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    arkRef.current?.focus();
    const forrigeOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const keys = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && arkRef.current) {
        const fokuserbare = arkRef.current.querySelectorAll<HTMLElement>(FOKUSERBAR);
        if (fokuserbare.length === 0) {
          e.preventDefault();
          return;
        }
        const forste = fokuserbare[0];
        const siste = fokuserbare[fokuserbare.length - 1];
        if (e.shiftKey && document.activeElement === forste) {
          e.preventDefault();
          siste.focus();
        } else if (!e.shiftKey && document.activeElement === siste) {
          e.preventDefault();
          forste.focus();
        }
      }
    };
    document.addEventListener("keydown", keys);
    return () => {
      document.removeEventListener("keydown", keys);
      document.body.style.overflow = forrigeOverflow;
      forrigeFokus?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 90 }}>
      <div
        onClick={onClose}
        aria-hidden
        style={{ position: "absolute", inset: 0, background: TL.scrim }}
      />
      <div
        ref={arkRef}
        role="dialog"
        aria-modal="true"
        aria-label="I dag i tiden"
        tabIndex={-1}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: "82vh",
          overflowY: "auto",
          background: TL.elev,
          borderRadius: `${TL.radius.sheet} ${TL.radius.sheet} 0 0`,
          padding: "12px 24px calc(24px + env(safe-area-inset-bottom, 0px))",
          outline: "none",
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, background: TL.grabber, margin: "0 auto 14px" }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: TL.mute }}>
              I dag i tiden
            </div>
            <div style={{ marginTop: 6, fontSize: 26, fontWeight: 700, color: TL.text }}>{dagLabel}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Lukk"
            className="v2-press v2-focus"
            style={{
              appearance: "none",
              border: "none",
              background: TL.dock,
              width: 32,
              height: 32,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <Icon name="x" size={15} style={{ color: TL.mute }} />
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          {hendelser.length === 0 ? (
            <div style={{ padding: "20px 0", fontSize: 13, color: TL.mute, lineHeight: 1.55 }}>
              Ingen planlagte hendelser i dag på tvers av økt, skole, turnering, tester eller booking.
            </div>
          ) : (
            hendelser.map((h, i) => (
              <div
                key={h.id}
                style={{ display: "flex", gap: 12, padding: "12px 0", borderTop: i === 0 ? "none" : `1px solid ${TL.hair}` }}
              >
                <div style={{ width: 46, fontSize: 11, fontWeight: 600, color: TL.mute, fontVariantNumeric: "tabular-nums", paddingTop: 2 }}>
                  {tidCelle(h)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.04em", color: TL.mute }}>
                    {LAG_LABEL[h.lag]}
                  </div>
                  <div style={{ marginTop: 2, fontSize: 15, fontWeight: 600, color: TL.text }}>{h.tittel}</div>
                  {h.undertekst && (
                    <div style={{ marginTop: 2, fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
                      {h.undertekst}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: TL.mute }}>
          Skole og avtaler er lesevisning. Økter redigeres i Plan.
        </div>
      </div>
    </div>
  );
}
