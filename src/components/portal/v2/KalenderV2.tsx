"use client";

/**
 * PlayerHQ Kalender — v2 (retning C «Presis»). Komponert 1:1 fra
 * ui_kits/v2/phq-kalender.jsx → funksjon Kalender + visningene Dag/Uke/Maaned/Aar,
 * men med EKTE data fra hentKalenderData (../(v2preview)/v2-kalender/data.ts).
 * Kun v2-komponenter fra "@/components/v2" + inline layout-divs på T.*-tokens
 * (samme mønster som HjemV2). Ingen rå hex. Der data mangler: ærlig tom-tilstand.
 *
 * V2Shell (montert i (v2preview)/v2-kalender/page.tsx) eier chrome-en — denne
 * komponenten rendrer bare den indre innholds-stacken.
 */

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  T,
  Caps,
  Tittel,
  CTAPill,
  PillVelger,
  Kort,
  Rad,
  AkseChip,
  StatusPill,
  KpiFlis,
  TomTilstand,
  Icon,
  Periodeplan,
} from "@/components/v2";
import type { KalenderData } from "@/app/portal/kalender/data";

/** true på klient etter mount når viewport < 768px (styrer kun layout-tetthet). */
function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

const LIME_KANT = `color-mix(in srgb,${T.lime} 25%,transparent)`;

// ── Periode-navigasjon (forrige/neste/i dag) — deles av alle fire visninger ──
function parseVisningsDato(iso: string): Date {
  const [aar, mnd, dag] = iso.split("-").map(Number);
  return new Date(aar, mnd - 1, dag);
}
function tilIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const NAV_KNAPP_STIL: CSSProperties = {
  appearance: "none", cursor: "pointer", width: 26, height: 26, borderRadius: 8,
  background: T.panel2, border: `1px solid ${T.border}`,
  display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none",
};

function PeriodeNav({ tittel, onForrige, onNeste, onIdag }: { tittel: string; onForrige: () => void; onNeste: () => void; onIdag: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
      <button type="button" onClick={onForrige} aria-label="Forrige periode" className="v2-press v2-focus" style={NAV_KNAPP_STIL}>
        <Icon name="chevron-left" size={13} style={{ color: T.fg2 }} />
      </button>
      <Caps>{tittel}</Caps>
      <button type="button" onClick={onNeste} aria-label="Neste periode" className="v2-press v2-focus" style={NAV_KNAPP_STIL}>
        <Icon name="chevron-right" size={13} style={{ color: T.fg2 }} />
      </button>
      <button
        type="button"
        onClick={onIdag}
        className="v2-press v2-focus"
        style={{
          appearance: "none", cursor: "pointer", marginLeft: 2, padding: "4px 10px", borderRadius: 9999,
          background: "transparent", border: `1px solid ${T.border}`,
          fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.mut,
        }}
      >
        I dag
      </button>
    </div>
  );
}

/* ── Dag — tidslinje ──────────────────────────────────── */
function Dag({ dag }: { dag: KalenderData["dag"] }) {
  const router = useRouter();
  return (
    <Kort eyebrow={dag.label} action={<Caps size={9}>{dag.totalLabel}</Caps>}>
      {dag.okter.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <TomTilstand icon="calendar" title="Ingen økter i dag" sub="Nyt hviledagen — eller planlegg i Workbench." />
          <Link href="/portal/planlegge/workbench?zoom=uke" style={{ textDecoration: "none", display: "block" }}>
            <CTAPill icon="calendar" full>
              Åpne Workbench
            </CTAPill>
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {Array.from({ length: dag.tilTime - dag.fraTime }, (_, i) => {
            const time = dag.fraTime + i;
            const timeOkter = dag.okter.filter((o) => o.startTime === time);
            return (
              <div key={i} style={{ display: "flex", gap: 12, minHeight: timeOkter.length ? 72 : 34, borderTop: `1px solid ${T.border}` }}>
                <span style={{ width: 44, flex: "none", fontFamily: T.mono, fontSize: 10, color: T.mut, paddingTop: 8 }}>
                  {String(time).padStart(2, "0")}:00
                </span>
                <div style={{ flex: 1, padding: "6px 0", display: "flex", flexDirection: "column", gap: 6 }}>
                  {timeOkter.map((okt) => (
                    <div
                      key={okt.id}
                      onClick={() => router.push(`/portal/gjennomfore/${okt.id}`)}
                      className="v2-press v2-focus"
                      tabIndex={0}
                      role="button"
                      style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 12,
                        background: okt.naa ? `${T.tint}, ${T.panel3}` : T.panel3,
                        border: `1px solid ${okt.naa ? LIME_KANT : T.border}`,
                        opacity: okt.done ? 0.62 : 1,
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ width: 3, alignSelf: "stretch", borderRadius: 2, background: T.ax[okt.a], flex: "none" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{okt.title}</div>
                        <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 2 }}>
                          {okt.kl}–{okt.slutt}{okt.sted ? ` · ${okt.sted}` : ""}
                        </div>
                      </div>
                      <AkseChip a={okt.a} />
                      {okt.naa && <StatusPill>Nå</StatusPill>}
                      {okt.done && <Icon name="check" size={14} style={{ color: T.up }} />}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Kort>
  );
}

/* ── Uke — kolonnegrid (desktop) / liste (mobil) ──────── */
function Uke({ uke, mobile }: { uke: KalenderData["uke"]; mobile: boolean }) {
  const router = useRouter();
  if (mobile) {
    if (uke.dager.length === 0) {
      return (
        <Kort>
          <TomTilstand icon="calendar" title="Ingen økter denne uka" sub="Uka er åpen — be om en økt eller nyt hvilen." />
        </Kort>
      );
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {uke.dager.map((d) =>
          d.okter.length > 0 ? (
            <Kort key={d.d} eyebrow={d.d}>
              {d.okter.map((o, j) => (
                <Rad
                  key={o.id}
                  onClick={() => router.push(`/portal/gjennomfore/${o.id}`)}
                  leading={<span style={{ width: 42, flex: "none", fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: o.naa ? T.lime : T.mut }}>{o.kl}</span>}
                  title={<span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", whiteSpace: "normal" }}>{o.title}</span>}
                  meta={<AkseChip a={o.a} />}
                  naa={o.naa}
                  trailing={null}
                  last={j === d.okter.length - 1}
                />
              ))}
            </Kort>
          ) : (
            <Kort key={d.d} eyebrow={d.d}>
              <span style={{ fontFamily: T.ui, fontSize: 12, color: T.mut }}>Hvile</span>
            </Kort>
          ),
        )}
      </div>
    );
  }
  return (
    <Kort pad="14px 14px">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>
        {uke.dager.map((d) => (
          <div
            key={d.d}
            style={{
              display: "flex", flexDirection: "column", gap: 8, padding: "10px 8px", borderRadius: 14,
              background: d.isToday ? T.panel2 : "transparent",
              border: `1px solid ${d.isToday ? T.borderS : T.border}`,
            }}
          >
            <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: d.isToday ? T.lime : T.mut, textAlign: "center" }}>{d.d}</span>
            {d.okter.map((o) => (
              <div
                key={o.id}
                onClick={() => router.push(`/portal/gjennomfore/${o.id}`)}
                className="v2-press v2-focus"
                tabIndex={0}
                role="button"
                style={{ padding: "8px 9px", borderRadius: 10, background: T.panel3, border: `1px solid ${o.naa ? LIME_KANT : T.border}`, opacity: o.done ? 0.55 : 1, cursor: "pointer" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 9999, background: T.ax[o.a], flex: "none" }} />
                  <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, color: T.fg2 }}>{o.kl}</span>
                  {o.done && <Icon name="check" size={10} style={{ color: T.up, marginLeft: "auto" }} />}
                </div>
                <div style={{ fontFamily: T.ui, fontSize: 11, fontWeight: 600, color: T.fg, marginTop: 5, lineHeight: 1.3 }}>{o.title}</div>
              </div>
            ))}
            {d.okter.length === 0 && (
              <span style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.ui, fontSize: 10.5, color: T.mut }}>Hvile</span>
            )}
          </div>
        ))}
      </div>
    </Kort>
  );
}

/* ── Måned — rutenett (desktop) / uke-liste + dag-velger (mobil) ── */
function Maaned({ maaned, mobile }: { maaned: KalenderData["maaned"]; mobile: boolean }) {
  const dager = ["M", "T", "O", "T", "F", "L", "S"];
  const [valgtDag, setValgtDag] = useState<number | null>(maaned.today);

  // Rutenett-cellene delt inn i uke-rader (mandag først) — brukes av begge visninger.
  const celler: (number | null)[] = [
    ...Array.from({ length: maaned.ledendeTomme }, () => null),
    ...Array.from({ length: maaned.daysInMonth }, (_, i) => i + 1),
  ];
  while (celler.length % 7 !== 0) celler.push(null);
  const uker: (number | null)[][] = [];
  for (let i = 0; i < celler.length; i += 7) uker.push(celler.slice(i, i + 7));

  if (mobile) {
    const valgtAkser = valgtDag != null ? maaned.perDag[valgtDag] : undefined;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <Kort eyebrow={maaned.label} action={<Caps size={9}>{maaned.totalLabel}</Caps>}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginTop: 4 }}>
            {dager.map((d, i) => (
              <span key={i} style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, color: T.mut, textAlign: "center", textTransform: "uppercase", paddingBottom: 4 }}>{d}</span>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {uker.map((uke, ui) => (
              <div key={ui} style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
                {uke.map((dag, di) => {
                  if (dag == null) return <span key={di} />;
                  const okter = maaned.perDag[dag];
                  const idag = dag === maaned.today;
                  const valgt = dag === valgtDag;
                  return (
                    <button
                      key={di}
                      type="button"
                      className="v2-press v2-focus"
                      onClick={() => setValgtDag(dag)}
                      aria-pressed={valgt}
                      style={{
                        appearance: "none", cursor: "pointer", aspectRatio: "1", borderRadius: 10,
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3,
                        background: idag ? T.lime : valgt ? T.panel2 : okter ? T.panel3 : "transparent",
                        border: `1px solid ${idag ? "transparent" : valgt ? T.borderS : T.border}`,
                      }}
                    >
                      <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: idag ? T.onLime : okter ? T.fg : T.mut }}>{dag}</span>
                      <span style={{ height: 5, display: "flex", gap: 2 }}>
                        {(okter ?? []).slice(0, 3).map((a, j) => (
                          <span key={j} style={{ width: 4, height: 4, borderRadius: 9999, background: idag ? T.onLime : T.ax[a] }} />
                        ))}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </Kort>
        <Kort eyebrow={valgtDag != null ? `Dag ${valgtDag}` : "Velg en dag"}>
          {valgtAkser && valgtAkser.length > 0 ? (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {valgtAkser.map((a, i) => <AkseChip key={i} a={a} />)}
            </div>
          ) : (
            <TomTilstand icon="calendar" title="Ingen økter" sub="Ingen treningsøkter registrert denne dagen." />
          )}
        </Kort>
      </div>
    );
  }

  return (
    <Kort eyebrow={maaned.label} action={<Caps size={9}>{maaned.totalLabel}</Caps>}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginTop: 4 }}>
        {dager.map((d, i) => (
          <span key={i} style={{ fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, color: T.mut, textAlign: "center", textTransform: "uppercase", paddingBottom: 4 }}>{d}</span>
        ))}
        {celler.map((dag, i) => {
          if (dag == null) return <span key={`tom-${i}`} />;
          const okter = maaned.perDag[dag];
          const idag = dag === maaned.today;
          return (
            <div
              key={dag}
              style={{
                aspectRatio: "1", borderRadius: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
                background: idag ? T.lime : okter ? T.panel2 : "transparent",
                border: `1px solid ${idag ? "transparent" : T.border}`,
              }}
            >
              <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: idag ? T.onLime : okter ? T.fg : T.mut }}>{dag}</span>
              <span style={{ height: 6, display: "flex", gap: 2 }}>
                {(okter ?? []).slice(0, 3).map((a, j) => (
                  <span key={j} style={{ width: 5, height: 5, borderRadius: 9999, background: idag ? T.onLime : T.ax[a] }} />
                ))}
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
        {(["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const).map((a) => <AkseChip key={a} a={a} />)}
      </div>
    </Kort>
  );
}

/* ── År — sesongbånd (periodisering) ──────────────────── */
function Aar({ aar, mobile }: { aar: KalenderData["aar"]; mobile: boolean }) {
  if (!aar.harData) {
    return (
      <Kort>
        <TomTilstand
          icon="calendar"
          title="Ingen årsplan ennå"
          sub="Coachen din har ikke lagt inn en sesongplan. Ta kontakt med Anders Kristiansen."
        />
      </Kort>
    );
  }
  const ingenPeriodeplan = aar.perioder.length === 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <Kort tint eyebrow={aar.subtitle} action={aar.aktivPeriodeLabel ? <StatusPill>{aar.aktivPeriodeLabel}</StatusPill> : undefined}>
        {ingenPeriodeplan ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: 0 }}>
              {aar.turneringer.length > 0
                ? "Ingen periodeblokker i sesongplanen ennå — turneringene under er hentet fra påmeldingene dine."
                : "Ingen periodeblokker i sesongplanen ennå — turneringer vises i tallene under."}
            </p>
            <Link href="/portal/planlegge/workbench" style={{ textDecoration: "none", width: "fit-content" }}>
              <CTAPill ghost icon="calendar">Lag sesongplan i Workbench</CTAPill>
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
            {aar.perioder.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: mobile ? 92 : 120, flex: "none" }}>
                  <span style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: p.tone === "naa" ? T.fg : T.fg2, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.navn}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut }}>{p.mnd}</span>
                </span>
                <div style={{ flex: 1, height: 16, borderRadius: 8, background: T.track, overflow: "hidden", position: "relative" }}>
                  <div style={{ width: p.pct + "%", height: "100%", background: p.tone === "naa" ? T.lime : `color-mix(in srgb,${T.ax[p.a]} 55%,${T.panel3})`, borderRadius: 8, opacity: p.tone === "naa" ? 0.9 : 1 }} />
                </div>
                <span style={{ width: 52, flex: "none" }}><AkseChip a={p.a} /></span>
              </div>
            ))}
          </div>
        )}
      </Kort>
      {ingenPeriodeplan && aar.turneringer.length > 0 && (
        <Kort eyebrow="Sesongens turneringer">
          <Periodeplan faser={[]} turneringer={aar.turneringer.map((t) => ({ navn: t.navn, uke: t.uke, prio: t.prio }))} />
          <div style={{ display: "flex", flexDirection: "column", marginTop: 16 }}>
            {aar.turneringer.map((t, i) => (
              <Rad key={i} title={t.navn} sub={t.datoLabel} last={i === aar.turneringer.length - 1} />
            ))}
          </div>
        </Kort>
      )}
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4,1fr)", gap: T.gap }}>
        <KpiFlis label="Uker til turnering" value={aar.kpis.ukerTil === "–" ? "–" : `${aar.kpis.ukerTil} uker`} tint />
        <KpiFlis label="Turneringer igjen" value={String(aar.kpis.turneringerIgjen)} />
        <KpiFlis label="Treningstimer i år" value={`${aar.kpis.treningstimer} t`} />
        {!mobile && <KpiFlis label="Gjennomføring" value={aar.kpis.gjennomforing ?? "–"} />}
      </div>
    </div>
  );
}

/* ── Kalender-skjermen (visningsvelger) ───────────────── */
export function KalenderV2({ data }: { data: KalenderData }) {
  const mobile = useMobile();
  const [vis, setVis] = useState("uke");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Datoen kalenderen er sentrert på — kommer fra loaderen (default i dag,
  // eller ?dato= hvis navigert). All forrige/neste/i dag-navigasjon regner
  // seg videre fra denne, aldri fra en egen klient-side "i dag".
  const visDato = parseVisningsDato(data.visningsDatoISO);

  function gaTilDato(nyDato: Date) {
    const params = new URLSearchParams(searchParams.toString());
    const iso = tilIso(nyDato);
    if (iso === tilIso(new Date())) params.delete("dato");
    else params.set("dato", iso);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }
  const gaDag = (delta: number) => { const d = new Date(visDato); d.setDate(d.getDate() + delta); gaTilDato(d); };
  const gaUke = (delta: number) => { const d = new Date(visDato); d.setDate(d.getDate() + delta * 7); gaTilDato(d); };
  const gaManed = (delta: number) => gaTilDato(new Date(visDato.getFullYear(), visDato.getMonth() + delta, 1));
  const gaAar = (delta: number) => gaTilDato(new Date(visDato.getFullYear() + delta, visDato.getMonth(), 1));
  const gaIdag = () => gaTilDato(new Date());

  const periodeNav = {
    dag: { tittel: data.dag.label, forrige: () => gaDag(-1), neste: () => gaDag(1) },
    uke: { tittel: data.ukeLabel, forrige: () => gaUke(-1), neste: () => gaUke(1) },
    maaned: { tittel: data.maaned.label, forrige: () => gaManed(-1), neste: () => gaManed(1) },
    aar: { tittel: String(visDato.getFullYear()), forrige: () => gaAar(-1), neste: () => gaAar(1) },
  }[vis as "dag" | "uke" | "maaned" | "aar"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <PeriodeNav tittel={periodeNav.tittel} onForrige={periodeNav.forrige} onNeste={periodeNav.neste} onIdag={gaIdag} />
          <div style={{ marginTop: 10 }}>
            <Tittel mobile={mobile} em="kalender">Din</Tittel>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <PillVelger
            options={[{ v: "dag", l: "Dag" }, { v: "uke", l: "Uke" }, { v: "maaned", l: "Måned" }, { v: "aar", l: "År" }]}
            value={vis}
            onChange={setVis}
          />
          {!mobile && (
            <span className="hidden md:inline-flex">
              <Link href="/portal/onskeligokt" style={{ textDecoration: "none" }}>
                <CTAPill icon="plus" ghost>Be om økt</CTAPill>
              </Link>
            </span>
          )}
        </div>
      </div>

      {vis === "dag" && <Dag dag={data.dag} />}
      {vis === "uke" && <Uke uke={data.uke} mobile={mobile} />}
      {vis === "maaned" && <Maaned maaned={data.maaned} mobile={mobile} />}
      {vis === "aar" && <Aar aar={data.aar} mobile={mobile} />}
    </div>
  );
}
