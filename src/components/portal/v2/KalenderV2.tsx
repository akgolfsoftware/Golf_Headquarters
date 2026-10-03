"use client";

/**
 * PH10Kalender — PlayerHQ kalender i Precision Athletics.
 * Dag, uke, måned og år bruker samme loader og ?dato=-navigasjon som før.
 * Opptatt tid ligger på egen rute. Tegningen ui_kits/playerhq/screens/PH-10.jsx ligger ikke i git.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { AkseMerke, Ikon, Sidehode, StatusPille, TomTilstand, type Akse } from "@/components/precision/pa";
import type { AkseKey } from "@/lib/v2/format";
import type { KalenderData } from "@/app/portal/kalender/data";
import "@/styles/precision-athletics.css";

const AKSE: Record<AkseKey, Akse> = { FYS: "fys", TEK: "tek", SLAG: "slag", SPILL: "spill", TURN: "turn" };
const VISNINGER = [
  { v: "dag", l: "Dag" },
  { v: "uke", l: "Uke" },
  { v: "maaned", l: "Måned" },
  { v: "aar", l: "År" },
] as const;
type Visning = (typeof VISNINGER)[number]["v"];

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

function parseVisningsDato(iso: string): Date {
  const [aar, mnd, dag] = iso.split("-").map(Number);
  return new Date(aar, mnd - 1, dag);
}
function tilIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function Prikk({ akse, lys }: { akse: AkseKey; lys?: boolean }) {
  return <span className={lys ? "ph-kal-prikk ph-kal-prikk--lys" : "ph-kal-prikk"} data-akse={akse} />;
}

function PeriodeNav({ tittel, onForrige, onNeste, onIdag }: { tittel: string; onForrige: () => void; onNeste: () => void; onIdag: () => void }) {
  return (
    <div className="ph-kal-nav">
      <button type="button" onClick={onForrige} aria-label="Forrige periode" className="pa-iconbtn">
        <Ikon icon={ChevronLeft} size={16} name="chevron-left" />
      </button>
      <span className="ph-kal-nav-tittel">{tittel}</span>
      <button type="button" onClick={onNeste} aria-label="Neste periode" className="pa-iconbtn">
        <Ikon icon={ChevronRight} size={16} name="chevron-right" />
      </button>
      <button type="button" onClick={onIdag} className="pa-btn pa-btn--ghost pa-btn--sm">I dag</button>
    </div>
  );
}

function Dag({ dag }: { dag: KalenderData["dag"] }) {
  const router = useRouter();
  return (
    <section className="pa-card ph-kal-kort">
      <header className="ph-kal-kort-hode">
        <p className="ph-kal-kicker">{dag.label}</p>
        <p className="ph-kal-meta">{dag.totalLabel}</p>
      </header>
      {dag.okter.length === 0 ? (
        <TomTilstand
          icon={CalendarDays}
          title="Ingen økter i dag"
          text="Nyt hviledagen — eller planlegg i Workbench."
          actions={<Link href="/portal/planlegge/workbench?zoom=uke" className="pa-btn pa-btn--primary pa-btn--full">Åpne Workbench</Link>}
        />
      ) : (
        <ol className="ph-kal-tid">
          {Array.from({ length: dag.tilTime - dag.fraTime }, (_, i) => {
            const time = dag.fraTime + i;
            const timeOkter = dag.okter.filter((o) => o.startTime === time);
            return (
              <li key={time} className={timeOkter.length ? "ph-kal-time ph-kal-time--opptatt" : "ph-kal-time"}>
                <span>{String(time).padStart(2, "0")}:00</span>
                <div>
                  {timeOkter.map((okt) => (
                    <button
                      key={okt.id}
                      type="button"
                      className={okt.naa ? "ph-kal-okt ph-kal-okt--naa" : "ph-kal-okt"}
                      data-ferdig={okt.done ? "true" : undefined}
                      onClick={() => router.push(`/portal/gjennomfore/${okt.id}`)}
                    >
                      <span className="ph-kal-strek" data-akse={okt.a} />
                      <span className="ph-kal-okt-tekst">
                        <strong>{okt.title}</strong>
                        <small>{okt.kl}–{okt.slutt}{okt.sted ? ` · ${okt.sted}` : ""}</small>
                      </span>
                      <AkseMerke axis={AKSE[okt.a]} size="sm" />
                      {okt.naa && <StatusPille tone="live">Nå</StatusPille>}
                      {okt.done && <Ikon icon={Check} size={14} name="check" />}
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

function Uke({ uke, mobile }: { uke: KalenderData["uke"]; mobile: boolean }) {
  const router = useRouter();
  if (mobile) {
    if (uke.dager.length === 0) {
      return (
        <section className="pa-card ph-kal-kort">
          <TomTilstand icon={CalendarDays} title="Ingen økter denne uka" text="Uka er åpen — be om en økt eller nyt hvilen." />
        </section>
      );
    }
    return (
      <div className="ph-kal-stabel">
        {uke.dager.map((d) => (
          <section key={d.d} className="pa-card ph-kal-kort">
            <p className="ph-kal-kicker">{d.d}</p>
            {d.okter.length === 0 ? <p className="ph-kal-hvile">Hvile</p> : (
              <ul className="ph-kal-liste">
                {d.okter.map((o) => (
                  <li key={o.id}>
                    <button type="button" className="ph-kal-rad" onClick={() => router.push(`/portal/gjennomfore/${o.id}`)}>
                      <span className={o.naa ? "ph-kal-kl ph-kal-kl--naa" : "ph-kal-kl"}>{o.kl}</span>
                      <span>{o.title}</span>
                      <AkseMerke axis={AKSE[o.a]} size="sm" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    );
  }
  return (
    <section className="pa-card ph-kal-kort">
      <div className="ph-kal-uke">
        {uke.dager.map((d) => (
          <div key={d.d} className={d.isToday ? "ph-kal-ukedag ph-kal-ukedag--idag" : "ph-kal-ukedag"}>
            <span>{d.d}</span>
            {d.okter.map((o) => (
              <button
                key={o.id}
                type="button"
                className={o.naa ? "ph-kal-blokk ph-kal-blokk--naa" : "ph-kal-blokk"}
                data-ferdig={o.done ? "true" : undefined}
                onClick={() => router.push(`/portal/gjennomfore/${o.id}`)}
              >
                <span className="ph-kal-blokk-meta">
                  <Prikk akse={o.a} />
                  {o.kl}
                  {o.done && <Ikon icon={Check} size={12} name="check" />}
                </span>
                <strong>{o.title}</strong>
              </button>
            ))}
            {d.okter.length === 0 && <span className="ph-kal-hvile">Hvile</span>}
          </div>
        ))}
      </div>
    </section>
  );
}

function Maaned({ maaned, mobile }: { maaned: KalenderData["maaned"]; mobile: boolean }) {
  const dager = ["M", "T", "O", "T", "F", "L", "S"];
  const [valgtDag, setValgtDag] = useState<number | null>(maaned.today);
  const celler: (number | null)[] = [
    ...Array.from({ length: maaned.ledendeTomme }, () => null),
    ...Array.from({ length: maaned.daysInMonth }, (_, i) => i + 1),
  ];
  while (celler.length % 7 !== 0) celler.push(null);
  const uker: (number | null)[][] = [];
  for (let i = 0; i < celler.length; i += 7) uker.push(celler.slice(i, i + 7));

  const rutenett = (velg: boolean) => (
    <>
      <div className="ph-kal-mnd-hode">
        {dager.map((d, i) => <span key={i}>{d}</span>)}
      </div>
      {uker.map((uke, ui) => (
        <div key={ui} className="ph-kal-mnd-rad">
          {uke.map((dag, di) => {
            if (dag == null) return <span key={di} />;
            const okter = maaned.perDag[dag];
            const idag = dag === maaned.today;
            const valgt = velg && dag === valgtDag;
            const klasse = [
              "ph-kal-celle",
              idag ? "ph-kal-celle--idag" : "",
              valgt ? "ph-kal-celle--valgt" : "",
              okter ? "ph-kal-celle--okt" : "",
            ].filter(Boolean).join(" ");
            const innhold = (
              <>
                <span>{dag}</span>
                <span className="ph-kal-prikker">
                  {(okter ?? []).slice(0, 3).map((a, j) => <Prikk key={j} akse={a} lys={idag} />)}
                </span>
              </>
            );
            return velg ? (
              <button key={di} type="button" className={klasse} aria-pressed={valgt} onClick={() => setValgtDag(dag)}>{innhold}</button>
            ) : (
              <div key={dag} className={klasse}>{innhold}</div>
            );
          })}
        </div>
      ))}
    </>
  );

  if (mobile) {
    const valgtAkser = valgtDag != null ? maaned.perDag[valgtDag] : undefined;
    return (
      <div className="ph-kal-stabel">
        <section className="pa-card ph-kal-kort">
          <header className="ph-kal-kort-hode">
            <p className="ph-kal-kicker">{maaned.label}</p>
            <p className="ph-kal-meta">{maaned.totalLabel}</p>
          </header>
          {rutenett(true)}
        </section>
        <section className="pa-card ph-kal-kort">
          <p className="ph-kal-kicker">{valgtDag != null ? `Dag ${valgtDag}` : "Velg en dag"}</p>
          {valgtAkser && valgtAkser.length > 0 ? (
            <div className="ph-kal-akser">{valgtAkser.map((a, i) => <AkseMerke key={i} axis={AKSE[a]} size="sm" />)}</div>
          ) : (
            <TomTilstand icon={CalendarDays} title="Ingen økter" text="Ingen treningsøkter registrert denne dagen." />
          )}
        </section>
      </div>
    );
  }

  return (
    <section className="pa-card ph-kal-kort">
      <header className="ph-kal-kort-hode">
        <p className="ph-kal-kicker">{maaned.label}</p>
        <p className="ph-kal-meta">{maaned.totalLabel}</p>
      </header>
      {rutenett(false)}
      <div className="ph-kal-akser">
        {(["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const).map((a) => <AkseMerke key={a} axis={AKSE[a]} size="sm" />)}
      </div>
    </section>
  );
}

function Aar({ aar, mobile }: { aar: KalenderData["aar"]; mobile: boolean }) {
  if (!aar.harData) {
    return (
      <section className="pa-card ph-kal-kort">
        <TomTilstand
          icon={CalendarDays}
          title="Ingen årsplan ennå"
          text="Coachen din har ikke lagt inn en sesongplan. Ta kontakt med Anders Kristiansen."
        />
      </section>
    );
  }
  const ingenPeriodeplan = aar.perioder.length === 0;
  return (
    <div className="ph-kal-stabel">
      <section className="pa-card ph-kal-kort">
        <header className="ph-kal-kort-hode">
          <p className="ph-kal-kicker">{aar.subtitle}</p>
          {aar.aktivPeriodeLabel && <StatusPille tone="live">{aar.aktivPeriodeLabel}</StatusPille>}
        </header>
        {ingenPeriodeplan ? (
          <>
            <p className="ph-kal-setning">
              {aar.turneringer.length > 0
                ? "Ingen periodeblokker i sesongplanen ennå — turneringene under er hentet fra påmeldingene dine."
                : "Ingen periodeblokker i sesongplanen ennå — turneringer vises i tallene under."}
            </p>
            <Link href="/portal/planlegge/workbench" className="pa-btn pa-btn--secondary">Lag sesongplan i Workbench</Link>
          </>
        ) : (
          <ol className="ph-kal-perioder">
            {aar.perioder.map((p) => (
              <li key={`${p.navn}-${p.mnd}`}>
                <span>
                  <strong data-tone={p.tone ?? undefined}>{p.navn}</strong>
                  <small>{p.mnd}</small>
                </span>
                <span className="ph-kal-band" aria-hidden>
                  <span style={{ width: `${Math.max(0, Math.min(100, p.pct))}%` }} data-akse={p.a} data-tone={p.tone ?? undefined} />
                </span>
                <AkseMerke axis={AKSE[p.a]} size="sm" />
              </li>
            ))}
          </ol>
        )}
      </section>
      {ingenPeriodeplan && aar.turneringer.length > 0 && (
        <section className="pa-card ph-kal-kort">
          <p className="ph-kal-kicker">Sesongens turneringer</p>
          <ul className="ph-kal-turn">
            {aar.turneringer.map((t) => (
              <li key={`${t.navn}-${t.uke}`}>
                <span>{t.navn}</span>
                <small>{t.datoLabel} · uke {t.uke} · {t.prio}</small>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className={mobile ? "ph-kal-kpi ph-kal-kpi--to" : "ph-kal-kpi"}>
        <section className="pa-card ph-kal-kort"><p className="ph-kal-kicker">Uker til turnering</p><p className="ph-kal-tall">{aar.kpis.ukerTil === "–" ? "–" : `${aar.kpis.ukerTil} uker`}</p></section>
        <section className="pa-card ph-kal-kort"><p className="ph-kal-kicker">Turneringer igjen</p><p className="ph-kal-tall">{aar.kpis.turneringerIgjen}</p></section>
        <section className="pa-card ph-kal-kort"><p className="ph-kal-kicker">Treningstimer i år</p><p className="ph-kal-tall">{aar.kpis.treningstimer} t</p></section>
        {!mobile && <section className="pa-card ph-kal-kort"><p className="ph-kal-kicker">Gjennomføring</p><p className="ph-kal-tall">{aar.kpis.gjennomforing ?? "–"}</p></section>}
      </div>
    </div>
  );
}

export function KalenderV2({ data }: { data: KalenderData }) {
  const mobile = useMobile();
  const [vis, setVis] = useState<Visning>("uke");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
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
  }[vis];

  return (
    <div className="ph-kal" data-od-id="playerhq-kalender">
      <div className="ph-kal-topp">
        <div>
          <Sidehode kicker="Treningskalender" title="Kalender" />
          <PeriodeNav tittel={periodeNav.tittel} onForrige={periodeNav.forrige} onNeste={periodeNav.neste} onIdag={gaIdag} />
        </div>
        <div className="ph-kal-velger">
          <div role="tablist" aria-label="Kalendervisning">
            {VISNINGER.map((o) => (
              <button key={o.v} type="button" role="tab" aria-selected={vis === o.v} onClick={() => setVis(o.v)}>{o.l}</button>
            ))}
          </div>
          <Link href="/portal/onskeligokt" className="pa-btn pa-btn--secondary ph-kal-kun-desktop">
            <Ikon icon={Plus} size={16} name="plus" />
            Be om økt
          </Link>
        </div>
      </div>
      {vis === "dag" && <Dag dag={data.dag} />}
      {vis === "uke" && <Uke uke={data.uke} mobile={mobile} />}
      {vis === "maaned" && <Maaned maaned={data.maaned} mobile={mobile} />}
      {vis === "aar" && <Aar aar={data.aar} mobile={mobile} />}
    </div>
  );
}
