import Link from "next/link";
import { Dumbbell, Flag, Goal, MapPin, Target, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { hentElevOkter, hentGruppeElever } from "@/app/team-wang/_data/wang-idag-trening-data";
import {
  OMRADE_NAVN,
  ddmmaaaa,
  erAvvist,
  erForfalt,
  erGjennomfort,
  erMorgenokt,
  forsteVerdi,
  gruppeokter,
  leggTilDager,
  mandagI,
  osloIso,
  somOmrade,
  tidsrom,
  DAG_KORT,
  ukedag,
  ddmm,
  type Omrade,
  type WangOkt,
} from "@/app/team-wang/_data/wang-trening-beregning";
import { Chips, Sidehode, it as s, lastTrygt } from "@/app/team-wang/_components/wang-idag-trening/it-ui";
import type { WangSkjermKontekst } from "@/app/team-wang/_components/wang-idag-trening/it-ui";
import { WangDemoMerknad, WangFeil, WangKnapp, WangStatus, WangTom, type WangStatusTone } from "@/components/wang/trener/wang-ui";
import { elevprofilHref, wangHref } from "@/lib/wang/wang-ruter";

type Sok = { okt?: string | string[] };

const OMRADE_IKON: Record<Omrade, LucideIcon> = { FYS: Dumbbell, TEK: Wrench, SLAG: Target, SPILL: Goal, TURN: Flag };

function status(o: WangOkt, forfalt: boolean): { tone: WangStatusTone; tekst: string } {
  if (erGjennomfort(o)) return { tone: "ferdig", tekst: "Til stede" };
  if (erAvvist(o)) return { tone: "fravaer", tekst: "Fravær" };
  return forfalt ? { tone: "varsel", tekst: "Ikke ført" } : { tone: "planlagt", tekst: "Planlagt" };
}

/** WANG-04 Morgenøkter. Fasit: «WANG Golf Batch 2.dc.html» #morgen (6cfa623c). Rute: /team-wang/trening/morgenokter */
export async function WangMorgenokter({ gruppe, erDemo, sok }: WangSkjermKontekst & { sok: Sok }) {
  const naa = new Date();
  const idag = osloIso(naa);
  const fra = leggTilDager(mandagI(idag), -7);
  const til = leggTilDager(mandagI(idag), 13);

  const last = await lastTrygt(async () => {
    const elever = await hentGruppeElever(gruppe.id);
    return { elever, okter: await hentElevOkter(elever.map((e) => e.id), fra, til) };
  });

  if (!last.ok) {
    return (
      <div className={s.stabel}>
        <Sidehode meta={`WANG-04 · ${gruppe.name}`} tittel="Morgenøkter" />
        <WangFeil tittel="Vi fikk ikke hentet morgenøktene." tekst="Planen er ikke borte. Prøv igjen om litt." handling={<WangKnapp href={wangHref("WANG-04")}>Prøv igjen</WangKnapp>} />
      </div>
    );
  }

  const { elever, okter } = last.data;
  const navn = new Map(elever.map((e) => [e.id, e.navn]));
  const morgen = gruppeokter(okter).filter(erMorgenokt);
  const standard = morgen.find((g) => g.dato >= idag) ?? morgen[morgen.length - 1] ?? null;
  const valgt = morgen.find((g) => g.key === forsteVerdi(sok.okt)) ?? standard;

  if (!valgt) {
    return (
      <div className={s.stabel}>
        <Sidehode meta={`WANG-04 · ${gruppe.name}`} tittel="Morgenøkter" />
        {erDemo ? <WangDemoMerknad /> : null}
        <section className={s.kort}>
          <WangTom tittel="Ingen morgenøkter de nærmeste ukene." tekst="Elevene har ingen økter som starter før kl. 10 fra forrige uke til og med neste uke." handling={<WangKnapp href={wangHref("WANG-18")}>Se alle økter</WangKnapp>} />
        </section>
      </div>
    );
  }

  const forfalt = erForfalt(valgt, naa);
  const naerme = morgen.filter((g) => g.dato >= mandagI(valgt.dato) && g.dato <= leggTilDager(mandagI(valgt.dato), 6));
  const chips = naerme.map((g) => ({ href: wangHref("WANG-04", {}, { okt: g.key }), etikett: `${DAG_KORT[ukedag(g.dato)]} ${ddmm(g.dato)}`, aktiv: g.key === valgt.key }));
  const forrige = morgen.filter((g) => g.dato < mandagI(valgt.dato)).at(-1);
  const neste = morgen.find((g) => g.dato > leggTilDager(mandagI(valgt.dato), 6));
  if (forrige) chips.unshift({ href: wangHref("WANG-04", {}, { okt: forrige.key }), etikett: "Forrige uke", aktiv: false });
  if (neste) chips.push({ href: wangHref("WANG-04", {}, { okt: neste.key }), etikett: "Neste uke", aktiv: false });

  const perOmr = new Map<Omrade | "ANNET", WangOkt[]>();
  for (const o of valgt.okter) {
    const k = somOmrade(o.omrade) ?? "ANNET";
    perOmr.set(k, [...(perOmr.get(k) ?? []), o]);
  }
  const gjort = valgt.okter.filter(erGjennomfort).length;
  const borte = valgt.okter.filter(erAvvist).length;
  const rader = [...valgt.okter].sort((a, b) => (navn.get(a.elevId) ?? "").localeCompare(navn.get(b.elevId) ?? "", "nb"));

  return (
    <div className={s.stabel}>
      <Sidehode
        meta={`WANG-04 · ${gruppe.name} · ${ddmmaaaa(valgt.dato)} · ${tidsrom(valgt.startMin, valgt.varighetMin)}`}
        tittel={valgt.tittel}
        undertittel={
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--wtr-font-display)", fontSize: 13, fontWeight: 500, color: "var(--wtr-text-muted)" }}>
            <MapPin size={16} strokeWidth={1.5} aria-hidden="true" />
            {valgt.sted ?? "Sted ikke satt"} · {valgt.okter.length} {valgt.okter.length === 1 ? "elev" : "elever"}
          </span>
        }
        hoyre={<Chips valg={chips} etikett="Morgenøkt" />}
      />
      {erDemo ? <WangDemoMerknad /> : null}

      <section className={s.kort} style={{ padding: "20px 24px", display: "grid", gap: 8 }}>
        <h2 className={s.h2}>Rotasjon</h2>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: "var(--wtr-text-muted)" }}>
          Rotasjon, blokker og stasjonsansvar lagres ikke i appen ennå. Under står elevenes oppgaver i økta, gruppert etter område.
        </p>
      </section>

      <div className={s.split8}>
        <section style={{ display: "grid", gap: 14, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <h2 className={s.h2stor}>Stasjoner · {tidsrom(valgt.startMin, valgt.varighetMin)}</h2>
            <span className={s.meta} style={{ fontSize: 12.5 }}>Oppgaver hentet fra elevenes økter i PlayerHQ</span>
          </div>
          <div className={s.g2} style={{ gap: 16 }}>
            {[...perOmr.entries()].map(([omr, liste]) => {
              const Ikon = omr === "ANNET" ? Target : OMRADE_IKON[omr];
              return (
                <article key={omr} className={s.morgenKort} style={{ padding: 20, gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <span style={{ width: 40, height: 40, borderRadius: 4, background: "var(--wtr-blue-tint)", display: "grid", placeItems: "center", flex: "none" }}>
                      <Ikon size={22} strokeWidth={1.5} aria-hidden="true" color="var(--wtr-blue)" />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontFamily: "var(--wtr-font-display)", fontWeight: 500, fontSize: 17, color: "var(--wtr-blue)" }}>{omr === "ANNET" ? "Annet" : OMRADE_NAVN[omr]}</p>
                      <p className={s.meta} style={{ margin: "2px 0 0", fontSize: 12.5 }}>{liste[0].sted ?? valgt.sted ?? "Sted ikke satt"}</p>
                    </div>
                    <span className={s.tall} style={{ fontSize: 12, fontWeight: 700, color: "var(--wtr-green)", whiteSpace: "nowrap" }}>{liste.length} {liste.length === 1 ? "elev" : "elever"}</span>
                  </div>
                  <div style={{ display: "grid", borderTop: "1px solid var(--wtr-grey-line)" }}>
                    {liste.map((o) => {
                      const st = status(o, forfalt);
                      return (
                        <div key={o.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--wtr-grey-line)", display: "grid", gap: 4 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <Link href={elevprofilHref(o.elevId)} className={s.navnLenke} style={{ fontSize: 14 }}>{navn.get(o.elevId) ?? "Ukjent elev"}</Link>
                            {omr !== "ANNET" ? <span className={s.ptag}>{omr}</span> : null}
                            {st.tone === "fravaer" ? <WangStatus tone="fravaer">Fravær</WangStatus> : null}
                          </div>
                          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.45, color: "var(--wtr-blue)" }}>{o.maal ?? o.tittel}</p>
                          <p className={s.meta} style={{ margin: 0, fontSize: 12 }}>{tidsrom(o.startMin, o.varighetMin)}</p>
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className={`${s.kort} ${s.kortSkjult}`}>
          <div style={{ padding: "20px 20px 14px" }}>
            <h2 className={s.h2}>Oppmøte</h2>
            <p className={s.tall} style={{ margin: "4px 0 0", fontSize: 13, fontWeight: 500, color: "var(--wtr-text-muted)" }}>
              {forfalt ? `${gjort} til stede · ${borte} fravær · ${valgt.okter.length - gjort - borte} ikke ført` : `${valgt.okter.length} påmeldt · økta har ikke startet`}
            </p>
          </div>
          {rader.map((o) => {
            const st = status(o, forfalt);
            return (
              <div key={o.id} style={{ borderTop: "1px solid var(--wtr-grey-line)", padding: "12px 20px", display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontFamily: "var(--wtr-font-display)", fontSize: 14, fontWeight: 500, color: "var(--wtr-blue)" }}>{navn.get(o.elevId) ?? "Ukjent elev"}</span>
                <WangStatus tone={st.tone}>{st.tekst}</WangStatus>
              </div>
            );
          })}
          <div style={{ borderTop: "1px solid var(--wtr-grey-line)", padding: "16px 20px", background: "var(--wtr-blue-tint)" }}>
            <p className={s.meta} style={{ margin: 0, fontSize: 12 }}>Eleven registrerer gjennomføring eller fravær i PlayerHQ. Føring fra trener finnes ikke i appen ennå.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
