/** CSS-moduler er ikke JavaScript. Komponenttestene leser bare markup, så alle .css-filer lastes som tomme moduler. */
import { registerHooks } from "node:module";

registerHooks({
  load(url, context, nextLoad) {
    if (url.endsWith(".css")) return { format: "commonjs", source: "module.exports = {};", shortCircuit: true };
    return nextLoad(url, context);
  },
});
