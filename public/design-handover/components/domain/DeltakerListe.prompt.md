# DeltakerListe

Deltakere i en gruppeøkt / Live Session med oppmøtestatus: til stede / invitert / avslått / kanskje (ord + prikk, aldri bare farge).

## Bruk
```jsx
<DeltakerListe deltakere={[
  { navn: "Øyvind Rohjan", status: "tilstede" },
  { navn: "Sofie Lindqvist", status: "invitert" },
  { navn: "Mathias Berg", status: "avslatt" },
]} />
```

## Domenefasit
Status-verdier speiler `ParticipationStatus`. Tomt = «inviter spillere». `loading` = Skeleton.
