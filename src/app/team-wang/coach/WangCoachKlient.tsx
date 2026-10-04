'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WangAppSkall, type WangOmraade } from '@/components/wang/WangAppSkall';
import { WangIdag } from '@/components/wang/WangIdag';
import { WangTrening } from '@/components/wang/WangTrening';
import { WangTester } from '@/components/wang/WangTester';
import { WangKonkurranse } from '@/components/wang/WangKonkurranse';
import { WangMeldinger } from '@/components/wang/WangMeldinger';
import { WangElever } from '@/components/wang/WangElever';
import { WangAdmin } from '@/components/wang/WangAdmin';
import { WangSkjermoversikt } from '@/components/wang/WangSkjermoversikt';

interface WangCoachKlientProps {
  initialOmraade?: WangOmraade;
  initialFane?: string;
  campus?: string;
}

export function WangCoachKlient({
  initialOmraade = 'idag',
  initialFane,
  campus = 'Fredrikstad',
}: WangCoachKlientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const omraade = (searchParams?.get('omraade') as WangOmraade) || initialOmraade;
  const fane = searchParams?.get('fane') || initialFane;

  const navigerTil = (nyttOmraade: WangOmraade, nyFane?: string) => {
    const query = new URLSearchParams();
    query.set('omraade', nyttOmraade);
    if (nyFane) query.set('fane', nyFane);
    router.push(`/team-wang/coach?${query.toString()}`);
  };

  return (
    <WangAppSkall
      aktivtOmraade={omraade}
      aktivFane={fane}
      onFaneEndring={(valgtFane) => {
        navigerTil(omraade, valgtFane);
      }}
    >
      {omraade === 'idag' && (
        <WangIdag
          aktivFane={fane}
          onFaneEndret={(nyFane) => navigerTil('idag', nyFane)}
          campus={campus}
        />
      )}

      {omraade === 'trening' && (
        <WangTrening
          aktivFane={fane}
          onFaneEndret={(nyFane) => navigerTil('trening', nyFane)}
          campus={campus}
        />
      )}

      {omraade === 'tester' && (
        <WangTester
          aktivFane={fane}
          onFaneEndret={(nyFane) => navigerTil('tester', nyFane)}
          campus={campus}
        />
      )}

      {omraade === 'konkurranse' && (
        <WangKonkurranse
          aktivFane={fane}
          onFaneEndret={(nyFane) => navigerTil('konkurranse', nyFane)}
          campus={campus}
        />
      )}

      {omraade === 'meldinger' && (
        <WangMeldinger
          aktivFane={fane}
          onFaneEndret={(nyFane) => navigerTil('meldinger', nyFane)}
          campus={campus}
        />
      )}

      {omraade === 'elever' && (
        <WangElever
          aktivFane={fane}
          onFaneEndret={(nyFane) => navigerTil('elever', nyFane)}
          campus={campus}
        />
      )}

      {omraade === 'admin' && (
        <WangAdmin
          aktivFane={fane}
          onFaneEndret={(nyFane) => navigerTil('admin', nyFane)}
          campus={campus}
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
