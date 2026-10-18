"use client";

/**
 * AG-05 fane «Tilgjengelighet» (bookingplanen steg 3): coachen oppretter, endrer,
 * slår av og sletter vinduer, setter en hel uke på én gang og legger inn fridager,
 * uten å forlate AgencyOS. Google-synk og årsoversikten ligger fortsatt på
 * /admin/availability. Buffer per coach er ikke med (krever nytt felt i basen).
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Knapp, KnappLenke, Pille, Seksjon, Tom, Varsel } from "@/components/admin/agencyos-ny/ny";
import { leggTilFridag, lagreVindu, settHelUke, slettFridag, slettVindu, type VinduInput } from "@/app/admin/kalender/tilgjengelighet-actions";
import type { TilgData, TilgVindu } from "@/app/admin/kalender/tilg-data";
import "@/styles/agencyos-ny-kalender.css";

const DAGER = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];
const KORT = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const REP: Record<number, string> = { 2: "Annenhver uke", 3: "Hver 3. uke", 4: "Hver 4. uke" };

function datoTekst(iso: string) {
  return new Intl.DateTimeFormat("nb-NO", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));
}

function datoKort(iso: string) {
  return new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));
}

type Skjema = {
  id?: string;
  type: "uke" | "dato";
  weekday: number;
  date: string;
  startTime: string;
  endTime: string;
  locationId: string;
  validFrom: string;
  validTo: string;
  recurrenceInterval: number;
  active: boolean;
};

const TOMT: Skjema = { type: "uke", weekday: 0, date: "", startTime: "15:00", endTime: "19:00", locationId: "", validFrom: "", validTo: "", recurrenceInterval: 1, active: true };

function fraVindu(v: TilgVindu): Skjema {
  return {
    id: v.id,
    type: v.weekday === null ? "dato" : "uke",
    weekday: v.weekday ?? 0,
    date: v.date ?? "",
    startTime: v.startTime,
    endTime: v.endTime,
    locationId: v.locationId ?? "",
    validFrom: v.validFrom ?? "",
    validTo: v.validTo ?? "",
    recurrenceInterval: v.recurrenceInterval ?? 1,
    active: v.active,
  };
}

function tilInput(s: Skjema): VinduInput {
  const uke = s.type === "uke";
  return {
    id: s.id,
    weekday: uke ? s.weekday : null,
    date: uke ? null : s.date || null,
    startTime: s.startTime,
    endTime: s.endTime,
    locationId: s.locationId || null,
    validFrom: uke ? s.validFrom || null : null,
    validTo: uke ? s.validTo || null : null,
    recurrenceInterval: uke && s.recurrenceInterval > 1 ? s.recurrenceInterval : null,
    active: s.active,
  };
}

function vinduDetaljer(v: TilgVindu): string {
  const deler = [`${v.startTime}–${v.endTime}`];
  if (v.stedNavn) deler.push(v.stedNavn);
  if (v.recurrenceInterval && v.recurrenceInterval > 1) deler.push(REP[v.recurrenceInterval] ?? `Hver ${v.recurrenceInterval}. uke`);
  if (v.validFrom || v.validTo) deler.push(`${v.validFrom ? datoTekst(v.validFrom) : "—"} til ${v.validTo ? datoTekst(v.validTo) : "—"}`);
  return deler.join(" · ");
}

export function AG05Tilg({ data }: { data: TilgData }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [skjema, setSkjema] = useState<Skjema | null>(null);
  const [uke, setUke] = useState({ dager: [0, 1, 2, 3, 4] as number[], startTime: "15:00", endTime: "19:00", locationId: "" });
  const [fridag, setFridag] = useState({ dato: "", grunn: "" });

  const kjor = (fn: () => Promise<{ ok: true; opprettet?: number } | { ok: false; feil: string }>, melding: (r: { opprettet?: number }) => string, etter?: () => void) => {
    start(async () => {
      const r = await fn();
      if (!r.ok) { setFeil(r.feil); setOk(null); return; }
      setFeil(null);
      setOk(melding(r));
      etter?.();
      router.refresh();
    });
  };

  const settFelt = <K extends keyof Skjema>(k: K, v: Skjema[K]) => setSkjema((s) => (s ? { ...s, [k]: v } : s));
  const stedValg = <><option value="">Uten sted</option>{data.steder.map((s) => <option key={s.id} value={s.id}>{s.navn}</option>)}</>;

  const ukentlige = data.vinduer.filter((v) => v.weekday !== null);
  const datoer = data.vinduer.filter((v) => v.weekday === null);

  const vinduRad = (v: TilgVindu, etikett: string) => (
    <div key={v.id}>
      <span className="mono" style={{ minWidth: 44 }}>{etikett}</span>
      <span style={{ minWidth: 0 }}><b>{vinduDetaljer(v)}</b>{!v.active && <Pille>Stengt</Pille>}</span>
      <span className="knapper" style={{ flexWrap: "wrap" }}>
        <Knapp variant="spok" disabled={pending} onClick={() => { setSkjema(fraVindu(v)); setOk(null); }}>Endre</Knapp>
        <Knapp variant="spok" disabled={pending} onClick={() => kjor(() => slettVindu(v.id), () => "Vinduet er slettet.")}>Slett</Knapp>
      </span>
    </div>
  );

  return (
    <div style={{ display: "grid", gap: "var(--r5, 24px)", minWidth: 0 }}>
      {feil && <Varsel tone="advarsel" tittel="Ikke lagret">{feil}</Varsel>}
      {ok && <Varsel tone="ok">{ok}</Varsel>}

      <Seksjon tittel="Vinduer" hoyre={<Knapp variant="sek" onClick={() => { setSkjema({ ...TOMT }); setOk(null); }}>Nytt vindu</Knapp>}>
        {skjema && (
          <form className="kort" style={{ display: "grid", gap: 12 }} onSubmit={(e) => { e.preventDefault(); kjor(() => lagreVindu(tilInput(skjema)), () => (skjema.id ? "Vinduet er endret." : "Vinduet er lagt til."), () => setSkjema(null)); }}>
            <b className="undertittel">{skjema.id ? "Endre vindu" : "Nytt vindu"}</b>
            <div className="to-felt">
              <label className="felt"><span className="etikett">Gjelder</span>
                <select value={skjema.type} onChange={(e) => settFelt("type", e.target.value as Skjema["type"])}>
                  <option value="uke">Hver uke</option><option value="dato">Én dato</option>
                </select></label>
              {skjema.type === "uke"
                ? <label className="felt"><span className="etikett">Ukedag</span>
                    <select value={skjema.weekday} onChange={(e) => settFelt("weekday", Number(e.target.value))}>{DAGER.map((d, i) => <option key={d} value={i}>{d}</option>)}</select></label>
                : <label className="felt"><span className="etikett">Dato</span><input type="date" required value={skjema.date} onChange={(e) => settFelt("date", e.target.value)} /></label>}
            </div>
            <div className="to-felt">
              <label className="felt"><span className="etikett">Fra</span><input type="time" required value={skjema.startTime} onChange={(e) => settFelt("startTime", e.target.value)} /></label>
              <label className="felt"><span className="etikett">Til</span><input type="time" required value={skjema.endTime} onChange={(e) => settFelt("endTime", e.target.value)} /></label>
            </div>
            <label className="felt"><span className="etikett">Sted</span><select value={skjema.locationId} onChange={(e) => settFelt("locationId", e.target.value)}>{stedValg}</select></label>
            {skjema.type === "uke" && <>
              <label className="felt"><span className="etikett">Gjentas</span>
                <select value={skjema.recurrenceInterval} onChange={(e) => settFelt("recurrenceInterval", Number(e.target.value))}>
                  <option value={1}>Hver uke</option>{[2, 3, 4].map((n) => <option key={n} value={n}>{REP[n]}</option>)}
                </select></label>
              <div className="to-felt">
                <label className="felt"><span className="etikett">Gjelder fra (valgfritt)</span><input type="date" value={skjema.validFrom} onChange={(e) => settFelt("validFrom", e.target.value)} /></label>
                <label className="felt"><span className="etikett">Gjelder til (valgfritt)</span><input type="date" value={skjema.validTo} onChange={(e) => settFelt("validTo", e.target.value)} /></label>
              </div>
            </>}
            <label className="felt avkryss"><input type="checkbox" checked={skjema.active} onChange={(e) => settFelt("active", e.target.checked)} /><span className="etikett">Åpent for booking</span></label>
            <div className="knapper">
              <Knapp type="submit" disabled={pending}>{pending ? "Lagrer …" : "Lagre vinduet"}</Knapp>
              <Knapp variant="spok" onClick={() => setSkjema(null)}>Avbryt</Knapp>
            </div>
          </form>
        )}
        {data.vinduer.length === 0
          ? <Tom tittel="Ingen vinduer ennå" tekst="Spillere og gjester kan bare booke innenfor vinduene dine. Sett en hel uke under, eller legg til ett vindu." />
          : <>
              {ukentlige.length > 0 && <div className="liste">{ukentlige.map((v) => vinduRad(v, KORT[v.weekday ?? 0]))}</div>}
              {datoer.length > 0 && <>
                <p className="kilde">Enkeltdatoer</p>
                <div className="liste">{datoer.map((v) => vinduRad(v, datoKort(v.date ?? "")))}</div>
              </>}
            </>}
      </Seksjon>

      <Seksjon tittel="Sett hel uke" kilde="Samme tid hver valgt dag">
        <form className="kort" style={{ display: "grid", gap: 12 }} onSubmit={(e) => {
          e.preventDefault();
          kjor(() => settHelUke({ ...uke, locationId: uke.locationId || null }), (r) => (r.opprettet ? `${r.opprettet} ${r.opprettet === 1 ? "vindu" : "vinduer"} lagt til.` : "Uka hadde disse vinduene fra før."));
        }}>
          <fieldset style={{ border: 0, padding: 0, margin: 0, display: "flex", flexWrap: "wrap", gap: 8 }}>
            <legend className="etikett" style={{ marginBottom: 6 }}>Dager</legend>
            {KORT.map((d, i) => (
              <label key={d} className="felt avkryss">
                <input type="checkbox" checked={uke.dager.includes(i)} onChange={(e) => setUke((u) => ({ ...u, dager: e.target.checked ? [...u.dager, i] : u.dager.filter((x) => x !== i) }))} />
                <span className="etikett">{d}</span>
              </label>
            ))}
          </fieldset>
          <div className="to-felt">
            <label className="felt"><span className="etikett">Fra</span><input type="time" required value={uke.startTime} onChange={(e) => setUke((u) => ({ ...u, startTime: e.target.value }))} /></label>
            <label className="felt"><span className="etikett">Til</span><input type="time" required value={uke.endTime} onChange={(e) => setUke((u) => ({ ...u, endTime: e.target.value }))} /></label>
          </div>
          <label className="felt"><span className="etikett">Sted</span><select value={uke.locationId} onChange={(e) => setUke((u) => ({ ...u, locationId: e.target.value }))}>{stedValg}</select></label>
          <div className="knapper"><Knapp type="submit" disabled={pending || uke.dager.length === 0}>{pending ? "Lagrer …" : "Lagre uka"}</Knapp></div>
        </form>
      </Seksjon>

      <Seksjon tittel="Fridager" kilde="Tar bort all ledig tid den dagen">
        <form className="kort" style={{ display: "grid", gap: 12 }} onSubmit={(e) => {
          e.preventDefault();
          kjor(() => leggTilFridag({ dato: fridag.dato, grunn: fridag.grunn.trim() || undefined }), () => "Fridagen er lagt inn.", () => setFridag({ dato: "", grunn: "" }));
        }}>
          <div className="to-felt">
            <label className="felt"><span className="etikett">Dato</span><input type="date" required value={fridag.dato} onChange={(e) => setFridag((f) => ({ ...f, dato: e.target.value }))} /></label>
            <label className="felt"><span className="etikett">Grunn (valgfritt)</span><input value={fridag.grunn} maxLength={120} onChange={(e) => setFridag((f) => ({ ...f, grunn: e.target.value }))} placeholder="Ferie" /></label>
          </div>
          <div className="knapper"><Knapp type="submit" disabled={pending || !fridag.dato}>{pending ? "Lagrer …" : "Legg inn fridag"}</Knapp></div>
        </form>
        {data.fridager.length === 0
          ? <p className="kilde">Ingen kommende fridager.</p>
          : <div className="liste">{data.fridager.map((f) => (
              <div key={f.id}>
                <span className="mono">{datoTekst(f.dato)}</span>
                <span style={{ minWidth: 0 }}><b>{f.grunn ?? "Fridag"}</b></span>
                <Knapp variant="spok" disabled={pending} onClick={() => kjor(() => slettFridag(f.id), () => "Fridagen er fjernet.")}>Fjern</Knapp>
              </div>
            ))}</div>}
      </Seksjon>

      <div className="knapper"><KnappLenke variant="spok" href="/admin/availability">Google-synk og årsoversikt</KnappLenke></div>
    </div>
  );
}
