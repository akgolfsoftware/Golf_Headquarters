"use client";

/**
 * Foreldreportal · hovedside — Paper-port PP-3 (fase 1).
 * Fasit: designsystem/paper/fase1/foreldreportal.html.
 *
 * ÉN skjerm med fem faner: Oversikt · Samtykker · Betaling · Plan · Kontakt,
 * tellebadge på Samtykker og Betaling. «Én ting nå» prioriterer utestående
 * faktura FORAN manglende samtykke (penger først, jf. fasitens kommentar).
 *
 * Fasitens tre prinsipper som ikke er kosmetikk, beholdt ordrett i ånd:
 *  1. Helsedata vises ikke — foresatt gir samtykket, ser ikke innholdet.
 *  2. Spilleren eier planen — ingen godkjenn-knapp på treningsinnhold.
 *  3. Ett samtykke er ikke alle — hvert samtykke er sitt eget valg.
 *
 * Ærlig-prinsippet: samtykkerader vises kun når datamodellen bærer dem
 * (lyd-raden utelates når ingen LydSamtykke-rad finnes). Ingen fabrikkerte
 * betalingsflyter — detaljark lenker videre til de eksisterende underrutene,
 * som består uendret og lenkes mindre fremtredende under «Mer».
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  T,
  Kort,
  Knapp,
  StatusPill,
  TomTilstand,
  BunnArk,
} from "@/components/v2";
import { Icon } from "@/components/v2/icon";

/* ── Datakontrakt (bygges server-side i src/app/forelder/page.tsx) ──── */

export type ForelderSamtykkeItem = {
  k: string;
  navn: string;
  gitt: boolean;
  /** Formatert dato («12.08.2024») — null når ikke gitt. */
  dato: string | null;
  /** Hva samtykket faktisk gjelder (for lyd: ordlyden fra LydSamtykke-raden). */
  d: string;
  kanTrekke: boolean;
  /** Vises når samtykket ikke kan endres her (fasitens laasGrunn). */
  laasGrunn?: string;
  /** Fasitens merknad (helse: «du ser ikke innholdet»). */
  merknad?: string;
  /** Underpunkter til detaljarket (helse: de fire formålene). */
  detaljer?: { navn: string; gitt: boolean }[];
};

export type ForelderFakturaItem = {
  id: string;
  tekst: string;
  belopKr: string;
  /** «betalt» · «utestående» · «feilet» · «refundert» */
  status: string;
  utestaaende: boolean;
  dato: string;
};

export type ForelderPlanRad = {
  id: string;
  /** «man 4.8» */
  dag: string;
  tittel: string;
  /** «Gamle Fredrikstad GK · 90 min» — null når data mangler. */
  sub: string | null;
};

export type ForelderPortalData = {
  childFirstName: string;
  childName: string;
  klubb: string | null;
  coachNavn: string | null;
  coachEpost: string | null;
  samtykker: ForelderSamtykkeItem[];
  fakturaer: ForelderFakturaItem[];
  /** Sum utestående, formatert («1 300 kr») — null når ingenting utestår. */
  utestaaendeSum: string | null;
  utestaaendeAntall: number;
  abonnement: { plan: string; status: string; periodeSlutt: string | null } | null;
  uke: ForelderPlanRad[];
  sisteMelding: { title: string; body: string | null; dato: string } | null;
  initialFane: string;
};

const FANER = [
  { k: "oversikt", n: "Oversikt" },
  { k: "samtykker", n: "Samtykker" },
  { k: "betaling", n: "Betaling" },
  { k: "plan", n: "Plan" },
  { k: "kontakt", n: "Kontakt" },
] as const;

type FaneKey = (typeof FANER)[number]["k"];

/* ── Småbiter ────────────────────────────────────────────────────────── */

/** Fasitens `.kilde`-linje — hvilke tabeller kortet leser fra. */
function Kilde({ k }: { k: string }) {
  return (
    <span
      style={{
        display: "block",
        fontFamily: T.mono,
        fontSize: 9,
        color: T.mut,
        letterSpacing: "0.04em",
        marginBottom: 10,
      }}
    >
      kilde: {k}
    </span>
  );
}

/** Fasitens `.rad` — nøkkel/verdi-rad med hårlinje. */
function InfoRad({
  k,
  v,
  sub,
  last,
}: {
  k: string;
  v: string | null;
  sub?: string;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 0",
        borderBottom: last ? "none" : `1px solid ${T.border}`,
        fontSize: 13.5,
        minWidth: 0,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <span style={{ fontFamily: T.ui, color: T.fg }}>{k}</span>
        {sub && (
          <span style={{ display: "block", fontSize: 11.5, color: T.mut, fontFamily: T.bodyFont }}>
            {sub}
          </span>
        )}
      </div>
      {v != null && (
        <span
          style={{
            marginLeft: "auto",
            fontFamily: T.mono,
            fontSize: 13,
            textAlign: "right",
            flex: "none",
            color: T.fg,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {v}
        </span>
      )}
    </div>
  );
}

/** Fasitens `.merk` — dempet notisboks, valgfritt med lås-ikon. */
function Merk({ laas, children }: { laas?: boolean; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: "12px 16px",
        background: T.panel2,
        border: `1px solid ${T.border}`,
        borderRadius: T.rCard,
        minWidth: 0,
      }}
    >
      <Icon
        name={laas ? "lock" : "info"}
        size={16}
        style={{ color: laas ? T.down : T.mut, flex: "none", marginTop: 2 }}
      />
      <p style={{ margin: 0, fontFamily: T.bodyFont, fontSize: 12.5, color: T.mut, lineHeight: 1.55 }}>
        {children}
      </p>
    </div>
  );
}

/** Fasitens `.lenkerad` — mindre fremtredende navigasjon til underrutene. */
function LenkeRad({
  tekst,
  sub,
  href,
  last,
}: {
  tekst: string;
  sub?: string;
  href: string;
  last?: boolean;
}) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push(href)}
      className="v2-press v2-focus"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        textAlign: "left",
        padding: "10px 0",
        border: 0,
        borderBottom: last ? "none" : `1px solid ${T.border}`,
        background: "transparent",
        cursor: "pointer",
        fontSize: 13.5,
        minHeight: 44,
        color: T.fg,
        minWidth: 0,
      }}
    >
      <div style={{ minWidth: 0 }}>
        {tekst}
        {sub && (
          <span style={{ display: "block", fontSize: 11.5, color: T.mut, fontFamily: T.bodyFont }}>
            {sub}
          </span>
        )}
      </div>
      <Icon name="chevron-right" size={15} style={{ marginLeft: "auto", color: T.mut, flex: "none" }} />
    </button>
  );
}

/** Statusprikk + tekst for et samtykke (fasitens `.samtykke .status`). */
function SamtykkeStatusTekst({ gitt, dato }: { gitt: boolean; dato: string | null }) {
  return (
    <span
      style={{
        marginLeft: "auto",
        flex: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: T.mono,
        fontSize: 10.5,
        color: T.mut,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 7,
          height: 7,
          borderRadius: 9999,
          background: gitt ? T.up : T.down,
        }}
      />
      {gitt ? (dato ? `gitt ${dato}` : "gitt") : "mangler"}
    </span>
  );
}

/* ── Skjerm ──────────────────────────────────────────────────────────── */

export function ForelderV2({ data }: { data: ForelderPortalData }) {
  const router = useRouter();
  const gyldigInit = FANER.some((f) => f.k === data.initialFane)
    ? (data.initialFane as FaneKey)
    : "oversikt";
  const [fane, setFane] = useState<FaneKey>(gyldigInit);
  const [arkSamtykke, setArkSamtykke] = useState<ForelderSamtykkeItem | null>(null);
  const [arkFaktura, setArkFaktura] = useState<ForelderFakturaItem | null>(null);

  const manglende = data.samtykker.filter((s) => !s.gitt);
  const utestaaende = data.fakturaer.filter((f) => f.utestaaende);
  const fornavn = data.childFirstName;

  const initialer = data.childName
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  /* «Én ting nå» — utestående faktura foran manglende samtykke (penger først). */
  function renderEnTingNa() {
    const f = utestaaende[0] ?? null;
    if (f || data.utestaaendeAntall > 0) {
      return (
        <div
          style={{
            background: T.handlingSoft,
            border: `1px solid ${T.border}`,
            borderLeft: `3px solid ${T.handling}`,
            borderRadius: T.rCard,
            padding: 16,
          }}
        >
          <span
            style={{
              fontFamily: T.mono,
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              color: T.handling,
            }}
          >
            Én ting nå
          </span>
          <h2 style={{ margin: "4px 0 8px", fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>
            {f
              ? `${f.tekst} — ${f.belopKr} utestående`
              : `${data.utestaaendeAntall} utestående ${data.utestaaendeAntall === 1 ? "faktura" : "fakturaer"}`}
          </h2>
          <p style={{ margin: "0 0 12px", fontFamily: T.bodyFont, fontSize: 13, color: T.mut, lineHeight: 1.55 }}>
            {data.utestaaendeSum
              ? `Totalt ${data.utestaaendeSum} utestående. Blir det stående ubetalt, kan abonnementet stanses — og da mister ${fornavn} både øktene og PlayerHQ.`
              : `Blir det stående ubetalt, kan abonnementet stanses — og da mister ${fornavn} både øktene og PlayerHQ.`}
          </p>
          <Knapp
            full
            icon="credit-card"
            onClick={() => {
              if (f) setArkFaktura(f);
              else router.push("/forelder/okonomi");
            }}
          >
            {f ? `Se faktura · ${f.belopKr}` : "Se betalingene"}
          </Knapp>
        </div>
      );
    }
    const s = manglende[0];
    if (s) {
      return (
        <div
          style={{
            background: T.handlingSoft,
            border: `1px solid ${T.border}`,
            borderLeft: `3px solid ${T.handling}`,
            borderRadius: T.rCard,
            padding: 16,
          }}
        >
          <span
            style={{
              fontFamily: T.mono,
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              color: T.handling,
            }}
          >
            Én ting nå
          </span>
          <h2 style={{ margin: "4px 0 8px", fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>
            {s.navn} mangler
          </h2>
          <p style={{ margin: "0 0 12px", fontFamily: T.bodyFont, fontSize: 13, color: T.mut, lineHeight: 1.55 }}>
            {s.d}
          </p>
          <Knapp full icon="shield" onClick={() => router.push("/forelder/samtykke")}>
            Gå til samtykke
          </Knapp>
        </div>
      );
    }
    return null;
  }

  /* ── Faner (innhold) ─────────────────────────────────────────────── */

  function renderOversikt() {
    const neste = data.uke[0] ?? null;
    return (
      <>
        {renderEnTingNa()}

        <Kort eyebrow="Spilleren">
          <Kilde k="users, parent_relations" />
          <InfoRad k="Navn" v={data.childName} />
          {data.klubb && <InfoRad k="Klubb" v={data.klubb} />}
          {data.coachNavn && <InfoRad k="Coach" v={data.coachNavn} />}
          <InfoRad k="Din rolle" v="foresatt" last />
        </Kort>

        <Kort eyebrow="Status">
          <Kilde k="lyd_samtykker, helse_samtykker, payments" />
          <InfoRad
            k="Samtykker"
            v={manglende.length ? `${manglende.length} mangler` : "alle gitt"}
          />
          <InfoRad
            k="Betaling"
            v={
              data.utestaaendeAntall
                ? `${data.utestaaendeAntall} utestående`
                : "ingen utestående"
            }
          />
          <InfoRad
            k="Neste økt"
            v={neste ? neste.dag : "ingen planlagt"}
            sub={neste ? neste.tittel : undefined}
            last
          />
        </Kort>

        {/* Grensen sies rett ut — uten dette ser fraværet av helsedata ut som en feil. */}
        <Merk laas>
          Du ser status, betaling og plan. Du ser ikke helsedata, notatene coachen
          skriver om {fornavn}, eller innholdet i samtalene deres. Det er hans.
        </Merk>

        <Kort eyebrow="Mer">
          <LenkeRad tekst="Ukerapport" sub="Form, økter og trend" href="/forelder/ukerapport" />
          <LenkeRad tekst="Barn" sub="Profil og detaljer" href="/forelder/barn" />
          <LenkeRad tekst="Bookinger" sub="Kommende timer" href="/forelder/bookinger" />
          <LenkeRad tekst="Varsler" sub="Siste aktivitet" href="/forelder/varsler" />
          <LenkeRad tekst="Innstillinger" href="/forelder/innstillinger" last />
        </Kort>
      </>
    );
  }

  function renderSamtykker() {
    return (
      <>
        <Kort eyebrow="Samtykker">
          <Kilde k="lyd_samtykker, helse_samtykker, parent_relations" />
          <p style={{ margin: "0 0 4px", fontFamily: T.bodyFont, fontSize: 13, color: T.mut, lineHeight: 1.55 }}>
            Selvstendige valg. Hvert av dem gjelder én ting, og hvert av dem kan
            stå alene.
          </p>
          {data.samtykker.map((s, i) => (
            <div
              key={s.k}
              style={{
                padding: "12px 0",
                borderBottom: i === data.samtykker.length - 1 ? "none" : `1px solid ${T.border}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 28, minWidth: 0 }}>
                <span style={{ fontSize: 13.5, fontWeight: 500, color: T.fg, minWidth: 0 }}>{s.navn}</span>
                <SamtykkeStatusTekst gitt={s.gitt} dato={s.dato} />
              </div>
              <p style={{ margin: "4px 0 8px", fontFamily: T.bodyFont, fontSize: 12.5, color: T.mut, lineHeight: 1.55 }}>
                {s.d}
              </p>
              {s.merknad && (
                <div style={{ marginBottom: 8 }}>
                  <Merk laas>{s.merknad}</Merk>
                </div>
              )}
              {s.kanTrekke || !s.gitt ? (
                <Knapp
                  ghost
                  icon="chevron-right"
                  onClick={() => setArkSamtykke(s)}
                  style={{ minHeight: 40, fontSize: 13 }}
                >
                  {s.gitt ? "Detaljer og endring" : "Detaljer — gi samtykke"}
                </Knapp>
              ) : (
                s.laasGrunn && <Merk laas>{s.laasGrunn}</Merk>
              )}
            </div>
          ))}
        </Kort>
        <Kort eyebrow="Mer">
          <LenkeRad
            tekst="Full samtykkeside"
            sub="Gi, endre og eksporter samtykker"
            href="/forelder/samtykke"
            last
          />
        </Kort>
      </>
    );
  }

  function renderBetaling() {
    return (
      <>
        <Kort eyebrow="Fakturaer">
          <Kilde k="payments, subscriptions" />
          {data.fakturaer.length === 0 ? (
            <TomTilstand
              icon="credit-card"
              title="Ingen fakturaer ennå"
              sub="Første faktura kommer når abonnementet starter."
            />
          ) : (
            data.fakturaer.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setArkFaktura(f)}
                className="v2-press v2-focus"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 12px",
                  marginBottom: 8,
                  background: T.panel2,
                  border: `1px solid ${T.border}`,
                  borderLeft: f.utestaaende ? `3px solid ${T.down}` : `1px solid ${T.border}`,
                  borderRadius: T.rCard,
                  cursor: "pointer",
                  minHeight: 44,
                  fontSize: 13.5,
                  color: T.fg,
                  minWidth: 0,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  {f.tekst}
                  <span style={{ display: "block", fontFamily: T.bodyFont, fontSize: 11.5, color: T.mut }}>
                    {f.dato} · {f.status}
                  </span>
                </div>
                <span
                  style={{
                    marginLeft: "auto",
                    fontFamily: T.mono,
                    fontSize: 13,
                    flex: "none",
                    fontVariantNumeric: "tabular-nums",
                    color: f.utestaaende ? T.down : T.fg,
                  }}
                >
                  {f.belopKr}
                </span>
              </button>
            ))
          )}
        </Kort>

        {data.abonnement && (
          <Kort eyebrow="Abonnement">
            <Kilde k="subscriptions" />
            <InfoRad k="Plan" v={data.abonnement.plan} />
            <InfoRad k="Status" v={data.abonnement.status} />
            {data.abonnement.periodeSlutt && (
              <InfoRad k="Neste periode" v={data.abonnement.periodeSlutt} />
            )}
            <LenkeRad
              tekst="Hele økonomioversikten"
              sub="Abonnement, historikk og detaljer"
              href="/forelder/okonomi"
              last
            />
          </Kort>
        )}
        {!data.abonnement && (
          <Kort eyebrow="Mer">
            <LenkeRad
              tekst="Hele økonomioversikten"
              sub="Abonnement, historikk og detaljer"
              href="/forelder/okonomi"
              last
            />
          </Kort>
        )}
      </>
    );
  }

  function renderPlan() {
    return (
      <>
        <Kort eyebrow="Denne uka">
          <Kilde k="training_plans, bookings" />
          <p style={{ margin: "0 0 12px", fontFamily: T.bodyFont, fontSize: 13, color: T.mut, lineHeight: 1.55 }}>
            Slik ser uka til {fornavn} ut. Du ser den — du endrer den ikke.
          </p>
          {data.uke.length === 0 ? (
            <TomTilstand
              icon="calendar"
              title="Ingen økter denne uka"
              sub={`Når ${fornavn} har planlagte økter eller timer, ser du dem her.`}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.uke.map((o) => (
                <div
                  key={o.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: 12,
                    background: T.panel2,
                    border: `1px solid ${T.border}`,
                    borderLeft: `3px solid ${T.info}`,
                    borderRadius: T.rCard,
                    fontSize: 13,
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      fontFamily: T.mono,
                      fontSize: 11.5,
                      color: T.mut,
                      flex: "none",
                      minWidth: 64,
                    }}
                  >
                    {o.dag}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontWeight: 500, color: T.fg }}>{o.tittel}</span>
                    {o.sub && (
                      <span style={{ display: "block", fontFamily: T.bodyFont, fontSize: 12, color: T.mut }}>
                        {o.sub}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Kort>

        {/* Ingen godkjenn-knapp. Spilleren eier planen sin. */}
        <Merk>
          {fornavn} styrer planen sin selv, sammen med coachen. Er du uenig i noe,
          ta det opp med coachen — det løses i samtale, ikke med en knapp her.
        </Merk>
      </>
    );
  }

  function renderKontakt() {
    return (
      <>
        <Kort eyebrow="Kontakt Anders">
          <Kilde k="users, bookings" />
          {data.coachNavn ? (
            <>
              <InfoRad k="Coach" v={data.coachNavn} />
              {data.coachEpost && <InfoRad k="E-post" v={data.coachEpost} last={!data.coachEpost} />}
              <LenkeRad
                tekst="Meldinger og kontakt"
                sub="Siste melding og kontaktinfo"
                href="/forelder/coach"
                last
              />
            </>
          ) : (
            <TomTilstand
              icon="message-circle"
              title="Ingen coach koblet ennå"
              sub={`Når ${fornavn} har en booking med coach, ser du kontaktinfo her.`}
            />
          )}
        </Kort>

        {data.sisteMelding && (
          <Kort eyebrow="Siste melding">
            <Kilde k="notifications" />
            <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut, display: "block", marginBottom: 6 }}>
              {data.sisteMelding.dato}
            </span>
            <span style={{ display: "block", fontSize: 13.5, fontWeight: 500, color: T.fg }}>
              {data.sisteMelding.title}
            </span>
            {data.sisteMelding.body && (
              <p style={{ margin: "6px 0 0", fontFamily: T.bodyFont, fontSize: 13, color: T.mut, lineHeight: 1.6 }}>
                {data.sisteMelding.body}
              </p>
            )}
          </Kort>
        )}
      </>
    );
  }

  /* ── Render ──────────────────────────────────────────────────────── */

  return (
    <div
      data-paper-slug="foreldreportal"
      data-od-id="foreldreportal"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: T.gap,
        maxWidth: 720,
        margin: "0 auto",
        width: "100%",
        minWidth: 0,
      }}
    >
      {/* Fasitens .topp — barnets initialer + navn + foresatt-linje */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <span
          aria-hidden
          style={{
            width: 48,
            height: 48,
            borderRadius: 9999,
            flex: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: T.panel2,
            border: `1px solid ${T.border}`,
            fontFamily: T.mono,
            fontSize: 15,
            fontWeight: 600,
            color: T.mut,
          }}
        >
          {initialer}
        </span>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg }}>
            {data.childName}
          </h1>
          <span style={{ display: "block", fontFamily: T.mono, fontSize: 11, color: T.mut, marginTop: 2 }}>
            du er registrert som foresatt
          </span>
        </div>
      </div>

      {/* Faner — chips med tellebadge på Samtykker og Betaling */}
      <div
        role="tablist"
        aria-label="Visning"
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          scrollbarWidth: "none",
          paddingBottom: 2,
          minWidth: 0,
        }}
      >
        {FANER.map((f) => {
          const aktiv = f.k === fane;
          const badge =
            f.k === "samtykker"
              ? manglende.length
              : f.k === "betaling"
                ? data.utestaaendeAntall
                : 0;
          return (
            <button
              key={f.k}
              type="button"
              role="tab"
              aria-selected={aktiv}
              onClick={() => setFane(f.k)}
              className="v2-press v2-focus"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                minHeight: 44,
                padding: "0 16px",
                fontSize: 12.5,
                fontFamily: T.ui,
                background: aktiv ? T.cta : T.panel,
                color: aktiv ? T.onCta : T.fg,
                flex: "none",
                border: `1px solid ${aktiv ? T.cta : T.border}`,
                borderRadius: 9999,
                cursor: "pointer",
              }}
            >
              {f.n}
              {badge > 0 && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "1px 7px",
                    borderRadius: 9999,
                    fontFamily: T.mono,
                    fontSize: 10,
                    background: aktiv ? T.onCta : T.panel2,
                    color: T.down,
                    border: `1px solid ${T.border}`,
                  }}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: T.gap, minWidth: 0 }}>
        {fane === "oversikt" && renderOversikt()}
        {fane === "samtykker" && renderSamtykker()}
        {fane === "betaling" && renderBetaling()}
        {fane === "plan" && renderPlan()}
        {fane === "kontakt" && renderKontakt()}
      </div>

      {/* Bunn-ark: samtykke-detalj */}
      <BunnArk
        open={arkSamtykke !== null}
        onClose={() => setArkSamtykke(null)}
        tittel={arkSamtykke?.navn}
      >
        {arkSamtykke && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <StatusPill tone={arkSamtykke.gitt ? "up" : "warn"}>
                {arkSamtykke.gitt
                  ? arkSamtykke.dato
                    ? `Gitt ${arkSamtykke.dato}`
                    : "Gitt"
                  : "Mangler"}
              </StatusPill>
            </div>
            <p style={{ margin: 0, fontFamily: T.bodyFont, fontSize: 13.5, color: T.fg2, lineHeight: 1.6 }}>
              {arkSamtykke.d}
            </p>
            {arkSamtykke.detaljer && arkSamtykke.detaljer.length > 0 && (
              <div>
                {arkSamtykke.detaljer.map((d, i) => (
                  <div
                    key={d.navn}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 0",
                      borderBottom:
                        i === (arkSamtykke.detaljer?.length ?? 0) - 1
                          ? "none"
                          : `1px solid ${T.border}`,
                      fontSize: 13,
                      color: T.fg,
                    }}
                  >
                    {d.navn}
                    <SamtykkeStatusTekst gitt={d.gitt} dato={null} />
                  </div>
                ))}
              </div>
            )}
            {arkSamtykke.merknad && <Merk laas>{arkSamtykke.merknad}</Merk>}
            <Knapp
              full
              icon="shield"
              onClick={() => {
                setArkSamtykke(null);
                router.push("/forelder/samtykke");
              }}
            >
              {arkSamtykke.gitt ? "Endre på samtykkesiden" : "Gi samtykke på samtykkesiden"}
            </Knapp>
          </div>
        )}
      </BunnArk>

      {/* Bunn-ark: faktura-detalj */}
      <BunnArk
        open={arkFaktura !== null}
        onClose={() => setArkFaktura(null)}
        tittel={arkFaktura ? `Faktura · ${arkFaktura.tekst}` : undefined}
      >
        {arkFaktura && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 8 }}>
            <div>
              <InfoRad k="Beløp" v={arkFaktura.belopKr} />
              <InfoRad k="Status" v={arkFaktura.status} />
              <InfoRad k="Dato" v={arkFaktura.dato} last />
            </div>
            <Merk>
              Betalingen går via Stripe. Ingen kortopplysninger lagres hos AK Golf.
            </Merk>
            <Knapp
              full
              icon="credit-card"
              onClick={() => {
                setArkFaktura(null);
                router.push("/forelder/okonomi");
              }}
            >
              Til betalingsoversikten
            </Knapp>
          </div>
        )}
      </BunnArk>
    </div>
  );
}
