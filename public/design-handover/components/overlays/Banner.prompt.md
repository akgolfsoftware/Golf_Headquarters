# Banner

Hel-bredde varselbar. Brukes øverst på side eller i panel.

## Bruk
```jsx
<Banner
  tone="warning"
  title="Abonnement utløper"
  description="PRO-abonnementet ditt utløper om 3 dager."
  action="Forny nå"
  onAction={() => navigate("/priser")}
  onClose={() => setBannerVisible(false)}
/>
```
