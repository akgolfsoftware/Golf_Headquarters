Dialog brukes når brukeren må svare på én ting før hen går videre — bekrefte, velge, fylle inn kort. Aldri til informasjon som kunne stått på siden.

```jsx
<Dialog open={apen} onLukk={() => setApen(false)}
  tittel="Avbestille kartleggingsøkten?"
  beskrivelse="Torsdag 14.09 kl. 17.00. Avbestilling innen 24 timer er gratis."
  handlinger={<>
    <Knapp variant="sekundaer" onClick={() => setApen(false)}>Behold timen</Knapp>
    <Knapp onClick={avbestill}>Avbestill</Knapp>
  </>} />
```

- Én primærknapp. Den står sist. Tittelen er et spørsmål eller en handling, ikke «Bekreft».
- Escape og bakteppet lukker. Fokus går tilbake dit det kom fra.
- Ingen blur på bakteppet. Verkstedet er flatt.
