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
 * To brytere per organisasjon, aldri ti (§FORRETNINGSMODELL: SPILLERLISENSER):
 * «Tester og resultater» slår TEST_RESULTATER+STATS av/på sammen (designet
 * viser dem som ett valg), «Komplett profil» slår KOMPLETT_PROFIL av/på.
 * Komplett profil forutsetter tester og resultater — usikkert i designnotatet,
 * implementert her som kaskade: PÅ på komplett løfter testene med seg, AV på
 * testene slår komplett av. Gjenbruker EKSISTERENDE server actions
 * (giDelingsSamtykke/trekkDelingsSamtykke/settDelingsSamtykkeForBarn) — ingen
 * ny datamodell, kun en ny visning.
 */

import { useState, useTransition } from "react";
import { TL } from "@/lib/v2/train-lock";
import { Kort, Icon, StatusPill } from "@/components/v2";
import { Bryter } from "@/components/v2/skjema";

export type TnOrganisasjon = {
  gruppeId: string;
  navn: string;
  testerOgResultater: boolean;
  komplettProfil: boolean;
};

type SettSamtykke = (scope: string, gruppeId: string, gitt: boolean) => Promise<{ ok: true } | { ok: false; feil: string }>;

const DELES_NA_TEKST: Record<"testerOgResultater" | "komplettProfil", { navn: string; detalj: string }[]> = {
  testerOgResultater: [
    { navn: "Testresultater", detalj: "ALLE GJENNOMFØRTE TESTER" },
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
}: {
  organisasjoner: TnOrganisasjon[];
  settSamtykke: SettSamtykke;
  /** Spiller under 16 kan trekke, men ikke slå PÅ selv — samme regel som DelingSamtykkeKort. */
  krevesForesatt?: boolean;
}) {
  const [status, setStatus] = useState(organisasjoner);
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  function scopesFor(orgId: string): { testerOgResultater: boolean; komplettProfil: boolean } {
    return status.find((o) => o.gruppeId === orgId) ?? { testerOgResultater: false, komplettProfil: false };
  }

  function endre(gruppeId: string, felt: "testerOgResultater" | "komplettProfil", nyVerdi: boolean) {
    if (pending) return;
    if (krevesForesatt && nyVerdi) return; // mindreårig kan ikke slå PÅ selv
    setFeil(null);

    const forrige = status;
    setStatus((prev) =>
      prev.map((o) => {
        if (o.gruppeId !== gruppeId) return o;
        if (felt === "komplettProfil" && nyVerdi) return { ...o, komplettProfil: true, testerOgResultater: true };
        if (felt === "testerOgResultater" && !nyVerdi) return { ...o, testerOgResultater: false, komplettProfil: false };
        return { ...o, [felt]: nyVerdi };
      }),
    );

    startTransition(async () => {
      const kall: [string, boolean][] =
        felt === "komplettProfil"
          ? nyVerdi
            ? [
                ["TEST_RESULTATER", true],
                ["STATS", true],
                ["KOMPLETT_PROFIL", true],
              ]
            : [["KOMPLETT_PROFIL", false]]
          : nyVerdi
            ? [
                ["TEST_RESULTATER", true],
                ["STATS", true],
              ]
            : [
                ["TEST_RESULTATER", false],
                ["STATS", false],
                ["KOMPLETT_PROFIL", false],
              ];

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
    endre(gruppeId, "testerOgResultater", false);
  }

  if (status.length === 0) {
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
      {status.map((org) => {
        const s = scopesFor(org.gruppeId);
        const nDeles = (s.testerOgResultater ? DELES_NA_TEKST.testerOgResultater.length : 0) + (s.komplettProfil ? DELES_NA_TEKST.komplettProfil.length : 0);
        return (
          <Kort key={org.gruppeId}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: TL.font.sans, fontSize: 16, fontWeight: 700, color: TL.text, letterSpacing: "-0.02em" }}>{org.navn}</div>
              </div>
              <StatusPill tone={nDeles > 0 ? "up" : "info"}>{nDeles > 0 ? "Deler nå" : "Deler ikke"}</StatusPill>
            </div>

            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
              <Bryter
                label="Tester og resultater"
                sub="Testresultater, turneringer og statistikk."
                checked={s.testerOgResultater}
                onChange={(v) => endre(org.gruppeId, "testerOgResultater", v)}
              />
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
                  Under 16 år: en foresatt må godkjenne delingen i foreldreportalen. Å trekke tilbake kan du alltid gjøre selv.
                </span>
              </div>
            )}

            <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${TL.hair}`, display: "flex", gap: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: TL.font.mono, fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: TL.mute }}>Dette deles akkurat nå</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                  {s.testerOgResultater
                    ? DELES_NA_TEKST.testerOgResultater.map((d) => <span key={d.navn} style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.text }}>{d.navn}</span>)
                    : null}
                  {s.komplettProfil
                    ? DELES_NA_TEKST.komplettProfil.map((d) => <span key={d.navn} style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.text }}>{d.navn}</span>)
                    : null}
                  {nDeles === 0 && <span style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute }}>Ingenting deles</span>}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: TL.font.mono, fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: TL.mute }}>Dette deles ikke</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                  {!s.testerOgResultater && DELES_NA_TEKST.testerOgResultater.map((d) => <span key={d.navn} style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute }}>{d.navn}</span>)}
                  {!s.komplettProfil && DELES_NA_TEKST.komplettProfil.map((d) => <span key={d.navn} style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute }}>{d.navn}</span>)}
                </div>
              </div>
            </div>

            {nDeles > 0 && (
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
                  color: TL.danger,
                  fontFamily: TL.font.sans,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Trekk tilbake all deling
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
