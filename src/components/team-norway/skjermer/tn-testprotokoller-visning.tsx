import Link from "next/link";

import type { hentTnProtokollbibliotek, hentTnProtokolldetalj, TnArbeidskontekst } from "@/lib/domain/tn-arbeidsflate";
import type { TnField, TnKind } from "@/lib/portal-tester/tn-catalog";
import { TESTBATTERI } from "@/lib/portal-tester/testbatteri";
import { TN } from "@/lib/v2/team-norway";
import { TnPille } from "../core";
import { TnFilterknapper, TnFlate, TnFlatehode, TnFotnote, TnMangler, TnRutenett } from "../tn-flate";
import { TnHandlingLenke } from "../tn-handlinger";
import { TnShell, tnRolleNavn } from "../tn-shell";
import { TnSkraKort, TnSkraTopp } from "../tn-skra-topp";
import { TnHeltTall, TnHeltTekst, TnHeltTellere } from "../tn-stall";

/**
 * TN-15 Testprotokoller, liste og én protokoll, i retning «Skrå» (godkjent av Anders 20.10.2026,
 * canvaset «Team Norway nøkkelskjermer», tavle B1). Ren visning: tn-testprotokoller-skjerm.tsx henter data.
 * Prøvefil: tests/visual/team-norway/skjermer/TN-15.tsx.
 *
 * Avvik:
 *   - Katalogen har én versjon for hele batteriet, ikke én per protokoll.
 *   - Formål, utstyr, gjennomføringssteg og ansvarlig trener finnes ikke i protokollkilden.
 *     Protokollen viser det kilden har: forsøk, målavstander, registreringsfelt og kilden.
 *   - «Landslagsstandard» er målavstandene i protokollen, ikke nivåkrav. Nivåkrav står på Referansenivåer.
 *   - «Bruk i fellestesting» åpner testføringen i PlayerHQ, der målingen lagres.
 *   - Valgt protokoll merkes med lys navy bakgrunn og fet tekst, ikke farget venstrekant.
 */

type Bibliotek = ReturnType<typeof hentTnProtokollbibliotek>;
type Detalj = NonNullable<ReturnType<typeof hentTnProtokolldetalj>>;
type Status = "KLAR" | "UTKAST" | null;

const TYPENAVN: Record<TnKind, string> = {
  near: "Nærspill",
  carry: "Carry",
  putts: "Putting",
  course: "Bane",
  "free-course": "Bane",
  "length-putt": "Lengdeputt",
  points: "Poeng",
  gate: "Port",
  speed: "Hastighet",
  technique: "Teknikk",
};

function format(felt: TnField) {
  if (felt.choices) return felt.choices.join(" / ");
  if (felt.unit) return felt.integer ? `Heltall, ${felt.unit}` : `Tall, ${felt.unit}`;
  return felt.integer ? "Heltall" : "Tall";
}

export function TnTestprotokollerVisning({ brukerNavn, visDataGolf, kontekst, bibliotek, status, detalj, egenSide = false }: { brukerNavn: string | null; visDataGolf: boolean; kontekst: TnArbeidskontekst; bibliotek: Bibliotek; status: Status; detalj: Detalj | null; egenSide?: boolean }) {
  const liste = bibliotek.rader.filter((p) => !status || p.status === status);
  const klare = bibliotek.rader.filter((p) => p.status === "KLAR").length;
  const utkast = bibliotek.rader.length - klare;
  const statusParam = status?.toLowerCase();
  const adresse = (endring: Record<string, string | undefined>) => {
    const p = new URLSearchParams(Object.entries({ status: statusParam, valgt: detalj?.id, ...endring }).filter((e): e is [string, string] => Boolean(e[1])));
    return `/team-norway/protokoller${p.size ? `?${p.toString()}` : ""}`;
  };
  // Batteriets rekkefølge (testbatteri.ts): Golfslag, Teknikk, deretter protokoller utenfor batteriet.
  const plass = (id: string) => TESTBATTERI.findIndex((t) => t.protokoller.includes(id));
  const grupper = (["Golfslag", "Teknikk", null] as const).map((del) => ({
    tittel: del ?? "Utenfor batteriet",
    rader: liste
      .filter((p) => (del === null ? plass(p.id) < 0 : TESTBATTERI[plass(p.id)]?.del === del))
      .sort((a, b) => (plass(a.id) - plass(b.id)) || a.navn.localeCompare(b.navn, "nb")),
  }));
  const feltene = detalj ? [...new Map(detalj.rows.flatMap((r) => r.fields).map((f) => [f.key, f])).values()] : [];
  const maal = detalj ? detalj.rows.filter((r) => r.target !== undefined) : [];

  return (
    <TnShell aktiv="protokoller" brukerNavn={brukerNavn ?? "Ukjent"} rolle={tnRolleNavn(kontekst.rolle)} groupId={kontekst.gruppe.id} visTrenerflater={!kontekst.erSpiller} kanAdministrere={kontekst.kanAdministrere} visDataGolf={!kontekst.erSpiller && visDataGolf} tilbake={egenSide ? { href: "/team-norway/protokoller", label: "Testprotokoller" } : undefined}>
      <TnSkraTopp
        bilde="putting-green"
        etikett="Testprotokoller"
        overlinje={`Plan og fag · versjon ${bibliotek.versjon}`}
        tittel={egenSide && detalj ? detalj.name : "Testprotokoller"}
        ingress="Testene slik de skal gjennomføres. Bare protokoller med status Klar brukes i fellestesting."
        venstre={
          <>
            <TnHeltTall verdi={klare} enhet={`av ${bibliotek.rader.length}`}>protokoller er klare for fellestesting</TnHeltTall>
            <TnHeltTekst>{utkast ? `${utkast} er utkast og kan ikke brukes i fellestesting ennå.` : "Alle protokollene kan brukes i fellestesting."}</TnHeltTekst>
          </>
        }
        hoyre={<TnHeltTellere tall={[{ verdi: grupper[0]!.rader.length, tekst: "golfslag" }, { verdi: grupper[1]!.rader.length, tekst: "teknikk" }, { verdi: grupper[2]!.rader.length, tekst: "utenfor batteriet" }]} />}
      />
      <TnSkraKort>
        <TnRutenett min={340}>
          {!egenSide ? (
            <TnFlate style={{ display: "grid", gap: 12 }}>
              <TnFilterknapper
                etikett="Filtrer på status"
                valg={[
                  { href: adresse({ status: undefined, valgt: undefined }), label: "Alle", aktiv: status === null, antall: bibliotek.rader.length },
                  { href: adresse({ status: "klar", valgt: undefined }), label: "Klar", aktiv: status === "KLAR", antall: klare },
                  { href: adresse({ status: "utkast", valgt: undefined }), label: "Utkast", aktiv: status === "UTKAST", antall: utkast },
                ]}
              />
              <nav aria-label="Protokoller" style={{ display: "grid" }}>
                {grupper.filter((g) => g.rader.length > 0).map((g) => (
                  <section key={g.tittel} aria-label={g.tittel} style={{ display: "grid" }}>
                    <h2 style={{ margin: "14px 0 4px", fontSize: 13, fontWeight: 700, color: TN.ink700 }}>{g.tittel} <span style={{ fontFamily: TN.font.mono, color: TN.ink500 }}>{g.rader.length}</span></h2>
                {g.rader.map((p) => {
                  const aktiv = p.id === detalj?.id;
                  return (
                    <Link
                      key={p.id}
                      href={adresse({ valgt: p.id })}
                      scroll={false}
                      aria-current={aktiv ? "true" : undefined}
                      style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", minHeight: 56, padding: "8px 10px", margin: "0 -10px", borderTop: `1px solid ${TN.ink100}`, borderRadius: 10, background: aktiv ? TN.navy50 : "transparent", textDecoration: "none", color: TN.ink900 }}
                    >
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: aktiv ? TN.navy900 : TN.ink900, overflowWrap: "anywhere" }}>{p.navn}</span>
                        <span style={{ display: "block", fontSize: 12.5, color: TN.ink500, marginTop: 2 }}><span style={{ fontFamily: TN.font.mono }}>{p.forsok}</span> forsøk · {TYPENAVN[p.omrade]}</span>
                      </span>
                      <TnPille tone={p.status === "KLAR" ? "green" : "amber"}>{p.status === "KLAR" ? "Klar" : "Utkast"}</TnPille>
                    </Link>
                  );
                })}
                  </section>
                ))}
                {liste.length === 0 ? <TnMangler>Ingen protokoller med denne statusen.</TnMangler> : null}
              </nav>
            </TnFlate>
          ) : null}

          <TnFlate style={{ display: "grid", gap: 16 }}>
            {detalj ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <span style={{ display: "grid", gap: 4, minWidth: 0 }}>
                    <span style={{ fontSize: 13, color: TN.ink500 }}>{TYPENAVN[detalj.kind]} · versjon {bibliotek.versjon}</span>
                    <h2 style={{ margin: 0, fontFamily: TN.font.display, fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: TN.ink900, overflowWrap: "anywhere" }}>{detalj.name}</h2>
                  </span>
                  <TnPille tone={detalj.blocked ? "amber" : "green"}>{detalj.blocked ? "Utkast" : "Klar"}</TnPille>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 1, background: TN.ink200, borderRadius: 12, overflow: "hidden" }}>
                  {[
                    [String(detalj.rows.length), "forsøk"],
                    [TYPENAVN[detalj.kind], "type"],
                    [maal.length ? String(maal.length) : "—", "målavstander"],
                  ].map(([verdi, etikett]) => (
                    <div key={etikett} style={{ background: TN.white, padding: "12px 14px", minWidth: 0, display: "grid", gap: 4 }}>
                      <b style={{ fontFamily: TN.font.mono, fontWeight: 600, fontSize: 20, color: TN.navy900, fontVariantNumeric: "tabular-nums", overflowWrap: "anywhere" }}>{verdi}</b>
                      <span style={{ fontSize: 12, color: TN.ink500 }}>{etikett}</span>
                    </div>
                  ))}
                </div>

                <section style={{ display: "grid" }}>
                  <TnFlatehode tittel="Dette føres" />
                  {feltene.map((f) => (
                    <div key={f.key} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: "4px 16px", padding: "10px 0", borderTop: `1px solid ${TN.ink100}` }}>
                      <span style={{ fontSize: 14, fontWeight: 600, overflowWrap: "anywhere" }}>{f.label}{f.optional ? " (valgfritt)" : ""}</span>
                      <span style={{ fontFamily: TN.font.mono, fontSize: 12.5, color: TN.ink700, overflowWrap: "anywhere" }}>{format(f)}</span>
                    </div>
                  ))}
                </section>

                {maal.length > 0 ? (
                  <section style={{ display: "grid", gap: 8 }}>
                    <TnFlatehode tittel="Slag og lengde" />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 140px), 1fr))", gap: 6 }}>
                      {maal.slice(0, 18).map((r, i) => (
                        <span key={`${i}-${r.label}`} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "8px 10px", borderRadius: 8, background: TN.ink50, fontSize: 13 }}>
                          <span style={{ color: TN.ink700, minWidth: 0, overflowWrap: "anywhere" }}>{r.label.split(" · ")[0]}</span>
                          <b style={{ fontFamily: TN.font.mono, fontWeight: 600, whiteSpace: "nowrap" }}>{String(r.target).replace(".", ",")} m</b>
                        </span>
                      ))}
                    </div>
                    {maal.length > 18 ? <TnFotnote>Og {maal.length - 18} forsøk til. Hele lista står i testføringen.</TnFotnote> : null}
                  </section>
                ) : null}

                <TnFotnote>Kilde: {detalj.source}.</TnFotnote>

                {detalj.blocked ? (
                  <p style={{ margin: 0, padding: "12px 14px", borderRadius: 12, background: TN.ink50, fontSize: 14, lineHeight: 1.6, color: TN.ink700 }}>
                    Utkast kan ikke brukes i fellestesting ennå. {detalj.blocked}
                  </p>
                ) : (
                  <div><TnHandlingLenke href={`/portal/tren/tester/team-norway?test=${encodeURIComponent(detalj.id)}`}>Bruk i fellestesting</TnHandlingLenke></div>
                )}
              </>
            ) : (
              <>
                <TnFlatehode tittel="Protokoll" />
                <TnMangler>Ingen testprotokoller er publisert. <Link href="/team-norway/fellestesting" style={{ color: TN.navy600, fontWeight: 700 }}>Se fellestesting</Link></TnMangler>
              </>
            )}
          </TnFlate>
        </TnRutenett>
      </TnSkraKort>
    </TnShell>
  );
}
