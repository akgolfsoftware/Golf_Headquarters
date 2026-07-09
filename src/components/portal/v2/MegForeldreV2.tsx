"use client";

/**
 * PlayerHQ Meg · Foresatte — v2 (retning C «Presis»). Rekomponert fra den ekte
 * skjermen src/app/portal/meg/foreldre/page.tsx + foreldre-info.tsx, men med
 * v2-biblioteket (@/components/v2). Kun v2-komponenter; ingen ad-hoc UI, ingen
 * rå hex (kun T.*).
 *
 * Datakontrakt bevart 1:1 fra parentRelation-mappingen: hver foresatt har
 * navn, relasjon (Far/Mor/Verge), kontekst (e-post) og href. Tom liste →
 * ærlig tom-tilstand (aldri dummy-data).
 *
 * Ærlighet: den gamle skjermen bærer verken samtykke-status per rad eller en
 * «inviter foresatt»-flyt (ingen server-action finnes) — de fabrikkeres ikke
 * her, men meldes som gap. Relasjonen vises som nøytral info-pill.
 *
 * V2Shell eier chrome-en; denne komponenten rendrer bare den indre stacken.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  T,
  Caps,
  Tittel,
  Kort,
  Rad,
  StatusPill,
  AvatarInit,
  TomTilstand,
} from "@/components/v2";

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
  const mobile = useMobile();
  const { foresatte } = data;
  const erTom = foresatte.length === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode — eyebrow + tittel + antall-linje */}
      <div>
        <Caps>Foresatte · Oversikt</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel mobile={mobile}>Mine foresatte</Tittel>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, margin: "10px 0 0", lineHeight: 1.5 }}>
          {antallTekst(foresatte.length)}
        </p>
      </div>

      {/* Liste over koblede foresatte, eller tom-tilstand */}
      <Kort eyebrow="Koblede foresatte">
        {erTom ? (
          <TomTilstand
            icon="users"
            title="Ingen foresatte koblet"
            sub="Ingen foresatte er koblet til kontoen din ennå. Kontakt coachen din for å koble en foresatt."
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
    </div>
  );
}
