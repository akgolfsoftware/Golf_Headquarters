/**
 * PlayerHQ · Ett område (/portal/statistikk/[metric]) i nytt design (pakke 13, Stats resten).
 * Fasit: docs/design-system/utkast-playerhq/stats-resten.html, malen «omrade».
 * Avvik:
 *   - står øverst i PH16cOmrade.tsx.
 *
 * Adressene er de samme som før: fem akser (fys, tek, slag, spill, turn), fire SG-områder
 * (sg-tee, sg-approach, sg-around-green, sg-putting) og de gamle aliasene. Ukjent område gir 404.
 */
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH16cOmrade, type PH16cOmradeData } from "@/components/portal/precision/PH16cOmrade";
import { getUnreadNotifications } from "@/app/portal/actions";
import { etterlevelseFra } from "@/lib/domain/etterlevelse";
import { hentEffektivNaa } from "@/lib/testing/dato-override";
import { loadVisibleSessionRange } from "@/lib/portal/visible-session-range";
import { loadPH16Stats } from "@/lib/portal-analyse/load-ph16-stats";
import { hentSgRunder, hentTreningPerSone } from "@/lib/portal-analyse/load-omrade";
import { AKSE_INFO, byggOmradeAkse, byggOmradeSg, type OmradeAkse, type SgGruppe } from "@/lib/portal-analyse/omrade-data";

export const dynamic = "force-dynamic";

type Omrade = { slug: string } & ({ type: "akse"; akse: OmradeAkse } | { type: "sg"; gruppe: SgGruppe });

const OMRADER: Record<string, Omrade> = {
  fys: { slug: "fys", type: "akse", akse: "fys" },
  tek: { slug: "tek", type: "akse", akse: "tek" },
  slag: { slug: "slag", type: "akse", akse: "slag" },
  spill: { slug: "spill", type: "akse", akse: "spill" },
  turn: { slug: "turn", type: "akse", akse: "turn" },
  "sg-tee": { slug: "sg-tee", type: "sg", gruppe: "tee" },
  "sg-approach": { slug: "sg-approach", type: "sg", gruppe: "innspill" },
  "sg-around-green": { slug: "sg-around-green", type: "sg", gruppe: "naer" },
  "sg-putting": { slug: "sg-putting", type: "sg", gruppe: "putt" },
};

// Gamle adresser som fortsatt skal virke.
const ALIASER: Record<string, string> = {
  putts: "sg-putting",
  "sg-ott": "sg-tee",
  "sg-app": "sg-approach",
  "sg-arg": "sg-around-green",
  "sg-putt": "sg-putting",
};

export async function generateMetadata({ params }: { params: Promise<{ metric: string }> }) {
  const { metric } = await params;
  const o = OMRADER[ALIASER[metric] ?? metric];
  const navn = !o ? "Område" : o.type === "akse" ? AKSE_INFO[o.akse].kode : { tee: "Utslag", innspill: "Innspill", naer: "Nærspill", putt: "Putting" }[o.gruppe];
  return { title: `${navn} · Stats · PlayerHQ` };
}

export default async function OmradePage({ params }: { params: Promise<{ metric: string }> }) {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  const { metric } = await params;
  const omrade = OMRADER[ALIASER[metric] ?? metric];
  if (!omrade) notFound();

  const naa = await hentEffektivNaa(user.email);
  const fra = etterlevelseFra(naa);
  const kort = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short" });
  const periode = `${kort.format(fra)}–${kort.format(naa)}`;

  let data: PH16cOmradeData;
  let uleste: number;
  if (omrade.type === "akse") {
    const [okter, ulest] = await Promise.all([
      loadVisibleSessionRange(user.id, fra.toISOString(), naa.toISOString()),
      getUnreadNotifications(user.id, 1),
    ]);
    uleste = ulest.count;
    data = {
      type: "akse",
      akse: byggOmradeAkse(
        okter.map((o) => ({ start: o.startTime.toISOString(), min: o.durationMin, status: o.status, akse: o.pyramidArea.toLowerCase() as OmradeAkse, drills: o.drills })),
        omrade.akse, naa, periode,
      ),
    };
  } else {
    const [stats, runder, trening, ulest] = await Promise.all([
      loadPH16Stats(user.id, user.name),
      hentSgRunder(user.id),
      hentTreningPerSone(user.id, fra, naa),
      getUnreadNotifications(user.id, 1),
    ]);
    uleste = ulest.count;
    data = {
      type: "sg",
      sg: byggOmradeSg({ stats, runder, gruppe: omrade.gruppe, trening: trening[omrade.gruppe], treningPeriode: periode }),
      fokusHref: `/portal/coach/melding?type=fokus&omrade=${omrade.slug}`,
    };
  }

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH16cOmrade data={data} />
    </PlayerHQSkall>
  );
}
