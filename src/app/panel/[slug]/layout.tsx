import { notFound } from "next/navigation";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const expectedSlug = process.env.ADMIN_ROUTE_SLUG;

  if (!expectedSlug || slug !== expectedSlug) {
    notFound();
  }

  return <>{children}</>;
}
