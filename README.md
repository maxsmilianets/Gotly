
Gotly - platforma webowa wspierajaca organizacje pracy i realizacje zadan w zespolach IT.

\\ Stack \\

- Frontend: Next.js, TypeScript, Tailwind CSS
- Backend: Django, Django REST Framework, JWT
- Baza danych: PostgreSQL
- Uruchamianie: Docker Compose

\\ Struktura \\

```txt
gotly/
├── backend/
│   ├── accounts/      # uzytkownicy, role, rejestracja, profil
│   ├── projects/      # projekty, zadania, opinie
│   └── core/          # ustawienia Django i routing
├── frontend/
│   ├── app/           # strony Next.js
│   ├── components/    # komponenty UI
│   ├── lib/           # komunikacja z API i logika danych
│   ├── public/        # logo, ikony, favicon
│   └── types/         # typy danych
└── docker-compose.yml
```

\\ Uruchomienie przez Docker \\

```bash
docker compose up --build
```

Adresy:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/api`
- Panel admina Django: `http://localhost:8000/admin`

\\ Uruchomienie bez Dockera \\

\\ Backend \\

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

\\ Frontend \\

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

\\ Role \\

\\ Project Manager \\

- tworzy projekty,
- edytuje projekty,
- dodaje osoby do projektu po adresie e-mail,
- tworzy i edytuje zadania,
- przypisuje zadania konkretnym osobom,
- usuwa projekty i zadania.

\\ Uczestnik projektu \\

- widzi projekty, do ktorych zostal dodany,
- widzi zadania przypisane do projektu,
- moze zmieniac status zadan projektow,
- nie edytuje projektu.

\\ Glowne widoki \\

- `/` — strona glowna
- `/login` — logowanie
- `/register` — rejestracja
- `/dashboard` — podsumowanie projektów i ostatnio wykonane zadania
- `/dashboard/projekty` — lista projektow i panel szczegolow
- `/dashboard/projekty/[projectId]` — zadania przypisane do projektu
- `/opinie` — lista opinii
- `/opinie/dodaj` — dodawanie opinii po zalogowaniu

\\ Dane \\

Projekty, zadania i opinie są zapisywane w PostgreSQL przez Django API.
