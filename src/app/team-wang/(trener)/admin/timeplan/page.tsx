import { ChevronLeft, ChevronRight } from "lucide-react";

import { krevWangSportssjef } from "@/app/team-wang/_data/wang-trener-tilgang";
import { hentSkoleuke, type SkoleOppforing } from "@/app/team-wang/_data/wang-admin-data";
import { lesTrinn, lesUkeParam, skoleKategoriNavn, TRINN, formaterDato, type TrinnFilter } from "@/app/team-wang/_data/wang-admin-regler";
import { AdminMangler, AdminUavklart } from "@/app/team-wang/_components/wang-admin-logginn/admin-ui";
import s from "@/app/team-wang/_components/wang-admin-logginn/admin.module.css";
import { WangChips, WangDemoMerknad, WangKnapp, WangSide, WangSidehode, WangTag, WangTom } from "@/components/wang/trener/wang-ui";
import { dagNavnLang, ukenummer } from "@/lib/uke-helpers";
import { wangHref } from "@/lib/wang/wang-ruter";

/**
 * WANG-26 Timeplanføring. Fasit: «WANG Golf Batch 9.dc.html» (#timeplan).
 * Bare Sportssjef. Data: skoledata (SchoolScheduleEntry) — timer, prøver,
 * fridager og skoleturer per dato og trinn, felles for alle grupper.
 *
 * Avvik fra tegningen: tegningen fører en ukemal per klasse og ukedag med
 * klokkeslett, rom og lærer, pluss unntak på én dato. Basen lagrer bare
 * datoer med trinn, kategori, tittel og notat, og importen skjer i AgencyOS.
 * Skjermen viser derfor det som er ført, uke for uke, og føres ikke herfra.
 */
const ISO = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo", year: "numeric", month: "2-digit", day: "2-digit" });
const DAG_MS = 86_400_000;

function isoForskjovet(fra: Date, dager: number): string {
  // +12 t gir samme kalenderdag uansett sommertid og serverens tidssone.
  return ISO.format(new Date(fra.getTime() + dager * DAG_MS + 12 * 3_600_000));
}

export default async function WangAdminTimeplanSide({ searchParams }: { searchParams: Promise<{ trinn?: string | string[]; uke?: string | string[] }> }) {
  const { gruppe, erDemo } = await krevWangSportssjef();
  const sp = await searchParams;
  const trinn = lesTrinn(sp.trinn);
  const uke = lesUkeParam(sp.uke);
  const dag = uke ? new Date(Date.UTC(uke.aar, uke.maned - 1, uke.dag, 12)) : new Date();
  const { fra, til, oppforinger } = await hentSkoleuke(dag, trinn);

  const sok = (endring: { trinn?: TrinnFilter; uke?: string }) => {
    const t = endring.trinn ?? trinn;
    const u = endring.uke ?? (uke ? isoForskjovet(fra, 0) : undefined);
    const q: Record<string, string> = {};
    if (t !== "alle") q.trinn = t;
    if (u) q.uke = u;
    return Object.keys(q).length ? wangHref("WANG-26", {}, q) : wangHref("WANG-26");
  };
  const sisteDag = new Date(til.getTime() - DAG_MS);
  const ukeTittel = `Uke ${ukenummer(fra)} · ${formaterDato(new Date(fra.getTime() + 12 * 3_600_000))}–${formaterDato(new Date(sisteDag.getTime() + 12 * 3_600_000))}`;

  return (
    <WangSide>
      <WangSidehode skjermId="WANG-26" undertittel={`${gruppe.name} · Elevene ser resultatet i PlayerHQ`} tittel="Timeplanføring" />
      {erDemo ? <WangDemoMerknad /> : null}
      <AdminUavklart>Hvem som fører dette ved skolen er ikke avklart. Foreløpig står skjermen for sportssjef.</AdminUavklart>
      <div className={s.stabel}>
        <section className={`${s.kort} ${s.velgere}`}>
          <div className={s.velgerRad}>
            <span className={s.lbl}>Trinn</span>
            <WangChips
              etikett="Trinn"
              valg={(["alle", ...TRINN] as TrinnFilter[]).map((t) => ({ href: sok({ trinn: t }), etikett: t === "alle" ? "Alle trinn" : t, aktiv: trinn === t }))}
            />
          </div>
          <div className={s.velgerRad}>
            <span className={s.lbl}>Uke</span>
            <div className={s.ukeNav}>
              <WangKnapp href={sok({ uke: isoForskjovet(fra, -7) })}>
                <ChevronLeft size={16} strokeWidth={1.5} aria-hidden="true" />
                Forrige
              </WangKnapp>
              <span className={s.ukeTittel}>{ukeTittel}</span>
              <WangKnapp href={sok({ uke: isoForskjovet(fra, 7) })}>
                Neste
                <ChevronRight size={16} strokeWidth={1.5} aria-hidden="true" />
              </WangKnapp>
            </div>
          </div>
        </section>
        <div className={s.split8}>
          <section className={s.kort}>
            <div className={s.kortHode}>
              <div style={{ minWidth: 0 }}>
                <h2 className={s.h2}>{`Skoledata · ${trinn === "alle" ? "alle trinn" : trinn}`}</h2>
                <span className={s.telling}>{oppforinger.length === 1 ? "1 oppføring denne uka" : `${oppforinger.length} oppføringer denne uka`}</span>
              </div>
            </div>
            {oppforinger.length === 0 ? (
              <WangTom
                tittel="Ingenting er ført denne uka"
                tekst={`Det er ikke ført timer, prøver eller fridager for ${trinn === "alle" ? "noen trinn" : trinn} i ${ukeTittel.toLowerCase()}.`}
              />
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }} aria-label="Skoledata denne uka">
                {oppforinger.map((o) => <Oppforing key={o.id} o={o} />)}
              </ul>
            )}
          </section>
          <section className={s.kort}>
            <div className={s.prinsipp}>
              <p className={s.prinsippTittel}>Slik føres skoledata</p>
              <p className={s.prinsippTekst}>
                Skolerute, timer og prøver legges inn i gruppens årsplan i AgencyOS, én linje per dato. PlayerHQ tar hensyn til dem når eleven har trinnet sitt registrert.
              </p>
            </div>
            <AdminMangler
              punkter={[
                "Ukemal per klasse og ukedag med fra- og til-klokkeslett",
                "Rom eller sted og lærer per time",
                "Klasse (ikke bare trinn) og unntak på én dato som ikke endrer ukemalen",
              ]}
            />
          </section>
        </div>
      </div>
    </WangSide>
  );
}

function Oppforing({ o }: { o: SkoleOppforing }) {
  // Datoene er lagret som naiv lokal midnatt; +12 t gir riktig norsk kalenderdag.
  const vist = new Date(o.dato.getTime() + 12 * 3_600_000);
  return (
    <li className={s.mrow}>
      <span className={s.mrowDag}>
        {dagNavnLang(vist)}
        <br />
        {formaterDato(vist).slice(0, 5)}
      </span>
      <span className={s.full}>
        <span className={s.mrowTittel}>{o.tittel}</span>
        <span className={s.mrowUnder}>{[skoleKategoriNavn(o.kategori), o.notat].filter(Boolean).join(" · ")}</span>
      </span>
      <WangTag>{o.trinn ?? "Alle trinn"}</WangTag>
    </li>
  );
}
