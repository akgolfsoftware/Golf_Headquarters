import Link from "next/link";
import { Flag, TrendingDown } from "lucide-react";

import { erTurneringstittel } from "@/app/team-wang/_data/live-sesong";
import { hendelserMellom, hentElevOkter, hentGruppeElever, hentGruppeplan } from "@/app/team-wang/_data/wang-idag-trening-data";
import {
  DAG_LANG,
  ddmm,
  ddmmaaaa,
  forsteVerdi,
  isoUke,
  leggTilDager,
  mandagI,
  osloIso,
  prosent,
  ukedag,
  underSyttiToUker,
} from "@/app/team-wang/_data/wang-trening-beregning";
import { Pillenke, Sidehode, it as s, lastTrygt } from "@/app/team-wang/_components/wang-idag-trening/it-ui";
import type { WangSkjermKontekst } from "@/app/team-wang/_components/wang-idag-trening/it-ui";
import { WangDemoMerknad, WangFeil, WangKnapp, WangTom } from "@/components/wang/trener/wang-ui";
import { elevprofilHref, wangHref } from "@/lib/wang/wang-ruter";

type Grunn = "tid" | "sjekk" | "forslag" | "turn";
const GRUNNER: Grunn[] = ["tid", "sjekk", "forslag", "turn"];

/** WANG-43 Elever som trenger deg. Fasit: «WANG Golf Elevprofil.dc.html» #trenger (6cfa623c). Rute: /team-wang/i-dag */
export async function WangTrengerDeg({ gruppe, erDemo, sok }: WangSkjermKontekst & { sok: { grunn?: string | string[] } }) {
  const valgt = GRUNNER.find((g) => g === forsteVerdi(sok.grunn)) ?? null;
  const naa = new Date();
  const idag = osloIso(naa);
  const mandag = mandagI(idag);
  const sondag = leggTilDager(mandag, 6);
  const uke = isoUke(idag);

  const meta = `WANG-43 · ${DAG_LANG[ukedag(idag)]} ${ddmmaaaa(idag)} · uke ${uke}`;
  const tittel = "Elever som trenger deg";
  const intro = "Under 70 % av planlagt tid to uker på rad, fireukerssjekk ikke levert, forslag som venter svar og turnering denne uka.";

  const last = await lastTrygt(async () => {
    const [elever, plan] = await Promise.all([hentGruppeElever(gruppe.id), hentGruppeplan(gruppe.id, idag)]);
    const okter = await hentElevOkter(elever.map((e) => e.id), leggTilDager(mandag, -14), sondag);
    return { elever, plan, okter };
  });

  if (!last.ok) {
    return (
      <div className={s.stabel}>
        <Sidehode meta={meta} tittel={tittel} undertittel={intro} />
        <WangFeil tittel="Vi fikk ikke hentet data fra PlayerHQ." tekst="Ingenting er borte. Det eleven har ført ligger i PlayerHQ. Prøv igjen om litt." handling={<WangKnapp href={wangHref("WANG-43")}>Prøv igjen</WangKnapp>} />
      </div>
    );
  }

  const { elever, plan, okter } = last.data;
  const turneringer = hendelserMellom(plan.hendelser, mandag, sondag).filter((h) => erTurneringstittel(h.tittel));

  const rader = elever
    .map((e) => ({ e, funn: underSyttiToUker(okter.filter((o) => o.elevId === e.id), idag, naa) }))
    .filter((r): r is { e: (typeof elever)[number]; funn: NonNullable<typeof r.funn> } => r.funn !== null)
    .sort((a, b) => a.funn.andeler[1] - b.funn.andeler[1]);

  const uke1 = isoUke(leggTilDager(mandag, -14));
  const uke2 = isoUke(leggTilDager(mandag, -7));
  const felt: Array<{ key: Grunn; etikett: string; verdi: string; hint: string }> = [
    { key: "tid", etikett: "Under 70 % to uker på rad", verdi: String(rader.length), hint: `Av planlagt tid, uke ${uke1} og ${uke2}` },
    { key: "sjekk", etikett: "Fireukerssjekk ikke levert", verdi: "—", hint: "Fireukerssjekken lagres ikke i appen ennå" },
    { key: "forslag", etikett: "Forslag venter svar", verdi: "—", hint: "Forslag til elev lagres ikke i appen ennå" },
    { key: "turn", etikett: "Turnering denne uka", verdi: String(turneringer.length), hint: `Uke ${uke} · ${ddmm(mandag)}–${ddmm(sondag)} · fra gruppas kalender` },
  ];

  const visTid = valgt === null || valgt === "tid";
  const visTurn = valgt === null || valgt === "turn";
  const overskrift = valgt === null ? `${rader.length} ${rader.length === 1 ? "elev trenger" : "elever trenger"} deg` : `${valgt === "tid" ? rader.length : valgt === "turn" ? turneringer.length : "—"} · ${felt.find((f) => f.key === valgt)?.etikett.toLowerCase()}`;
  const ingenting = rader.length === 0 && turneringer.length === 0;

  return (
    <div className={s.stabel}>
      <Sidehode meta={meta} tittel={tittel} undertittel={intro} />
      {erDemo ? <WangDemoMerknad /> : null}

      <nav className={`${s.kort} ${s.kpi} ${s.kortSkjult}`} aria-label="Filtrer på grunn">
        {felt.map((f) => {
          const pa = valgt === f.key;
          return (
            <Link key={f.key} href={pa ? wangHref("WANG-43") : wangHref("WANG-43", {}, { grunn: f.key })} scroll={false} className={s.sumFelt} aria-current={pa ? "true" : undefined}>
              <span className={s.meta}>{f.etikett}</span>
              <span className={s.kpiVerdi} style={{ fontWeight: 300 }}>{f.verdi}</span>
              <span className={s.kpiHint}>{f.hint}</span>
            </Link>
          );
        })}
      </nav>

      {ingenting && valgt === null ? (
        <section className={s.kort}>
          <WangTom
            tittel="Ingen elever trenger deg i dag."
            tekst={elever.length === 0 ? "Gruppa har ingen aktive elever ennå." : "Ingen elever ligger under 70 % av planlagt tid to uker på rad, og gruppas kalender har ingen turnering denne uka."}
            handling={<WangKnapp href={wangHref("WANG-07")}>Se elevene</WangKnapp>}
          />
        </section>
      ) : (
        <section className={s.kort}>
          <div className={s.kortHode}>
            <h2 className={s.h2}>{overskrift}</h2>
            {valgt !== null ? <Pillenke href={wangHref("WANG-43")}>Vis alle grunner</Pillenke> : null}
          </div>

          {valgt === "sjekk" || valgt === "forslag" ? (
            <p className={s.rad} style={{ margin: 0, display: "block", fontSize: 15, color: "var(--wtr-text-muted)" }}>
              {valgt === "sjekk" ? "Fireukerssjekken fra PlayerHQ lagres ikke i appen ennå. Derfor kan ingen elev vises her." : "Forslag du sender til elever lagres ikke i appen ennå. Derfor kan ingen elev vises her."}
            </p>
          ) : null}

          {visTid
            ? rader.map(({ e, funn }) => (
                <div key={e.id} className={s.elevBlokk}>
                  <div className={s.elevHode}>
                    <Link href={elevprofilHref(e.id)} className={s.navnLenke}>{e.navn}</Link>
                    <span className={s.meta}>{gruppe.name}</span>
                  </div>
                  <div className={s.grunn}>
                    <TrendingDown size={18} strokeWidth={1.5} aria-hidden="true" color="var(--wtr-blue)" />
                    <span className={s.grunnTekst}>
                      Under 70 % av planlagt tid to uker på rad · uke {funn.uker[0]} {prosent(funn.andeler[0])} · uke {funn.uker[1]} {prosent(funn.andeler[1])}
                    </span>
                    <Pillenke href={elevprofilHref(e.id, "plan")}>Plan</Pillenke>
                  </div>
                </div>
              ))
            : null}

          {visTurn
            ? turneringer.map((t) => (
                <div key={`${t.id}-${t.dato}`} className={s.elevBlokk}>
                  <div className={s.grunn}>
                    <Flag size={18} strokeWidth={1.5} aria-hidden="true" color="var(--wtr-blue)" />
                    <span className={s.grunnTekst}>
                      {t.tittel.replace(/^Turnering:\s*/, "")}
                      {t.sted ? ` · ${t.sted}` : ""} · {t.fra === t.til ? ddmm(t.fra) : `${ddmm(t.fra)}–${ddmm(t.til)}`}
                    </span>
                    <Pillenke href={wangHref("WANG-10")}>Turneringer</Pillenke>
                  </div>
                </div>
              ))
            : null}

          {valgt === "tid" && rader.length === 0 ? <p className={s.rad} style={{ margin: 0, display: "block", fontSize: 15 }}>Ingen elever ligger under 70 % to uker på rad.</p> : null}
          {valgt === "turn" && turneringer.length === 0 ? <p className={s.rad} style={{ margin: 0, display: "block", fontSize: 15 }}>Gruppas kalender har ingen turnering denne uka.</p> : null}
        </section>
      )}

      <p className={s.fot}>
        Listen viser aktive elever i {gruppe.name}. Planlagt tid kommer fra elevens plan i PlayerHQ. En uke uten forfalte økter bryter rekken. Turneringer kommer fra gruppas kalender; hvem som er påmeldt, lagres ikke her.
      </p>
    </div>
  );
}
