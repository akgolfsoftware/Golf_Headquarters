import Link from "next/link";
import type { ReactNode } from "react";

import type { TnArbeidskontekst, TnTurneringRad } from "@/lib/domain/tn-arbeidsflate";
import { resultatKilde, resultatStatus } from "@/lib/domain/turneringsresultat";
import { TN } from "@/lib/v2/team-norway";
import { TnPille } from "../core";
import { TnFilterknapper, TnFlate, TnFlatehode, TnFotnote, TnHendelserad, TnInitialer, TnMangler, TnRutenett, TnTekstlenke } from "../tn-flate";
import { TnHandlingLenke } from "../tn-handlinger";
import { TnManuellTurnering } from "../tn-manuell-turnering";
import { TnShell, tnRolleNavn, type TnAktivSide } from "../tn-shell";
import { TnSkraKort, TnSkraTopp } from "../tn-skra-topp";
import { TnHeltKnapper, TnHeltTall, TnHeltTekst, TnHeltTellere } from "../tn-stall";
import { osloDag, periode } from "./felles";
import d from "./tn-daglig.module.css";

/**
 * TN-07 Turneringer, én turnering, TN-08 Live Watch og TN-17 Legg inn turnering i retning «Skrå»
 * (godkjent av Anders 20.10.2026, canvaset «Team Norway nøkkelskjermer», tavlene A1–A4).
 * Ren visning uten datahenting: skjermene i tn-turneringer-skjerm.tsx, tn-turnering-skjerm.tsx og
 * tn-live-watch-skjerm.tsx henter data og sender dem hit. Prøvefil: tests/visual/team-norway/skjermer/TN-07.tsx.
 *
 * Avvik:
 *   - Påmeldingsfrist, reise og overnatting har ingen datamodell. Turneringen viser reise og
 *     overnatting som «—» (beslutninger.md §DESIGNLØFTET, 20.10), lista sier det i fotnoten.
 *   - Score per runde og til par finnes ikke i turneringsdataene. Raden viser plass og total brutto.
 *   - Live-score hull for hull er ikke koblet. Live Watch viser siste registrerte plass og score.
 *   - «Legg inn turnering» vises bare for spillere: turneringen legges i spillerens egen plan.
 */

type Turnering = TnTurneringRad;
type Data = { kontekst: TnArbeidskontekst; turneringer: Turnering[] };
export type TnSpillernavn = Record<string, string>;

const MND_KORT = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"] as const;
const DAG_MS = 864e5;
const langDag = new Intl.DateTimeFormat("nb-NO", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Oslo" });

const flertall = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;
const slutt = (t: Turnering) => ((t.endDate ?? t.startDate)?.getTime() ?? 0) + DAG_MS;
const pagar = (t: Turnering, naa: Date) => t.startDate !== null && t.startDate.getTime() <= naa.getTime() && slutt(t) >= naa.getTime();
const aktiveEntries = (t: Turnering) => t.entries.filter((e) => e.entryStatus !== "WITHDRAWN");
const spillereI = (t: Turnering) => [...new Set([...aktiveEntries(t).map((e) => e.userId), ...t.results.map((r) => r.userId)])];
const navnFor = (navn: TnSpillernavn, id: string) => navn[id] ?? "Ukjent spiller";
const dagerTil = (fra: Date, naa: Date) => {
  const a = osloDag(fra);
  const b = osloDag(naa);
  return Math.round((Date.UTC(a.aar, a.maned - 1, a.dag) - Date.UTC(b.aar, b.maned - 1, b.dag)) / DAG_MS);
};
const nedtelling = (n: number) => (n <= 0 ? "I dag" : n === 1 ? "I morgen" : `Om ${n} dager`);

function Ramme({ aktiv, brukerNavn, kontekst, visDataGolf, tilbake, children }: { aktiv: TnAktivSide; brukerNavn: string | null; kontekst: TnArbeidskontekst; visDataGolf: boolean; tilbake?: { href: string; label: string }; children: ReactNode }) {
  return (
    <TnShell aktiv={aktiv} brukerNavn={brukerNavn ?? "Ukjent"} rolle={tnRolleNavn(kontekst.rolle)} groupId={kontekst.gruppe.id} visTrenerflater={!kontekst.erSpiller} kanAdministrere={kontekst.kanAdministrere} visDataGolf={!kontekst.erSpiller && visDataGolf} tilbake={tilbake}>
      {children}
    </TnShell>
  );
}

function Puls({ children }: { children: ReactNode }) {
  return <span className={d.puls}><i />{children}</span>;
}

/** Faktarad: etikett til venstre, verdi til høyre. Manglende verdi er «—». */
function Fakta({ rader }: { rader: { etikett: string; verdi: string | null }[] }) {
  return (
    <dl style={{ margin: 0, display: "grid" }}>
      {rader.map((r) => (
        <div key={r.etikett} style={{ display: "grid", gridTemplateColumns: "minmax(96px, 120px) minmax(0, 1fr)", gap: 12, alignItems: "baseline", padding: "11px 0", borderTop: `1px solid ${TN.ink100}` }}>
          <dt style={{ fontSize: 13, color: TN.ink500 }}>{r.etikett}</dt>
          <dd style={{ margin: 0, fontSize: 14.5, color: r.verdi ? TN.ink900 : TN.ink500, overflowWrap: "anywhere" }}>{r.verdi ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

// ---------------------------------------------------------------------------
// A1 Turneringer
// ---------------------------------------------------------------------------

export function TnTurneringerVisning({ brukerNavn, visDataGolf, data, navn, visning, naa }: { brukerNavn: string | null; visDataGolf: boolean; data: Data; navn: TnSpillernavn; visning: "kommende" | "fullforte"; naa: Date }) {
  const daterte = data.turneringer.filter((t): t is Turnering & { startDate: Date } => t.startDate !== null);
  const utenDato = data.turneringer.filter((t) => t.startDate === null);
  const kommende = [...daterte.filter((t) => slutt(t) >= naa.getTime()).sort((a, b) => a.startDate.getTime() - b.startDate.getTime()), ...utenDato];
  const fullforte = daterte.filter((t) => slutt(t) < naa.getTime());
  const liste = visning === "kommende" ? kommende : fullforte;

  const naaPagar = daterte.filter((t) => pagar(t, naa));
  const iTurnering = new Set(naaPagar.flatMap(spillereI)).size;
  const pameldte = kommende.reduce((sum, t) => sum + aktiveEntries(t).length, 0);

  const sisteResultater = fullforte
    .flatMap((t) => t.results.filter((r) => r.position !== null).map((r) => ({ t, r })))
    .sort((a, b) => b.t.startDate.getTime() - a.t.startDate.getTime() || (a.r.position ?? 0) - (b.r.position ?? 0))
    .slice(0, 4);

  return (
    <Ramme aktiv="turneringer" brukerNavn={brukerNavn} kontekst={data.kontekst} visDataGolf={visDataGolf}>
      <TnSkraTopp
        bilde="tee-hand"
        etikett="Turneringer"
        overlinje={`${data.kontekst.gruppe.name} · Turneringer`}
        tittel="Turneringer"
        ingress="Mesterskap og kvalifiseringsturneringer, med påmeldte og resultater."
        venstre={
          <>
            <TnHeltTall verdi={iTurnering} enhet={iTurnering === 1 ? "spiller" : "spillere"}>i turnering nå</TnHeltTall>
            <TnHeltTekst>{naaPagar.length ? naaPagar.map((t) => t.name).join(" · ") : "Ingen landslagsspillere er i turnering i dag, etter datoene som er registrert."}</TnHeltTekst>
            <TnHeltKnapper>
              <TnHandlingLenke href="/team-norway/live-watch" variant="hvit">Live Watch</TnHandlingLenke>
              {data.kontekst.erSpiller ? <TnHandlingLenke href="/team-norway/turneringer/ny" variant="konturHvit">Legg inn turnering</TnHandlingLenke> : null}
            </TnHeltKnapper>
          </>
        }
        hoyre={
          <TnHeltTellere
            tall={[
              { verdi: kommende.length, tekst: "kommende" },
              { verdi: fullforte.length, tekst: "gjennomført" },
              { verdi: pameldte, tekst: pameldte === 1 ? "påmelding" : "påmeldinger" },
            ]}
          />
        }
      />
      <TnSkraKort>
        <TnRutenett min={340}>
          <TnFlate style={{ display: "grid", gap: 12 }}>
            <TnFilterknapper
              etikett="Vis turneringer"
              valg={[
                { href: "/team-norway/turneringer", label: "Kommende", aktiv: visning === "kommende", antall: kommende.length },
                { href: "/team-norway/turneringer?vis=fullforte", label: "Gjennomført", aktiv: visning === "fullforte", antall: fullforte.length },
              ]}
            />
            <div>
              {liste.map((t) => {
                const fra = t.startDate ? osloDag(t.startDate) : null;
                const plasser = t.results.map((r) => r.position).filter((p): p is number => p !== null);
                return (
                  <TnHendelserad
                    key={t.id}
                    dag={fra ? String(fra.dag).padStart(2, "0") : "—"}
                    maned={fra ? MND_KORT[fra.maned - 1] ?? "" : "dato"}
                    href={`/team-norway/turneringer/${t.id}`}
                    tittel={t.name}
                    tekst={`${t.startDate ? `${periode(t.startDate, t.endDate ?? t.startDate)} · ` : "Dato ikke registrert · "}${t.location ?? "Sted ikke registrert"} · ${visning === "kommende" ? `${aktiveEntries(t).length} påmeldt` : `${t.results.length} med resultat`} · ${resultatKilde(t.sourceOrigin)}`}
                    hoyre={pagar(t, naa) ? <Puls>Pågår</Puls> : plasser.length ? <TnPille>Beste plass {Math.min(...plasser)}</TnPille> : null}
                  />
                );
              })}
              {liste.length === 0 ? <TnMangler>{visning === "kommende" ? "Ingen kommende turneringer er koblet til spillernes planer." : "Ingen gjennomførte turneringer med resultater er registrert."}</TnMangler> : null}
            </div>
          </TnFlate>

          <TnFlate style={{ display: "grid", gap: 8 }}>
            <TnFlatehode tittel="Siste resultater" merknad="Plass · brutto" />
            {sisteResultater.length ? (
              <div className={d.res}>
                {sisteResultater.map(({ t, r }) => (
                  <Link key={`${t.id}-${r.userId}`} href={`/team-norway/turneringer/${t.id}`} className={d.resRad} style={{ color: "inherit", textDecoration: "none", minHeight: 44 }}>
                    <span className={d.plass}>{r.position}</span>
                    <span style={{ minWidth: 0 }}>
                      <b style={{ display: "block", fontSize: 15, overflowWrap: "anywhere" }}>{navnFor(navn, r.userId)}</b>
                      <span style={{ fontSize: 12.5, color: TN.ink500, overflowWrap: "anywhere" }}>{t.name} · {periode(t.startDate, t.endDate ?? t.startDate)}</span>
                    </span>
                    <span className={d.tot}>{r.score ?? "—"}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <TnMangler>Ingen plasseringer er registrert ennå.</TnMangler>
            )}
          </TnFlate>
        </TnRutenett>
        <TnFotnote>GolfBox-turneringer hentes hver mandag. «Egen registrering» er lagt inn av spilleren selv. Resultater er brutto. Påmeldingsfrist og reise er ikke registrert.</TnFotnote>
      </TnSkraKort>
    </Ramme>
  );
}

// ---------------------------------------------------------------------------
// A2 Én turnering
// ---------------------------------------------------------------------------

export function TnTurneringVisning({ brukerNavn, visDataGolf, data, turnering: t, navn, naa }: { brukerNavn: string | null; visDataGolf: boolean; data: Data; turnering: Turnering; navn: TnSpillernavn; naa: Date }) {
  const rader = spillereI(t)
    .map((uid) => ({ uid, navn: navnFor(navn, uid), pamelding: t.entries.find((e) => e.userId === uid), resultat: t.results.find((r) => r.userId === uid) }))
    .sort((a, b) => (a.resultat?.position ?? Infinity) - (b.resultat?.position ?? Infinity) || a.navn.localeCompare(b.navn, "nb"));
  const beste = rader.find((r) => r.resultat?.position != null) ?? null;
  const naaPagar = pagar(t, naa);
  const ferdig = t.startDate !== null && slutt(t) < naa.getTime();
  const status = naaPagar ? "Pågår" : ferdig ? "Ferdig" : t.startDate ? nedtelling(dagerTil(t.startDate, naa)) : null;
  const medResultat = t.results.length;

  return (
    <Ramme aktiv="turneringer" brukerNavn={brukerNavn} kontekst={data.kontekst} visDataGolf={visDataGolf} tilbake={{ href: "/team-norway/turneringer", label: "Turneringer" }}>
      <TnSkraTopp
        bilde="tee-hand"
        etikett={t.name}
        overlinje={[status, t.startDate ? periode(t.startDate, t.endDate ?? t.startDate, true) : "Dato ikke registrert", t.location ?? "Sted ikke registrert"].filter(Boolean).join(" · ")}
        tittel={t.name}
        ingress={`Kilde: ${resultatKilde(t.sourceOrigin)}. Resultater er brutto.`}
        venstre={
          <>
            <TnHeltTall verdi={beste?.resultat?.position ?? "—"} enhet={beste ? "plass" : undefined}>
              {beste ? `beste landslagsspiller · ${beste.navn}${beste.resultat?.score != null ? `, ${beste.resultat.score} slag` : ""}` : "ingen plassering registrert ennå"}
            </TnHeltTall>
            <TnHeltTekst>{naaPagar ? `${flertall(rader.length, "landslagsspiller er", "landslagsspillere er")} med. Turneringen pågår.` : `${flertall(rader.length, "landslagsspiller", "landslagsspillere")} fra gruppa, ${medResultat} med resultat.`}</TnHeltTekst>
            {naaPagar ? <TnHeltKnapper><TnHandlingLenke href="/team-norway/live-watch" variant="hvit">Live Watch</TnHandlingLenke></TnHeltKnapper> : null}
          </>
        }
        hoyre={
          <TnHeltTellere
            tall={[
              { verdi: rader.length, tekst: rader.length === 1 ? "landslagsspiller" : "landslagsspillere" },
              { verdi: medResultat, tekst: "med resultat" },
              { verdi: aktiveEntries(t).length, tekst: "påmeldt" },
            ]}
          />
        }
      />
      <TnSkraKort>
        <TnRutenett min={340}>
          <TnFlate style={{ display: "grid", gap: 8 }}>
            <TnFlatehode tittel="Landslagsspillere" merknad="Plass · brutto" />
            <div className={d.res}>
              {rader.map((r) => (
                <div key={r.uid} className={d.resRad}>
                  <span className={d.plass}>{r.resultat?.position ?? "—"}</span>
                  <span style={{ minWidth: 0 }}>
                    {data.kontekst.erSpiller ? (
                      <b style={{ display: "block", fontSize: 15, overflowWrap: "anywhere" }}>{r.navn}</b>
                    ) : (
                      <Link href={`/team-norway/spiller/${r.uid}/oversikt`} style={{ display: "inline-flex", alignItems: "center", minHeight: 44, fontSize: 15, fontWeight: 700, color: TN.ink900, textUnderlineOffset: 4, overflowWrap: "anywhere" }}>{r.navn}</Link>
                    )}
                    <span style={{ display: "block", fontSize: 12.5, color: TN.ink500 }}>{r.pamelding ? resultatStatus(r.pamelding.entryStatus) : "Resultat registrert"}</span>
                  </span>
                  <span className={d.tot}>{r.resultat?.score ?? "—"}<small>brutto</small></span>
                </div>
              ))}
            </div>
            {rader.length === 0 ? <TnMangler>Ingen spillere i gruppa er påmeldt eller har resultat i denne turneringen.</TnMangler> : null}
            <TnFotnote>Plass og score står slik de er registrert. Mangler et tall, står det en strek.</TnFotnote>
          </TnFlate>

          <TnFlate style={{ display: "grid", gap: 4 }}>
            <TnFlatehode tittel="Turneringen" />
            <Fakta
              rader={[
                { etikett: "Datoer", verdi: t.startDate ? periode(t.startDate, t.endDate ?? t.startDate, true) : null },
                { etikett: "Sted", verdi: t.location },
                { etikett: "Kilde", verdi: resultatKilde(t.sourceOrigin) },
                { etikett: "Påmeldte", verdi: `${aktiveEntries(t).length} fra gruppa` },
                { etikett: "Reise", verdi: null },
                { etikett: "Overnatting", verdi: null },
              ]}
            />
          </TnFlate>
        </TnRutenett>
        <TnTekstlenke href="/team-norway/turneringer">Alle turneringer</TnTekstlenke>
      </TnSkraKort>
    </Ramme>
  );
}

// ---------------------------------------------------------------------------
// A3 Live Watch
// ---------------------------------------------------------------------------

export function TnLiveWatchVisning({ brukerNavn, visDataGolf, data, navn, naa }: { brukerNavn: string | null; visDataGolf: boolean; data: Data; navn: TnSpillernavn; naa: Date }) {
  const daterte = data.turneringer.filter((t): t is Turnering & { startDate: Date } => t.startDate !== null);
  const naaPagar = daterte.filter((t) => pagar(t, naa)).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const antall = new Set(naaPagar.flatMap(spillereI)).size;
  const medScore = naaPagar.reduce((sum, t) => sum + t.results.filter((r) => r.score !== null).length, 0);
  const snart = daterte.filter((t) => t.startDate.getTime() > naa.getTime()).sort((a, b) => a.startDate.getTime() - b.startDate.getTime()).slice(0, 3);

  return (
    <Ramme aktiv="live-watch" brukerNavn={brukerNavn} kontekst={data.kontekst} visDataGolf={visDataGolf}>
      <TnSkraTopp
        bilde="spiller-ved-vannet"
        etikett="Live Watch"
        overlinje={langDag.format(naa)}
        tittel="Live Watch"
        ingress="Landslagsspillere i turnering akkurat nå."
        venstre={
          <>
            <TnHeltTall verdi={antall} enhet={antall === 1 ? "spiller" : "spillere"}>i turnering nå</TnHeltTall>
            <TnHeltTekst>Plass og score er siste registrerte resultat. Hull for hull hentes ikke ennå.</TnHeltTekst>
          </>
        }
        hoyre={
          <TnHeltTellere
            tall={[
              { verdi: naaPagar.length, tekst: naaPagar.length === 1 ? "turnering nå" : "turneringer nå" },
              { verdi: medScore, tekst: "med score ført" },
              { verdi: snart.length, tekst: "starter snart" },
            ]}
          />
        }
      />
      <TnSkraKort>
        <TnRutenett min={340}>
          <div style={{ display: "grid", gap: 16, minWidth: 0 }}>
            {naaPagar.map((t) => (
              <TnFlate key={t.id} style={{ display: "grid", gap: 4 }}>
                <TnFlatehode tittel={t.name} merknad={`${periode(t.startDate, t.endDate ?? t.startDate)} · ${t.location ?? "Sted ikke registrert"}`}>
                  <Puls>Pågår</Puls>
                </TnFlatehode>
                {spillereI(t).map((uid) => {
                  const r = t.results.find((x) => x.userId === uid);
                  const spillernavn = navnFor(navn, uid);
                  return (
                    <div key={uid} className={d.liveRad}>
                      <TnInitialer navn={spillernavn} />
                      <span style={{ minWidth: 0 }}>
                        <b style={{ display: "block", fontSize: 15, lineHeight: 1.3, overflowWrap: "anywhere" }}>{spillernavn}</b>
                        <span style={{ fontSize: 12.5, color: TN.ink500 }}>{t.location ?? "Sted ikke registrert"}</span>
                      </span>
                      <span className={d.verdi}>{r?.position ?? "—"}<small>{r?.score != null ? `${r.score} slag` : "Ingen score ført"}</small></span>
                    </div>
                  );
                })}
                <TnTekstlenke href={`/team-norway/turneringer/${t.id}`}>Turneringen</TnTekstlenke>
              </TnFlate>
            ))}
            {naaPagar.length === 0 ? <TnFlate style={{ background: TN.ink50 }}><TnMangler>Ingen landslagsspillere er i turnering i dag, etter datoene som er registrert.</TnMangler></TnFlate> : null}
          </div>

          <div style={{ display: "grid", gap: 16, minWidth: 0 }}>
            <TnFlate style={{ display: "grid", gap: 8, background: TN.ink50 }}>
              <TnFlatehode tittel="Hull for hull"><TnPille>Ikke koblet til</TnPille></TnFlatehode>
              <TnMangler>Live-score fra turneringen hentes ikke ennå. Plass og score her er siste registrerte resultat, oppdatert etter hver runde.</TnMangler>
            </TnFlate>
            <TnFlate style={{ display: "grid", gap: 4 }}>
              <TnFlatehode tittel="Starter snart" />
              {snart.map((t) => (
                <TnHendelserad
                  key={t.id}
                  dag={String(osloDag(t.startDate).dag).padStart(2, "0")}
                  maned={MND_KORT[osloDag(t.startDate).maned - 1] ?? ""}
                  href={`/team-norway/turneringer/${t.id}`}
                  tittel={t.name}
                  tekst={`${aktiveEntries(t).length} påmeldt · ${t.location ?? "Sted ikke registrert"}`}
                  hoyre={<span style={{ fontFamily: TN.font.mono, fontSize: 12.5, color: TN.ink700, whiteSpace: "nowrap" }}>{nedtelling(dagerTil(t.startDate, naa))}</span>}
                />
              ))}
              {snart.length === 0 ? <TnMangler>Ingen kommende turneringer er registrert.</TnMangler> : null}
            </TnFlate>
          </div>
        </TnRutenett>
      </TnSkraKort>
    </Ramme>
  );
}

// ---------------------------------------------------------------------------
// A4 Legg inn turnering (bare spiller)
// ---------------------------------------------------------------------------

export function TnTurneringNyVisning({ brukerNavn, kontekst, visDataGolf }: { brukerNavn: string | null; kontekst: TnArbeidskontekst; visDataGolf: boolean }) {
  return (
    <Ramme aktiv="turneringer" brukerNavn={brukerNavn} kontekst={kontekst} visDataGolf={visDataGolf} tilbake={{ href: "/team-norway/turneringer", label: "Turneringer" }}>
      <TnSkraTopp bilde="putting-green" etikett="Legg inn turnering" overlinje="Turneringer · lagt inn av deg" tittel="Legg inn turnering" ingress="Brukes når turneringen ikke finnes i GolfBox. Resultater føres brutto." />
      <TnSkraKort>
        <TnRutenett min={340}>
          <TnFlate>
            <TnManuellTurnering />
          </TnFlate>
          <TnFlate style={{ display: "grid", gap: 10, background: TN.ink50 }}>
            <TnFlatehode tittel="Når bruker du dette" />
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55, color: TN.ink700 }}>Når turneringen ikke finnes i GolfBox, for eksempel en internasjonal turnering. Turneringer i GolfBox kommer inn av seg selv hver mandag.</p>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55, color: TN.ink700 }}>Turneringen legges i planen din og vises for trenerne du har delt med.</p>
          </TnFlate>
        </TnRutenett>
      </TnSkraKort>
    </Ramme>
  );
}
