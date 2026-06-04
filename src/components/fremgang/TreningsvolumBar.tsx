'use client'

import type { SgCategory } from '@/generated/prisma/client'
import type { UkeVolum } from '@/lib/training/volum'

interface Props {
  treningsVolum: UkeVolum[]
}

const AREA_COLOR: Record<SgCategory, string> = {
  OTT: 'bg-chart-1',
  APP: 'bg-chart-2',
  ARG: 'bg-chart-4',
  PUTT: 'bg-chart-6',
}

export function TreningsvolumBar({ treningsVolum }: Props) {
  if (treningsVolum.length === 0) {
    return <p className="text-sm text-muted-foreground">Ingen treningslogg registrert.</p>
  }

  const uker = [...new Set(treningsVolum.map((t) => t.uke))].sort()
  const omraader: SgCategory[] = ['OTT', 'APP', 'ARG', 'PUTT']

  const maxTotal = Math.max(
    ...uker.map((u) =>
      omraader.reduce((sum, a) => {
        const v = treningsVolum.find((t) => t.uke === u && t.sgArea === a)
        return sum + (v?.minutter ?? 0)
      }, 0),
    ),
    1,
  )

  return (
    <div className="space-y-1">
      <div className="flex gap-3 text-xs text-muted-foreground mb-2">
        {omraader.map((a) => (
          <span key={a} className="flex items-center gap-1">
            <span className={`inline-block w-2 h-2 rounded-sm ${AREA_COLOR[a]}`} />
            {a}
          </span>
        ))}
      </div>
      <div className="flex gap-1 items-end h-16">
        {uker.map((uke) => {
          const total = omraader.reduce((sum, a) => {
            const v = treningsVolum.find((t) => t.uke === uke && t.sgArea === a)
            return sum + (v?.minutter ?? 0)
          }, 0)
          const heightPct = `${(total / maxTotal) * 100}%`
          return (
            <div
              key={uke}
              className="flex-1 flex flex-col justify-end"
              title={`${uke}: ${total} min`}
            >
              <div className="w-full flex flex-col-reverse" style={{ height: heightPct }}>
                {omraader.map((a) => {
                  const v = treningsVolum.find((t) => t.uke === uke && t.sgArea === a)
                  if (!v || total === 0) return null
                  const share = `${(v.minutter / total) * 100}%`
                  return (
                    <div
                      key={a}
                      className={`w-full ${AREA_COLOR[a]}`}
                      style={{ height: share }}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex gap-1 text-xs text-muted-foreground">
        {uker.map((u) => (
          <div key={u} className="flex-1 text-center truncate">
            {u.replace(/^\d{4}-/, '')}
          </div>
        ))}
      </div>
    </div>
  )
}
