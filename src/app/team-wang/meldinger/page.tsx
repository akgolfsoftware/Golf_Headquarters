import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requirePortalUser } from '@/lib/auth/requirePortalUser';
import { hentWangGruppe } from '@/app/team-wang/_data/hent-wang-gruppe';
import { hentGruppepostSide } from '@/lib/domain/tn-post';
import { WangGruppeMeldinger } from '@/components/wang/WangGruppeMeldinger';
export const dynamic = 'force-dynamic';
export default async function Page() {
  const bruker = await requirePortalUser({ allow: ['ADMIN','COACH','PLAYER','PARENT'], kreverTilgang: 'INGEN' });
  const gruppe = await hentWangGruppe();
  if (!gruppe) notFound();
  const side = await hentGruppepostSide(gruppe.gruppeId, bruker.id);
  if (!side) notFound();
  const innlegg = side.tidslinje.map(p => ({ id: p.id, forfatter: p.authorNavn, tekst: p.tekst, tidspunkt: p.createdAt.toISOString(), endret: p.editedAt !== null, lest: p.kvittering?.apnet ?? 0, mottakere: p.kvittering?.totalt ?? 0, vedlegg: p.vedlegg.map(v => ({ id: v.id, navn: v.fileName })) }));
  return <main style={{ maxWidth: 900, marginInline: 'auto', padding: 'clamp(16px,4vw,40px)', display: 'grid', gap: 24 }}>
    <header><h1>WANG · Meldinger</h1><nav aria-label="Tilbake"><Link href="/portal">PlayerHQ</Link> · <Link href="/team-wang">Gruppeplanen</Link></nav></header>
    <WangGruppeMeldinger gruppeNavn={gruppe.gruppeNavn} innlegg={innlegg} kanPublisere={side.rolle === 'TRENER' && ['ADMIN','COACH'].includes(bruker.role)} />
  </main>;
}
