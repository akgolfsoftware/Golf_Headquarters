import Link from "next/link";

import type { TnArbeidskontekst } from "@/lib/domain/tn-arbeidsflate";
import {
  WAGR_KILDE,
  antallWagrTurneringer,
  byggWagrSesong,
  byggWagrTurneringer,
  wagrPrikkStorrelse,
  type WagrRefGruppe,
  type WagrRefSpillerRad,
  type WagrResultatInn,
  type WagrSesongRad,
  type WagrVisning,
} from "@/lib/domain/tn-referanse-wagr-regler";
import { TN } from "@/lib/v2/team-norway";
import { TnPille } from "../core";
import { TnFlate, TnFlatehode, TnFotnote, TnMangler } from "../tn-flate";
import { TnPlassgraf } from "../tn-plassgraf";
import { TnReferanseFaner } from "../tn-referanse-faner";
import { TN_REFERANSESPILLERE_URL } from "../tn-referansespillere";
import { TnShell, tnRolleNavn } from "../tn-shell";
import { TnSkraKort, TnSkraTopp } from "../tn-skra-topp";
import { TnHeltTall, TnHeltTekst, TnHeltTellere } from "../tn-stall";

/**
 * Referanse › WAGR i retning «Skrå» (wireframe docs/design-system/utkast-tn/trenerflate/, Referanse).
 * Gruppevalg og leaderboard med WAGR-plass, endring siden forrige årsslutt, snitt poeng, seire og siste
 * turnering. Ingen tabell som ruller sidelengs: hver spiller er en rad som bryter om på smal skjerm.
 *
 * Grafen viser WAGR-plass år for år for de tre beste i gruppa; Sammenlign og Søk er egne faner.
 * Til pipelines har fylt tabellene, viser skjermen «—» og lenker til teamnorwayref.
 *
 * Visningsvalg (?visning=): Leaderboard · Turneringer · Sesong (wireframe-nøkkel refWagrVis). Turneringer lister
 * alle WAGR-turneringer gruppas spillere har spilt i året; Sesong viser én prikk per turnering per spiller.
 *
 * Avvik: prikkene i Sesong har ingen farge utover navy (størrelse er poeng, fylt prikk er seier), som i wireframen.
 * Turneringslista viser inntil 120 rader; resten står i antallet i bildetoppen.
 */

const datoFormat = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Oslo" });
const kortDato = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Oslo" });
const MAKS_RADER = 120;
const tall = new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 1 });

function Endring({ verdi }: { verdi: number | null }) {
  if (verdi === null) return <span style={{ color: TN.ink500 }}>—</span>;
  if (verdi === 0) return <span style={{ color: TN.ink700 }}>uendret</span>;
  return <span style={{ color: TN.ink900, fontWeight: 600 }}>{verdi > 0 ? `${verdi} opp` : `${-verdi} ned`}</span>;
}

function SpillerRad({ r }: { r: WagrRefSpillerRad }) {
  const fakta: string[] = [
    r.land,
    r.snittPoeng != null ? `snitt ${tall.format(r.snittPoeng)} poeng` : "snitt —",
    r.seire != null ? `${r.seire} ${r.seire === 1 ? "seier" : "seire"}` : "seire —",
    r.bestePlass != null ? `beste plass ${r.bestePlass}` : "beste plass —",
  ];
  return (
    <li style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "4px 16px", alignItems: "start", padding: "14px 0", borderTop: `1px solid ${TN.ink100}` }}>
      <div style={{ display: "grid", gap: 4, minWidth: 0 }}>
        <span style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, minWidth: 0 }}>
          <a
            href={`https://www.wagr.com/playerprofile/${r.wagrId}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 15.5, fontWeight: 700, color: TN.ink900, textDecoration: "none", overflowWrap: "anywhere", minHeight: 44, display: "inline-flex", alignItems: "center" }}
          >
            {r.navn}
          </a>
          {r.nivaa != null ? <TnPille tone="navy">{`Nivå topp ${r.nivaa}`}</TnPille> : null}
        </span>
        <span style={{ fontSize: 13, color: TN.ink700, overflowWrap: "anywhere" }}>{fakta.join(" · ")}</span>
        <span style={{ fontSize: 13, color: TN.ink500, overflowWrap: "anywhere" }}>
          {r.sisteTurnering
            ? `Siste: ${r.sisteTurnering.navn}${r.sisteTurnering.plassering ? `, ${r.sisteTurnering.plassering}` : ""}${r.sisteTurnering.dato ? ` (${kortDato.format(r.sisteTurnering.dato)})` : ""}`
            : "Siste turnering —"}
        </span>
      </div>
      <div style={{ display: "grid", justifyItems: "end", gap: 2, textAlign: "right" }}>
        <span style={{ fontFamily: TN.font.mono, fontSize: 24, fontWeight: 600, lineHeight: 1.1, color: r.plass != null ? TN.navy900 : TN.ink500 }}>{r.plass ?? "—"}</span>
        <span style={{ fontSize: 12, color: TN.ink500 }}>WAGR-plass</span>
        <span style={{ fontSize: 12.5 }}>
          <Endring verdi={r.endring} />
        </span>
      </div>
    </li>
  );
}

const VISNINGER: { id: WagrVisning; navn: string }[] = [
  { id: "leaderboard", navn: "Leaderboard" },
  { id: "turneringer", navn: "Turneringer" },
  { id: "sesong", navn: "Sesong" },
];

function valgStil(aktiv: boolean) {
  return {
    minHeight: 44,
    display: "inline-flex",
    alignItems: "center",
    padding: "0 16px",
    borderRadius: 999,
    fontSize: 14,
    fontWeight: 600,
    textDecoration: "none",
    background: aktiv ? TN.navy900 : TN.white,
    color: aktiv ? TN.white : TN.ink900,
    border: `1px solid ${aktiv ? TN.navy900 : TN.ink100}`,
  } as const;
}

function adresse(gruppeId: string | undefined, visning: WagrVisning) {
  const sp = new URLSearchParams();
  if (gruppeId) sp.set("gruppe", gruppeId);
  if (visning !== "leaderboard") sp.set("visning", visning);
  const q = sp.toString();
  return `/team-norway/referanse${q ? `?${q}` : ""}`;
}

function TurneringRad({ r }: { r: WagrResultatInn }) {
  return (
    <li style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "4px 16px", alignItems: "start", padding: "14px 0", borderTop: `1px solid ${TN.ink100}`, minWidth: 0 }}>
      <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
        <b style={{ fontSize: 15, lineHeight: 1.3, overflowWrap: "anywhere" }}>{r.navn}</b>
        <span style={{ fontSize: 13, color: TN.ink700, overflowWrap: "anywhere" }}>{`${r.dato ? kortDato.format(r.dato) : "Dato —"} · ${r.spillerNavn}`}</span>
        <span style={{ fontSize: 13, color: TN.ink500 }}>
          {`Power ${r.power != null ? tall.format(r.power) : "—"} · WAGR ${r.rankBefore ?? "—"} → ${r.rankAfter ?? "—"}`}
        </span>
      </div>
      <div style={{ display: "grid", justifyItems: "end", gap: 2, textAlign: "right" }}>
        <span style={{ fontFamily: TN.font.mono, fontSize: 22, fontWeight: 600, lineHeight: 1.1, color: r.finish ? TN.navy900 : TN.ink500 }}>{r.finish ?? "—"}</span>
        <span style={{ fontSize: 12, color: TN.ink500 }}>plass</span>
      </div>
    </li>
  );
}

function SesongRadVisning({ rad, maks }: { rad: WagrSesongRad; maks: number }) {
  const beskrivelse = `${rad.navn}: ${rad.prikker.length} ${rad.prikker.length === 1 ? "turnering" : "turneringer"}, ${rad.seire} ${rad.seire === 1 ? "seier" : "seire"}`;
  return (
    <li style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 8, padding: "14px 0", borderTop: `1px solid ${TN.ink100}`, minWidth: 0 }}>
      <span style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "2px 12px", minWidth: 0 }}>
        <b style={{ fontSize: 15, overflowWrap: "anywhere" }}>{rad.navn}</b>
        <span style={{ fontSize: 12.5, color: TN.ink500 }}>{`${rad.prikker.length} ${rad.prikker.length === 1 ? "turnering" : "turneringer"}${rad.seire ? ` · ${rad.seire} ${rad.seire === 1 ? "seier" : "seire"}` : ""}`}</span>
      </span>
      {rad.prikker.length > 0 ? (
        <span role="img" aria-label={beskrivelse} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, minWidth: 0 }}>
          {rad.prikker.map((p) => {
            const d = wagrPrikkStorrelse(p.points, maks);
            return (
              <i
                key={p.eventId}
                title={`${p.navn}${p.dato ? `, ${kortDato.format(p.dato)}` : ""}${p.finish ? `, plass ${p.finish}` : ""}${p.points != null ? `, ${tall.format(p.points)} poeng` : ""}`}
                style={{ display: "inline-block", width: d, height: d, borderRadius: "50%", boxSizing: "border-box", border: `2px solid ${TN.navy900}`, background: p.seier ? TN.navy900 : "transparent" }}
              />
            );
          })}
        </span>
      ) : (
        <span style={{ fontSize: 13, color: TN.ink500 }}>Ingen turneringer i år —</span>
      )}
    </li>
  );
}

export function TnReferanseWagrVisning({
  brukerNavn,
  visDataGolf,
  kontekst,
  grupper,
  valgt,
  rader,
  visning = "leaderboard",
  resultater = [],
  aar = null,
}: {
  brukerNavn: string | null;
  visDataGolf: boolean;
  kontekst: TnArbeidskontekst;
  grupper: WagrRefGruppe[];
  valgt: WagrRefGruppe | null;
  rader: WagrRefSpillerRad[];
  visning?: WagrVisning;
  resultater?: WagrResultatInn[];
  aar?: number | null;
}) {
  const medPlass = rader.filter((r) => r.plass != null);
  const beste = medPlass[0] ?? null;
  const opp = rader.filter((r) => (r.endring ?? 0) > 0).length;
  const dato = valgt ? datoFormat.format(valgt.wagrDato) : null;
  const ifjor = valgt ? valgt.wagrDato.getUTCFullYear() - 1 : null;
  const turneringer = byggWagrTurneringer(resultater);
  const antallTurneringer = antallWagrTurneringer(resultater);
  const sesong = byggWagrSesong(rader, resultater);
  const maksPoeng = resultater.reduce((m, r) => Math.max(m, r.points ?? 0), 0);
  const visTurneringer = visning !== "leaderboard";

  return (
    <TnShell aktiv="referanse" brukerNavn={brukerNavn ?? "Ukjent"} rolle={tnRolleNavn(kontekst.rolle)} groupId={kontekst.gruppe.id} visTrenerflater={!kontekst.erSpiller} kanAdministrere={kontekst.kanAdministrere} visDataGolf={!kontekst.erSpiller && visDataGolf}>
      <TnSkraTopp
        bilde="tee-hand"
        etikett="Referanse"
        overlinje={dato ? `WAGR · rankinguka ${dato}` : "WAGR"}
        tittel={valgt?.tittel ?? valgt?.navn ?? "WAGR"}
        ingress="Hvor referansespillerne står på World Amateur Golf Ranking, og hvor mye de har flyttet seg siden forrige årsslutt."
        venstre={
          <>
            {visTurneringer ? (
              <TnHeltTall verdi={valgt ? antallTurneringer : "—"}>{`turneringer spilt i ${aar ?? "år"} av ${valgt?.navn ?? "gruppa"}`}</TnHeltTall>
            ) : (
              <TnHeltTall verdi={beste?.plass ?? "—"}>{beste ? `beste plass i gruppa, ${beste.navn}` : "beste plass i gruppa"}</TnHeltTall>
            )}
            <TnHeltTekst>{valgt ? `Kilde: ${WAGR_KILDE}.` : "Tallene er ikke lagt inn ennå. Til da ligger de på teamnorwayref."}</TnHeltTekst>
          </>
        }
        hoyre={
          <TnHeltTellere
            tall={[
              { verdi: valgt ? rader.length : "—", tekst: "spillere" },
              { verdi: valgt ? medPlass.length : "—", tekst: "med WAGR-plass" },
              { verdi: valgt ? opp : "—", tekst: ifjor ? `opp siden årsslutt ${ifjor}` : "opp siden årsslutt" },
            ]}
          />
        }
      />
      <TnSkraKort>
        <TnFlate>
          <TnReferanseFaner aktiv="wagr" />
        </TnFlate>
        {grupper.length > 1 ? (
          <nav aria-label="Velg gruppe" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {grupper.map((g) => {
              const aktiv = g.id === valgt?.id;
              return (
                <Link
                  key={g.id}
                  href={adresse(g.id, visning)}
                  aria-current={aktiv ? "page" : undefined}
                  style={valgStil(aktiv)}
                >
                  {g.navn}
                </Link>
              );
            })}
          </nav>
        ) : null}

        {valgt ? (
          <nav aria-label="Velg visning" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: TN.ink500, marginRight: 4 }}>Visning</span>
            {VISNINGER.map((v) => (
              <Link key={v.id} href={adresse(valgt.id, v.id)} aria-current={v.id === visning ? "page" : undefined} style={valgStil(v.id === visning)}>
                {v.navn}
              </Link>
            ))}
          </nav>
        ) : null}

        {valgt && visning === "turneringer" ? (
          <TnFlate style={{ display: "grid", gap: 4 }}>
            <TnFlatehode tittel={`Turneringer ${aar ?? ""}`.trim()} merknad={turneringer.length > 0 ? `${antallTurneringer} turneringer · ${turneringer.length} resultater · nyeste først` : undefined} />
            {turneringer.length > 0 ? (
              <>
                <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 380px), 1fr))", columnGap: 32 }}>
                  {turneringer.slice(0, MAKS_RADER).map((r) => (
                    <TurneringRad key={`${r.eventId}-${r.wagrId}`} r={r} />
                  ))}
                </ol>
                {turneringer.length > MAKS_RADER ? <TnFotnote>{`Viser de ${MAKS_RADER} nyeste av ${turneringer.length} resultater.`}</TnFotnote> : null}
              </>
            ) : (
              <p style={{ margin: 0, padding: "8px 0", fontSize: 14.5, color: TN.ink700 }}>Ingen turneringer er lagt inn for denne gruppa i {aar ?? "år"} —</p>
            )}
          </TnFlate>
        ) : null}

        {valgt && visning === "sesong" ? (
          <TnFlate style={{ display: "grid", gap: 4 }}>
            <TnFlatehode tittel={`Sesong ${aar ?? ""}`.trim()} merknad="Én prikk per turnering. Størrelse er poeng, fylt prikk er seier." />
            {sesong.length > 0 ? (
              <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 380px), 1fr))", columnGap: 32 }}>
                {sesong.map((rad) => (
                  <SesongRadVisning key={rad.wagrId} rad={rad} maks={maksPoeng} />
                ))}
              </ol>
            ) : (
              <p style={{ margin: 0, padding: "8px 0", fontSize: 14.5, color: TN.ink700 }}>Ingen spillere i denne gruppa ennå.</p>
            )}
          </TnFlate>
        ) : null}

        {visning === "leaderboard" || !valgt ? (
        <TnFlate style={{ display: "grid", gap: 4 }}>
          <TnFlatehode tittel="Leaderboard" merknad={valgt ? `${rader.length} spillere · sortert på WAGR-plass` : undefined} />
          {valgt && rader.length > 0 ? (
            <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {rader.map((r) => (
                <SpillerRad key={r.wagrId} r={r} />
              ))}
            </ol>
          ) : (
            <div style={{ display: "grid", gap: 8, padding: "8px 0" }}>
              <TnMangler>{valgt ? "Ingen spillere i denne gruppa ennå." : "WAGR-tallene er ikke lagt inn i HQ ennå. De kommer med mandagsjobben."}</TnMangler>
              <a href={TN_REFERANSESPILLERE_URL} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14.5, fontWeight: 600, color: TN.navy900, minHeight: 44, display: "inline-flex", alignItems: "center" }}>
                Se referansespillerne på teamnorwayref
              </a>
            </div>
          )}
        </TnFlate>
        ) : null}

        {visning === "leaderboard" && medPlass.length > 0 ? (
          <TnFlate style={{ display: "grid", gap: 8 }}>
            <TnFlatehode tittel="WAGR-plass år for år" merknad="De tre beste i gruppa" />
            <TnPlassgraf serier={medPlass.slice(0, 3).map((r) => ({ navn: r.navn, punkter: r.aarForAar }))} etikett={`WAGR-plass år for år for ${medPlass.slice(0, 3).map((r) => r.navn).join(", ")}`} />
            <Link href={`/team-norway/referanse/sammenlign?${medPlass.slice(0, 3).map((r) => `id=${r.wagrId}`).join("&")}`} style={{ fontSize: 14.5, fontWeight: 600, color: TN.navy900, minHeight: 44, display: "inline-flex", alignItems: "center" }}>
              Sammenlign spillerne
            </Link>
          </TnFlate>
        ) : null}

        <TnFotnote>
          {valgt?.utvalg ? `${valgt.utvalg} ` : ""}
          Endringen er plasser siden årsslutt {ifjor ?? "i fjor"}. WAGR-plass for tidligere år er plassen i uke 52. Kilde: {WAGR_KILDE}{dato ? `, rankinguka ${dato}` : ""}.
        </TnFotnote>
      </TnSkraKort>
    </TnShell>
  );
}
