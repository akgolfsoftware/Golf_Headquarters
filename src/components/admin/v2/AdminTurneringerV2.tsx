"use client";

/**
 * AgencyOS Turneringer — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * Listen over turneringene stallen er påmeldt i denne sesongen, med fellesmelding
 * per turnering. «Ny turnering» → 5-stegs-veiviseren (/admin/tournaments/ny).
 */

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { Kort, Rad, StatusPill, TomTilstand, T, CTAPill, PillTabs, KpiFlis, type StatusTone } from "@/components/v2";
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
  /** Starter i eller etter inneværende uke (Oslo-tid) — styrer Kommende/Spilte-fanen. */
  erKommende: boolean;
}

export interface AdminTurneringerV2Data {
  sesong: number;
  rader: AdminTurneringV2Row[];
  /** Manuelt registrerte turneringer uten kobling mot en kanonisk kilde ennå (se /admin/tournaments/dubletter). */
  dublettAntall: number;
  /** KPI-rad (fasit agencyos-turneringer.html) — synk-/dekningstall utover listen under. */
  kpi: {
    /** Distinkte spillere med minst én ikke-trukket påmelding denne sesongen. */
    paameldteSpillere: number;
    /** Aktive PLAYER-brukere totalt — nevneren i "X av Y i stallen". */
    stallStorrelse: number;
    /** Scrapet turneringsresultat (PublicPlayerEntry) uten kobling til en PlayerHQ-bruker. */
    utenKobling: number;
  };
}

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

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
  const { sesong, rader, dublettAntall, kpi } = data;
  const antall = rader.length;
  const statusTone: StatusTone = antall > 0 ? "lime" : "warn";
  const statusTekst = antall === 0 ? "Ingen påmeldte" : antall === 1 ? "1 turnering" : `${antall} turneringer`;

  const [fane, setFane] = useState<"kommende" | "spilte">("kommende");
  const kommende = rader.filter((r) => r.erKommende);
  const spilte = rader.filter((r) => !r.erKommende);
  const synlige = fane === "kommende" ? kommende : spilte;

  const primaerCta = (
    <Link href="/admin/tournaments/ny" style={{ textDecoration: "none", display: "block" }}>
      <CTAPill icon="plus" full>
        Ny turnering
      </CTAPill>
    </Link>
  );

  const dublettBanner =
    dublettAntall > 0 ? (
      <Kort tint>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: T.fg }}>Én ting nå</span>
          <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: 0 }}>
            {dublettAntall === 1
              ? "Én manuelt registrert turnering ser ut til å matche en kjent kilde."
              : `${dublettAntall} manuelt registrerte turneringer ser ut til å matche kjente kilder.`}{" "}
            Slår du dem sammen, samles påmeldinger og resultater på ett sted.
          </p>
          <Link href="/admin/tournaments/dubletter" style={{ textDecoration: "none", alignSelf: "flex-start" }}>
            <CTAPill icon="git-compare">
              Gå gjennom {pl(dublettAntall, "dublett", "dubletter")}
            </CTAPill>
          </Link>
        </div>
      </Kort>
    ) : null;

  const hode = (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
      <div>
        <div data-paper-pattern-topp data-paper-slug="agencyos-turneringer">
          <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg }}>Turneringer</h1>
          <span style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>
            AgencyOS · sesong {sesong} · {pl(antall, "registrert", "registrerte")}
          </span>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "8px 0 0", maxWidth: 460 }}>
          Turneringene stallen din spiller. Send fellesmelding til alle påmeldte med ett klikk.
        </p>
      </div>
      <StatusPill tone={statusTone}>{statusTekst}</StatusPill>
    </div>
  );

  // KPI-rad (fasit): kommende/dekning/synk-hull/dubletter — måler stallens
  // turneringsbilde utover raden av påmeldte turneringer under.
  const kpiRad = (
    <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: T.gap }}>
      <KpiFlis label="Kommende" value={kommende.length} sub={pl(spilte.length, "spilt", "spilte")} />
      <KpiFlis
        label="Påmeldte spillere"
        value={kpi.paameldteSpillere}
        sub={`av ${kpi.stallStorrelse} i stallen`}
      />
      <KpiFlis
        label="Uten kobling"
        value={kpi.utenKobling}
        varsle={kpi.utenKobling > 0}
        sub="resultat mangler spiller"
      />
      <KpiFlis
        label="Mulige dubletter"
        value={dublettAntall}
        varsle={dublettAntall > 0}
        sub="samme dato og bane"
      />
    </div>
  );

  if (antall === 0) {
    return (
      <div data-paper-wave-h="turneringer" data-paper-pattern  style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {hode}
        {kpiRad}
        {dublettBanner}
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
      {kpiRad}
      {dublettBanner}
      {primaerCta}

      <PillTabs
        tabs={[
          { id: "kommende", l: `Kommende · ${kommende.length}` },
          { id: "spilte", l: `Spilte · ${spilte.length}` },
        ]}
        value={fane}
        onChange={(id) => setFane(id as "kommende" | "spilte")}
      />

      {synlige.length === 0 ? (
        <Kort>
          <TomTilstand
            icon="trophy"
            title={fane === "kommende" ? "Ingen kommende turneringer" : "Ingen spilte turneringer ennå"}
            sub={
              fane === "kommende"
                ? "Ingen turneringer i vente denne uka eller senere."
                : "Turneringer som er spilt dukker opp her etter startdato."
            }
          />
        </Kort>
      ) : (
      <Kort pad={mobile ? "4px 16px" : "6px 20px"}>
        {synlige.map((r, i) => (
          <Rad
            key={r.key}
            last={i === synlige.length - 1}
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
      )}
    </div>
  );
}
