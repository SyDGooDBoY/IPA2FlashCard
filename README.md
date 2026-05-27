# IPA2FlashCard

IPA2FlashCard is a single-page flashcard learning app for creating decks, studying cards, searching learning material in real time, and tracking study history. The app includes separate user and admin flows. Normal users manage their own decks and flashcards, while admins can review all users and learning history.

## Project Topic

Flashcard Learning App

## Main Features

- Registration and login with hashed passwords and JWT authentication.
- Role-based access control for normal users and admins.
- Deck CRUD: create, read, update, and delete flashcard decks.
- Flashcard CRUD: create, read, update, and delete cards.
- Live flashcard search by question or answer.
- Study mode with answer reveal, correct/review marking, and used-card filtering.
- User profile page for email and password updates.
- Learning history for each user.
- Admin panel for viewing users and detailed learning history.
- Learning summary statistics including total cards, studied cards, and accuracy.

## Technology Stack

- Frontend: React, Vite, JavaScript, CSS
- Backend: FastAPI, SQLModel, SQLAlchemy
- Authentication: Passlib bcrypt password hashing, JWT
- Database: MySQL, managed locally through MySQL Workbench or MySQL Server

## Folder Structure

```text
IPA2FlashCard/
  backend/
    app/
      routers/
        auth_routes.py
        decks.py
        flashcards.py
        history.py
      auth.py
      database.py
      main.py
      models.py
      schemas.py
      seed.py
    requirements.txt
    .env.example
  database/
    schema.sql
  frontend/
    src/
      App.jsx
      api.js
      main.jsx
      styles.css
    index.html
    package.json
  README.md
```

## Local Setup

Download or clone the project, then open a terminal in the project root folder. The project root is the folder that contains this `README.md`, `backend/`, and `frontend/`.

Example:

```powershell
cd path\to\IPA2FlashCard
```

On macOS or Linux:

```bash
cd /path/to/IPA2FlashCard
```

### Backend

Before starting the backend, create the MySQL database. In MySQL Workbench, open a SQL tab and run:

```sql
CREATE DATABASE IF NOT EXISTS flashcard_app
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

Then create and configure the Python backend from the project root.

Windows PowerShell:

```powershell
python -m venv backend\.venv
.\backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
copy backend\.env.example backend\.env
notepad backend\.env
.\backend\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --app-dir backend --host 127.0.0.1 --port 8000
```

macOS or Linux:

```bash
python3 -m venv backend/.venv
./backend/.venv/bin/python -m pip install -r backend/requirements.txt
cp backend/.env.example backend/.env
nano backend/.env
./backend/.venv/bin/python -m uvicorn app.main:app --reload --app-dir backend --host 127.0.0.1 --port 8000
```

In `backend/.env`, update `DATABASE_URL` with your local MySQL username and password:

```env
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/flashcard_app
SECRET_KEY=replace-this-with-a-long-random-string
DEFAULT_ADMIN_PASSWORD=admin123
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

If your password contains special URL characters such as `@`, `#`, `:`, `/`, `?`, `&`, or `%`, URL-encode the password before putting it in `DATABASE_URL`.

FastAPI automatically creates the required tables when the backend starts.

### Frontend

Open a second terminal. From the project root:

Windows PowerShell:

```powershell
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

macOS or Linux:

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Open the frontend at:

```text
http://localhost:5173
```

The FastAPI backend runs at:

```text
http://localhost:8000
```

## Default Admin Account

The app creates a default admin account if one does not already exist.

```text
Username: admin
Password: admin123
```

The admin password is not reset after the admin user already exists.

## API Summary

- `POST /auth/register` creates a user account.
- `POST /auth/login` logs in a normal user.
- `POST /auth/admin/login` logs in an admin.
- `GET /auth/me` returns the current user profile.
- `PUT /auth/me` updates the current user's email.
- `PUT /auth/me/password` updates the current user's password.
- `GET /auth/users` lets admins view all users.
- `GET /decks/`, `POST /decks/`, `PUT /decks/{id}`, `DELETE /decks/{id}` provide deck CRUD.
- `GET /flashcards/`, `POST /flashcards/`, `PUT /flashcards/{id}`, `DELETE /flashcards/{id}` provide flashcard CRUD.
- `GET /flashcards/?search=react&deck_id=1` supports backend search and filtering.
- `POST /history/` records learning activity.
- `GET /history/me/details` returns readable user history.
- `GET /history/all/details` lets admins view readable history for all users.
- `GET /history/summary` returns learning statistics.

## CRUD Coverage

- Create: register users, create decks, create flashcards, create learning history.
- Read: view profile, decks, flashcards, search results, history, admin users.
- Update: edit flashcards, edit decks through the API, update profile email, change password.
- Delete: delete flashcards, delete decks, delete learning history.

## Workload Allocation

This assignment was completed individually.

```text
Individual contribution:
- Designed and implemented the React single-page frontend.
- Built the FastAPI backend, SQLModel models, and MySQL database connection.
- Implemented registration, login, JWT authentication, password hashing, and role-based access control.
- Implemented deck, flashcard, profile, and learning-history CRUD workflows.
- Built the admin view for all users' learning history.
- Added live search, default learning decks, light/dark mode, README documentation, and local setup instructions.
- Tested frontend build/lint and backend startup/API behavior.
```

## Professional Practice Notes

- `.env`, virtual environments, build output, and `node_modules` are ignored by git.
- Secrets should not be committed.
- The submitted project should include `.env.example`, not a real production `.env`.
- Run frontend build and lint before submission.
- Test both user and admin flows before the progress demo.
