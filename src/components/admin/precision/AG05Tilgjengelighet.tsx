"use client";

/**
 * AG-05 Tilgjengelighet, egen side (/admin/availability) i Precision Athletics.
 * Fane «Tilgjengelighet» i Kalender (AG05Tilg) viser bare det faste ukemønsteret;
 * her ligger resten: nye vinduer, flere steder, dato-unntak, dra-i-rutenett,
 * årsplan og Google-kalender. Samme server actions som før (addSlot, updateSlot,
 * deleteSlot), samme validering og samme tekster i feilmeldinger.
 *
 * Tegning: fane «tilg» i AG-05 (ui_kits/agencyos/screens/AG-05.jsx). Månedsvisning,
 * uke-rutenett, årsplan og vindusskjema er ikke tegnet separat; de er bygget av
 * Precision-grunnkomponentene (Ark, Skjemafelt, Nedtrekk, Bryter, Kort) etter
 * mønsteret i naboskjermene.
 */
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Ikon, Knapp, KnappLenke, Meta, StatusPille, TomTilstand } from "@/components/precision/pa";
import { SegmentertValg } from "@/components/precision/pa-a2";
import { Ark, Bryter, Dialogboks, FanerLenker, Kort, Nedtrekk, Skjemafelt, Stabel } from "@/components/precision/pa-a4";
import { addSlot, deleteSlot, updateSlot } from "@/app/admin/(legacy)/availability/actions";
import "@/styles/precision-a4.css";
import "@/styles/precision-a05.css";

export type Visning = "maaned" | "uke" | "aar";
export type Sted = { id: string; name: string };

export type VinduSkjema = {
  id: string;
  weekday: number | null;
  date: string | null;
  startTime: string;
  endTime: string;
  active: boolean;
  locationId: string | null;
  validFrom: string | null;
  validTo: string | null;
  recurrenceInterval: number | null;
};

export type VinduRad = { id: string; tidLabel: string; metaLabel: string; slukket: boolean; skjema: VinduSkjema };
export type UkeVindu = { id: string; weekday: number; startTime: string; endTime: string; locationName: string | null };
export type AarVindu = { id: string; locationName: string | null; label: string; fraAndel: number; tilAndel: number };
export type MndCelle = { dag: number | null; range: string | null; erIdag: boolean };

export type TilgjengelighetData = {
  visning: Visning;
  aar: number;
  mndNavn: string;
  forrigeHref: string;
  nesteHref: string;
  celler: MndCelle[];
  steder: Sted[];
  ukeVinduer: UkeVindu[];
  aarsVinduer: AarVindu[];
  aarForrigeHref: string;
  aarNesteHref: string;
  faner: ReadonlyArray<{ href: string; navn: string; aktiv: boolean }>;
  vinduer: VinduRad[];
};

const DAGER = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];
const DAGER_KORT = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const MND_KORT = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const DAY_START = 6;
const DAY_END = 22;
const RADER = (DAY_END - DAY_START) * 2;

const tidFraRad = (rad: number): string => {
  const total = DAY_START * 60 + rad * 30;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

/* ---------------- Skjema: nytt eller endret tidsvindu ---------------- */

export function Vinduskjema({ steder, initial, defaultUkedag, open, onClose }: {
  steder: Sted[]; initial?: VinduSkjema; defaultUkedag?: number; open: boolean; onClose: () => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const [modus, setModus] = useState<"weekly" | "date">(initial?.date ? "date" : "weekly");
  const [ukedag, setUkedag] = useState(initial?.weekday ?? defaultUkedag ?? 0);
  const [dato, setDato] = useState(initial?.date ?? "");
  const [startTid, setStartTid] = useState(initial?.startTime ?? "10:00");
  const [sluttTid, setSluttTid] = useState(initial?.endTime ?? "18:00");
  const [aktiv, setAktiv] = useState(initial?.active ?? true);
  const [stedId, setStedId] = useState(initial?.locationId ?? steder[0]?.id ?? "");
  const [visPeriode, setVisPeriode] = useState(Boolean(initial?.validFrom || initial?.validTo));
  const [fra, setFra] = useState(initial?.validFrom ?? "");
  const [til, setTil] = useState(initial?.validTo ?? "");
  const [rep, setRep] = useState(initial?.recurrenceInterval ?? 1);
  const [bekreftSlett, setBekreftSlett] = useState(false);

  const lagre = () => {
    if (startTid >= sluttTid) return setFeil("Slutt-tid må være etter start-tid.");
    if (modus === "date" && !dato) return setFeil("Velg en dato.");
    if (!stedId) return setFeil("Velg et anlegg.");
    setFeil(null);
    const payload = {
      weekday: modus === "weekly" ? ukedag : null,
      date: modus === "date" ? dato : null,
      startTime: startTid,
      endTime: sluttTid,
      active: aktiv,
      locationId: stedId,
      validFrom: visPeriode && fra ? fra : null,
      validTo: visPeriode && til ? til : null,
      recurrenceInterval: modus === "weekly" ? rep : null,
    };
    start(async () => {
      try {
        if (initial) await updateSlot(initial.id, payload);
        else await addSlot(payload);
        onClose();
        router.refresh();
      } catch (e) {
        setFeil(e instanceof Error ? e.message : "Kunne ikke lagre.");
      }
    });
  };

  const slett = () => {
    if (!initial) return;
    start(async () => {
      try {
        await deleteSlot(initial.id);
        setBekreftSlett(false);
        onClose();
        router.refresh();
      } catch {
        setBekreftSlett(false);
        setFeil("Kunne ikke slette.");
      }
    });
  };

  return (
    <>
      <Ark
        open={open}
        onClose={onClose}
        kicker="Tilgjengelighet"
        title={initial ? "Endre tidsvindu" : "Nytt tidsvindu"}
        footer={
          <>
            <Knapp fullWidth loading={pending} onClick={lagre}>Lagre</Knapp>
            {initial && <Knapp fullWidth variant="secondary" disabled={pending} onClick={() => setBekreftSlett(true)}>Slett</Knapp>}
            <Knapp fullWidth variant="ghost" disabled={pending} onClick={onClose}>Avbryt</Knapp>
          </>
        }
      >
        <Stabel gap={16}>
          <Skjemafelt label="Anlegg">
            <Nedtrekk value={stedId} onChange={setStedId} options={steder.map((s) => ({ value: s.id, label: s.name }))} />
          </Skjemafelt>
          <SegmentertValg
            label="Type tidsvindu"
            value={modus}
            onChange={setModus}
            options={[{ id: "weekly", label: "Ukentlig" }, { id: "date", label: "Spesifikk dato" }]}
          />
          {modus === "weekly" ? (
            <>
              <Skjemafelt label="Ukedag">
                <Nedtrekk value={String(ukedag)} onChange={(v) => setUkedag(Number(v))} options={DAGER.map((d, i) => ({ value: String(i), label: d }))} />
              </Skjemafelt>
              <Skjemafelt label="Repetisjon">
                <Nedtrekk
                  value={String(rep)}
                  onChange={(v) => setRep(Number(v))}
                  options={[
                    { value: "1", label: "Hver uke" },
                    { value: "2", label: "Annenhver uke" },
                    { value: "3", label: "Hver tredje uke" },
                    { value: "4", label: "Hver fjerde uke" },
                  ]}
                />
              </Skjemafelt>
            </>
          ) : (
            <Skjemafelt label="Dato">
              <input className="a4-input" type="date" value={dato} onChange={(e) => setDato(e.target.value)} />
            </Skjemafelt>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
            <Skjemafelt label="Start">
              <input className="a4-input a4-input--mono" type="time" value={startTid} onChange={(e) => setStartTid(e.target.value)} />
            </Skjemafelt>
            <Skjemafelt label="Slutt">
              <input className="a4-input a4-input--mono" type="time" value={sluttTid} onChange={(e) => setSluttTid(e.target.value)} />
            </Skjemafelt>
          </div>
          {modus === "weekly" && (
            <>
              <Bryter checked={visPeriode} onChange={setVisPeriode} label="Begrens til periode" />
              {visPeriode && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                  <Skjemafelt label="Fra">
                    <input className="a4-input" type="date" value={fra} onChange={(e) => setFra(e.target.value)} />
                  </Skjemafelt>
                  <Skjemafelt label="Til">
                    <input className="a4-input" type="date" value={til} onChange={(e) => setTil(e.target.value)} />
                  </Skjemafelt>
                </div>
              )}
            </>
          )}
          <Bryter checked={aktiv} onChange={setAktiv} label={aktiv ? "Aktiv (bookbar)" : "Av (ikke bookbar)"} />
          {feil && <p role="alert" className="a4-feil">{feil}</p>}
        </Stabel>
      </Ark>
      <Dialogboks
        open={bekreftSlett}
        onClose={() => setBekreftSlett(false)}
        title="Slett tidsvinduet?"
        footer={
          <>
            <Knapp variant="ghost" onClick={() => setBekreftSlett(false)}>Avbryt</Knapp>
            <Knapp variant="signal" loading={pending} loadingText="Sletter …" onClick={slett}>Slett</Knapp>
          </>
        }
      >
        Spillere kan ikke lenger booke i dette vinduet. Eksisterende bookinger påvirkes ikke.
      </Dialogboks>
    </>
  );
}

/* ---------------- Uke: dra i rutenettet for å lage et vindu ---------------- */

function Ukerutenett({ steder, vinduer }: { steder: Sted[]; vinduer: UkeVindu[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const dragDag = useRef<number | null>(null);
  const [drag, setDrag] = useState<{ dag: number; a: number; b: number } | null>(null);
  const [bekreft, setBekreft] = useState<{ dag: number; start: string; slutt: string } | null>(null);
  const [stedId, setStedId] = useState(steder[0]?.id ?? "");
  const [feil, setFeil] = useState<string | null>(null);

  const erApen = (dag: number, rad: number) => {
    const t = tidFraRad(rad);
    return vinduer.some((w) => w.weekday === dag && w.startTime <= t && t < w.endTime);
  };

  const startDrag = (dag: number, rad: number, e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    dragDag.current = dag;
    setDrag({ dag, a: rad, b: rad });
  };
  const flyttDrag = (dag: number, rad: number) => {
    if (dragDag.current === dag) setDrag((d) => (d ? { ...d, b: rad } : null));
  };
  const sluttDrag = () => {
    if (!drag) return;
    const lav = Math.min(drag.a, drag.b);
    const hoy = Math.max(drag.a, drag.b);
    dragDag.current = null;
    setDrag(null);
    setFeil(null);
    const overlapp = vinduer.some((w) => w.weekday === drag.dag && !(tidFraRad(hoy + 1) <= w.startTime || tidFraRad(lav) >= w.endTime));
    if (overlapp) return setFeil("Overlapper med eksisterende vindu. Juster først.");
    setBekreft({ dag: drag.dag, start: tidFraRad(lav), slutt: tidFraRad(hoy + 1) });
  };
  // Dra avsluttes på dokumentnivå: slipp utenfor rutenettet og avbrutt berøring
  // (pointercancel) skal aldri la markeringen stå igjen. Berøring sender ikke
  // pointerenter til cellene under fingeren, så posisjonen slås opp her.
  const sluttRef = useRef(sluttDrag);
  useEffect(() => {
    sluttRef.current = sluttDrag;
  });
  const draTilstand = drag !== null;
  useEffect(() => {
    if (!draTilstand) return;
    const opp = () => sluttRef.current();
    const avbryt = () => {
      dragDag.current = null;
      setDrag(null);
    };
    const flytt = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      const celle = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>("[data-dag][data-rad]");
      if (celle) setDrag((d) => (d && d.dag === Number(celle.dataset.dag) ? { ...d, b: Number(celle.dataset.rad) } : d));
    };
    const hindreRulling = (e: TouchEvent) => { if (e.cancelable) e.preventDefault(); };
    document.addEventListener("pointerup", opp);
    document.addEventListener("pointercancel", avbryt);
    document.addEventListener("pointermove", flytt);
    document.addEventListener("touchmove", hindreRulling, { passive: false });
    return () => {
      document.removeEventListener("pointerup", opp);
      document.removeEventListener("pointercancel", avbryt);
      document.removeEventListener("pointermove", flytt);
      document.removeEventListener("touchmove", hindreRulling);
    };
  }, [draTilstand]);

  const klikk = (dag: number, rad: number) => {
    if (drag) return;
    setBekreft({ dag, start: tidFraRad(rad), slutt: tidFraRad(rad + 1) });
  };

  const lagre = () => {
    if (!bekreft || !stedId) return setFeil("Velg et anlegg.");
    start(async () => {
      try {
        await addSlot({ weekday: bekreft.dag, startTime: bekreft.start, endTime: bekreft.slutt, active: true, locationId: stedId });
        setBekreft(null);
        router.refresh();
      } catch (e) {
        setFeil(e instanceof Error ? e.message : "Kunne ikke lagre.");
      }
    });
  };

  const forhandsvis = drag ? `${tidFraRad(Math.min(drag.a, drag.b))}–${tidFraRad(Math.max(drag.a, drag.b) + 1)}` : null;

  return (
    <Stabel gap={12}>
      <Meta>DRA I RUTENETTET FOR Å LAGE ET VINDU · TRYKK PÅ EN RUTE FOR 30 MINUTTER{forhandsvis ? ` · ${forhandsvis}` : ""}</Meta>
      {feil && !bekreft && <p role="alert" className="a4-feil">{feil}</p>}
      <div className="t5-uke" role="grid" aria-label="Ukens tilgjengelighet" data-drar={drag ? "" : undefined}>
        <div style={{ borderBottom: "1px solid var(--border-hairline)", background: "var(--surface-flat)" }} />
        {DAGER_KORT.map((d) => <div key={d} className="t5-uke__hode">{d}</div>)}
        {Array.from({ length: RADER }).map((_, rad) => (
          <Rad key={rad}>
            <div className="t5-uke__time">{rad % 2 === 0 ? tidFraRad(rad) : ""}</div>
            {DAGER_KORT.map((_, dag) => {
              const iDrag = drag?.dag === dag && rad >= Math.min(drag.a, drag.b) && rad <= Math.max(drag.a, drag.b);
              return (
                <button
                  key={dag}
                  type="button"
                  className="t5-celle"
                  data-halv={rad % 2 === 1 ? "" : undefined}
                  data-apen={erApen(dag, rad) ? "" : undefined}
                  data-drag={iDrag ? "" : undefined}
                  data-dag={dag}
                  data-rad={rad}
                  aria-label={`${DAGER[dag]} ${tidFraRad(rad)}`}
                  onPointerDown={(e) => startDrag(dag, rad, e)}
                  onPointerEnter={() => flyttDrag(dag, rad)}
                  onClick={() => klikk(dag, rad)}
                />
              );
            })}
          </Rad>
        ))}
      </div>
      {vinduer.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {vinduer.map((w) => (
            <StatusPille key={w.id} tone="ok">{DAGER_KORT[w.weekday]} {w.startTime}–{w.endTime} · {w.locationName ?? "Alle steder"}</StatusPille>
          ))}
        </div>
      )}
      <Ark
        open={bekreft !== null}
        onClose={() => setBekreft(null)}
        kicker="Nytt tidsvindu"
        title={bekreft ? `Tilgjengelig ${DAGER[bekreft.dag].toLowerCase()} ${bekreft.start}–${bekreft.slutt}?` : ""}
        footer={
          <>
            <Knapp fullWidth loading={pending} onClick={lagre}>Godkjenn</Knapp>
            <Knapp fullWidth variant="ghost" disabled={pending} onClick={() => setBekreft(null)}>Avbryt</Knapp>
          </>
        }
      >
        <Stabel gap={12}>
          <Skjemafelt label="Anlegg">
            <Nedtrekk value={stedId} onChange={setStedId} options={steder.map((s) => ({ value: s.id, label: s.name }))} />
          </Skjemafelt>
          {feil && <p role="alert" className="a4-feil">{feil}</p>}
        </Stabel>
      </Ark>
    </Stabel>
  );
}

function Rad({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

/* ---------------- År: vinduer over tolv måneder ---------------- */

function Aarsplan({ aar, vinduer }: { aar: number; vinduer: AarVindu[] }) {
  const grupper = new Map<string, AarVindu[]>();
  for (const w of vinduer) {
    const navn = w.locationName ?? "Alle steder";
    grupper.set(navn, [...(grupper.get(navn) ?? []), w]);
  }
  return (
    <Kort gap={16}>
      <div className="t5-gantt">
        <span className="kicker">{aar}</span>
        <div className="t5-gantt__mndhode">{MND_KORT.map((m, i) => <span key={i}>{m}</span>)}</div>
      </div>
      {vinduer.length === 0 ? (
        <Meta>INGEN UKENTLIGE TIDSVINDU · LEGG TIL VINDU MED PERIODE FOR Å SE DEM FORDELT OVER ÅRET</Meta>
      ) : (
        Array.from(grupper.entries()).map(([navn, liste]) => (
          <Stabel key={navn} gap={6}>
            <span style={{ font: "600 14px/1.3 var(--font-sans)" }}>{navn}</span>
            {liste.map((w) => (
              <div key={w.id} className="t5-gantt">
                <span style={{ font: "var(--type-meta)", color: "var(--text-secondary)", minWidth: 0, overflowWrap: "anywhere" }}>{w.label}</span>
                <div className="t5-gantt__spor">
                  <div className="t5-gantt__mnd">{MND_KORT.map((_, i) => <span key={i} />)}</div>
                  <div className="t5-gantt__stolpe" title={w.label} style={{ left: `${w.fraAndel * 100}%`, width: `${Math.max(0.02, w.tilAndel - w.fraAndel) * 100}%` }} />
                </div>
              </div>
            ))}
          </Stabel>
        ))
      )}
      <Meta>VINDU UTEN SATT PERIODE GJELDER HELE ÅRET · SETT «BEGRENS TIL PERIODE» I ET VINDU FOR Å AVGRENSE DET TIL EN SESONG</Meta>
    </Kort>
  );
}

/* ---------------- Måned ---------------- */

function Maaned({ data }: { data: TilgjengelighetData }) {
  return (
    <Kort gap={12}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <span style={{ font: "600 15px/1.2 var(--font-sans)" }}>{data.mndNavn}</span>
        <div style={{ display: "flex", gap: 4 }}>
          <Link href={data.forrigeHref} className="pa-iconbtn" aria-label="Forrige måned"><Ikon icon={ChevronLeft} size={20} name="chevron-left" /></Link>
          <Link href={data.nesteHref} className="pa-iconbtn" aria-label="Neste måned"><Ikon icon={ChevronRight} size={20} name="chevron-right" /></Link>
        </div>
      </div>
      <div className="t5-ukedager">{DAGER_KORT.map((d) => <span key={d}>{d.toUpperCase()}</span>)}</div>
      <div className="a4-month">
        {data.celler.map((c, i) =>
          c.dag == null ? (
            <span key={`t-${i}`} className="a4-month__cell" data-utenfor="" />
          ) : (
            <div key={c.dag} className="a4-month__cell t5-dag" style={{ cursor: "default" }} data-apen={c.range ? "" : undefined} data-idag={c.erIdag ? "" : undefined}>
              <span className="a4-month__num">{c.dag}</span>
              {c.range ? (
                <>
                  <span className="t5-dag__tid">{c.range}</span>
                  <span className="t5-dag__prikk" aria-hidden />
                </>
              ) : (
                <span className="a4-meta">—</span>
              )}
            </div>
          ),
        )}
      </div>
      <div className="a4-legend">
        <span className="a4-legend__swatch"><span className="a4-legend__box" style={{ background: "var(--ok-tint)", border: "1px solid var(--border-hairline)" }} /><Meta>ÅPEN FOR BOOKING</Meta></span>
        <span className="a4-legend__swatch"><span className="a4-legend__box" style={{ border: "1px solid var(--border-hairline)" }} /><Meta>INGEN TID SATT</Meta></span>
      </div>
    </Kort>
  );
}

/* ---------------- Hele siden ---------------- */

export function AG05Tilgjengelighet({ data }: { data: TilgjengelighetData }) {
  const [nytt, setNytt] = useState(false);
  const [endre, setEndre] = useState<VinduRad | null>(null);
  const antall = data.vinduer.length;
  return (
    <Stabel gap={16}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <Knapp icon={Plus} iconName="plus" onClick={() => setNytt(true)}>Nytt tidsvindu</Knapp>
        <KnappLenke href="/admin/kalender?fane=tilg" variant="ghost">Til kalenderen</KnappLenke>
        <StatusPille tone={antall > 0 ? "ok" : "warn"}>{antall === 0 ? "Ingen vinduer" : antall === 1 ? "1 vindu" : `${antall} vinduer`}</StatusPille>
      </div>

      {antall === 0 && data.visning === "maaned" && (
        <TomTilstand
          icon={CalendarClock}
          title="Ingen tidsvinduer ennå"
          text="Opprett det første vinduet. Da kan spillere booke deg på de dagene."
          actions={<Knapp icon={Plus} iconName="plus" onClick={() => setNytt(true)}>Nytt tidsvindu</Knapp>}
        />
      )}

      <FanerLenker faner={data.faner} />

      {data.visning === "uke" ? (
        <Ukerutenett steder={data.steder} vinduer={data.ukeVinduer} />
      ) : data.visning === "aar" ? (
        <Stabel gap={12}>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
            <Link href={data.aarForrigeHref} className="pa-iconbtn" aria-label="Forrige år"><Ikon icon={ChevronLeft} size={20} name="chevron-left" /></Link>
            <Link href={data.aarNesteHref} className="pa-iconbtn" aria-label="Neste år"><Ikon icon={ChevronRight} size={20} name="chevron-right" /></Link>
          </div>
          <Aarsplan aar={data.aar} vinduer={data.aarsVinduer} />
        </Stabel>
      ) : (
        <Maaned data={data} />
      )}

      <Kort gap={4}>
        <span className="kicker">Dine tidsvinduer</span>
        {antall === 0 ? (
          <Meta>INGEN TIDSVINDU SATT ENNÅ · VELG «NYTT TIDSVINDU» FOR Å LEGGE TIL</Meta>
        ) : (
          data.vinduer.map((v) => (
            <div key={v.id} className="t5-rad" style={{ opacity: v.slukket ? 0.6 : 1 }}>
              <span style={{ font: "var(--type-num-s)", flex: "0 0 auto" }}>{v.tidLabel}</span>
              <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", flex: "1 1 160px", minWidth: 0, overflowWrap: "anywhere" }}>{v.metaLabel}</span>
              <Knapp variant="ghost" size="sm" onClick={() => setEndre(v)}>Endre</Knapp>
            </div>
          ))
        )}
      </Kort>

      {nytt && <Vinduskjema key="nytt" steder={data.steder} open onClose={() => setNytt(false)} />}
      {endre && <Vinduskjema key={endre.id} steder={data.steder} initial={endre.skjema} open onClose={() => setEndre(null)} />}
    </Stabel>
  );
}
