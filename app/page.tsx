import Hero from "./(sections)/Hero";
import Live from "./(sections)/Live";
import Calendar from "./(sections)/Calendar";
import Drivers from "./(sections)/Drivers";
import Teams from "./(sections)/Teams";
import Cars from "./(sections)/Cars";
import Tyres from "./(sections)/Tyres";
import Flags from "./(sections)/Flags";
import Weather from "./(sections)/Weather";
import Results from "./(sections)/Results";
import News from "./(sections)/News";
import Highlights from "./(sections)/Highlights";
import Telemetry from "./(sections)/Telemetry";
import About from "./(sections)/About";
import { resolveLocale } from "@/lib/i18n";
import LocaleProvider from "@/components/LocaleProvider";

export default function HomePage({ searchParams }: { searchParams?: { lang?: string } }) {
  const locale = resolveLocale(searchParams?.lang);
  return (
    <LocaleProvider locale={locale}>
      <main>
        <Hero locale={locale} />
        <Live />
        <Calendar locale={locale} />
        <Drivers locale={locale} />
        <Teams locale={locale} />
        <Cars locale={locale} />
        <Tyres locale={locale} />
        <Flags locale={locale} />
        <Weather locale={locale} />
        <Results locale={locale} />
        <News locale={locale} />
        <Highlights locale={locale} />
        <Telemetry locale={locale} />
        <About locale={locale} />
      </main>
    </LocaleProvider>
  );
}
