# Skjermkomposisjon — regler for skjermbygging i Claude Code

Skjermer designes IKKE i Claude Design. De komponeres i kodebasen fra designsystemet. Dette dokumentet er kontrakten for hvordan.

## Grunnregel

En skjerm er en komposisjon av designsystem-komponenter. Finnes komponenten: bruk den (les dens prompt.md først — den definerer riktig bruk). Finnes den IKKE: stopp og meld gapet som funn — ALDRI improviser ad-hoc UI. Gap går tilbake til designsystemet som ny komponent, deretter bygges skjermen.

## Kilder (i prioritert rekkefølge)

1. Designsystem-eksporten i repoet (design-handover): components/ med prompt.md per komponent, tokens/, guidelines/
2. DEKNINGSKART.md — hvilke ruter som finnes og hva de skal inneholde
3. Denne skillens øvrige referanser: visuelt-sprak.md (utseende), interaksjonsstandarder.md (oppførsel), trackman-dispersion.md (domene)

## Komposisjonsregler

- **Konsolider:** hver funksjon trenger ikke egen skjerm. Tabs, sheets, modus-bytte og seksjoner på én flate slår rutespredning. Dispersion er en modus i testanalysen, ikke egen rute.
- **Workbench er ÉN implementasjon** med rolle: 'spiller' | 'coach'. PlayerHQ konsumerer workbench-komponentene i spiller-rolle — aldri egen planleggingsimplementasjon.
- **Klarspråk-laget:** spiller- og foreldreflater viser verdinavn (Situasjon: «Range med mål», Læringstrinn: «Ball», Press: «Skjerpet»). Fagkoder (M2, L_BALL, PR3) kun i coach-flater og økt-ID.
- **Anbefalinger, aldri sperrer:** ingen flyt blokkeres av treningsregler. Avvik vises som klarspråk-chip; sterkt avvik utløser coach-varsel-event. Publiser/lagre er alltid mulig.
- **Mobile-first** for PlayerHQ og foreldreportal; desktop-first for AgencyOS-arbeidsflater (workbench, analyse) — dette er rekkefølgen man bygger FØRSTEUTKASTET i, ikke det eneste formatet som skal virke. **Enhver skjerm/funksjon skal optimaliseres for mobil, iPad OG desktop før den regnes ferdig** (se `docs/MASTER-SKJERMPLAN.md`s «Mob/Desk/iPad»-hake) — det andre formatet bygges i samme leveranse, aldri som senere etterarbeid.
- Ingen hardkodede hex/spacing — kun tokens. Ingen nye avhengigheter for UI.

## Verifikasjonsloop per skjerm (obligatorisk før ferdig)

1. Type-check og lint grønt
2. Browser: begge moduser (dark + .light), sammenlign tilstander mot /admin/tilstander-galleriet
3. Alle tre viewport-bredder — mobil (390px), iPad (768/1024px), desktop (1280px+): ingen klipping, touch-mål ≥ 44px på mobil/iPad
4. Tastatur: fokusrekkefølge gjennom hele flaten, dnd har tastatur-alternativ
5. Domenesjekk der data vises: enheter i meter med V/H, bias og spredning adskilt, M/PR-badge på måleserier

En skjerm uten alle fem punktene bestått er ikke ferdig — den er en skisse.
