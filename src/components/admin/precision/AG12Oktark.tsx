"use client";

/**
 * AG-12 Øktark etter live i Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/agencyos/screens/AG-cockpit.jsx › AG12, som katalogen laster sist).
 * Rute: /admin/gjennomfore/okter/[id] (id er bookingen).
 *
 * Det som virker som før: status fra tid, start økt / åpne live-konsollen
 * (startOkt), avlys med bekreftelse og varsel til spilleren
 * (kansellerBooking), flytt via bookinger, tilbake til kalenderen og
 * «Skriv oppfølging» i live-konsollen.
 *
 * Nytt fra ekte data (lastLiveOktData, uendret laster): øvelsene i økta med
 * logget-status, sammendraget fra opptaket (coachAnalyse, laget av den
 * eksisterende opptaksanalysen der navn er tatt ut før teksten sendes til AI),
 * fokuspunktet og coachens vurdering.
 *
 * Fjernet: plassholderne i den gamle siden (fem oppdiktede putte-øvelser,
 * prep-notat, «ønsket»-notat, vurdering 4/5 og «siste fem» økter). Ingen av
 * dem kom fra data.
 *
 * Parkert (ingen handling eller data i appen): «Godkjenn og send» av
 * sammendraget til spilleren, TrackMan-baseline med «Bruk som startverdi» og
 * hjemmelekse lagt i planen. Seksjonene viser «—».
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarClock, FileText, Play, X } from "lucide-react";
import { AkseMerke, Knapp, KnappLenke, Meta, StatusPille, TomTilstand } from "@/components/precision/pa";
import { Nokkelverdi, SideHode } from "@/components/precision/pa-a4";
import { Dialog, Etikett, Liste, Listerad, Seksjon, Utkastmerke, Varsel, type PaAkse } from "@/components/precision/pa-planhub";
import { kansellerBooking, startOkt } from "@/app/admin/gjennomfore/okter/[id]/actions";

export type OktarkStatus = "PLANLAGT" | "AKTIV" | "GJENNOMFORT";

export type OktarkData = {
  bookingId: string;
  status: OktarkStatus;
  spillerNavn: string;
  spillerMeta: string;
  fornavn: string;
  dateLabel: string;
  startTime: string;
  endTime: string;
  facilityLabel: string | null;
  durationMin: number;
  trainingSessionV2Id: string | null;
  /** Fra live-økta (lastLiveOktData). null når bookingen ikke er koblet til en økt. */
  okt: {
    tittel: string;
    malsetning: string | null;
    driller: { id: string; navn: string; varighetMin: number; pyramide: string; logget: boolean }[];
    opptak: { status: string; durationSec: number | null; harAvskrift: boolean; sammendrag: string | null } | null;
    coachBrief: string;
    coachRating: number | null;
  } | null;
};

const STATUS: Record<OktarkStatus, { label: string; tone: "neutral" | "live" | "ok" }> = {
  PLANLAGT: { label: "Planlagt", tone: "neutral" },
  AKTIV: { label: "Pågår nå", tone: "live" },
  GJENNOMFORT: { label: "Gjennomført", tone: "ok" },
};

const erAkse = (p: string): p is Uppercase<PaAkse> => ["FYS", "TEK", "SLAG", "SPILL", "TURN"].includes(p);
const OPPTAK_STATUS: Record<string, string> = { RECORDING: "TAR OPP", PROCESSING: "BEHANDLES", DONE: "FERDIG", FAILED: "FEILET", ABORTED: "AVBRUTT", PENDING: "VENTER" };
const varighet = (sek: number | null) => (sek == null ? "—" : `${Math.floor(sek / 60)}:${String(sek % 60).padStart(2, "0")}`);

export function AG12Oktark({ data }: { data: OktarkData }) {
  const router = useRouter();
  const [venter, start] = useTransition();
  const [handling, setHandling] = useState<"start" | "avlys" | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [avlysApen, setAvlysApen] = useState(false);
  const s = STATUS[data.status];
  const okt = data.okt;
  const logget = okt ? okt.driller.filter((d) => d.logget).length : 0;

  function startLive() {
    setFeil(null);
    setHandling("start");
    start(async () => {
      const res = await startOkt(data.bookingId);
      if (res.ok && res.sessionId) router.push(`/admin/agencyos/live/${res.sessionId}`);
      else setFeil(res.error ?? "Kunne ikke starte økta. Prøv igjen.");
    });
  }

  function bekreftAvlys() {
    setFeil(null);
    setHandling("avlys");
    start(async () => {
      const res = await kansellerBooking(data.bookingId);
      if (res.ok) { setAvlysApen(false); router.refresh(); }
      else setFeil(res.error ?? "Avlysningen feilet. Prøv igjen.");
    });
  }

  const liveHref = data.trainingSessionV2Id ? `/admin/agencyos/live/${data.trainingSessionV2Id}` : null;

  const info = <Seksjon tittel="Økta" meta={<StatusPille tone={s.tone}>{s.label}</StatusPille>}>
    <Nokkelverdi items={[
      ["Spiller", data.spillerNavn],
      ["Tid", `${data.dateLabel} · ${data.startTime}–${data.endTime}`, { mono: true }],
      ["Varighet", `${data.durationMin} min`, { mono: true }],
      ["Sted", data.facilityLabel ?? "—"],
      ["Spillerdata", data.spillerMeta || "—", { mono: true }],
      ["Gjennomført", okt && okt.driller.length > 0 ? `${logget} av ${okt.driller.length} øvelser` : "—", { mono: true, hint: okt ? "LOGGET I ØKTA" : undefined }],
      ["Vurdering", okt?.coachRating != null ? `${okt.coachRating}/5` : "—", { mono: true }],
    ]} />
    {data.status !== "GJENNOMFORT"
      ? <div className="a10-knapperad">
        <Knapp icon={Play} iconName="play" onClick={startLive} loading={venter && handling === "start"} loadingText="Starter …" disabled={venter}>{data.status === "AKTIV" ? "Åpne live-konsollen" : "Start økt"}</Knapp>
        <KnappLenke href="/admin/bookinger" variant="secondary" icon={CalendarClock} iconName="calendar-clock">Flytt</KnappLenke>
        <Knapp variant="ghost" icon={X} iconName="x" onClick={() => setAvlysApen(true)} disabled={venter}>Avlys</Knapp>
      </div>
      : <div className="a10-knapperad">
        {liveHref ? <KnappLenke href={liveHref} variant="secondary" icon={FileText} iconName="file-text">Skriv oppfølging</KnappLenke> : <Knapp variant="secondary" icon={FileText} iconName="file-text" disabled>Skriv oppfølging</Knapp>}
      </div>}
    {feil && <Varsel tone="warn" tittel="Handlingen feilet">{feil}</Varsel>}
  </Seksjon>;

  const sammendrag = <Seksjon tittel="Sammendrag" meta={okt?.opptak?.sammendrag ? "UTKAST TIL DEG" : "—"}>
    {okt?.opptak?.sammendrag
      ? <>
        <Utkastmerke>Utkast fra Caddie</Utkastmerke>
        <div className="a10-notat">{okt.opptak.sammendrag}</div>
        <Meta>BYGGER PÅ OPPTAKET · NAVN TAS UT FØR TEKSTEN SENDES TIL AI · GODKJENN OG SEND TIL SPILLEREN ER IKKE BYGGET ENNÅ</Meta>
      </>
      : <TomTilstand icon={FileText} title="Ingen notater eller opptak" text="Det finnes ikke noe å lage sammendrag av ennå. Skriv oppfølgingen i live-konsollen."
        actions={liveHref ? <KnappLenke href={liveHref} variant="secondary">Åpne live-konsollen</KnappLenke> : undefined} />}
    {okt?.coachBrief && <div className="a10-stabel a10-stabel--tett"><span className="kicker">Fokuspunkt sendt til spilleren</span><div className="a10-notat">{okt.coachBrief}</div></div>}
  </Seksjon>;

  const ovelser = <Seksjon tittel="Øvelser i økta" meta={okt && okt.driller.length > 0 ? `${logget} AV ${okt.driller.length} LOGGET` : "—"}>
    {!okt || okt.driller.length === 0
      ? <Meta>{okt ? "INGEN ØVELSER I ØKTA" : "BOOKINGEN ER IKKE KOBLET TIL EN ØKT ENNÅ · START ØKTA FOR Å KOBLE DEN"}</Meta>
      : <Liste label="Øvelser i økta">{okt.driller.map((d) => <Listerad key={d.id} mal="auto minmax(0,1fr) auto" min={48}>
        {erAkse(d.pyramide) ? <AkseMerke axis={d.pyramide.toLowerCase() as PaAkse} size="sm" /> : <Meta>—</Meta>}
        <Etikett a={d.navn} sub={`${d.varighetMin} MIN`} />
        <StatusPille tone={d.logget ? "ok" : "neutral"}>{d.logget ? "Logget" : "Ikke logget"}</StatusPille>
      </Listerad>)}</Liste>}
    {okt?.malsetning && <Meta>MÅLSETNING · {okt.malsetning.toUpperCase()}</Meta>}
  </Seksjon>;

  const fraOkta = <Seksjon tittel="Fra økta" meta={okt?.opptak ? "1 OPPTAK" : "—"}>
    {okt?.opptak
      ? <Liste label="Fra økta"><Listerad min={44}><Etikett a="Opptak" sub={`${OPPTAK_STATUS[okt.opptak.status] ?? okt.opptak.status} · ${okt.opptak.harAvskrift ? "AVSKRIFT KLAR" : "INGEN AVSKRIFT"}`} /><Meta>{varighet(okt.opptak.durationSec)}</Meta></Listerad></Liste>
      : <Meta>INGEN OPPTAK KNYTTET TIL ØKTA</Meta>}
  </Seksjon>;

  const trackman = <Seksjon tittel="TrackMan-baseline" meta="—"><Meta>INGEN TRACKMAN-DATA KNYTTET TIL ØKTA</Meta></Seksjon>;
  const hjemmelekse = <Seksjon tittel="Hjemmelekse i planen" meta="—"><Meta>INGEN HJEMMELEKSE LAGT I PLANEN FRA ØKTA</Meta></Seksjon>;

  return <div className="pa-side">
    <div><KnappLenke href="/admin/kalender" variant="ghost" icon={ArrowLeft} iconName="arrow-left">Kalender</KnappLenke></div>
    <SideHode kicker={`Øktark · ${okt?.tittel ?? "coaching"} · ${data.startTime}`} title={data.spillerNavn} sub={`${data.dateLabel} · ${data.facilityLabel ?? "—"} · ${data.durationMin} min`} />
    <div className="a10-to">
      <div className="a10-stabel">{info}{sammendrag}{hjemmelekse}</div>
      <div className="a10-stabel">{ovelser}{trackman}{fraOkta}</div>
    </div>
    <Dialog open={avlysApen} onClose={() => !venter && setAvlysApen(false)} tittel="Avlys økta"
      footer={<>
        <Knapp variant="signal" icon={X} iconName="x" onClick={bekreftAvlys} loading={venter && handling === "avlys"} loadingText="Avlyser …">Avlys økta</Knapp>
        <Knapp variant="ghost" onClick={() => setAvlysApen(false)} disabled={venter}>Behold økta</Knapp>
      </>}>
      <p className="a10-ev__tekst" style={{ margin: 0 }}>Økta avlyses og {data.fornavn} får et varsel. Dette kan ikke angres herfra. En ny økt må bookes på nytt.</p>
    </Dialog>
  </div>;
}
