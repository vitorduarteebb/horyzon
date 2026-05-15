/** Mesmo valor em NextAuth (`secret`) e onde for preciso ler o JWT no Node. */
export function getAuthSecret() {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
}
