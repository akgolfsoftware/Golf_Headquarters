"use client";
import { TL } from "@/lib/v2/train-lock";
/**
 * Foreldreportal · Ukerapport (detalj) — v2 Presis + B-pakke.
 * Status først, én grønn CTA, TomTilstand med neste steg. Kun v2 + T.*.
 */

import { useRouter } from "next/navigation";
import type { ForelderUkerapport } from "@/lib/forelder";
import { fmtSg, Caps, Tittel, Kort, KpiFlis, Rad, Icon, TomTilstand, Knapp, StatusPill, HjelpTips } from "@/components/v2";
/* ── Rene hjelpere ─────────────────────────────────────────────────── */

/** «4,5» — komma-desimal for norsk visning. */
function komma(n: number): string {
  return n.toString().replace(".", ",");
}

/** D3 · én linje i ukerapport-kortet: navn til venstre, verdi til høyre. */
function Rapportlinje({ navn, verdi }: { navn: string; verdi: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 12,
        fontFamily: TL.font.sans,
        fontSize: 13,
        color: TL.text,
      }}
    >
      <span style={{ flex: "none" }}>{navn}</span>
      <span style={{ color: TL.mute, textAlign: "right", minWidth: 0 }}>{verdi}</span>
    </div>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function ForelderUkerapportV2({ data }: { data: ForelderUkerapport }) {
  const router = useRouter();
  const {
    childFirstName,
    ukenummer,
    oktFullfort,
    trentTimer,
    ukeSg,
    coachNote,
    hoydepunkt,
  } = data;

  const sgTekst = ukeSg != null ? fmtSg(ukeSg) : "–";
  const trentTekst = trentTimer > 0 ? `${komma(trentTimer)} t` : "–";
  const harAktivitet = oktFullfort > 0 || ukeSg != null;

  return (
    <div data-paper-wave-e="forelder-sub" data-paper-portal-forelder-ukerapport style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, margin: "0 auto", width: "100%" }}>
      {/* Hode + status */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Caps>{`Uke ${ukenummer} · ${childFirstName}`}</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em="uke">Denne</Tittel>
          </div>
        </div>
        <StatusPill tone={harAktivitet ? "up" : "info"}>
          {harAktivitet ? "Aktiv uke" : "Rolig uke"}
        </StatusPill>
      </div>

      {/* D3 · ukerapport-kortet: samme tall og samme nevner som barnets egen
          digest. Delingen er en manuell handling fra coachen, aldri automatikk. */}
      <div
        style={{
          background: TL.elev,
          border: `1px solid ${TL.hair}`,
          borderRadius: TL.radius.card,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <Rapportlinje
          navn="Gjennomført"
          verdi={
            data.etterlevelseTekst
              ? `${data.etterlevelseTekst} ${data.nevnerTekst}`
              : "Ingen økter er forfalt ennå denne uka"
          }
        />
        <Rapportlinje
          navn="Betaling"
          verdi={
            data.utestaendeOre > 0
              ? `${(data.utestaendeOre / 100).toLocaleString("nb-NO")} kr utestående`
              : "ingenting utestående"
          }
        />
        <p
          style={{
            margin: "4px 0 0",
            fontFamily: TL.font.sans,
            fontSize: 12,
            color: TL.mute,
            lineHeight: 1.55,
          }}
        >
          Tallene er de samme som i {childFirstName} sin egen digest — samme nevnere. Du ser
          aldri andre spilleres tall her.
        </p>
      </div>

      {/* Status først — 3 KPI */}
      <div className="grid grid-cols-3" style={{ gap: 16 }}>
        <KpiFlis label="Økter" value={String(oktFullfort)} />
        <KpiFlis label="Trent" value={trentTekst} />
        <KpiFlis
          label={
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              Form
              <HjelpTips k="sgTotal" size={10} />
            </span>
          }
          value={sgTekst}
        />
      </div>

      {/* Én primær CTA (B) */}
      <div>
        <Knapp icon="arrow-right" onClick={() => router.push("/forelder")}>
          Til oversikten
        </Knapp>
      </div>

      {/* Coachens kommentar */}
      <Kort eyebrow="Fra coachen">
        {coachNote ? (
          <div>
            <p
              style={{
                fontFamily: TL.font.sans,
                fontSize: 13.5,
                color: TL.text,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {coachNote.body}
            </p>
            <div style={{ marginTop: 12 }}>
              <Caps size={9}>{`— ${coachNote.author}`}</Caps>
            </div>
          </div>
        ) : (
          <TomTilstand
            icon="message-circle"
            title="Ingen kommentar denne uka"
            sub="Når coachen skriver noe, dukker det opp her."
          />
        )}
      </Kort>

      {/* Ukens høydepunkt */}
      <Kort eyebrow="Ukens høydepunkt">
        {hoydepunkt ? (
          <Rad
            leading={
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: TL.dim,
                  border: `1px solid ${TL.hair}`,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "none",
                }}
              >
                <Icon name="trophy" size={16} style={{ color: TL.fill }} />
              </span>
            }
            title={hoydepunkt.testNavn}
            sub="Beste testresultat"
            trailing={
              <span
                style={{
                  fontFamily: TL.font.mono,
                  fontSize: 16,
                  fontWeight: 700,
                  color: TL.text,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {komma(hoydepunkt.score)}
              </span>
            }
            last
          />
        ) : (
          <TomTilstand
            icon="trophy"
            title="Ingen test denne uka"
            sub="Beste tester dukker opp her når de er logget."
          />
        )}
      </Kort>
    </div>
  );
}
