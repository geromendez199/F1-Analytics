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
import About from "./(sections)/About";
import { resolveLocale } from "@/lib/i18n";

export default function HomePage({ searchParams }: { searchParams?: { lang?: string } }) {
  const locale = resolveLocale(searchParams?.lang);
  return (
    <main>
      <Hero locale={locale} />
      <Live />
      <Calendar />
      <Drivers />
      <Teams />
      <Cars />
      <Tyres />
      <Flags />
      <Weather />
      <Results />
      <About />
    </main>
  );
}
