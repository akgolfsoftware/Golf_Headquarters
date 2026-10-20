'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { WangAppSkall, type WangOmraade } from '@/components/wang/WangAppSkall';
import { WangArbeidsflate } from '@/components/wang/WangArbeidsflate';
import type { OrgGruppeOppgaverData } from '@/lib/domain/org-gruppeoppgaver-kontrakt';
import type { WangGruppePost } from '@/components/wang/WangGruppeMeldinger';
import type { WangLiveData } from '../_data/hent-wang-gruppe';
import type { GruppeKalenderData } from '@/lib/gruppe-kalender/types';
import { WangAktivtRegister } from '@/components/wang/WangAktivtRegister';
import type { WangKobletElev } from '@/components/wang/WangKobledeVisninger';
import type { WangRolle } from '@/app/team-wang/_data/wang-rolle';

interface WangCoachKlientProps {
  /** Området er avgjort av serveren (rolle og gyldighet er sjekket der). */
  omraade: WangOmraade;
  fane?: string;
  rolle: WangRolle;
  brukerNavn?: string;
  /** PLAYER-medlemmer i WANG-gruppa, til lenkene mot ekte data. */
  elever?: WangKobletElev[];
  campus?: string;
  live?: WangLiveData;
  kalender?: GruppeKalenderData;
  kanPublisere?: boolean;
  gruppeOppgaver?: OrgGruppeOppgaverData | null;
  oppgaveFeil?: string;
  innlegg?: WangGruppePost[];
  meldingsTilgang?: boolean;
}

export function WangCoachKlient({
  omraade,
  fane,
  rolle,
  brukerNavn,
  elever = [],
  campus = 'Fredrikstad',
  live,
  kalender,
  kanPublisere = false,
  gruppeOppgaver,
  oppgaveFeil,
  innlegg = [],
  meldingsTilgang = false,
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
      {omraade !== 'system' && live && kalender && (
        <WangArbeidsflate omraade={omraade} fane={fane} live={live} kalender={kalender} elever={elever} campus={campus} kanPublisere={kanPublisere} onNaviger={navigerTil} gruppeOppgaver={gruppeOppgaver} oppgaveFeil={oppgaveFeil} innlegg={innlegg} meldingsTilgang={meldingsTilgang} />
      )}
      {omraade !== 'system' && (!live || !kalender) && <p role="status">Gruppedata er ikke tilgjengelige. Åpne trenerflaten på nytt.</p>}

      {omraade === 'system' && <WangAktivtRegister sportssjef={rolle === 'Sportssjef'} />}
    </WangAppSkall>
  );
}
