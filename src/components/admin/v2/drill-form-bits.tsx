"use client";

/**
 * Delte, gjenbrukbare skjema-biter for AdminDrillOpprettV2 + AdminDrillRedigerV2
 * (begge har pill-grupper for enum-multi/enkeltvalg og frittekst-tag-lister,
 * ikke dekket av et eksisterende v2-kjernekomponent). Bygget av T.*-tokens.
 */

import { useState } from "react";
import { T, Bit, Icon } from "@/components/v2";

export function PillGroup<T extends string>({
  options,
  active,
  onToggle,
}: {
  options: readonly T[];
  active: readonly T[];
  onToggle: (v: T) => void;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {options.map((o) => {
        const valgt = active.includes(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() => onToggle(o)}
            className="v2-press v2-focus"
            style={{
              appearance: "none",
              cursor: "pointer",
              borderRadius: 9999,
              border: `1px solid ${valgt ? "transparent" : T.border}`,
              background: valgt ? T.lime : T.panel2,
              color: valgt ? T.onLime : T.mut,
              padding: "7px 13px",
              fontFamily: T.mono,
              fontSize: 10.5,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

export function TagListInput({
  tags,
  onChange,
  placeholder = "Legg til, trykk Enter",
  prefix,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  prefix?: string;
}) {
  const [draft, setDraft] = useState("");

  function leggTil() {
    const v = draft.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setDraft("");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              leggTil();
            }
          }}
          placeholder={placeholder}
          style={{ flex: 1, height: 38, borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: "0 12px", fontFamily: T.ui, fontSize: 13, color: T.fg, outline: "none" }}
        />
        <button
          type="button"
          onClick={leggTil}
          style={{ height: 38, borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, color: T.fg, padding: "0 14px", fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}
        >
          Legg til
        </button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {tags.map((t) => (
          <Bit key={t}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              {prefix}{t}
              <span
                role="button"
                tabIndex={0}
                onClick={() => onChange(tags.filter((x) => x !== t))}
                onKeyDown={(e) => e.key === "Enter" && onChange(tags.filter((x) => x !== t))}
                aria-label={`Fjern ${t}`}
                style={{ display: "inline-flex", cursor: "pointer" }}
              >
                <Icon name="x" size={10} style={{ color: T.mut }} />
              </span>
            </span>
          </Bit>
        ))}
      </div>
    </div>
  );
}
