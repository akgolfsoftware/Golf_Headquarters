Kort-grid over fullførte testøkter, lagret av ProtocolScorecard (sessionKey/completable → «Fullfør test»-knapp med vitne-felt skriver til `session-store.js` i localStorage).

```jsx
<SessionHistoryList />                          /* leser lagrede økter selv */
<SessionHistoryList deletable max={6} />
<SessionHistoryList sessions={demoSessions} />  /* statisk/demo */
```

Hvert kort viser protokoll, spiller · dato · klasse, total-badges og vitne. `onSelect` gjør kortene klikkbare. Tom tilstand har innebygd forklaring. Se `ProtocolScorecard.prompt.md` for lagringsflyten.
