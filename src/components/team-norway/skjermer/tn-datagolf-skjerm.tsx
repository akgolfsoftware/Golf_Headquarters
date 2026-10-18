import Link from "next/link";

import type { WangDataGolfData, WangDgProff } from "@/app/team-wang/_data/wang-datagolf-visning";
import { formaterFortegn, formaterTall } from "@/lib/format-tall";
import { TN } from "@/lib/v2/team-norway";
import { TnFilterknapper, TnFlate, TnFlatehode, TnFotnote, TnListerad, TnMangler, TnSkjermhode, TnTekstlenke } from "../tn-flate";
import { TnHelt, TnHeltSporsmaal, TnHeltTall, TnHeltTekst, TnHeltTellere, TnMarkor, type TnStatus } from "../tn-stall";
import st from "./tn-datagolf.module.css";

/**
 * Pakke 9 Data Golf for trenere (Analyse › Data Golf): DG-01 Oversikt, DG-02 Proffkatalog,
 * DG-03 Proffprofil, DG-04 Topplister, DG-08 Norske proffer og DG-09 Kilde og dekning.
 * Utkast 2 (godkjent av Anders 16.10.2026). Fasit: docs/design-system/utkast-tn/datagolf.html
 * og innholdet i docs/design-system/datagolf-coach-datakart-og-skjermliste.md.
 * Samme data og regler som AgencyOS pakke 10 (#1398) og WANG pakke 10 (#1406):
 * bare for coach-rollen (krevDataGolfBruker på siden), «Powered by Data Golf» på hver skjerm, ingen eksport.
 *
 * Avvik:
 *   - DG-05 Spiller mot proff, DG-06 Innspill-tak og DG-07 Fra funn til forslag har ingen egne
 *     sider, som i AgencyOS og WANG: spillernes tall deles ikke med Team Norway ennå, og funn
 *     kan ikke bli forslag herfra.
 *   - DG-08 viser norske proffers siste resultater og kommende turneringer. Live-stilling
 *     («norske i spill nå») er ikke koblet til, så den er ikke med.
 *   - Tallene er Data Golfs modellerte ferdighetstall med kildedato, merket som modell.
 *   - Avatar og bilde per proff finnes ikke.
 */

const nb = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short", year: "numeric" });
const dato = (d: Date | string | null | undefined) => (d ? nb.format(new Date(d)) : "—");
const sg = (v: number | null | undefined) => formaterFortegn(v, 2);
const tall = (v: number | null | undefined, d = 1) => formaterTall(v, d, true);
const tilPar = (n: number | null) => (n == null ? "—" : n === 0 ? "E" : n > 0 ? `+${n}` : `−${Math.abs(n)}`);

const BASE = "/team-norway/datagolf";
const href = (side?: string, ekstra: Record<string, string | number> = {}) => {
  const p = new URLSearchParams({ ...(side ? { side } : {}), ...Object.fromEntries(Object.entries(ekstra).map(([k, v]) => [k, String(v)])) });
  const q = p.toString();
  return q ? `${BASE}?${q}` : BASE;
};

const FANER = [
  { id: undefined, tittel: "Oversikt" },
  { id: "proffer", tittel: "Proffer" },
  { id: "topp", tittel: "Topplister" },
  { id: "norske", tittel: "Norske proffer" },
  { id: "kilde", tittel: "Kilde" },
] as const;

function Hode({ aktiv, tittel, ingress, overlinje }: { aktiv?: string; tittel: string; ingress?: string; overlinje?: string }) {
  return (
    <>
      <TnSkjermhode overlinje={overlinje ?? "Analyse · Data Golf · bare trenere"} tittel={tittel} ingress={ingress ?? ""} />
      <TnFilterknapper etikett="Data Golf" valg={FANER.map((f) => ({ href: href(f.id), label: f.tittel, aktiv: f.id === aktiv }))} />
    </>
  );
}

function PoweredBy() {
  return (
    <TnFotnote>
      Powered by{" "}
      <a href="https://datagolf.com" target="_blank" rel="noopener noreferrer" style={{ color: TN.navy600, fontWeight: 700 }}>Data Golf</a>
      {" "}· ingen eksport · bare for trenere
    </TnFotnote>
  );
}

function ProffListe({ rader }: { rader: WangDgProff[] }) {
  return (
    <TnFlate style={{ paddingBlock: 4 }}>
      {rader.map((p) => (
        <Link key={p.dgId} href={href("proff", { id: p.dgId })} className={st.rad}>
          <span className={st.rang}>{p.dgRang ?? "—"}</span>
          <span className={st.navn}>
            <b>{p.navn}</b>
            <span>{[p.land, p.tour?.toUpperCase()].filter(Boolean).join(" · ") || "—"}{p.norsk ? " · norsk" : ""}</span>
          </span>
          <span className={st.tall}>{sg(p.sgTotal)}</span>
        </Link>
      ))}
    </TnFlate>
  );
}

export function TnDatagolfSkjerm({ d }: { d: WangDataGolfData }) {
  if (d.side === "proffer") return <Katalog d={d} />;
  if (d.side === "proff") return <Proff d={d} />;
  if (d.side === "topp") return <Topplister d={d} />;
  if (d.side === "norske") return <Norske d={d} />;
  if (d.side === "kilde") return <Kilde d={d} />;
  return <Oversikt d={d} />;
}

function Oversikt({ d }: { d: Extract<WangDataGolfData, { side: "oversikt" }> }) {
  return (
    <>
      <Hode tittel="Data Golf" ingress="Proffenes målte og modellerte tall, til å sette spillerens gap og trening i sammenheng." />
      {d.antallProffer === 0 ? (
        <TnFlate><TnMangler>Data Golf-tallene hentes ukentlig. Når første synk er gjort, vises de her.</TnMangler></TnFlate>
      ) : (
        <>
          <TnHelt
            etikett="Hvor mange proffer har tall"
            venstre={
              <>
                <TnHeltSporsmaal>Hvor ferske er tallene?</TnHeltSporsmaal>
                <TnHeltTall verdi={d.antallProffer}>proffer med ferdighetsprofil</TnHeltTall>
                <TnHeltTekst>Ferdighetsmodell fra {dato(d.kildedato)}. {d.forsinket ? "Tallene er eldre enn 14 dager." : "Oppdatert innen 14 dager."}</TnHeltTekst>
              </>
            }
            hoyre={
              <TnHeltTellere
                tall={[
                  { verdi: d.norske.length, tekst: "norske proffer" },
                  { verdi: dato(d.sistSynk), tekst: d.feiletSynk > 0 ? `siste synk, ${d.feiletSynk} feilet` : "siste synk" },
                  { verdi: d.endepunkter, tekst: "endepunkter hentes" },
                ]}
              />
            }
          />
          <section style={{ display: "grid", gap: 12 }}>
            <TnFlatehode tittel="Norske proffer" merknad="SG total, modellert" />
            {d.norske.length === 0 ? <TnFlate><TnMangler>Ingen norske proffer er koblet ennå.</TnMangler></TnFlate> : <ProffListe rader={d.norske} />}
          </section>
          <section style={{ display: "grid", gap: 12 }}>
            <TnFlatehode tittel="Bruk dataene" />
            <TnFlate style={{ paddingBlock: 4 }}>
              {([
                ["proffer", "Proffkatalog", "Søk og filter på tour"],
                ["topp", "Topplister", "Seks kategorier per tour og år"],
                ["norske", "Norske proffer", "Resultater og kommende turneringer"],
                ["kilde", "Kilde og dekning", "Per endepunkt: sist synket og rader"],
              ] as const).map(([side, t, k]) => (
                <Link key={side} href={href(side)} className={st.rad} style={{ gridTemplateColumns: "minmax(0, 1fr)" }}>
                  <span className={st.navn}><b>{t}</b><span>{k}</span></span>
                </Link>
              ))}
            </TnFlate>
          </section>
        </>
      )}
      <PoweredBy />
    </>
  );
}

function Katalog({ d }: { d: Extract<WangDataGolfData, { side: "proffer" }> }) {
  return (
    <>
      <Hode aktiv="proffer" tittel="Proffer" />
      <form className={st.filter} action={BASE}>
        <input type="hidden" name="side" value="proffer" />
        <label>Søk<input name="sok" type="search" defaultValue={d.valg.sok ?? ""} placeholder="Navn" /></label>
        <label>Tour
          <select name="tour" defaultValue={d.valg.tour ?? ""}>
            <option value="">Alle</option>
            {d.turer.map((t) => <option key={t} value={t}>{t.toUpperCase()}</option>)}
          </select>
        </label>
        <label>Rekkefølge
          <select name="norske" defaultValue={d.valg.norskForst ? "1" : ""}>
            <option value="">SG total</option>
            <option value="1">Norske først</option>
          </select>
        </label>
        <button type="submit">Vis</button>
      </form>
      {d.rader.length === 0 ? (
        <TnFlate><TnMangler>Ingen treff. Prøv et annet navn eller fjern filteret.</TnMangler></TnFlate>
      ) : (
        <>
          <TnFotnote>{d.rader.length} proffer · sortert på SG total (modellert)</TnFotnote>
          <ProffListe rader={d.rader} />
        </>
      )}
      <PoweredBy />
    </>
  );
}

const BAND: Record<string, string> = { innspill50: "50–100 yds", innspill100: "100–150 yds", innspill150: "150–200 yds", innspill200: "200+ yds" };

function Proff({ d }: { d: Extract<WangDataGolfData, { side: "proff" }> }) {
  const p = d.proff;
  if (!p) {
    return (
      <>
        <Hode aktiv="proffer" tittel="Fant ikke proffen" />
        <TnFlate><TnMangler>Proffen finnes ikke i Data Golf-tallene.</TnMangler></TnFlate>
        <TnTekstlenke href={href("proffer")}>Til proffkatalogen</TnTekstlenke>
        <PoweredBy />
      </>
    );
  }
  return (
    <>
      <TnSkjermhode overlinje={[p.land, p.tour?.toUpperCase(), `kildedato ${dato(p.asOf)}`].filter(Boolean).join(" · ")} tittel={p.navn} ingress="" />
      <TnHelt
        etikett="Strokes Gained"
        venstre={
          <>
            <TnHeltSporsmaal>Hva er proffen god på?</TnHeltSporsmaal>
            <TnHeltTall verdi={sg(p.sgTotal)}>SG total per runde, modell</TnHeltTall>
            <TnHeltTekst>
              Nærspill {sg(p.sgArg)} · driver {p.driverYards == null ? "—" : `${tall(p.driverYards, 0)} yds`} · treff {p.driverTreff == null ? "—" : `${tall(p.driverTreff * (p.driverTreff <= 1 ? 100 : 1), 0)} %`} · DG-rang {p.dgRang ?? "—"} · OWGR {p.owgr ?? "—"}
            </TnHeltTekst>
          </>
        }
        hoyre={
          <TnHeltTellere
            tall={[
              { verdi: sg(p.sgOtt), tekst: "utslag" },
              { verdi: sg(p.sgApp), tekst: "innspill" },
              { verdi: sg(p.sgPutt), tekst: "putting" },
            ]}
          />
        }
      />
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
                hoyre={<span className={st.tall}>{sg(s.sgTotal)}</span>}
              />
            ))}
          </TnFlate>
        )}
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
                hoyre={<span className={st.tall}>{b.meter == null ? "—" : `${tall(b.meter)} m`}</span>}
              />
            ))}
          </TnFlate>
        )}
      </section>
      <TnTekstlenke href={href("proffer")}>Til proffkatalogen</TnTekstlenke>
      <PoweredBy />
    </>
  );
}

function Topplister({ d }: { d: Extract<WangDataGolfData, { side: "topp" }> }) {
  const lenke = (k: string, t = d.tour, a = d.aar) => href("topp", { kat: k, tour: t, aar: a });
  return (
    <>
      <Hode aktiv="topp" tittel="Topplister" />
      <TnFilterknapper etikett="Kategori" valg={d.kategorier.map((k) => ({ href: lenke(k.id), label: k.label, aktiv: k.id === d.aktiv }))} />
      <TnFilterknapper etikett="Tour" valg={d.turValg.map((t) => ({ href: lenke(d.aktiv, t), label: t.toUpperCase(), aktiv: t === d.tour }))} />
      <TnFilterknapper etikett="År" valg={d.aarValg.map((a) => ({ href: lenke(d.aktiv, d.tour, a), label: String(a), aktiv: a === d.aar }))} />
      {d.rader.length === 0 ? (
        <TnFlate><TnMangler>Ingen tall for valget. Velg en annen tour eller et annet år.</TnMangler></TnFlate>
      ) : (
        <>
          <TnFotnote>Oppdatert {dato(d.oppdatert)} · minst 20 runder der runder er kjent</TnFotnote>
          <TnFlate style={{ paddingBlock: 4 }}>
            {d.rader.map((r, i) => (
              <Link key={r.dgId} href={href("proff", { id: r.dgId })} className={st.rad}>
                <span className={st.rang}>{i + 1}</span>
                <span className={st.navn}><b>{r.navn}</b><span>{r.land ?? "—"} · {r.runder ?? "—"} runder</span></span>
                <span className={st.tall}>{d.aktiv === "sgTotal" ? sg(r.verdi) : tall(r.verdi, d.aktiv === "avgScore" || d.aktiv === "puttsPerRound" ? 2 : 1)}</span>
              </Link>
            ))}
          </TnFlate>
        </>
      )}
      <PoweredBy />
    </>
  );
}

function Norske({ d }: { d: Extract<WangDataGolfData, { side: "norske" }> }) {
  return (
    <>
      <Hode aktiv="norske" tittel="Norske proffer" />
      <section style={{ display: "grid", gap: 12 }}>
        <TnFlatehode tittel="Siste resultater" merknad="Målt, brutto" />
        {d.spillere.length === 0 ? (
          <TnFlate><TnMangler>Ingen norske proffer er koblet til Data Golf ennå.</TnMangler></TnFlate>
        ) : (
          <TnFlate style={{ paddingBlock: 4 }}>
            {d.spillere.map((s) => (
              <TnListerad
                key={s.id}
                foran={<span className={st.rang}>{s.resultater[0]?.plass ?? "—"}</span>}
                tittel={s.navn}
                tekst={s.resultater.length === 0 ? "Ingen resultater lagret" : s.resultater.map((e) => `${e.turnering} (${dato(e.dato)}) ${tilPar(e.tilPar)}`).join(" · ")}
                hoyre={<span className={st.tall}>{tilPar(s.resultater[0]?.tilPar ?? null)}</span>}
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
      <PoweredBy />
    </>
  );
}

function Kilde({ d }: { d: Extract<WangDataGolfData, { side: "kilde" }> }) {
  return (
    <>
      <Hode aktiv="kilde" tittel="Kilde og dekning" ingress="Hva som hentes, når, og hvor mange rader. Modellprognoser og odds hentes ikke og vises ikke." />
      {d.rader.length === 0 ? (
        <TnFlate><TnMangler>Synkstatus skrives når pipelines henter fra Data Golf.</TnMangler></TnFlate>
      ) : (
        <TnFlate style={{ paddingBlock: 4 }}>
          {d.rader.map((r, i) => {
            const feilet = r.status != null && r.status >= 400;
            const status: TnStatus = feilet ? "trenger" : r.sist ? "folger" : "ikkedelt";
            return (
              <TnListerad
                key={`${r.endepunkt}-${i}`}
                tittel={r.endepunkt}
                tekst={`${dato(r.sist)} · ${r.rader ?? "—"} rader${r.feil ? ` · ${r.feil}` : ""}`}
                hoyre={<TnMarkor status={status}>{feilet ? "Feilet" : r.sist ? "OK" : "Ikke kjørt"}</TnMarkor>}
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
      <PoweredBy />
    </>
  );
}
