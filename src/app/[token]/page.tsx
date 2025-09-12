import { redirect } from "next/navigation";

import { searchTokenByToken, searchUserByToken } from "@/actions/search-token";
import SermonBuilder from "@/app/[token]/_components/sermon-builder";

interface PageProps {
    params: Promise<{
        token: string;
    }>;
}

export default async function Home({ params }: PageProps) {
    const { token } = await params;

    const tokenResult = await searchTokenByToken(token);

    if (!tokenResult.success) {
        redirect("/acess-not-found");
    }

    const user = await searchUserByToken(token);

    if (!user.success) {
        redirect("/acess-not-found");
    }

    // Se o token for válido, renderiza o SermonBuilder
    return <SermonBuilder user={user.user || ""} email={user.email || ""} />;
}
