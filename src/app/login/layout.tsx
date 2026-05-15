/** Segment config só pode ficar num Server Component — evita HTML/JS da página /login ficarem cacheados na CDN. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
