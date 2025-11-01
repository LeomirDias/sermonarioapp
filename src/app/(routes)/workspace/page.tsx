import { redirect } from "next/navigation";

import SermonBuilder from "@/app/(routes)/workspace/_components/sermon-builder";
import { getSession } from "@/lib/session";

export default async function AppPage() {
  const session = await getSession();

  if (!session) {
    redirect("/acess-not-found");
  }

  return <SermonBuilder user={session.name || ""} email={session.email} />;
}
