Oppgave-kort; bruk for arbeidsoppgaver fra fysiske timer — coach-godkjenning (AgencyOS) og spiller-sjekkliste (PlayerHQ).

```jsx
{/* Coach — innlevert oppgave i triage/spiller-fane */}
<OppgaveKort
  tittel="Face-to-path CS60" akse="TEK" trinn="Trinn 3 · Kølle"
  beskrivelse="Speiltrening + 20 baller med bevisst lukket kølleface gjennom impact."
  drill="Gate-drill høyrebrekk" dose="3×/uke" frist="fredag 20.6"
  status="innlevert" videoKrav
  onPrimaer={godkjenn} primaerTekst="Godkjenn"
  onSekundaer={seVideo} sekundaerTekst="Se innlevering"
/>

{/* Spiller — sjekkliste i PlayerHQ (klarspråk, ingen koder) */}
<OppgaveKort tittel="Putting innenfor 6 ft" akse="SLAG" dose="40 putter"
  frist="i morgen" status="venter"
  onPrimaer={markerGjort} primaerTekst="Marker gjort" />
```

- **Status** (semantisk chip, ikon + tekst): venter · innlevert · godkjent · **forfalt** (amber ramme — varsler, sperrer aldri).
- **videoKrav** viser video-badge; koble til VideoInnboks ved innlevering.
- Tolags-språk: coach ser P-koder/CS i beskrivelsen, spiller ser klarspråk + «Trinn X · Navn».
- Primærhandling skifter per rolle: «Godkjenn» (coach) / «Marker gjort» (spiller).
- Lukker lekse-loopen → godkjent oppgave teller i GJENNOMFØRING (ikke plan-kvalitet — to tall, aldri blandet).
