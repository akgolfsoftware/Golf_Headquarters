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
import { TL } from "@/lib/v2/train-lock";

import { Icon } from "@/components/v2/icon";
import { useToppbarHoyde } from "@/components/v2/toppbar-hoyde";
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
  // Sticky toppbar over dokumentrullen — publiser høyden (toppbar-hoyde.tsx).
  const toppRef = useToppbarHoyde<HTMLElement>();
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
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0, background: TL.scene }}>
        <header
          ref={toppRef}
          data-paper-topp
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 10,
            padding: "10px 16px",
            background: TL.scene,
            borderBottom: `1px solid ${TL.hair}`,
            position: "sticky",
            top: 0,
            zIndex: 5,
          }}
        >
          <div style={{ minWidth: 0, flex: "1 1 180px" }}>
            <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>
              Innboks
            </h1>
            <div style={{ fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>
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
                borderRadius: TL.radius.row,
                border: `1px solid ${TL.hair}`,
                background: TL.elev,
                color: TL.text,
                fontFamily: TL.font.sans,
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
            borderBottom: `1px solid ${TL.hair}`,
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
                  borderRadius: TL.radius.pill,
                  border: `1px solid ${aktiv ? TL.text : TL.hair}`,
                  background: aktiv ? TL.text : TL.elev,
                  color: aktiv ? TL.scene : TL.text,
                  fontFamily: TL.font.sans,
                  fontSize: 12.5,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <span>{f.n}</span>
                <span style={{ fontFamily: TL.font.mono, fontSize: 11, opacity: 0.7 }}>{n}</span>
              </button>
            );
          })}
        </div>

        {/* ── Radene ── */}
        <div role="list" aria-label="Saker" style={{ padding: mobil ? "16px 16px 132px" : 16, display: "flex", flexDirection: "column", gap: 8 }}>
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

      {/* ── «Én ting nå» — sticky bunn-CTA på mobil (fasitens .bunn i
          agencyos-innboks-mobil.html): peker alltid på øverste ubehandlede
          sak. Skjules når arket er åpent (clay-monopolet — arket eier da
          Godkjenn-knappen). ── */}
      {mobil && !arkApent && (
        <div
          data-od-id="inn-bunn-cta"
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: "calc(72px + env(safe-area-inset-bottom) + var(--ak-cookie-h, 0px))",
            zIndex: 30,
            padding: "12px 16px",
            borderTop: `1px solid ${TL.hair}`,
            background: TL.elev,
          }}
        >
          {(() => {
            const sak = data.saker.find((s) => !s.lost) ?? null;
            if (!sak)
              return (
                <>
                  <span style={{ display: "block", fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, marginBottom: 8 }}>
                    Innboksen er tom. Ingenting venter på deg.
                  </span>
                  <Link
                    href="/admin/kalender"
                    className="v2-press v2-focus"
                    data-od-id="inn-bunn-kalender"
                    style={{ ...knappStil({ fyll: "omriss" }), width: "100%", textDecoration: "none" }}
                  >
                    Åpne kalenderen
                  </Link>
                </>
              );
            return (
              <>
                <span style={{ display: "block", fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, marginBottom: 8 }}>
                  Øverste ubehandlede sak: {sak.tittel}
                </span>
                <button
                  type="button"
                  onClick={() => velg(sak)}
                  className="v2-press v2-focus"
                  data-od-id="inn-one-thing-now"
                  style={{ ...knappStil({ fyll: "clay" }), width: "100%" }}
                >
                  {sak.type === "forslag" ? "Se grunnlaget og godkjenn" : "Åpne saken"}
                </button>
              </>
            );
          })()}
        </div>
      )}

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
            borderRadius: TL.radius.card,
            overflow: "hidden",
            border: `1px solid ${TL.hair}`,
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
        background: TL.elev,
        border: `1px solid ${valgt ? TL.text : TL.hair}`,
        boxShadow: valgt ? `inset 3px 0 0 ${TL.text}` : undefined,
        borderRadius: TL.radius.card,
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
          borderRadius: TL.radius.row,
          background: TL.dock,
          color: TL.mute,
        }}
      >
        <Icon name={IKON[sak.type]} size={16} />
      </span>

      <span style={{ minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontFamily: TL.font.sans,
            fontSize: 13.5,
            fontWeight: 600,
            color: TL.text,
            marginBottom: 2,
            textDecoration: sak.lost ? "line-through" : undefined,
          }}
        >
          {sak.tittel}
        </span>
        <span
          style={{
            fontFamily: TL.font.sans,
            fontSize: 12.5,
            color: TL.mute,
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
          fontFamily: TL.font.mono,
          fontSize: 11,
          color: sak.snart && !sak.lost ? TL.danger : TL.mute,
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
        borderRadius: TL.radius.pill,
        fontFamily: TL.font.mono,
        fontSize: 10,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        background: TL.dock,
        color: tone === "up" ? TL.ok : TL.mute,
        border: `1px solid ${TL.hair}`,
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
        background: TL.dock,
        border: `1px dashed ${TL.hair}`,
        borderRadius: TL.radius.card,
      }}
    >
      <h3 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>
        {løst ? "Ingenting er løst ennå" : filter === "alle" ? "Innboksen er tom" : "Ingenting her"}
      </h3>
      <p style={{ margin: 0, maxWidth: "44ch", fontFamily: TL.font.sans, fontSize: 13.5, color: TL.mute }}>
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
            borderRadius: TL.radius.card,
            border: `1px solid ${TL.hair}`,
            background: "transparent",
            color: TL.text,
            fontFamily: TL.font.sans,
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
        <h3 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>
          Velg en sak
        </h3>
        <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 13.5, color: TL.mute }}>
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
            border: `1px solid ${TL.hair}`,
            borderRadius: TL.radius.card,
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
                borderBottom: i === arr.length - 1 ? undefined : `1px solid ${TL.hair}`,
              }}
            >
              <span
                style={{
                  display: "block",
                  fontFamily: TL.font.mono,
                  fontSize: 9.5,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  color: TL.mute,
                  marginBottom: 3,
                }}
              >
                {k}
              </span>
              <span
                style={{
                  fontFamily: TL.font.sans,
                  fontSize: 13,
                  color: v ? TL.text : TL.mute,
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

      {/* Kun Sak (Jarvis-triage) setter foreslattSvar — AI-skrevet
          svarutkast. Vist rått, ikke redigerbart her: Anders redigerer i
          Gmail-kladden etter Godkjenn, ikke i AgencyOS. */}
      {sak.foreslattSvar && sak.foreslattSvar.trim() && (
        <div
          style={{
            border: `1px solid ${TL.hair}`,
            borderRadius: TL.radius.card,
            padding: "12px 16px",
            background: TL.dock,
          }}
        >
          <span
            style={{
              display: "block",
              fontFamily: TL.font.mono,
              fontSize: 9.5,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              color: TL.mute,
              marginBottom: 6,
            }}
          >
            Foreslått svar
          </span>
          <p
            style={{
              margin: 0,
              fontFamily: TL.font.sans,
              fontSize: 13,
              color: TL.text,
              whiteSpace: "pre-wrap",
            }}
          >
            {sak.foreslattSvar}
          </p>
        </div>
      )}

      {sak.grunnlag.length > 0 && (
        <div
          style={{
            background: TL.dock,
            border: `1px solid ${TL.hair}`,
            borderRadius: TL.radius.card,
            padding: "12px 16px",
          }}
        >
          <span
            style={{
              display: "block",
              fontFamily: TL.font.mono,
              fontSize: 10,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              color: TL.mute,
              marginBottom: 8,
            }}
          >
            grunnlag
          </span>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {sak.grunnlag.map((g, i) => (
              <li key={i} style={{ fontFamily: TL.font.mono, fontSize: 11.5, color: TL.mute, marginBottom: 4 }}>
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
            borderRadius: TL.radius.card,
            border: `1px solid ${TL.hair}`,
            color: TL.text,
            textDecoration: "none",
            fontFamily: TL.font.sans,
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
          style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 12.5, color: TL.danger }}
        >
          {feil}
        </p>
      )}

      {/* ── Handlinger (fasitens .dfoot) ── */}
      {sak.lost ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span
            style={{
              fontFamily: TL.font.mono,
              fontSize: 10,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              color: TL.mute,
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
                borderRadius: TL.radius.field,
                border: `1px solid ${TL.hair}`,
                background: TL.elev,
                color: TL.text,
                fontFamily: TL.font.sans,
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
          fontFamily: TL.font.mono,
          fontSize: 10,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          color: TL.mute,
          marginBottom: 8,
        }}
      >
        {label}
      </span>
      <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 13.5, color: TL.text }}>{children}</p>
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
    borderRadius: TL.radius.card,
    fontFamily: TL.font.sans,
    fontSize: 13,
    fontWeight: fyll === "clay" ? 600 : 500,
    cursor: "pointer",
    whiteSpace: "nowrap",
  };
  if (fyll === "clay")
    return { ...base, background: TL.fill, color: TL.onFill, border: `1px solid ${TL.fill}` };
  if (fyll === "ink")
    return { ...base, background: TL.fill, color: TL.onFill, border: `1px solid ${TL.fill}` };
  return { ...base, background: "transparent", color: TL.text, border: `1px solid ${TL.hair}` };
}
