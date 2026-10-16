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
import { WangKobledeVisninger, type WangKobletElev } from '@/components/wang/WangKobledeVisninger';
import type { WangRolle } from '@/app/team-wang/_data/wang-rolle';
import type { WangTrenerData } from '@/app/team-wang/_data/wang-trener-data';

interface WangCoachKlientProps {
  /** Området er avgjort av serveren (rolle og gyldighet er sjekket der). */
  omraade: WangOmraade;
  fane?: string;
  /** Økta som I dag-undersidene (Oppmøte, Økta, Meld fravær) gjelder. */
  oktId?: string;
  rolle: WangRolle;
  brukerNavn?: string;
  /** PLAYER-medlemmer i WANG-gruppa, til lenkene mot ekte data. */
  elever?: WangKobletElev[];
  /** Ekte gruppedata, bygget på serveren (byggWangTrenerData). */
  data: WangTrenerData;
}

export function WangCoachKlient({
  omraade,
  fane,
  oktId,
  rolle,
  brukerNavn,
  elever = [],
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
          onFaneEndret={(nyFane) => navigerTil('trening', nyFane)}
          data={data}
        />
      )}

      {omraade === 'tester' && (
        <WangKobledeVisninger elever={elever} visning="tester" />
      )}
      {omraade === 'tester' && (
        <WangTester
          aktivFane={fane}
          onFaneEndret={(nyFane) => navigerTil('tester', nyFane)}
          data={data}
        />
      )}

      {omraade === 'konkurranse' && (
        <WangKobledeVisninger elever={elever} visning="turneringer" />
      )}
      {omraade === 'konkurranse' && (
        <WangKonkurranse
          aktivFane={fane}
          onFaneEndret={(nyFane) => navigerTil('konkurranse', nyFane)}
          data={data}
        />
      )}

      {omraade === 'meldinger' && (
        <WangMeldinger
          aktivFane={fane}
          onFaneEndret={(nyFane) => navigerTil('meldinger', nyFane)}
          data={data}
        />
      )}

      {omraade === 'elever' && (
        <WangKobledeVisninger elever={elever} visning="iup" />
      )}
      {omraade === 'elever' && (
        <WangElever
          aktivFane={fane}
          onFaneEndret={(nyFane) => navigerTil('elever', nyFane)}
          data={data}
        />
      )}

      {omraade === 'admin' && (
        <WangAdmin
          aktivFane={fane}
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
