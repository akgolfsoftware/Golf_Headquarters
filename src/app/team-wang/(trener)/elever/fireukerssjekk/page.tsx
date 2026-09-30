import type { Metadata } from "next";

import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { hentGruppeElever } from "@/app/team-wang/_data/wang-idag-trening-data";
import { osloIso } from "@/app/team-wang/_data/wang-trening-beregning";
import { lastTrygt } from "@/app/team-wang/_components/wang-idag-trening/it-ui";
import { meStil as s } from "@/app/team-wang/_components/wang-meldinger-elever/felles";
import { SamtaleListe, SjekkListe } from "@/app/team-wang/_components/wang-oppfolging/oppfolging-visning";
import { opprettWangSamtale } from "@/app/team-wang/(trener)/elever/oppfolging-actions";
import { SamtaleSkjema } from "@/components/oppfolging/oppfolging-skjema";
import { WangDemoMerknad, WangFeil, WangKort, WangLenke, WangSide, WangSidehode } from "@/components/wang/trener/wang-ui";
import { hentFireukerssjekker, hentSamtaler } from "@/lib/oppfolging/data";
import { wangHref } from "@/lib/wang/wang-ruter";

/**
 * WANG-45 Fireukerssjekk. Rute: /team-wang/elever/fireukerssjekk. Tegning: «WANG Golf Elevprofil.dc.html» #sjekk.
 * Elevens innleveringer (prosessmål og Team Norways utviklingssjekk) og
 * samtalene etterpå, fra tabellene `fireukerssjekker` og `elev_samtaler`.
 */
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Fireukerssjekk — WANG Golf", robots: { index: false, follow: false } };

export default async function WangFireukerssjekkSide() {
  const { bruker, gruppe, erDemo } = await krevWangTrener();
  const k = { flate: "WANG", groupId: gruppe.id, trenerId: bruker.id } as const;
  const naa = new Date();
  const last = await lastTrygt(async () => {
    const [sjekker, samtaler, elever] = await Promise.all([hentFireukerssjekker(k, naa), hentSamtaler(k), hentGruppeElever(gruppe.id)]);
    return { sjekker, samtaler, elever };
  });

  return (
    <WangSide>
      <WangSidehode
        skjermId="WANG-45"
        undertittel={bruker.name?.trim() || bruker.email}
        tittel="Fireukerssjekk"
        ingress="Svarene fra PlayerHQ, med Team Norways utviklingssjekk på elevens nivå. Ta samtale ved behov og logg det dere avtalte."
      />
      {erDemo ? <WangDemoMerknad /> : null}
      {!last.ok ? (
        <WangFeil tekst="Ingenting er borte. Det eleven har levert ligger lagret. Last siden på nytt om litt." />
      ) : (
        <>
          <WangKort tittel="Innleveringer" meta={String(last.data.sjekker.length)}>
            <SjekkListe sjekker={last.data.sjekker} />
          </WangKort>
          <WangKort tittel="Samtaler" meta={String(last.data.samtaler.length)}>
            <SamtaleListe samtaler={last.data.samtaler} />
          </WangKort>
          {last.data.elever.length > 0 ? (
            <SamtaleSkjema
              flate="WANG"
              person="elev"
              elever={last.data.elever.map((e) => ({ id: e.id, navn: e.navn }))}
              action={opprettWangSamtale}
              iDag={osloIso(naa)}
              sjekker={last.data.sjekker.filter((x) => x.status === "LEVERT").map((x) => ({ id: x.id, etikett: `${x.elevNavn} · frist ${osloIso(x.frist)}` }))}
            />
          ) : (
            <WangLenke href={wangHref("WANG-07")}>Se elevene</WangLenke>
          )}
        </>
      )}
      <p className={s.fot}>Fireukerssjekken erstatter halvårsevalueringen. Samtale tas ved behov og logges med det dere avtalte.</p>
    </WangSide>
  );
}
