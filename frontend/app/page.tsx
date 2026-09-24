import { FeatureCard } from "@/components/FeatureCard";
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { LogoMark } from "@/components/LogoMark";
import { ReviewsSection } from "@/components/ReviewsSection";

const features = [
  {
    title: "Podgląd postępu",
    description: "Wizualne wskaźniki postępu każdego projektu. Od razu widać, co idzie dobrze, a co wymaga uwagi.",
    icon: "📊",
    highlighted: true,
  },
  {
    title: "Zarządzanie zespołem",
    description: "Dodawaj członków, przypisuj role i zadania. Każdy dokładnie wie, za co odpowiada.",
    icon: "👥",
  },
  {
    title: "Terminy i priorytety",
    description: "Dzięki systemowi wyznaczania terminów końcowych możesz mieć pewność, że projekt zostanie wykonany na czas.",
    icon: "⏰",
  },
  {
    title: "Moje zadania",
    description: "Podziel projekt na zadania, śledź postępy i realizuj każdy etap aż do zakończenia.",
    icon: "✅",
  },
  {
    title: "Kontrola dostępu",
    description: "Project Manager widzi całość, a uczestnik projektu koncentruje się na swoich zadaniach.",
    icon: "🛡️",
  },
  {
    title: "Aktywność zespołu",
    description: "Monitoruj aktywność każdego członka zespołu oraz jego zaangażowanie w projekt",
    icon: "📝",
  },
];

const audienceCards = [
  {
    title: "Dla Project Managera",
    subtitle: "Pełna kontrola nad projektami",
    items: [
      "Twórz projekty i przypisuj zadania",
      "Monitoruj postęp w czasie rzeczywistym",
      "Ustawiaj terminy i priorytety",
      "Zarządzaj całym zespołem projektu",
    ],
    highlighted: true,
  },
  {
    title: "Dla Członka Zespołu",
    subtitle: "Focus na swoich zadaniach",
    items: [
      "Szybki dostęp do swoich zadań",
      "Widzisz tylko swoje zadania",
      "Pilnuj terminów i realizuj wszystko na czas.",
      "Wszystko, czego potrzebujesz, w jednym miejscu.",
    ],
    highlighted: false,
  },
];

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />

      <section id="funkcje" className="border-y border-white/5 py-24">
        <div className="container-shell text-center">
          <h2 className="text-5xl font-black md:text-6xl">Intuicyjny interfejs</h2>
          <p className="mx-auto mt-5 max-w-4xl text-2xl leading-relaxed text-textMuted">
            Zaprojektowany z myślą o wydajności — bez komplikacji, tylko efekty.
          </p>
        </div>

        <div className="container-shell mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <section id="dla-kogo" className="bg-white/[0.02] py-24">
        <div className="container-shell grid gap-6 lg:grid-cols-2">
          {audienceCards.map((card) => (
            <div
              key={card.title}
              className={`audience-card panel p-8 ${card.highlighted ? "gradient-accent border-accent/40" : ""}`}
            >
              <h3 className="text-4xl font-bold">{card.title}</h3>
              <p className="mt-2 text-2xl text-textMuted">{card.subtitle}</p>
              <ul className="mt-8 space-y-4 text-xl text-textMuted">
                {card.items.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <ReviewsSection />

      <section className="border-t border-white/5 py-24">
        <div className="container-shell panel gradient-accent p-10 text-center md:p-16">
          <h2 className="text-4xl font-black md:text-6xl">Gotowy na pierwszą wersję MVP?</h2>
          <p className="mx-auto mt-5 max-w-3xl text-2xl text-textMuted">
            Zacznij od rejestracji, projektów, zadań i dashboardu. Resztę rozbudujesz etapami.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="/register" className="rounded-2xl bg-textMain px-8 py-4 text-xl font-bold text-background">
              Utwórz konto
            </a>
            <a href="/login" className="rounded-2xl border border-white/10 px-8 py-4 text-xl font-bold">
              Zaloguj się
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8">
        <div className="container-shell flex flex-col gap-4 text-lg text-textMuted md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 text-textMain">
            <LogoMark showText className="text-2xl" />
          </div>
          <div className="flex flex-wrap gap-6">
            <span>Polityka prywatności</span>
            <span>Warunki użytkowania</span>
            <span>Ustawienia prywatności</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
