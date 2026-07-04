Benchmark-badge; bruk på test-scorekort (live projeksjon), spillerkort og leaderboard.

```jsx
<BenchmarkBadge prefiks="Ligger an til" niva="Challenge-nivå" status="projeksjon" />
<BenchmarkBadge niva="Kategori A" />
<BenchmarkBadge niva="Tour-nivå" size="sm" />
```

- **status**: `projeksjon` (stiplet + trending-ikon — under pågående måling) · `bekreftet` (solid).
- Nøytral farge med hensikt: nivå er informasjon, ikke ros — semantiske farger er
  reservert for regelbrudd/validering (kanon-semantikken).
- **prefiks** for løpende kontekst («Ligger an til:») — utelates for statisk nivå.
