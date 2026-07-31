SkipLink er det første elementet i `<body>` — usynlig til den tabbes til, da blekkfylt i øvre venstre hjørne.

```jsx
<SkipLink />
<main id="innhold" tabIndex={-1}>…</main>
```

- Målet **må** ha `tabindex="-1"`, ellers flytter ikke fokus seg i Safari og Chrome.
- Skjules med `left:-9999px`, ikke `display:none` eller `visibility:hidden` — de gjør lenken ufokuserbar og dermed meningsløs.
- Én per dokument, alltid først. Ligger den etter en Topbar i DOM, må brukeren tabbe gjennom navigasjonen for å nå snarveien ut av navigasjonen.
- Teksten er norsk og konkret: «Hopp til innhold», ikke «Skip».
