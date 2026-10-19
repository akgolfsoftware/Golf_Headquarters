import Link from "next/link";
import { notFound } from "next/navigation";

import { hentWangDataGolf, type WangDgValg } from "@/app/team-wang/_data/wang-datagolf-data";
import type { WangDataGolfData, WangDgProff, WangDgSide } from "@/app/team-wang/_data/wang-datagolf-visning";
import { hentTnSpillere, hentTnTrenere, medTnSpillerData } from "@/lib/domain/tn-arbeidsflate";
import { hentDgSpillerVisning } from "@/lib/datagolf/spiller-mot-proff-data";
import { formaterFortegn, formaterTall } from "@/lib/format-tall";
import { TN } from "@/lib/v2/team-norway";
import { TnPille } from "../core";
import { TnFilterknapper, TnFlate, TnFlatehode, TnFotnote, TnMangler, TnSkjermhode, TnTekstlenke, TnListerad, type TnFilterValg } from "../tn-flate";
import { TnHelt, TnHeltSporsmaal, TnHeltTall, TnHeltTekst, TnHeltTellere } from "../tn-stall";
import { SkjermRamme, hentSkjermbruker } from "./felles";
import { TnDgSpillerSide, type DgSpillerSide } from "./tn-datagolf-spiller";

/**
 * TN-DG Data Golf for trener (pakke 9). Utkast 2, retning B (godkjent 16.10.2026).
 * Fasit: docs/design-system/utkast-tn/datagolf.html, DG-01 Oversikt, DG-02 Proffkatalog,
 * DG-03 Proffprofil, DG-04 Topplister, DG-05 Spiller mot proff, DG-06 Innspill-tak, DG-07 Fra funn til forslag
 * (tn-datagolf-spiller.tsx), DG-08 Norske proffer og DG-09 Kilde og dekning.
 * Samme data og regler som AgencyOS og WANG pakke 10: bare coach og admin
 * (krevDataGolfBruker på siden), «Powered by Data Golf» på hver skjerm, ingen eksport.
 *
 * Avvik:
 *   - DG-05–07 leser spillerens tall bare når spilleren har delt med treneren, og forslag går som
 *     forslag til spillerens Workbench (nattkjøring 18.–19.10, pakke T3).
 *   - DG-08 viser norske proffers siste resultater og kommende turneringer. Live-stilling er ikke koblet.
 *   - Tallene er Data Golfs modellerte ferdighetstall med kildedato og merket som modell.
 *   - Menypunktet vises på skjermene som går via SkjermRamme, tn-registrerte-skjermer og Analyse.
 *     Spillerprofil-, Workbench- og Gruppe-sidene bygger skallet selv og viser det ikke.
 *   - Dataene hentes med WANGs lesemodul (samme spørringer som AgencyOS), ikke en egen kopi.
 */

const nb = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short", year: "numeric" });
const dato = (d: Date | string | null | undefined) => (d ? nb.format(new Date(d)) : "—");
const sg = (v: number | null | undefined) => formaterFortegn(v, 2);
const tall = (v: number | null | undefined, d = 1) => formaterTall(v, d, true);
const tilPar = (n: number | null) => (n == null ? "—" : n === 0 ? "E" : n > 0 ? `+${n}` : `−${Math.abs(n)}`);

const SIDER: WangDgSide[] = ["oversikt", "proffer", "proff", "topp", "norske", "kilde"];
const SPILLER_SIDER: DgSpillerSide[] = ["spiller", "innspill", "forslag"];
const FANER: [WangDgSide | "spiller", string][] = [["oversikt", "Oversikt"], ["proffer", "Proffer"], ["topp", "Topplister"], ["spiller", "Spiller mot proff"], ["norske", "Norske proffer"], ["kilde", "Kilde"]];

const adresse = (side: WangDgSide | DgSpillerSide, ekstra: Record<string, string | number> = {}) => {
  const p = new URLSearchParams({ side, ...Object.fromEntries(Object.entries(ekstra).map(([k, v]) => [k, String(v)])) });
  return `/team-norway/datagolf?${p.toString()}`;
};

const forste = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export async function TnDatagolfSkjerm({ sokeparametre }: { sokeparametre: Record<string, string | string[] | undefined> }) {
  const bruker = await hentSkjermbruker();
  const kontekst = await hentTnTrenere(bruker);
  if (!kontekst || kontekst.kontekst.erSpiller) notFound();

  const sideParam = forste(sokeparametre.side);
  const spillerSide = SPILLER_SIDER.find((s) => s === sideParam);
  if (spillerSide) {
    const spillere = (await hentTnSpillere(bruker))?.rader.map((r) => ({ id: r.id, navn: r.navn })) ?? [];
    const proffId = Number.parseInt(forste(sokeparametre.pro) ?? "", 10);
    const v = await hentDgSpillerVisning({
      bruker, spillere, spillerId: forste(sokeparametre.spiller), proffId: Number.isFinite(proffId) ? proffId : undefined,
      medSpiller: (id, les) => medTnSpillerData(bruker, id, (tx) => les(tx)),
    });
    if (!v) notFound();
    return (
      <SkjermRamme aktiv="datagolf" brukerNavn={bruker.name} kontekst={kontekst.kontekst}>
        <TnDgSpillerSide side={spillerSide} v={v} faner={<TnFilterknapper etikett="Data Golf" valg={FANER.map(([id, label]) => ({ href: adresse(id), label, aktiv: id === "spiller" }))} />} />
        <PoweredBy />
      </SkjermRamme>
    );
  }
  const side: WangDgSide = SIDER.find((s) => s === sideParam) ?? "oversikt";
  const valg: WangDgValg = {
    id: forste(sokeparametre.id),
    sok: forste(sokeparametre.sok),
    tour: forste(sokeparametre.tour),
    norske: forste(sokeparametre.norske),
    kat: forste(sokeparametre.kat),
    aar: forste(sokeparametre.aar),
  };
  const d = await hentWangDataGolf(side, valg);

  return (
    <SkjermRamme aktiv="datagolf" brukerNavn={bruker.name} kontekst={kontekst.kontekst}>
      {d.side === "oversikt" ? <Oversikt d={d} /> : null}
      {d.side === "proffer" ? <Katalog d={d} /> : null}
      {d.side === "proff" ? <Proff d={d} /> : null}
      {d.side === "topp" ? <Topplister d={d} /> : null}
      {d.side === "norske" ? <Norske d={d} /> : null}
      {d.side === "kilde" ? <Kilde d={d} /> : null}
      <PoweredBy />
    </SkjermRamme>
  );
}

function PoweredBy() {
  return (
    <TnFotnote>
      Powered by <a href="https://datagolf.com" target="_blank" rel="noopener noreferrer" style={{ color: TN.navy600 }}>Data Golf</a> · ingen eksport · bare for trenere
    </TnFotnote>
  );
}

function Hode({ aktiv, tittel, ingress }: { aktiv: WangDgSide; tittel: string; ingress: string }) {
  return (
    <>
      <TnSkjermhode overlinje="Analyse · Data Golf · bare trenere" tittel={tittel} ingress={ingress} />
      <TnFilterknapper etikett="Data Golf" valg={FANER.map(([id, label]) => ({ href: adresse(id), label, aktiv: id === aktiv }))} />
    </>
  );
}

function ProffListe({ rader }: { rader: WangDgProff[] }) {
  return (
    <TnFlate style={{ paddingBlock: 4 }}>
      {rader.map((p) => (
        <Link key={p.dgId} href={adresse("proff", { id: p.dgId })} style={{ color: "inherit", textDecoration: "none", display: "block", minHeight: 44 }}>
          <TnListerad
            foran={<span style={{ fontFamily: TN.font.mono, fontSize: 18, color: TN.navy900, minWidth: 32 }}>{p.dgRang ?? "—"}</span>}
            tittel={p.navn}
            tekst={`${[p.land, p.tour?.toUpperCase()].filter(Boolean).join(" · ") || "—"}${p.norsk ? " · norsk" : ""}`}
            hoyre={<span style={{ fontFamily: TN.font.mono, fontSize: 18 }}>{sg(p.sgTotal)}</span>}
          />
        </Link>
      ))}
    </TnFlate>
  );
}

function Oversikt({ d }: { d: Extract<WangDataGolfData, { side: "oversikt" }> }) {
  return (
    <>
      <Hode aktiv="oversikt" tittel="Data Golf" ingress="Proffenes målte og modellerte tall, til å sette spillerens gap og trening i sammenheng." />
      {d.antallProffer === 0 ? (
        <TnFlate><TnMangler>Ingen synk ennå. Data Golf-tallene hentes ukentlig, og vises her når første synk er gjort.</TnMangler></TnFlate>
      ) : (
        <>
          <TnHelt
            etikett="Data Golf"
            venstre={
              <>
                <TnHeltSporsmaal>Hvor ferske er proff-tallene?</TnHeltSporsmaal>
                <TnHeltTall verdi={d.antallProffer}>proffer med tall, kildedato {dato(d.kildedato)}</TnHeltTall>
                <TnHeltTekst>{d.forsinket ? "Tallene er eldre enn 14 dager." : "Tallene er oppdatert siste 14 dager."} Siste synk {dato(d.sistSynk)}{d.feiletSynk > 0 ? `, ${d.feiletSynk} feilet` : ""}.</TnHeltTekst>
              </>
            }
            hoyre={
              <TnHeltTellere
                tall={[
                  { verdi: d.norske.length, tekst: "norske proffer" },
                  { verdi: d.endepunkter, tekst: "endepunkter" },
                  { verdi: d.feiletSynk, tekst: "feilet synk" },
                ]}
              />
            }
          />
          <section style={{ display: "grid", gap: 12 }}>
            <TnFlatehode tittel="Norske proffer" merknad="SG total, modellert" />
            {d.norske.length === 0 ? <TnFlate><TnMangler>Ingen norske proffer er koblet ennå.</TnMangler></TnFlate> : <ProffListe rader={d.norske} />}
            <TnTekstlenke href={adresse("proffer")}>Proffkatalog</TnTekstlenke>
          </section>
        </>
      )}
    </>
  );
}

function Katalog({ d }: { d: Extract<WangDataGolfData, { side: "proffer" }> }) {
  const felt = { minHeight: 44, padding: "0 12px", border: `1px solid ${TN.ink200}`, borderRadius: TN.radius.sm, background: TN.white, font: "inherit", minWidth: 0, width: "100%" } as const;
  return (
    <>
      <Hode aktiv="proffer" tittel="Proffer" ingress="Søk og filtrer på tour." />
      <form action="/team-norway/datagolf" style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", alignItems: "end" }}>
        <input type="hidden" name="side" value="proffer" />
        <label style={{ display: "grid", gap: 4, fontSize: 13, fontWeight: 700 }}>Søk<input style={felt} name="sok" type="search" defaultValue={d.valg.sok ?? ""} placeholder="Navn" /></label>
        <label style={{ display: "grid", gap: 4, fontSize: 13, fontWeight: 700 }}>Tour
          <select style={felt} name="tour" defaultValue={d.valg.tour ?? ""}>
            <option value="">Alle</option>
            {d.turer.map((t) => <option key={t} value={t}>{t.toUpperCase()}</option>)}
          </select>
        </label>
        <label style={{ display: "grid", gap: 4, fontSize: 13, fontWeight: 700 }}>Rekkefølge
          <select style={felt} name="norske" defaultValue={d.valg.norskForst ? "1" : ""}>
            <option value="">SG total</option>
            <option value="1">Norske først</option>
          </select>
        </label>
        <button type="submit" style={{ minHeight: 44, border: `1px solid ${TN.navy900}`, background: TN.navy900, color: TN.white, fontWeight: 700, fontFamily: "inherit", borderRadius: TN.radius.sm, cursor: "pointer" }}>Vis</button>
      </form>
      {d.rader.length === 0 ? (
        <TnFlate><TnMangler>Ingen treff. Prøv et annet navn eller fjern filteret.</TnMangler></TnFlate>
      ) : (
        <>
          <TnFotnote>{d.rader.length} proffer · sortert på SG total (modellert)</TnFotnote>
          <ProffListe rader={d.rader} />
        </>
      )}
    </>
  );
}

const BAND: Record<string, string> = { innspill50: "50–100 yds", innspill100: "100–150 yds", innspill150: "150–200 yds", innspill200: "200+ yds" };

function Proff({ d }: { d: Extract<WangDataGolfData, { side: "proff" }> }) {
  const p = d.proff;
  if (!p) {
    return (
      <>
        <TnSkjermhode overlinje="Analyse · Data Golf" tittel="Fant ikke proffen" ingress="Proffen finnes ikke i Data Golf-tallene." />
        <TnTekstlenke href={adresse("proffer")}>Proffer</TnTekstlenke>
      </>
    );
  }
  const felt: [string, number | null][] = [["Utslag", p.sgOtt], ["Innspill", p.sgApp], ["Nærspill", p.sgArg], ["Putting", p.sgPutt]];
  return (
    <>
      <TnSkjermhode overlinje={[p.land, p.tour?.toUpperCase(), `kildedato ${dato(p.asOf)}`].filter(Boolean).join(" · ")} tittel={p.navn} ingress="Strokes Gained per runde, modellert av Data Golf. Ikke målt." />
      <TnHelt
        etikett="Strokes Gained"
        venstre={
          <>
            <TnHeltSporsmaal>Hvor god er proffen totalt?</TnHeltSporsmaal>
            <TnHeltTall verdi={sg(p.sgTotal)}>SG total per runde, modell</TnHeltTall>
          </>
        }
        hoyre={
          <TnHeltTellere
            tall={[
              { verdi: p.dgRang ?? "—", tekst: "DG-rang" },
              { verdi: p.owgr ?? "—", tekst: "OWGR" },
              { verdi: p.driverYards == null ? "—" : `${tall(p.driverYards, 0)}`, tekst: "driver, yds" },
            ]}
          />
        }
      />
      <section style={{ display: "grid", gap: 12 }}>
        <TnFlatehode tittel="Ferdigheter" merknad="SG per runde, modell" />
        <TnFlate style={{ paddingBlock: 4 }}>
          {felt.map(([l, v]) => <TnListerad key={l} tittel={l} hoyre={<span style={{ fontFamily: TN.font.mono, fontSize: 18 }}>{sg(v)}</span>} />)}
        </TnFlate>
      </section>
      <section style={{ display: "grid", gap: 12 }}>
        <TnFlatehode tittel="Innspill per avstand" merknad="Nærhet til hullet" />
        {p.innspill.length === 0 ? (
          <TnFlate><TnMangler>Proffen har ingen innspillsdata.</TnMangler></TnFlate>
        ) : (
          <TnFlate style={{ paddingBlock: 4 }}>
            {[...p.innspill].sort((a, b) => a.band.localeCompare(b.band) || a.lie.localeCompare(b.lie)).map((b) => (
              <TnListerad
                key={`${b.band}-${b.lie}`}
                tittel={`${BAND[b.band] ?? b.band} · ${b.lie === "fairway" ? "Fairway" : "Rough"}`}
                tekst={`${b.slag ?? "—"} slag · GIR ${b.gir == null ? "—" : `${tall(b.gir * 100, 0)} %`}`}
                hoyre={<span style={{ fontFamily: TN.font.mono, fontSize: 18 }}>{b.meter == null ? "—" : `${tall(b.meter)} m`}</span>}
              />
            ))}
          </TnFlate>
        )}
      </section>
      <section style={{ display: "grid", gap: 12 }}>
        <TnFlatehode tittel="Sesongtall" merknad="Per tour og år" />
        {p.sesonger.length === 0 ? (
          <TnFlate><TnMangler>Ingen sesongtall lagret.</TnMangler></TnFlate>
        ) : (
          <TnFlate style={{ paddingBlock: 4 }}>
            {p.sesonger.map((s) => (
              <TnListerad
                key={`${s.tour}-${s.aar}`}
                tittel={`${s.aar} · ${s.tour.toUpperCase()}`}
                tekst={`${s.runder ?? "—"} runder · snitt ${tall(s.snitt, 2)} · fairway ${tall(s.fairway, 0)} % · GIR ${tall(s.gir, 0)} %`}
                hoyre={<span style={{ fontFamily: TN.font.mono, fontSize: 18 }}>{sg(s.sgTotal)}</span>}
              />
            ))}
          </TnFlate>
        )}
      </section>
      <TnTekstlenke href={adresse("proffer")}>Proffer</TnTekstlenke>
    </>
  );
}

function Topplister({ d }: { d: Extract<WangDataGolfData, { side: "topp" }> }) {
  const lenke = (k: string, t = d.tour, a = d.aar) => adresse("topp", { kat: k, tour: t, aar: a });
  const kategorier: TnFilterValg[] = d.kategorier.map((k) => ({ href: lenke(k.id), label: k.label, aktiv: k.id === d.aktiv }));
  const turer: TnFilterValg[] = [
    ...d.turValg.map((t) => ({ href: lenke(d.aktiv, t), label: t.toUpperCase(), aktiv: t === d.tour })),
    ...d.aarValg.map((a) => ({ href: lenke(d.aktiv, d.tour, a), label: String(a), aktiv: a === d.aar })),
  ];
  return (
    <>
      <Hode aktiv="topp" tittel="Topplister" ingress="Seks kategorier per tour og år." />
      <TnFilterknapper etikett="Kategori" valg={kategorier} />
      <TnFilterknapper etikett="Tour og år" valg={turer} />
      {d.rader.length === 0 ? (
        <TnFlate><TnMangler>Ingen tall for valget. Velg en annen tour eller et annet år.</TnMangler></TnFlate>
      ) : (
        <>
          <TnFotnote>Oppdatert {dato(d.oppdatert)} · minst 20 runder der runder er kjent</TnFotnote>
          <TnFlate style={{ paddingBlock: 4 }}>
            {d.rader.map((r, i) => (
              <Link key={r.dgId} href={adresse("proff", { id: r.dgId })} style={{ color: "inherit", textDecoration: "none", display: "block", minHeight: 44 }}>
                <TnListerad
                  foran={<span style={{ fontFamily: TN.font.mono, fontSize: 18, color: TN.navy900, minWidth: 28 }}>{i + 1}</span>}
                  tittel={r.navn}
                  tekst={`${r.land ?? "—"} · ${r.runder ?? "—"} runder`}
                  hoyre={<span style={{ fontFamily: TN.font.mono, fontSize: 18 }}>{d.aktiv === "sgTotal" ? sg(r.verdi) : tall(r.verdi, d.aktiv === "avgScore" || d.aktiv === "puttsPerRound" ? 2 : 1)}</span>}
                />
              </Link>
            ))}
          </TnFlate>
        </>
      )}
    </>
  );
}

function Norske({ d }: { d: Extract<WangDataGolfData, { side: "norske" }> }) {
  return (
    <>
      <Hode aktiv="norske" tittel="Norske proffer" ingress="Siste resultater og kommende turneringer." />
      <section style={{ display: "grid", gap: 12 }}>
        <TnFlatehode tittel="Siste resultater" merknad="Målt, brutto" />
        {d.spillere.length === 0 ? (
          <TnFlate><TnMangler>Ingen norske proffer er koblet til Data Golf ennå.</TnMangler></TnFlate>
        ) : (
          <TnFlate style={{ paddingBlock: 4 }}>
            {d.spillere.map((s) => (
              <TnListerad
                key={s.id}
                foran={<span style={{ fontFamily: TN.font.mono, fontSize: 18, color: TN.navy900, minWidth: 28 }}>{s.resultater[0]?.plass ?? "—"}</span>}
                tittel={s.navn}
                tekst={s.resultater.length === 0 ? "Ingen resultater lagret" : s.resultater.map((e) => `${e.turnering} (${dato(e.dato)}) ${tilPar(e.tilPar)}`).join(" · ")}
                hoyre={<span style={{ fontFamily: TN.font.mono, fontSize: 18 }}>{tilPar(s.resultater[0]?.tilPar ?? null)}</span>}
              />
            ))}
          </TnFlate>
        )}
      </section>
      <section style={{ display: "grid", gap: 12 }}>
        <TnFlatehode tittel="Kommende turneringer" />
        {d.kommende.length === 0 ? (
          <TnFlate><TnMangler>Ingen kommende turneringer i kalenderen.</TnMangler></TnFlate>
        ) : (
          <TnFlate style={{ paddingBlock: 4 }}>
            {d.kommende.map((t) => <TnListerad key={t.id} tittel={t.navn} tekst={`${dato(t.dato)} · ${t.tour?.toUpperCase() ?? "—"}`} />)}
          </TnFlate>
        )}
      </section>
    </>
  );
}

function Kilde({ d }: { d: Extract<WangDataGolfData, { side: "kilde" }> }) {
  return (
    <>
      <Hode aktiv="kilde" tittel="Kilde og dekning" ingress="Hva som hentes, når, og hvor mange rader. Modellprognoser og odds hentes ikke og vises ikke." />
      {d.rader.length === 0 ? (
        <TnFlate><TnMangler>Ingen synk registrert. Synkstatus skrives når pipelines henter fra Data Golf.</TnMangler></TnFlate>
      ) : (
        <TnFlate style={{ paddingBlock: 4 }}>
          {d.rader.map((r, i) => {
            const feilet = r.status != null && r.status >= 400;
            return (
              <TnListerad
                key={`${r.endepunkt}-${i}`}
                tittel={r.endepunkt}
                tekst={`${dato(r.sist)} · ${r.rader ?? "—"} rader${r.feil ? ` · ${r.feil}` : ""}`}
                hoyre={<TnPille tone={feilet ? "red" : r.sist ? "green" : "nøytral"}>{feilet ? "Feilet" : r.sist ? "OK" : "Ikke kjørt"}</TnPille>}
              />
            );
          })}
        </TnFlate>
      )}
      <TnFlate>
        <b style={{ fontSize: 15 }}>Lisens</b>
        <p style={{ margin: "6px 0 0", fontSize: 14.5, lineHeight: 1.55, color: TN.ink700 }}>
          Data Golf-tall vises bare for coacher i AK Golf, WANG Toppidrett og Team Norway. Aldri for spillere, foreldre eller uinnloggede. Ingen eksport.
        </p>
      </TnFlate>
    </>
  );
}
