/**
 * PlayerHQ · Meg · Utstyr og bag (W3-port).
 *
 * Fasit: designsystem/train-lock/ME-01 Utstyr.dc.html. Komponenten er
 * allerede token-ren (kun TL.*, PX-6 29.08.2026) — Paper-fasit-linjen under
 * er historisk kontekst for §9 tabell + trapp-mønsteret som ble kopiert inn.
 *
 * Tilstander: Bag registrert · Tom. Ingen clay — «Én ting nå: —» i manifestet.
 *
 * Lengdene er MÅLTE snitt fra TrackMan-øktene (beregnGapping, D5), aldri
 * ønsketall. Kølle under måleterskelen viser «—» og stiplet søyle.
 *
 * Ærlige avvik fra fasit-demoen (ingen fabrikkerte data):
 *  - Bagen (EquipmentBag) er seks fritekstfelter og kan ikke maskin-kobles
 *    mot TrackMan-køllenavn (se gapping-data.ts). Flaten viser derfor de
 *    målte køllene og bag-feltene som to ærlige seksjoner, ikke én
 *    sammensmeltet tabell med skaft/loft per målt kølle.
 *  - Kølle-detalj (/utstyr/[kolle]-arket) er ikke bygget — radene er lesing.
 *  - Registrering/endring skjer i den eksisterende bag-flaten
 *    (/portal/meg/utstyrsbag) — «Legg til kølle» lenker dit.
 */

import type { ReactNode } from "react";
import Link from "next/link";

import { TL } from "@/lib/v2/train-lock";

import { MIN_SLAG } from "@/lib/domain/gapping";
import { kortKolleNavn, type UtstyrFlateData, type UtstyrBagFelt } from "@/lib/portal/utstyr-data";
import { PaperPage, PaperTopp, PaperKropp } from "./PaperChrome";
/* ── Lokale byggeklosser (kun T.*) ─────────────────────────────────── */

function Kort({ eyebrow, children }: { eyebrow?: string; children: ReactNode }) {
  return (
    <section
      style={{
        background: TL.elev,
        border: `1px solid ${TL.hair}`,
        borderRadius: TL.radius.card,
        padding: 16,
        minWidth: 0,
      }}
    >
      {eyebrow && (
        <span
          style={{
            display: "block",
            fontFamily: TL.font.mono,
            fontSize: TL.storrelse.capsSm,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: TL.mute,
            marginBottom: 10,
          }}
        >
          {eyebrow}
        </span>
      )}
      {children}
    </section>
  );
}

function Hjelp({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        margin: "10px 0 0",
        fontFamily: TL.font.mono,
        fontSize: 10,
        color: TL.mute,
        letterSpacing: "0.03em",
        lineHeight: 1.5,
      }}
    >
      {children}
    </p>
  );
}

/** Fasitens `.kolle` — rutenettrad: kode · navn/undertekst · mono-verdi. */
function KolleRad({
  kode,
  navn,
  sub,
  verdi,
  ukjent,
  last,
}: {
  kode: string;
  navn: string;
  sub?: string;
  verdi: string;
  ukjent?: boolean;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "44px minmax(0,1fr) 74px",
        gap: 12,
        alignItems: "center",
        minHeight: 48,
        padding: "6px 0",
        borderBottom: last ? "none" : `1px solid ${TL.hair}`,
        minWidth: 0,
      }}
    >
      <span style={{ fontFamily: TL.font.mono, fontSize: 13, fontWeight: 700, color: TL.text }}>{kode}</span>
      <div style={{ minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontFamily: TL.font.sans,
            fontSize: 13,
            color: TL.text,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {navn}
        </span>
        {sub && (
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10, color: TL.mute, marginTop: 1 }}>
            {sub}
          </span>
        )}
      </div>
      <span
        style={{
          fontFamily: TL.font.mono,
          fontSize: 13.5,
          fontWeight: ukjent ? 400 : 600,
          color: ukjent ? TL.mute : TL.text,
          textAlign: "right",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {verdi}
      </span>
    </div>
  );
}

/** Kant-knapp (fasitens `.btn full` — aldri clay på denne skjermen). */
function KnappLenke({ href, children, odId }: { href: string; children: ReactNode; odId: string }) {
  return (
    <Link
      href={href}
      data-od-id={odId}
      className="v2-press v2-focus"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        padding: "12px 18px",
        borderRadius: TL.radius.field,
        border: `1px solid ${TL.hair}`,
        background: TL.elev,
        color: TL.text,
        fontFamily: TL.font.sans,
        fontSize: TL.storrelse.kropp,
        fontWeight: 500,
        textDecoration: "none",
        textAlign: "center",
      }}
    >
      {children}
    </Link>
  );
}

function BagRader({ felter }: { felter: UtstyrBagFelt[] }) {
  return (
    <div>
      {felter.map((f, i) => (
        <KolleRad
          key={f.label}
          kode={f.kort}
          navn={f.verdi}
          sub={f.label}
          verdi="—"
          ukjent
          last={i === felter.length - 1}
        />
      ))}
    </div>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function MegUtstyrV2({ data }: { data: UtstyrFlateData }) {
  const { bagFelter, tilbehor, notater, harBag, koller, gap, vinduDager, okter } = data;

  const harMaalinger = koller.length > 0;
  const tom = !harBag && !harMaalinger;
  const maksMedian = harMaalinger ? Math.max(...koller.map((k) => k.median)) : 0;
  const tynne = koller.filter((k) => k.tynn);

  const sub = harMaalinger
    ? `${koller.length} ${koller.length === 1 ? "kølle" : "køller"} målt på range · siste ${vinduDager} dager`
    : "lengder måles fra TrackMan-øktene dine";

  return (
    <PaperPage odId="playerhq-utstyr">
      <div data-paper-portal-meg-utstyr data-paper-slug="playerhq-utstyr" style={{ display: "contents" }}>
        <PaperTopp tittel="Utstyr" sub={sub} tilbakeHref="/portal/meg/profil" tilbakeLabel="Til profil" />
        <PaperKropp>
          {tom ? (
            <>
              {/* Tom tilstand — fasitens copy, én vei videre (aldri clay her) */}
              <div
                style={{
                  padding: "24px 16px",
                  background: TL.dock,
                  border: `1px dashed ${TL.hair}`,
                  borderRadius: TL.radius.card,
                }}
              >
                <h3 style={{ margin: "0 0 8px", fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>
                  Ingen køller registrert
                </h3>
                <p style={{ margin: "0 0 12px", fontFamily: TL.font.sans, fontSize: 13.5, color: TL.mute, lineHeight: 1.55 }}>
                  Registrer bagen én gang, så kan gameplan foreslå kølle per hull og lengdene
                  fylles automatisk fra TrackMan-øktene dine. Du trenger ikke fylle inn lengder
                  selv.
                </p>
                <KnappLenke href="/portal/meg/utstyrsbag" odId="utstyr-tom-legg-til">
                  Legg til første kølle
                </KnappLenke>
              </div>
              <Kort>
                <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 13.5, color: TL.mute, lineHeight: 1.55 }}>
                  Har du hatt fitting hos AK Golf, kan Anders legge inn bagen for deg. Spør i
                  chatten.
                </p>
              </Kort>
            </>
          ) : (
            <>
              {/* Målt hull i lengdetrappa — fra gapping-flaggingen (D5) */}
              {gap.length > 0 && (
                <div
                  data-od-id="utstyr-gap-varsel"
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "12px 16px",
                    borderRadius: TL.radius.card,
                    background: TL.dim,
                    minWidth: 0,
                  }}
                >
                  <p style={{ flex: 1, minWidth: 0, margin: 0, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, lineHeight: 1.55 }}>
                    <strong style={{ color: TL.text, fontWeight: 600 }}>
                      Hull i lengdetrappa mellom {gap[0].under} og {gap[0].over}.
                    </strong>{" "}
                    {gap[0].meter} meter mellom to køller er mye — ta det med til neste time med
                    Anders.
                  </p>
                </div>
              )}

              {/* Lengdetrapp-modul (ikke egen rute) */}
              {harMaalinger ? (
                <Kort eyebrow="Lengdetrapp · carry-snitt">
                  <div
                    role="img"
                    aria-label={`Carry-snitt per kølle fra ${koller[0].klubb} til ${koller[koller.length - 1].klubb}${tynne.length > 0 ? " — stiplede søyler har for få slag" : ""}`}
                    style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 72, minWidth: 0 }}
                  >
                    {koller.map((k) => (
                      <i
                        key={k.klubb}
                        style={{
                          flex: 1,
                          minWidth: 0,
                          display: "block",
                          height: `${Math.max(10, Math.round((k.median / maksMedian) * 100))}%`,
                          borderRadius: "6px 6px 0 0",
                          background: k.tynn ? "transparent" : TL.dock,
                          border: k.tynn ? `1px dashed ${TL.hair}` : `1px solid ${TL.hair}`,
                          borderBottom: "none",
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 3, marginTop: 4, fontFamily: TL.font.mono, fontSize: 9, color: TL.mute }}>
                    {koller.map((k) => (
                      <span key={k.klubb} style={{ flex: 1, minWidth: 0, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {kortKolleNavn(k.klubb)}
                      </span>
                    ))}
                  </div>
                  <Hjelp>
                    {tynne.length > 0
                      ? `Stiplet = for få slag registrert (${tynne
                          .map((k) => `${k.klubb} har ${k.slag}`)
                          .join(", ")} slag, minst ${MIN_SLAG} kreves).`
                      : `Alle køllene har minst ${MIN_SLAG} målte slag.`}
                  </Hjelp>
                </Kort>
              ) : (
                <Kort eyebrow="Lengdetrapp · carry-snitt">
                  <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 13.5, color: TL.mute, lineHeight: 1.55 }}>
                    Ingen målte lengder ennå. Lengdene fylles automatisk fra TrackMan-øktene
                    dine — ingenting skal tastes inn eller gjettes.
                  </p>
                </Kort>
              )}

              {/* Målte køller — carry-snitt per kølle fra TrackMan */}
              {harMaalinger && (
                <Kort eyebrow={`Målt på range · ${koller.length} ${koller.length === 1 ? "kølle" : "køller"}`}>
                  <div>
                    {[...koller].reverse().map((k, i, alle) => (
                      <KolleRad
                        key={k.klubb}
                        kode={kortKolleNavn(k.klubb)}
                        navn={k.klubb}
                        sub={
                          k.tynn
                            ? `${k.slag} slag registrert · minst ${MIN_SLAG} kreves`
                            : `${k.slag} slag · siste ${vinduDager} dager`
                        }
                        verdi={k.tynn ? "—" : `${k.median} m`}
                        ukjent={k.tynn}
                        last={i === alle.length - 1}
                      />
                    ))}
                  </div>
                  <Hjelp>
                    Lengdene er målte snitt fra {okter} TrackMan-{okter === 1 ? "økt" : "økter"},
                    ikke ønsketall.
                  </Hjelp>
                </Kort>
              )}

              {/* Bagen — fritekstfeltene fra utstyrsbagen */}
              {bagFelter.length > 0 ? (
                <Kort eyebrow="Bagen · fra utstyrsbagen">
                  <BagRader felter={bagFelter} />
                  <Hjelp>
                    Registrert i utstyrsbagen. Lengder kobles ikke hit — de måles per kølle på
                    range, over.
                  </Hjelp>
                </Kort>
              ) : (
                <Kort eyebrow="Bagen">
                  <p style={{ margin: "0 0 12px", fontFamily: TL.font.sans, fontSize: 13.5, color: TL.mute, lineHeight: 1.55 }}>
                    Bagen er ikke registrert ennå. Registrer den én gang, så kan gameplan
                    foreslå kølle per hull.
                  </p>
                  <KnappLenke href="/portal/meg/utstyrsbag" odId="utstyr-bag-registrer">
                    Registrer bagen
                  </KnappLenke>
                </Kort>
              )}

              {/* Ball og tilbehør */}
              {(tilbehor.length > 0 || notater) && (
                <Kort eyebrow="Ball og tilbehør">
                  {tilbehor.length > 0 && <BagRader felter={tilbehor} />}
                  {notater && (
                    <p style={{ margin: tilbehor.length > 0 ? "10px 0 0" : 0, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, lineHeight: 1.55 }}>
                      {notater}
                    </p>
                  )}
                </Kort>
              )}

              {bagFelter.length > 0 && (
                <KnappLenke href="/portal/meg/utstyrsbag" odId="utstyr-legg-til">
                  Legg til eller endre køller
                </KnappLenke>
              )}
              <KnappLenke href="/portal/mal/trackman" odId="utstyr-trackman">
                Se TrackMan-øktene lengdene kommer fra
              </KnappLenke>
            </>
          )}
        </PaperKropp>
      </div>
    </PaperPage>
  );
}
