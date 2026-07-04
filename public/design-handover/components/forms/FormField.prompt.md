# FormField

Etikett + kontroll + hint + feil-omslutning for alle skjemafelt.

## Bruk
```jsx
<FormField label="E-post" required hint="Vil ikke bli delt" error={errors.email}>
  <Input type="email" value={email} onChange={setEmail} error={!!errors.email} />
</FormField>
```
