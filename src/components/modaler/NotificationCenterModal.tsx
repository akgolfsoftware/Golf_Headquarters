"use client"

import { useState } from "react"
import { X, Bell } from "lucide-react"

type Props = {
  open: boolean
  onClose: () => void
}

type VarselKategori = "alle" | "ulest" | "coaching" | "booking"

type Varsel = {
  id: string
  tittel: string
  tidspunkt: string
  ulest: boolean
  kategori: "coaching" | "booking" | "melding"
}

const MOCK_VARSLER: Varsel[] = [
  {
    id: "1",
    tittel: "Coaching-planen din er oppdatert av trener",
    tidspunkt: "I dag, 09:14",
    ulest: true,
    kategori: "coaching",
  },
  {
    id: "2",
    tittel: "Booking bekreftet — Coaching-time mandag 13:00",
    tidspunkt: "I går, 16:30",
    ulest: true,
    kategori: "booking",
  },
  {
    id: "3",
    tittel: "Ny melding fra coach: Se kommentar på slag #14",
    tidspunkt: "I går, 11:05",
    ulest: false,
    kategori: "melding",
  },
  {
    id: "4",
    tittel: "Bookingen din fredag 10:00 er bekreftet",
    tidspunkt: "Mandag, 08:00",
    ulest: false,
    kategori: "booking",
  },
]

const FANER: { id: VarselKategori; label: string }[] = [
  { id: "alle", label: "Alle" },
  { id: "ulest", label: "Ulest" },
  { id: "coaching", label: "Coaching" },
  { id: "booking", label: "Booking" },
]

export function NotificationCenterModal({ open, onClose }: Props) {
  const [aktivFane, setAktivFane] = useState<VarselKategori>("alle")
  const [lestIds, setLestIds] = useState<Set<string>>(new Set())

  if (!open) return null

  function merkAlleSomLest() {
    setLestIds(new Set(MOCK_VARSLER.map((v) => v.id)))
  }

  function erUlest(varsel: Varsel) {
    return varsel.ulest && !lestIds.has(varsel.id)
  }

  const filtrerte = MOCK_VARSLER.filter((v) => {
    if (aktivFane === "alle") return true
    if (aktivFane === "ulest") return erUlest(v)
    return v.kategori === aktivFane
  })

  const antallUlest = MOCK_VARSLER.filter(erUlest).length

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-h-[90vh] overflow-hidden rounded-t-2xl border border-border bg-card shadow-xl sm:max-w-md sm:rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold">Varsler</h2>
            {antallUlest > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 font-mono text-[10px] font-semibold text-primary-foreground">
                {antallUlest}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={merkAlleSomLest}
              className="text-xs text-primary hover:underline"
            >
              Merk alle som lest
            </button>
            <button
              type="button"
              onClick={onClose}
              className="-mr-2 grid h-11 w-11 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground sm:h-9 sm:w-9"
              aria-label="Lukk"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Faner */}
        <div className="flex gap-1 border-b border-border px-4 pt-3 pb-0">
          {FANER.map((fane) => (
            <button
              key={fane.id}
              type="button"
              onClick={() => setAktivFane(fane.id)}
              className={`pb-3 px-3 text-sm font-medium transition-colors border-b-2 ${
                aktivFane === fane.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {fane.label}
            </button>
          ))}
        </div>

        {/* Varsel-liste */}
        <div className="max-h-96 overflow-y-auto px-6">
          {filtrerte.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">Ingen varsler i denne kategorien</p>
            </div>
          ) : (
            filtrerte.map((varsel) => (
              <div key={varsel.id} className="flex gap-3 border-b border-border py-3 last:border-0">
                <div className="mt-2 shrink-0">
                  {erUlest(varsel) ? (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-transparent" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${erUlest(varsel) ? "font-medium text-foreground" : "text-foreground"}`}>
                    {varsel.tittel}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{varsel.tidspunkt}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
