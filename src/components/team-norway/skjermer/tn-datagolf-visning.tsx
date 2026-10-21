import Link from "next/link";
import type { ReactNode } from "react";

import type { WangDataGolfData, WangDgProff, WangDgSide } from "@/app/team-wang/_data/wang-datagolf-visning";
import { formaterFortegn, formaterTall } from "@/lib/format-tall";
import { katalogLenke } from "@/lib/admin/datagolf/coach-data-regler";
import { TN } from "@/lib/v2/team-norway";
import { TnPille } from "../core";
import { TnFilterknapper, TnFlate, TnFlatehode, TnFotnote, TnMangler, TnTekstlenke, TnListerad, type TnFilterValg } from "../tn-flate";
import { TnHeltSporsmaal, TnHeltTall, TnHeltTekst, TnHeltTellere } from "../tn-stall";
import { TnSkraKort, TnSkraTopp } from "../tn-skra-topp";
import type { DgSpillerSide } from "./tn-datagolf-spiller";

/**
 * TN-DG Data Golf, bare for ADMIN (beslutninger.md §DATA GOLF ER ANDERS' PRIVATE VERKTØY, 20.10.2026).
 * Retning «Skrå» (godkjent av Anders 20.10.2026, canvaset «Team Norway nøkkelskjermer», tavlene F1–F2):
 * bildetopp med hovedtall, og fanene i et kort over kanten. Tidligere: utkast 2, retning B (16.10.2026).
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

export const SIDER: WangDgSide[] = ["oversikt", "proffer", "proff", "topp", "norske", "kilde"];
export const SPILLER_SIDER: DgSpillerSide[] = ["spiller", "innspill", "forslag"];
export const FANER: [WangDgSide | "spiller", string][] = [["oversikt", "Oversikt"], ["proffer", "Proffer"], ["topp", "Topplister"], ["spiller", "Spiller mot proff"], ["norske", "Norske proffer"], ["kilde", "Kilde"]];

export const adresse = (side: WangDgSide | DgSpillerSide, ekstra: Record<string, string | number> = {}) => {
  const p = new URLSearchParams({ side, ...Object.fromEntries(Object.entries(ekstra).map(([k, v]) => [k, String(v)])) });
  return `/team-norway/datagolf?${p.toString()}`;
};

export const forste = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export function PoweredBy() {
  return (
    <TnFotnote>
      Powered by <a href="https://datagolf.com" target="_blank" rel="noopener noreferrer" style={{ color: TN.navy600 }}>Data Golf</a> · ingen eksport · bare for ADMIN
    </TnFotnote>
  );
}

function Hode({ aktiv, tittel, ingress, venstre, hoyre }: { aktiv: WangDgSide; tittel: string; ingress: string; venstre?: ReactNode; hoyre?: ReactNode }) {
  return (
    <>
      <TnSkraTopp bilde="tee-hand" etikett={tittel} overlinje="Analyse · Data Golf · bare ADMIN" tittel={tittel} ingress={ingress} venstre={venstre} hoyre={hoyre} />
      <TnSkraKort>
        <TnFlate>
          <TnFilterknapper etikett="Data Golf" valg={FANER.map(([id, label]) => ({ href: adresse(id), label, aktiv: id === aktiv }))} />
        </TnFlate>
      </TnSkraKort>
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

export function Oversikt({ d }: { d: Extract<WangDataGolfData, { side: "oversikt" }> }) {
  return (
    <>
      <Hode aktiv="oversikt" tittel="Data Golf" ingress="Proffenes målte og modellerte tall, til å sette spillerens gap og trening i sammenheng."
        venstre={d.antallProffer === 0 ? undefined : <>
                <TnHeltSporsmaal>Hvor ferske er proff-tallene?</TnHeltSporsmaal>
                <TnHeltTall verdi={d.antallProffer}>proffer med tall, kildedato {dato(d.kildedato)}</TnHeltTall>
                <TnHeltTekst>{d.forsinket ? "Tallene er eldre enn 14 dager." : "Tallene er oppdatert siste 14 dager."} Siste synk {dato(d.sistSynk)}{d.feiletSynk > 0 ? `, ${d.feiletSynk} feilet` : ""}.</TnHeltTekst>
              </>}
        hoyre={d.antallProffer === 0 ? undefined : <TnHeltTellere
                tall={[
                  { verdi: d.norske.length, tekst: "norske proffer" },
                  { verdi: d.endepunkter, tekst: "endepunkter" },
                  { verdi: d.feiletSynk, tekst: "feilet synk" },
                ]}
              />}
      />
      {d.antallProffer === 0 ? (
        <TnFlate><TnMangler>Ingen synk ennå. Data Golf-tallene hentes ukentlig, og vises her når første synk er gjort.</TnMangler></TnFlate>
      ) : (
        <>
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

export function Katalog({ d }: { d: Extract<WangDataGolfData, { side: "proffer" }> }) {
  const felt = { minHeight: 44, padding: "0 12px", border: `1px solid ${TN.ink200}`, borderRadius: TN.radius.md, background: TN.white, font: "inherit", minWidth: 0, width: "100%" } as const;
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
        <button type="submit" style={{ minHeight: 44, border: `1px solid ${TN.navy900}`, background: TN.navy900, color: TN.white, fontWeight: 700, fontFamily: "inherit", borderRadius: TN.radius.pill, cursor: "pointer" }}>Vis</button>
      </form>
      {d.rader.length === 0 ? (
        <TnFlate><TnMangler>Ingen treff. Prøv et annet navn eller fjern filteret.</TnMangler></TnFlate>
      ) : (
        <>
          <TnFotnote>{d.totalt} proffer · side {d.sidenr} av {d.sider} · sortert på SG total (modellert)</TnFotnote>
          <ProffListe rader={d.rader} />
          <KatalogSider d={d} />
        </>
      )}
    </>
  );
}

function KatalogSider({ d }: { d: Extract<WangDataGolfData, { side: "proffer" }> }) {
  if (d.sider <= 1) return null;
  const lenke = (nr: number) =>
    katalogLenke("/team-norway/datagolf", { side: "proffer", sok: d.valg.sok, tour: d.valg.tour, norske: d.valg.norskForst ? "1" : undefined }, nr);
  return (
    <nav aria-label="Sider i katalogen" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
      {d.sidenr > 1 ? <TnTekstlenke href={lenke(d.sidenr - 1)}>Forrige</TnTekstlenke> : null}
      <span style={{ fontSize: 14, color: TN.ink700 }}>Side {d.sidenr} av {d.sider}</span>
      {d.sidenr < d.sider ? <TnTekstlenke href={lenke(d.sidenr + 1)}>Neste</TnTekstlenke> : null}
    </nav>
  );
}

const BAND: Record<string, string> = { innspill50: "50–100 yds", innspill100: "100–150 yds", innspill150: "150–200 yds", innspill200: "200+ yds" };

export function Proff({ d }: { d: Extract<WangDataGolfData, { side: "proff" }> }) {
  const p = d.proff;
  if (!p) {
    return (
      <>
        <TnSkraTopp bilde="tee-hand" etikett="Fant ikke proffen" overlinje="Analyse · Data Golf · bare ADMIN" tittel="Fant ikke proffen" ingress="Proffen finnes ikke i Data Golf-tallene." />
        <TnTekstlenke href={adresse("proffer")}>Proffer</TnTekstlenke>
      </>
    );
  }
  const felt: [string, number | null][] = [["Utslag", p.sgOtt], ["Innspill", p.sgApp], ["Nærspill", p.sgArg], ["Putting", p.sgPutt]];
  return (
    <>
      <TnSkraTopp
        bilde="tee-hand"
        etikett={p.navn}
        overlinje={["Data Golf · bare ADMIN", p.land, p.tour?.toUpperCase(), `kildedato ${dato(p.asOf)}`].filter(Boolean).join(" · ")}
        tittel={p.navn}
        ingress="Strokes Gained per runde, modellert av Data Golf. Ikke målt."
        venstre={<>
            <TnHeltSporsmaal>Hvor god er proffen totalt?</TnHeltSporsmaal>
            <TnHeltTall verdi={sg(p.sgTotal)}>SG total per runde, modell</TnHeltTall>
          </>}
        hoyre={<TnHeltTellere
            tall={[
              { verdi: p.dgRang ?? "—", tekst: "DG-rang" },
              { verdi: p.owgr ?? "—", tekst: "OWGR" },
              { verdi: p.driverYards == null ? "—" : `${tall(p.driverYards, 0)}`, tekst: "driver, yds" },
            ]}
          />}
      />
      <TnSkraKort>
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
      </TnSkraKort>
    </>
  );
}

export function Topplister({ d }: { d: Extract<WangDataGolfData, { side: "topp" }> }) {
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

export function Norske({ d }: { d: Extract<WangDataGolfData, { side: "norske" }> }) {
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

export function Kilde({ d }: { d: Extract<WangDataGolfData, { side: "kilde" }> }) {
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
          Data Golf-tall vises bare for Anders (admin). Aldri for spillere, foreldre eller uinnloggede. Ingen eksport.
        </p>
      </TnFlate>
    </>
  );
}
