Text or search field; use for any single-line entry — login, search bars, forms.

```jsx
<Input placeholder="post@akgolf.no" leadingIcon="mail" />
<Input variant="search" placeholder="Søk i stallen…" />
<Input error="Ugyldig e-post" defaultValue="feil@" />
```

- **variant**: `text` (default, radius 12) · `search` (pill, leading search icon).
- **leadingIcon**: Lucide name or node; **trailing**: a node (e.g. clear button).
- **error**: `true` to mark invalid, or a string to show a message in coral.
- Focus shows a lime ring. Inherits the light theme inside a `.light` wrapper.
