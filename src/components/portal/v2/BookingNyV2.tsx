"use client";
import { TL } from "@/lib/v2/train-lock";
/**
 * BookingNyV2 — v2-port (retning C) av credit-wizarden /portal/booking/ny.
 *
 * Fasit: designsystem/train-lock/BO-01 Booking ledige luker.dc.html
 * (slot-grid-steget).
 *
 * RESTYLING ONLY: samme query-drevne steg-modell som legacy-siden
 * (?service=&dato= → steg 1/2/3), samme URL-kontrakter (tjeneste-/dato-lenker
 * på /portal/booking/ny, slot-lenker til /portal/booking/ny/bekreft?service=
 * &start=&coach=) og samme datologikk — kun v2-komponenter/-tokens er nytt.
 * All booking-/credit-logikk bor uendret i server-pagen og src/lib/booking/.
 *
 * Dato-strengene i lenkene (toISOString().split("T")[0]) og klokkeslett-
 * formateringen er bevisst byte-identiske med legacy _components/dato-velger +
 * slot-grid — URL-kontrakten mot serveren skal ikke røres i denne porten.
 *
 * Tom-tilstanden under (linje ~410, TomTilstand) dekker GAP-1 «BO-01
 * Booking tom» (Fasit: designsystem/train-lock/GAP-1 Tilstander.dc.html).
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { Caps, Tittel, Kort, TomTilstand, Icon, HjelpTips } from "@/components/v2";
import { CreditMeter } from "@/components/portal/abonnement/credit-meter";
const WIZARD = "/portal/booking/ny";

/* ── Datakontrakt (alt serialiserbart — server-pagen eier queries/format) ── */

export type NyTjeneste = {
  id: string;
  slug: string;
  navn: string;
  varighetMin: number;
  prisOre: number;
  beskrivelse: string | null;
  /** Oppløst lokasjonsnavn for kortet (null → ingen sted-meta). */
  stedNavn: string | null;
};

export type NySlot = {
  /** slot.start.toISOString() fra availability-engine — brukes UENDRET i bekreft-lenken. */
  startIso: string;
  coachId: string;
  coachNavn: string;
};

export type BookingNyV2Data = {
  /** «credits» = forhåndsbetalte timer (som før). «betaling» = betal per time med kort. */
  modus: "credits" | "betaling";
  /** Hvorfor betaling-modus: VALGT (?betaling=1), BRUKT_OPP, INGEN_PAKKE. Null i credits-modus. */
  betalingGrunn: "VALGT" | "BRUKT_OPP" | "INGEN_PAKKE" | null;
  tjenester: NyTjeneste[];
  valgtServiceId: string;
  valgtServiceNavn: string;
  valgtServiceVarighetMin: number;
  valgtServicePrisOre: number;
  /** Rå ?dato=-queryverdi (brukes uendret i tjeneste-lenkene). */
  datoParam: string | null;
  serviceParamSatt: boolean;
  /** valgtDato.toISOString() — kun til aktiv-sammenligning i dag-stripa. */
  valgtDatoIso: string;
  /** «fredag 17. juli» — formatert på serveren, som i legacy. */
  valgtDatoLang: string;
  aktivtSteg: 1 | 2 | 3;
  isFree: boolean;
  slots: NySlot[];
  creditsRemaining: number;
  monthlyCredits: number;
  /** «Fornyer · 01. aug» — formatert på serveren. Null uten periodeslutt. */
  fornyerLabel: string | null;
  /** Oppløst sted for valgt tjeneste (steg 3-oppsummeringen). */
  stedNavn: string | null;
  saldoEtter: number;
  sisteCredit: boolean;
};

/** true på klient etter mount når viewport < 768px (styrer kun tetthet). */
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

/* ── Steg-prikker (passiv fremdrift — navigasjonen skjer via lenkene) ────── */

function StegPrikker({ aktivt, steg }: {
  aktivt: number;
  steg: { nr: number; label: string; ferdig: boolean }[];
}) {
  return (
    <ol style={{ display: "flex", alignItems: "center", gap: 8, listStyle: "none", margin: 0, padding: 0 }}>
      {steg.map((s, i) => {
        const erAktivt = s.nr === aktivt;
        return (
          <li key={s.nr} style={{ display: "flex", flex: i < steg.length - 1 ? 1 : "none", alignItems: "center", gap: 8 }}>
            <span style={{ width: 22, height: 22, borderRadius: 9999, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none", fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, background: erAktivt ? TL.fill : s.ferdig ? "color-mix(in srgb, var(--tl-fill) 12%, transparent)" : TL.dock, color: erAktivt ? TL.onFill : s.ferdig ? TL.fill : TL.mute, border: `1px solid ${erAktivt ? "transparent" : s.ferdig ? "color-mix(in srgb, var(--tl-fill) 25%, transparent)" : TL.hair}` }}>
              {s.ferdig ? <Icon name="check" size={11} /> : s.nr}
            </span>
            <span style={{ fontFamily: TL.font.sans, fontSize: 12, fontWeight: 600, color: erAktivt ? TL.text : s.ferdig ? TL.mute : TL.mute, whiteSpace: "nowrap" }}>{s.label}</span>
            {i < steg.length - 1 && <span style={{ flex: 1, height: 1, background: s.ferdig ? "color-mix(in srgb, var(--tl-fill) 30%, transparent)" : TL.hair }} />}
          </li>
        );
      })}
    </ol>
  );
}

/* ── Steg-overskrift («1 · Velg tjeneste») ───────────────────────────────── */

function StegTittel({ nr, children }: { nr: number; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
      <span style={{ fontFamily: TL.font.mono, fontSize: 13, fontWeight: 700, color: TL.fill }}>{nr}</span>
      <span style={{ fontFamily: TL.font.sans, fontSize: 18, fontWeight: 700, color: TL.text, letterSpacing: "-0.01em" }}>{children}</span>
    </div>
  );
}

/* ── Dag-stripe (14 dager) — datologikk byte-identisk med legacy ─────────── */

const UKEDAG = ["Sø", "Ma", "Ti", "On", "To", "Fr", "Lø"];

function DagStripe({ valgtDatoIso, serviceSlug, dager, ekstraQuery }: {
  valgtDatoIso: string;
  serviceSlug: string;
  dager: number;
  /** «&betaling=1» i betaling-modus — holder modusen gjennom hele wizarden. */
  ekstraQuery: string;
}) {
  const valgtDato = new Date(valgtDatoIso);
  const idag = new Date();
  idag.setHours(0, 0, 0, 0);

  const datoer: Date[] = [];
  for (let i = 0; i < dager; i++) {
    const d = new Date(idag);
    d.setDate(idag.getDate() + i);
    datoer.push(d);
  }

  return (
    <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6 }}>
      {datoer.map((d) => {
        const aktiv =
          d.getFullYear() === valgtDato.getFullYear() &&
          d.getMonth() === valgtDato.getMonth() &&
          d.getDate() === valgtDato.getDate();
        const iso = d.toISOString().split("T")[0];
        return (
          <Link
            key={iso}
            href={`${WIZARD}?service=${serviceSlug}&dato=${iso}${ekstraQuery}`}
            scroll={false}
            className="v2-press v2-focus"
            style={{ display: "flex", minWidth: 60, flex: "none", flexDirection: "column", alignItems: "center", gap: 1, padding: "8px 0 9px", borderRadius: 12, textDecoration: "none", background: aktiv ? TL.fill : TL.dock, border: `1px solid ${aktiv ? "transparent" : TL.hair}` }}
          >
            <span style={{ fontFamily: TL.font.mono, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: aktiv ? TL.onFill : TL.mute }}>
              {UKEDAG[d.getDay()]}
            </span>
            <span style={{ fontFamily: TL.font.mono, fontSize: 15, fontWeight: 700, color: aktiv ? TL.onFill : TL.text, fontVariantNumeric: "tabular-nums" }}>
              {d.getDate()}
            </span>
            <span style={{ fontFamily: TL.font.mono, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: aktiv ? TL.onFill : TL.mute }}>
              {d.toLocaleDateString("nb-NO", { month: "short" })}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

/* ── Slot-lenker gruppert per coach — href-kontrakt identisk med legacy ──── */

function SlotLenker({ slots, serviceSlug, ekstraQuery }: { slots: NySlot[]; serviceSlug: string; ekstraQuery: string }) {
  const perCoach = new Map<string, { coachNavn: string; slots: { startIso: string }[] }>();
  for (const s of slots) {
    const eksisterende = perCoach.get(s.coachId);
    if (eksisterende) eksisterende.slots.push({ startIso: s.startIso });
    else perCoach.set(s.coachId, { coachNavn: s.coachNavn, slots: [{ startIso: s.startIso }] });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {Array.from(perCoach.entries()).map(([coachId, gruppe]) => (
        <div key={coachId}>
          <Caps size={9}>{gruppe.coachNavn}</Caps>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))", gap: 6, marginTop: 10 }}>
            {gruppe.slots.map((s) => {
              const klokke = new Date(s.startIso).toLocaleTimeString("nb-NO", {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <Link
                  key={s.startIso}
                  href={`${WIZARD}/bekreft?service=${serviceSlug}&start=${encodeURIComponent(s.startIso)}&coach=${coachId}${ekstraQuery}`}
                  className="v2-press v2-focus"
                  style={{ display: "flex", minHeight: 44, alignItems: "center", justifyContent: "center", fontFamily: TL.font.mono, fontSize: 12.5, fontWeight: 700, color: TL.text, textDecoration: "none", background: TL.dock, border: `1px solid ${TL.hair}`, borderRadius: 10, fontVariantNumeric: "tabular-nums" }}
                >
                  {klokke}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Oppsummeringsrad (steg 3) ───────────────────────────────────────────── */

function OppsumRad({ label, verdi, mono, last }: { label: React.ReactNode; verdi: string; mono?: boolean; last?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "11px 0", borderBottom: last ? "none" : `1px solid ${TL.hair}` }}>
      <Caps size={9}>{label}</Caps>
      <span style={{ textAlign: "right", fontSize: mono ? 12.5 : 13.5, fontWeight: mono ? 700 : 600, color: TL.text, fontFamily: mono ? TL.font.mono : TL.font.sans, fontVariantNumeric: mono ? "tabular-nums" : undefined }}>
        {verdi}
      </span>
    </div>
  );
}

/* ── Skjerm ──────────────────────────────────────────────────────────────── */

export function BookingNyV2({ data }: { data: BookingNyV2Data }) {
  const mobile = useMobile();
  const {
    modus, betalingGrunn,
    tjenester, valgtServiceId, valgtServiceNavn, valgtServiceVarighetMin,
    valgtServicePrisOre,
    datoParam, serviceParamSatt, valgtDatoIso, valgtDatoLang, aktivtSteg,
    isFree, slots, creditsRemaining, monthlyCredits, fornyerLabel,
    stedNavn, saldoEtter, sisteCredit,
  } = data;
  const valgtSlug = tjenester.find((t) => t.id === valgtServiceId)?.slug ?? "";
  const erBetaling = modus === "betaling";
  const betalingQ = erBetaling ? "&betaling=1" : "";

  return (
    <div style={{ width: "100%", maxWidth: 680, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Hode */}
      <div>
        <Caps>PlayerHQ · Book ny time</Caps>
        <div style={{ marginTop: 10 }}>
          {erBetaling ? (
            <Tittel mobile={mobile} em="per time.">Betal</Tittel>
          ) : (
            <Tittel mobile={mobile} em="månedens timer.">Bruk</Tittel>
          )}
        </div>
        <p style={{ fontFamily: TL.font.sans, fontSize: 13.5, color: TL.mute, lineHeight: 1.6, margin: "10px 0 0" }}>
          {erBetaling
            ? betalingGrunn === "BRUKT_OPP"
              ? "Månedens timer er brukt opp — denne timen betales med kort. Velg tjeneste og tid på ett sted."
              : betalingGrunn === "VALGT"
                ? "Drop-in mot betaling — abonnementstimene dine røres ikke. Velg tjeneste og tid på ett sted."
                : "Timen betales med kort — ingen coaching-pakke kreves. Velg tjeneste og tid på ett sted."
            : `${creditsRemaining} av ${monthlyCredits} timer igjen denne måneden. Velg tjeneste og tid på ett sted.`}
        </p>
      </div>

      {/* Steg-prikker */}
      <StegPrikker
        aktivt={aktivtSteg}
        steg={[
          { nr: 1, label: "Tjeneste", ferdig: serviceParamSatt },
          { nr: 2, label: "Tid", ferdig: !!datoParam && aktivtSteg === 3 },
          { nr: 3, label: "Bekreft", ferdig: false },
        ]}
      />

      {/* Free-gate — kun i credits-modus; betal-per-time er åpent for TALENT. */}
      {isFree && !erBetaling && (
        <Kort>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <span style={{ width: 38, height: 38, borderRadius: 12, flex: "none", background: `color-mix(in srgb, ${TL.warn} 12%, transparent)`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="lock" size={16} style={{ color: TL.warn }} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: TL.font.sans, fontSize: 15, fontWeight: 700, color: TL.text }}>Booking krever Pro</div>
              <p style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, lineHeight: 1.55, margin: "5px 0 0" }}>
                Free-konto: oppgrader til Pro eller et aktivt coaching-abonnement for å bruke forhåndsbetalte timer.
              </p>
              <Link href="/portal/meg/abonnement" style={{ textDecoration: "none", display: "inline-block", marginTop: 12 }}>
                <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 48, width: "100%", padding: "10px 16px",
            borderRadius: 10, background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600,
          }}>Oppgrader til Pro</span>
              </Link>
            </div>
          </div>
        </Kort>
      )}

      {/* Credit-saldo — kun steg 1, jf. fasit (saldo-banneret lever inne i
          data-vis="steg1"; fra steg 2 erstattes den av saldo-linjen i
          kontekst-kortet under). */}
      {aktivtSteg === 1 && !erBetaling && (
        <Kort tint eyebrow="Min saldo" action={fornyerLabel ? <Caps size={9}>Fornyer · {fornyerLabel}</Caps> : undefined}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontFamily: TL.font.mono, fontSize: 40, fontWeight: 700, color: TL.text, lineHeight: 0.9, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
              {creditsRemaining}
            </span>
            <span style={{ fontFamily: TL.font.mono, fontSize: 14, fontWeight: 600, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
              / {monthlyCredits} igjen
            </span>
          </div>
          <div style={{ marginTop: 12 }}>
            <CreditMeter remaining={creditsRemaining} total={monthlyCredits} showLabel={false} />
          </div>
        </Kort>
      )}

      {/* Steg 1 — tjeneste (fasit: data-vis="steg1" — skjules helt fra steg 2,
          erstattet av kontekst-kortet under). */}
      {aktivtSteg === 1 && (
      <section>
        <StegTittel nr={1}>Velg tjeneste</StegTittel>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {tjenester.map((s) => {
            const aktiv = s.id === valgtServiceId;
            return (
              <Link
                key={s.id}
                href={`${WIZARD}?service=${s.slug}${datoParam ? `&dato=${datoParam}` : ""}${betalingQ}`}
                scroll={false}
                aria-pressed={aktiv}
                className="v2-press v2-focus"
                style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 18px", borderRadius: TL.radius.card, textDecoration: "none", background: aktiv ? `${TL.dim}, ${TL.elev}` : TL.elev, border: `1px solid ${aktiv ? "color-mix(in srgb, var(--tl-fill) 35%, transparent)" : TL.hair}` }}
              >
                <span aria-hidden style={{ width: 20, height: 20, marginTop: 1, borderRadius: 9999, flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", background: aktiv ? TL.fill : "transparent", border: aktiv ? "1px solid transparent" : `1px solid ${TL.hair}` }}>
                  {aktiv && <Icon name="check" size={12} style={{ color: TL.onFill }} />}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ fontFamily: TL.font.sans, fontSize: 15, fontWeight: 700, color: TL.text }}>{s.navn}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, flex: "none", fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, color: TL.mute }}>
                      <Icon name="clock" size={11} style={{ color: TL.mute }} />
                      {s.varighetMin} min
                    </span>
                  </div>
                  {s.beskrivelse && (
                    <p style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, lineHeight: 1.5, margin: "4px 0 0" }}>{s.beskrivelse}</p>
                  )}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 7 }}>
                    <span style={{ fontFamily: TL.font.mono, fontSize: 11.5, fontWeight: 700, color: aktiv ? TL.fill : TL.text, fontVariantNumeric: "tabular-nums" }}>
                      {erBetaling
                        ? `${s.prisOre / 100} kr`
                        : s.prisOre > 0
                          ? `${s.prisOre / 100} kr`
                          : "1 credit"}
                      {!erBetaling && s.prisOre <= 0 && <HjelpTips k="credits" size={11} />}
                    </span>
                    {s.stedNavn && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, color: TL.mute }}>
                        <Icon name="map-pin" size={11} style={{ color: TL.mute }} />
                        {s.stedNavn}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      )}

      {/* Kontekst-kort — valgt tjeneste (synlig fra steg 2) */}
      {aktivtSteg >= 2 && (
        <Kort pad="12px 16px">
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.text }}>
              <Icon name="target" size={13} style={{ color: TL.fill }} />
              {valgtServiceNavn}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: TL.font.mono, fontSize: 10.5, fontWeight: 700, color: TL.mute }}>
              <Icon name="clock" size={11} style={{ color: TL.mute }} />
              {valgtServiceVarighetMin} min
            </span>
            <Link href={WIZARD} scroll={false} className="v2-focus" style={{ marginLeft: "auto", fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: TL.fill, textDecoration: "none" }}>
              Endre
            </Link>
          </div>
        </Kort>
      )}

      {/* Steg 2 — tid (dag + slot). Fasit: samme data-vis="steg3"-seksjon som
          kontekst-kortet over — begge skjules til en tjeneste er valgt. */}
      {aktivtSteg >= 2 && (
      <section>
        <StegTittel nr={2}>Velg tid</StegTittel>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
          <Caps size={9}>Velg dag</Caps>
          <Caps size={9}>Neste 14 dager</Caps>
        </div>
        <DagStripe valgtDatoIso={valgtDatoIso} serviceSlug={valgtSlug} dager={14} ekstraQuery={betalingQ} />

        <div style={{ marginTop: 16 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Icon name="calendar" size={12} style={{ color: TL.mute }} />
            <Caps size={9}>{valgtDatoLang}</Caps>
          </span>
          <div style={{ marginTop: 10 }}>
            {slots.length === 0 ? (
              <Kort>
                <TomTilstand icon="calendar" title="Ingen ledige tider denne dagen" sub="Prøv en annen dag over." />
              </Kort>
            ) : (
              <SlotLenker slots={slots} serviceSlug={valgtSlug} ekstraQuery={betalingQ} />
            )}
          </div>
        </div>
      </section>
      )}

      {/* Steg 3 — bekreft (oppsummering før slot-trykk fullfører) */}
      {aktivtSteg === 3 && (
        <section>
          <StegTittel nr={3}>Bekreft</StegTittel>

          <Kort>
            <OppsumRad label="Tjeneste" verdi={valgtServiceNavn} />
            <OppsumRad label="Varighet" verdi={`${valgtServiceVarighetMin} min`} mono />
            <OppsumRad label="Dato" verdi={valgtDatoLang} mono />
            {stedNavn !== null && <OppsumRad label="Sted" verdi={stedNavn} />}
            {erBetaling ? (
              <OppsumRad label="Pris" verdi={`${valgtServicePrisOre / 100} kr`} mono last />
            ) : (
              <OppsumRad label={<>Kostnad <HjelpTips k="credits" size={11} /></>} verdi="1 credit" mono last />
            )}
          </Kort>

          {/* Saldo før → etter (kun credits — kortbetaling rører ikke saldoen) */}
          {!erBetaling && (
          <div style={{ marginTop: 10 }}>
            <Kort tint pad="12px 16px">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <Caps size={9}>Saldo etter</Caps>
                <span style={{ fontFamily: TL.font.mono, fontSize: 12.5, fontWeight: 700, color: TL.text, fontVariantNumeric: "tabular-nums" }}>
                  {creditsRemaining} / {monthlyCredits}
                  <span style={{ padding: "0 6px", color: TL.mute }}>→</span>
                  {saldoEtter} / {monthlyCredits}
                </span>
              </div>
            </Kort>
          </div>
          )}

          {!erBetaling && sisteCredit && (
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "10px 12px", borderRadius: 12, marginTop: 10, background: `color-mix(in srgb, ${TL.warn} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${TL.warn} 40%, transparent)` }}>
              <Icon name="coins" size={13} style={{ color: TL.warn, flex: "none", marginTop: 1 }} />
              <span style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, lineHeight: 1.5 }}>
                Dette er den siste crediten din denne måneden.
              </span>
            </div>
          )}

          <p style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute, lineHeight: 1.6, textAlign: "center", margin: "12px 0 0" }}>
            {erBetaling
              ? "Velg en ledig tid over — betalingen skjer trygt med kort i neste steg. Avbestilling er gratis inntil 24 timer før."
              : "Velg en ledig tid over for å fullføre. Avbestilling er gratis inntil 24 timer før."}
          </p>
        </section>
      )}
    </div>
  );
}
