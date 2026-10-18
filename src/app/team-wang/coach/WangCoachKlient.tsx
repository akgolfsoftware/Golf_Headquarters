'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { WangAppSkall, type WangOmraade } from '@/components/wang/WangAppSkall';
import { WangIdag } from '@/components/wang/WangIdag';
import { WangTrening } from '@/components/wang/WangTrening';
import { WangTester } from '@/components/wang/WangTester';
import { WangKonkurranse } from '@/components/wang/WangKonkurranse';
import { WangMeldinger } from '@/components/wang/WangMeldinger';
import { WangElever } from '@/components/wang/WangElever';
import { WangAdmin } from '@/components/wang/WangAdmin';
import { WangSkjermoversikt } from '@/components/wang/WangSkjermoversikt';
import type { WangRolle } from '@/app/team-wang/_data/wang-rolle';
import type { WangTrenerData } from '@/app/team-wang/_data/wang-trener-data';
import type { WangTesterData } from '@/app/team-wang/_data/wang-tester-visning';
import type { WangDataGolfData } from '@/app/team-wang/_data/wang-datagolf-visning';
import type { WangElevdata, WangFireukerssjekk } from '@/app/team-wang/_data/wang-elevdata-visning';
import { WangDataGolf } from '@/components/wang/WangDataGolf';

interface WangCoachKlientProps {
  /** Området er avgjort av serveren (rolle og gyldighet er sjekket der). */
  omraade: WangOmraade;
  fane?: string;
  /** Økta som I dag-undersidene (Oppmøte, Økta, Meld fravær) gjelder. */
  oktId?: string;
  /** Det én underside gjelder (periode, test, turnering, elev …). */
  id?: string;
  rolle: WangRolle;
  brukerNavn?: string;
  /** Testresultater og testsamtykke for elevene som deler med WANG (Tester, Elever, Administrasjon). */
  tester?: WangTesterData;
  /** Klasse for alle elever; HCP og kategori for dem som har delt (Elever). */
  elevdata?: WangElevdata;
  /** Fireukerssjekken for eleven i Elever › Fireukerssjekk, eller «ikke-delt». */
  fireukerssjekk?: WangFireukerssjekk;
  /** Data Golf (Konkurranse › Data Golf), bare når kanSeDataGolf slapp brukeren inn. */
  dataGolf?: WangDataGolfData;
  /** Ekte gruppedata, bygget på serveren (byggWangTrenerData). */
  data: WangTrenerData;
}

export function WangCoachKlient({
  omraade,
  fane,
  oktId,
  id,
  rolle,
  brukerNavn,
  tester,
  elevdata,
  fireukerssjekk,
  dataGolf,
  data,
}: WangCoachKlientProps) {
  const router = useRouter();

  const navigerTil = (nyttOmraade: WangOmraade, nyFane?: string) => {
    const query = new URLSearchParams();
    query.set('omraade', nyttOmraade);
    if (nyFane) query.set('fane', nyFane);
    router.push(`/team-wang/coach?${query.toString()}`);
  };

  return (
    <WangAppSkall
      rolle={rolle}
      brukerNavn={brukerNavn}
      aktivtOmraade={omraade}
      aktivFane={fane}
      onFaneEndring={(valgtFane) => {
        navigerTil(omraade, valgtFane);
      }}
    >
      {omraade === 'idag' && (
        <WangIdag aktivFane={fane} oktId={oktId} data={data} />
      )}

      {omraade === 'trening' && (
        <WangTrening
          aktivFane={fane}
          id={id}
          onFaneEndret={(nyFane) => navigerTil('trening', nyFane)}
          data={data}
        />
      )}

      {omraade === 'tester' && (
        <WangTester
          aktivFane={fane}
          id={id}
          tester={tester}
          onFaneEndret={(nyFane) => navigerTil('tester', nyFane)}
          data={data}
        />
      )}

      {omraade === 'konkurranse' && fane?.startsWith('dg') && <WangDataGolf d={dataGolf} />}

      {omraade === 'konkurranse' && !fane?.startsWith('dg') && (
        <WangKonkurranse
          aktivFane={fane}
          id={id}
          onFaneEndret={(nyFane) => navigerTil('konkurranse', nyFane)}
          data={data}
        />
      )}

      {omraade === 'meldinger' && (
        <WangMeldinger
          aktivFane={fane}
          id={id}
          onFaneEndret={(nyFane) => navigerTil('meldinger', nyFane)}
          data={data}
        />
      )}

      {omraade === 'elever' && (
        <WangElever
          aktivFane={fane}
          id={id}
          tester={tester}
          elevdata={elevdata}
          fireukerssjekk={fireukerssjekk}
          onFaneEndret={(nyFane) => navigerTil('elever', nyFane)}
          data={data}
        />
      )}

      {omraade === 'admin' && (
        <WangAdmin
          aktivFane={fane}
          tester={tester}
          onFaneEndret={(nyFane) => navigerTil('admin', nyFane)}
          data={data}
        />
      )}

      {omraade === 'system' && (
        <WangSkjermoversikt
          onNaviger={(nyttOmraade, nyFane) => {
            navigerTil(nyttOmraade as WangOmraade, nyFane);
          }}
        />
      )}
    </WangAppSkall>
  );
}
