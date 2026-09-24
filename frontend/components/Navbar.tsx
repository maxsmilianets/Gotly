import Link from "next/link";
import { LogoMark } from "@/components/LogoMark";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-background/80 backdrop-blur-xl">
      <div className="container-shell flex items-center justify-between py-4">
        <Link href="/" className="flex items-center text-xl font-bold" aria-label="Gotly — strona główna">
          <LogoMark showText />
        </Link>

        <nav className="hidden gap-6 text-sm text-textMuted md:flex">
          <a href="#funkcje" className="hover:text-textMain">Funkcje</a>
          <a href="#dla-kogo" className="hover:text-textMain">Dla kogo</a>
          <a href="#opinie" className="hover:text-textMain">Opinie</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-textMain 
            hover:border-accent hover:text-accent"
          >
            Logowanie
          </Link>
          <Link
            href="/register"
            className="rounded-2xl bg-accent px-4 py-2.5 text-sm font-semibold text-background hover:scale-[1.01]"
          >
            Rejestracja
          </Link>
        </div>
      </div>
    </header>
  );
}
