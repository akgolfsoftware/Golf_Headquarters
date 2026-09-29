import type { Metadata } from "next";

import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { meStil as s } from "@/app/team-wang/_components/wang-meldinger-elever/felles";
import { WangDemoMerknad, WangKort, WangLenke, WangSide, WangSidehode, WangTom } from "@/components/wang/trener/wang-ui";
import { wangHref } from "@/lib/wang/wang-ruter";

/**
 * WANG-46 Forslag til elev. Rute: /team-wang/elever/forslag. Tegning: «WANG Golf Elevprofil.dc.html» #forslag.
 * Forslag fra trener til elev (plan, IUP, samtale, vurdering) med svar fra
 * eleven har ingen modell ennå. `PlanSuggestion` gjelder teknisk plan og
 * brukes ikke her.
 */
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Forslag til elev — WANG Golf", robots: { index: false, follow: false } };

export default async function WangForslagSide() {
  const { bruker, erDemo } = await krevWangTrener();
  return (
    <WangSide>
      <WangSidehode
        skjermId="WANG-46"
        undertittel={bruker.name?.trim() || bruker.email}
        tittel="Forslag til elev"
        ingress="Forslag du har sendt til elever, med svar."
      />
      {erDemo ? <WangDemoMerknad /> : null}
      <WangKort>
        <WangTom
          tittel="Ingen forslag sendt."
          tekst="Forslag til elev er ikke på plass ennå. Når det finnes, sender du forslaget fra elevprofilen, og det står som Venter til eleven godtar eller avviser."
          handling={<WangLenke href={wangHref("WANG-07")}>Se elevene</WangLenke>}
        />
      </WangKort>
      <p className={s.fot}>Treneren endrer ikke plan, IUP, vurdering eller samtale direkte. Forslaget går til eleven i PlayerHQ.</p>
    </WangSide>
  );
}
