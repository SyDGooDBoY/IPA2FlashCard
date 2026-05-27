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

Follow these steps from top to bottom the first time you download the project.

### 1. Install Required Software

Install these before running the project:

- Python 3.12
- Node.js 22.13 or newer, or Node.js 24 or newer
- MySQL Server
- MySQL Workbench, or another MySQL client

Check that Python, Node, and npm are available.

Windows PowerShell:

```powershell
py -3.12 --version
node --version
npm --version
```

macOS or Linux:

```bash
python3 --version
node --version
npm --version
```

If the frontend install reports an `Unsupported engine` error, upgrade Node.js first.

### 2. Open The Project Folder

Open a terminal in the project root. The project root is the folder that contains `README.md`, `backend/`, and `frontend/`.

Windows PowerShell example:

```powershell
cd D:\path\to\IPA2FlashCard
```

macOS or Linux example:

```bash
cd /path/to/IPA2FlashCard
```

### 3. Create The MySQL Database

Start MySQL Server. Then open MySQL Workbench, create a new SQL tab, and run:

```sql
CREATE DATABASE IF NOT EXISTS flashcard_app
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

The backend will create the required tables automatically when it starts.

### 4. Install Backend Dependencies

Run these commands from the project root.

Windows PowerShell:

```powershell
py -3.12 -m venv backend\.venv
.\backend\.venv\Scripts\python.exe -m pip install --upgrade pip
.\backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
.\backend\.venv\Scripts\python.exe -m pip check
```

macOS or Linux:

```bash
python3 -m venv backend/.venv
./backend/.venv/bin/python -m pip install --upgrade pip
./backend/.venv/bin/python -m pip install -r backend/requirements.txt
./backend/.venv/bin/python -m pip check
```

`pip check` should print:

```text
No broken requirements found.
```

### 5. Configure Backend Environment

Copy the example environment file.

Windows PowerShell:

```powershell
copy backend\.env.example backend\.env
notepad backend\.env
```

macOS or Linux:

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

In `backend/.env`, set `DATABASE_URL` to your local MySQL username and password:

```env
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/flashcard_app
SECRET_KEY=replace-this-with-a-long-random-string
DEFAULT_ADMIN_PASSWORD=admin123
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Example for a local MySQL user named `root` with password `mypassword`:

```env
DATABASE_URL=mysql+pymysql://root:mypassword@localhost:3306/flashcard_app
```

If your MySQL password contains special URL characters such as `@`, `#`, `:`, `/`, `?`, `&`, or `%`, URL-encode the password before putting it in `DATABASE_URL`.

### 6. Start The Backend

Keep this terminal open while using the app.

Windows PowerShell:

```powershell
.\backend\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --app-dir backend --host 127.0.0.1 --port 8000
```

macOS or Linux:

```bash
./backend/.venv/bin/python -m uvicorn app.main:app --reload --app-dir backend --host 127.0.0.1 --port 8000
```

The backend should run at:

```text
http://localhost:8000
```

### 7. Install Frontend Dependencies

Open a second terminal and run:

Windows PowerShell:

```powershell
cd D:\path\to\IPA2FlashCard\frontend
npm ci
```

macOS or Linux:

```bash
cd /path/to/IPA2FlashCard/frontend
npm ci
```

Use `npm ci` for the first install because it follows `package-lock.json` exactly. Use `npm install` only when you intentionally update frontend dependencies.

### 8. Start The Frontend

In the same frontend terminal, run:

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

Open the app in your browser:

```text
http://localhost:5173
```

### Quick Run Commands After Setup

After dependencies are installed, use these two commands whenever you want to run the project again.

Terminal 1, from the project root:

```powershell
.\backend\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --app-dir backend --host 127.0.0.1 --port 8000
```

Terminal 2, from `frontend/`:

```powershell
npm run dev -- --host 127.0.0.1 --port 5173
```

### Troubleshooting

If backend dependency installation or startup fails, rebuild the Python virtual environment.

Windows PowerShell:

```powershell
Remove-Item -Recurse -Force backend\.venv
py -3.12 -m venv backend\.venv
.\backend\.venv\Scripts\python.exe -m pip install --upgrade pip
.\backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
.\backend\.venv\Scripts\python.exe -m pip check
```

macOS or Linux:

```bash
rm -rf backend/.venv
python3 -m venv backend/.venv
./backend/.venv/bin/python -m pip install --upgrade pip
./backend/.venv/bin/python -m pip install -r backend/requirements.txt
./backend/.venv/bin/python -m pip check
```

If the backend reports a MySQL connection error, check that MySQL Server is running and that `DATABASE_URL` in `backend/.env` uses the correct username, password, host, port, and database name.

If admin login does not work with `admin123`, the `admin` user probably already exists in your database with an older password. Recreate the database or update the admin password manually.

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
