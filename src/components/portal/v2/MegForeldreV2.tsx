"use client";
import { TL } from "@/lib/v2/train-lock";

/**
 * PlayerHQ Meg · Foresatte — v2 Presis + B-pakke (status, tom = én grønn vei).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Caps, Kort, Rad, StatusPill, AvatarInit, TomTilstand } from "@/components/v2";
/* ── Datakontrakt (1:1 fra parentRelation-mappingen) ───────────────────── */

/** Én foresatt/verge koblet til spilleren. */
export type ForesattRad = {
  /** Stabil id (relasjonens id) for key + lenke. */
  id: string;
  /** Foresattens navn, eller e-post som fallback. */
  navn: string;
  /** Relasjon til spilleren: «Far», «Mor» eller «Verge». */
  relasjon: string;
  /** Kort kontekst — e-post. */
  kontekst: string;
  /** Rute til foresatt-detalj. */
  href: string;
};

export type MegForeldreData = {
  /** Foresatte koblet til spilleren. Tom liste → tom-tilstand. */
  foresatte: ForesattRad[];
};

/* ── Hjelpere ──────────────────────────────────────────────────────────── */

/** true på klient etter mount når viewport < 768px (styrer kun tallstørrelser). */
function useMobile(): boolean {
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

function antallTekst(n: number): string {
  if (n === 0) return "Ingen foresatte er koblet til kontoen din ennå.";
  return `${n} ${n === 1 ? "foresatt er" : "foresatte er"} koblet til kontoen din.`;
}

/* ── Skjerm ────────────────────────────────────────────────────────────── */

export function MegForeldreV2({ data }: { data: MegForeldreData }) {
  const _mobile = useMobile();
  const { foresatte } = data;
  const erTom = foresatte.length === 0;

  return (
    <div data-paper-wave-g="megforeldre" data-paper-portal-meg-foreldre style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, margin: "0 auto", width: "100%" }}>
      <div>
        <div data-paper-pattern-topp>
          <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>Foreldre</h1>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>Meg</span>
        </div>
      </div>

      {/* B: status først */}
      <Kort pad="12px">
        <Caps size={9}>Koblede</Caps>
        <div style={{ fontFamily: TL.font.mono, fontWeight: 700, fontSize: 18, marginTop: 8, color: TL.text }}>
          {foresatte.length}
        </div>
        <p style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, margin: "6px 0 0", lineHeight: 1.45 }}>
          {antallTekst(foresatte.length)}
        </p>
      </Kort>

      <Kort eyebrow="Koblede foresatte">
        {erTom ? (
          <TomTilstand
            icon="users"
            title="Ingen foresatte koblet"
            sub="Kontakt coachen din for å koble en foresatt til kontoen."
          />
        ) : (
          foresatte.map((f, i) => (
            <Link
              key={f.id}
              href={f.href}
              style={{ textDecoration: "none", color: "inherit", display: "block" }}
            >
              <Rad
                leading={<AvatarInit navn={f.navn} size={36} />}
                title={f.navn}
                sub={f.kontekst}
                meta={<StatusPill tone="info">{f.relasjon}</StatusPill>}
                last={i === foresatte.length - 1}
              />
            </Link>
          ))
        )}
      </Kort>

      {erTom && (
        <Link href="/portal/meg/help/kontakt" style={{ textDecoration: "none", display: "block" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 56, width: "100%", padding: "10px 16px",
            borderRadius: 12, background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600,
          }}>Kontakt support</span>
        </Link>
      )}
    </div>
  );
}
