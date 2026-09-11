# Valgt Train-lock — ZIP (4)

Anders valgte `Player HQ Train lock (4).zip` for PlayerHQ og AgencyOS 10.09.2026. ZIP-ens SHA-256 er `2bfe81ac5d3f131e5a667fca28205732119e2f6c36c0b50178b57953626fbd85`.

Denne mappen bevarer de kildefilene som er brukt til det nye felleslaget og Nå-kortet. Innholdet er kopiert uendret; komponentfilnavn er normalisert til kebab-case. Resten av pakken ligger i det private kildearkivet, omtalt i [porteringsrapporten](../../../docs/design-audit/portering-fire-flater-2026-09-10.md).

Tokens beskriver v3 «Warm», også der en eldre komponentkommentar fortsatt sier v2. Dette er kilder, ikke appkode eller nye kjøreordrer. `src/styles/train-lock-valgt.css` oversetter verdiene til appens eksisterende tema og avgrenser dem til `/portal` og `/admin`.

Lesbarhetsavvik i implementeringen:

- Sekundærtekst i lys er `#69696E` i stedet for kildens `#6E6E73`: målt 4,50:1 på dock og 4,83:1 på scene, mot 4,18:1 og 4,49:1 i kilden.
- Liten status-/chiptekst bruker nøytral tekst i lys der signalfargen ikke holder. Tint og tilstandsord beholdes. `warm-ink` er tilgjengelig for hvite kort; den er ikke lesbar som liten tekst på papir.
- Lange ord og forstørret tekst får bryte linje. Treffmål er minst 44 piksler.

Dette er ikke visuell godkjenning av noen hel skjerm.
