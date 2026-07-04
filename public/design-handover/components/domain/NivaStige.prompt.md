# NivaStige

AK-stige / nivåprogresjon (gamification): nåværende nivå-badge + dotted fremdrift mot neste. Didaktisk og data-bundet — aldri bakgrunnsdekor.

## Bruk
```jsx
<NivaStige nivaa={3} etikett="Nivå 3 · Utvikling" steg={5} fylte={2} fremdrift={0.5}
  nesteEtikett="Nivå 4 · Konkurranse" />
```

## Domenefasit
Signal-fylte prikker = nådde steg; halv prikk = fremdrift innen neste. Skiller seg fra `Laeringstrapp` (de fem læringstrinnene) — dette er nivå-/kategori-stigen. For rene fremdrifts-ringer/-streaks, bruk `Progress`.
