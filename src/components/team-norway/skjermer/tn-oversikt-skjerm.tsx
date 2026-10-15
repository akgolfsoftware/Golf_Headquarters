import Link from "next/link";
import { notFound } from "next/navigation";

import { hentTnSamlinger, hentTnSpillere, hentTnTestdag, hentTnTestdager, type TnTestdagRad } from "@/lib/domain/tn-arbeidsflate";
import { hentGruppepostSide } from "@/lib/domain/tn-post";
import { TN } from "@/lib/v2/team-norway";
import { TnPille, type TnPilleTone } from "../core";
import { TnFlate, TnFlatehode, TnEtikett, TnFotnote, TnInitialer, TnListerad, TnMangler, TnRutenett, TnSkjermhode, TnTekstlenke } from "../tn-flate";
import { TnFremdrift, TnStortTall } from "../tn-grunnmur";
import { TnHandlingLenke, TnKnapperekke } from "../tn-handlinger";
import { TnOktSkjema, TnSamlingSkjema } from "../tn-redigering-skjema";
import { SkjermRamme, datoKort, hentSkjermbruker, osloDag, periode } from "./felles";

/**
 * TN-01 Landslagsoversikt. Neste samling, fellestesten og det siste fra trenerteamet.
 * Fasit: docs/design-system/utkast-tn/daglig.html, skjerm Oversikt (pakke 2, 14.10.2026).
 *
 * Avvik:
 *   - «Gruppas trening» fordelt på aksene er ikke med: det finnes ingen samlet
 *     spørring for delt trening per akse i gruppa, og Anders har ikke svart på om
 *     oversikten skal ha den (README utkast-tn, spørsmål 1).
 *   - Svar på samlingen (ja / venter / kan ikke) har ingen datamodell. Kortet
 *     viser antall spillere i gruppa.
 *   - Fellestest-status bygger på gruppens testdag: den som pågår, ellers neste
 *     planlagte, ellers den siste. Testdager har ingen frist; datoen står.
 *   - Gruppepostene viser rollen i gruppen, ikke stillingstittel.
 */

const klokke = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Oslo" });

function dagnummer(dato: Date) {
  const d = osloDag(dato);
  return Date.UTC(d.aar, d.maned - 1, d.dag) / 864e5;
}

/** «I DAG 08:14», «I GÅR 19:02» eller «23.09 15:45». */
function postTid(dato: Date, naa: Date) {
  const diff = dagnummer(naa) - dagnummer(dato);
  const dag = diff === 0 ? "I DAG" : diff === 1 ? "I GÅR" : datoKort(dato);
  return `${dag} ${klokke.format(dato)}`;
}

const MANGEL: Record<"PENDING" | "SKIPPED" | "ABSENT", { tekst: string; tone: TnPilleTone }> = {
  PENDING: { tekst: "Ikke testet", tone: "amber" },
  SKIPPED: { tekst: "Hoppet over", tone: "nøytral" },
  ABSENT: { tekst: "Fravær", tone: "nøytral" },
};
const langDag = new Intl.DateTimeFormat("nb-NO", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Oslo" });

/** Testdagen oversikten følger: pågående, ellers neste planlagte, ellers den siste som er holdt. */
function velgTestdag(dager: TnTestdagRad[], naa: Date) {
  const aktiv = dager.find((d) => d.status === "ACTIVE");
  if (aktiv) return aktiv;
  const kommende = dager.filter((d) => d.status === "PLANNED" && d.scheduledAt.getTime() >= naa.getTime()).sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
  return kommende[0] ?? dager.find((d) => d.status !== "CANCELLED") ?? null;
}

export async function TnOversiktSkjerm() {
  const bruker = await hentSkjermbruker();
  const samlingsdata = await hentTnSamlinger(bruker);
  if (!samlingsdata) notFound();
  const { kontekst } = samlingsdata;
  const naa = new Date();

  const [testdager, spillere, postside] = await Promise.all([
    kontekst.erSpiller ? Promise.resolve(null) : hentTnTestdager(bruker),
    kontekst.erSpiller ? Promise.resolve(null) : hentTnSpillere(bruker),
    hentGruppepostSide(kontekst.gruppe.id, bruker.id),
  ]);

  const neste = [...samlingsdata.samlinger].sort((a, b) => a.startDate.getTime() - b.startDate.getTime()).find((s) => s.endDate.getTime() >= naa.getTime()) ?? null;
  const dagerIgjen = neste ? Math.max(0, dagnummer(neste.startDate) - dagnummer(naa)) : null;

  const testdagRad = testdager ? velgTestdag(testdager.dager, naa) : null;
  const testdag = testdagRad ? await hentTnTestdag(bruker, testdagRad.id) : null;
  const klubbPerSpiller = new Map((spillere?.rader ?? []).map((r) => [r.id, r.klubb]));
  const mangler = testdag ? testdag.dag.deltakere.filter((d) => d.status !== "DONE") : [];

  const poster = (postside?.tidslinje ?? []).filter((p) => p.kind !== "DOKUMENT").slice(0, 4);

  const gjennomfort = testdag ? testdag.dag.deltakere.length - mangler.length : 0;

  return (
    <SkjermRamme aktiv="oversikt" brukerNavn={bruker.name} kontekst={kontekst}>
      <TnSkjermhode
        overlinje={`${kontekst.gruppe.name} · ${langDag.format(naa)}`}
        tittel="Landslagsoversikt"
        ingress="Neste samling, fellestesten og det siste fra trenerteamet."
        handling={kontekst.kanAdministrere ? (
          <TnKnapperekke>
            <TnSamlingSkjema knapp="Ny samling" />
            <TnOktSkjema knapp="Ny økt" variant="sekundar" />
            <TnHandlingLenke href="/team-norway/fellestesting" variant="sekundar">Ny testdag</TnHandlingLenke>
            <TnHandlingLenke href={`/team-norway/${kontekst.gruppe.id}`} variant="sekundar">Nytt innlegg</TnHandlingLenke>
          </TnKnapperekke>
        ) : undefined}
      />

      <TnRutenett min={340}>
        <section style={{ background: TN.navy900, color: TN.white, border: `1px solid ${TN.navy900}`, borderRadius: TN.radius.sm, padding: "16px 18px 18px", display: "grid", gap: 16, minWidth: 0 }}>
          <TnEtikett style={{ color: TN.rail.text }}>Neste samling</TnEtikett>
          {neste ? (
            <>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: TN.font.display, fontWeight: 300, fontSize: 26, letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1.1, overflowWrap: "anywhere" }}>{neste.location ?? neste.name}</div>
                <p style={{ margin: "4px 0 0", fontSize: 15, color: TN.rail.text, overflowWrap: "anywhere" }}>
                  {neste.location ? `${neste.name} · ` : ""}{neste.antallDeltakere} {neste.antallDeltakere === 1 ? "spiller" : "spillere"}
                </p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "6px 12px", padding: "14px 0", borderTop: `1px solid ${TN.navy700}`, borderBottom: `1px solid ${TN.navy700}` }}>
                <strong style={{ fontFamily: TN.font.mono, fontWeight: 500, fontSize: 46, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{dagerIgjen}</strong>
                <span style={{ fontFamily: TN.font.mono, fontSize: 12, lineHeight: 1.3, letterSpacing: "0.14em", textTransform: "uppercase", color: TN.rail.text }}>
                  {dagerIgjen === 0 ? "pågår" : dagerIgjen === 1 ? "dag igjen" : "dager igjen"} · {periode(neste.startDate, neste.endDate, true)}
                </span>
              </div>
              <div>
                <Link href={`/team-norway/samlinger/${neste.id}`} style={{ background: TN.white, color: TN.navy900, border: `1px solid ${TN.white}`, borderRadius: TN.radius.sm, padding: "0 18px", fontFamily: TN.font.body, fontSize: 14, fontWeight: 700, textDecoration: "none", minHeight: 44, display: "inline-flex", alignItems: "center" }}>
                  Se samlingen
                </Link>
              </div>
            </>
          ) : (
            <p style={{ fontSize: 15, lineHeight: 1.55, color: TN.rail.text, margin: 0 }}>Ingen kommende samlinger er registrert for gruppen.</p>
          )}
        </section>

        <TnFlate style={{ display: "grid", gap: 12 }}>
          {kontekst.erSpiller ? (
            <>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Fellestesting</span>
              <TnMangler>Trenerteamet fører testdagene. Egne Team Norway-tester registrerer du i PlayerHQ.</TnMangler>
              <TnTekstlenke href="/portal/tren/tester/team-norway">Mine tester</TnTekstlenke>
            </>
          ) : testdag ? (
            <>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: "4px 12px" }}>
                <span style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3, overflowWrap: "anywhere" }}>Fellestest · {testdag.dag.title}</span>
                <span style={{ fontSize: 12.5, color: TN.ink500 }}>Testdag {datoKort(testdag.dag.scheduledAt)}</span>
              </div>
              <TnStortTall verdi={gjennomfort} enhet={`/ ${testdag.dag.deltakere.length}`}>
                <span style={{ fontSize: 14.5, color: TN.ink700 }}>har gjennomført {testdag.dag.protokollNavn}</span>
              </TnStortTall>
              <TnFremdrift andel={testdag.dag.deltakere.length === 0 ? 0 : gjennomfort / testdag.dag.deltakere.length} etikett="Gjennomført" maks={testdag.dag.deltakere.length} naa={gjennomfort} />
              <div style={{ borderTop: `1px solid ${TN.ink200}` }}>
                {mangler.slice(0, 6).map((d) => {
                  const m = MANGEL[d.status as keyof typeof MANGEL];
                  return <TnListerad key={d.id} tittel={d.spillerNavn} tekst={klubbPerSpiller.get(d.spillerId) ?? "Klubb ikke registrert"} hoyre={m ? <TnPille tone={m.tone}>{m.tekst}</TnPille> : null} />;
                })}
              </div>
              {mangler.length === 0 ? <TnMangler>Alle på testdagen har gjennomført.</TnMangler> : null}
              {mangler.length > 6 ? <TnFotnote>Og {mangler.length - 6} til.</TnFotnote> : null}
              <TnTekstlenke href={`/team-norway/fellestesting?dag=${testdag.dag.id}`}>Før resultater</TnTekstlenke>
            </>
          ) : (
            <>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Fellestesting</span>
              <TnMangler>Ingen testdag er planlagt for gruppen.</TnMangler>
              <TnTekstlenke href="/team-norway/fellestesting">Til fellestesting</TnTekstlenke>
            </>
          )}
        </TnFlate>
      </TnRutenett>

      <section style={{ display: "grid", gap: 12 }}>
        <TnFlatehode tittel="Gruppeposter" merknad={poster.length > 0 ? `Siste ${poster.length}` : undefined} />
        <TnFlate style={{ paddingBlock: 4 }}>
          {postside === null ? (
            <TnMangler>Gruppepostene vises bare for medlemmer av gruppen.</TnMangler>
          ) : poster.length === 0 ? (
            <TnMangler>Trenerteamet har ikke skrevet noe til gruppen ennå.</TnMangler>
          ) : (
            poster.map((p, i) => (
              <div key={p.id} style={{ display: "grid", gridTemplateColumns: "36px minmax(0, 1fr)", gap: 12, padding: "14px 0", borderBottom: i === poster.length - 1 ? "none" : `1px solid ${TN.ink200}` }}>
                <TnInitialer navn={p.authorNavn} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 10px", alignItems: "baseline" }}>
                    <b style={{ fontSize: 14.5, lineHeight: 1.3 }}>{p.authorNavn}</b>
                    <span style={{ fontFamily: TN.font.mono, fontSize: 11, lineHeight: 1.3, letterSpacing: "0.08em", color: TN.ink500, textTransform: "uppercase" }}>
                      {postside.forfatterRoller[p.authorUserId] ?? "Trener"} · {postTid(p.createdAt, naa)}
                    </span>
                  </div>
                  <p style={{ fontSize: 14.5, lineHeight: 1.6, margin: "4px 0 0", maxWidth: "72ch", overflowWrap: "anywhere", whiteSpace: "pre-line", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.tekst}</p>
                </div>
              </div>
            ))
          )}
        </TnFlate>
        {postside ? <TnTekstlenke href={`/team-norway/${kontekst.gruppe.id}`}>Alle gruppeposter</TnTekstlenke> : null}
      </section>
    </SkjermRamme>
  );
}
