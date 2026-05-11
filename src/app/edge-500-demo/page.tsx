/**
 * PILOT — Edge · 500 / agent-feil
 * Bygd direkte fra wireframe/design-files-v2/screens/46-edge-500.html
 * URL: /edge-500-demo
 *
 * Én produksjonsskjerm: periodiserings-agent svarer ikke (503).
 */

import { AlertTriangle, RefreshCw, ExternalLink, Copy } from "lucide-react";

export default function Edge500Demo() {
  return (
    <div className="min-h-screen bg-background px-6 py-12 text-foreground">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        {/* Error banner */}
        <div className="flex w-full items-start gap-3 rounded-md border border-[#A32D2D]/30 bg-[#A32D2D]/[0.06] p-4 text-left">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm bg-[#A32D2D]/15 text-[#A32D2D]">
            <AlertTriangle className="h-4 w-4" strokeWidth={1.5} />
          </div>
          <div className="text-[13px] leading-relaxed text-foreground">
            <b className="font-semibold">Periodiserings-agenten svarer ikke akkurat nå.</b> Vi prøvde tre ganger —
            siste forsøk feilet med 503. Status-siden bekrefter at agenten har en pågående hendelse. ETA 12 min.
          </div>
        </div>

        {/* Hero */}
        <div className="mt-8 flex h-20 w-20 items-center justify-center rounded-full border border-border bg-secondary/30 text-muted-foreground">
          <AlertTriangle className="h-10 w-10" strokeWidth={1.5} />
        </div>
        <h1 className="mt-5 font-display text-[32px] font-medium leading-[1.15] tracking-tight">
          Vi fikk ikke <em className="font-normal italic">laget rapporten</em>
        </h1>
        <p className="mt-3 max-w-[520px] text-[14px] leading-relaxed text-muted-foreground">
          Markus sine uke-data ligger trygt lagret. Du kan vente på at agenten kommer tilbake (du får varsel), eller
          åpne forrige uke-rapport mens du venter. Vi mailer deg automatisk så snart rapporten er klar.
        </p>

        {/* Details */}
        <div className="mt-8 w-full rounded-lg border border-border bg-card p-6 text-left">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Feildetaljer · gi denne til support
          </h2>
          <dl className="mt-3 flex flex-col">
            <Row label="Korrelasjon-ID" value="err_2026-05-11_b8c4-12fa" />
            <Row label="Agent" value="periodisering · v2.4.1" />
            <Row label="Feilkode" value={<span className="text-[#A32D2D]">503 SERVICE_UNAVAILABLE</span>} />
            <Row label="Tidspunkt" value="11. mai 2026 14:32:18 CEST" />
            <Row label="Forsøk" value="3 av 3 · exponential backoff" />
            <Row label="Hendelse" value="incident #INC-2026-0427 · pågående" />
            <Row label="ETA" value="~12 min · oppdateres på status-siden" />
          </dl>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground hover:opacity-90">
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} />
            Prøv igjen
          </button>
          <button className="rounded-md border border-border bg-card px-4 py-2.5 text-[13px] font-medium text-foreground hover:bg-secondary">
            Åpne forrige uke
          </button>
          <button className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-[13px] font-medium text-foreground hover:bg-secondary">
            Status-side
            <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
          </button>
          <button className="inline-flex items-center gap-2 rounded-md px-3 py-2.5 text-[13px] font-medium text-muted-foreground hover:bg-secondary">
            <Copy className="h-3 w-3" strokeWidth={1.5} />
            Kopier feil-ID
          </button>
        </div>

        <div className="mt-6 max-w-[520px] font-mono text-[10px] leading-relaxed tracking-[0.04em] text-muted-foreground">
          slik vi bygger feil-skjermer · 1) ærlig språk · 2) korrelasjon-id for support · 3) hva vi har av data · 4)
          konkrete neste-steg · 5) link til status-side
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 text-[13px] last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}
