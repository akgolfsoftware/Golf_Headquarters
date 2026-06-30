"use client";

import type { ReactElement } from "react";
import { WB } from "./theme";
import { Inspector, type InspectorMode } from "./Inspector";
import type { DimField } from "./taxonomy";

type MobileInspectorSheetProps = {
  mode: InspectorMode;
  onClose: () => void;
  onDimClick: (field: DimField) => void;
  onRemoveMulti: (field: DimField, value: string) => void;
  readOnly?: boolean;
  onPaletteTitle?: (title: string) => void;
  onPaletteDur?: (delta: number) => void;
  onRemoveSession?: () => void;
  onStart?: () => void;
  onOpenPlan?: () => void;
  onOpenRecur?: () => void;
  onOpenBank?: () => void;
};

/**
 * Mobil inspektør som bunn-ark (slide-up). Gjenbruker den eksisterende
 * Inspector-en (med all AK-formel-/dimensjon-logikk) i "sheet"-variant — ingen
 * duplisering av innhold. Erstatter den 300px høyre-kolonnen på små skjermer.
 */
export function MobileInspectorSheet(props: MobileInspectorSheetProps): ReactElement {
  const { onClose } = props;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 72,
        background: "rgba(7,16,12,0.74)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          background: WB.railBg,
          borderTop: `1px solid ${WB.panelBorder}`,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          overflow: "hidden",
          boxShadow: "0 -24px 60px -20px rgba(0,0,0,0.6)",
        }}
      >
        {/* drag handle */}
        <div style={{ flexShrink: 0, paddingTop: 10 }}>
          <div style={{ width: 38, height: 4, borderRadius: 9999, background: WB.panelBorder, margin: "0 auto" }} />
        </div>
        <Inspector {...props} variant="sheet" />
      </div>
    </div>
  );
}
