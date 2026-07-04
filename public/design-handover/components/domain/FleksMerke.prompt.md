Fleks-merke; bruk på økt-kort i Workbench og PlayerHQ-agenda (fleks-flyten).

```jsx
<FleksMerke tilstand="fleks" />                       {/* kan flyttes fritt */}
<FleksMerke tilstand="laast" />                       {/* fast tid/sted (bane, coach) */}
<FleksMerke tilstand="flyttet" grunnkode="JOBB" />    {/* fleks brukt, grunn logget */}
```

- Nøytral mono — flytting er IKKE et brudd; semantiske farger er reservert validering.
- **grunnkode** vises kun ved `flyttet`: SKADE/SYKDOM/REISE/JOBB/STUDIER/VÆR/ANNET
  (samme koder som grunnkode-velgeren i Familie 3).
- `sm` for tette drill-rader, `md` (default) for økt-kort.
