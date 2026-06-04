import { notFound } from 'next/navigation'
import type { SgCategory } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import { hentTreningsVolum } from '@/lib/training/volum'
import { beregnKorrelasjon } from '@/lib/training/korrelasjon'
import { SG_AREA_LABEL } from '@/lib/training/labels'
import { SgSparkline } from '@/components/fremgang/SgSparkline'
import { TreningsvolumBar } from '@/components/fremgang/TreningsvolumBar'

interface Props {
  params: Promise<{ id: string }>
}

function isoUkeNummer(dato: Date): string {
  const d = new Date(Date.UTC(dato.getFullYear(), dato.getMonth(), dato.getDate()))
  const dag = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dag)
  const year = d.getUTCFullYear()
  const startOfYear = new Date(Date.UTC(year, 0, 1))
  const uke = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + 1) / 7)
  return `${year}-W${String(uke).padStart(2, '0')}`
}

export default async function FremgangPage({ params }: Props) {
  const { id } = await params

  const spiller = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true },
  })
  if (!spiller) notFound()

  const UKER = 8
  const grense = new Date()
  grense.setDate(grense.getDate() - UKER * 7)

  const [runder, treningsVolum, korrelasjon] = await Promise.all([
    prisma.round.findMany({
      where: { userId: id, playedAt: { gte: grense }, sgTotal: { not: null } },
      select: { playedAt: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
      orderBy: { playedAt: 'asc' },
    }),
    hentTreningsVolum(id, UKER),
    beregnKorrelasjon(id, 16),
  ])

  const omraader: SgCategory[] = ['OTT', 'APP', 'ARG', 'PUTT']
  const ukeMap = new Map<string, Map<SgCategory, { sum: number; count: number }>>()

  for (const r of runder) {
    const uke = isoUkeNummer(r.playedAt)
    if (!ukeMap.has(uke)) ukeMap.set(uke, new Map())
    const entry = ukeMap.get(uke)!
    const sgVerdier: Record<SgCategory, number | null> = {
      OTT: r.sgOtt,
      APP: r.sgApp,
      ARG: r.sgArg,
      PUTT: r.sgPutt,
    }
    for (const a of omraader) {
      const sg = sgVerdier[a]
      if (sg == null) continue
      const prev = entry.get(a) ?? { sum: 0, count: 0 }
      entry.set(a, { sum: prev.sum + sg, count: prev.count + 1 })
    }
  }

  const sorterteUker = Array.from(ukeMap.keys()).sort()
  const sgSerier: Record<SgCategory, { uke: string; snittSg: number }[]> = {
    OTT: [],
    APP: [],
    ARG: [],
    PUTT: [],
  }
  for (const uke of sorterteUker) {
    const entry = ukeMap.get(uke)!
    for (const a of omraader) {
      const agg = entry.get(a)
      if (agg && agg.count > 0) {
        sgSerier[a].push({ uke, snittSg: agg.sum / agg.count })
      }
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">{spiller.name}</h1>
        <p className="text-muted-foreground">Fremgang — siste {UKER} uker</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-5 space-y-3">
          <h2 className="font-medium">SG per område</h2>
          {omraader.map((a) => (
            <SgSparkline key={a} sgArea={a} data={sgSerier[a]} />
          ))}
          {runder.length === 0 && (
            <p className="text-sm text-muted-foreground">Ingen runder registrert.</p>
          )}
        </div>

        <div className="border rounded-lg p-5 space-y-3">
          <h2 className="font-medium">Treningsvolum per uke</h2>
          <TreningsvolumBar treningsVolum={treningsVolum} />
        </div>
      </div>

      <div className="border rounded-lg p-5">
        <h2 className="font-medium mb-4">Trening vs SG-fremgang (korrelasjon)</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b">
              <th className="pb-2 font-medium">Område</th>
              <th className="pb-2 font-medium">Pearson r</th>
              <th className="pb-2 font-medium">Datapunkter</th>
              <th className="pb-2 font-medium">Tolkning</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {korrelasjon.map((k) => (
              <tr key={k.sgArea}>
                <td className="py-2">{SG_AREA_LABEL[k.sgArea]}</td>
                <td className="py-2 tabular-nums">{k.r !== null ? k.r.toFixed(2) : '—'}</td>
                <td className="py-2">{k.datapunkter}</td>
                <td
                  className={`py-2 ${
                    k.tolkning === 'positiv'
                      ? 'text-success'
                      : k.tolkning === 'negativ'
                        ? 'text-destructive'
                        : 'text-muted-foreground'
                  }`}
                >
                  {k.tolkning === 'positiv'
                    ? 'Trening hjelper'
                    : k.tolkning === 'negativ'
                      ? 'Sjekk metode'
                      : k.tolkning === 'for_lite_data'
                        ? 'For lite data'
                        : 'Ingen klar sammenheng'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
