"use client";

import { useState } from "react";

import {
  GRUPPER,
  GRUPPE_KEYS,
  TYPE_FARGER,
  type GruppeKey,
  type UkeOkt,
} from "../_data/gfgk-junior-data";

// Treningsuken (forside + Treningsplaner): fanevalg per gruppe + øktliste.
// Desktop: tabellgrid. Mobil: øktkort (aldri horisontal scroll i tabell).
// Valgt fane på lys flate = ink-fylt pill (premium-regel).
export function Treningsuke({
  ukeplaner,
  notater,
}: {
  ukeplaner: Record<GruppeKey, UkeOkt[]>;
  notater?: Record<GruppeKey, string>;
}) {
  const [valgt, setValgt] = useState<GruppeKey>("U13");
  const g = GRUPPER[valgt];
  const okter = ukeplaner[valgt];

  return (
    <div>
      <div
        className="mt-7 flex w-fit max-w-full flex-wrap gap-1.5 rounded-full bg-white p-1.5"
        style={{ boxShadow: "var(--shadow-sm)" }}
        role="tablist"
        aria-label="Velg gruppe"
      >
        {GRUPPE_KEYS.map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={k === valgt}
            onClick={() => setValgt(k)}
            className="cursor-pointer rounded-full border-none px-4 py-2 text-sm font-bold transition-all sm:px-5"
            style={{
              fontFamily: "var(--font-jr-sans)",
              background: k === valgt ? "var(--ink)" : "transparent",
              color: k === valgt ? "var(--gfgk-white)" : "var(--fg-2)",
            }}
          >
            {k}
          </button>
        ))}
      </div>

      <div
        key={valgt}
        className="jr-fade-up mt-5 overflow-hidden rounded-[var(--r-lg)] bg-white"
        style={{ boxShadow: "var(--shadow-md)" }}
      >
        <div
          className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-white sm:px-6"
          style={{ background: "var(--ink)" }}
        >
          <span className="text-[15px] font-bold">
            {g.navn} – {g.alder} – {okter.length} økter/uke
          </span>
          <span
            className="text-[12.5px]"
            style={{ fontFamily: "var(--font-jr-mono)", color: "rgba(255,255,255,0.6)" }}
          >
            {valgt} · {g.kat}
          </span>
        </div>

        {/* Desktop-tabell */}
        <div className="hidden md:block">
          <div
            className="grid grid-cols-[110px_130px_110px_160px_1fr] gap-4 border-b px-6 py-3 text-[12.5px] font-bold uppercase tracking-[0.1em]"
            style={{ color: "var(--fg-3)", borderColor: "var(--n-100)" }}
          >
            <span>Dag</span>
            <span>Tid</span>
            <span>Type</span>
            <span>Sted</span>
            <span>Beskrivelse</span>
          </div>
          {okter.map((okt) => (
            <div
              key={okt.dag + okt.tid}
              className="grid grid-cols-[110px_130px_110px_160px_1fr] items-center gap-4 border-b px-6 py-4"
              style={{ borderColor: "var(--n-100)" }}
            >
              <span className="text-[15px] font-bold" style={{ color: "var(--ink)" }}>
                {okt.dag}
              </span>
              <span
                className="text-sm tabular-nums"
                style={{ fontFamily: "var(--font-jr-mono)", color: "var(--ink)" }}
              >
                {okt.tid}
              </span>
              <span
                className="w-fit rounded-full px-3 py-1 text-[12.5px] font-bold uppercase tracking-[0.04em]"
                style={{ color: TYPE_FARGER[okt.type].fg, background: TYPE_FARGER[okt.type].bg }}
              >
                {okt.type}
              </span>
              <span className="text-[14.5px]" style={{ color: "var(--fg-2)" }}>
                {okt.sted}
              </span>
              <span className="text-[14.5px]" style={{ color: "var(--fg-2)" }}>
                {okt.beskrivelse}
              </span>
            </div>
          ))}
        </div>

        {/* Mobil: øktkort */}
        <div className="md:hidden">
          {okter.map((okt) => (
            <div
              key={okt.dag + okt.tid}
              className="border-b px-5 py-4"
              style={{ borderColor: "var(--n-100)" }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[15px] font-bold" style={{ color: "var(--ink)" }}>
                  {okt.dag}
                </span>
                <span
                  className="text-sm tabular-nums"
                  style={{ fontFamily: "var(--font-jr-mono)", color: "var(--ink)" }}
                >
                  {okt.tid}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full px-3 py-1 text-[11.5px] font-bold uppercase tracking-[0.04em]"
                  style={{ color: TYPE_FARGER[okt.type].fg, background: TYPE_FARGER[okt.type].bg }}
                >
                  {okt.type}
                </span>
                <span className="text-[13.5px] font-semibold" style={{ color: "var(--fg-3)" }}>
                  {okt.sted}
                </span>
              </div>
              <p className="mt-1.5 text-[14px] leading-snug" style={{ color: "var(--fg-2)" }}>
                {okt.beskrivelse}
              </p>
            </div>
          ))}
        </div>

        {notater ? (
          <div
            className="px-5 py-3.5 text-[13.5px] sm:px-6"
            style={{ background: "var(--n-50)", color: "var(--fg-3)" }}
          >
            {notater[valgt]}
          </div>
        ) : null}
      </div>
    </div>
  );
}
