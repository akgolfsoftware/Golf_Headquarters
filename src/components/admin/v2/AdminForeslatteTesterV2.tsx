"use client";
import { TL } from "@/lib/v2/train-lock";
/**
 * AgencyOS Foreslåtte tester — v2 (retning C «Presis», mørk først). Coach/ADMIN
 * behandler custom-tester spillere har sendt inn til godkjenning. Rekomponert
 * fra det hånd-bygde golfdata-kortet (test-kort.tsx) — kun v2-primitiver fra
 * "@/components/v2", ingen rå hex (kun T.*).
 *
 * Funksjon/datakontrakt bevart 1:1 fra den gamle skjermen:
 *   - «Godkjenn» → godkjennForslag (visibility ACADEMY, varsler skaperen).
 *   - «Avvis» (confirm-vakt) → avvisForslag (sletter/privatiserer, varsler).
 *   - Protokoll-JSON parses serverside i ruten (samme zod-frie feltplukk) —
 *     komponenten mottar rene steg/nivå-lister og fabrikkerer ingenting.
 * Feedback: inline status i kortet (v2-flatene bruker ikke det gamle
 * toast-systemet); godkjent/avvist rad forsvinner ved router.refresh().
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Caps, Kort, Knapp, AkseChip, TomTilstand, HjelpTips, Icon } from "@/components/v2";
import type { AkseKey } from "@/lib/v2/tokens";
import { avvisForslag, godkjennForslag } from "@/app/admin/tester/foreslatte/actions";
/* ── Datakontrakt (mappes fra Prisma + protokoll-parsing i ruten) ─────── */

export interface ForeslattTestV2 {
  id: string;
  navn: string;
  beskrivelse: string | null;
  akse: AkseKey;
  scoring: string;
  /** Protokoll-steg (fra protocol.steg) — tom liste når ikke oppgitt. */
  steg: string[];
  /** Mål-verdier per nivå (fra protocol.malverdi.nivaaer) — tom når ikke oppgitt. */
  nivaaer: { nivaa: string; verdi: string }[];
  /** Ferdig formatert dato, f.eks. «12. jul». */
  opprettet: string;
  forfatter: string;
}

export interface AdminForeslatteTesterV2Data {
  forslag: ForeslattTestV2[];
}

/* ── Forslag-kort ──────────────────────────────────────────────────────── */

function ForslagKort({ test }: { test: ForeslattTestV2 }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function godkjenn() {
    setError(null);
    startTransition(async () => {
      try {
        await godkjennForslag({ id: test.id });
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunne ikke godkjenne testen.");
      }
    });
  }

  function avvis() {
    if (!confirm(`Avvis og slett «${test.navn}»?`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await avvisForslag({ id: test.id });
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunne ikke avvise testen.");
      }
    });
  }

  return (
    <Kort
      eyebrow={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Icon name="user" size={11} style={{ color: TL.mute }} />
          {test.forfatter} · {test.opprettet}
        </span>
      }
      action={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <AkseChip a={test.akse} />
          <HjelpTips k="pyramideAkse" size={12} align="right" />
        </span>
      }
      style={{ height: "100%" }}
    >
      <div style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 17, lineHeight: 1.25, color: TL.text }}>
        {test.navn}
      </div>
      {test.beskrivelse && (
        <p style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, lineHeight: 1.55, margin: "8px 0 0" }}>
          {test.beskrivelse}
        </p>
      )}

      <div style={{ marginTop: 14 }}>
        <Caps size={9}>Scoring</Caps>
        <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.text, lineHeight: 1.5, margin: "5px 0 0" }}>
          {test.scoring}
        </p>
      </div>

      {test.steg.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <Caps size={9}>Protokoll</Caps>
          <ol style={{ listStyle: "none", margin: "6px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 5 }}>
            {test.steg.map((s, i) => (
              <li key={i} style={{ display: "flex", gap: 8, fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, lineHeight: 1.5 }}>
                <span style={{ fontFamily: TL.font.mono, fontSize: 11, fontWeight: 700, color: TL.fill, flex: "none", fontVariantNumeric: "tabular-nums" }}>
                  {i + 1}.
                </span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      )}

      {test.nivaaer.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <Caps size={9}>Mål-verdier per nivå</Caps>
          <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: 8, marginTop: 7 }}>
            {test.nivaaer.map((n) => (
              <div
                key={n.nivaa}
                style={{ background: TL.dock, border: `1px solid ${TL.hair}`, borderRadius: 10, padding: "7px 10px", minWidth: 0 }}
              >
                <Caps size={8.5}>{n.nivaa}</Caps>
                <div style={{ fontFamily: TL.font.mono, fontSize: 13, fontWeight: 700, color: TL.text, fontVariantNumeric: "tabular-nums", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {n.verdi}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div
          role="alert"
          style={{
            fontFamily: TL.font.sans,
            fontSize: 12,
            color: TL.danger,
            background: `color-mix(in srgb, ${TL.danger} 10%, transparent)`,
            border: `1px solid color-mix(in srgb, ${TL.danger} 30%, transparent)`,
            borderRadius: 10,
            padding: "8px 11px",
            marginTop: 12,
            lineHeight: 1.5,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginTop: "auto",
          paddingTop: 16,
        }}
      >
        <Knapp icon={pending ? "loader" : "check"} disabled={pending} onClick={godkjenn} full style={{ minHeight: 44 }}>
          Godkjenn
        </Knapp>
        <Knapp ghost icon="trash" disabled={pending} onClick={avvis} style={{ minHeight: 44, color: TL.danger }}>
          Avvis
        </Knapp>
      </div>
    </Kort>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────────── */

export function AdminForeslatteTesterV2({ data }: { data: AdminForeslatteTesterV2Data }) {
  const { forslag } = data;

  return (
    <div data-paper-wave-h="foreslatte-tester" data-paper-pattern style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 960, margin: "0 auto", width: "100%" }}>
      {/* Hode */}
      <div>
        <div data-paper-pattern-topp>
          <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>Foreslåtte tester</h1>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>AgencyOS</span>
        </div>
        <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, lineHeight: 1.55, margin: "10px 0 0", maxWidth: 560 }}>
          Spillere har sendt inn egne tester for godkjenning. Godkjente tester
          blir tilgjengelige for hele akademiet.
        </p>
      </div>

      {forslag.length === 0 ? (
        <Kort>
          <TomTilstand
            icon="sparkles"
            title="Ingen forslag i køen"
            sub="Når en spiller foreslår en ny test til deg, dukker den opp her."
          />
        </Kort>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 16 }}>
          {forslag.map((t) => (
            <ForslagKort key={t.id} test={t} />
          ))}
        </div>
      )}
    </div>
  );
}
