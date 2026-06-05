# Nye skjermer — ferdige prompts

> Skjermene tabellene markerte som «må bygges». Hver prompt er klar til å limes inn.
> **Type** sier hvor den skal: **DESIGN** = Claude Design (ny skjerm uten design). **BYGG** = Claude Code (design finnes allerede, skal porteres/fullføres).

---

## 1. Turnering-detalj (PlayerHQ) — TYPE: DESIGN

Designeren listet skjermen, men bygde den aldri. Lim inn i **Claude Design**:

```
Design en ny skjerm for PlayerHQ (AK Golf HQ spillerportal). LYST tema, mobil 430px + desktop.

Skjerm: «Turnering-detalj» — spillerens visning av ÉN turnering.

Designsystem (følg strengt, samme språk som resten av PlayerHQ-prototypen):
- Farger: primary forest #005840, accent lime #D1F843, bakgrunn #FAFAF7, kort #FFFFFF, tekst #0A1F17, sand #F1EEE5.
- Fonter: Inter (UI/brødtekst), Inter Tight (display/hero, gjerne italic på del av headline), JetBrains Mono (tall, tee-tider, eyebrows).
- Lucide-ikoner, 1.5px stroke. Editorial sport-analytics-stil. 8pt-grid.

Innhold (topp → bunn):
1. Hero: eyebrow (mono) med tour/kategori (f.eks. «SRIXON TOUR · A-KLASSE»), turneringsnavn (Inter Tight), dato + bane under.
2. Nøkkeltall-strip (mono, 3–4 felt): tee-tid · format (slag/match) · feltstørrelse · par/lengde.
3. «Din status»-kort: påmeldt / venteliste + evt. startnummer.
4. «I ballen din»: 2–3 medspillere (avatar + navn + HCP).
5. Baneinfo-kort: bane, tee, værmelding-rad.
6. Valgfri blokk: fellesmelding fra coach (hvis turneringen har en).
7. CTA-knapper nederst: «Planlegg mot» (primær, lime) og «Legg til i kalender» (sekundær).

Lever som selvstendig skjerm i samme HTML/JSX-format som de andre PlayerHQ-skjermene i prototypen, slik at den kan kobles på adressen /portal/tren/turneringer/[id].
```

---

## 2. Fokus-spiller: pin + AI-forslag (AgencyOS Cockpit) — TYPE: BYGG

Design finnes: `coach-flows/screens-focus.js`. Lim inn i **Claude Code**:

```
Les docs/MASTER-SKJERMPLAN.md, .claude/rules/design-porting-gate.md, CLAUDE.md og docs/kobling-godkjenning/agencyos-godkjent-2026-06-05.md. Du er i design/komplett.

Kontekst: AgencyOS Cockpit (/admin/agencyos) har i dag et enkelt «Trenger oppmerksomhet»-panel. Fasit-designet for full versjon ligger i design-handover under coach-flows/screens-focus.js.

Mål: Bygg fokus-spiller-panelet på Cockpit i to deler:
(a) PINNET: spilleren coachen manuelt har festet øverst, med begrunnelse + knapper «Legg til økt / Melding / Profil / Løsne fra topp».
(b) AI-FORSLAG: 3 kort med prioritet og farge — Hastespørsmål (rød) / Ubesvart melding (blå) / Manglende oppfølging (gul) — hver med kontekst-knapper. Alle knapper som handler om planlegging fører RETT inn i spillerens Workbench (/admin/spillere/[id]/workbench).

Tema: mørkt (.dark). Design: følg src/app/globals.css + screens-focus.js som fasit — kjør design-porting-gate (adversarisk diff til 0 avvik) før ferdig.
Auth: requirePortalUser({ allow: ["ADMIN","COACH"] }).
Database: ny Prisma-modell PlayerFocusPin { coachId, playerId, reason, createdAt } (husk ENABLE RLS i samme migrasjon). AI-forslag utledes fra eksisterende signaler (SessionRequest, inaktivitet, ubesvart melding) — ingen ny AI-kall nødvendig nå.

Verifiser: npx prisma validate && generate, npx tsc --noEmit, npm run build. Oppdater MASTER-SKJERMPLAN-hakene + endringsloggen. Commit: feat(agencyos): fokus-spiller pin + AI-forslag på cockpit.
```

---

## 3. Fellesmelding-flyt (AgencyOS Turneringer) — TYPE: BYGG

Design finnes: `coach-flows/screens-broadcast.js` (modalen finnes i appen, men Send sender ingenting). Lim inn i **Claude Code**:

```
Les docs/MASTER-SKJERMPLAN.md, .claude/rules/design-porting-gate.md, CLAUDE.md og docs/kobling-godkjenning/agencyos-godkjent-2026-06-05.md. Du er i design/komplett.

Kontekst: /admin/tournaments har i dag en Fellesmelding-modal, men Send-knappen gjør ingenting (onClick = onClose) — se src/components/admin/turneringer/turneringer.tsx. Fasit-designet for full flyt ligger i coach-flows/screens-broadcast.js.

Mål: Fullfør broadcast-flyten fra en turnering:
velg turnering → velg deltakere (alle påmeldte forhåndshuket, foreldre for juniorer auto-varsles) → skriv melding med ferdigblokker (Baneinfo / Tips / Lykke til / Tee-tider / Vær) + AI-knapp «Caddie: stram inn» → velg kanaler (push / e-post / SMS) → Send → bekreftelse («n/n levert»). Wire Send-knappen til en ekte server action.

Tema: mørkt (.dark). Auth: COACH/ADMIN.
Server action: src/app/admin/tournaments/actions.ts → sendFellesmelding(turneringId, deltakerIds[], melding, kanaler[]). Oppretter Notification-rader for hver mottaker (push). E-post/SMS-utsending stubbes bak et tydelig integrasjonspunkt for senere.
Data: ingen ny modell hvis Notification finnes — ellers legg til (med RLS).

Verifiser: prisma validate/generate, tsc, build. Oppdater MASTER-SKJERMPLAN. Commit: feat(agencyos): fullfør fellesmelding-flyt fra turnering.
```

---

## 4. Spiller↔gruppe-veksler i topbar (AgencyOS, global) — TYPE: BYGG

Finnes i dag bare i Workbench-toppen. Design: `coach-flows/screens-switcher.js`. Lim inn i **Claude Code**:

```
Les docs/MASTER-SKJERMPLAN.md, CLAUDE.md og docs/kobling-godkjenning/agencyos-godkjent-2026-06-05.md. Du er i design/komplett.

Kontekst: Spiller↔gruppe-veksleren finnes i dag kun i Workbench-toppen. Fasit for den frittstående kontrollen ligger i coach-flows/screens-switcher.js.

Mål: Trekk veksleren ut til AdminShell-topbaren (src/components/admin/admin-shell.tsx) så den er FAST på alle AgencyOS-skjermer:
- To segmenter: Spiller-modus (1 avatar) og Gruppe-modus (avatar-stack).
- Picker med søk + «nylig sett» + hurtigtaster (G1/G2).
- Valgt spiller/gruppe styrer kontekst på tvers (Cockpit, Stall, Workbench leser samme valg).

Tema: mørkt (.dark). Design: følg screens-switcher.js + globals.css.
State: valgt entity i et React context (AgencyContext) som de andre skjermene leser. Persistér «nylig sett» i localStorage.
Auth: COACH/ADMIN.

Verifiser: tsc, build. Oppdater MASTER-SKJERMPLAN. Commit: feat(agencyos): global spiller/gruppe-veksler i topbar.
```

---

## Rekkefølge (anbefalt)

1. **Turnering-detalj** (DESIGN) — kjør denne i Claude Design først, så den blir en del av handoveren og kan porteres som alt annet.
2. **Spiller→Workbench + veksler** (BYGG) — kjernen i lean-omleggingen.
3. **Fokus-pin + AI** (BYGG).
4. **Fellesmelding** (BYGG).
