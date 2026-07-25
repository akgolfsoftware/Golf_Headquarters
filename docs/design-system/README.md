# ⛔ UTGÅTT — gammel designkanon (arkivert, ikke i bruk)

**Dato: 2026-07-25**

Alt innhold i denne mappen (`docs/design-system/`) er den **gamle
v2-designkanonen** (FASIT, mockups, tokens, retning C «Presis» m.m.).
Den er **bevisst tatt ut av bruk** fordi vi bygger et helt nytt designsystem
i **Open Design** — vi skal ikke jobbe i døden med gamle regler som hemsko.

Dette gjelder:

- **Ingenting her håndheves lenger.** Alle design-gates er fjernet i samme
  rydding (2026-07-25): hex-sjekken i CI, eslint-reglene for hex/8pt-grid,
  hex-blokken i `.claude/hooks/kvalitet.mjs`, regelfilen
  `.claude/rules/design-system-regel.md` og design-skillene
  (`ak-designekspert`, `ak-design-evolution`).
- **Ikke bygg nye skjermer fra disse mockupene.** De dokumenterer hvordan
  appen så ut på et tidspunkt — ikke hvordan den skal se ut.
- **Koden er fasit** frem til det nye systemet er godkjent. Nåværende
  tema-oppførsel (lys standard på app-flatene, mørk via bryter) er beskrevet
  i `docs/platform/BUSINESS-RULES.md` som ren nåtids-beskrivelse — ikke som
  låst regel.
- **Mappen kan slettes / flyttes til `docs/arkiv/`** når Open Design-systemet
  lander. Den er beholdt inntil videre som historisk referanse.
