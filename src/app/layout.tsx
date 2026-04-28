import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Peak Hours Monitor — Maggio & GLM-5.1",
  description:
    "Descubra os horários de pico e limitações dos serviços de IA globais com conversão automática de fuso horário. Desenvolvido por Maggio & GLM-5.1.",
  keywords: [
    "AI",
    "peak hours",
    "horários de pico",
    "serviços de IA",
    "fuso horário",
    "monitor",
    "ChatGPT",
    "Claude",
    "Gemini",
    "Maggio",
    "GLM-5.1",
  ],
  authors: [{ name: "Maggio & GLM-5.1" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
          </Providers>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
