# TidsVelger

Booking-tidvelger: rutenett av tidsluker for én dag. Ledig (klikkbar), booket (disabled + gjennomstreket), valgt (signal-fylt). 44px trykkmål.

## Bruk
```jsx
<TidsVelger valgt={valgt} onVelg={setValgt} luker={[
  { tid: "09:00", status: "ledig" },
  { tid: "10:00", status: "booket" },
  { tid: "11:00", status: "ledig" },
]} />
```

## Domenefasit
Booket = ikke-klikkbar (tilstanden ER forklaringen). Farge aldri eneste bærer — gjennomstreking + `aria-label` bærer også. Tid alltid 24h. Tomt = «ingen ledige tider».
