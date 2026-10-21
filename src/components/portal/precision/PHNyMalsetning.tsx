"use client";

/**
 * PlayerHQ Ny målsetning (/portal/mal/ny) — nytt design, pakke 17b. Erstatter målbyggeren (/portal/ai/mal-bygger,
 * utkast plan-hjelpere.html «Sendes videre»: ai/mal-bygger → «Ny målsetning» i Målsetninger).
 * Utkastet tegner ikke skjermen; den bygger på «Endre målsetning» i Én målsetning (booking-meldinger.html,
 * godkjent 16.10) og Målsetninger (plan.html, pakke 3). Stil: playerhq-ny.css, -kommunikasjon.css og -maal.css.
 * Handlingen er createGoal (goals-actions), samme som Endre bruker, med nivå og SG-område.
 *
 * Avvik:
 *   - Én målsetning om gangen. Målbyggeren kunne lagre opptil fem fra maler; malene er erstattet av «Hva måles».
 *   - Ingen «AI»-merke: byggeren foreslo aldri tall, og skjermen gjør det heller ikke.
 *   - Startverdi lagres bare for Strokes Gained (utgangspunktet hentes fra rundene dine), som før.
 */
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createGoal, type GoalInput } from "@/app/portal/(legacy)/mal/goals-actions";
import { PLAN_NIVAAER, PLAN_NIVAA_LABEL, erPlanNivaa } from "@/lib/domain/maal-plannivaa";
import { SG_OMRADER, SG_OMRADE_NAVN, erSgOmrade } from "@/lib/domain/maal-fremdrift";
import { PYR_LABEL, PYR_REKKEFOLGE } from "@/lib/pyramide";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";
import "@/styles/playerhq-ny-kommunikasjon.css";
import "@/styles/playerhq-ny-maal.css";
import "@/styles/playerhq-ny-plan-hjelpere.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";

const TYPER = [
  { value: "HCP_TARGET", label: "Handicap", kategori: "OUTCOME", hjelp: "Et tydelig resultatmål gir retning til treningen.", eksempel: "Senke handicapet til 4,5", verdi: "Mål-handicap" },
  { value: "SG_AREA", label: "Strokes Gained", kategori: "OUTCOME", hjelp: "Fremdriften måles fra der du står i området nå, fra rundene dine.", eksempel: "Bedre innspill", verdi: "SG-mål per runde" },
  { value: "TEST_SCORE", label: "Testresultat", kategori: "OUTCOME", hjelp: "Fremdriften oppdateres hver gang du tar testen.", eksempel: "8 poeng på Wedge Gate", verdi: "Målpoeng" },
  { value: "ROUNDS_PER_MONTH", label: "Runder per måned", kategori: "PROCESS", hjelp: "Runder på banen flytter handicapet over tid.", eksempel: "Spille 6 tellende runder i måneden", verdi: "Runder per måned" },
  { value: "SESSION_FREQUENCY", label: "Økter per uke", kategori: "PROCESS", hjelp: "Telles fra gjennomførte økter i treningsområdet siste sju dager.", eksempel: "Tre TEK-økter i uka", verdi: "Økter per uke" },
  { value: "FREE_TEXT", label: "Fritekst", kategori: "PROCESS", hjelp: "Fremdriften føres ikke automatisk; du markerer målsetningen som nådd selv.", eksempel: "Fast rutine før hvert slag", verdi: "Målverdi" },
] as const;
type TypeVerdi = (typeof TYPER)[number]["value"];

export type PHNyMalsetningProps = { testOptions: { id: string; name: string }[] };

export function PHNyMalsetning({ testOptions }: PHNyMalsetningProps) {
  const router = useRouter();
  const [type, setType] = useState<TypeVerdi>("HCP_TARGET");
  const [category, setCategory] = useState<GoalInput["category"]>("OUTCOME");
  const [title, setTitle] = useState("");
  const [verdi, setVerdi] = useState("");
  const [frist, setFrist] = useState("");
  const [niva, setNiva] = useState("");
  const [sg, setSg] = useState("");
  const [test, setTest] = useState("");
  const [omrade, setOmrade] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [jobber, start] = useTransition();
  const t = TYPER.find((x) => x.value === type) ?? TYPER[0];
  const tall = verdi.trim() ? Number(verdi.replace(",", ".").replace("−", "-")) : null;
  const mangler = !title.trim() ? "Skriv hva du vil oppnå"
    : tall != null && !Number.isFinite(tall) ? "Målverdien må være et tall"
    : type === "SG_AREA" && !sg ? "Velg SG-området"
    : type === "TEST_SCORE" && !test ? "Velg testen"
    : type === "SESSION_FREQUENCY" && !omrade ? "Velg treningsområdet"
    : null;

  function velgType(v: TypeVerdi) {
    setType(v);
    setCategory(TYPER.find((x) => x.value === v)?.kategori ?? "OUTCOME");
  }

  function lagre() {
    if (mangler) { setFeil(mangler); return; }
    setFeil(null);
    start(async () => {
      try {
        await createGoal({
          type, category, title: title.trim(), targetValue: tall, targetDate: frist || null,
          linkedPyramidArea: type === "SESSION_FREQUENCY" && omrade ? (omrade as GoalInput["linkedPyramidArea"]) : null,
          linkedTestId: type === "TEST_SCORE" && test ? test : null,
          sgOmrade: type === "SG_AREA" && erSgOmrade(sg) ? sg : null,
          planNivaa: erPlanNivaa(niva) ? niva : null,
        });
        router.push("/portal/mal");
        router.refresh();
      } catch {
        setFeil("Målsetningen ble ikke lagret. Prøv igjen.");
      }
    });
  }

  return <div className="phn phn-meg phn-ph phn-skra">
    <SkraTopp
      lav
      etikett="Ny målsetning"
      bilde="/images/playerhq/stats-topp.jpg" bildePosisjon="50% 50%"
      overlinje="Plan · målsetninger"
      tittel="Ny målsetning"
      handling={<span className="skra-tilbake"><Link className="tilbake" href="/portal/mal"><ChevronLeft size={18} aria-hidden />Målsetninger</Link></span>}
    />
    <SkraFlyt lav>
    <div className="side smal">
    <section className="phn-seksjon" aria-labelledby="ph-nm-type">
      <div className="phn-sek-topp"><h2 id="ph-nm-type">Hva måles</h2></div>
      <div className="phn-k-typer" role="group" aria-label="Type målsetning">
        <button type="button" aria-pressed={category === "OUTCOME"} onClick={() => setCategory("OUTCOME")}><b>Resultatmål</b><span>Et tall du vil nå</span></button>
        <button type="button" aria-pressed={category === "PROCESS"} onClick={() => setCategory("PROCESS")}><b>Prosessmål</b><span>Noe du vil gjøre jevnlig</span></button>
      </div>
      <label className="phn-felt">Måles som
        <select value={type} onChange={(e) => velgType(e.target.value as TypeVerdi)}>
          {TYPER.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
        </select>
      </label>
      <p className="phn-kilde">{t.hjelp}</p>
      {type === "SG_AREA" && <label className="phn-felt">SG-område
        <select value={sg} onChange={(e) => setSg(e.target.value)}>
          <option value="">Velg område</option>
          {SG_OMRADER.map((o) => <option key={o} value={o}>{SG_OMRADE_NAVN[o]}</option>)}
        </select>
      </label>}
      {type === "TEST_SCORE" && <label className="phn-felt">Test
        <select value={test} onChange={(e) => setTest(e.target.value)}>
          <option value="">{testOptions.length ? "Velg test" : "Ingen godkjente tester"}</option>
          {testOptions.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
      </label>}
      {type === "SESSION_FREQUENCY" && <label className="phn-felt">Treningsområde
        <select value={omrade} onChange={(e) => setOmrade(e.target.value)}>
          <option value="">Velg område</option>
          {PYR_REKKEFOLGE.map((a) => <option key={a} value={a}>{PYR_LABEL[a]}</option>)}
        </select>
      </label>}
    </section>
    <section className="phn-seksjon" aria-labelledby="ph-nm-hva">
      <div className="phn-sek-topp"><h2 id="ph-nm-hva">Målsetningen</h2></div>
      <label className="phn-felt">Navn<input value={title} maxLength={500} onChange={(e) => setTitle(e.target.value)} placeholder={`For eksempel: ${t.eksempel}`} /></label>
      <div className="phn-m-to-felt">
        <label className="phn-felt">{t.verdi}<input inputMode="decimal" value={verdi} onChange={(e) => setVerdi(e.target.value)} placeholder="Valgfritt" /></label>
        <label className="phn-felt">Frist<input type="date" value={frist} onChange={(e) => setFrist(e.target.value)} /></label>
      </div>
      <label className="phn-felt">Nivå i planen
        <select value={niva} onChange={(e) => setNiva(e.target.value)}>
          <option value="">Automatisk fra frist</option>
          {PLAN_NIVAAER.map((n) => <option key={n} value={n}>{PLAN_NIVAA_LABEL[n]}</option>)}
        </select>
      </label>
    </section>
    {feil && <p className="phn-k-feil" role="alert">{feil}</p>}
    <div className="phn-knapper">
      <button type="button" className="phn-knapp pri stor" disabled={jobber} onClick={lagre}>{jobber ? "Lagrer …" : "Lagre målsetningen"}</button>
    </div>
  </div></SkraFlyt></div>;
}
