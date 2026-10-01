/** Local-only runner output must not retain login codes or credentials. */
export function redactLocalUsersOutput(line, secrets = []) {
  let result = line.replace(/((?:code|token|token_hash|access_token|refresh_token)=)[^\s&]+/gi, '$1[redacted]');
  for (const secret of secrets) {
    if (typeof secret === 'string' && secret.length >= 8) result = result.replaceAll(secret, '[redacted]');
  }
  return result;
}
