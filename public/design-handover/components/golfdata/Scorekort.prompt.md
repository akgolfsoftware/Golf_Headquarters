# Scorekort

Hull-for-hull med SG per hull + runde-sammendrag (score mot par, SG for runden). Score farget mot par — men tallet + fortegn (E / +1 / −1) bærer samme info.

## Bruk
```jsx
<Scorekort
  sammendrag={{ score: 71, par: 72, sg: +1.2 }}
  hull={[{nr:1,par:4,score:4,sg:0.1},{nr:2,par:3,score:2,sg:0.8}, /* … */]} />
```

## Domenefasit
Score vs par: birdie/bedre = --up, bogey = warn, dobbel+ = --down (farge aldri eneste bærer). SG i slag (--up/--down), aldri lime. Tomt = onboarding.
