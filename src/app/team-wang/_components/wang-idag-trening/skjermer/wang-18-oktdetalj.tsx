import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Target } from "lucide-react";

import { hentElevOkter, hentGruppeElever, hentOktIGruppe, hentOktInnhold } from "@/app/team-wang/_data/wang-idag-trening-data";
import {
  OMRADE_NAVN,
  dagOgDato,
  dagerMellom,
  erAvvist,
  erForfalt,
  erGjennomfort,
  erUpublisert,
  gruppeokter,
  mandagI,
  osloIso,
  somOmrade,
  tidsrom,
  type WangOkt,
} from "@/app/team-wang/_data/wang-trening-beregning";
import { it as s, lastTrygt } from "@/app/team-wang/_components/wang-idag-trening/it-ui";
import type { WangSkjermKontekst } from "@/app/team-wang/_components/wang-idag-trening/it-ui";
import { WangDemoMerknad, WangFeil, WangKnapp, WangStatus, type WangStatusTone } from "@/components/wang/trener/wang-ui";
import { elevprofilHref, wangHref } from "@/lib/wang/wang-ruter";

/** WANG-18 Øktdetalj. Fasit: «WANG Golf Batch 6.dc.html» #kalender/[id] (6cfa623c). Rute: /team-wang/trening/okter/[oktId] */
export async function WangOktDetalj({ gruppe, erDemo, oktId }: WangSkjermKontekst & { oktId: string }) {
  const naa = new Date();

  const last = await lastTrygt(async () => {
    const okt = await hentOktIGruppe(gruppe.id, oktId);
    if (!okt) return null;
    const elever = await hentGruppeElever(gruppe.id);
    const sammeDag = await hentElevOkter(elever.map((e) => e.id), okt.dato, okt.dato);
    const slot = gruppeokter(sammeDag).find((g) => g.dato === okt.dato && g.startMin === okt.startMin);
    const innhold = await hentOktInnhold(okt.id);
    return { okt, elever, slot, innhold };
  });

  const tilbake = (
    <Link href={wangHref("WANG-18")} className={s.lenke}>
      <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" />
      Alle økter
    </Link>
  );

  if (!last.ok) {
    return (
      <div className={s.stabel16}>
        <div>{tilbake}</div>
        <WangFeil tittel="Vi fikk ikke hentet økta." tekst="Økta er ikke borte. Prøv igjen om litt." handling={<WangKnapp href={wangHref("WANG-18")}>Tilbake til øktene</WangKnapp>} />
      </div>
    );
  }
  if (!last.data) notFound();

  const { okt, elever, slot, innhold } = last.data;
  const deltakere = slot?.okter ?? [okt];
  const navn = new Map(elever.map((e) => [e.id, e.navn]));
  const forfalt = erForfalt(okt, naa);
  const status = slotStatus(deltakere, forfalt);
  const totMin = innhold.reduce((a, b) => a + b.minutter, 0);
  const omrader = slot?.omrader ?? (somOmrade(okt.omrade) ? [somOmrade(okt.omrade)!] : []);
  const hensikt = unike(deltakere.map((o) => o.maal));
  const ukeForskyvning = Math.round(dagerMellom(mandagI(osloIso(naa)), mandagI(okt.dato)) / 7);

  return (
    <div className={s.stabel16}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "space-between" }}>
        {tilbake}
        {ukeForskyvning !== 0 ? (
          <Link href={wangHref("WANG-18", {}, { uke: String(ukeForskyvning) })} className={s.lenke}>Uka økta ligger i</Link>
        ) : null}
      </div>
      {erDemo ? <WangDemoMerknad /> : null}
      <article className={s.detalj} aria-label={slot?.tittel ?? okt.tittel}>
        <div className={s.detaljTopp}>
          <p className={s.tall} style={{ margin: 0, flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 500, color: "var(--wtr-text-muted)" }}>
            WANG-18 · {dagOgDato(okt.dato)} · {tidsrom(okt.startMin, okt.varighetMin)}
          </p>
        </div>
        <div className={s.detaljKropp}>
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <WangStatus tone={status.tone}>{status.tekst}</WangStatus>
              <span className={s.meta} style={{ fontSize: 12.5 }}>{gruppe.name}</span>
            </div>
            <h1 className={s.detaljTittel}>{slot?.tittel ?? okt.tittel}</h1>
          </div>

          {deltakere.every(erUpublisert) ? <p className={s.infoBoks}>Treneren har ikke publisert innhold for denne økta ennå.</p> : null}

          <section style={{ display: "grid", gap: 6 }}>
            <p className={s.seksjonTittel} style={{ margin: 0 }}>Hensikt</p>
            {hensikt.length > 0 ? (
              hensikt.map((h) => (
                <p key={h} style={{ margin: 0, display: "flex", alignItems: "center", gap: 6, fontSize: 17, lineHeight: 1.55, color: "var(--wtr-blue)" }}>
                  <Target size={16} strokeWidth={1.5} aria-hidden="true" style={{ flex: "none" }} />
                  {h}
                </p>
              ))
            ) : (
              <p style={{ margin: 0, fontSize: 17, lineHeight: 1.55, color: "var(--wtr-text-muted)" }}>Ingen hensikt skrevet for økta.</p>
            )}
          </section>

          <section className={s.boks}>
            <div className={s.boksHode} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <span className={s.meta} style={{ color: "var(--wtr-blue)" }}>Innhold</span>
              <span className={s.tall} style={{ fontSize: 13, fontWeight: 500, color: "var(--wtr-text-muted)" }}>{totMin > 0 ? `${totMin} min` : "—"}</span>
            </div>
            {innhold.length === 0 ? (
              <p className={s.boksRad} style={{ margin: 0, display: "block", fontSize: 15, color: "var(--wtr-text-muted)" }}>Ingen øvelser lagt inn i økta.</p>
            ) : (
              innhold.map((b) => (
                <div key={b.id} style={{ borderTop: "1px solid var(--wtr-grey-line)", padding: "12px 16px", display: "grid", gridTemplateColumns: "56px minmax(0,1fr)", gap: 12 }}>
                  <span className={s.tall} style={{ fontSize: 16, fontWeight: 700, color: "var(--wtr-blue)" }}>
                    {b.minutter}
                    <span style={{ fontSize: 11, fontWeight: 500, color: "var(--wtr-text-muted)" }}> min</span>
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontFamily: "var(--wtr-font-display)", fontSize: 14, fontWeight: 500, color: "var(--wtr-blue)" }}>{b.tittel}</span>
                    {b.beskrivelse ? <span style={{ display: "block", fontSize: 15, lineHeight: 1.45, color: "var(--wtr-blue)" }}>{b.beskrivelse}</span> : null}
                  </span>
                </div>
              ))
            )}
          </section>

          <section className={s.fakta}>
            <div><span className={s.faktaK}>Tid</span><span className={s.faktaV}>{dagOgDato(okt.dato)} · {tidsrom(okt.startMin, okt.varighetMin)}</span></div>
            <div><span className={s.faktaK}>Sted</span><span className={s.faktaV}>{slot?.sted ?? okt.sted ?? "—"}</span></div>
            <div><span className={s.faktaK}>Område</span><span className={s.faktaV}>{omrader.length ? omrader.map((o) => `${o} · ${OMRADE_NAVN[o]}`).join(", ") : "—"}</span></div>
          </section>

          <section className={s.boks}>
            <div className={s.boksHode}>
              <span className={s.meta} style={{ color: "var(--wtr-blue)" }}>Elevene i økta</span>
              <span className={s.meta} style={{ fontSize: 12 }}>Eleven registrerer gjennomføring i PlayerHQ</span>
            </div>
            {deltakere.map((d) => {
              const st = elevStatus(d, forfalt);
              return (
                <div key={d.id} className={s.boksRad}>
                  <span style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "baseline", minWidth: 0 }}>
                    <Link href={elevprofilHref(d.elevId)} className={s.navnLenke} style={{ fontSize: 13.5 }}>{navn.get(d.elevId) ?? "Ukjent elev"}</Link>
                    {somOmrade(d.omrade) ? <span className={s.ptag}>{somOmrade(d.omrade)}</span> : null}
                  </span>
                  <WangStatus tone={st.tone}>{st.tekst}</WangStatus>
                </div>
              );
            })}
          </section>
        </div>
      </article>
    </div>
  );
}

function unike(v: Array<string | null>): string[] {
  return [...new Set(v.map((x) => x?.trim()).filter((x): x is string => !!x))];
}

function elevStatus(o: WangOkt, forfalt: boolean): { tone: WangStatusTone; tekst: string } {
  if (erGjennomfort(o)) return { tone: "ferdig", tekst: "Gjennomført" };
  if (erAvvist(o)) return { tone: "fravaer", tekst: "Ikke gjennomført" };
  if (o.status === "IN_PROGRESS") return { tone: "pagar", tekst: "Pågår" };
  if (erUpublisert(o)) return { tone: "planlagt", tekst: "Ikke publisert" };
  return forfalt ? { tone: "varsel", tekst: "Ikke ført" } : { tone: "planlagt", tekst: "Planlagt" };
}

function slotStatus(okter: WangOkt[], forfalt: boolean): { tone: WangStatusTone; tekst: string } {
  if (okter.every(erUpublisert)) return { tone: "planlagt", tekst: "Ikke publisert" };
  if (okter.some((o) => o.status === "IN_PROGRESS")) return { tone: "pagar", tekst: "Pågår" };
  if (!forfalt) return { tone: "planlagt", tekst: "Planlagt" };
  const gjort = okter.filter(erGjennomfort).length;
  return { tone: gjort > 0 ? "ferdig" : "varsel", tekst: `${gjort} av ${okter.length} gjennomført` };
}
