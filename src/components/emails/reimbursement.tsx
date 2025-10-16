import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Tailwind,
    Text,
} from "@react-email/components";
import * as React from "react";

interface ReimbursementEmailProps {
    customerName: string;
}

const ReimbursementEmail = async (props: ReimbursementEmailProps) => {
    const { customerName } = props;


    return (
        <Html lang="pt-BR">
            <Head>
                <title>Reembolso Sermonário</title>
            </Head>
            <Preview>Lamentamos ter que cancelar seu acesso ao Sermonário. 😓</Preview>
            <Tailwind>
                <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f4f4f4", margin: 0, padding: 0 }}>
                    <Container style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "#ffffff", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>

                        {/* Header */}
                        <Section style={{
                            background: "linear-gradient(135deg, #3988ee 0%, #16a34a 100%)",
                            borderRadius: "8px 8px 0 0",
                            padding: "40px 0 20px 0",
                            textAlign: "center"
                        }}>
                            <Heading style={{
                                margin: 0,
                                color: "#ffffff",
                                fontSize: "32px",
                                fontWeight: "bold"
                            }}>
                                Sermonário App
                            </Heading>
                            <Text style={{
                                margin: "10px 0 0 0",
                                color: "#ffffff",
                                fontSize: "16px",
                                opacity: 0.9
                            }}>
                                Seu estruturador de sermões com IA
                            </Text>
                        </Section>

                        {/* Content */}
                        <Section style={{ padding: "40px 60px" }}>

                            {/* Welcome message */}
                            <div style={{ textAlign: "center", marginBottom: "30px" }}>
                                <div style={{ fontSize: "48px", marginBottom: "20px" }}>📖</div>
                                <Heading style={{
                                    margin: "0 0 10px 0",
                                    color: "#1f2937",
                                    fontSize: "24px",
                                    fontWeight: "bold"
                                }}>
                                    Olá, {customerName}!
                                </Heading>
                                <Text style={{
                                    margin: 0,
                                    color: "#6b7280",
                                    fontSize: "16px",
                                    lineHeight: 1.5
                                }}>
                                    Seu acesso ao Sermonário foi cancelado devido a sua solicitação de reembolso.
                                </Text>
                            </div>

                            {/* Main message */}
                            <div style={{
                                backgroundColor: "#f9fafb",
                                padding: "30px",
                                borderRadius: "8px",
                                borderLeft: "4px solid #3988ee",
                                marginBottom: "30px"
                            }}>
                                <Text style={{
                                    margin: "0 0 20px 0",
                                    color: "#374151",
                                    fontSize: "16px",
                                    lineHeight: 1.6
                                }}>
                                    Lamentamos por não conseguir atender a suas expectativas! 💙
                                </Text>
                                <Text style={{
                                    margin: 0,
                                    color: "#374151",
                                    fontSize: "16px",
                                    lineHeight: 1.6
                                }}>
                                    Caso tenha alguma sugestão, crítica ou dúvida, entre em contato com o nosso suporte:
                                </Text>
                            </div>

                            {/* Token de acesso */}
                            <div style={{
                                backgroundColor: "#f0f9ff",
                                padding: "20px",
                                borderRadius: "8px",
                                border: "1px solid #0ea5e9",
                                marginBottom: "30px",
                                textAlign: "center"
                            }}>
                                <Text style={{
                                    margin: "0 0 10px 0",
                                    color: "#0c4a6e",
                                    fontSize: "16px",
                                    fontWeight: "bold"
                                }}>
                                    📧 Suporte Sermonário
                                </Text>
                                <div style={{ textAlign: "center", margin: "40px 0" }}>
                                    <Button
                                        href={`mailto:sermonarioapp@gmail.com`}
                                        style={{
                                            backgroundColor: "#3988ee",
                                            color: "#ffffff",
                                            padding: "16px 32px",
                                            borderRadius: "6px",
                                            textDecoration: "none",
                                            fontWeight: "bold",
                                            fontSize: "16px",
                                            display: "inline-block"
                                        }}
                                    >
                                        👉🏼 Entre em contato com o suporte
                                    </Button>
                                </div>
                            </div>
                        </Section>

                        {/* Footer */}
                        <Section style={{
                            padding: "30px 60px",
                            backgroundColor: "#f9fafb",
                            borderRadius: "0 0 8px 8px",
                            borderTop: "1px solid #e5e7eb",
                            textAlign: "center"
                        }}>
                            <Text style={{
                                margin: "0 0 15px 0",
                                color: "#6b7280",
                                fontSize: "14px"
                            }}>
                                Agradecemos por ter experimentado o Sermonário. Esperamos que um dia possamos atendê-lo novamente!
                            </Text>


                            <Text style={{
                                margin: 0,
                                color: "#9ca3af",
                                fontSize: "12px",
                                lineHeight: 1.4
                            }}>
                                © 2025 Sermonário. Todos os direitos reservados.<br />
                                Desenvolvido por <a href="https://synqia.com.br" style={{
                                    color: "#3988ee",
                                    textDecoration: "none",
                                    fontWeight: "bold"
                                }}>Synqia</a>
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );

}


export default ReimbursementEmail;