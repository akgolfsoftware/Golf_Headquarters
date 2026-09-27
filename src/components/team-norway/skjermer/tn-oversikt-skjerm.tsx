import Link from "next/link";
import { notFound } from "next/navigation";

import { hentTnSamlinger, hentTnSpillere, hentTnTestdag, hentTnTestdager, type TnTestdagRad } from "@/lib/domain/tn-arbeidsflate";
import { hentGruppepostSide } from "@/lib/domain/tn-post";
import { TN } from "@/lib/v2/team-norway";
import { TnFlate, TnFlatehode, TnEtikett, TnFotnote, TnInitialer, TnMangler, TnSkjermhode } from "../tn-flate";
import { TnHandlingLenke, TnKnapperekke } from "../tn-handlinger";
import { TnOktSkjema, TnSamlingSkjema } from "../tn-redigering-skjema";
import { SkjermRamme, datoKort, hentSkjermbruker, osloDag, periode } from "./felles";

/**
 * TN-01 Landslagsoversikt. Neste samling, fellestesten og det siste fra trenerteamet.
 * Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-01.
 *
 * Avvik:
 *   - Reiseprogrammet (oppmøte, fly, buss) har ingen datamodell. Samlingskortet
 *     viser sted, periode og antall deltakere, og lenker til samlingen.
 *   - Samlingsnummer («5 / 6») vises ikke. Samlinger har ikke rekkefølge i sesongen.
 *   - Fellestest-status bygger på gruppens testdag: den som pågår, ellers neste
 *     planlagte, ellers den siste. Testdager har ingen frist, så den røde
 *     «STENGER»-merkingen står ikke. Datoen for testdagen står i stedet.
 *   - Aktivitetsstrømmen er gruppepostene. Stillingstittel finnes ikke, avsender
 *     står med rollen i gruppen. «Nye» per leser telles ikke; merknaden sier «Siste 4».
 *   - Trener har snarveier til ny samling, økt, testdag og innlegg (Anders 27.09.2026).
 *   - Dempede farger på den mørke flaten er tokenene navy-100 og navy-300, ikke
 *     prototypens #D5E1EE og #9FB6D1.
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

const MANGEL: Record<"PENDING" | "SKIPPED" | "ABSENT", string> = { PENDING: "IKKE TESTET", SKIPPED: "HOPPET OVER", ABSENT: "FRAVÆR" };

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

  return (
    <SkjermRamme aktiv="oversikt" brukerNavn={bruker.name} kontekst={kontekst}>
      <TnSkjermhode rute="/team-norway" tittel="Landslagsoversikt" ingress="Neste samling, fellestesten og det siste fra trenerteamet. Tre ting, i den rekkefølgen." />

      {kontekst.kanAdministrere ? (
        <TnKnapperekke>
          <TnSamlingSkjema knapp="Ny samling" />
          <TnOktSkjema knapp="Ny økt" variant="sekundar" />
          <TnHandlingLenke href="/team-norway/fellestesting" variant="sekundar">Ny testdag</TnHandlingLenke>
          <TnHandlingLenke href={`/team-norway/${kontekst.gruppe.id}`} variant="sekundar">Nytt innlegg</TnHandlingLenke>
        </TnKnapperekke>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, max(340px, calc((100% - 20px) / 2))), 1fr))", gap: 20 }}>
        <section style={{ background: TN.navy900, color: TN.white, borderRadius: TN.radius.lg, padding: "clamp(18px, 2.2vw, 26px)", display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
          <TnEtikett style={{ color: TN.navy300, fontSize: 12, letterSpacing: "0.22em" }}>Neste samling</TnEtikett>
          {neste ? (
            <>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: TN.font.display, fontWeight: 300, fontSize: "clamp(24px, 3vw, 30px)", letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1.1, overflowWrap: "anywhere" }}>{neste.location ?? neste.name}</div>
                <div style={{ fontSize: 14.5, color: TN.navy100, marginTop: 6, overflowWrap: "anywhere" }}>
                  {neste.location ? `${neste.name} · ` : ""}{neste.antallDeltakere} {neste.antallDeltakere === 1 ? "spiller" : "spillere"}
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "6px 10px", padding: "14px 0", borderTop: `1px solid ${TN.navy700}`, borderBottom: `1px solid ${TN.navy700}` }}>
                <span style={{ fontFamily: TN.font.mono, fontSize: 44, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{dagerIgjen}</span>
                <span style={{ fontFamily: TN.font.display, fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase", color: TN.navy100 }}>
                  {dagerIgjen === 0 ? "pågår" : dagerIgjen === 1 ? "dag igjen" : "dager igjen"} · {periode(neste.startDate, neste.endDate, true)}
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <Link href={`/team-norway/samlinger/${neste.id}`} style={{ background: TN.white, color: TN.navy900, borderRadius: TN.radius.sm, padding: "0 18px", fontFamily: TN.font.display, fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", textDecoration: "none", minHeight: 44, display: "inline-flex", alignItems: "center" }}>
                  Se samlingen
                </Link>
              </div>
            </>
          ) : (
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: TN.navy100, margin: 0 }}>Ingen kommende samlinger er registrert for gruppen.</p>
          )}
        </section>

        <TnFlate style={{ display: "flex", flexDirection: "column" }}>
          {kontekst.erSpiller ? (
            <>
              <TnFlatehode tittel="Fellestesting" />
              <TnMangler>Trenerteamet fører testdagene. Egne Team Norway-tester registrerer du i PlayerHQ.</TnMangler>
              <Link href="/portal/tren/tester/team-norway" style={{ alignSelf: "flex-start", color: TN.navy900, fontFamily: TN.font.display, fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", minHeight: 44, display: "inline-flex", alignItems: "center", marginTop: 8 }}>
                Mine tester →
              </Link>
            </>
          ) : testdag ? (
            <>
              <TnFlatehode tittel={`Fellestest · ${testdag.dag.title}`} merknad={`TESTDAG ${datoKort(testdag.dag.scheduledAt)}`} />
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "4px 10px", marginTop: 18 }}>
                <span style={{ fontFamily: TN.font.mono, fontSize: 36, color: TN.ink900, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                  {testdag.dag.deltakere.length - mangler.length} / {testdag.dag.deltakere.length}
                </span>
                <span style={{ fontSize: 14, color: TN.textSecondary }}>har gjennomført {testdag.dag.protokollNavn}</span>
              </div>
              <div role="progressbar" aria-label="Gjennomført" aria-valuemin={0} aria-valuemax={testdag.dag.deltakere.length} aria-valuenow={testdag.dag.deltakere.length - mangler.length} style={{ height: 6, background: TN.navy100, borderRadius: TN.radius.sm, marginTop: 14, overflow: "hidden" }}>
                <div style={{ width: `${testdag.dag.deltakere.length === 0 ? 0 : ((testdag.dag.deltakere.length - mangler.length) / testdag.dag.deltakere.length) * 100}%`, height: "100%", background: TN.navy900 }} />
              </div>
              <TnEtikett style={{ marginTop: 20, paddingBottom: 6, borderBottom: `1px solid ${TN.navy100}` }}>Mangler</TnEtikett>
              {mangler.slice(0, 6).map((d) => (
                <div key={d.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${TN.navy100}` }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 700, overflowWrap: "anywhere" }}>{d.spillerNavn}</div>
                    <div style={{ fontSize: 13, color: TN.textSecondary, marginTop: 2 }}>{klubbPerSpiller.get(d.spillerId) ?? "Klubb ikke registrert"}</div>
                  </div>
                  <div style={{ fontFamily: TN.font.mono, fontSize: 11.5, color: TN.textSecondary, textAlign: "right", whiteSpace: "nowrap" }}>{MANGEL[d.status as keyof typeof MANGEL]}</div>
                </div>
              ))}
              {mangler.length === 0 ? <TnMangler>Alle på testdagen har gjennomført.</TnMangler> : null}
              {mangler.length > 6 ? <TnFotnote>Og {mangler.length - 6} til.</TnFotnote> : null}
              <Link href={`/team-norway/fellestesting?dag=${testdag.dag.id}`} style={{ alignSelf: "flex-start", color: TN.navy900, fontFamily: TN.font.display, fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", minHeight: 44, display: "inline-flex", alignItems: "center", marginTop: 8 }}>
                Punch resultater →
              </Link>
            </>
          ) : (
            <>
              <TnFlatehode tittel="Fellestesting" />
              <TnMangler>Ingen testdag er planlagt for gruppen.</TnMangler>
              <Link href="/team-norway/fellestesting" style={{ alignSelf: "flex-start", color: TN.navy900, fontFamily: TN.font.display, fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", minHeight: 44, display: "inline-flex", alignItems: "center", marginTop: 8 }}>
                Til fellestesting →
              </Link>
            </>
          )}
        </TnFlate>

        <TnFlate style={{ gridColumn: "1 / -1" }}>
          <TnFlatehode tittel="Aktivitetsstrøm" merknad={poster.length > 0 ? `SISTE ${poster.length}` : undefined} />
          {postside === null ? (
            <TnMangler>Gruppepostene vises bare for medlemmer av gruppen.</TnMangler>
          ) : poster.length === 0 ? (
            <TnMangler>Trenerteamet har ikke skrevet noe til gruppen ennå.</TnMangler>
          ) : (
            poster.map((p) => (
              <div key={p.id} style={{ display: "flex", gap: 16, padding: "16px 0", borderBottom: `1px solid ${TN.navy100}` }}>
                <TnInitialer navn={p.authorNavn} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", alignItems: "baseline" }}>
                    <span style={{ fontSize: 14.5, fontWeight: 700 }}>{p.authorNavn}</span>
                    <span style={{ fontFamily: TN.font.mono, fontSize: 10.5, letterSpacing: "0.08em", color: TN.textSecondary, textTransform: "uppercase" }}>
                      {postside.forfatterRoller[p.authorUserId] ?? "Trener"} · {postTid(p.createdAt, naa)}
                    </span>
                  </div>
                  <p style={{ fontSize: 14.5, lineHeight: 1.6, margin: "4px 0 0", maxWidth: "72ch", overflowWrap: "anywhere", whiteSpace: "pre-line", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.tekst}</p>
                </div>
              </div>
            ))
          )}
          {postside ? (
            <Link href={`/team-norway/${kontekst.gruppe.id}`} style={{ color: TN.navy900, fontFamily: TN.font.display, fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", minHeight: 44, display: "inline-flex", alignItems: "center", marginTop: 8 }}>
              Alle gruppeposter →
            </Link>
          ) : null}
        </TnFlate>
      </div>
    </SkjermRamme>
  );
}
