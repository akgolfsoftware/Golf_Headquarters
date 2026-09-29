import { Info } from "lucide-react";

import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { TkElevVelger } from "@/components/wang/tester-konkurranse/tk-elev-velger";
import s from "@/components/wang/tester-konkurranse/tk.module.css";
import { WangChips, WangDemoMerknad, WangKort, WangSide, WangSidehode, WangTom } from "@/components/wang/trener/wang-ui";
import { hentElever, hentFysDefinisjoner, hentOffentligeResultater, hentResultater } from "@/lib/wang/tester-konkurranse/data";
import { datoTekst, forsteParam, periodeFor, tallTekst, type PeriodeValg } from "@/lib/wang/tester-konkurranse/format";
import { bruttoRunder } from "@/lib/wang/tester-konkurranse/konkurranse";
import { lavereErBedre, protokollTekst, rangér, resultatTekst, type RangInn, type TestDefinisjonInfo } from "@/lib/wang/tester-konkurranse/tester";
import { wangHref } from "@/lib/wang/wang-ruter";

export const dynamic = "force-dynamic";

type Maling = "snitt" | "test";

/**
 * WANG-39 Rangering — underlag for treneren, avgjør ingenting. Tegning:
 * «WANG Golf Batch 14.dc.html» #rangering. Ekte data: brutto turneringsrunder
 * fra turneringsbasen og testresultater. Strokes gained er utelatt: de eneste
 * SG-tallene i basen kommer fra DataGolf, som bare vises for Anders.
 */
export default async function WangRangeringSide({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { gruppe, rolle, erDemo } = await krevWangTrener();
  const sok = await searchParams;
  const maling: Maling = forsteParam(sok.maling) === "test" ? "test" : "snitt";
  const periodeValg: PeriodeValg = forsteParam(sok.periode) === "aar" ? "aar" : "sesong";
  const naa = new Date();
  const periode = periodeFor(periodeValg, naa);
  const elever = await hentElever(gruppe.id);
  const scope = `${rolle === "SPORTSSJEF" ? "Sportssjef" : "Trener"} · ${gruppe.name}`;

  const href = (endring: Record<string, string>) => {
    const q: Record<string, string> = { maling, periode: periodeValg, ...(forsteParam(sok.test) ? { test: forsteParam(sok.test) as string } : {}), ...endring };
    return wangHref("WANG-39", {}, q);
  };

  let tittel = "Brutto snittscore";
  let lavest = true;
  let rader: RangInn[] = [];
  let testValg: TestDefinisjonInfo[] = [];
  let valgtTest: TestDefinisjonInfo | null = null;

  if (maling === "snitt") {
    const { rader: tur } = await hentOffentligeResultater(elever);
    rader = elever.map((e) => {
      const runder = tur.filter((t) => t.elevId === e.id && t.turnering.startDate.getTime() >= periode.fra.getTime()).flatMap((t) => bruttoRunder(t.runder));
      const snitt = runder.length ? runder.reduce((a, b) => a + b, 0) / runder.length : null;
      return { elevId: e.id, navn: e.navn, klasse: e.klasse, verdi: snitt, tekst: snitt === null ? "—" : tallTekst(snitt, 1), kilde: snitt === null ? "Ingen turneringsrunder i perioden" : `${runder.length} runder · brutto · turneringsbasen` };
    });
  } else {
    const [res, fys] = await Promise.all([hentResultater(elever.map((e) => e.id), periode.fra), hentFysDefinisjoner()]);
    const brukt = new Map<string, TestDefinisjonInfo>();
    for (const d of fys) brukt.set(d.id, d);
    for (const r of res) brukt.set(r.testId, r.test);
    testValg = [...brukt.values()].toSorted((a, b) => a.name.localeCompare(b.name, "nb"));
    valgtTest = testValg.find((t) => t.id === forsteParam(sok.test)) ?? testValg[0] ?? null;
    if (valgtTest) {
      tittel = valgtTest.name;
      lavest = lavereErBedre(valgtTest);
      const def = valgtTest;
      rader = elever.map((e) => {
        const siste = res.filter((r) => r.userId === e.id && r.testId === def.id).map((r) => ({ r, vis: resultatTekst(def, r.score, r.details) })).filter((x) => x.vis.tall !== null).at(-1);
        if (!siste) return { elevId: e.id, navn: e.navn, klasse: e.klasse, verdi: null, tekst: "—", kilde: "Ingen måling i perioden" };
        const maltAv = siste.r.recordedBy ? siste.r.recordedBy.name?.trim() || siste.r.recordedBy.email : "eleven selv";
        return { elevId: e.id, navn: e.navn, klasse: e.klasse, verdi: siste.vis.tall, tekst: siste.vis.enhet ? `${siste.vis.verdi} ${siste.vis.enhet}` : siste.vis.verdi, kilde: `${protokollTekst(def)} · ${datoTekst(siste.r.takenAt)} · målt av ${maltAv}` };
      });
    }
  }

  const rangert = rangér(rader, lavest);
  const medMaling = rangert.filter((r) => r.nr !== null).length;

  return (
    <WangSide>
      <WangSidehode skjermId="WANG-39" undertittel={scope} tittel="Rangering" />
      {erDemo ? <WangDemoMerknad /> : null}
      <p className={s.merknad}>
        <Info size={18} strokeWidth={1.5} aria-hidden="true" style={{ flex: "none" }} />
        <span>Underlag for treneren. Avgjør ingenting. <span className={s.merknadSvak}>Vises aldri på elevflaten, foresattflaten eller den åpne siden.</span></span>
      </p>
      <section className={`${s.kort} ${s.kortPolstret}`} style={{ padding: "16px 20px" }}>
        <div className={s.lbl}>
          <span>Måling</span>
          <WangChips etikett="Måling" valg={[{ href: href({ maling: "snitt" }), etikett: "Brutto snittscore", aktiv: maling === "snitt" }, { href: href({ maling: "test" }), etikett: "Test", aktiv: maling === "test" }]} />
        </div>
        {maling === "test" && testValg.length > 0 && valgtTest ? (
          <div style={{ maxWidth: 420 }}>
            <TkElevVelger elever={testValg.map((t) => ({ id: t.id, navn: t.name, klasse: null }))} valgt={valgtTest.id} basisHref={href({})} param="test" etikett="Test fra protokollene · WANG-22" />
          </div>
        ) : null}
        <div className={s.lbl}>
          <span>Periode</span>
          <WangChips etikett="Periode" valg={(["sesong", "aar"] as const).map((p) => ({ href: href({ periode: p }), etikett: periodeFor(p, naa).etikett, aktiv: periodeValg === p }))} />
        </div>
      </section>

      {elever.length === 0 ? (
        <WangKort><WangTom tittel="Ingen elever i gruppa ennå" tekst="Rangeringen fylles når elevene er lagt inn i WANG-gruppa." /></WangKort>
      ) : maling === "test" && !valgtTest ? (
        <WangKort><WangTom tittel="Ingen tester å rangere" tekst="Ingen tester er målt i perioden." /></WangKort>
      ) : (
        <section className={s.kort}>
          <div className={s.kortHode}>
            <h2 className={s.h2}>{tittel} · {gruppe.name}</h2>
            <span className={s.meta}>{lavest ? "Lavest først" : "Høyest først"} · {medMaling} med måling · {rangert.length - medMaling} uten</span>
          </div>
          {rangert.map((r) => (
            <div key={r.elevId} className={s.rrow}>
              <span className={s.tall} style={{ fontSize: 14, fontWeight: 700, color: "var(--wtr-text-muted)" }}>{r.nr ?? ""}</span>
              <span style={{ fontFamily: "var(--wtr-font-display)", fontSize: 14.5, fontWeight: 500, color: "var(--wtr-blue)" }}>
                {r.navn}{r.klasse ? <span style={{ color: "var(--wtr-text-muted)" }}> · {r.klasse}</span> : null}
              </span>
              <span className={s.tall} style={{ fontSize: 18, fontWeight: 700, color: "var(--wtr-blue)", textAlign: "right" }}>{r.tekst}</span>
              <span className={`${s.tall} ${s.helMobil}`} style={{ fontSize: 12, color: "var(--wtr-text-muted)" }}>{r.kilde}</span>
            </div>
          ))}
        </section>
      )}
    </WangSide>
  );
}
