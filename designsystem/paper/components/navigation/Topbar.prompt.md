Sticky topbar med brødsmuler, søk (skjules ≤980px) og tema-toggle. Bakgrunn er --surface 88 % + blur — den ene tillatte blur-flaten i systemet, målt mot referanse-dashboardet.

```jsx
<Topbar left={<Breadcrumbs items={[{ label: "AgencyOS" }, { label: "Dashboard" }]} />}
  theme={theme} onToggleTheme={toggle} actions={<Button size="sm">Åpne kø</Button>} />
```
