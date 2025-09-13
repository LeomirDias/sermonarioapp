import type { Metadata } from "next";

import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";

import { mockTutorialVideos, TutorialVideoGallery } from "./_components";



export const metadata: Metadata = {
  title: "iGenda - Tutoriais",
};

const TutorialsPage = async () => {

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Tutoriais</PageTitle>
          <PageDescription>
            Tire suas dúvidas e aprenda mais sobre o Sermoário! Assista aos vídeos tutoriais para dominar todas as funcionalidades da plataforma.
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
