"use client";

/**
 * AG-06-NY Ny booking — hele veiviseren i Precision (tegning: AG-mer.jsx
 * AG06 «ny», AG-06.jsx fanen «Ny booking»). Fem steg: Hvem (spiller eller
 * gruppe) · Tjeneste · Sted · Tid · Bekreft, med betalingsvalg Klipp, Faktura
 * og Gratis (Anders 29.09.2026).
 *
 * Samme handlinger som den gamle veiviseren: spiller → createSessionFromCalendar
 * (opprettOktPaaTid med kollisjonsvern og Google), gruppe → opprettGruppeTrening.
 * Samme coach/fasilitet-sjekk (isValidCoachFacilityPair). Tid sendes som
 * «YYYY-MM-DDTHH:mm» og tolkes som Oslo-veggklokke på serveren.
 */
import "@/styles/precision-a4.css";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { Knapp, Meta } from "@/components/precision/pa";
import { Kort, Nedtrekk, Nokkelverdi, Skjemafelt, Tekstfelt, TekstOmrade } from "@/components/precision/pa-a4";
import { Datofelt, Segment, Steglinje, Valgpille, Valgrad, Varsel, tidsvalg } from "@/components/precision/pa-booking";
import { Sokefelt } from "@/components/precision/pa-a2";
import { isValidCoachFacilityPair } from "@/lib/booking/facility-scope";
import { lokalSlutt } from "@/lib/booking/lokal-slutt";
import { createSessionFromCalendar } from "@/app/admin/(legacy)/calendar/actions";
import { opprettGruppeTrening } from "@/app/admin/grupper/[id]/actions";
import type { NyBookingData } from "@/app/admin/bookinger/ny-data";

const STEG = ["Hvem", "Tjeneste", "Sted", "Tid", "Bekreft"] as const;
type Betaling = "KLIPP" | "FAKTURA" | "GRATIS";

function kr(ore: number): string {
  return `${(ore / 100).toLocaleString("nb-NO", { maximumFractionDigits: 0 })} kr`;
}

function sluttTid(tid: string, min: number): string {
  const [h, m] = tid.split(":").map(Number);
  const t = h * 60 + m + min;
  return `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

function splittStart(iso?: string): { dato: string; tid: string } {
  const m = iso ? /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(iso) : null;
  return m ? { dato: m[1], tid: m[2] } : { dato: "", tid: "" };
}

export function AG06NyBooking({ data, startGruppeId, startTid, startCoachId, forvalg: fv }: {
  data: NyBookingData; startGruppeId?: string; startTid?: string; startCoachId?: string;
  /** Forhåndsvalg (prøvefilen måler senere steg med dette). */
  forvalg?: { steg?: number; spillerId?: string; tjenesteId?: string; stedId?: string };
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [steg, setSteg] = useState(fv?.steg ?? 0);
  const [modus, setModus] = useState<"spiller" | "gruppe">(startGruppeId ? "gruppe" : "spiller");
  const [spillerId, setSpillerId] = useState<string | null>(fv?.spillerId ?? null);
  const [gruppeId, setGruppeId] = useState<string | null>(startGruppeId ?? null);
  const [sok, setSok] = useState("");
  const [coachFilter, setCoachFilter] = useState<string | null>(startCoachId ?? (data.erAdmin ? null : data.coachId));
  const [tjenesteId, setTjenesteId] = useState<string | null>(fv?.tjenesteId ?? null);
  const [stedId, setStedId] = useState<string | null>(fv?.stedId ?? null);
  const [fasilitetId, setFasilitetId] = useState<string | null>(null);
  const forvalg = splittStart(startTid);
  const [dato, setDato] = useState(forvalg.dato);
  const [tid, setTid] = useState(forvalg.tid);
  const [notat, setNotat] = useState("");
  const gruppe0 = data.grupper.find((g) => g.id === startGruppeId);
  const [maks, setMaks] = useState(gruppe0?.maksDeltakere ? String(gruppe0.maksDeltakere) : "");
  const [betaling, setBetaling] = useState<Betaling | null>(null);
  const [feil, setFeil] = useState<string | null>(null);

  const spiller = data.spillere.find((s) => s.id === spillerId) ?? null;
  const gruppe = data.grupper.find((g) => g.id === gruppeId) ?? null;
  const tjenester = useMemo(() => data.tjenester.filter((t) => !coachFilter || t.coachId == null || t.coachId === coachFilter), [data.tjenester, coachFilter]);
  const tjeneste = data.tjenester.find((t) => t.id === tjenesteId) ?? null;
  const sted = data.steder.find((s) => s.id === stedId) ?? null;
  const coachForFas = data.coacher.find((c) => c.id === coachFilter) ?? (tjeneste?.coachId ? data.coacher.find((c) => c.id === tjeneste.coachId) : undefined);
  const fasiliteter = useMemo(() => {
    const alle = sted?.fasiliteter ?? [];
    const ider = coachForFas?.fasilitetIder;
    return !ider || ider.length === 0 ? alle : alle.filter((f) => ider.includes(f.id));
  }, [sted, coachForFas]);
  const fasilitet = fasiliteter.find((f) => f.id === fasilitetId) ?? null;
  const coachNavn = tjeneste?.coachNavn ?? (coachFilter ? data.coacher.find((c) => c.id === coachFilter)?.navn : null) ?? null;
  const filtrerte = useMemo(() => {
    const q = sok.trim().toLowerCase();
    if (!q) return data.spillere;
    return data.spillere.filter((s) => s.navn.toLowerCase().includes(q) || s.epost.toLowerCase().includes(q) || (s.klubb?.toLowerCase().includes(q) ?? false));
  }, [data.spillere, sok]);

  const klippIgjen = spiller?.klippIgjen ?? null;
  const valgtBetaling: Betaling | null = betaling ?? (modus === "spiller" ? (klippIgjen && klippIgjen > 0 ? "KLIPP" : "FAKTURA") : null);
  const pris = !tjeneste ? null : valgtBetaling === "KLIPP" ? "1 klipp fra coaching-pakken" : valgtBetaling === "GRATIS" ? "0 kr · gratis" : kr(tjeneste.prisOre);

  const kanVidere = [
    modus === "spiller" ? !!spillerId : !!gruppeId,
    !!tjenesteId,
    !!stedId,
    /^\d{4}-\d{2}-\d{2}$/.test(dato) && /^\d{2}:\d{2}$/.test(tid),
    true,
  ][steg];

  const opprett = () => {
    if (!tjeneste || !stedId || !dato || !tid) { setFeil("Fyll ut alle stegene."); return; }
    const coachPar = data.coacher.find((c) => c.id === coachFilter) ?? (tjeneste.coachId ? data.coacher.find((c) => c.id === tjeneste.coachId) : undefined);
    if (coachPar && fasilitetId && !isValidCoachFacilityPair({ id: coachPar.id, name: coachPar.navn, facilityIds: coachPar.fasilitetIder }, fasilitetId)) {
      setFeil("Valgt coach er ikke tilgjengelig på denne fasiliteten.");
      return;
    }
    const startLokal = `${dato}T${tid}`;
    setFeil(null);
    start(async () => {
      try {
        if (modus === "gruppe" && gruppeId) {
          const res = await opprettGruppeTrening(gruppeId, {
            title: tjeneste.navn + (gruppe ? ` · ${gruppe.navn}` : ""),
            startAt: startLokal,
            endAt: lokalSlutt(startLokal, tjeneste.varighetMin),
            location: sted?.navn,
            recurring: "NONE",
            maxParticipants: maks ? Number(maks) : undefined,
          });
          if (!res.ok) { setFeil(res.feil); return; }
          router.push(`/admin/grupper/${gruppeId}/timeplan`);
        } else if (spillerId) {
          const res = await createSessionFromCalendar({
            spillerId,
            serviceTypeId: tjeneste.id,
            locationId: stedId,
            facilityId: fasilitetId ?? undefined,
            startAt: startLokal,
            varighetMin: tjeneste.varighetMin,
            notater: notat.trim() || undefined,
            betaling: valgtBetaling ?? undefined,
          });
          router.push(`/admin/bookinger/${res.bookingId}`);
        }
        router.refresh();
      } catch (e) {
        setFeil(e instanceof Error ? e.message : "Kunne ikke opprette bookingen.");
      }
    });
  };

  let kropp: React.ReactNode;
  if (steg === 0) {
    kropp = (
      <>
        <Segment label="Booking for" full value={modus} options={[{ id: "spiller", label: "Spiller" }, { id: "gruppe", label: "Gruppe" }]} onChange={(v) => { setModus(v); setBetaling(null); }} />
        {modus === "spiller" ? (
          <>
            <Sokefelt label="Søk spiller" value={sok} onChange={setSok} placeholder="Søk navn, e-post eller klubb" />
            <div className="a4-liste" role="radiogroup" aria-label="Spiller">
              {filtrerte.length === 0 ? <Meta>INGEN SPILLERE MATCHER SØKET</Meta> : filtrerte.map((s) => (
                <Valgrad
                  key={s.id}
                  valgt={spillerId === s.id}
                  onVelg={() => { setSpillerId(s.id); setBetaling(null); }}
                  tittel={s.navn}
                  under={[s.klubb, s.epost].filter(Boolean).join(" · ").toUpperCase()}
                  side={s.klippIgjen != null ? <Meta>{s.klippIgjen} KLIPP</Meta> : null}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="a4-liste" role="radiogroup" aria-label="Gruppe">
            {data.grupper.length === 0 ? <Meta>DU HAR INGEN GRUPPER</Meta> : data.grupper.map((g) => (
              <Valgrad key={g.id} valgt={gruppeId === g.id} onVelg={() => { setGruppeId(g.id); setMaks(g.maksDeltakere ? String(g.maksDeltakere) : ""); }} tittel={g.navn} under={g.maksDeltakere ? `MAKS ${g.maksDeltakere} DELTAKERE` : "INGEN GRENSE PÅ DELTAKERE"} />
            ))}
          </div>
        )}
      </>
    );
  } else if (steg === 1) {
    kropp = (
      <>
        {data.erAdmin && data.coacher.length > 1 && (
          <div className="a4-pilrad" role="group" aria-label="Filter på coach">
            <Valgpille valgt={coachFilter === null} onClick={() => { setCoachFilter(null); setTjenesteId(null); }}>Alle coacher</Valgpille>
            {data.coacher.map((c) => <Valgpille key={c.id} valgt={coachFilter === c.id} onClick={() => { setCoachFilter(c.id); setTjenesteId(null); }}>{c.navn}</Valgpille>)}
          </div>
        )}
        <div className="a4-liste" role="radiogroup" aria-label="Tjeneste">
          {tjenester.length === 0 ? <Meta>INGEN TJENESTER FOR VALGT COACH</Meta> : tjenester.map((t) => (
            <Valgrad
              key={t.id}
              valgt={tjenesteId === t.id}
              onVelg={() => setTjenesteId(t.id)}
              tittel={t.navn}
              under={[`${t.varighetMin} MIN`, t.coachNavn?.toUpperCase() ?? "FELLES", t.maksDeltakere > 1 ? `${t.maksDeltakere} PLASSER` : null].filter(Boolean).join(" · ")}
              side={kr(t.prisOre)}
            />
          ))}
        </div>
      </>
    );
  } else if (steg === 2) {
    kropp = (
      <>
        <div className="a4-liste" role="radiogroup" aria-label="Sted">
          {data.steder.length === 0 ? <Meta>INGEN AKTIVE STEDER · LEGG TIL UNDER ANLEGG</Meta> : data.steder.map((s) => (
            <Valgrad key={s.id} valgt={stedId === s.id} onVelg={() => { setStedId(s.id); setFasilitetId(null); }} tittel={s.navn} under={s.adresse.toUpperCase()} />
          ))}
        </div>
        {sted && fasiliteter.length > 0 && (
          <div className="a4-pilrad" role="group" aria-label="Fasilitet">
            <Valgpille valgt={fasilitetId === null} onClick={() => setFasilitetId(null)}>Hele stedet</Valgpille>
            {fasiliteter.map((f) => <Valgpille key={f.id} valgt={fasilitetId === f.id} onClick={() => setFasilitetId(f.id)}>{f.navn}{f.kapasitet > 1 ? ` · kap. ${f.kapasitet}` : ""}</Valgpille>)}
          </div>
        )}
      </>
    );
  } else if (steg === 3) {
    kropp = (
      <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))", gap: 12 }}>
          <Skjemafelt label="Dato" required><Datofelt value={dato} onChange={setDato} /></Skjemafelt>
          <Skjemafelt label="Starttid" required><Nedtrekk value={tid} onChange={setTid} options={[{ value: "", label: "Velg" }, ...tidsvalg()]} /></Skjemafelt>
        </div>
        {tjeneste && <Meta>VARIGHET {tjeneste.varighetMin} MIN{tid ? ` · SLUTT ${sluttTid(tid, tjeneste.varighetMin)}` : ""}</Meta>}
        {modus === "gruppe" && (
          <Skjemafelt label="Maks deltakere" hint="Tomt = ingen grense"><Tekstfelt mono inputMode="numeric" value={maks} onChange={(v) => setMaks(v.replace(/\D/g, ""))} placeholder="—" /></Skjemafelt>
        )}
        <Skjemafelt label="Notat (valgfritt)" hint="Intern merknad om bookingen."><TekstOmrade value={notat} onChange={(v) => setNotat(v.slice(0, 500))} placeholder="—" /></Skjemafelt>
      </>
    );
  } else {
    kropp = (
      <>
        {modus === "spiller" ? (
          <div role="radiogroup" aria-label="Betaling">
            <Valgrad
              valgt={valgtBetaling === "KLIPP"}
              disabled={!klippIgjen || klippIgjen <= 0}
              onVelg={() => setBetaling("KLIPP")}
              tittel="Klipp"
              under={klippIgjen == null ? "SPILLEREN HAR INGEN AKTIV COACHING-PAKKE" : `${klippIgjen} KLIPP IGJEN I PAKKEN · TREKKER ETT`}
            />
            <Valgrad valgt={valgtBetaling === "FAKTURA"} onVelg={() => setBetaling("FAKTURA")} tittel="Faktura" under="MERKES «SKAL FAKTURERES» · FAKTURAEN LAGES I TRIPLETEX" side={tjeneste ? kr(tjeneste.prisOre) : null} />
            <Valgrad valgt={valgtBetaling === "GRATIS"} onVelg={() => setBetaling("GRATIS")} tittel="Gratis" under="INGEN BETALING" side="0 kr" />
          </div>
        ) : (
          <Varsel tone="info" tittel="Gruppetime">Timen legges i gruppas timeplan. Betaling følger gruppeavtalen.</Varsel>
        )}
        <Meta>{data.policy.toUpperCase()}</Meta>
      </>
    );
  }

  const sammendrag = (
    <Kort>
      <span className="kicker">Sammendrag</span>
      <Nokkelverdi items={[
        [modus === "gruppe" ? "Gruppe" : "Spiller", modus === "gruppe" ? gruppe?.navn ?? null : spiller?.navn ?? null, {}],
        ["Coach", coachNavn ?? (tjeneste ? "Felles" : null), {}],
        ["Tjeneste", tjeneste ? `${tjeneste.navn} · ${tjeneste.varighetMin} min` : null, {}],
        ["Sted", sted ? `${sted.navn}${fasilitet ? ` · ${fasilitet.navn}` : ""}` : null, {}],
        ["Tid", dato && tid ? `${dato} ${tid}${tjeneste ? `–${sluttTid(tid, tjeneste.varighetMin)}` : ""}` : null, { mono: true }],
        ["Pris", modus === "gruppe" ? "—" : pris, { mono: valgtBetaling !== "KLIPP", hint: tjeneste && modus === "spiller" ? "FRA SERVICETYPE" : undefined }],
      ]} />
    </Kort>
  );

  return (
    <div className="a4-todel">
      <Kort>
        <span className="kicker">Ny booking · steg {steg + 1} av {STEG.length} · {STEG[steg]}</span>
        <Steglinje steg={STEG} aktiv={steg} />
        {kropp}
        {feil && <p role="alert" className="a4-feil">{feil}</p>}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 4 }}>
          {steg < STEG.length - 1 ? (
            <Knapp iconRight={ArrowRight} disabled={!kanVidere} onClick={() => { setFeil(null); setSteg(steg + 1); }}>Neste</Knapp>
          ) : (
            <Knapp icon={Check} iconName="check" loading={pending} loadingText="Oppretter …" onClick={opprett}>Opprett booking</Knapp>
          )}
          {steg > 0 && <Knapp variant="ghost" onClick={() => { setFeil(null); setSteg(steg - 1); }}>Tilbake</Knapp>}
        </div>
      </Kort>
      {sammendrag}
    </div>
  );
}
