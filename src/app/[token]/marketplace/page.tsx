import { redirect } from "next/navigation";

import { searchTokenByToken, searchUserByToken } from "@/actions/search-token";

import MarketplaceClient from "./_components/marketplace-client";

interface MarketplacePageProps {
    params: Promise<{
        token: string;
    }>;
}

export default async function MarketplacePage({ params }: MarketplacePageProps) {
    const { token } = await params;

    const tokenResult = await searchTokenByToken(token);

    if (!tokenResult.success) {
        redirect("/acess-not-found");
    }

    const user = await searchUserByToken(token);

    if (!user.success) {
        redirect("/acess-not-found");
    }

    return <MarketplaceClient token={token} />;
}