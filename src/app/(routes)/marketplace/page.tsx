import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";

import MarketplaceClient from "./_components/marketplace-client";

export default async function MarketplacePage() {
  const session = await getSession();

  if (!session) {
    redirect("/acess-not-found");
  }

  return <MarketplaceClient token={session.sid} />;
}
