"use client";

/**
 * AgencyOS Turneringer — v2 (retning C «Presis»). Listen over turneringene
 * stallen din er påmeldt i denne sesongen, med fellesmelding per turnering.
 * Funksjon/data bevart 1:1 fra legacy-siden (src/app/admin/(legacy)/tournaments) —
 * kun visuelt løftet til v2-biblioteket. Rørende «Ny turnering» går til
 * 5-stegs-veiviseren (/admin/tournaments/ny).
 */

import Link from "next/link";
import { Caps, Kort, Rad, StatusPill, TomTilstand, Tittel, T, type StatusTone } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import { useMobile } from "./turnering-ui";
import { FellesmeldingKnapp } from "@/app/admin/tournaments/fellesmelding-knapp";

export type TurneringChipTone = "ok" | "warn" | "neu" | "lime";

export interface AdminTurneringV2Row {
  key: string;
  href: string | null;
  navn: string;
  datoTekst: string;
  anlegg: string | null;
  paameldte: number;
  chip: { label: string; tone: TurneringChipTone } | null;
}

export interface AdminTurneringerV2Data {
  sesong: number;
  rader: AdminTurneringV2Row[];
}

const TONE_MAP: Record<TurneringChipTone, StatusTone> = {
  ok: "up",
  warn: "warn",
  neu: "info",
  lime: "lime",
};

function TurneringIkon() {
  return (
    <span style={{ width: 32, height: 32, borderRadius: 10, background: T.panel3, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
      <Icon name="trophy" size={15} style={{ color: T.lime }} />
    </span>
  );
}

function TurneringTittel({ r }: { r: AdminTurneringV2Row }) {
  return r.href ? (
    <Link href={r.href} onClick={(e) => e.stopPropagation()} style={{ textDecoration: "none", color: T.fg, fontWeight: 600 }}>
      {r.navn}
    </Link>
  ) : (
    <span style={{ color: T.fg, fontWeight: 600 }}>{r.navn}</span>
  );
}

export function AdminTurneringerV2({ data }: { data: AdminTurneringerV2Data }) {
  const mobile = useMobile();
  const { sesong, rader } = data;

  const hode = (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
      <div>
        <Caps>Planlegge · Turneringer</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel mobile={mobile} em={`${sesong}.`}>Sesong</Tittel>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "8px 0 0", maxWidth: 460 }}>
          Turneringene stallen din spiller. Send fellesmelding til alle påmeldte med ett klikk.
        </p>
      </div>
      <Link href="/admin/tournaments/ny" style={{ textDecoration: "none" }}>
        <span
          className="v2-press v2-focus"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 9999, padding: "10px 18px", fontFamily: T.ui, fontSize: 13, fontWeight: 700, color: T.onLime, background: T.lime, cursor: "pointer" }}
        >
          <Icon name="plus" size={15} style={{ color: T.onLime }} />
          Ny turnering
        </span>
      </Link>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}

      <Kort pad={mobile ? "4px 16px" : "6px 20px"}>
        {rader.length === 0 ? (
          <TomTilstand icon="trophy" title="Ingen kommende turneringer" sub="Ingen påmeldte fra stallen ennå denne sesongen." />
        ) : (
          rader.map((r, i) => (
            <Rad
              key={r.key}
              last={i === rader.length - 1}
              onClick={r.href ? undefined : undefined}
              leading={<TurneringIkon />}
              title={<TurneringTittel r={r} />}
              sub={
                <span>
                  {r.datoTekst}
                  {r.anlegg && <> · {r.anlegg}</>} · {r.paameldte} påmeldt
                </span>
              }
              meta={
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  {r.chip && <StatusPill tone={TONE_MAP[r.chip.tone]}>{r.chip.label}</StatusPill>}
                  <span onClick={(e) => e.stopPropagation()}>
                    <FellesmeldingKnapp navn={r.navn} mottakere={r.paameldte} />
                  </span>
                </span>
              }
              trailing={null}
            />
          ))
        )}
      </Kort>
    </div>
  );
}
