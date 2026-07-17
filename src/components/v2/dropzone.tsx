"use client";

/**
 * Dropzone — delt v2-primitiv for filopplasting (retning C).
 * Lukker det meldte kanon-gapet fra videoer-porten (17. juli 2026):
 * mønsteret lå tidligere inline i AdminVideoerV2. Kontrollert komponent —
 * eieren holder `file`-state og validerer i `onFile` (størrelse/format),
 * Dropzone eier kun drag-tilstand, skjult file-input og presentasjonen.
 * Kun v2 T-tokens, ingen rå hex.
 */

import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import { T } from "@/lib/v2/tokens";
import { Icon } from "@/components/v2/icon";
import { Knapp } from "./core";

export interface DropzoneProps {
  /** Valgt fil (eierens state), eller null. */
  file: File | null;
  /** Kalles med valgt/sluppet fil (eller null ved fjern) — eieren validerer. */
  onFile: (f: File | null) => void;
  /** `accept`-verdi til <input type=file> (f.eks. "video/mp4,video/webm"). */
  accept: string;
  /** Ikon i tomtilstand (default "upload") og ved valgt fil (default "file"). */
  idleIkon?: string;
  valgtIkon?: string;
  /** Overskrift i tomtilstand. */
  idleTittel?: string;
  /** Hjelpetekst under overskriften i tomtilstand. */
  idleSub?: string;
  style?: CSSProperties;
}

function mb(n: number): string {
  return (n / 1024 / 1024).toFixed(1).replace(".", ",");
}

export function Dropzone({
  file,
  onFile,
  accept,
  idleIkon = "upload",
  valgtIkon = "file",
  idleTittel = "Slipp filen her",
  idleSub = "eller klikk for å velge",
  style,
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const aktiv = dragging || !!file;
  const kant = aktiv ? T.lime : T.borderS;

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        onFile(e.dataTransfer.files?.[0] ?? null);
      }}
      className="v2-focus"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        textAlign: "center",
        padding: "34px 20px",
        borderRadius: 14,
        border: `1.5px dashed ${kant}`,
        background: aktiv ? `color-mix(in srgb, ${T.lime} 6%, transparent)` : T.panel2,
        cursor: "pointer",
        transition: "border-color 180ms, background 180ms",
        ...style,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        style={{ position: "absolute", width: 1, height: 1, opacity: 0, overflow: "hidden" }}
      />
      <span
        style={{
          width: 46,
          height: 46,
          borderRadius: 9999,
          background: file ? `color-mix(in srgb, ${T.lime} 12%, transparent)` : T.panel3,
          border: `1px solid ${T.border}`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={file ? valgtIkon : idleIkon} size={19} style={{ color: file ? T.lime : T.fg2 }} />
      </span>
      {file ? (
        <>
          <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14, color: T.fg }}>{file.name}</span>
          <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut, fontVariantNumeric: "tabular-nums" }}>
            {mb(file.size)} MB · {file.type || "ukjent format"}
          </span>
          <Knapp
            ghost
            icon="x"
            onClick={() => {
              if (inputRef.current) inputRef.current.value = "";
              onFile(null);
            }}
          >
            Fjern
          </Knapp>
        </>
      ) : (
        <>
          <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14, color: T.fg }}>{idleTittel}</span>
          <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>{idleSub}</span>
        </>
      )}
    </label>
  );
}
