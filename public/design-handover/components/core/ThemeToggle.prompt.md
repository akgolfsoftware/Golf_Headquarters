# ThemeToggle

Tre-veis utseende-velger: **System · Lys · Mørk**. Skriver `.light`/`.dark`-klasse,
`data-theme` og `color-scheme` på et mål (default `<html>`). «System» følger
`prefers-color-scheme` live. Nøytral segmentert pille — aldri lime (en toggle er
ikke et signal). Respekterer `prefers-reduced-motion`.

**Plassering (kanon):** AgencyOS → toppbar / kontoområde (default mørk).
PlayerHQ → Meg › Innstillinger › Utseende (default lys).

```jsx
// Selvstyrt: husker valget, skriver tema på <html>
<ThemeToggle storageKey="akgolf-theme" defaultValue="system" />

// Kompakt, kun ikoner (toppbar)
<ThemeToggle size="sm" visEtiketter={false} storageKey="agencyos-theme" defaultValue="dark" />

// Kontrollert + eget scope-mål (skriver på en wrapper, ikke <html>)
<ThemeToggle value={tema} onChange={setTema} target="#playerhq-scope" />
```
