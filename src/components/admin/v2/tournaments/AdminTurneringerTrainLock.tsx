"use client";

/**
 * AgencyOS Turneringer — Train-lock (T10, 27.08.2026).
 *
 * Fasit: designsystem/train-lock/TU-01 Turneringer.dc.html («Neste starter»
 * — spillerens Analyse-liste). TU-01 er en PlayerHQ-visning, ikke en
 * admin-flate — porten følger CLAUDE.md «Port HTML 1:1: nei. Port
 * oppførsel, hierarki, copy»: TU-01s liste-rad-mønster (tittel/dato-rad
 * med hårlinje, caps-etikett, «tilbake til Meg»-hierarki) er gjenbrukt for
 * AgencyOS' egen turneringsdatabase, med admin-innhold (stall-KPI-er,
 * dublett-varsel, chip-status) i stedet for spillerens personlige starter.
 *
 * Erstatter AdminTurneringerV2 (Paper T.*) på /admin/tournaments. Samme
 * datakontrakt (AdminTurneringV2Row/-Data) og samme server actions/lenker —
 * dette er en designport, ikke en funksjonsendring.
 *
 * A2 (master–detalj): KPI-panelet er konstant på desktop (ingen rad-valg —
 * radene lenker videre til /admin/tournaments/[id], de åpner ikke en
 * inline-detalj slik Godkjenninger gjør).
 *
 * Tokens: KUN TL — CLAUDE.md invariant 2. Chip-status bruker IKKE
 * fargekoding (TL.ok/TL.warn er reservert godkjent/varsel-semantikk,
 * train-lock.ts linje 24) — status vises som nøytral dim-pille med tekst.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { MasterDetalj } from "@/components/v2/inspektorpanel";
import { Icon } from "@/components/v2/icon";
import { TL } from "@/lib/v2/train-lock";
import { TlKnapp, TlRad, TlRadGruppe, TlTomTilstand } from "../oppsett/tl-kit";
import { TlCaps, TlInspektorBlokk, TlInspektorKpi, TlInspektorLinje, TlInspektorpanel } from "../godkjenninger/tl-inspektor";
import type { AdminTurneringerV2Data, AdminTurneringV2Row, TurneringChipTone } from "../AdminTurneringerV2";

export type { AdminTurneringerV2Data, AdminTurneringV2Row, TurneringChipTone };

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

const PRESS =
  "motion-safe:transition-transform motion-safe:duration-[180ms] motion-safe:ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]";

/** Status-pille — nøytral, ingen fargekoding (train-lock.ts §Signal). */
function StatusMerke({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: TL.mute,
        boxShadow: `inset 0 0 0 1px ${TL.hair}`,
        borderRadius: 999,
        padding: "3px 8px",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function FellesmeldingPille({ href, disabled, label, mobile }: { href: string | null; disabled: boolean; label: string; mobile: boolean }) {
  const inner = (
    <span
      className={disabled ? undefined : PRESS}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        borderRadius: 999,
        padding: mobile ? "8px 12px" : "6px 12px",
        fontSize: 11.5,
        fontWeight: 600,
        color: TL.text,
        background: TL.dim,
        whiteSpace: "nowrap",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "default" : "pointer",
      }}
      title={disabled ? label : undefined}
    >
      <Icon name="send" size={13} />
      {!mobile && !disabled && "Fellesmelding"}
    </span>
  );
  if (disabled || !href) return inner;
  return (
    <Link href={href} onClick={(e) => e.stopPropagation()} aria-label={`Send fellesmelding`} style={{ textDecoration: "none" }}>
      {inner}
    </Link>
  );
}

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

function TurneringerITall({ data }: { data: AdminTurneringerV2Data }) {
  const { rader, dublettAntall, kpi } = data;
  const kommende = rader.filter((r) => r.erKommende).length;
  const spilte = rader.length - kommende;
  return (
    <TlInspektorpanel tittel="Turneringer i tall" ariaLabel="Turneringenes tall">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <TlInspektorKpi label="Kommende" verdi={String(kommende)} sub={`${pl(spilte, "spilt", "spilte")}`} />
        <TlInspektorKpi label="Påmeldte spillere" verdi={String(kpi.paameldteSpillere)} sub={`av ${kpi.stallStorrelse} i stallen`} />
        <TlInspektorKpi label="Uten kobling" verdi={String(kpi.utenKobling)} sub="resultat mangler spiller" />
        <TlInspektorKpi label="Mulige dubletter" verdi={String(dublettAntall)} sub="samme dato og bane" />
      </div>

      <TlInspektorBlokk label="Snarveier">
        <Link href="/admin/turnering?fane=kart" style={{ textDecoration: "none" }}>
          <TlInspektorLinje label="Norge-data · dekning og toppliste" verdi="→" />
        </Link>
        {dublettAntall > 0 && (
          <Link href="/admin/turnering?fane=dubletter" style={{ textDecoration: "none" }}>
            <TlInspektorLinje label="Gå gjennom dubletter" verdi={String(dublettAntall)} />
          </Link>
        )}
      </TlInspektorBlokk>
    </TlInspektorpanel>
  );
}

export function AdminTurneringerTrainLock({
  data,
  somFane = false,
}: {
  data: AdminTurneringerV2Data;
  /**
   * MASTERPLAN 15.6: denne komponenten er nå «Mine spillere»-fanen i
   * /admin/turnering. Som fane eier den nye siden overskriften og
   * «Ny turnering»-CTA-en (i toolbaren) — komponentens EGEN kopi av begge
   * skjules da. Lærdom fra 15.1/15.2: en flyttet helside tar med seg sitt
   * eget hode hvis ikke noen eksplisitt slår det av.
   */
  somFane?: boolean;
}) {
  const mobile = useMobile();
  const { sesong, rader, dublettAntall } = data;
  const antall = rader.length;

  const [fane, setFane] = useState<"kommende" | "spilte">("kommende");
  const kommende = rader.filter((r) => r.erKommende);
  const spilte = rader.filter((r) => !r.erKommende);
  const synlige = fane === "kommende" ? kommende : spilte;

  const hode = (
    <div>
      <TlCaps>AgencyOS · sesong {sesong}</TlCaps>
      <h1 style={{ margin: "6px 0 0", fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>Turneringer</h1>
      <p style={{ margin: "8px 0 0", fontSize: 13, color: TL.mute, maxWidth: 460, lineHeight: 1.5 }}>
        Turneringene stallen din spiller. Send fellesmelding til alle påmeldte med ett klikk.
      </p>
    </div>
  );

  const dublettBanner =
    dublettAntall > 0 ? (
      <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        <TlCaps size={10}>Én ting nå</TlCaps>
        <p style={{ margin: 0, fontSize: 13, color: TL.mute, lineHeight: 1.5 }}>
          {dublettAntall === 1
            ? "Én manuelt registrert turnering ser ut til å matche en kjent kilde."
            : `${dublettAntall} manuelt registrerte turneringer ser ut til å matche kjente kilder.`}{" "}
          Slår du dem sammen, samles påmeldinger og resultater på ett sted.
        </p>
        <div>
          <TlKnapp href="/admin/turnering?fane=dubletter" icon="git-compare">
            Gå gjennom {pl(dublettAntall, "dublett", "dubletter")}
          </TlKnapp>
        </div>
      </div>
    ) : null;

  const fanerad = (
    <div role="group" aria-label="Kommende eller spilte" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {(
        [
          { k: "kommende" as const, n: "Kommende", antall: kommende.length },
          { k: "spilte" as const, n: "Spilte", antall: spilte.length },
        ]
      ).map((f) => {
        const aktiv = f.k === fane;
        return (
          <button
            key={f.k}
            type="button"
            aria-pressed={aktiv}
            onClick={() => setFane(f.k)}
            className={PRESS}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              height: 40,
              padding: "0 16px",
              borderRadius: TL.radius.pill,
              background: aktiv ? TL.fill : TL.dim,
              color: aktiv ? TL.onFill : TL.text,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              border: "none",
            }}
          >
            <span>{f.n}</span>
            <span style={{ fontVariantNumeric: "tabular-nums", opacity: 0.75 }}>{f.antall}</span>
          </button>
        );
      })}
    </div>
  );

  const liste =
    antall === 0 ? (
      <TlRadGruppe>
        <TlTomTilstand
          icon="trophy"
          title="Ingen kommende turneringer"
          sub="Opprett en turnering, eller vent til spillere melder seg på — da dukker de opp her."
        />
      </TlRadGruppe>
    ) : synlige.length === 0 ? (
      <TlRadGruppe>
        <TlTomTilstand
          icon="trophy"
          title={fane === "kommende" ? "Ingen kommende turneringer" : "Ingen spilte turneringer ennå"}
          sub={fane === "kommende" ? "Ingen turneringer i vente denne uka eller senere." : "Turneringer som er spilt dukker opp her etter startdato."}
        />
      </TlRadGruppe>
    ) : (
      // TlRad gjør HELE raden til en <a> når href settes — det kolliderer med
      // Fellesmelding-pillens egen lenke (ugyldig nøstet <a>-i-<a>, hydration-
      // feil verifisert i browser 27.08.2026). Kun tittelen er derfor lenke,
      // som i den opprinnelige AdminTurneringerV2 (TurneringTittel).
      <TlRadGruppe>
        {synlige.map((r, i) => (
          <TlRad
            key={r.key}
            last={i === synlige.length - 1}
            title={r.href ? <Link href={r.href} style={{ textDecoration: "none", color: TL.text }}>{r.navn}</Link> : r.navn}
            sub={`${r.datoTekst}${r.anlegg ? ` · ${r.anlegg}` : ""} · ${r.paameldte} påmeldt`}
            trailing={
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                {r.chip && <StatusMerke>{r.chip.label}</StatusMerke>}
                <FellesmeldingPille
                  href={r.href && r.paameldte > 0 ? `${r.href}?fellesmelding=1` : null}
                  disabled={!(r.href && r.paameldte > 0)}
                  label={r.paameldte === 0 ? "Ingen påmeldte deltakere å sende til" : "Ikke tilgjengelig for manuelt registrerte turneringer"}
                  mobile={mobile}
                />
                {r.href && <Icon name="chevron-right" size={16} style={{ color: TL.mute, flex: "none" }} />}
              </span>
            }
            chevron={false}
          />
        ))}
      </TlRadGruppe>
    );

  return (
    <MasterDetalj panel={<TurneringerITall data={data} />}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
        {!somFane && hode}
        {!somFane && (
          <div>
            <TlKnapp href="/admin/tournaments/ny" icon="plus" variant="primaer" full={mobile}>
              Ny turnering
            </TlKnapp>
          </div>
        )}
        {dublettBanner}
        {fanerad}
        {liste}
      </div>
    </MasterDetalj>
  );
}
