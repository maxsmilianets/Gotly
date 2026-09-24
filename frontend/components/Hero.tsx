import Link from "next/link";
import { LogoMark } from "@/components/LogoMark";

const previewProjects = [
  {
    name: "Redesign strony",
    description: "Nowy landing, formularze auth i widok opinii.",
    status: "Aktywny",
    progress: 75,
    people: 5,
    deadline: "28 maja 2026",
  },
  {
    name: "Backend API v2",
    description: "Django API, modele projektów i zadania w PostgreSQL.",
    status: "Zaplanowany",
    progress: 42,
    people: 4,
    deadline: "10 czerwca 2026",
  },
  {
    name: "Panel zespołu",
    description: "Uprawnienia PM, członkowie projektu i przypisanie zadań.",
    status: "Aktywny",
    progress: 61,
    people: 7,
    deadline: "Bez deadline'u",
  },
];

const completedTasks = [
  { title: "Połączyć projekty z API", project: "Backend API v2", date: "Dzisiaj" },
  { title: "Dodać logo do nawigacji", project: "Redesign strony", date: "Wczoraj" },
  { title: "Ustawić role użytkowników", project: "Panel zespołu", date: "2 dni temu" },
];

const statItems = [
  ["06", "Wszystkich projektów"],
  ["03", "Aktywnych projektów"],
  ["24", "Zadań w projektach"],
  ["02", "Po terminie"],
];

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.9">
      <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.25 9.75v9a.75.75 0 0 0 .75.75h4.5v-5.25h3v5.25H18a.75.75 0 0 0 .75-.75v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.9">
      <path d="M3.75 7.5A2.25 2.25 0 0 1 6 5.25h4.05c.597 0 1.17.237 1.592.658l1.11 1.11a2.25 2.25 0 0 0 1.591.659H18A2.25 2.25 0 0 1 20.25 9.9v6.6A2.25 2.25 0 0 1 18 18.75H6A2.25 2.25 0 0 1 3.75 16.5v-9Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.9">
      <path d="M15.75 8.25V5.625A2.625 2.625 0 0 0 13.125 3h-5.25A2.625 2.625 0 0 0 5.25 5.625v12.75A2.625 2.625 0 0 0 7.875 21h5.25a2.625 2.625 0 0 0 2.625-2.625V15.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12H9m0 0 3.75-3.75M9 12l3.75 3.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MiniSidebar() {
  return (
    <aside className="hidden border-r border-white/10 bg-slate-950/55 p-4 md:flex md:w-[88px] md:flex-col md:items-center">
      <LogoMark size="md" />
      <nav className="mt-7 flex flex-col gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/40 bg-accent/10 text-accent">
          <HomeIcon />
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 text-textMuted">
          <FolderIcon />
        </div>
      </nav>
      <div className="mt-auto flex flex-col items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-sm font-bold text-accent">M</div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-400/20 text-rose-200">
          <LogoutIcon />
        </div>
      </div>
    </aside>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="container-shell">
        <div className="mx-auto max-w-5xl text-center">
          <span className="rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent">
            Nowoczesny panel do pracy zespołowej
          </span>

          <h1 className="mt-6 text-5xl font-black leading-tight md:text-7xl">Zarządzaj projektami szybko i wygodnie</h1>

          <p className="mx-auto mt-6 max-w-3xl text-xl leading-relaxed text-textMuted md:text-2xl">
            Gotly porządkuje projekty, zespół i zadania w jednym miejscu. Manager zarządza projektem, a uczestnicy zespołu widzą swoje zadania we właściwym kontekście.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/register" className="rounded-2xl bg-accent px-7 py-4 text-lg font-bold text-background transition-transform hover:scale-[1.02]">
              Załóż konto
            </Link>
            <Link href="/login" className="rounded-2xl border border-white/10 px-7 py-4 text-lg font-bold transition-colors hover:border-accent hover:text-accent">
              Zaloguj się
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-24 max-w-[1500px] md:mt-32">
          <div className="overflow-hidden rounded-[34px] border border-white/10 bg-[#07101d] shadow-[0_35px_140px_rgba(0,0,0,0.55)]">
            <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.04] px-4 py-3 md:px-6">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
              </div>
              <div className="hidden min-w-0 flex-1 items-center justify-center md:flex">
                <div className="w-full max-w-2xl truncate rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-textMuted">
                  gotly.app/dashboard
                </div>
              </div>
              <div className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent md:text-sm">
                Prawdziwy układ dashboardu
              </div>
            </div>

            <div className="min-h-[760px] md:grid md:grid-cols-[88px_minmax(0,1fr)]">
              <MiniSidebar />

              <div className="space-y-5 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.08),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.025),transparent)] p-4 sm:p-5 xl:p-7">
                <div className="panel p-5 sm:p-6 xl:p-7">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-accent sm:text-sm">Panel główny</p>
                      <h2 className="mt-3 text-3xl font-black sm:text-4xl 2xl:text-5xl">Dashboard projektów</h2>
                      <p className="mt-3 max-w-4xl text-sm text-textMuted sm:text-base xl:text-lg">
                        Informacje o projektach, ostatnie wykonane zadania i szybki dostęp do centrum projektów.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <div className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-textMuted">Otwórz projekty</div>
                      <div className="rounded-2xl bg-accent px-4 py-3 text-sm font-bold text-background">+ Nowy projekt</div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                  {statItems.map(([value, label]) => (
                    <div key={label} className="panel p-5">
                      <p className="text-4xl font-black text-accent">{value}</p>
                      <p className="mt-2 text-sm text-textMuted">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.75fr)]">
                  <div className="panel p-5 sm:p-6 xl:p-7">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-2xl font-bold sm:text-3xl">Informacje o projektach</h3>
                        <p className="mt-2 text-sm text-textMuted">W centrum ekranu widać projekty, do których użytkownik ma dostęp.</p>
                      </div>
                      <span className="w-fit rounded-full border border-white/10 px-3 py-1 text-sm text-textMuted">Ukończone: 1</span>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-2">
                      {previewProjects.map((project) => (
                        <article key={project.name} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="min-w-0">
                              <h4 className="truncate text-2xl font-bold">{project.name}</h4>
                              <p className="mt-1 line-clamp-2 text-sm text-textMuted">{project.description}</p>
                            </div>
                            <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-sm text-accent">{project.status}</span>
                          </div>
                          <div className="mt-4 h-2 rounded-full bg-white/10">
                            <div className="h-2 rounded-full bg-accent" style={{ width: `${project.progress}%` }} />
                          </div>
                          <div className="mt-4 flex flex-wrap gap-4 text-sm text-textMuted">
                            <span>Postęp: {project.progress}%</span>
                            <span>Osoby: {project.people}</span>
                            <span>{project.deadline}</span>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>

                  <div className="panel p-5 sm:p-6 xl:p-7">
                    <h3 className="text-2xl font-bold sm:text-3xl">Ostatnie wykonane zadania</h3>
                    <p className="mt-2 text-sm text-textMuted">Zadania są przypięte do konkretnych projektów.</p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
                      {completedTasks.map((task) => (
                        <article key={task.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h4 className="truncate font-semibold text-textMain">{task.title}</h4>
                              <p className="mt-1 text-sm text-textMuted">{task.project}</p>
                            </div>
                            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">Ukończone</span>
                          </div>
                          <p className="mt-3 text-xs uppercase tracking-[0.16em] text-textMuted">{task.date}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
