/** Mesmo valor em `auth`, middleware e JWT — evita cookies que não decodem. */
export function getAuthSecret() {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
}
