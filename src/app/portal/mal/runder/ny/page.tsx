// PH09NyRunde — Precision Athletics. Data og handlinger er beholdt. Ikke målt i appen.
/**
 * PlayerHQ Loggfør runde — totalscore/scorekort og valgfri manuell SG.
 * RundeNyForm deler SG-felt og validering med redigeringen på rundedetaljen.
 */

import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { Caps, Tittel, MikroMeta, Kort, StatusPill } from "@/components/v2";
import { TL } from "@/lib/v2/train-lock";

import { RundeNyForm, type RundeNyFormFlyt } from "@/components/portal/runde-ny/runde-ny-form";
import { sisteSpilteBaneId } from "@/lib/portal/siste-spilte-bane";
import { medForst } from "@/lib/portal/baneliste-med-prefill";
import { RUNDE_DATAQUALITY_META } from "@/lib/runde-logg/kontrakt";
import { PHRD01MedKladd } from "@/components/portal/precision/PHRD01VelgNiva";
import { PH09RegistrerRunde } from "@/components/portal/precision/PH09RegistrerRunde";
import { loadPh0809Data } from "@/lib/portal-runder/load-ph08-09";

type NyRundeFlyt = RundeNyFormFlyt | "slag";

const FLYT_META: Record<NyRundeFlyt, {
  label: string;
  kort: string;
  data: string;
  resultat: string;
  href: string;
}> = {
  total: {
    label: "Kun totalscore",
    kort: "Rask historikk",
    data: "Dato, bane og brutto score",
    resultat: RUNDE_DATAQUALITY_META.total_only.forklaring,
    href: "/portal/mal/runder/ny?flyt=total",
  },
  scorekort: {
    label: "Scorekort",
    kort: "Hull for hull",
    data: "Par og brutto slag per hull",
    resultat: RUNDE_DATAQUALITY_META.hullscore.forklaring,
    href: "/portal/mal/runder/ny?flyt=scorekort",
  },
  detaljer: {
    label: "Scorekort med detaljer",
    kort: "Putter · FW · GIR",
    data: "Hullscore, putter, fairway og GIR",
    resultat: RUNDE_DATAQUALITY_META.hullscore_detaljer.forklaring,
    href: "/portal/mal/runder/ny?flyt=detaljer",
  },
  sg: {
    label: "Importert/manuell SG",
    kort: "SG fra annen app",
    data: "Score pluss SG total, kategorier eller detaljer",
    resultat: RUNDE_DATAQUALITY_META.manuell_sg.forklaring,
    href: "/portal/mal/runder/ny?flyt=sg",
  },
  slag: {
    label: "Slag-for-slag komplett",
    kort: "Full SG",
    data: "Hvert slag, straff, lie og avstand til pin",
    resultat: RUNDE_DATAQUALITY_META.slag_for_slag_komplett.forklaring,
    href: "/portal/mal/runder/ny?flyt=slag",
  },
};

const FLYT_ORDER: NyRundeFlyt[] = ["total", "scorekort", "detaljer", "sg", "slag"];

function lesFlyt(value: string | string[] | undefined): NyRundeFlyt {
  const v = Array.isArray(value) ? value[0] : value;
  return FLYT_ORDER.includes(v as NyRundeFlyt) ? (v as NyRundeFlyt) : "total";
}

export default async function NyRundePage({
  searchParams,
}: {
  searchParams: Promise<{ flyt?: string | string[] | undefined }>;
}) {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  const rawFlyt = (await searchParams).flyt;

  // Uten valgt flyt: PH-RD-01, velg registreringsnivå (Precision Athletics).
  // Adressene med ?flyt= (scorekort, SG, total, detaljer, slag) virker som før.
  if (rawFlyt === undefined) {
    let tilstand: "data" | "tom" | "feil" = "data";
    let uleste = 0;
    try {
      const [antallBaner, ul] = await Promise.all([
        prisma.courseDefinition.count(),
        prisma.notification.count({ where: { userId: user.id, readAt: null } }),
      ]);
      uleste = ul;
      if (antallBaner === 0) tilstand = "tom";
    } catch (feil) {
      console.error("PH-RD-01: kunne ikke hente baner", feil);
      tilstand = "feil";
    }
    return <PHRD01MedKladd tilstand={tilstand} uleste={uleste} />;
  }

  const flyt = lesFlyt(rawFlyt);
  const [alleCourses, sisteBaneId, ph0809Data] = await Promise.all([
    prisma.courseDefinition.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, par: true },
    }),
    sisteSpilteBaneId(user.id),
    loadPh0809Data(user.id),
  ]);
  // Prefill (flytpakke 2, 2.5): sist spilte bane foreslås øverst.
  const courses = medForst(alleCourses, sisteBaneId);

  return (
        <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <div className="pa-side">
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Link href="/portal/mal/runder" style={{ textDecoration: "none", alignSelf: "flex-start" }}>
          <MikroMeta icon="arrow-left">Alle runder</MikroMeta>
        </Link>

        <div>
          <Caps>Analysere · Runder · Ny</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em="runde.">Loggfør</Tittel>
          </div>
        </div>

        <section aria-labelledby="runde-datagrunnlag">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h2 id="runde-datagrunnlag" style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 650, color: TL.text }}>
                Velg datagrunnlag
              </h2>
              <p style={{ margin: "4px 0 0", fontFamily: TL.font.sans, fontSize: 13, lineHeight: 1.5, color: TL.mute }}>
                Jo mer du logger, jo mer kan PlayerHQ beregne. All score er brutto.
              </p>
            </div>
            <StatusPill tone={flyt === "slag" ? "up" : flyt === "sg" ? "info" : "warn"}>
              {FLYT_META[flyt].kort}
            </StatusPill>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 10, marginTop: 12 }}>
            {FLYT_ORDER.map((id) => {
              const valgt = id === flyt;
              const meta = FLYT_META[id];
              return (
                <Link
                  key={id}
                  href={meta.href}
                  style={{
                    minHeight: 132,
                    borderRadius: 8,
                    border: `1px solid ${valgt ? TL.fill : TL.hair}`,
                    background: valgt ? TL.dock : TL.elev,
                    color: TL.text,
                    padding: "14px 16px",
                    textDecoration: "none",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <h3 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 15, fontWeight: 650, color: TL.text }}>
                        {meta.label}
                      </h3>
                      {valgt && <StatusPill tone="up">Valgt</StatusPill>}
                    </div>
                    <p style={{ margin: "6px 0 0", fontFamily: TL.font.sans, fontSize: 12.5, lineHeight: 1.45, color: TL.mute }}>
                      {meta.data}
                    </p>
                  </div>
                  <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 12, lineHeight: 1.45, color: TL.mute }}>
                    {meta.resultat}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <div style={{ maxWidth: 760 }}>
          {flyt === "slag" ? (
            <Kort pad="18px 20px">
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <h2 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 650, color: TL.text }}>
                    Slag-for-slag gir beregnet SG
                  </h2>
                  <p style={{ margin: "6px 0 0", fontFamily: TL.font.sans, fontSize: 13, lineHeight: 1.55, color: TL.mute }}>
                    Før hvert slag med avstand til pin, straff og lie. Da kan systemet beregne SG automatisk uten å gjette.
                  </p>
                </div>
                <Link
                  href="/portal/runde/live"
                  style={{
                    minHeight: 52,
                    borderRadius: 999,
                    background: TL.fill,
                    color: TL.onFill,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: TL.font.sans,
                    fontSize: 15,
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Start slag-for-slag
                </Link>
                <Link href="/portal/runde/logg" style={{ color: TL.mute, fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, textAlign: "center", textDecoration: "none" }}>
                  Har bare score? Etterregistrer scorekort i stedet
                </Link>
              </div>
            </Kort>
          ) : flyt === "scorekort" ? (
            <PH09RegistrerRunde data={ph0809Data} />
          ) : (
            <RundeNyForm courses={courses} initialFlyt={flyt} />
          )}
        </div>
      </div>
          </div>
    </PlayerHQSkall>
  );
}
