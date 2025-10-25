export default function About() {
  return (
    <section id="acerca" aria-labelledby="about-title" className="container mx-auto px-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        <h2 id="about-title" className="text-3xl font-semibold text-white">
          Acerca del proyecto
        </h2>
        <p className="mt-4 text-sm text-slate-300">
          F1 Análisis es una Single Page App diseñada para consolidar información clave de Fórmula 1 en tiempo real
          con foco en rendimiento, accesibilidad y disponibilidad offline. Las integraciones de datos provienen de
          proveedores públicos como OpenWeather y endpoints históricos (Ergast u otros) y pueden activarse o reemplazarse
          según disponibilidad y términos legales.
        </p>
        <p className="mt-4 text-sm text-slate-300">
          El proyecto es open source (MIT) y se despliega preferentemente en Vercel utilizando Next.js 15, Tailwind CSS
          y TanStack Query. Las secciones se diseñan como anclas para facilitar la navegación rápida desde cualquier
          dispositivo y soportan modo PWA para recibir notificaciones antes de cada sesión.
        </p>
      </div>
    </section>
  );
}
