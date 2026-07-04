Separate digit boxes for verification codes; use on BankID / e-post confirmation screens.

```jsx
const [code, setCode] = React.useState("");
<CodeInput length={6} value={code} onChange={setCode} autoFocus />
<CodeInput length={4} error />
```

- Auto-advances on type, steps back on backspace, supports paste-to-fill.
- **length** 4–6. Big tabular mono, lime caret, focus ring per box; **error** turns boxes coral.
