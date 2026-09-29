import { MapPin } from "lucide-react";

import { erTurneringstittel } from "@/app/team-wang/_data/live-sesong";
import { hendelserMellom, hentElevOkter, hentGruppeElever, hentGruppeplan } from "@/app/team-wang/_data/wang-idag-trening-data";
import {
  DAG_LANG,
  ddmm,
  ddmmaaaa,
  erAvvist,
  erForfalt,
  erGjennomfort,
  erMorgenokt,
  gruppeokter,
  isoUke,
  leggTilDager,
  lesHeltall,
  mandagI,
  osloIso,
  tidsrom,
  ukedag,
} from "@/app/team-wang/_data/wang-trening-beregning";
import { Chips, Sidehode, it as s, lastTrygt } from "@/app/team-wang/_components/wang-idag-trening/it-ui";
import type { WangSkjermKontekst } from "@/app/team-wang/_components/wang-idag-trening/it-ui";
import { WangDemoMerknad, WangFeil, WangKnapp, WangStatus, WangTom } from "@/components/wang/trener/wang-ui";
import { wangHref } from "@/lib/wang/wang-ruter";

type Sok = { uke?: string | string[] };
type Hendelsestype = "morgen" | "skole" | "klubb" | "egen" | "turn";

const LEGENDE: Array<{ type: Hendelsestype; navn: string }> = [
  { type: "morgen", navn: "Morgentrening" },
  { type: "skole", navn: "Skole" },
  { type: "klubb", navn: "Trening" },
  { type: "turn", navn: "Turnering" },
];

/** WG-01 Morgentrening og uke. Fasit: «WANG Golf.dc.html» #uke (6cfa623c). Rute: /team-wang/i-dag/uke */
export async function WangMorgenUke({ gruppe, erDemo, sok }: WangSkjermKontekst & { sok: Sok }) {
  const naa = new Date();
  const idag = osloIso(naa);
  const forskyvning = lesHeltall(sok.uke, 0, -26, 26);
  const mandag = leggTilDager(mandagI(idag), forskyvning * 7);
  const fredag = leggTilDager(mandag, 4);
  const sondag = leggTilDager(mandag, 6);
  const meta = `WG-01 · Uke ${isoUke(mandag)} · ${ddmm(mandag)}–${ddmmaaaa(fredag)}`;
  const valg = [
    { href: wangHref("WG-01", {}, { uke: String(forskyvning - 1) }), etikett: "Forrige uke", aktiv: false },
    { href: wangHref("WG-01"), etikett: "Denne uka", aktiv: forskyvning === 0 },
    { href: wangHref("WG-01", {}, { uke: String(forskyvning + 1) }), etikett: "Neste uke", aktiv: false },
  ];

  const last = await lastTrygt(async () => {
    const [elever, plan] = await Promise.all([hentGruppeElever(gruppe.id), hentGruppeplan(gruppe.id, idag)]);
    const okter = await hentElevOkter(elever.map((e) => e.id), mandag, sondag);
    return { elever, plan, okter };
  });

  if (!last.ok) {
    return (
      <div className={s.stabel} style={{ gap: 28 }}>
        <Sidehode meta={meta} tittel="Morgentrening og uke" />
        <WangFeil tittel="Vi fikk ikke hentet uka." tekst="Planen er ikke borte. Prøv igjen om litt." handling={<WangKnapp href={wangHref("WG-01")}>Prøv igjen</WangKnapp>} />
      </div>
    );
  }
  const { elever, plan, okter } = last.data;
  const navn = new Map(elever.map((e) => [e.id, e.navn]));
  const slots = gruppeokter(okter);
  const hendelser = hendelserMellom(plan.hendelser, mandag, sondag);

  // Morgentreninger: elevøktene før kl. 10, ellers gruppas faste morgentider.
  const morgenSlots = slots.filter(erMorgenokt);
  const fasteMorgen = hendelser.filter((h) => h.ukentlig && h.startMin < 600);
  type Morgenkort = { key: string; dato: string; tid: string; sted: string | null; innhold: string; status: { tone: "planlagt" | "ferdig" | "varsel"; tekst: string }; oppmote: string; fravaer: string };
  const morgen: Morgenkort[] = morgenSlots.length
    ? morgenSlots.map((g) => {
        const gjort = g.okter.filter(erGjennomfort).length;
        const borte = g.okter.filter(erAvvist).map((o) => navn.get(o.elevId) ?? "Ukjent elev");
        const forfalt = erForfalt(g, naa);
        const maal = [...new Set(g.okter.map((o) => o.maal).filter((m): m is string => !!m))];
        return {
          key: g.key,
          dato: g.dato,
          tid: tidsrom(g.startMin, g.varighetMin),
          sted: g.sted,
          innhold: maal[0] ?? `${g.tittel}${g.omrader.length ? ` · ${g.omrader.join(", ")}` : ""}`,
          status: forfalt ? { tone: gjort > 0 ? "ferdig" : "varsel", tekst: gjort > 0 ? "Gjennomført" : "Ikke ført" } : { tone: "planlagt", tekst: "Planlagt" },
          oppmote: `${gjort} av ${g.okter.length} gjennomført`,
          fravaer: borte.length ? `${borte.length} ikke gjennomført: ${borte.join(", ")}` : "Ingen meldt fravær",
        };
      })
    : fasteMorgen.map((h) => ({
        key: `${h.id}-${h.dato}`,
        dato: h.dato,
        tid: `${tidsrom(h.startMin, Math.max(0, h.sluttMin - h.startMin))}`,
        sted: h.sted,
        innhold: h.tittel,
        status: { tone: "planlagt" as const, tekst: "Fast tid" },
        oppmote: "Ingen elevøkter lagt inn",
        fravaer: "Oppmøte kommer fra elevenes økter i PlayerHQ",
      }));

  const nesteMorgen = morgenSlots.find((g) => !erForfalt(g, naa)) ?? null;
  const fokusTekst = nesteMorgen ? [...new Set(nesteMorgen.okter.map((o) => o.maal).filter((m): m is string => !!m))][0] ?? null : null;

  // Ukeplan per dag.
  type Punkt = { key: string; tid: string; tittel: string; sted: string | null; type: Hendelsestype; start: number };
  const dager = Array.from({ length: 7 }, (_, i) => leggTilDager(mandag, i));
  const punkter = (dato: string): Punkt[] => {
    const ut: Punkt[] = [];
    for (const g of slots.filter((x) => x.dato === dato)) ut.push({ key: g.key, tid: tidsrom(g.startMin, g.varighetMin), tittel: g.tittel, sted: g.sted, type: erMorgenokt(g) ? "morgen" : "klubb", start: g.startMin });
    for (const h of hendelser.filter((x) => x.dato === dato)) {
      if (h.ukentlig && slots.some((g) => g.dato === dato)) continue; // elevøktene viser allerede dagen
      ut.push({ key: `${h.id}-${dato}`, tid: h.fra === h.til ? tidsrom(h.startMin, Math.max(0, h.sluttMin - h.startMin)) : `${ddmm(h.fra)}–${ddmm(h.til)}`, tittel: h.tittel.replace(/^Turnering:\s*/, ""), sted: h.sted, type: erTurneringstittel(h.tittel) ? "turn" : h.startMin < 600 ? "morgen" : "klubb", start: h.startMin });
    }
    for (const d of plan.skoledager.filter((x) => x.dato === dato)) ut.push({ key: `s-${d.dato}-${d.tittel}`, tid: "Hele dagen", tittel: d.tittel, sted: d.klassetrinn, type: "skole", start: -1 });
    return ut.sort((a, b) => a.start - b.start);
  };
  const synligeDager = dager.filter((d, i) => i < 5 || punkter(d).length > 0);

  return (
    <div className={s.stabel} style={{ gap: 28 }}>
      <Sidehode
        meta={meta}
        tittel={`Uke ${isoUke(mandag)}. ${morgen.length === 0 ? "Ingen morgentreninger" : `${morgen.length} ${morgen.length === 1 ? "morgentrening" : "morgentreninger"}`}, ${elever.length} ${elever.length === 1 ? "elev" : "elever"}.`}
        undertittel="Gjennomføring og fravær kommer fra elevenes økter i PlayerHQ."
        hoyre={<Chips valg={valg} etikett="Uke" />}
      />
      {erDemo ? <WangDemoMerknad /> : null}

      {nesteMorgen ? (
        <section className={s.fokusHero} aria-label="Neste morgentrening">
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--wtr-font-display)", fontSize: 12, fontWeight: 500 }}>Fokus på neste morgentrening</span>
            <span className={s.tall} style={{ fontSize: 12, opacity: 0.85 }}>{DAG_LANG[ukedag(nesteMorgen.dato)]} {ddmm(nesteMorgen.dato)} · {tidsrom(nesteMorgen.startMin, nesteMorgen.varighetMin)}</span>
          </div>
          <p className={s.fokusTekst}>{fokusTekst ?? `${nesteMorgen.tittel}. Ingen hensikt skrevet for økta ennå.`}</p>
        </section>
      ) : null}

      <section style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <h2 className={s.h2stor}>Morgentreninger denne uken</h2>
          <span className={s.tall} style={{ fontSize: 13, fontWeight: 500, color: "var(--wtr-text-muted)" }}>Økter som starter før kl. 10</span>
        </div>
        {morgen.length === 0 ? (
          <section className={s.kort}>
            <WangTom tittel="Ingen morgentreninger denne uka." tekst="Verken elevøktene eller gruppas faste tider har morgentrening i uka." />
          </section>
        ) : (
          <div className={s.g2}>
            {morgen.map((m) => (
              <article key={m.key} className={s.morgenKort}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <p style={{ margin: 0, fontFamily: "var(--wtr-font-display)", fontWeight: 500, fontSize: 17, color: "var(--wtr-blue)" }}>{DAG_LANG[ukedag(m.dato)]} {ddmm(m.dato)}</p>
                    <p className={s.tall} style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 300, color: "var(--wtr-blue)" }}>{m.tid}</p>
                  </div>
                  <WangStatus tone={m.status.tone}>{m.status.tekst}</WangStatus>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }} className={s.meta}>
                  <MapPin size={16} strokeWidth={1.5} aria-hidden="true" />
                  {m.sted ?? "Sted ikke satt"}
                </div>
                <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, color: "var(--wtr-blue)" }}>{m.innhold}</p>
                <div className={s.morgenFot}>
                  <span>{m.oppmote}</span>
                  <span className={s.fravaer}>{m.fravaer}</span>
                  <span style={{ flexBasis: "100%", fontSize: 12 }}>Eleven registrerer dette i PlayerHQ</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <h2 className={s.h2stor}>Ukeplan</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }} className={s.meta}>
            {LEGENDE.map((l) => (
              <span key={l.type} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                <span className={`${s.evRute} ${s[`ev-${l.type}`]}`} style={{ border: "1px solid transparent" }} />
                {l.navn}
              </span>
            ))}
          </div>
        </div>
        <div className={s.week}>
          {synligeDager.map((dato) => {
            const p = punkter(dato);
            return (
              <div key={dato} className={s.weekDag}>
                <p style={{ margin: "0 0 4px", display: "flex", justifyContent: "space-between", fontFamily: "var(--wtr-font-display)", fontWeight: 500, fontSize: 14, color: "var(--wtr-blue)" }}>
                  <span>{DAG_LANG[ukedag(dato)]}</span>
                  <span className={s.tall} style={{ color: "var(--wtr-text-muted)", fontSize: 13 }}>{ddmm(dato)}</span>
                </p>
                {p.map((x) => (
                  <div key={x.key} className={`${s.ev} ${s[`ev-${x.type}`]}`}>
                    <p className={s.evTid}>{x.tid}</p>
                    <p className={s.evTittel}>{x.tittel}</p>
                    {x.sted ? <p className={s.evSted}>{x.sted}</p> : null}
                  </div>
                ))}
                {p.length === 0 ? <p className={s.fri}>Ingenting planlagt</p> : null}
              </div>
            );
          })}
        </div>
        <p className={s.fot}>Skoletimene per fag ligger ikke i appen ennå. Skole viser bare skoleruta (ferier, planleggingsdager og prøver).</p>
      </section>
    </div>
  );
}
