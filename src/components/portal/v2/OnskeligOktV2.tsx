"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { sendOnskeligOkt } from "@/app/portal/(legacy)/onskeligokt/actions";
import { Knapp } from "@/components/precision/pa";

export interface OnskeligOktV2Data {
  coacher: { id: string; name: string; email?: string }[];
  coachName: string;
}

type Tier = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
type OktType = "1:1" | "MINI" | "RANGE" | "RUNDE";
type Fasilitet = "MULLIGAN" | "GFGK" | "BOSSUM" | "COACH" | "ONLINE";

const OKT_TYPER: { id: OktType; title: string; tag: string; sub: string }[] = [
  { id: "1:1", title: "1:1 Coaching", tag: "60 min", sub: "Standard 1:1 — coachen observerer, gir feedback, dere jobber sammen." },
  { id: "MINI", title: "Mini-økt", tag: "30 min", sub: "Fokus på ett spesifikt tema — typisk fra forrige runde eller test." },
  { id: "RANGE", title: "Range-besøk sammen", tag: "90 min", sub: "Coachen kommer til rangen — fri form, ofte for å sette opp ukens fokus." },
  { id: "RUNDE", title: "Spille runde sammen", tag: "4 t", sub: "9 eller 18 hull. Coachen går med — observerer beslutningstaking. Avtales særskilt." },
];

const FASILITETER: { id: Fasilitet; title: string; suffix?: string; sub: string }[] = [
  { id: "MULLIGAN", title: "Mulligan Studio", suffix: "— din vanlige", sub: "TrackMan + video. 800 kr/time delt." },
  { id: "GFGK", title: "GFGK Range", sub: "Utendørs. Gratis for medlem." },
  { id: "BOSSUM", title: "Bossum Golfklubb", sub: "Range + korthold. 200 kr." },
  { id: "COACH", title: "Du velger", sub: "Coachen foreslår basert på fokus." },
  { id: "ONLINE", title: "Online video-økt", sub: "Du sender klipp, coachen gjennomgår live på 30 min." },
];

const TIER_ITEMS: Tier[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const EKSTRA_ITEMS = ["PUTT", "Mental", "Turneringsforberedelse", "Annet"];

function Seksjon({ num, tittel, hjelp, children }: { num: string; tittel: string; hjelp?: string; children: ReactNode }) {
  return (
    <section className="pa-card ph21-kort">
      <p>{num}</p>
      <h2>{tittel}</h2>
      {hjelp && <p className="ph21-hjelp">{hjelp}</p>}
      {children}
    </section>
  );
}

export function OnskeligOktV2({ data }: { data: OnskeligOktV2Data }) {
  const { coacher, coachName } = data;
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const [oktType, setOktType] = useState<OktType>("1:1");
  const [omrader, setOmrader] = useState<Tier[]>(["SLAG"]);
  const [ekstraOmrader, setEkstraOmrader] = useState<string[]>([]);
  const [detalj, setDetalj] = useState("");
  const [datoer, setDatoer] = useState<{ dato: string; tid: string }[]>([{ dato: today, tid: "16:00" }]);
  const [fleksibel, setFleksibel] = useState(false);
  const [fasilitet, setFasilitet] = useState<Fasilitet>("MULLIGAN");
  const [melding, setMelding] = useState("");
  const [coachId, setCoachId] = useState(coacher[0]?.id ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggleTier(t: Tier) {
    setOmrader((prev) => (prev.includes(t) ? prev.filter((y) => y !== t) : [...prev, t]));
  }
  function toggleEkstra(x: string) {
    setEkstraOmrader((prev) => (prev.includes(x) ? prev.filter((y) => y !== x) : [...prev, x]));
  }

  function send() {
    setError(null);
    const forste = datoer[0];
    const preferredAt = fleksibel ? undefined : forste ? `${forste.dato}T${forste.tid}:00` : undefined;
    const ekstraInfo = [
      `Type: ${oktType}`,
      `Fasilitet: ${fasilitet}`,
      omrader.length > 1 ? `Områder: ${omrader.join(", ")}` : null,
      ekstraOmrader.length ? `I tillegg: ${ekstraOmrader.join(", ")}` : null,
      detalj ? `Detalj: ${detalj}` : null,
      melding ? `Melding: ${melding}` : null,
    ].filter(Boolean).join("\n");

    startTransition(async () => {
      try {
        await sendOnskeligOkt({
          preferredAt,
          pyramidArea: omrader[0] ?? "SLAG",
          notes: ekstraInfo,
          coachId: coachId || undefined,
        });
      } catch {
        setError("Kunne ikke sende. Prøv igjen.");
      }
    });
  }

  return (
    <div className="ph21">
      <header>
        <p>PlayerHQ · Be om økt</p>
        <h1>Be om økt</h1>
        <p>{coachName} svarer normalt innen 24 timer på hverdager.</p>
      </header>

      {coacher.length > 1 && (
        <Seksjon num="00 · Coach" tittel="Hvem skal ta økten?">
          <label>Coach
            <select value={coachId} onChange={(e) => setCoachId(e.target.value)}>
              <option value="">Ingen preferanse</option>
              {coacher.map((c) => {
                const duplikatNavn = coacher.filter((x) => x.name === c.name).length > 1;
                return <option key={c.id} value={c.id}>{duplikatNavn && c.email ? `${c.name} (${c.email})` : c.name}</option>;
              })}
            </select>
          </label>
        </Seksjon>
      )}

      <Seksjon num="01 · Type" tittel="Hva slags økt?">
        <div role="radiogroup" aria-label="Type økt" className="ph21-valg">
          {OKT_TYPER.map((t) => (
            <button key={t.id} type="button" aria-pressed={oktType === t.id} onClick={() => setOktType(t.id)}>
              <strong>{t.title}</strong><small>{t.tag}</small><span>{t.sub}</span>
            </button>
          ))}
        </div>
      </Seksjon>

      <Seksjon num="02 · Tema" tittel="Hva vil du jobbe med?" hjelp="Velg én eller flere. Coachen bruker dette til å forberede.">
        <div className="ph21-chips">
          {TIER_ITEMS.map((t) => <button key={t} type="button" aria-pressed={omrader.includes(t)} onClick={() => toggleTier(t)}>{t}</button>)}
        </div>
        <div className="ph21-chips">
          {EKSTRA_ITEMS.map((t) => <button key={t} type="button" aria-pressed={ekstraOmrader.includes(t)} onClick={() => toggleEkstra(t)}>{t}</button>)}
        </div>
        <label>Mer detalj (valgfritt)
          <textarea rows={3} value={detalj} placeholder="Beskriv mer hvis du vil" onChange={(e) => setDetalj(e.target.value)} />
        </label>
      </Seksjon>

      <Seksjon num="03 · Tid" tittel="Når passer det best?" hjelp="Foreslå opp til 3 alternativer — eller slå på «Helt fleksibel».">
        <div className={fleksibel ? "ph21-dim" : undefined}>
          {datoer.map((d, i) => (
            <div key={i} className="ph21-tid">
              <span>{String(i + 1).padStart(2, "0")}</span>
              <label>{i === 0 ? "Dato" : "Dato"}<input type="date" value={d.dato} onChange={(e) => setDatoer((arr) => arr.map((x, j) => (j === i ? { ...x, dato: e.target.value } : x)))} /></label>
              <label>{i === 0 ? "Klokkeslett" : "Klokkeslett"}<input type="time" value={d.tid} onChange={(e) => setDatoer((arr) => arr.map((x, j) => (j === i ? { ...x, tid: e.target.value } : x)))} /></label>
            </div>
          ))}
          {datoer.length < 3 && (
            <Knapp type="button" variant="secondary" onClick={() => setDatoer((d) => [...d, { dato: today, tid: "16:00" }])}>
              Legg til alternativ ({3 - datoer.length} igjen)
            </Knapp>
          )}
        </div>
        <label className="ph21-sjekk"><input type="checkbox" checked={fleksibel} onChange={(e) => setFleksibel(e.target.checked)} /> Helt fleksibel — coachen foreslår tid</label>
      </Seksjon>

      <Seksjon num="04 · Fasilitet" tittel="Hvor?">
        <div role="radiogroup" aria-label="Fasilitet" className="ph21-valg">
          {FASILITETER.map((f) => (
            <button key={f.id} type="button" aria-pressed={fasilitet === f.id} onClick={() => setFasilitet(f.id)}>
              <strong>{f.title}{f.suffix ? ` ${f.suffix}` : ""}</strong><span>{f.sub}</span>
            </button>
          ))}
        </div>
      </Seksjon>

      <Seksjon num="05 · Melding" tittel="Noe coachen bør vite? (valgfritt)">
        <textarea rows={3} maxLength={500} value={melding} placeholder="Skriv en kort melding hvis du vil" onChange={(e) => setMelding(e.target.value.slice(0, 500))} />
        <small>{melding.length} / 500</small>
      </Seksjon>

      {error && <p role="alert">{error}</p>}
      <Knapp type="button" fullWidth loading={pending} disabled={pending} onClick={send}>{pending ? "Sender …" : "Send forespørsel"}</Knapp>
      <button type="button" className="ph21-avbryt" onClick={() => router.push("/portal")}>Avbryt</button>
    </div>
  );
}
