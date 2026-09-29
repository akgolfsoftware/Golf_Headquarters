import type { Metadata } from "next";
import Link from "next/link";

import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { hentGruppeElever, hentProveplan, type WangProveHendelse } from "@/app/team-wang/_data/wang-elever-data";
import { flyttMaaned, isoTilNorsk, lesMaaned, maanedsnavn, manedsrutenett, osloIso } from "@/app/team-wang/_data/wang-elever-regler";
import { KortHode, dagTekst, meStil as s } from "@/app/team-wang/_components/wang-meldinger-elever/felles";
import { WangDemoMerknad, WangFeil, WangKnapp, WangKort, WangLenke, WangSide, WangSidehode, WangTom } from "@/components/wang/trener/wang-ui";
import { elevprofilHref, wangHref } from "@/lib/wang/wang-ruter";

/**
 * WG-04 Prøveplan og turneringer. Rute: /team-wang/elever/proveplan?elev=&maaned=YYYY-MM&dag=YYYY-MM-DD.
 * Tegning: «WANG Golf.dc.html» #prove. Skolens terminliste (SchoolScheduleEntry,
 * for elevens trinn og hele skolen) mot elevens turneringer. En dag med både
 * prøve og turnering er en kollisjon. Søknad om idrettsfravær har ingen modell.
 */
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Prøveplan — WANG Golf", robots: { index: false, follow: false } };

const UKEDAGER = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const SKOLE: ReadonlySet<WangProveHendelse["type"]> = new Set(["PROVE", "HELDAGSPROVE", "EKSAMEN"]);

const TAG: Record<WangProveHendelse["type"], { tag: string; prikk: string; kort: string }> = {
  PROVE: { tag: s.tProve, prikk: s.dProve, kort: "Prøve" },
  HELDAGSPROVE: { tag: s.tHeldag, prikk: s.dHeldag, kort: "Heldag" },
  EKSAMEN: { tag: s.tHeldag, prikk: s.dHeldag, kort: "Eksamen" },
  TURNERING: { tag: s.tTurn, prikk: s.dTurn, kort: "Turnering" },
  FERIE: { tag: s.tFerie, prikk: s.dFerie, kort: "Ferie" },
  ANNET: { tag: s.tFerie, prikk: s.dFerie, kort: "Skole" },
};

function forste(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function WangProveplanSide({ searchParams }: { searchParams: Promise<{ elev?: string | string[]; maaned?: string | string[]; dag?: string | string[] }> }) {
  const { gruppe, erDemo } = await krevWangTrener();
  const sp = await searchParams;
  const na = new Date();
  const maaned = lesMaaned(sp.maaned, na);
  const base = wangHref("WG-04");

  let elever;
  try {
    elever = await hentGruppeElever(gruppe.id, na);
  } catch {
    return (
      <WangSide>
        <WangSidehode skjermId="WG-04" tittel="Prøveplan og turneringer" />
        <WangFeil tekst="Ingenting er borte. Last siden på nytt om litt." />
      </WangSide>
    );
  }

  const elev = elever.find((e) => e.id === forste(sp.elev)) ?? elever[0] ?? null;
  if (!elev) {
    return (
      <WangSide>
        <WangSidehode skjermId="WG-04" tittel="Prøveplan og turneringer" />
        <WangKort>
          <WangTom tittel="Ingen elever i gruppa ennå." tekst={`Prøveplanen vises per elev når det står aktive spillere i ${gruppe.name}.`} />
        </WangKort>
      </WangSide>
    );
  }

  let plan;
  try {
    plan = await hentProveplan(elev, maaned, na);
  } catch {
    return (
      <WangSide>
        <WangSidehode skjermId="WG-04" undertittel={elev.navn} tittel="Prøveplan og turneringer" />
        <WangFeil tekst="Fikk ikke hentet terminlisten eller turneringene. Last siden på nytt om litt." />
      </WangSide>
    );
  }

  const dager = manedsrutenett(maaned);
  const perDag = new Map<string, WangProveHendelse[]>();
  for (const h of plan.hendelser) perDag.set(h.datoIso, [...(perDag.get(h.datoIso) ?? []), h]);
  const kollisjon = (iso: string) => {
    const l = perDag.get(iso) ?? [];
    return l.some((h) => h.type === "TURNERING") && l.some((h) => SKOLE.has(h.type));
  };
  const kollisjoner = dager.filter((d) => d.iMaaned && kollisjon(d.iso));
  const idag = osloIso(na);
  const valgtDag = (() => {
    const d = forste(sp.dag);
    if (d && dager.some((x) => x.iso === d)) return d;
    return idag.slice(0, 7) === maaned ? idag : `${maaned}-01`;
  })();
  const valgtListe = perDag.get(valgtDag) ?? [];
  const lenke = (p: { maaned?: string; dag?: string }) => {
    const q = new URLSearchParams({ elev: elev.id, maaned: p.maaned ?? maaned });
    if (p.dag) q.set("dag", p.dag);
    return `${base}?${q.toString()}`;
  };

  return (
    <WangSide>
      <WangSidehode
        skjermId="WG-04"
        undertittel={[elev.navn, elev.klasse].filter(Boolean).join(" · ")}
        tittel="Prøveplan og turneringer"
        handling={
          <form action={base} method="get" style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end", minWidth: 0 }}>
            <input type="hidden" name="maaned" value={maaned} />
            <label className={s.etikett} style={{ minWidth: 180 }}>
              Elev
              <select name="elev" defaultValue={elev.id} className={s.felt}>
                {elever.map((e) => (
                  <option key={e.id} value={e.id}>{e.navn}{e.klasse ? ` · ${e.klasse}` : ""}</option>
                ))}
              </select>
            </label>
            <WangKnapp type="submit">Vis</WangKnapp>
          </form>
        }
      />
      {erDemo ? <WangDemoMerknad /> : null}

      {kollisjoner.length > 0 ? (
        <WangFeil
          tittel={`${kollisjoner.length === 1 ? "Én dag" : `${kollisjoner.length} dager`} med prøve og turnering samtidig`}
          tekst={`${kollisjoner.map((d) => dagTekst(d.iso)).join(", ")}. Snakk med ${elev.fornavn} og kontaktlærer om innhenting.`}
        />
      ) : null}

      <div className={s.split}>
        <WangKort polstret>
          <div className={s.kalHode}>
            <h2 className={s.kalTittel}>{maanedsnavn(maaned)}</h2>
            <div className={s.forklaring}>
              <span><span className={`${s.prikk} ${s.dProve}`} />Prøve</span>
              <span><span className={`${s.prikk} ${s.dHeldag}`} />Heldagsprøve</span>
              <span><span className={`${s.prikk} ${s.dTurn}`} />Turnering</span>
              <span><span className={s.kollisjon} />Kollisjon</span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <WangLenke href={lenke({ maaned: flyttMaaned(maaned, -1) })}>{maanedsnavn(flyttMaaned(maaned, -1))}</WangLenke>
            <WangLenke href={lenke({ maaned: flyttMaaned(maaned, 1) })}>{maanedsnavn(flyttMaaned(maaned, 1))}</WangLenke>
          </div>
          <div className={s.kal} style={{ marginBottom: 4 }} aria-hidden="true">
            {UKEDAGER.map((u) => <span key={u} className={s.ukedag}>{u}</span>)}
          </div>
          <div className={s.kal}>
            {dager.map((d) => {
              const ev = perDag.get(d.iso) ?? [];
              const kl = [s.dag, !d.iMaaned ? s.dagUt : "", kollisjon(d.iso) ? s.dagKonf : "", d.iso === valgtDag ? s.dagValgt : ""].filter(Boolean).join(" ");
              return (
                <Link
                  key={d.iso}
                  href={lenke({ dag: d.iso })}
                  scroll={false}
                  className={kl}
                  aria-label={`${dagTekst(d.iso)}${ev.length ? `, ${ev.map((h) => h.tittel).join(", ")}` : ", ingenting"}`}
                  aria-current={d.iso === valgtDag ? "date" : undefined}
                >
                  <span className={s.dagNr}>{d.nr}</span>
                  {ev.map((h) => <span key={h.id} className={`${s.kalTag} ${TAG[h.type].tag}`}>{h.tittel}</span>)}
                  {ev.length ? <span className={s.prikker}>{ev.map((h) => <span key={h.id} className={`${s.prikk} ${TAG[h.type].prikk}`} />)}</span> : null}
                </Link>
              );
            })}
          </div>
          <div style={{ marginTop: 16, borderTop: "1px solid var(--wtr-border-subtle)", paddingTop: 14, display: "grid", gap: 8 }}>
            <p className={s.radTittel} style={{ margin: 0 }}>{dagTekst(valgtDag)}</p>
            {valgtListe.length === 0 ? (
              <p className={s.fot} style={{ fontSize: 15 }}>Ingen prøver eller turneringer denne dagen.</p>
            ) : (
              valgtListe.map((h) => (
                <div key={h.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span className={`${s.prikk} ${TAG[h.type].prikk}`} style={{ marginTop: 7 }} />
                  <div>
                    <p className={s.brod16} style={{ margin: 0 }}>{h.tittel}</p>
                    <p className={s.metaTekst} style={{ margin: "2px 0 0", fontSize: 12.5 }}>{TAG[h.type].kort}{h.detalj ? ` · ${h.detalj}` : ""}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </WangKort>

        <div style={{ display: "grid", gap: 20, minWidth: 0 }}>
          <WangKort>
            <KortHode tittel="Kommende turneringer" meta={`${elev.fornavn}s plan i PlayerHQ`} />
            {plan.kommendeTurneringer.length === 0 ? (
              <p className={s.tomLinje}>Ingen kommende turneringer.</p>
            ) : (
              plan.kommendeTurneringer.map((t) => {
                const iso = osloIso(t.startDato);
                const krasj = kollisjon(iso);
                return (
                  <div key={t.turneringId} className={s.rad}>
                    <span className={s.kolonne}>
                      <span className={s.radTittel} style={{ fontSize: 14 }}>{t.navn}</span>
                      <span className={s.radMeta}>{isoTilNorsk(iso)}{t.klasse ? ` · ${t.klasse}` : ""}</span>
                    </span>
                    {krasj ? <span className={s.metaTekst} style={{ color: "var(--wtr-blue)" }}>Kolliderer med prøve</span> : <span />}
                  </div>
                );
              })
            )}
          </WangKort>
          <WangKort polstret>
            <div style={{ display: "grid", gap: 8 }}>
              <h2 className={s.h2}>Idrettsfravær og innhenting</h2>
              <p className={s.fot}>Søknad om idrettsfravær og liste over skolearbeid å hente inn føres ikke i appen ennå. Kontaktlærer godkjenner søknaden.</p>
              <WangLenke href={elevprofilHref(elev.id, "turneringer")}>Turneringene til {elev.fornavn}</WangLenke>
            </div>
          </WangKort>
        </div>
      </div>
      <p className={s.fot}>Prøver og heldagsprøver kommer fra skolens terminliste for {elev.klasse ?? "hele skolen"}. Turneringer kommer fra AK Golf pipelines og elevens egne påmeldinger.</p>
    </WangSide>
  );
}
