export interface TutorialVideo {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    videoUrl: string;
    duration: string;
    category: string;
}

export const mockTutorialVideos: TutorialVideo[] = [
    {
        id: "1",
        title: "Como começar a utilizar o Sermonário...",
        description: "Entenda como utilizar o gerador de sermões com IA",
        thumbnailUrl: "https://guvcjnxjbt1wpets.public.blob.vercel-storage.com/CapaComoUtilizar.png",
        videoUrl: "https://guvcjnxjbt1wpets.public.blob.vercel-storage.com/Tutorial%20-%20Sermon%C3%A1rio.mp4",
        duration: "2:24",
        category: "Utilização"
    },
];
