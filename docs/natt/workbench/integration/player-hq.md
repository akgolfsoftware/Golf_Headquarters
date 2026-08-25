# Player HQ ↔ Workbench integration

**Oppdatert:** 24.08.2026  
**Overstyrer eldre «Player never writes»-tekst der den kolliderer.**  
**Access/group:** se `ACCESS-AND-GROUPS.md` (vinner på tilgang og gruppe-propagasjon).

---

## 1. Tilgang (hard gate)

Agency/Coach ser **kun** spillere som:

- har ≥1 aktiv `GroupMembership` (GFGK, WANG, AK Golf Performance, Academy, … — lisens inkludert), **eller**
- har aktiv `CoachAccessEntitlement` fra kjøp (self-serve etter produktkjøp, f.eks. online instruksjon V2).

Self-serve uten kjøpt coach-produkt = **usynlig** i Stall, Workbench, søk og alle Agency-flater.

En spiller kan være i **flere grupper** samtidig. Union av memberships + entitlements styrer synlighet.

---

## 2. «I dag»-kort (Player)

- Query: `LoadPlayerDay({ playerId, date })`
- Viser økter med status PUBLISHED | IN_PROGRESS | (godkjente forslag)
- Viser også materialiserte gruppeøkter som er publisert
- Viser `needsPlayerApproval` som egen rad/kort: «Forslag fra coach / gruppe — Godta / Avvis»
- Aldri rå DRAFT fra coach uten approval-flag

---

## 3. Plan / Min uke (Player mode)

- Mode = `"PLAYER"`, subjectId = playerId
- Spilleren kan **alltid** opprette, flytte, redigere og slette i sin private profil (`origin: "PLAYER"`)
- Ser union av:
  - egne økter
  - materialiserte gruppeøkter (`origin: "GROUP"`)
  - coach-forslag (`origin: "COACH"`, `needsPlayerApproval`)
- Godkjennings-UI på pending forslag (coach eller gruppe-oppdatering etter lokal edit)

---

## 4. Gruppeplanlegging → privat profil

Når coach planlegger i **GROUP**-modus:

1. Én gruppe-master-økt lagres
2. Systemet materialiserer én rad per aktivt medlem (`origin: "GROUP"`, `sourceGroupSessionId`, samme innhold)
3. Endring/sletting av master **propageres** til alle materialiserte rader som ikke har `localOverride`
4. Har spilleren redigert lokalt → `needsPlayerApproval` + UI «Godta gruppeendring / Behold min versjon»

---

## 5. Coach endrer individuell spillerøkt

- Coach write på annen spillers rad → `needsPlayerApproval: true`, `approvalStatus: "PENDING"`
- Spilleren Godtar eller Avviser
- Før godkjenning: synlig som forslag, ikke som «låst plan» i OneThingNow med mindre product policy sier noe annet

---

## 6. Status-sync (gjennomføring)

| Hendelse | Status |
|----------|--------|
| Spiller starter | → IN_PROGRESS |
| Spiller fullfører | → COMPLETED |
| Coach/gruppe publiserer | → PUBLISHED (på materialiserte / godkjente rader) |

Coach ser status i Agency Workbench (realtime eller reload).

---

## 7. Tokens

- Player HQ: Train-lock only
- Agency desktop: kan bruke Paper-tokens; samme motor inne i Player = Train-lock

---

## 8. Success criteria (utvidet)

- [x] Domain + operations (base)
- [x] Access + groups model dokumentert og typet
- [ ] Entitlement-filter i alle Agency loaders
- [ ] GROUP create → materialise N player rows
- [ ] Propagate update/delete
- [ ] Player approval UI (coach + gruppe-konflikt)
- [ ] Uke-visning Agency + Player
- [ ] Publish med varsel for ufullstendige økter
