// app/[token]/page.tsx

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface TokenPageProps {
  params: { token: string };
}

export default async function TokenPage({ params }: TokenPageProps) {
  const { token } = await params;

  if (!token) redirect("/");

  // Redireciona diretamente para a API route
  redirect(`/api/auth/exchange?token=${encodeURIComponent(token)}`);
}
