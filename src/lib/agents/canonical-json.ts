// Kanonisk JSON-sammenligning for beslutningsfangst på PlanAction.
//
// `editedBeforeApproval` skal være true kun når coachen faktisk endret
// forslaget — ikke når nøkkelrekkefølgen tilfeldigvis avviker. Derfor
// sorteres objektnøkler rekursivt før sammenligning.

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([k, v]) => [k, sortKeys(v)]),
    );
  }
  return value;
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

export function isEditedSuggestion(original: unknown, incoming: unknown): boolean {
  return canonicalJson(original) !== canonicalJson(incoming);
}
