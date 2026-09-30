import type { Metadata } from "next";

import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { hentGruppeElever } from "@/app/team-wang/_data/wang-idag-trening-data";
import { lastTrygt } from "@/app/team-wang/_components/wang-idag-trening/it-ui";
import { meStil as s } from "@/app/team-wang/_components/wang-meldinger-elever/felles";
import { ForslagListe } from "@/app/team-wang/_components/wang-oppfolging/oppfolging-visning";
import { opprettWangForslag } from "@/app/team-wang/(trener)/elever/oppfolging-actions";
import { ForslagSkjema } from "@/components/oppfolging/oppfolging-skjema";
import { WangDemoMerknad, WangFeil, WangKort, WangLenke, WangSide, WangSidehode } from "@/components/wang/trener/wang-ui";
import { hentForslag } from "@/lib/oppfolging/data";
import { wangHref } from "@/lib/wang/wang-ruter";

/**
 * WANG-46 Forslag til elev. Rute: /team-wang/elever/forslag. Tegning: «WANG Golf Elevprofil.dc.html» #forslag.
 * Forslag fra trener til elev (plan, IUP, samtale, vurdering) med svar fra
 * eleven, fra tabellen `trener_forslag`. `PlanSuggestion` gjelder teknisk plan
 * og brukes ikke her.
 */
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Forslag til elev — WANG Golf", robots: { index: false, follow: false } };

export default async function WangForslagSide() {
  const { bruker, gruppe, erDemo } = await krevWangTrener();
  const k = { flate: "WANG", groupId: gruppe.id, trenerId: bruker.id } as const;
  const last = await lastTrygt(async () => {
    const [forslag, elever] = await Promise.all([hentForslag(k), hentGruppeElever(gruppe.id)]);
    return { forslag, elever };
  });

  return (
    <WangSide>
      <WangSidehode
        skjermId="WANG-46"
        undertittel={bruker.name?.trim() || bruker.email}
        tittel="Forslag til elev"
        ingress="Forslag du har sendt til elever, med svar."
      />
      {erDemo ? <WangDemoMerknad /> : null}
      {!last.ok ? (
        <WangFeil tekst="Ingenting er borte. Forslagene ligger lagret. Last siden på nytt om litt." />
      ) : (
        <>
          <WangKort tittel="Sendte forslag" meta={String(last.data.forslag.length)}>
            <ForslagListe forslag={last.data.forslag} />
          </WangKort>
          {last.data.elever.length > 0 ? (
            <ForslagSkjema flate="WANG" person="elev" elever={last.data.elever.map((e) => ({ id: e.id, navn: e.navn }))} action={opprettWangForslag} />
          ) : (
            <WangLenke href={wangHref("WANG-07")}>Se elevene</WangLenke>
          )}
        </>
      )}
      <p className={s.fot}>Treneren endrer ikke plan, IUP, vurdering eller samtale direkte. Forslaget går til eleven i PlayerHQ.</p>
    </WangSide>
  );
}
