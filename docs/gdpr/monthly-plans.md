# Månedsplaner

Tillegget `monthly_plans` lagrer én månedsplan per spiller **eller** gruppe, år og måned. En sjekk i databasen krever nøyaktig én eier. Ingen ukeplan eller medlemsplan endres av disse handlingene.

Innhold: fokus, målsetninger, formål, sted, notat, ønsket timeramme for FYS/TEK/SLAG/SPILL/TURN, prioriteringer for de 19 områdene og separate spiller-/coachevalueringer. Det er planinnhold med fritekst, som kan inneholde personopplysninger. Visningen henter faktisk planlagt og registrert mengde separat fra eksisterende uke-/øktkilder.

Tilgang kontrolleres på hver serverhandling. Spilleren eier aktiv personlig plan. En coach med gjeldende lesetilgang kan sende forslag; spilleren godkjenner. Avslåtte forslag slettes. Gruppeskriving krever administrator, gruppe-eier eller aktivt COACH-medlemskap i den eksakte gruppen. Aktive gruppemedlemmer kan lese gruppeplanen. Foreldre bruker eksisterende godkjente foreldreflyter; denne API-en er lukket for PARENT.

Aktiv plan og forslag lagres separat. Revisjon og forslagets grunnrevisjon hindrer at et eldre forslag overskriver nyere innhold. Request-ID/hash hindrer dobbel skriving ved gjentatt forespørsel. Evalueringens forfatter og tidspunkt settes på serveren; evaluering åpnes etter avsluttet måned i Oslo.

RLS er aktivert og tvunget på den nye tabellen. `PUBLIC`, `anon` og `authenticated` har ingen tabellrettigheter eller policies. Lesing og skriving går via beskyttede serverhandlinger. Ingen personlig data skrives i migrasjonen.

Personlig plan slettes ved fysisk sletting av eierkontoen gjennom `playerId`-fremmednøkkel; gruppeplan slettes ved fysisk sletting av gruppen. Den eksisterende kontoeksporten inkluderer personlige månedsplaner og egne forfatterspor; en coach får ingen annen spillers aktive månedsplan i sin personlige eksport. Anonymisering vasker personlig fritekst og egne forfatter-ID-er, fjerner forslag, og beholder bare validerte timer/prioriteringer og score. Gruppeinnhold forfattet av kontoen får friteksten vasket. En annen spillers aktive personlige plan beholdes når en coach anonymiseres; coachens forslag/evaluering vaskes. Revisjonssjekk stopper samtidig overskriving. Gruppens øvrige fritekst kan omtale andre medlemmer og følger virksomhetens bevaringsrutiner.

Migrasjonen er additiv og skal gjennomgås og brukes separat på riktig prosjekt. Ingen automatisk migrering mot eksisterende produksjonsdatabase inngår i klienten.
