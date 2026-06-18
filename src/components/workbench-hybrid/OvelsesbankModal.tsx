"use client";

import { useState, type ReactElement } from "react";
import { BookOpen, Plus, X } from "lucide-react";
import { FONT, WB } from "./theme";
import { bankCats, bankItems } from "./helpers";

type OvelsesbankModalProps = {
  /** FYS-økt → "Øvelser"-modus; ellers golf-drill-bank */
  isFys: boolean;
  onClose: () => void;
  /** plukk en øvelse → legges til økten (tittel + meta) */
  onPick: (title: string, meta: string) => void;
};

/**
 * Øvelsesbank — bibliotek-velger (fasit `bankVals`). Søk + kategori-faner +
 * øvelsesliste. Plukk legger øvelsen til den valgte økten. Kategoriene og
 * øvelsene er fasitens demo-bibliotek (ingen Prisma-kilde i denne komponenten).
 */
export function OvelsesbankModal({ isFys, onClose, onPick }: OvelsesbankModalProps): ReactElement {
  const cats = bankCats(isFys);
  const [cat, setCat] = useState<string>(cats[0]?.value ?? "");
  const [query, setQuery] = useState("");

  const title = isFys ? "Øvelser" : "Øvelsesbank";
  const q = query.trim().toLowerCase();
  const items = bankItems(cat).filter(
    (it) => !q || it.title.toLowerCase().includes(q) || it.meta.toLowerCase().includes(q),
  );

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 78, background: "rgba(7,16,12,0.74)",
        backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 32,
        fontFamily: FONT.sans,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 560, maxWidth: "100%", maxHeight: "82%", display: "flex", flexDirection: "column",
          background: WB.panelBg, border: `1px solid ${WB.panelBorder}`, borderRadius: 16, overflow: "hidden",
          boxShadow: "0 40px 90px -30px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 20px", borderBottom: `1px solid ${WB.innerBorderSoft}` }}>
          <BookOpen size={18} color={WB.lime} strokeWidth={2} />
          <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 18, color: WB.text }}>{title}</div>
          <button
            type="button"
            onClick={onClose}
            style={{ marginLeft: "auto", width: 30, height: 30, borderRadius: 9, border: "none", background: WB.cardBg, color: WB.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X size={15} />
          </button>
        </div>

        {/* SØK */}
        <div style={{ padding: "12px 20px 0" }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Søk i øvelser…"
            style={{
              width: "100%", background: WB.railBg, border: `1px solid ${WB.panelBorder}`, borderRadius: 10,
              padding: "10px 13px", color: WB.text, fontSize: 13, fontFamily: FONT.sans,
            }}
          />
        </div>

        {/* KATEGORI-FANER */}
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${WB.innerBorderSoft}`, display: "flex", flexWrap: "wrap", gap: 7 }}>
          {cats.map((c) => {
            const active = c.value === cat;
            return (
              <span
                key={c.value}
                onClick={() => setCat(c.value)}
                style={{
                  fontSize: 12, fontWeight: 600, padding: "7px 13px", borderRadius: 9999, cursor: "pointer",
                  border: `1px solid ${active ? WB.lime : WB.panelBorder}`,
                  color: active ? WB.limeDark : WB.muted, background: active ? WB.lime : WB.cardBg,
                }}
              >
                {c.label}
              </span>
            );
          })}
        </div>

        {/* LISTE */}
        <div className="wb-scroll" style={{ padding: "16px 20px", overflowY: "auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {items.length === 0 && (
              <div style={{ textAlign: "center", color: WB.muted3, fontSize: 13, padding: "24px 0" }}>
                Ingen øvelser her ennå.
              </div>
            )}
            {items.map((it) => (
              <button
                key={it.title}
                type="button"
                onClick={() => onPick(it.title, it.meta)}
                style={{
                  display: "flex", alignItems: "center", gap: 12, textAlign: "left", background: WB.cardBgAlt,
                  border: `1px solid ${WB.innerBorderSoft}`, borderRadius: 11, padding: "12px 14px", cursor: "pointer",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: WB.text }}>{it.title}</div>
                  <div style={{ fontSize: 11.5, color: WB.muted, marginTop: 2 }}>{it.meta}</div>
                </div>
                <span style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(209,248,67,0.14)", color: WB.lime, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Plus size={15} strokeWidth={2.4} />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
