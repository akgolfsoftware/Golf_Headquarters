"use client";

import { useState } from "react";

import {
  GRUPPER,
  GRUPPE_KEYS,
  PYRAMIDE,
  PYRAMIDE_FARGER,
  PYRAMIDE_OMRADER,
  type GruppeKey,
} from "../_data/gfgk-junior-data";

// Interaktiv treningspyramide (mørk flate). Valgt fane = hvit pill (dark-regel).
export function Treningspyramide() {
  const [valgt, setValgt] = useState<GruppeKey>("U13");
  const rader = PYRAMIDE_OMRADER.map((navn) => ({
    navn,
    pct: PYRAMIDE[valgt][navn],
    farge: PYRAMIDE_FARGER[navn],
  }));

  return (
    <div
      className="mt-11 rounded-[var(--r-lg)] p-7 text-white sm:p-10"
      style={{ background: "var(--ink)" }}
    >
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <h3 className="m-0 text-[22px] font-bold text-white sm:text-[26px]">
            Treningspyramiden
          </h3>
          <p
            className="mt-2 max-w-md text-[15px] leading-relaxed"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            Vår treningsmodell fordeler tiden mellom fem områder. Fordelingen endres etter
            hvert som spilleren utvikler seg.
          </p>
        </div>
        <div
          className="flex gap-1.5 rounded-full p-1.5"
          style={{ background: "rgba(255,255,255,0.08)" }}
          role="tablist"
          aria-label="Velg gruppe"
        >
          {GRUPPE_KEYS.map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={k === valgt}
              onClick={() => setValgt(k)}
              className="cursor-pointer rounded-full border-none px-4 py-2 text-sm font-bold transition-all"
              style={{
                fontFamily: "var(--font-jr-sans)",
                background: k === valgt ? "var(--gfgk-white)" : "transparent",
                color: k === valgt ? "var(--ink)" : "rgba(255,255,255,0.75)",
              }}
            >
              {k}
            </button>
          ))}
        </div>
      </div>
      <div key={valgt} className="jr-fade-up mt-7 flex flex-col gap-3.5">
        {rader.map((rad) => (
          <div
            key={rad.navn}
            className="grid grid-cols-[86px_1fr_52px] items-center gap-3 sm:grid-cols-[110px_1fr_52px] sm:gap-4"
          >
            <span
              className="text-[14px] font-semibold sm:text-[15px]"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              {rad.navn}
            </span>
            <div
              className="h-[22px] overflow-hidden rounded-full"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${rad.pct}%`, background: rad.farge }}
              />
            </div>
            <span
              className="text-right text-sm tabular-nums"
              style={{ fontFamily: "var(--font-jr-mono)", color: "rgba(255,255,255,0.85)" }}
            >
              {rad.pct}
              <span style={{ color: "rgba(255,255,255,0.5)" }}> %</span>
            </span>
          </div>
        ))}
      </div>
      <p
        className="mt-5 text-[12.5px]"
        style={{ fontFamily: "var(--font-jr-mono)", color: "rgba(255,255,255,0.5)" }}
      >
        Prosentfordeling for {valgt} – {GRUPPER[valgt].kat}
      </p>
    </div>
  );
}
