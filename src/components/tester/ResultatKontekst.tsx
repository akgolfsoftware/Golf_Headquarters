const FAKTORER = [
  { navn: "Mental", beskrivelse: "Fokus, press og rutiner" },
  { navn: "Sosial", beskrivelse: "Støtte og situasjonen rundt treningen" },
  { navn: "Taktikk", beskrivelse: "Målvalg, beslutninger og risiko" },
  { navn: "Fysisk tilstand", beskrivelse: "Dagsform, restitusjon og eventuell skade" },
] as const;

export function ResultatKontekst() {
  return <section aria-label="Resultatkontekst" className="border-t pt-4">
    <h3 className="text-base font-semibold">Hva kan ha påvirket resultatet?</h3>
    <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
      {FAKTORER.map((faktor) => <div key={faktor.navn}>
        <dt className="text-sm font-semibold">{faktor.navn}</dt>
        <dd className="text-sm">{faktor.beskrivelse} · Ikke vurdert</dd>
      </div>)}
    </dl>
    <p className="mt-3 text-sm">Dette er forhold å vurdere, ikke årsaker som kan leses ut av scoren. Helse- og skadeopplysninger hører til i den beskyttede helseflyten.</p>
  </section>;
}
