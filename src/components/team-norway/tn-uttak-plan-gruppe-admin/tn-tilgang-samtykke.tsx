import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import type { TnAvsluttResultat, TnLeggTilResultat, TnTrenerRolle } from "@/lib/domain/tn-tilgang";
import type { TnArbeidskontekst } from "@/lib/domain/tn-arbeidsflate";
import { TN } from "@/lib/v2/team-norway";
import { TnFilterknapper, TnFlatehode, TnFotnote, TnInitialer, TnMangler, TnSkjermhode } from "../tn-flate";
import { TnInviterSpiller } from "../tn-inviter-spiller";
import { TnAvsluttTilgang, TnLeggTilTrener } from "../tn-tilgang-handlinger";
import { SkjermRamme } from "../skjermer/felles";
import { SCOPE_NAVN, delingGruppe, type TnDelingGruppe, type TnDelingStatus } from "./samtykke-data";
import type { TnSamtykkeRad } from "./samtykke-hent";

/**
 * TN-19 Tilgang og samtykke. Erstatter Samtykke og Inviter spiller.
 * Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), «Team Norway App.dc.html»,
 * skjerm «tilgang» (shOn + s19d, SUPD 28.09).
 *
 * Avvik:
 *   - Samtykkestatus er ekte: nyeste DelingsSamtykke-rad mot gruppen, der
 *     spillere under 16 år trenger foresattes ja. «Be om deling» og
 *     «Send påminnelse» er ikke bygget: det finnes ingen modell for
 *     forespørsler, og knappene er derfor ikke tegnet inn.
 *   - «Inviter til PlayerHQ» er den eksisterende gruppeinvitasjonen, samlet i
 *     egen flate i høyre kolonne i stedet for en knapp per spiller.
 *   - Stegene under «Slik ser du en spiller» beskriver delingen slik den er
 *     bygget i PlayerHQ (Personvern → Deling), ikke tegningens lenke på e-post.
 *   - «Legg til trener» gir tilgang til en eksisterende AK Golf-konto. Navnefeltet
 *     og ventende invitasjoner finnes ikke. «Endre» (rolle og periode) er beholdt.
 *   - Ingressen sier ikke at trenerflaten bare viser spillere som har delt:
 *     de andre TN-skjermene henter i dag spillerne fra gruppemedlemskapet.
 *     Teksten fra tegningen tas i bruk når de skjermene filtrerer på deling.
 *   - Tegningens grønn (#1F6B45) og feilrød er TN-tokenene status.greenText og status.redText.
 */

export type TnTrenerVisning = { userId: string; navn: string; epost: string; rolle: TnTrenerRolle; joinedAt: Date; endedAt: Date | null; aktiv: boolean };

const dato = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Oslo" });
const rolleNavn = (rolle: TnTrenerRolle) => (rolle === "COACH" ? "Trener" : "Assist Coach");

const kort: CSSProperties = { background: TN.white, border: `1px solid ${TN.navy100}`, borderRadius: TN.radius.lg, padding: "clamp(16px, 2vw, 24px)", minWidth: 0 };
const bred: CSSProperties = { ...kort, flex: "999 1 560px" };
const smal: CSSProperties = { ...kort, flex: "1 1 300px" };
const rad: CSSProperties = { display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start" };

const STATUS: Record<TnDelingStatus, { tekst: string; farge: string }> = {
  DELT: { tekst: "DELT", farge: TN.status.greenText },
  VENTER_FORELDER: { tekst: "VENTER PÅ FORELDER", farge: TN.navy900 },
  IKKE_DELT: { tekst: "IKKE DELT", farge: TN.textSecondary },
  TRUKKET: { tekst: "TRUKKET", farge: TN.ink700 },
};

function delingsMeta(r: TnSamtykkeRad): string {
  const d = r.dato ? dato.format(r.dato) : "—";
  switch (r.status) {
    case "DELT":
      return `Delt: ${r.scopes.map((s) => SCOPE_NAVN[s]).join(", ")} · ${d}${r.foresattGodkjent ? " · forelder godkjente" : ""}`;
    case "VENTER_FORELDER":
      return `Under 16 år · spilleren sa ja ${d} · forelder må godkjenne`;
    case "TRUKKET":
      return `Trakk delingen ${d} · tester og profil er skjult`;
    default:
      return "Har ikke delt med Team Norway fra PlayerHQ";
  }
}

const STEG = [
  "Spilleren åpner PlayerHQ og går til Meg, Innstillinger, Personvern og Deling.",
  "Hen slår på deling med Team Norway, for tester, statistikk eller komplett profil. Hvert valg gjelder for seg.",
  "Er spilleren under 16 år, må en forelder godkjenne før delingen gjelder.",
  "Spilleren kan trekke delingen når som helst. Da stopper delingen med en gang, og statusen her blir Trukket.",
  "Spillere som ikke er med i gruppen, inviterer du under. De får en e-post og kan dele når de er inne.",
];

const ROLLER = [
  ["Trener", "Ser og endrer alt i gruppen: uttak, fellestesting, fagapparat, dokumenter og tilgang. Ser bare det spillerne har delt."],
  ["Assist Coach", "Ser de samme trenerskjermene som Trener, men kan ikke gi eller avslutte tilgang."],
  ["Spiller", "Bruker PlayerHQ og ser aldri trenerflaten. Deler profilen med Team Norway og kan trekke delingen når som helst."],
] as const;

function Seksjonstittel({ children }: { children: ReactNode }) {
  return <h2 style={{ fontFamily: TN.font.display, fontWeight: 400, fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: TN.navy900, margin: 0, paddingBottom: 12, borderBottom: `2px solid ${TN.navy900}` }}>{children}</h2>;
}

export function TnTilgangSamtykkeSkjerm({ brukerNavn, kontekst, gruppeNavn, spillere, filter, trenere, egenId, valgtId, skjema, avslutt, leggTil }: {
  brukerNavn: string | null;
  kontekst: TnArbeidskontekst;
  gruppeNavn: string;
  spillere: TnSamtykkeRad[];
  filter: TnDelingGruppe | "alle";
  trenere: TnTrenerVisning[];
  egenId: string;
  valgtId?: string;
  skjema?: ReactNode;
  avslutt: (userId: string) => Promise<TnAvsluttResultat>;
  leggTil: (epost: string, rolle: TnTrenerRolle) => Promise<TnLeggTilResultat>;
}) {
  const antall = (g: TnDelingGruppe) => spillere.filter((s) => delingGruppe(s.status) === g).length;
  const delt = antall("delt");
  const vist = spillere
    .filter((s) => filter === "alle" || delingGruppe(s.status) === filter)
    .sort((a, b) => Number(a.status === "DELT") - Number(b.status === "DELT") || a.navn.localeCompare(b.navn, "nb"));
  const aktive = trenere.filter((t) => t.aktiv);
  const avsluttede = trenere.filter((t) => !t.aktiv);
  const antallTrenere = aktive.filter((t) => t.rolle === "COACH").length;
  const prosent = spillere.length ? (delt / spillere.length) * 100 : 0;
  const valgt = trenere.find((t) => t.userId === valgtId);
  const href = (f: string) => (f === "alle" ? "/team-norway/tilgang" : `/team-norway/tilgang?deling=${f}`);

  return (
    <SkjermRamme aktiv="tilgang" brukerNavn={brukerNavn} kontekst={kontekst}>
      <TnSkjermhode rute="/team-norway/tilgang" tittel="Tilgang og samtykke" ingress="Hva hver spiller har delt med Team Norway fra PlayerHQ. Nederst står hvem i trenerteamet som har tilgang." />

      <div style={rad}>
        <section style={bred} aria-label="Samtykke">
          <TnFlatehode tittel="Samtykke · spillere som har delt" merknad={`${delt} AV ${spillere.length} HAR DELT`} />
          {spillere.length === 0 ? (
            <TnMangler>Ingen spillere er med i {gruppeNavn} ennå. Inviter spillerne til PlayerHQ, så vises delingen deres her.</TnMangler>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
                <span style={{ fontFamily: TN.font.mono, fontSize: 36, lineHeight: 1 }}>{delt} av {spillere.length}</span>
                <span style={{ fontSize: 14, color: TN.textSecondary }}>har delt profilen sin fra PlayerHQ</span>
              </div>
              <div aria-hidden="true" style={{ height: 6, background: TN.navy100, borderRadius: TN.radius.sm, marginTop: 14, overflow: "hidden" }}>
                <div style={{ width: `${Math.round(prosent * 10) / 10}%`, height: "100%", background: TN.navy900 }} />
              </div>
              <div style={{ marginTop: 16 }}>
                <TnFilterknapper
                  etikett="Filtrer på deling"
                  valg={[
                    { href: href("alle"), label: "Alle", aktiv: filter === "alle", antall: spillere.length },
                    { href: href("delt"), label: "Delt", aktiv: filter === "delt", antall: delt },
                    { href: href("venter"), label: "Venter", aktiv: filter === "venter", antall: antall("venter") },
                    { href: href("ikke"), label: "Ikke delt", aktiv: filter === "ikke", antall: antall("ikke") },
                  ]}
                />
              </div>
              {vist.map((s) => (
                <div key={s.id} style={{ display: "flex", flexWrap: "wrap", gap: "10px 18px", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${TN.navy100}` }}>
                  <div style={{ flex: "1 1 240px", minWidth: 0, display: "flex", gap: 14, alignItems: "center" }}>
                    <TnInitialer navn={s.navn} />
                    <div style={{ minWidth: 0 }}>
                      {s.status === "DELT" ? (
                        <Link href={`/team-norway/spiller/${encodeURIComponent(s.id)}`} style={{ fontSize: 15, fontWeight: 700, color: TN.textPrimary, overflowWrap: "anywhere" }}>{s.navn}</Link>
                      ) : (
                        <div style={{ fontSize: 15, fontWeight: 700, overflowWrap: "anywhere" }}>{s.navn}</div>
                      )}
                      <div style={{ fontSize: 13, color: TN.textSecondary, marginTop: 2, overflowWrap: "anywhere" }}>{delingsMeta(s)}</div>
                    </div>
                  </div>
                  <span style={{ fontFamily: TN.font.mono, fontSize: 10.5, letterSpacing: "0.08em", padding: "4px 7px", border: `1px solid ${STATUS[s.status].farge}`, color: STATUS[s.status].farge, borderRadius: TN.radius.sm, whiteSpace: "nowrap" }}>{STATUS[s.status].tekst}</span>
                </div>
              ))}
              {vist.length === 0 ? <TnMangler>Ingen spillere passer filteret.</TnMangler> : null}
            </>
          )}
        </section>

        <div style={{ flex: "1 1 300px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          <section style={kort}>
            <Seksjonstittel>Slik ser du en spiller</Seksjonstittel>
            {STEG.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: `1px solid ${TN.navy100}` }}>
                <span style={{ fontFamily: TN.font.mono, fontSize: 11, color: TN.textSecondary, flex: "none", paddingTop: 2 }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontSize: 14, lineHeight: 1.55 }}>{t}</span>
              </div>
            ))}
          </section>
          <section id="inviter" style={kort}>
            <Seksjonstittel>Inviter til PlayerHQ</Seksjonstittel>
            <div style={{ marginTop: 16 }}>
              <TnInviterSpiller groupId={kontekst.gruppe.id} />
            </div>
          </section>
        </div>
      </div>

      <div style={rad}>
        <section style={bred} aria-label="Tilgang til gruppen">
          <TnFlatehode tittel="Tilgang til gruppen" merknad={`TRENER ${antallTrenere} · ASSIST COACH ${aktive.length - antallTrenere}`} />
          {aktive.map((t) => (
            <div key={t.userId} style={{ borderBottom: `1px solid ${TN.navy100}`, padding: "14px 0" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 18px", alignItems: "center" }}>
                <div style={{ flex: "1 1 250px", minWidth: 0, display: "flex", gap: 14, alignItems: "center" }}>
                  <TnInitialer navn={t.navn} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, overflowWrap: "anywhere" }}>{t.navn}</div>
                    <div style={{ fontSize: 13, color: TN.textSecondary, marginTop: 2, overflowWrap: "anywhere" }}>{t.epost}</div>
                  </div>
                </div>
                <div style={{ flex: "1 1 190px", minWidth: 0 }}>
                  <div style={{ fontFamily: TN.font.mono, fontSize: 11, letterSpacing: "0.08em", color: t.rolle === "COACH" ? TN.navy900 : TN.textSecondary, textTransform: "uppercase" }}>{rolleNavn(t.rolle)}</div>
                  <div style={{ fontFamily: TN.font.mono, fontSize: 11, color: TN.textSecondary, marginTop: 3 }}>SIDEN {dato.format(t.joinedAt)}{t.endedAt ? ` · TIL ${dato.format(t.endedAt)}` : ""}</div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                  <Link href={`/team-norway/tilgang?valgt=${encodeURIComponent(t.userId)}`} scroll={false} style={{ minHeight: 44, display: "inline-flex", alignItems: "center", padding: "0 6px", color: TN.navy700, fontSize: 14 }}>Endre</Link>
                  {t.userId === egenId ? (
                    <span style={{ minHeight: 44, display: "flex", alignItems: "center", fontFamily: TN.font.mono, fontSize: 11, letterSpacing: "0.08em", color: TN.textSecondary }}>DEG</span>
                  ) : (
                    <TnAvsluttTilgang navn={t.navn} avslutt={avslutt.bind(null, t.userId)} />
                  )}
                </div>
              </div>
              {valgt?.userId === t.userId && skjema ? <div style={{ marginTop: 14, maxWidth: 520 }}>{skjema}</div> : null}
            </div>
          ))}
          {aktive.length === 0 ? <TnMangler>Ingen har trener- eller Assist Coach-tilgang til gruppen.</TnMangler> : null}

          {avsluttede.length > 0 ? (
            <>
              <div style={{ fontFamily: TN.font.display, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: TN.textSecondary, marginTop: 24, paddingBottom: 6, borderBottom: `1px solid ${TN.navy100}` }}>Avsluttet tilgang</div>
              {avsluttede.map((t) => (
                <div key={t.userId} style={{ borderBottom: `1px solid ${TN.navy100}` }}>
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "4px 16px", padding: "11px 0", alignItems: "baseline", color: TN.textSecondary }}>
                    <span style={{ fontSize: 14, minWidth: 0, overflowWrap: "anywhere" }}>{t.navn} · {rolleNavn(t.rolle)}</span>
                    <span style={{ display: "inline-flex", gap: 12, alignItems: "center" }}>
                      <span style={{ fontFamily: TN.font.mono, fontSize: 11 }}>AVSLUTTET {t.endedAt ? dato.format(t.endedAt) : "—"}</span>
                      <Link href={`/team-norway/tilgang?valgt=${encodeURIComponent(t.userId)}`} scroll={false} style={{ minHeight: 44, display: "inline-flex", alignItems: "center", color: TN.navy700, fontSize: 14 }}>Endre</Link>
                    </span>
                  </div>
                  {valgt?.userId === t.userId && skjema ? <div style={{ margin: "0 0 14px", maxWidth: 520 }}>{skjema}</div> : null}
                </div>
              ))}
            </>
          ) : null}
        </section>

        <div style={{ flex: "1 1 300px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          <section style={smal}>
            <Seksjonstittel>Legg til trener</Seksjonstittel>
            <div style={{ marginTop: 18 }}>
              <TnLeggTilTrener leggTil={leggTil} />
            </div>
            <TnFotnote>Personen må ha en AK Golf-konto. Tilgangen gjelder med en gang.</TnFotnote>
          </section>
          <section style={smal}>
            <Seksjonstittel>Hva rollene ser</Seksjonstittel>
            {ROLLER.map(([rolle, tekst]) => (
              <div key={rolle} style={{ padding: "12px 0", borderBottom: `1px solid ${TN.navy100}` }}>
                <div style={{ fontSize: 14.5, fontWeight: 700 }}>{rolle}</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.55, color: TN.textSecondary, marginTop: 3 }}>{tekst}</div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </SkjermRamme>
  );
}
