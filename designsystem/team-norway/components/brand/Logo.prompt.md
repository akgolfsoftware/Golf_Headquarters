Den offisielle logoen. **Rendres alltid fra fil.** Merket skal aldri gjenskapes i markup, farges om, beskjæres, roteres, settes i annen skrift eller deles opp — de to strekene er ikke et selvstendig grafisk element.

Logoen finnes kun i positiv versjon på hvit. På mørk flate settes den derfor på en hvit plate (`onDark`), ikke inverteres.

Minste høyde 24px. Fri sone rundt merket tilsvarer høyden på den røde streken.

```jsx
<Logo height={40} />
<Logo height={48} onDark />
```

Trenger prosjektet en aksent uten selve merket, bruk en flate i navy eller rødt — ikke en etterligning av strekene.