import type { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { getSession } from "@/lib/session";

import { mockTutorialVideos, TutorialVideoGallery } from "./_components";

export const metadata: Metadata = {
  title: "Sermonário - Tutoriais",
};

const TutorialsPage = async () => {
  const session = await getSession();

  if (!session) {
    redirect("/acess-not-found");
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Tutoriais</PageTitle>
          <PageDescription>
            Tire suas dúvidas e aprenda mais sobre o Sermonário! Assista aos
            vídeos tutoriais para dominar todas as funcionalidades da
            plataforma.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <></>
        </PageActions>
      </PageHeader>
      <PageContent>
        <TutorialVideoGallery videos={mockTutorialVideos} />
      </PageContent>
    </PageContainer>
  );
};

export default TutorialsPage;
