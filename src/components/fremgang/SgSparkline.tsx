'use client'

import type { SgCategory } from '@/generated/prisma/client'
import { SG_AREA_LABEL } from '@/lib/training/labels'

interface SgDatapunkt {
  uke: string
  snittSg: number
}

interface Props {
  sgArea: SgCategory
  data: SgDatapunkt[]
}

export function SgSparkline({ sgArea, data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground w-28">{SG_AREA_LABEL[sgArea]}</span>
        <span className="text-xs text-muted-foreground">Ingen data</span>
      </div>
    )
  }

  const min = Math.min(...data.map((d) => d.snittSg))
  const max = Math.max(...data.map((d) => d.snittSg))
  const range = max - min || 1
  const width = 120
  const height = 32

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1 || 1)) * width
      const y = height - ((d.snittSg - min) / range) * height
      return `${x},${y}`
    })
    .join(' ')

  const latest = data[data.length - 1]
  const trend = data.length > 1 ? latest.snittSg - data[data.length - 2].snittSg : 0
  const positiv = latest.snittSg >= 0

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-28">{SG_AREA_LABEL[sgArea]}</span>
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          className={positiv ? 'stroke-success' : 'stroke-destructive'}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className={`text-xs font-medium tabular-nums ${positiv ? 'text-success' : 'text-destructive'}`}
      >
        {latest.snittSg.toFixed(2)}
      </span>
      <span
        className={`text-xs ${
          trend > 0 ? 'text-success' : trend < 0 ? 'text-destructive' : 'text-muted-foreground'
        }`}
      >
        {trend > 0 ? '+' : ''}
        {trend.toFixed(2)}
      </span>
    </div>
  )
}
