"use client";

/**
 * AgencyOS Innboks — én liste, ett detaljpanel (PP-2.2).
 *
 * Fasit: designsystem/paper/fase1/agencyos-innboks.html + -mobil.html.
 * Formen er to kolonner ved siden av rail-en som V2Shell leverer: lista til
 * venstre med filterpiller over, og et 380px detaljpanel til høyre som
 * forklarer og avgjør den valgte saken. Under 1120px blir panelet et bunnark
 * (samme brytepunkt og samme ArtefaktPanel som konsollen, PP-2.1).
 *
 * INGENTING ER SLETTET fra den gamle TriageV2. Hver blokk er flyttet:
 *   Avvik/Venter/Spørsmål-kortene → filterpillene + én felles liste
 *   KPI-flisene (Saker/Avvik/Godkjenninger) → tallene i pillene
 *   det brede oransje båndet        → clay på «Godkjenn og send» for øverste sak
 *   InnsiktChip                     → detaljpanelets grunnlag, per sak
 *   Tilbakemeldinger-kortet         → saker av typen «Fra spiller»
 *   de fem fanene (KoHubNav)        → pillene; rutene lever videre og nås fra
 *                                     ⌘K og fra «Åpne i …» på hver sak
 *
 * Clay-regelen (fasitens kommentar ved .btn.now): den oransje flaten er ÉN
 * konkret handling på ÉN konkret sak — godkjenn-knappen på øverste åpne sak.
 * Alle andre knapper er blekk.
 *
 * Avvik fra fasiten, bevisst: fasitens ti-sekunders «Angre» finnes ikke her.
 * En godkjent PlanAction kjører faktisk planendringen, og systemet har ingen
 * omvendt operasjon — en angre-knapp som ikke angrer er verre enn ingen.
 * Løste saker havner i «Løst»-filteret med tidsstempel, og panelet peker på
 * neste sak, slik fasitens løst-tilstand gjør.
 */

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { Icon } from "@/components/v2/icon";
import { ArtefaktPanel, useErMobil } from "@/components/portal/v2/chat/ArtefaktPanel";
import { avgjorInnboksSak } from "@/app/admin/innboks/actions";
import type { InnboksData, InnboksSak, InnboksSakType } from "@/lib/admin/innboks-saker";

const IKON: Record<InnboksSakType, string> = {
  forslag: "arrow-up",
  "forespørsel": "message-square",
  drift: "clock",
  varsel: "info",
};

type FilterKey = "alle" | "godkjenn" | "spiller" | "drift" | "lost";

const FILTRE: { k: FilterKey; n: string; f: (s: InnboksSak) => boolean }[] = [
  { k: "alle", n: "Alle", f: (s) => !s.lost },
  { k: "godkjenn", n: "Trenger godkjenning", f: (s) => s.type === "forslag" && !s.lost },
  { k: "spiller", n: "Fra spiller", f: (s) => s.type === "forespørsel" && !s.lost },
  { k: "drift", n: "Drift", f: (s) => (s.type === "drift" || s.type === "varsel") && !s.lost },
  { k: "lost", n: "Løst", f: (s) => s.lost },
];

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

export function InnboksSaker({ data }: { data: InnboksData }) {
  const mobil = useErMobil();
  const router = useRouter();
  const [filter, setFilter] = useState<FilterKey>("alle");
  const [valgtId, setValgtId] = useState<string | null>(data.saker.find((s) => !s.lost)?.id ?? null);
  const [arkApent, setArkApent] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const rader = useMemo(
    () => data.saker.filter(FILTRE.find((f) => f.k === filter)!.f),
    [data.saker, filter],
  );
  const valgt = data.saker.find((s) => s.id === valgtId) ?? null;
  /** «Én ting nå» — øverste åpne sak etter loaderens rekkefølge. */
  const enTingNaId = data.saker.find((s) => !s.lost)?.id ?? null;

  function velg(sak: InnboksSak) {
    setValgtId(sak.id);
    setFeil(null);
    if (mobil) setArkApent(true);
  }

  function avgjor(sak: InnboksSak, valg: "godkjenn" | "avvis", grunn?: string) {
    setFeil(null);
    startTransition(async () => {
      const res = await avgjorInnboksSak(sak.id, valg, grunn);
      if (!res.ok) {
        setFeil(res.feil ?? "Handlingen gikk ikke gjennom.");
        return;
      }
      // Neste åpne sak overtar markøren — sløyfen skal ikke stoppe på en
      // ferdig sak (fasitens «Neste sak» i .dfoot).
      const neste = data.saker.find((s) => !s.lost && s.id !== sak.id);
      setValgtId(neste?.id ?? null);
      if (mobil) setArkApent(false);
      router.refresh();
    });
  }

  const detalj = (
    <InnboksDetalj
      sak={valgt}
      erEnTingNa={valgt != null && valgt.id === enTingNaId}
      pending={pending}
      feil={feil}
      onAvgjor={avgjor}
      onNeste={() => {
        const neste = data.saker.find((s) => !s.lost);
        if (neste) velg(neste);
      }}
    />
  );

  return (
    <div
      data-paper-slug="agencyos-innboks"
      data-od-id="agencyos-innboks"
      style={{
        display: "grid",
        gridTemplateColumns: mobil ? "1fr" : "minmax(0,1fr) 380px",
        alignItems: "start",
        gap: mobil ? 0 : 16,
        minHeight: 0,
      }}
    >
      {/* ══ Lista ══ */}
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0, background: T.bg }}>
        <header
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 10,
            padding: "10px 16px",
            background: T.bg,
            borderBottom: `1px solid ${T.border}`,
            position: "sticky",
            top: 0,
            zIndex: 5,
          }}
        >
          <div style={{ minWidth: 0, flex: "1 1 180px" }}>
            <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg }}>
              Innboks
            </h1>
            <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>
              {pl(data.apne, "åpen sak", "åpne saker")} · {data.dagLabel}
            </div>
          </div>
          {mobil && valgt && (
            <button
              type="button"
              onClick={() => setArkApent(true)}
              className="v2-press v2-focus"
              data-od-id="inn-open-sheet"
              style={{
                minHeight: 44,
                padding: "0 12px",
                borderRadius: T.rTag,
                border: `1px solid ${T.border}`,
                background: T.panel,
                color: T.fg,
                fontFamily: T.ui,
                fontSize: 12.5,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Se grunnlaget
            </button>
          )}
        </header>

        {/* ── Filterpiller (fasitens .filters) ── */}
        <div
          role="group"
          aria-label="Filtre"
          style={{
            display: "flex",
            gap: 8,
            padding: "12px 16px",
            borderBottom: `1px solid ${T.borderS}`,
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          {FILTRE.map((f) => {
            const n = data.saker.filter(f.f).length;
            const aktiv = f.k === filter;
            return (
              <button
                key={f.k}
                type="button"
                aria-pressed={aktiv}
                onClick={() => setFilter(f.k)}
                className="v2-press v2-focus"
                data-od-id={`inn-filter-${f.k}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  minHeight: 44,
                  padding: "0 16px",
                  flex: "none",
                  borderRadius: T.rPill,
                  border: `1px solid ${aktiv ? T.fg : T.border}`,
                  background: aktiv ? T.fg : T.panel,
                  color: aktiv ? T.bg : T.fg,
                  fontFamily: T.ui,
                  fontSize: 12.5,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <span>{f.n}</span>
                <span style={{ fontFamily: T.mono, fontSize: 11, opacity: 0.7 }}>{n}</span>
              </button>
            );
          })}
        </div>

        {/* ── Radene ── */}
        <div role="list" aria-label="Saker" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {rader.length === 0 ? (
            <TomListe
              filter={filter}
              apne={data.apne}
              onAlle={() => setFilter("alle")}
            />
          ) : (
            rader.map((s) => (
              <SakRad
                key={s.id}
                sak={s}
                valgt={s.id === valgtId}
                onClick={() => velg(s)}
              />
            ))
          )}
        </div>
      </div>

      {/* ══ Detaljpanel — fast kolonne på desktop, bunnark på mobil ══ */}
      {mobil ? (
        <ArtefaktPanel
          mobil
          open={arkApent}
          onClose={() => setArkApent(false)}
          tittel={valgt?.tittel ?? "Grunnlag"}
        >
          {detalj}
        </ArtefaktPanel>
      ) : (
        <div
          style={{
            position: "sticky",
            top: 16,
            maxHeight: "calc(100dvh - 32px)",
            minWidth: 0,
            display: "flex",
            borderRadius: T.rCard,
            overflow: "hidden",
            border: `1px solid ${T.border}`,
          }}
        >
          <ArtefaktPanel mobil={false} open onClose={() => undefined} tittel={valgt?.tittel ?? "Grunnlag"}>
            {detalj}
          </ArtefaktPanel>
        </div>
      )}
    </div>
  );
}

/** Fasitens .row — ikon · tittel/undertekst/etiketter · frist. */
function SakRad({ sak, valgt, onClick }: { sak: InnboksSak; valgt: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="listitem"
      aria-current={valgt}
      onClick={onClick}
      className="v2-press v2-focus"
      data-od-id={`inn-rad-${sak.id}`}
      style={{
        display: "grid",
        gridTemplateColumns: "34px minmax(0,1fr) auto",
        gap: 12,
        width: "100%",
        textAlign: "left",
        padding: "12px 16px",
        alignItems: "start",
        background: T.panel,
        border: `1px solid ${valgt ? T.fg : T.border}`,
        boxShadow: valgt ? `inset 3px 0 0 ${T.fg}` : undefined,
        borderRadius: T.rCard,
        cursor: "pointer",
        opacity: sak.lost ? 0.62 : 1,
      }}
    >
      <span
        style={{
          width: 34,
          height: 34,
          display: "grid",
          placeItems: "center",
          borderRadius: T.rTag,
          background: T.panel2,
          color: T.mut,
        }}
      >
        <Icon name={IKON[sak.type]} size={16} />
      </span>

      <span style={{ minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontFamily: T.ui,
            fontSize: 13.5,
            fontWeight: 600,
            color: T.fg,
            marginBottom: 2,
            textDecoration: sak.lost ? "line-through" : undefined,
          }}
        >
          {sak.tittel}
        </span>
        <span
          style={{
            fontFamily: T.bodyFont,
            fontSize: 12.5,
            color: T.mut,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {sak.sub}
        </span>
        <span style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          <Etikett>{sak.type}</Etikett>
          <Etikett>{sak.hvem}</Etikett>
          {sak.lostTekst && <Etikett tone="up">{sak.lostTekst}</Etikett>}
        </span>
      </span>

      <span
        style={{
          fontFamily: T.mono,
          fontSize: 11,
          color: sak.snart && !sak.lost ? T.down : T.mut,
          whiteSpace: "nowrap",
        }}
      >
        {sak.frist}
      </span>
    </button>
  );
}

function Etikett({ children, tone }: { children: React.ReactNode; tone?: "up" }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 8px",
        borderRadius: T.rPill,
        fontFamily: T.mono,
        fontSize: 10,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        background: T.panel2,
        color: tone === "up" ? T.up : T.mut,
        border: `1px solid ${T.border}`,
      }}
    >
      {children}
    </span>
  );
}

/** Fasitens .empty — én vei videre, aldri en blindvei. */
function TomListe({ filter, apne, onAlle }: { filter: FilterKey; apne: number; onAlle: () => void }) {
  const løst = filter === "lost";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 12,
        padding: "32px 24px",
        background: T.panel2,
        border: `1px dashed ${T.border}`,
        borderRadius: T.rCard,
      }}
    >
      <h3 style={{ margin: 0, fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>
        {løst ? "Ingenting er løst ennå" : filter === "alle" ? "Innboksen er tom" : "Ingenting her"}
      </h3>
      <p style={{ margin: 0, maxWidth: "44ch", fontFamily: T.bodyFont, fontSize: 13.5, color: T.mut }}>
        {løst
          ? "Saker du godkjenner eller avviser havner her, med tidsstempel."
          : filter === "alle"
            ? "Ingen saker trenger deg akkurat nå."
            : `Ingen saker treffer dette filteret. Det ligger ${pl(apne, "åpen sak", "åpne saker")} i innboksen.`}
      </p>
      {filter !== "alle" && (
        <button
          type="button"
          onClick={onAlle}
          className="v2-press v2-focus"
          data-od-id="inn-empty-alle"
          style={{
            minHeight: 44,
            padding: "0 16px",
            borderRadius: T.rCard,
            border: `1px solid ${T.border}`,
            background: "transparent",
            color: T.fg,
            fontFamily: T.ui,
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Vis alle
        </button>
      )}
    </div>
  );
}

/**
 * Fasitens .detail — bundet til valgt rad, aldri hardkodet.
 * Gjelder · anbefalingskontrakt (kun forslag) · grunnlag · handlinger.
 */
function InnboksDetalj({
  sak,
  erEnTingNa,
  pending,
  feil,
  onAvgjor,
  onNeste,
}: {
  sak: InnboksSak | null;
  erEnTingNa: boolean;
  pending: boolean;
  feil: string | null;
  onAvgjor: (sak: InnboksSak, valg: "godkjenn" | "avvis", grunn?: string) => void;
  onNeste: () => void;
}) {
  const [avvisModus, setAvvisModus] = useState(false);
  const [grunn, setGrunn] = useState("");

  if (!sak) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h3 style={{ margin: 0, fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>
          Velg en sak
        </h3>
        <p style={{ margin: 0, fontFamily: T.bodyFont, fontSize: 13.5, color: T.mut }}>
          Trykk en rad i lista for å se grunnlaget og avgjøre den.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
      <Blokk label="gjelder">
        {sak.hvem} · {sak.frist}
      </Blokk>

      {sak.kontrakt ? (
        <div
          style={{
            border: `1px solid ${T.border}`,
            borderRadius: T.rCard,
            overflow: "hidden",
          }}
        >
          {(
            [
              ["Hvorfor", sak.kontrakt.hvorfor],
              ["Hva", sak.kontrakt.hva],
              ["Forventet effekt", sak.kontrakt.effekt],
              ["Hvorfor nå", sak.kontrakt.hvorforNa],
            ] as const
          ).map(([k, v], i, arr) => (
            <div
              key={k}
              style={{
                padding: "12px 16px",
                borderBottom: i === arr.length - 1 ? undefined : `1px solid ${T.borderS}`,
              }}
            >
              <span
                style={{
                  display: "block",
                  fontFamily: T.mono,
                  fontSize: 9.5,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  color: T.mut,
                  marginBottom: 3,
                }}
              >
                {k}
              </span>
              <span
                style={{
                  fontFamily: T.bodyFont,
                  fontSize: 13,
                  color: v ? T.fg : T.mut,
                  fontStyle: v ? undefined : "italic",
                }}
              >
                {v ?? "Ikke oppgitt av agenten."}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <Blokk label="hva dette er">{sak.sub}</Blokk>
      )}

      {sak.grunnlag.length > 0 && (
        <div
          style={{
            background: T.panel2,
            border: `1px solid ${T.borderS}`,
            borderRadius: T.rCard,
            padding: "12px 16px",
          }}
        >
          <span
            style={{
              display: "block",
              fontFamily: T.mono,
              fontSize: 10,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              color: T.mut,
              marginBottom: 8,
            }}
          >
            grunnlag
          </span>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {sak.grunnlag.map((g, i) => (
              <li key={i} style={{ fontFamily: T.mono, fontSize: 11.5, color: T.mut, marginBottom: 4 }}>
                {g}
              </li>
            ))}
          </ul>
        </div>
      )}

      {sak.href && sak.hrefTekst && (
        <Link
          href={sak.href}
          data-od-id="inn-apne-flate"
          className="v2-focus"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            alignSelf: "flex-start",
            minHeight: 44,
            padding: "0 16px",
            borderRadius: T.rCard,
            border: `1px solid ${T.border}`,
            color: T.fg,
            textDecoration: "none",
            fontFamily: T.ui,
            fontSize: 13,
          }}
        >
          {sak.hrefTekst}
          <Icon name="arrow-right" size={15} />
        </Link>
      )}

      {feil && (
        <p
          role="alert"
          style={{ margin: 0, fontFamily: T.ui, fontSize: 12.5, color: T.down }}
        >
          {feil}
        </p>
      )}

      {/* ── Handlinger (fasitens .dfoot) ── */}
      {sak.lost ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span
            style={{
              fontFamily: T.mono,
              fontSize: 10,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              color: T.mut,
            }}
          >
            {sak.lostTekst ?? "løst"}
          </span>
          <button
            type="button"
            onClick={onNeste}
            className="v2-press v2-focus"
            data-od-id="inn-neste"
            style={knappStil({ fyll: "ink" })}
          >
            Neste sak
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {avvisModus && sak.sekundaer?.krevGrunn && (
            <input
              value={grunn}
              onChange={(e) => setGrunn(e.target.value)}
              placeholder="Grunn til avvisning (valgfri)"
              data-od-id="inn-avvis-grunn"
              style={{
                minHeight: 44,
                padding: "0 14px",
                borderRadius: T.rInput,
                border: `1px solid ${T.border}`,
                background: T.panel,
                color: T.fg,
                fontFamily: T.ui,
                fontSize: 13,
              }}
            />
          )}
          <div style={{ display: "flex", gap: 8 }}>
            {sak.sekundaer && (
              <button
                type="button"
                disabled={pending}
                data-od-id="inn-avvis"
                className="v2-press v2-focus"
                onClick={() => {
                  if (sak.sekundaer?.krevGrunn && !avvisModus) {
                    setAvvisModus(true);
                    return;
                  }
                  onAvgjor(sak, "avvis", grunn);
                  setAvvisModus(false);
                  setGrunn("");
                }}
                style={{ ...knappStil({ fyll: "omriss" }), flex: 1 }}
              >
                {sak.sekundaer.label}
              </button>
            )}
            {sak.primaer && (
              <button
                type="button"
                disabled={pending}
                data-od-id="inn-godkjenn"
                data-paper-en-ting={erEnTingNa ? "true" : undefined}
                className="v2-press v2-focus"
                onClick={() => onAvgjor(sak, "godkjenn")}
                style={{ ...knappStil({ fyll: erEnTingNa ? "clay" : "ink" }), flex: 1 }}
              >
                {sak.primaer.label}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Blokk({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span
        style={{
          display: "block",
          fontFamily: T.mono,
          fontSize: 10,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          color: T.mut,
          marginBottom: 8,
        }}
      >
        {label}
      </span>
      <p style={{ margin: 0, fontFamily: T.bodyFont, fontSize: 13.5, color: T.fg }}>{children}</p>
    </div>
  );
}

/** Fasitens .btn / .btn.ink / .btn.now. Clay kun der «Én ting nå» gjelder. */
function knappStil({ fyll }: { fyll: "omriss" | "ink" | "clay" }): React.CSSProperties {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: fyll === "clay" ? 48 : 44,
    padding: fyll === "clay" ? "0 24px" : "0 16px",
    borderRadius: T.rCard,
    fontFamily: T.ui,
    fontSize: 13,
    fontWeight: fyll === "clay" ? 600 : 500,
    cursor: "pointer",
    whiteSpace: "nowrap",
  };
  if (fyll === "clay")
    return { ...base, background: T.handling, color: T.onHandling, border: `1px solid ${T.handling}` };
  if (fyll === "ink")
    return { ...base, background: T.cta, color: T.onCta, border: `1px solid ${T.cta}` };
  return { ...base, background: "transparent", color: T.fg, border: `1px solid ${T.border}` };
}
