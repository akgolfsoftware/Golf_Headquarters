"use client";

/**
 * AgencyOS Turneringer — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * Listen over turneringene stallen er påmeldt i denne sesongen, med fellesmelding
 * per turnering. «Ny turnering» → 5-stegs-veiviseren (/admin/tournaments/ny).
 */

import Link from "next/link";
import type { CSSProperties } from "react";
import { Caps, Kort, Rad, StatusPill, TomTilstand, Tittel, T, CTAPill, type StatusTone } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import { useMobile } from "./turnering-ui";

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

/** Pillestil for fellesmelding-inngangen — aktiv lenke eller nedtonet «ikke tilgjengelig». */
function fellesmeldingPille(mobile: boolean, nedtonet: boolean): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    borderRadius: 9999,
    padding: mobile ? "8px 12px" : "6px 12px",
    fontFamily: T.ui,
    fontSize: 11.5,
    fontWeight: 600,
    color: nedtonet ? T.mut : T.fg,
    background: T.panel3,
    border: `1px solid ${T.borderS}`,
    whiteSpace: "nowrap",
    opacity: nedtonet ? 0.5 : 1,
    cursor: nedtonet ? "default" : "pointer",
  };
}

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
  const antall = rader.length;
  const statusTone: StatusTone = antall > 0 ? "lime" : "warn";
  const statusTekst = antall === 0 ? "Ingen påmeldte" : antall === 1 ? "1 turnering" : `${antall} turneringer`;

  const primaerCta = (
    <Link href="/admin/tournaments/ny" style={{ textDecoration: "none", display: "block" }}>
      <CTAPill icon="plus" full>
        Ny turnering
      </CTAPill>
    </Link>
  );

  const hode = (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
      <div>
        <div data-paper-pattern-topp data-paper-slug="agencyos-turneringer">
          <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg }}>Turneringer</h1>
          <span style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>AgencyOS</span>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "8px 0 0", maxWidth: 460 }}>
          Turneringene stallen din spiller. Send fellesmelding til alle påmeldte med ett klikk.
        </p>
      </div>
      <StatusPill tone={statusTone}>{statusTekst}</StatusPill>
    </div>
  );

  if (antall === 0) {
    return (
      <div data-paper-wave-h="turneringer" data-paper-pattern  style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {hode}
        <Kort>
          <TomTilstand
            icon="trophy"
            title="Ingen kommende turneringer"
            sub="Opprett en turnering eller vent til spillere melder seg på — da dukker de opp her."
          />
        </Kort>
        {primaerCta}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {primaerCta}

      <Kort pad={mobile ? "4px 16px" : "6px 20px"}>
        {rader.map((r, i) => (
          <Rad
            key={r.key}
            last={i === rader.length - 1}
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
                {/* D1: åpner fellesmelding-flyten (3 steg) på turneringsdetaljen —
                    den sender kun til faktiske deltakere, med mottakervalg.
                    Rader uten detaljside (manuelt registrerte) eller uten påmeldte
                    viser en ærlig nedtonet tilstand i stedet for å skjule knappen. */}
                {r.href && r.paameldte > 0 ? (
                  <Link
                    href={`${r.href}?fellesmelding=1`}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Send fellesmelding · ${r.navn}`}
                    style={{ textDecoration: "none" }}
                  >
                    <span className="v2-press v2-focus" style={fellesmeldingPille(mobile, false)}>
                      <Icon name="send" size={13} />
                      {!mobile && "Fellesmelding"}
                    </span>
                  </Link>
                ) : (
                  <span
                    title={
                      r.paameldte === 0
                        ? "Ingen påmeldte deltakere å sende til"
                        : "Ikke tilgjengelig for manuelt registrerte turneringer"
                    }
                    style={fellesmeldingPille(mobile, true)}
                  >
                    <Icon name="send" size={13} />
                    {!mobile && "Fellesmelding"}
                  </span>
                )}
              </span>
            }
            trailing={null}
          />
        ))}
      </Kort>
    </div>
  );
}
