"use client";

import type { ReactElement } from "react";
import { Check, X } from "lucide-react";
import { FONT, WB } from "./theme";
import type { DimField } from "./taxonomy";
import { DIM_OPTS, DIM_TITLES, dimLabel } from "./taxonomy";

type DimPickerModalProps = {
  field: DimField;
  /** valgte verdier (single → 1 element; multi/omr → flere) */
  selected: string[];
  multi: boolean;
  onPick: (value: string) => void;
  onClose: () => void;
};

export function DimPickerModal({ field, selected, multi, onPick, onClose }: DimPickerModalProps): ReactElement {
  const opts = DIM_OPTS[field] ?? [];
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        background: "rgba(7,16,12,0.74)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 400,
          maxWidth: "100%",
          maxHeight: "78%",
          display: "flex",
          flexDirection: "column",
          background: WB.panelBg,
          border: `1px solid ${WB.panelBorder}`,
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 40px 90px -30px rgba(0,0,0,0.65)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderBottom: `1px solid ${WB.panelBorder}` }}>
          <div>
            <div style={{ fontFamily: FONT.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: WB.muted3, marginBottom: 3 }}>
              Velg verdi
            </div>
            <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 17, color: WB.text }}>{DIM_TITLES[field]}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 9, border: "none", background: WB.cardBg, color: WB.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X size={15} />
          </button>
        </div>

        <div className="wb-scroll" style={{ padding: 12, overflowY: "auto" }}>
          {opts.map((val) => {
            const active = selected.includes(val);
            return (
              <div
                key={val}
                onClick={() => onPick(val)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  padding: "12px 14px",
                  borderRadius: 10,
                  cursor: "pointer",
                  marginBottom: 5,
                  border: `1px solid ${active ? WB.lime : WB.panelBorder}`,
                  background: active ? "rgba(209,248,67,0.12)" : WB.cardBg,
                }}
              >
                <span style={{ fontSize: 13.5, fontWeight: active ? 700 : 500, color: active ? WB.lime : WB.text }}>
                  {dimLabel(field, val)}
                </span>
                {active && <Check size={17} color={WB.lime} strokeWidth={2.6} />}
              </div>
            );
          })}
          {multi && (
            <div style={{ fontSize: 11, color: WB.muted3, padding: "6px 4px 2px" }}>
              Velg ett eller flere · klikk utenfor for å lukke
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
