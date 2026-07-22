# Synlighet — runde 2 (fyll ut)

**Når:** Etter at du har sett `PUNKT-KATALOG-KOMPLETT.md`  
**Mål:** Bestemme hva som er **synlig** i meny/CTA — ikke bygge mer enn nødvendig.

---

## Slik svarer du (velg én stil)

### Stil A — Enkel (anbefalt)

Skriv tre lister:

1. **Må være synlig** (det spillere/coacher bruker hver dag)  
2. **Skjul midlertidig** (finnes, men ikke i meny)  
3. **Bryr meg ikke nå**

### Stil B — Etter produkt

```
PlayerHQ synlig: ...
PlayerHQ skjult: ...
AgencyOS synlig: ...
AgencyOS skjult: ...
Offentlig: ...
```

### Stil C — Kryss av i katalogen

Åpne `PUNKT-KATALOG-KOMPLETT.md` og endre kolonne **S** fra `?` til `JA` / `NEI`.

---

## Forslag (startpunkt — ikke låst)

### Alltid synlig (core)
Hjem · Plan · Gjør · Analyse · Meg · Cockpit · Innboks · Stall · Planlegge

### Synlig (typisk)
Runder · TrackMan · Teknisk plan · Tester · SG · Drills · Booking · Godkjenninger · Kalender

### Ofte «skjul til vi er klare»-kandidater
- Talent-radar / talent-sammenligning  
- Live mission control  
- Caddie / AI-agenter (hvis for tidlig for coacher)  
- Moderering / audit (kun admin)  
- DataGolf / gameplan hvis lite brukt  
- Hurtigmodus runde (finnes ikke ferdig)  
- TM-baseline-godkjenning i UI (ikke ferdig)

### Aldri synlig som «produkt»
FullSving-app · GolfBox-import · CoachHQ-navn · to TrackMan-importknapper

---

## Etter din beslutning

1. Oppdater `src/lib/product-visibility.ts` (`on` / `off`)  
2. Koble filter til `PLAYERHQ_NAV` / `AGENCYOS_MER` (liten kodejobb)  
3. Bygg bare TODO-punkter som har **S=JA**

Si **«synlighet: …»** når du er klar.
