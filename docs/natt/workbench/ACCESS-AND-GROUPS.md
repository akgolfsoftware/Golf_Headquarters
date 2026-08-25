# Access, Groups & Propagation — locked model

**Dato:** 24.08.2026  
**Status:** Låst av eier  
**Gjelder:** AgencyOS + PlayerHQ + Workbench

---

## 1. Plattformen er todelt

### A. Gruppe- / akademi-spillere (lisens inkludert)

Spillere som er medlem i én eller flere **grupper** under AK Golf / samarbeidspartnere.

**Eksempler på gruppenavn (ikke uttømmende):**
- GFGK (inkl. Mini, Utvikling, Basis, Elite eller tilsvarende nivåer)
- AK Golf Academy
- WANG Toppidretts Fredrikstad
- AK Golf Performance
- AK Golf Performance Pro

**Regel:** Disse spillerne har **lisens inkludert**. Coach og Agency OS har tilgang til dem så lenge medlemskapet er aktivt.

### B. Self-serve / nettside-abonnenter

Personer som oppretter abonnement via nettsiden (månedlig eller årlig) og **ikke** er medlem i noen gruppe.

**Regel:** Coach og Agency OS har **ingen tilgang** til disse spillerne før de kjøper et produkt som åpner tilgang (f.eks. online instruksjon V2 eller tilsvarende).  
Inntil kjøp: de er usynlige i Stall, Workbench, Innboks og alle coach-flater.

---

## 2. Tilgang (Access / Entitlement) — hard gate

| Situasjon | Coach/Agency ser spilleren? | Kan planlegge / lese data? |
|-----------|----------------------------|----------------------------|
| Medlem i ≥1 aktiv gruppe | Ja | Ja (innenfor gruppens scope + egne økter) |
| Kun self-serve abonnement, ingen kjøpt coach-produkt | Nei | Nei |
| Self-serve + kjøpt tilgangsprodukt (f.eks. online instruksjon) | Ja | Ja, begrenset til det produktet gir |
| Tidligere gruppemedlem, medlemskap avsluttet, ingen aktiv entitlement | Nei (med mindre nytt kjøp) | Nei |

**GDPR / minors:**  
- Tilgang er entitlement-basert, ikke «alle i systemet».  
- Logg IDs, ikke unødvendig navn i logger.  
- Gruppe-medlemskap og entitlement er kilde til sannhet for hvem coach får se.

**Implementeringskrav:**  
Alle Agency-queries (`loadStall`, `loadWeek`, `searchPlayers`, …) **må** filtrere på:

```
player has active GroupMembership OR player has active CoachAccessEntitlement
```

Ingen unntak for «debug» eller «admin ser alle» uten eksplisitt super-admin-rolle.

---

## 3. Multi-gruppe medlemskap

En spiller kan være medlem i **flere grupper samtidig**.

Eksempel: samme person i GFGK + WANG Toppidretts Fredrikstad + AK Golf Performance.

**Konsekvenser:**
- Spilleren dukker opp i Stall/Workbench for hver gruppe coach har tilgang til.
- Gruppeplanlegging i gruppe A materialiserer økter på spillerens private profil.
- Gruppeplanlegging i gruppe B gjør det samme — uavhengig.
- Privat profil = union av egne økter + alle materialiserte gruppeøkter + godkjente coach-forslag.

---

## 4. Gruppeplanlegging → privat profil (propagation)

Når Agency OS planlegger i **GROUP-modus**:

| Handling på gruppeøkt | Effekt på hvert aktivt medlems private profil |
|-----------------------|-----------------------------------------------|
| Opprett gruppeøkt | Opprett **materialisert** individ-økt per medlem (samme tid, innhold, `groupId` + `sourceGroupSessionId`) |
| Endre tid / tittel / drills | Oppdater alle materialiserte individ-økter som fortsatt er linket |
| Slett gruppeøkt | Slett (eller markér CANCELLED) alle materialiserte individ-økter |
| Publiser gruppeøkt | Sett status PUBLISHED på materialiserte økter (synlig i spillerens «I dag») |

**Regler:**
1. Materialiserte økter har `origin: "GROUP"` og peker tilbake til gruppeøkten.
2. Hvis spilleren selv har endret den materialiserte økten lokalt → **konfliktstrategi** (se under).
3. Nye medlemmer som legges til gruppen etter at økten er opprettet får økten materialisert ved neste sync / umiddelbart ved add.
4. Medlem som fjernes fra gruppen: materialiserte fremtidige gruppeøkter fjernes eller markeres; historikk beholdes etter policy.

### Konflikt når spiller har redigert lokalt

Spilleren står **alltid fritt** til å endre sin private profil (låst produktregel).

Når coach/gruppe deretter endrer den underliggende gruppeøkten:

- Systemet markerer individ-økten som `needsReview: true` / status «Oppdatert fra gruppe — godkjenn».
- Spilleren får tydelig UI: **Godta gruppeendring** | **Behold min versjon**.
- Ingen silent overwrite av spillerens lokale endringer.

Når coach endrer en **individuell** økt (ikke gruppe) for en spiller:

- Samme godkjenningflyt: spilleren får «Forslag fra coach» → Godta / Avvis.

---

## 5. Session origin & ownership (domain)

Hver `WorkbenchSession` skal vite hvor den kommer fra:

| origin | Betydning |
|--------|-----------|
| `PLAYER` | Spilleren opprettet selv |
| `COACH` | Coach opprettet for én spiller (krever godkjenning hvis allerede publisert / spiller eide den) |
| `GROUP` | Materialisert fra gruppeplanlegging |

Felter (se `types.ts`):
- `groupId?: string`
- `sourceGroupSessionId?: string` — id på gruppeøkten
- `origin: "PLAYER" | "COACH" | "GROUP"`
- `needsPlayerApproval?: boolean`
- `approvalStatus?: "PENDING" | "ACCEPTED" | "REJECTED"`

---

## 6. Workbench modes (oppdatert)

| Mode | subjectId | Hva coach/spiller ser |
|------|-----------|------------------------|
| `PLAYER` | playerId | Én spillers private uke (egne + materialiserte + godkjente) |
| `GROUP` | groupId | Gruppeplan: én logisk uke som propagates til alle aktive medlemmer |
| `AGENCY` | playerId eller «stall» | Individuell planlegging for spillere coach har entitlement til |

GROUP-modus skriver **én** gruppeøkt + N materialiseringer.  
PLAYER/AGENCY på individ skriver **én** rad (med approval-regler når coach → spiller).

---

## 7. GDPR-sjekkliste (kort)

- [ ] Coach ser kun spillere med aktiv entitlement (gruppe eller kjøpt produkt)
- [ ] Self-serve uten kjøpt coach-produkt er usynlig i Agency
- [ ] Multi-gruppe = flere membership-rader, ikke duplikat person
- [ ] Slett/export av person: fjern memberships + entitlements + sessions etter policy
- [ ] Logger bruker IDs, ikke fulle navn unødvendig
- [ ] Minors: foresatte-innsyn er separat (FO-01) og skal ikke gi coach ekstra data uten entitlement

---

## 8. Status mot implementering

| Del | Design/domain | Kode |
|-----|---------------|------|
| Todelt plattform (gruppe vs self-serve) | Låst her | Må gates i alle Agency loaders |
| Multi-gruppe membership | Låst her | Tabell `GroupMembership` |
| Lisens inkludert i gruppe | Låst her | Entitlement derived from membership |
| Self-serve først etter kjøp | Låst her | Entitlement from purchase |
| Gruppeøkt → materialiser til privat profil | Låst her + types | `propagateGroupSession*` operations |
| Spiller kan alltid redigere privat | Låst | PLAYER mode write |
| Coach-endring → spiller godkjenning | Låst | `needsPlayerApproval` + UI |
| Konflikt gruppe vs lokal edit | Låst | Godta / Behold min versjon |

---

## 9. Neste konkrete steg (domain)

1. Utvid `types.ts` med Group, GroupMembership, Entitlement, origin/approval-felter (gjort i samme leveranse).
2. Pure operations: `materializeGroupSession`, `propagateGroupUpdate`, `propagateGroupDelete`, `resolvePlayerApproval`.
3. Server actions filtrerer alltid på entitlement.
4. UI: Stall og player-søk respekterer gate; Workbench GROUP-modus viser propagation-status.

Dette dokumentet er kilde til sannhet for tilgang og gruppe-propagasjon. Ved konflikt med eldre tekst i HANDOFF (eksternt Claude Design-dokument, ikke i repoet) eller integration/player-hq.md vinner **dette** dokumentet på access/group-spørsmål.
