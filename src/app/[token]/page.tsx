import { redirect } from "next/navigation";

import { searchTokenByToken } from "@/actions/search-token";
import SermonBuilder from "@/app/[token]/_components/sermon-builder";

interface PageProps {
    params: {
        token: string;
    };
}

export default async function Home({ params }: PageProps) {
    const { token } = await params;

    // Busca o token no banco de dados
    const tokenResult = await searchTokenByToken(token);

    // Se o token não for encontrado ou estiver inativo, redireciona para a página de acesso negado
    if (!tokenResult.success) {
        redirect("/acess-not-found");
    }

    // Se o token for válido, renderiza o SermonBuilder
    return <SermonBuilder />;
}
