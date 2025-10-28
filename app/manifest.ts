import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "F1 Análisis",
    short_name: "F1 Análisis",
    description:
      "Datos en vivo y contenido clave de la Fórmula 1 en una experiencia rápida, multidioma y lista para instalar.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#dc0000",
    lang: "es",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable"
      }
    ]
  };
}
