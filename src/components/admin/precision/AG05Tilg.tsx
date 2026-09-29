"use client";

/**
 * AG-05 fane «Tilgjengelighet» i Precision (29.09.2026): fast ukemønster med
 * flere vinduer per dag, datounntak, repetisjon, gyldighet og sted. Alle
 * endringer går gjennom de uendrede handlingene addSlot/updateSlot/deleteSlot
 * (guard, eierskap og «ikke to steder samtidig» ligger der). Av/på bruker
 * `settUkedagAktiv`, som sender med alle feltene så ingenting nullstilles.
 *
 * Månedsoversikt, årsplan-gantt og Google-synk lever fortsatt på
 * /admin/availability.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Pencil, Plus, Trash2 } from "lucide-react";
import { Knapp, KnappLenke, Meta, TomTilstand } from "@/components/precision/pa";
import { Ark, Bryter, Dialogboks, Kort, Nedtrekk, Skjemafelt } from "@/components/precision/pa-a4";
import { Datofelt, Segment, tidsvalg } from "@/components/precision/pa-booking";
import { IkonKnapp } from "@/components/precision/pa-a2";
import { settUkedagAktiv } from "@/app/admin/kalender/tilg-actions";
import { addSlot, deleteSlot, updateSlot, type SlotInput } from "@/app/admin/(legacy)/availability/actions";
import type { TilgData, TilgVindu } from "@/app/admin/kalender/tilg-data";

const DAGER = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];
const REP: Record<number, string> = { 2: "annenhver uke", 3: "hver 3. uke", 4: "hver 4. uke" };

type Skjema = {
  id: string | null;
  type: "uke" | "dato";
  ukedag: string;
  dato: string;
  start: string;
  slutt: string;
  aktiv: boolean;
  stedId: string;
  gyldigFra: string;
  gyldigTil: string;
  repetisjon: string;
};

function tomtSkjema(type: "uke" | "dato", ukedag = 0): Skjema {
  return { id: null, type, ukedag: String(ukedag), dato: "", start: "15:00", slutt: "19:00", aktiv: true, stedId: "", gyldigFra: "", gyldigTil: "", repetisjon: "1" };
}

function fraVindu(v: TilgVindu): Skjema {
  return {
    id: v.id,
    type: v.dato ? "dato" : "uke",
    ukedag: String(v.ukedag ?? 0),
    dato: v.dato ?? "",
    start: v.start,
    slutt: v.slutt,
    aktiv: v.aktiv,
    stedId: v.stedId ?? "",
    gyldigFra: v.gyldigFra ?? "",
    gyldigTil: v.gyldigTil ?? "",
    repetisjon: String(v.repetisjon ?? 1),
  };
}

function tilInput(s: Skjema): SlotInput {
  const uke = s.type === "uke";
  return {
    weekday: uke ? Number(s.ukedag) : null,
    date: uke ? null : s.dato || null,
    startTime: s.start,
    endTime: s.slutt,
    active: s.aktiv,
    locationId: s.stedId || null,
    validFrom: uke ? s.gyldigFra || null : null,
    validTo: uke ? s.gyldigTil || null : null,
    recurrenceInterval: uke && Number(s.repetisjon) > 1 ? Number(s.repetisjon) : null,
  };
}

function datoTekst(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("nb-NO", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d)));
}

function vinduMeta(v: TilgVindu): string {
  return [
    v.stedNavn ?? "Alle steder",
    v.repetisjon && v.repetisjon > 1 ? REP[v.repetisjon] ?? `hver ${v.repetisjon}. uke` : null,
    v.gyldigFra || v.gyldigTil ? `${v.gyldigFra ? datoTekst(v.gyldigFra) : "…"}–${v.gyldigTil ? datoTekst(v.gyldigTil) : "…"}` : null,
    !v.gjelderNaa ? "gjelder ikke i dag" : null,
  ].filter(Boolean).join(" · ").toUpperCase();
}

export function AG05Tilg({ data }: { data: TilgData }) {
  const [pending, start] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const [skjema, setSkjema] = useState<Skjema | null>(null);
  const [slett, setSlett] = useState<TilgVindu | null>(null);
  const router = useRouter();

  const ukentlige = data.vinduer.filter((v) => v.ukedag !== null);
  const unntak = data.vinduer.filter((v) => v.dato !== null).sort((a, b) => (a.dato ?? "").localeCompare(b.dato ?? ""));
  const kommendeUnntak = unntak.filter((v) => (v.dato ?? "") >= data.idag);

  const kjor = (fn: () => Promise<unknown>, etter?: () => void) => {
    start(async () => {
      try {
        await fn();
        setFeil(null);
        etter?.();
        router.refresh();
      } catch (e) {
        setFeil(e instanceof Error ? e.message : "Tilgjengeligheten kunne ikke lagres.");
      }
    });
  };

  const lagre = () => {
    if (!skjema) return;
    if (skjema.type === "dato" && !skjema.dato) { setFeil("Velg dato for unntaket."); return; }
    const input = tilInput(skjema);
    kjor(() => (skjema.id ? updateSlot(skjema.id, input) : addSlot(input)), () => setSkjema(null));
  };

  const rad = (v: TilgVindu, etikett: string, i: number) => (
    <div key={v.id} className="a4-vindu" style={i === 0 ? { borderTop: "none" } : undefined}>
      <span className="a4-vindu__dag">{etikett}</span>
      <span className="a4-vindu__tid">
        <span style={{ color: v.aktiv ? "var(--text-primary)" : "var(--text-muted)" }}>{v.start}–{v.slutt}</span>
        <Meta>{vinduMeta(v)}</Meta>
      </span>
      <span className="a4-vindu__handling">
        <Bryter checked={v.aktiv} onChange={(paa) => kjor(() => settUkedagAktiv({ slotId: v.id, paa }))} label={v.aktiv ? "Ledig" : "Stengt"} />
        <IkonKnapp icon={Pencil} name="pencil" aria-label={`Endre ${etikett} ${v.start}–${v.slutt}`} onClick={() => { setFeil(null); setSkjema(fraVindu(v)); }} />
        <IkonKnapp icon={Trash2} name="trash-2" aria-label={`Slett ${etikett} ${v.start}–${v.slutt}`} onClick={() => setSlett(v)} />
      </span>
    </div>
  );

  return (
    <div className="a4-todel">
      <Kort>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
          <span className="kicker">Fast ukemønster</span>
          <Meta>{ukentlige.length} VINDUER</Meta>
        </div>
        {feil && !skjema && <p role="alert" className="a4-feil">{feil}</p>}
        {ukentlige.length === 0 ? (
          <TomTilstand icon={CalendarPlus} title="Ingen faste tider" text="Legg inn når du kan ta imot spillere. Da kan de booke." />
        ) : (
          DAGER.map((navn, dag) => {
            const vinduer = ukentlige.filter((v) => v.ukedag === dag);
            if (vinduer.length === 0) {
              return (
                <div key={navn} className="a4-vindu">
                  <span className="a4-vindu__dag">{navn}</span>
                  <span className="a4-vindu__tid"><span style={{ color: "var(--text-muted)" }}>—</span></span>
                  <span className="a4-vindu__handling">
                    <Knapp variant="ghost" size="sm" icon={Plus} iconName="plus" onClick={() => { setFeil(null); setSkjema(tomtSkjema("uke", dag)); }}>Legg til</Knapp>
                  </span>
                </div>
              );
            }
            return vinduer.map((v, i) => rad(v, i === 0 ? navn : "", dag === 0 && i === 0 ? 0 : 1));
          })
        )}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 12 }}>
          <Knapp icon={Plus} iconName="plus" onClick={() => { setFeil(null); setSkjema(tomtSkjema("uke")); }}>Nytt vindu</Knapp>
          <KnappLenke href="/admin/availability" variant="ghost">Månedsoversikt og Google-synk</KnappLenke>
        </div>
      </Kort>
      <Kort>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
          <span className="kicker">Unntak</span>
          <Meta>{kommendeUnntak.length ? `${kommendeUnntak.length} KOMMENDE` : "INGEN"}</Meta>
        </div>
        {unntak.length === 0 ? (
          <Meta>ET UNNTAK ER ET VINDU PÅ ÉN DATO — EKSTRA TID, ELLER STENGT (SLÅ AV)</Meta>
        ) : (
          unntak.map((v, i) => rad(v, datoTekst(v.dato!), i))
        )}
        <div style={{ paddingTop: 12 }}>
          <Knapp variant="secondary" size="sm" icon={CalendarPlus} iconName="calendar-plus" onClick={() => { setFeil(null); setSkjema(tomtSkjema("dato")); }}>Legg til unntak</Knapp>
        </div>
      </Kort>

      <Ark
        open={!!skjema}
        onClose={() => setSkjema(null)}
        kicker={skjema?.id ? "Endre vindu" : skjema?.type === "dato" ? "Nytt unntak" : "Nytt vindu"}
        title="Tilgjengelighet"
        footer={<>
          <Knapp fullWidth loading={pending} onClick={lagre}>Lagre</Knapp>
          <Knapp fullWidth variant="ghost" onClick={() => setSkjema(null)}>Avbryt</Knapp>
        </>}
      >
        {skjema && (
          <>
            <Segment label="Type" full value={skjema.type} options={[{ id: "uke", label: "Hver uke" }, { id: "dato", label: "Én dato" }]} onChange={(t) => setSkjema({ ...skjema, type: t })} />
            {skjema.type === "uke" ? (
              <Skjemafelt label="Ukedag"><Nedtrekk value={skjema.ukedag} onChange={(v) => setSkjema({ ...skjema, ukedag: v })} options={DAGER.map((d, i) => ({ value: String(i), label: d }))} /></Skjemafelt>
            ) : (
              <Skjemafelt label="Dato" required><Datofelt value={skjema.dato} onChange={(v) => setSkjema({ ...skjema, dato: v })} /></Skjemafelt>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
              <Skjemafelt label="Fra"><Nedtrekk value={skjema.start} onChange={(v) => setSkjema({ ...skjema, start: v })} options={tidsvalg(5, 23)} /></Skjemafelt>
              <Skjemafelt label="Til"><Nedtrekk value={skjema.slutt} onChange={(v) => setSkjema({ ...skjema, slutt: v })} options={tidsvalg(5, 23)} /></Skjemafelt>
            </div>
            <Skjemafelt label="Sted" hint="Du kan ikke være to steder samtidig."><Nedtrekk value={skjema.stedId} onChange={(v) => setSkjema({ ...skjema, stedId: v })} options={[{ value: "", label: "Alle steder" }, ...data.steder.map((s) => ({ value: s.id, label: s.navn }))]} /></Skjemafelt>
            {skjema.type === "uke" && (
              <>
                <Skjemafelt label="Repetisjon"><Nedtrekk value={skjema.repetisjon} onChange={(v) => setSkjema({ ...skjema, repetisjon: v })} options={[{ value: "1", label: "Hver uke" }, { value: "2", label: "Annenhver uke" }, { value: "3", label: "Hver 3. uke" }, { value: "4", label: "Hver 4. uke" }]} /></Skjemafelt>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))", gap: 12 }}>
                  <Skjemafelt label="Gjelder fra" hint="Tomt = fra nå"><Datofelt value={skjema.gyldigFra} onChange={(v) => setSkjema({ ...skjema, gyldigFra: v })} /></Skjemafelt>
                  <Skjemafelt label="Gjelder til" hint="Tomt = uten slutt"><Datofelt value={skjema.gyldigTil} onChange={(v) => setSkjema({ ...skjema, gyldigTil: v })} /></Skjemafelt>
                </div>
              </>
            )}
            <Bryter checked={skjema.aktiv} onChange={(v) => setSkjema({ ...skjema, aktiv: v })} label={skjema.aktiv ? "Ledig for booking" : "Stengt (ingen booking)"} />
            {feil && <p role="alert" className="a4-feil">{feil}</p>}
          </>
        )}
      </Ark>

      <Dialogboks
        open={!!slett}
        onClose={() => setSlett(null)}
        title="Slette vinduet?"
        footer={<>
          <Knapp variant="ghost" onClick={() => setSlett(null)}>Avbryt</Knapp>
          <Knapp variant="signal" loading={pending} loadingText="Sletter …" onClick={() => { const v = slett; if (v) kjor(() => deleteSlot(v.id), () => setSlett(null)); }}>Slett</Knapp>
        </>}
      >
        {slett && <p style={{ margin: 0 }}>{slett.dato ? datoTekst(slett.dato) : DAGER[slett.ukedag ?? 0]} {slett.start}–{slett.slutt}. Bookinger som allerede er lagt står.</p>}
      </Dialogboks>
    </div>
  );
}
