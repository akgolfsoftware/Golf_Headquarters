Three states every list/panel needs. Use `State` to switch, or the parts directly.

```jsx
<State status={status} loadingText="Henter stallen …"
  empty={{ icon: "users", title: "Ingen spillere i gruppen", text: "Legg til en spiller eller flytt noen fra Junior.", action: "Legg til spiller" }}
  error={{ text: "TrackMan svarte ikke. Ingenting er slettet.", code: "FEIL 504 · 14:02", onRetry: reload }}>
  <DataTable … />
</State>
```

- Loading is a mono sentence ending in " …" — never a spinner or skeleton shimmer.
- Empty: one sentence why, one secondary action. No illustration. Empty values elsewhere are "—".
- Error: say what happened and what is safe, then **Prøv igjen**. Tone is neutral — no rust fill.
