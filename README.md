# Development Setup and Daily Workflow

This document explains how to set up the development environment, run the project locally, and shut everything down when you finish working.

## Purpose of the project

This system is being built for DETI Maker Lab. The main goals are:

- manage projects, groups, and equipment requisitions in one system
- integrate with **Snipe-IT** as the inventory authority
- support the requisition lifecycle:
  - request
  - approve / reject
  - assign
  - return
- replace the old Markdown-style project creation with structured forms
- integrate with the university authentication system
- preserve and extend the existing installed base instead of rewriting everything from scratch
- support web and mobile usage

---

## Recommended development setup

The recommended setup for contributors using Windows is:

- **Windows 11**
- **WSL2 with Ubuntu**
- **VS Code with Remote - WSL**
- **Docker Desktop with WSL integration enabled**
- **Node.js LTS inside WSL**
- **pnpm** as the package manager
- **Android Studio** for Android development

Why this setup?

- it gives a Linux-like environment for backend and web development
- it works well with Docker
- it avoids many native Windows path and tooling issues
- it is the most practical setup for a monorepo with web, API, migration, and mobile apps

> Important: keep the repository inside the Linux filesystem in WSL (for example `~/dev/...`) and **not** under `C:\...`.

---

## Planned tech stack

The project is planned as a **monorepo**.

### Main technologies

- **TypeScript**
- **pnpm workspaces**
- **Turborepo**
- **Next.js** for the web application
- **NestJS** for the backend API
- **React Native + Expo** for the mobile app
- **PostgreSQL** for the main application database
- **Docker Compose** for local infrastructure
- **Prisma** for database access
- **Snipe-IT** integration for inventory
- **University SSO** integration for authentication

### Monorepo structure

```text
core/
  apps/
    web/
    api/
    mobile/
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
    scripts/
  docs/
```

---

## One-time setup on Windows

## 1. Install WSL2 and Ubuntu

Open **PowerShell as Administrator** and run:

```powershell
wsl --install -d Ubuntu
wsl --update
wsl -l -v
```

Restart Windows if needed.

Then open Ubuntu and create your Linux username and password.

---

## 2. Install Docker Desktop

Install **Docker Desktop for Windows**.

After installation, open Docker Desktop and make sure:

- **Use WSL 2 based engine** is enabled
- **WSL integration** is enabled for your Ubuntu distribution

---

## 3. Install VS Code

Install **Visual Studio Code** on Windows.

Recommended extensions:

- Remote - WSL
- ESLint
- Prettier
- Docker
- Prisma
- GitLens

---

## 4. Install Android Studio

Install **Android Studio** on Windows.

During setup, install:

- Android SDK
- Android SDK Platform-Tools
- Android Emulator
- at least one recent Android device image

> On Windows, Android development is fine locally.  
> iOS Simulator is **not available on Windows**. For iOS, use a physical device or cloud builds.

---

## 5. Open Ubuntu and install basic packages

Inside Ubuntu:

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
  file \
  xz-utils
```

---

## 6. Install Node.js LTS with nvm

Inside Ubuntu:

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

## 7. Enable pnpm with Corepack

Inside Ubuntu:

```bash
npm install -g corepack@latest
corepack enable pnpm
pnpm -v
```

If the repo pins pnpm in `package.json`, make sure the version is a full semver version, for example:

```json
"packageManager": "pnpm@10.32.1"
```

and **not**:

```json
"packageManager": "pnpm@10"
```

---

## 8. Clone the repository inside WSL

Create a Linux-side dev directory:

```bash
mkdir -p ~/dev
cd ~/dev
```

Clone the repository there:

```bash
git clone <REPOSITORY_URL>
cd <REPOSITORY_NAME>
```

If the monorepo root is inside a subfolder such as `core`, then enter it:

```bash
cd core
```

---

## 9. Open the repo in VS Code

From inside WSL:

```bash
code .
```

This opens the project in VS Code using the **Remote - WSL** environment.

---

## 10. Create environment files

Copy the example environment file if the project provides one:

```bash
cp .env.example .env
```

If the backend has its own environment file:

```bash
cp apps/api/.env.example apps/api/.env
```

Typical variables may include:

```env
DATABASE_URL=postgresql://makerlab:makerlab@localhost:5432/makerlab

NEXT_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_API_URL=http://localhost:3001

SNIPEIT_BASE_URL=
SNIPEIT_API_TOKEN=

OIDC_ISSUER=
OIDC_CLIENT_ID=
OIDC_CLIENT_SECRET=
```

At the beginning of development, these external integrations can stay empty if the project uses mocks or stubs.

---

## 11. Install project dependencies

From the monorepo root:

```bash
pnpm install
```

---

## 12. Start local services

If the repository contains a Compose file, start the infrastructure:

```bash
docker compose -f infra/docker/docker-compose.yml up -d
```

This usually starts local services such as PostgreSQL.

To verify:

```bash
docker compose -f infra/docker/docker-compose.yml ps
```

---

## 13. Start the apps

From the monorepo root:

```bash
pnpm dev
```

If the repo uses Turborepo, this usually starts all apps that have a `dev` script.

You can also run apps individually.

### Web

```bash
pnpm --filter web dev
```

### API

```bash
pnpm --filter api start:dev
```

### Mobile

```bash
pnpm --filter mobile start
```

---

## First-time mobile note

For Android:

- start Android Studio
- start an emulator
- then run the mobile app

For iOS:

- local iOS Simulator is not available on Windows
- use a physical iPhone or a cloud build workflow

---

## Daily workflow on Windows

This is the recommended everyday routine.

## Start of work

1. Start **Docker Desktop**
2. Open **Windows Terminal**
3. Enter Ubuntu:

```bash
wsl
```

4. Go to the repository:

```bash
cd ~/dev/<REPOSITORY_NAME>
```

If needed:

```bash
cd core
```

5. Open in VS Code:

```bash
code .
```

6. Start local infrastructure:

```bash
docker compose -f infra/docker/docker-compose.yml up -d
```

7. Install dependencies only if needed:
   - after pulling changes
   - after switching branches
   - after `package.json` changes

```bash
pnpm install
```

8. Start development servers:

```bash
pnpm dev
```

---

## During development

Useful commands:

### Pull latest changes

```bash
git pull
pnpm install
```

### Check containers

```bash
docker compose -f infra/docker/docker-compose.yml ps
```

### View logs

```bash
docker compose -f infra/docker/docker-compose.yml logs -f
```

### Run tests

```bash
pnpm test
```

### Run lint

```bash
pnpm lint
```

### Build everything

```bash
pnpm build
```

---

## End of work: how to stop everything

When you finish working, do **not** leave development servers and containers running unnecessarily.

## Step 1. Stop dev servers

If `pnpm dev` is running in the terminal, press:

```text
Ctrl + C
```

Do this for each terminal that is running a dev server.

---

## Step 2. Stop Docker containers

If you want a quick stop and plan to resume soon:

```bash
docker compose -f infra/docker/docker-compose.yml stop
```

This stops running containers but keeps them available to start again later.

If you want a cleaner shutdown after finishing work:

```bash
docker compose -f infra/docker/docker-compose.yml down
```

This stops and removes the containers and default networks created by Compose.

> Use `down` at the end of the day if you do not need the services running anymore.

---

## Step 3. Shut down WSL

To release WSL resources from Windows, run this in **PowerShell** or **Command Prompt**:

```powershell
wsl --shutdown
```

This shuts down all running WSL distributions and the WSL virtual machine.

---

## Step 4. Optionally quit Docker Desktop

If you want to free even more system resources, close Docker Desktop completely from Windows after the containers are stopped.

This is recommended when you are done for the day.

---

## Fast resume the next day

If you used `docker compose stop`, you can resume with:

```bash
docker compose -f infra/docker/docker-compose.yml start
```

If you used `docker compose down`, resume with:

```bash
docker compose -f infra/docker/docker-compose.yml up -d
```

Then run:

```bash
pnpm dev
```

---

## Common problems

## Invalid package manager specification in package.json

If you see an error like:

```text
Invalid package manager specification in package.json (pnpm@10); expected a semver version
```

fix the `packageManager` field in `package.json`.

Correct:

```json
"packageManager": "pnpm@10.32.1"
```

Incorrect:

```json
"packageManager": "pnpm@10"
```

Then run:

```bash
pnpm install
```

---

## Docker command does not work inside WSL

Make sure:

- Docker Desktop is running
- WSL integration is enabled in Docker Desktop
- you are inside the integrated Ubuntu distro

Check:

```bash
docker version
docker compose version
```

---

## `code .` does not work in WSL

Make sure VS Code is installed on Windows and the **Remote - WSL** extension is installed.

Then reopen WSL and try again:

```bash
code .
```

---

## Android emulator is slow

This is common on some Windows machines.

Try:

- using a physical Android phone
- reducing emulator RAM usage
- making sure virtualization is enabled in BIOS/UEFI

---

## Useful project habits

- keep the repository in `~/dev/...` inside WSL
- run all Node / pnpm / backend commands inside WSL
- use Docker Desktop only as the container runtime
- do not keep containers, WSL, and development servers running after work unless necessary
- run `pnpm install` after dependency changes
- run `pnpm lint` and `pnpm test` before pushing
- keep `.env` files local and never commit secrets

---

## Recommended first boot sequence

If this is your very first run on a fresh machine, the usual sequence is:

```bash
wsl
cd ~/dev
git clone <REPOSITORY_URL>
cd <REPOSITORY_NAME>
# optionally: cd core

code .

pnpm install
docker compose -f infra/docker/docker-compose.yml up -d
pnpm dev
```

---

## Recommended shutdown sequence

At the end of the day:

```bash
# in the terminal running dev servers
Ctrl + C

# in WSL
docker compose -f infra/docker/docker-compose.yml down

# in PowerShell or CMD
wsl --shutdown
```

Then close Docker Desktop if you are done for the day.

---

## Reference links

- WSL installation: https://learn.microsoft.com/en-us/windows/wsl/install
- Docker Desktop on Windows: https://docs.docker.com/desktop/setup/install/windows-install/
- Docker Desktop with WSL 2 backend: https://docs.docker.com/desktop/features/wsl/
- Docker + WSL best practice: https://docs.docker.com/desktop/features/wsl/use-wsl/
- VS Code Remote - WSL: https://code.visualstudio.com/docs/remote/wsl
- Expo environment setup: https://docs.expo.dev/get-started/set-up-your-environment/
- Expo Android emulator guide: https://docs.expo.dev/workflow/android-studio-emulator/
- Expo iOS simulator note: https://docs.expo.dev/workflow/ios-simulator/
- pnpm installation: https://pnpm.io/installation
- Next.js installation: https://nextjs.org/docs/app/getting-started/installation
- NestJS CLI: https://docs.nestjs.com/cli/overview
- Docker Compose `stop`: https://docs.docker.com/reference/cli/docker/compose/stop/
- Docker Compose `down`: https://docs.docker.com/reference/cli/docker/compose/down/
- WSL shutdown command: https://learn.microsoft.com/en-us/windows/wsl/basic-commands

---

## Maintainer note

If the repo structure or commands change, update this file together with:

- `.env.example`
- `package.json` scripts
- `infra/docker/docker-compose.yml`
- onboarding notes in the main `README.md`