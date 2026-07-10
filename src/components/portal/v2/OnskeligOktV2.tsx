"use client";

/**
 * PlayerHQ Be om økt — v2 (retning C «Presis»). Rekomponert fra den ekte
 * skjermen (src/app/portal/onskeligokt/page.tsx + form.tsx) med EKTE data
 * (coach-lista fra DB) og SAMME datakontrakt mot server-action `sendOnskeligOkt`
 * (src/app/portal/onskeligokt/actions.ts): notat-strengen pakkes 1:1 som før.
 *
 * Kun v2-komponenter fra "@/components/v2"; ingen ad-hoc UI. Ingen rå hex (T.*).
 * Anbefaling aldri sperre: Elite-runden er IKKE hardlåst (produktregel «ingenting
 * blokkerer») — den er et vanlig valg med et meta-varsel. `Seksjon` er ren
 * komposisjon av Kort + Caps (ikke en ny primitiv).
 *
 * V2Shell (montert i (v2preview)/v2-onskeligokt/page.tsx) eier chrome-en — denne
 * komponenten rendrer bare den indre innholds-stacken.
 */

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { sendOnskeligOkt } from "@/app/portal/(legacy)/onskeligokt/actions";
import {
  T,
  Caps,
  Tittel,
  Kort,
  Knapp,
  FilterChips,
  Velger,
  Inndata,
  TekstOmraade,
  Bryter,
  ValgKort,
  Icon,
} from "@/components/v2";

/* ── Datakontrakt (samme som ekte side leverer) ────────────────────── */
export interface OnskeligOktV2Data {
  coacher: { id: string; name: string }[];
  coachName: string;
}

/* ── Valg-tabeller (1:1 med form.tsx) ──────────────────────────────── */
type Tier = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
type OktType = "1:1" | "MINI" | "RANGE" | "RUNDE";
type Fasilitet = "MULLIGAN" | "GFGK" | "BOSSUM" | "COACH" | "ONLINE";

const OKT_TYPER: { id: OktType; title: string; tag: string; tagTone?: "warn"; sub: string }[] = [
  { id: "1:1", title: "1:1 Coaching", tag: "60 min", sub: "Standard 1:1 — coachen observerer, gir feedback, dere jobber sammen." },
  { id: "MINI", title: "Mini-økt", tag: "30 min", sub: "Fokus på ett spesifikt tema — typisk fra forrige runde eller test." },
  { id: "RANGE", title: "Range-besøk sammen", tag: "90 min", sub: "Coachen kommer til rangen — fri form, ofte for å sette opp ukens fokus." },
  { id: "RUNDE", title: "Spille runde sammen", tag: "4 t", tagTone: "warn", sub: "9 eller 18 hull. Coachen går med — observerer beslutningstaking. Avtales særskilt." },
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

/* ── Seksjon — Kort m/ nummer-eyebrow + display-tittel + hjelp ──────── */
function Seksjon({ num, tittel, hjelp, children }: { num: string; tittel: string; hjelp?: string; children: ReactNode }) {
  return (
    <Kort eyebrow={num}>
      <h2 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg, lineHeight: 1.25, margin: 0 }}>{tittel}</h2>
      {hjelp && <p style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, lineHeight: 1.55, margin: "5px 0 0" }}>{hjelp}</p>}
      <div style={{ marginTop: 14 }}>{children}</div>
    </Kort>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────── */
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

  function toggleTier(x: string) {
    const t = x as Tier;
    setOmrader((prev) => (prev.includes(t) ? prev.filter((y) => y !== t) : [...prev, t]));
  }
  function toggleEkstra(x: string) {
    setEkstraOmrader((prev) => (prev.includes(x) ? prev.filter((y) => y !== x) : [...prev, x]));
  }
  function leggTilTid() {
    if (datoer.length >= 3) return;
    setDatoer((d) => [...d, { dato: today, tid: "16:00" }]);
  }

  function send() {
    setError(null);
    const forste = datoer[0];
    const preferredAt = fleksibel ? undefined : forste ? `${forste.dato}T${forste.tid}:00` : undefined;
    const omradeStr = omrader[0] ?? "SLAG";
    const ekstraInfo = [
      `Type: ${oktType}`,
      `Fasilitet: ${fasilitet}`,
      omrader.length > 1 ? `Områder: ${omrader.join(", ")}` : null,
      ekstraOmrader.length ? `I tillegg: ${ekstraOmrader.join(", ")}` : null,
      detalj ? `Detalj: ${detalj}` : null,
      melding ? `Melding: ${melding}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    startTransition(async () => {
      try {
        await sendOnskeligOkt({
          preferredAt,
          pyramidArea: omradeStr,
          notes: ekstraInfo,
          coachId: coachId || undefined,
        });
      } catch {
        setError("Kunne ikke sende. Prøv igjen.");
      }
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 720, margin: "0 auto", width: "100%" }}>
      {/* Hode */}
      <div>
        <Caps>PlayerHQ · Be om økt</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="økt">Be om</Tittel>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg2, lineHeight: 1.55, margin: "10px 0 0" }}>
          {coachName} svarer normalt innen 24 timer på hverdager.
        </p>
      </div>

      {/* 00 · COACH — kun hvis flere coacher å velge mellom */}
      {coacher.length > 1 && (
        <Seksjon num="00 · COACH" tittel="Hvem skal ta økten?">
          <Velger
            label={null}
            options={["Ingen preferanse", ...coacher.map((c) => c.name)]}
            defaultValue={coacher.find((c) => c.id === coachId)?.name ?? "Ingen preferanse"}
            onChange={(navn) => setCoachId(coacher.find((c) => c.name === navn)?.id ?? "")}
          />
        </Seksjon>
      )}

      {/* 01 · TYPE */}
      <Seksjon num="01 · TYPE" tittel="Hva slags økt?">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }} role="radiogroup" aria-label="Type økt">
          {OKT_TYPER.map((t) => (
            <ValgKort
              key={t.id}
              tittel={t.title}
              tag={t.tag}
              tagTone={t.tagTone}
              sub={t.sub}
              valgt={oktType === t.id}
              onClick={() => setOktType(t.id)}
            />
          ))}
        </div>
      </Seksjon>

      {/* 02 · TEMA */}
      <Seksjon num="02 · TEMA" tittel="Hva vil du jobbe med?" hjelp="Velg én eller flere. Coachen bruker dette til å forberede.">
        <FilterChips items={TIER_ITEMS} active={omrader} onToggle={toggleTier} axis />
        <div style={{ marginTop: 10 }}>
          <FilterChips items={EKSTRA_ITEMS} active={ekstraOmrader} onToggle={toggleEkstra} />
        </div>
        <div style={{ marginTop: 16 }}>
          <TekstOmraade
            label="Mer detalj (valgfritt)"
            value={detalj}
            rows={3}
            placeholder="Beskriv mer hvis du vil — eks. «Jeg sliter med høyre-misser fra 100 m sist runde»"
            onChange={setDetalj}
          />
        </div>
      </Seksjon>

      {/* 03 · TID */}
      <Seksjon num="03 · TID" tittel="Når passer det best?" hjelp="Foreslå opp til 3 alternativer — eller slå på «Helt fleksibel».">
        <div style={{ opacity: fleksibel ? 0.45 : 1, pointerEvents: fleksibel ? "none" : "auto", transition: "opacity 160ms" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {datoer.map((d, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "26px 1fr 1fr", alignItems: "end", gap: 10 }}>
                <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.mut, paddingBottom: 11 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Inndata
                  label={i === 0 ? "Dato" : null}
                  type="date"
                  value={d.dato}
                  onChange={(v) => setDatoer((arr) => arr.map((x, j) => (j === i ? { ...x, dato: v } : x)))}
                />
                <Inndata
                  label={i === 0 ? "Klokkeslett" : null}
                  type="time"
                  value={d.tid}
                  onChange={(v) => setDatoer((arr) => arr.map((x, j) => (j === i ? { ...x, tid: v } : x)))}
                />
              </div>
            ))}
          </div>
          {datoer.length < 3 && (
            <div style={{ marginTop: 12 }}>
              <Knapp ghost icon="plus" onClick={leggTilTid}>
                Legg til alternativ ({3 - datoer.length} igjen)
              </Knapp>
            </div>
          )}
        </div>
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
          <Bryter
            label="Helt fleksibel"
            sub="Coachen foreslår tid"
            checked={fleksibel}
            onChange={setFleksibel}
          />
        </div>
      </Seksjon>

      {/* 04 · FASILITET */}
      <Seksjon num="04 · FASILITET" tittel="Hvor?">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }} role="radiogroup" aria-label="Fasilitet">
          {FASILITETER.map((f) => (
            <ValgKort
              key={f.id}
              tittel={f.title}
              tittelSuffix={f.suffix}
              sub={f.sub}
              valgt={fasilitet === f.id}
              onClick={() => setFasilitet(f.id)}
            />
          ))}
        </div>
      </Seksjon>

      {/* 05 · MELDING */}
      <Seksjon num="05 · MELDING" tittel="Noe coachen bør vite? (valgfritt)">
        <TekstOmraade
          label={null}
          value={melding}
          rows={3}
          placeholder="Skriv en kort melding hvis du vil …"
          onChange={(v) => setMelding(v.slice(0, 500))}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
          <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, fontVariantNumeric: "tabular-nums" }}>{melding.length} / 500</span>
        </div>
      </Seksjon>

      {error && (
        <div role="alert" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 13px", borderRadius: 11, background: `color-mix(in srgb, ${T.down} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${T.down} 34%, transparent)` }}>
          <Icon name="triangle-alert" size={14} style={{ color: T.down }} />
          <span style={{ fontFamily: T.ui, fontSize: 13, color: T.fg }}>{error}</span>
        </div>
      )}

      {/* Handlinger */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", paddingTop: 6 }}>
        <Knapp ghost icon="arrow-left" onClick={() => router.push("/portal")}>
          Avbryt
        </Knapp>
        <Knapp icon="send" onClick={send} disabled={pending}>
          {pending ? "Sender …" : "Send forespørsel"}
        </Knapp>
      </div>
    </div>
  );
}
