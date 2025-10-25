import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";
import PlausibleProvider from "next-plausible";
import AnchorNav from "@/components/AnchorNav";

export const metadata: Metadata = {
  metadataBase: new URL("https://f1-analisis.vercel.app"),
  title: {
    template: "%s · F1 Análisis",
    default: "F1 Análisis"
  },
  description:
    "Datos en vivo y contenido clave de la Fórmula 1 en una sola página optimizada para cualquier dispositivo.",
  openGraph: {
    title: "F1 Análisis",
    description:
      "Calendario, pilotos, clima y resultados de Fórmula 1 en una experiencia rápida, multidioma y PWA.",
    siteName: "F1 Análisis",
    type: "website",
    url: "https://f1-analisis.vercel.app"
  },
  twitter: {
    card: "summary_large_image",
    title: "F1 Análisis",
    description:
      "Toda la información relevante de Fórmula 1 en vivo con soporte multidioma y PWA.",
    creator: "@f1analisis"
  }
};

export const viewport: Viewport = {
  themeColor: "#dc0000"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-slate-950 text-slate-100">
        <PlausibleProvider domain="f1-analisis.vercel.app" taggedEvents>
          <Providers>
            <AnchorNav />
            {children}
          </Providers>
        </PlausibleProvider>
      </body>
    </html>
  );
}
