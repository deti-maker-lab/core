# DETI Maker Lab — Development Setup Guide

>To be reviewed, might not be consistent in 100% with actual steps.

This document explains how to set up the local development environment, run the project, and stop everything at the end of the day.

> Recommended setup for Windows contributors: **Windows + WSL2 (Ubuntu) + Docker Desktop + VS Code + Android Studio**.
>
> We keep the repository inside the **WSL filesystem** and run the backend/web/tooling from Linux. This gives a smoother developer experience than mixing native Windows tooling with Linux-oriented project scripts.

---

## 1. Project scope and architecture

This project replaces the most painful parts of the current wiki-based Maker Lab workflow while preserving the existing installed base.

The core goals are:

- integrate with **Snipe-IT** as the authoritative inventory system,
- support the full requisition lifecycle: **request → approve/reject → assign → return**,
- allow **multiple requisitions during the same project lifecycle**,
- replace Markdown-based project creation with **structured forms**,
- integrate authentication with the university **SSO / universal user**,
- support both **web** and **mobile** clients.

### Proposed monorepo structure

```text
.
├── apps/
│   ├── web/          # Next.js web app
│   ├── mobile/       # Expo / React Native mobile app
│   ├── api/          # FastAPI backend
│   └── migration/    # legacy wiki import / migration scripts
├── packages/
│   ├── shared-types/ # TS shared contracts for web/mobile
│   ├── ui/           # shared UI components
│   ├── config/       # shared configuration helpers
│   ├── auth/         # auth helpers for OIDC / SSO integration
│   ├── snipeit-client/
│   └── legacy-wiki/
├── infra/
│   ├── docker/
│   ├── db/
│   ├── nginx/
│   └── scripts/
├── docs/
└── README.md
```

---

## 2. Technologies used

### Frontend
- **Next.js** + **TypeScript** for the web application
- **Tailwind CSS** for styling
- **pnpm** for JavaScript/TypeScript package management
- **Turborepo** for monorepo task orchestration

### Mobile
- **Expo** + **React Native** for Android and iOS mobile development
- Android is developed locally on Windows using **Android Studio**
- iOS cannot be simulated locally on Windows; use a physical device or cloud builds when needed

### Backend
- **FastAPI** for the backend API
- **Python 3.12** with **pip** and **venv**
- **SQLAlchemy** for ORM / DB access
- **Alembic** for database migrations
- **Pydantic** for validation and schemas

### Database and infra
- **PostgreSQL** for application data
- **Docker Desktop** + **Docker Compose** for local services
- **Nginx** later for reverse proxying in deployment environments

### Integrations
- **Snipe-IT** as the inventory authority
- University **SSO / OIDC** as the preferred authentication path
- Legacy **Maker Lab Wiki** as a migration source

### Developer workflow
- **WSL2 Ubuntu** as the main development environment on Windows
- **VS Code Remote - WSL** for editing the codebase
- **GitHub** for code review and collaboration

---

## 3. Recommended local setup on Windows

### What should be installed on Windows

Install these tools directly on Windows:

1. **WSL2 with Ubuntu**
2. **Docker Desktop**
3. **VS Code**
4. **Android Studio**

### What should run inside WSL Ubuntu

Inside WSL Ubuntu we install and use:

- Git
- Node.js LTS
- pnpm
- Python 3.12, pip, and venv
- project dependencies
- backend, web, and migration commands

---

## 4. First-time environment setup

### 4.1 Install WSL2 and Ubuntu

Open **PowerShell as Administrator** and run:

```powershell
wsl --install -d Ubuntu
wsl --update
wsl -l -v
```

Restart the computer if Windows asks for it.

When Ubuntu starts for the first time, create your Linux username and password.

---

### 4.2 Install Docker Desktop on Windows

Install Docker Desktop and then enable:

- **Use WSL 2 based engine**
- **WSL integration** for your Ubuntu distro

After that, open Ubuntu and verify Docker works from WSL:

```bash
docker version
docker compose version
```

---

### 4.3 Install VS Code and the WSL extension

Install:

- **Visual Studio Code**
- **Remote - WSL** extension

Later, when you are inside the repo in Ubuntu, you will open it with:

```bash
code .
```

---

### 4.4 Install Android Studio on Windows

Install Android Studio on Windows and let the setup wizard install:

- Android SDK
- Android SDK Platform-Tools
- Android Emulator
- at least one recent Android system image

For daily work, Android Studio stays on Windows, but the repository remains inside WSL.

> On Windows, Android development is local. For iOS, use a physical device or cloud build flow.

---

### 4.5 Install base packages inside WSL Ubuntu

Open Ubuntu and run:

```bash
sudo apt update && sudo apt upgrade -y

sudo apt install -y \
  build-essential \
  curl \
  wget \
  git \
  unzip \
  zip \
  jq \
  ca-certificates \
  gnupg \
  lsb-release \
  file \
  xz-utils \
  python3 \
  python3-pip \
  python3-venv
```

Verify Python and pip:

```bash
python3 --version
pip3 --version
```

---

### 4.6 Install Node.js LTS inside WSL

We use Node only inside WSL for the monorepo tooling.

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
source ~/.bashrc

nvm install --lts
nvm use --lts
nvm alias default 'lts/*'

node -v
npm -v
```

---

### 4.7 Install pnpm inside WSL

```bash
npm install --global corepack@latest
corepack enable
corepack prepare pnpm@latest-10 --activate

pnpm -v
```

---

## 5. Clone the repository

Keep the repository in the **Linux filesystem**, not under `C:\`.

```bash
mkdir -p ~/dev
cd ~/dev
git clone <YOUR_REPOSITORY_URL> deti-maker-lab
cd deti-maker-lab
```

Open it in VS Code:

```bash
code .
```

---

## 6. Expected starter project structure

The project is expected to look approximately like this:

```text
apps/
  web/
  mobile/
  api/
  migration/
packages/
  shared-types/
  ui/
  config/
  auth/
  snipeit-client/
  legacy-wiki/
infra/
  docker/
  db/
  nginx/
```

---

## 7. Environment variables

Create the local environment files from the examples provided in the repo.

Typical files:

```text
.env.example
apps/web/.env.local
apps/api/.env
apps/mobile/.env
```

Typical values:

```env
DATABASE_URL=postgresql://makerlab:makerlab@localhost:5432/makerlab
NEXT_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_API_URL=http://localhost:8000

SNIPEIT_BASE_URL=
SNIPEIT_API_TOKEN=

OIDC_ISSUER=
OIDC_CLIENT_ID=
OIDC_CLIENT_SECRET=
```

At the beginning of development, SSO and Snipe-IT values may be left empty if the repo contains mock adapters or local-only configuration.

---

## 8. Install project dependencies

### JavaScript / TypeScript workspace

From the repo root:

```bash
pnpm install
```

### Python backend

From the backend directory:

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cd ../..
```

If the backend also has development-only dependencies, install them as well:

```bash
cd apps/api
source .venv/bin/activate
pip install -r requirements.txt
cd ../..
```

> Activate the virtual environment every time you open a new terminal for backend work.

---

## 9. Start local infrastructure

The recommended local infrastructure is at least:

- PostgreSQL
- optional admin / support services later

From the repo root:

```bash
docker compose -f infra/docker/docker-compose.yml up -d
```

Check running containers:

```bash
docker ps
```

---

## 10. Run the project locally

### Development mode (localhost URLs)

For quick local development, run the backend and frontend separately:

**Terminal 1 — web app**

```bash
cd ~/dev/deti-maker-lab
pnpm --filter web dev
```

Expected URL: `http://localhost:3000`

**Terminal 2 — FastAPI backend**

```bash
cd ~/dev/deti-maker-lab/apps/api
source .venv/bin/activate
fastapi dev app/main.py --host 0.0.0.0 --port 8000
```

Expected URL: `http://localhost:8000`

Swagger docs: `http://localhost:8000/docs`

**Terminal 3 — mobile app**

```bash
cd ~/dev/deti-maker-lab
pnpm --filter mobile start
```

Then press `a` for Android emulator, or scan the QR code in Expo Go.

### Full stack mode (with Docker, nginx, and domain names)

To test the complete system as it runs in production with nginx reverse-proxying:

1. Start Docker containers:

```bash
docker compose -f infra/docker/docker-compose.yml up -d
```

2. Add domain names to your **Windows hosts file** (see [troubleshooting section](###-site-cant-be-reached--dns_probe_finished_nxdomain)):

```
127.0.0.1  deti-makerlab.ua.pt
127.0.0.1  inventory.deti-makerlab.ua.pt
```

3. Access via:
   - `https://deti-makerlab.ua.pt` — main site
   - `https://inventory.deti-makerlab.ua.pt` — Snipe-IT inventory

> You'll see a certificate warning for self-signed SSL — click "Advanced" and continue anyway.

---

### Parallel run of backend and frontend

Alternatively, from the repo root:

```bash
pnpm dev
```

This starts both services in parallel (if configured in `turbo.json`).

---

## 11. Database migrations

If the backend uses Alembic, typical commands are:

```bash
cd ~/dev/deti-maker-lab/apps/api
source .venv/bin/activate
alembic upgrade head
```

To create a new migration:

```bash
cd ~/dev/deti-maker-lab/apps/api
source .venv/bin/activate
alembic revision --autogenerate -m "describe_change"
```

---

## 12. Daily workflow on Windows

This is the recommended day-to-day workflow for contributors using Windows.

### Start of work

1. Start **Docker Desktop** on Windows.
2. Open **Windows Terminal** or **PowerShell**.
3. Enter Ubuntu:

```bash
wsl
```

4. Go to the project:

```bash
cd ~/dev/deti-maker-lab
```

5. Open VS Code in WSL:

```bash
code .
```

6. Start infrastructure:

```bash
docker compose -f infra/docker/docker-compose.yml up -d
```

7. Refresh dependencies only when needed:

```bash
pnpm install
cd apps/api && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && cd ../..
```

8. Start the apps you need:

```bash
pnpm --filter web dev
```

```bash
cd apps/api && source .venv/bin/activate && fastapi dev app/main.py --host 0.0.0.0 --port 8000
```

```bash
pnpm --filter mobile start
```

### Typical daily routine

- Use **web + api** for most feature work.
- Run **mobile** only when you are actively testing the mobile app.
- Run **migration scripts** only when working on legacy import tasks.
- Keep Docker containers limited to what is necessary.

---

## 13. How to stop everything after work

This section is important. At the end of the day, shut down local processes so they do not keep using CPU, RAM, battery, or disk resources.

### 13.1 Stop application dev servers

In each terminal running a dev server, press:

```text
Ctrl + C
```

Do this for:

- `pnpm --filter web dev`
- `fastapi dev ...`
- `pnpm --filter mobile start`

If you launched the Android emulator, close it from Android Studio or the emulator window.

---

### 13.2 Stop Docker containers

From the repo root:

```bash
docker compose -f infra/docker/docker-compose.yml down
```

This stops and removes the containers but **keeps the Docker volumes**, so your local database data is preserved.

> Do **not** use `down -v` unless you intentionally want to delete local database data.

If you only want a temporary pause and keep containers ready for a quick restart, you can use:

```bash
docker compose -f infra/docker/docker-compose.yml stop
```

---

### 13.3 Deactivate the Python virtual environment

If your terminal is still inside the backend venv, run:

```bash
deactivate
```

This is optional, but it keeps the shell state clean.

---

### 13.4 Optional: stop WSL completely

After all WSL terminals are closed, you can shut down WSL from Windows PowerShell:

```powershell
wsl --shutdown
```

This frees memory used by the Linux VM.

---

### 13.5 Optional: quit Docker Desktop

If you are completely done for the day, you can also quit Docker Desktop from the Windows tray icon.

This is useful when you are not doing any more container work.

---

## 14. Useful commands reference

### Repo root

```bash
pnpm install
pnpm --filter web dev
pnpm --filter mobile start
```

### Backend

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
fastapi dev app/main.py --host 0.0.0.0 --port 8000
alembic upgrade head
```

### Docker

```bash
docker compose -f infra/docker/docker-compose.yml up -d
docker compose -f infra/docker/docker-compose.yml stop
docker compose -f infra/docker/docker-compose.yml down
docker ps
```

### Windows / WSL

```powershell
wsl
wsl -l -v
wsl --shutdown
```

---

## 15. Recommended team rules

To keep the environment predictable for everyone:

- always develop from **WSL**, not from `C:\...`
- commit lockfiles: `pnpm-lock.yaml`
- do not commit `.env` files with secrets
- do not commit `.venv/`
- avoid changing tool versions casually
- when upgrading Node / pnpm / Python / Expo / FastAPI, announce it in the team chat and update this document
- stop Docker containers and dev servers after work

---

## 16. Troubleshooting

### Site can't be reached — `DNS_PROBE_FINISHED_NXDOMAIN`

If you're trying to access `https://deti-makerlab.ua.pt` or `https://inventory.deti-makerlab.ua.pt` but get "This site can't be reached", you need to add the domain names to your Windows **hosts file**.

**Why?** The containers are running in Docker Desktop (which uses WSL2), and nginx is configured to serve the site via domain names with HTTPS. Your Windows browser needs to know where to find these domains.

**Solution:**

1. Open **PowerShell as Administrator** (right-click → "Run as administrator")
2. Run:

```powershell
Add-Content -Path "C:\Windows\System32\drivers\etc\hosts" -Value "`n127.0.0.1  deti-makerlab.ua.pt`n127.0.0.1  inventory.deti-makerlab.ua.pt" -Force
```

3. Flush the DNS cache:

```powershell
ipconfig /flushdns
```

4. Close and reopen your browser, then try:
   - `https://deti-makerlab.ua.pt`
   - `https://inventory.deti-makerlab.ua.pt`

You'll see a certificate warning (self-signed SSL) — click "Advanced" and continue anyway.

**Note:** If you're doing local development only (not testing the full nginx setup), keep using `http://localhost:3000` and `http://localhost:8000` instead.

---

### `docker: command not found` inside WSL
- Check that Docker Desktop is installed
- Check that WSL integration is enabled for Ubuntu
- Restart Docker Desktop

### `pnpm` version problems
- Run:

```bash
npm install --global corepack@latest
corepack enable
corepack prepare pnpm@latest-10 --activate
```

- If the repo pins pnpm in `package.json`, make sure the pinned version is a full semver version, not only a major version.

### Backend dependencies are missing
- Run:

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### `fastapi: command not found`
- The virtual environment is probably not active, or FastAPI is not installed.
- Run:

```bash
cd apps/api
source .venv/bin/activate
pip install -r requirements.txt
```

### Expo cannot find Android emulator
- Open Android Studio first
- Start an emulator from the Device Manager
- Then run the mobile app again

### Ports are already in use
- Check what is running on:
  - `3000` for web
  - `8000` for API
  - `5432` for PostgreSQL
- Stop the conflicting process or change the local port

---

## 17. Final note

This guide is the baseline for local development. As the repository evolves, update this file whenever:

- a new service is added,
- a port changes,
- the local Docker stack changes,
- the FastAPI startup command changes,
- the mobile workflow changes,
- the SSO or Snipe-IT configuration becomes mandatory for local development.
