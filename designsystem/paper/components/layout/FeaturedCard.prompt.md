# FeaturedCard

Det editorielle kortet. Maks én per skjerm. Aldri i arbeidsflater.

```jsx
<FeaturedCard kicker="Nytt i PlayerHQ" title="Gameplan per bane"
  actions={<Button dataOdId="feat-prov">Prøv gameplan</Button>} dataOdId="onboarding-gameplan">
  Legg strategien før runden: buffer-soner, køllevalg per hull og én tanke
  per utslag — bygget på DECADE-prinsippene.
</FeaturedCard>
```

- Grensen mot `Panel`: Panel er arbeidsflatens kort (tett, radius --r,
  tittelrad + handling). FeaturedCard er EDITORIELT (luftig --s5-polstring,
  radius --r-md, den ene myke skyggen) og bor i marketing, onboarding og
  tomme førstegangsflater.
- Maks ÉN per skjerm — to fremhevede kort fremhever ingenting. Skal noe
  løftes i en arbeidsflate, er det OneThingNow (handling) eller Panel
  (innhold).
- Prosaen er Lora, maks 52ch. Handlinger er bibliotekets knapper.
- `soft`-varianten (soft-flate, ingen skygge) er sekundær fremheving —
  f.eks. neste steg i en onboardingrekke.
