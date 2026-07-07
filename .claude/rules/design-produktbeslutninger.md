# Design-produktbeslutninger (Anders-beslutninger som overstyrer mockupen)

> Designkanon: `.claude/rules/design-system-regel.md` (v13/golfdata).

Trimmet 2026-07-03 (token-opprydding) — kuttet ~70 punkter som forsvarte mot en pixel-diff-
gate-prosess som ikke lenger kjøres (design er under ny utvikling hos Claude Design, se
CLAUDE.md). Full historikk ligger i git-loggen for denne filen. Behold kun stående
produktbeslutninger som fortsatt gjelder uavhengig av hvilken designleveranse som er aktiv.

- **PlayerHQ-hjem hero:** beholder **profilbilde + tier-pill** øverst (ikke dato-eyebrow/vær).
- **Tier-pill-tekst:** viser **«PlayerHQ · {tier}»** (+ «· HCP {hcp}» på desktop) — aldri
  «Performance Pro» som app-nivå (det er en coaching-pakke, se CLAUDE.md).
- **Undersider mobil-topbar:** global PortalShell-topbar (hamburger + PLAYERHQ) på alle
  undersider — tilbake-navigasjon via nettleser/bunn-nav, ikke egen sub-topbar per side.
- **Knappestil (app-bredt):** rounded-full pill + mono 12px bold uppercase på alle skjermer.

## AgencyOS
- **Avatar-initialer:** alltid ekte initialer fra DB-navn (aldri hardkodet demo-tekst).
- **Demo-innhold er data, ikke design:** avvik i konkret tekst (meldinger, navn, oppgaver)
  er ikke et design-avvik — struktur/typografi/farger er det som teller.
- **Oppgaver-skjermen beholder arbeidsverktøyet:** view-toggle (liste/kanban/kalender) +
  WorkspaceTabs + full kolonnetabell — Notion-synket funksjon, skal ikke skjæres ned.
- **Avatar-toner i lister er regelstyrt fra data** (lime = økt i dag, pri = haster), ikke
  hardkodet per rad.
- **Plan-kanban er statisk** (ingen drag-and-drop) — status-flyt skjer i Workbench/plan-detalj.

## Workbench
- **7 hub-faner** (Teknisk plan · Sesongmål · Maler · Standardøkter · Gantt · Uke · Økt).
- **Uke-visning:** vertikal time-akse (07–22) med posisjonerte kort, ikke kolonne-stack.
  Overlappende økter får side-by-side lanes med grip-håndtak for drag.
- **FORRIGE/NESTE uke:** kun inneværende kalenderuke har data i v1 — ukeoffset-API mangler,
  klikk uten datoflyt er forventet (post-lansering).
- **Spiller ser ingen PaletteSidebar** — kun coach har venstre planleggingspanel.

## AgencyOS mobil
- **Touch-mål:** alle knapper 44px på mobil (`max-md:h-11` i agBtnClass).
- **Delte komponenter (Caddie, avatar-toner) beholder fasit-arvet lime** til egen mobil-
  designrunde — mobil-NYE flater (bunnbar, Mer) håndhever streng lime-disiplin.
