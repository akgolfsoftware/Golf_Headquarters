'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { WangAppSkall, type WangNesteOkt, type WangOmraade, type WangSokTreff } from '@/components/wang/WangAppSkall';
import { wangHref } from '@/components/wang/wang-felles';
import { WangIdag } from '@/components/wang/WangIdag';
import { WangTrening } from '@/components/wang/WangTrening';
import { WangTester } from '@/components/wang/WangTester';
import { WangKonkurranse } from '@/components/wang/WangKonkurranse';
import { WangMeldinger } from '@/components/wang/WangMeldinger';
import { WangElever } from '@/components/wang/WangElever';
import { WangAdmin } from '@/components/wang/WangAdmin';
import { WangAdminLukket } from '@/components/wang/WangAdminOpptak';
import type { WangOpptakData } from '@/app/team-wang/_data/wang-opptak-visning';
import { WangSkjermoversikt } from '@/components/wang/WangSkjermoversikt';
import type { WangRolle } from '@/app/team-wang/_data/wang-rolle';
import type { WangTrenerData } from '@/app/team-wang/_data/wang-trener-data';
import type { WangTesterData } from '@/app/team-wang/_data/wang-tester-visning';
import type { WangPlanData } from '@/app/team-wang/_data/wang-plan-visning';
import type { WangDataGolfData } from '@/app/team-wang/_data/wang-datagolf-visning';
import type { WangElevdata, WangFireukerssjekk } from '@/app/team-wang/_data/wang-elevdata-visning';
import type { WangAdminData } from '@/app/team-wang/_data/wang-admin-visning';
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
  /** Elevenes delte plan (I dag, Trening, Elever). Bare elever som har delt planen med gruppa. */
  plan?: WangPlanData;
  /** Klasse for alle elever; HCP og kategori for dem som har delt (Elever). */
  elevdata?: WangElevdata;
  /** Fireukerssjekken for eleven i Elever › Fireukerssjekk, eller «ikke-delt». */
  fireukerssjekk?: WangFireukerssjekk;
  /** Data Golf (Konkurranse › Data Golf), bare når kanSeDataGolf slapp brukeren inn. */
  dataGolf?: WangDataGolfData;
  /** Invitasjoner og timeplanunntak (Administrasjon), bare for sportssjef. */
  admin?: WangAdminData;
  /** Opptak og koordinering (Administrasjon), bare for sportssjef. */
  opptak?: WangOpptakData;
  /** Ekte gruppedata, bygget på serveren (byggWangTrenerData). */
  data: WangTrenerData;
}

const minutter = (hhmm: string) => {
  const [t, m] = hhmm.split(':').map(Number);
  return t * 60 + m;
};

const iMorgenIso = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
};

const tilOkt = (id: string) => `/team-wang/coach?omraade=idag&fane=okt&okt=${encodeURIComponent(id)}`;

/** Neste økt i ukas kalender. Bare ekte økter; ingen økt gir ikke noe kort. */
export function finnNesteOkt(data: WangTrenerData): WangNesteOkt | null {
  const naa = data.naaTid ? minutter(data.naaTid) : null;
  const neste = data.ukeOkter.find((o) => {
    if (o.passert) return false;
    if (o.datoIso > data.idagIso) return true;
    return o.datoIso === data.idagIso && naa !== null && minutter(o.startTid) > naa;
  });
  if (!neste) return null;
  let naar = neste.dag;
  if (neste.datoIso === data.idagIso && naa !== null) {
    const diff = minutter(neste.startTid) - naa;
    const t = Math.floor(diff / 60);
    const m = diff % 60;
    naar = t > 0 ? `om ${t} t ${m} min` : `om ${m} min`;
  } else if (neste.datoIso === iMorgenIso(data.idagIso)) {
    naar = 'i morgen';
  }
  return { tid: neste.startTid, tittel: neste.tittel, naar, info: neste.sted, href: tilOkt(neste.id) };
}

/** Det søket i skallet kan finne: gruppas elever og ukas økter. */
export function byggSokbart(data: WangTrenerData): WangSokTreff[] {
  return [
    ...data.elever.map((e) => ({ id: `e-${e.id}`, tekst: e.navn, under: `Elev · ${data.gruppeNavn}`, href: wangHref('elever', 'elev', e.id) })),
    ...data.ukeOkter.map((o) => ({ id: `o-${o.id}`, tekst: o.tittel, under: `${o.dag} ${o.tid}${o.sted ? ` · ${o.sted}` : ''}`, href: tilOkt(o.id) })),
  ];
}

export function WangCoachKlient({
  omraade,
  fane,
  oktId,
  id,
  rolle,
  brukerNavn,
  tester,
  plan,
  elevdata,
  fireukerssjekk,
  dataGolf,
  admin,
  opptak,
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
      neste={finnNesteOkt(data)}
      sokbart={byggSokbart(data)}
      onFaneEndring={(valgtFane) => {
        navigerTil(omraade, valgtFane);
      }}
    >
      {omraade === 'idag' && (
        <WangIdag aktivFane={fane} oktId={oktId} data={data} plan={plan} />
      )}

      {omraade === 'trening' && (
        <WangTrening
          aktivFane={fane}
          id={id}
          onFaneEndret={(nyFane) => navigerTil('trening', nyFane)}
          plan={plan}
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
          plan={plan}
          elevdata={elevdata}
          fireukerssjekk={fireukerssjekk}
          onFaneEndret={(nyFane) => navigerTil('elever', nyFane)}
          data={data}
        />
      )}

      {omraade === 'admin' && rolle !== 'Sportssjef' && <WangAdminLukket />}

      {omraade === 'admin' && rolle === 'Sportssjef' && (
        <WangAdmin
          aktivFane={fane}
          tester={tester}
          admin={admin}
          opptak={opptak}
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
