"use client";

/**
 * TN-12 Samtykke og deling (Claw batch 3, 01.09.2026) — fullside-visning av
 * delingssamtykket til eksterne organisasjoner (Team Norway/WANG).
 *
 * Designfasit: designsystem/team-norway/templates/tn-samtykke/. Filens eget
 * designnotat er eksplisitt: skjermen hører hjemme i PlayerHQ/Forelder, ikke
 * under /team-norway/* — derfor Train-lock (TL), ikke TN-tokens, i motsetning
 * til TN-09/TN-10/TN-11.
 *
 * Vanlige mottakere har to brytere per organisasjon: «Tester og resultater»
 * slår TEST_RESULTATER+STATS av/på sammen og «Komplett profil» styrer
 * KOMPLETT_PROFIL. For aktive WANG-elever vises automatisk TN-testdeling som
 * fast informasjon, mens frivillig statistikk og profil fortsatt kan styres.
 * Gjenbruker EKSISTERENDE server actions
 * (giDelingsSamtykke/trekkDelingsSamtykke/settDelingsSamtykkeForBarn) — ingen
 * ny datamodell, kun en ny visning.
 */

import { useState, useTransition } from "react";
import { TL } from "@/lib/v2/train-lock";
import { Kort, Icon, StatusPill } from "@/components/v2";
import { Bryter } from "@/components/v2/skjema";
import { TnLogo } from "@/components/team-norway/core";

export type TnOrganisasjon = {
  gruppeId: string;
  navn: string;
  testerOgResultater: boolean;
  stats?: boolean;
  testResultaterAutomatisk?: boolean;
  komplettProfil: boolean;
};

type SettSamtykke = (scope: string, gruppeId: string, gitt: boolean) => Promise<{ ok: true } | { ok: false; feil: string }>;

const DELES_NA_TEKST: Record<"testerOgResultater" | "testresultater" | "statistikk" | "komplettProfil", { navn: string; detalj: string }[]> = {
  testerOgResultater: [
    { navn: "Testresultater", detalj: "ALLE GJENNOMFØRTE TESTER" },
    { navn: "Turneringsresultater", detalj: "SISTE 12 MÅNEDER" },
    { navn: "Rundestatistikk", detalj: "SCORE, FAIRWAY, GIR, PUTT" },
  ],
  testresultater: [{ navn: "Testresultater", detalj: "ALLE GJENNOMFØRTE TESTER" }],
  statistikk: [
    { navn: "Turneringsresultater", detalj: "SISTE 12 MÅNEDER" },
    { navn: "Rundestatistikk", detalj: "SCORE, FAIRWAY, GIR, PUTT" },
  ],
  komplettProfil: [
    { navn: "Treningsplan og økter", detalj: "" },
    { navn: "TrackMan-data", detalj: "" },
    { navn: "Analyse og fremgang", detalj: "" },
  ],
};

export function TnSamtykkeSide({
  organisasjoner,
  settSamtykke,
  krevesForesatt = false,
  automatiskWangTestdeling = false,
  modus = "spiller",
}: {
  organisasjoner: TnOrganisasjon[];
  settSamtykke: SettSamtykke;
  /** Spiller under 16 kan trekke, men ikke slå PÅ selv — samme regel som DelingSamtykkeKort. */
  krevesForesatt?: boolean;
  /** Automatisk WANG-testdeling vises separat fra frivillig organisasjonsdeling. */
  automatiskWangTestdeling?: boolean;
  modus?: "spiller" | "foresatt";
}) {
  const [status, setStatus] = useState(organisasjoner);
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  function scopesFor(orgId: string): TnOrganisasjon {
    return status.find((o) => o.gruppeId === orgId) ?? { gruppeId: orgId, navn: "", testerOgResultater: false, stats: false, komplettProfil: false };
  }

  function endre(gruppeId: string, felt: "testerOgResultater" | "statistikk" | "komplettProfil", nyVerdi: boolean) {
    if (pending) return;
    if (modus === "spiller" && krevesForesatt && nyVerdi) return; // mindreårig kan ikke slå PÅ selv
    setFeil(null);

    const forrige = status;
    setStatus((prev) =>
      prev.map((o) => {
        if (o.gruppeId !== gruppeId) return o;
        if (felt === "komplettProfil" && nyVerdi) return { ...o, komplettProfil: true, testerOgResultater: true, stats: true };
        if (felt === "testerOgResultater" && !nyVerdi) return { ...o, testerOgResultater: false, stats: false, komplettProfil: false };
        if (felt === "statistikk") return { ...o, stats: nyVerdi, komplettProfil: nyVerdi ? o.komplettProfil : false };
        return { ...o, [felt]: nyVerdi };
      }),
    );

    startTransition(async () => {
      const automatisk = status.find((o) => o.gruppeId === gruppeId)?.testResultaterAutomatisk ?? false;
      const kall: [string, boolean][] = felt === "komplettProfil"
        ? nyVerdi
          ? [...(automatisk ? [] : [["TEST_RESULTATER", true] as [string, boolean]]), ["STATS", true], ["KOMPLETT_PROFIL", true]]
          : [["KOMPLETT_PROFIL", false]]
        : felt === "statistikk"
          ? nyVerdi
            ? [["STATS", true]]
            : [["STATS", false], ["KOMPLETT_PROFIL", false]]
          : nyVerdi
            ? [["TEST_RESULTATER", true], ["STATS", true]]
            : [["TEST_RESULTATER", false], ["STATS", false], ["KOMPLETT_PROFIL", false]];

      for (const [scope, gitt] of kall) {
        const svar = await settSamtykke(scope, gruppeId, gitt);
        if (!svar.ok) {
          setStatus(forrige);
          setFeil(svar.feil);
          return;
        }
      }
    });
  }

  function trekkAlt(gruppeId: string) {
    endre(gruppeId, "komplettProfil", false);
    const automatisk = status.find((o) => o.gruppeId === gruppeId)?.testResultaterAutomatisk ?? false;
    endre(gruppeId, automatisk ? "statistikk" : "testerOgResultater", false);
  }

  if (status.length === 0 && !automatiskWangTestdeling) {
    return (
      <Kort>
        <div style={{ fontFamily: TL.font.sans, fontSize: 14, color: TL.text, fontWeight: 700 }}>Ingen deler dataene dine</div>
        <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, margin: "8px 0 0", lineHeight: 1.5 }}>
          Ingen klubb, krets eller forbund har tilgang til testene, resultatene eller profilen din. Blir du tatt inn i en satsing, dukker
          organisasjonen opp her og du bestemmer selv hva de får se.
        </p>
      </Kort>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {automatiskWangTestdeling && (
        <Kort>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <Icon name="shield" size={16} style={{ color: TL.mute, marginTop: 2, flex: "none" }} />
            <div>
              <div style={{ fontFamily: TL.font.sans, fontSize: 14, color: TL.text, fontWeight: 700 }}>WANG-testresultater deles automatisk</div>
              <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, margin: "6px 0 0", lineHeight: 1.5 }}>
                Fullførte testresultater fra aktive WANG-elever deles med Team Norway etter WANGs opptaksavtale. Denne delingen kan ikke slås av her. Turneringsstatistikk og øvrig profilinnsyn styres separat.
              </p>
            </div>
          </div>
        </Kort>
      )}
      {status.length === 0 && automatiskWangTestdeling && (
        <Kort>
          <div style={{ fontFamily: TL.font.sans, fontSize: 14, color: TL.text, fontWeight: 700 }}>Ingen frivillig deling er aktiv</div>
          <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, margin: "8px 0 0", lineHeight: 1.5 }}>
            Ingen annen klubb, krets eller organisasjon har samtykke til å se statistikk eller profilen din.
          </p>
        </Kort>
      )}
      {status.map((org) => {
        const s = scopesFor(org.gruppeId);
        const testResultaterAutomatisk = org.testResultaterAutomatisk ?? false;
        const delerTester = testResultaterAutomatisk || s.testerOgResultater;
        const delerStatistikk = testResultaterAutomatisk ? Boolean(s.stats) : s.testerOgResultater;
        const nFrivilligDelt = (testResultaterAutomatisk ? (s.stats ? 2 : 0) : (s.testerOgResultater ? DELES_NA_TEKST.testerOgResultater.length : 0)) + (s.komplettProfil ? DELES_NA_TEKST.komplettProfil.length : 0);
        const nDelt = (delerTester ? 1 : 0) + (delerStatistikk ? 2 : 0) + (s.komplettProfil ? DELES_NA_TEKST.komplettProfil.length : 0);
        return (
          <Kort key={org.gruppeId}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/team norway/i.test(org.navn) ? <TnLogo hoyde={26} /> : null}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: TL.font.sans, fontSize: 16, fontWeight: 700, color: TL.text, letterSpacing: "-0.02em" }}>{org.navn}</div>
              </div>
              <StatusPill tone={nDelt > 0 ? "up" : "info"}>{nDelt > 0 ? "Deler nå" : "Deler ikke"}</StatusPill>
            </div>

            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
              {testResultaterAutomatisk ? (
                <div role="status" style={{ padding: "10px 12px", borderRadius: 10, background: TL.dock, border: `1px solid ${TL.hair}` }}>
                  <div style={{ fontFamily: TL.font.sans, fontSize: 13, fontWeight: 700, color: TL.text }}>Testresultater deles automatisk</div>
                  <div style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, marginTop: 4, lineHeight: 1.45 }}>WANG-elevers fullførte tester deles etter opptaksavtalen. Dette kan ikke slås av her.</div>
                </div>
              ) : (
                <Bryter
                  label="Tester og resultater"
                  sub="Testresultater, turneringer og statistikk."
                  checked={s.testerOgResultater}
                  onChange={(v) => endre(org.gruppeId, "testerOgResultater", v)}
                />
              )}
              {testResultaterAutomatisk && (
                <Bryter
                  label="Turneringsresultater og rundestatistikk"
                  sub="Turneringsplasseringer og statistikk fra golfspill."
                  checked={Boolean(s.stats)}
                  onChange={(v) => endre(org.gruppeId, "statistikk", v)}
                />
              )}
              <Bryter
                label="Komplett profil"
                sub="I tillegg treningsplan, TrackMan, analyse og fremgang."
                checked={s.komplettProfil}
                onChange={(v) => endre(org.gruppeId, "komplettProfil", v)}
              />
            </div>

            {krevesForesatt && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 14, padding: "11px 13px", borderRadius: 12, background: TL.dock, border: `1px solid ${TL.hair}` }}>
                <Icon name="shield" size={15} style={{ color: TL.mute, flex: "none", marginTop: 1 }} />
                <span style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, lineHeight: 1.5 }}>
                  {automatiskWangTestdeling ? "For elever under 16 år signerer foresatt WANGs opptaksavtale. Foresatt godkjenner eventuell frivillig profil- og statistikdeling i foreldreportalen." : "Under 16 år: en foresatt må godkjenne delingen i foreldreportalen. Å trekke frivillig deling tilbake kan du alltid gjøre selv."}
                </span>
              </div>
            )}

            <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${TL.hair}`, display: "flex", gap: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: TL.font.mono, fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: TL.mute }}>Dette deles akkurat nå</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                  {testResultaterAutomatisk
                    ? DELES_NA_TEKST.testresultater.map((d) => <span key={d.navn} style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.text }}>{d.navn} · deles automatisk</span>)
                    : s.testerOgResultater
                      ? DELES_NA_TEKST.testerOgResultater.map((d) => <span key={d.navn} style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.text }}>{d.navn}</span>)
                      : null}
                  {testResultaterAutomatisk && s.stats ? DELES_NA_TEKST.statistikk.map((d) => <span key={d.navn} style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.text }}>{d.navn}</span>) : null}
                  {s.komplettProfil
                    ? DELES_NA_TEKST.komplettProfil.map((d) => <span key={d.navn} style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.text }}>{d.navn}</span>)
                    : null}
                  {nDelt === 0 && <span style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute }}>Ingenting deles</span>}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: TL.font.mono, fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: TL.mute }}>Dette deles ikke</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                  {!testResultaterAutomatisk && !s.testerOgResultater && DELES_NA_TEKST.testerOgResultater.map((d) => <span key={d.navn} style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute }}>{d.navn}</span>)}
                  {testResultaterAutomatisk && !s.stats && DELES_NA_TEKST.statistikk.map((d) => <span key={d.navn} style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute }}>{d.navn}</span>)}
                  {!s.komplettProfil && DELES_NA_TEKST.komplettProfil.map((d) => <span key={d.navn} style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute }}>{d.navn}</span>)}
                </div>
              </div>
            </div>

            {nFrivilligDelt > 0 && (
              <button
                type="button"
                onClick={() => trekkAlt(org.gruppeId)}
                style={{
                  marginTop: 14,
                  height: 40,
                  padding: "0 16px",
                  borderRadius: 999,
                  border: `1px solid ${TL.danger}`,
                  background: "none",
                  color: TL.text,
                  fontFamily: TL.font.sans,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Trekk tilbake frivillig deling
              </button>
            )}
          </Kort>
        );
      })}

      <div style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: feil ? TL.danger : TL.mute }}>
        {pending ? "Lagrer …" : feil ? feil : "Endringer logges i revisjonsloggen."}
      </div>
    </div>
  );
}
