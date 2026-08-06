# UkeKalender

Ukevisningens ramme. Lerretet sendes som children.

```jsx
<UkeKalender weekLabel="Uke 32" rangeLabel="3.–9. august 2026"
  onPrev={forrige} onNext={neste} onToday={hopp}
  toolbar={<VisningsVelger value="uke" onChange={bytt} />}
  dataOdId="kalender-uke">
  <TimeGrid … />
</UkeKalender>
```

- Grensen mot `TimeGrid`: TimeGrid er selve tidslerretet (1 px = 1 minutt);
  UkeKalender er hodet rundt det — uketall, spenn, navigasjon. Uten dette
  skillet får hver flate sitt eget håndrullede kalenderhode.
- Navigasjonsknappene rendres kun når handleren finnes — en ramme i et
  lese-artefakt (foreldreportalen) har lovlig ingen knapper.
- `state` går via `Region`; tomteksten peker til Workbench fordi det er der
  økter faktisk legges inn — aldri «Ingen data».
- Container-terskel 560 px: datospennet ryker, uketallet står. Omregnet, ikke
  oversatt: PlayerHQ-kolonnen er 430 px og skal aldri vise spennet; AgencyOS
  hovedspalte (~860 px) skal alltid vise det. 560 ligger mellom, målt mot
  containeren (wrap-elementet), ikke vinduet.

## Bindende

Rammen eier ALL ukenavigasjon. Et lerret (TimeGrid/agendaliste) skal aldri få
egne forrige/neste-knapper — to navigasjoner over samme uke leser som feil.
