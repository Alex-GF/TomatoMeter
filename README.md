# TomatoMeter

![Analytics View](images/analytics-view.png)

TomatoMeter is a Pomodoro productivity app whose behavior is driven by its pricing. This repository packages it together with [SPHERE](https://github.com/SCORELabUS/sphere) and [SPACE](https://github.com/SCORELabUS/space) in a reproducible lab that demonstrates the full *No-code Pricing-Driven Self-adaptation* cycle: a pricing is designed and published in SPHERE, operated at runtime by SPACE, and enforced by TomatoMeter without redeploying the application.

Developed by the [SCORE Lab](https://github.com/SCORELabUS), this project is part of ongoing research into pricing-driven development and operation.

▶️ **Watch the demo video:** [https://youtu.be/tQYkeKHu9qo](https://youtu.be/tQYkeKHu9qo)

## Table of Contents

1. [Quick Start](#quick-start)
2. [How It Works](#how-it-works)
3. [Lab Internals](#lab-internals)
4. [About TomatoMeter and its Pricing](#about-tomatometer-and-its-pricing)
5. [Project Structure](#project-structure)
6. [Tech Stack](#tech-stack)
7. [Disclaimer & License](#disclaimer--license)

---

## Quick Start

### Prerequisites

- [Docker](https://www.docker.com/get-started) (Desktop or Engine) with Docker Compose.
- Node.js with npm, only to run the `lab:*` scripts.
> [!NOTE]
> We recommed using pnpm as the package manager, but npm works too.
- Ports `5401`, `5402` and `5403` free on your machine.

### Start the lab

```bash
git clone https://github.com/Alex-GF/TomatoMeter.git
cd TomatoMeter
npm run lab:up
```

The first run downloads the SPHERE and SPACE images and builds TomatoMeter, so it takes a few minutes. The lab is ready when `lab-bootstrap` reports it.

### Services

Once the bootstrap finishes, you can access the three services in your browser:

| Service | Role | URL |
|---------|------|-----|
| **TomatoMeter** | The SaaS application whose features depend on the pricing | [http://localhost:5401](http://localhost:5401) |
| **SPHERE** | Pricing design and publication | [http://localhost:5402](http://localhost:5402) |
| **SPACE** | Runtime pricing enforcement | [http://localhost:5403](http://localhost:5403) |

### Credentials

SPHERE and SPACE share the same demo account:

| Username | Password |
|----------|----------|
| `tomato_demo` | `tomato-demo` |

TomatoMeter needs no login.

### Stop and reset

To stop the lab and delete all its data, run the following command in the project root:

```bash
npm run lab:down
```

## How It Works

![Pricing update workflow across SPHERE, SPACE and TomatoMeter](images/pricing-workflow.webp)

The figure follows a running example: John, a stakeholder, changes the Basic plan so that it allows **5 pomodoros per day** (instead of 3) and **includes the Daily summary**. The workflow has seven steps. John performs the first two in SPHERE; SPACE and TomatoMeter carry out the other five automatically.

**Pricing design and release (SPHERE)**

1. **Pricing editor.** John edits the TomatoMeter pricing in SPHERE, either visually or by modifying its YAML directly.
2. **Version history.** John publishes the changes as a new version (`v1.2`), which is stored next to the previous ones. SPHERE exposes every published version through a read-only **public API** behind the pricing's permanent link (`/p/{pricingId}`). The API returns a manifest of versions, each with a release date and a content hash, and lets clients download the YAML of any version.

**Runtime enforcement (SPACE)**

3. **Sync worker.** The `TomatoMeter` service in SPACE is *linked* to that permanent link instead of holding an uploaded pricing. A sync worker periodically polls the manifest (every minute in this lab; the SPACE default is five minutes) and selects the target version according to the synchronization policy. The lab uses `all_last`, which targets the latest published version.
4. **Snapshot import.** When a new target appears, SPACE downloads its YAML, checks that it matches the hash in the manifest, validates it, and stores it as an immutable version of the service.
5. **Contract migration.** SPACE migrates the active contracts to `v1.2`. It keeps their plan, add-ons, billing dates and usage whenever they are still valid, and it falls back to the cheapest valid plan otherwise. If any contract cannot be migrated, none is, and every migration is recorded in the contract history.
6. **Event service.** SPACE invalidates its cached pricings, contracts and feature evaluations, then broadcasts a *pricing activated* event over WebSockets.

**Adaptation (TomatoMeter)**

7. **Frontend and backend.** Both sides of TomatoMeter listen to these events through the SPACE SDKs. The frontend re-renders its components (the Daily summary unlocks and the counter now reads *3 of 5 pomodoros used*). The backend enforces the new business rules (`limit: 5 pomodoros / day`, `daily summary: enabled`). No code change or redeployment is involved.

> [!NOTE]
> Linking SPACE to SPHERE is a one-time configuration, and the lab bootstrap does it for you. From then on, SPHERE is the only source of truth: SPACE rejects manual uploads to a linked service, so make every pricing change in SPHERE.

## Try it yourself

Prefer to watch first? The [demo video](https://youtu.be/tQYkeKHu9qo) shows the lab in action.

Reproduce the example from the figure in the running lab:

1. **Check the starting point.** Open TomatoMeter at [http://localhost:5401](http://localhost:5401). The demo user is on the Basic plan: 3 pomodoros per day and no Daily summary. Start pomodoros until the limit blocks you.
2. **Edit the pricing (step 1).** Log in to SPHERE at [http://localhost:5402](http://localhost:5402) as `tomato_demo` and open the TomatoMeter pricing in the editor. In the Basic plan, raise `maxPomodoroTimers` to `5` and enable `dailySummary`.
3. **Publish (step 2).** Publish the changes as a new public version.
4. **Watch SPACE work (steps 3–6).** Within a minute, SPACE detects the version, imports it and migrates the contract. To follow it, open the `TomatoMeter` service in SPACE at [http://localhost:5403](http://localhost:5403): it shows the synchronization status, the applied version and the number of migrated contracts.
5. **See TomatoMeter adapt (step 7).** Go back to TomatoMeter. Your usage is kept and the limit is now 5, so you can start another session. The Daily summary is also unlocked. If the page was in the background, refresh it.

You can repeat the cycle with any other change, such as removing a feature from a plan or lowering a limit, and see TomatoMeter apply the new restrictions.

## Lab Internals

The lab is a single Docker Compose project ([docker/lab/docker-compose.yml](docker/lab/docker-compose.yml)) on a private network. Each application sits behind its own nginx proxy, which is the only container that publishes a port.

| Application | Containers | Image |
|-------------|------------|-------|
| SPHERE | `sphere-server`, `sphere-client`, `sphere-mongodb`, `sphere-redis`, `sphere-nginx` | `ghcr.io/scorelabus/sphere-{api,client}:2.6.0` |
| SPACE | `space-server`, `space-client`, `space-mongodb`, `space-redis`, `space-nginx` | `ghcr.io/scorelabus/space-{api,client}:1.7.0` |
| TomatoMeter | `tomatometer-server`, `tomatometer-client`, `tomatometer-nginx` | Built from this repository |

SPHERE and SPACE come as public images, so you do not need their repositories. To use other versions, set `SPHERE_VERSION` and `SPACE_VERSION` before starting the lab. SPACE talks to SPHERE inside the Docker network (`http://sphere-server:8080`), not through the public ports.

### Provisioning

A one-shot `lab-bootstrap` service ([docker/lab/bootstrap.mjs](docker/lab/bootstrap.mjs)) provisions everything automatically:

- Creates the `tomato_demo` user in SPHERE and SPACE, and the `tomatometer-lab` organization in SPACE.
- Leaves only the original pricing from `api/resources/TomatoMeter.yml` in SPHERE and publishes it.
- Links the SPACE `TomatoMeter` service to the SPHERE pricing with the `all_last` policy.
- Creates the basic contract used by the TomatoMeter interface and hands the SPACE configuration to the TomatoMeter server.

Two helper containers run first: `clean-sphere-pricings` leaves SPHERE with only the reference pricing, and `verify-sphere-demo-user` marks the demo user's email as verified. TomatoMeter starts only after the bootstrap finishes successfully.

## About TomatoMeter and its Pricing

TomatoMeter is a productivity management app based on the Pomodoro technique. It allows users to track their work sessions, evaluate their productivity, and review insights about their performance.

### Pricing

The reference pricing ([api/resources/TomatoMeter.yml](api/resources/TomatoMeter.yml)) defines three plans (BASIC, ADVANCED, and PREMIUM) and two add-ons (*Extra Timers* and *Export as JSON*).

**Features:**

- **Pomodoro Timer:** A timer to manage work sessions based on the Pomodoro technique, subject to a daily **usage limit** (`maxPomodoroTimers`) on the number of timers that can be started.
- **Sound Notifications:** Sound notifications that signal the end of each pomodoro.
- **Basic Analytics:** Number of completed pomodoros, total time worked, and productivity score.
- **Motivational Quotes:** Motivational quotes shown above the timer.
- **Daily Summary:** Overview of completed pomodoros by day over the last month.
- **Dark Mode:** A dark color scheme for low-light environments.
- **Custom Pomodoro Duration:** Custom durations for pomodoros and breaks.
- **Advanced Analytics:** Productivity trends, pomodoro streaks, and more.
- **Export Data as JSON:** Export pomodoro data in JSON format for further analysis or backup.

The pricing page (see image below) shows which features are enabled or disabled for each subscription (i.e., the selected plan and, optionally, contracted add-ons).

![Pricing Plans](images/pricing-plans.png)

## Project Structure

```
.
├── api/                # Backend (Express, TypeScript)
│   ├── config/         # Configuration files
│   ├── middlewares/    # Express middlewares
│   ├── resources/      # Reference pricing (TomatoMeter.yml)
│   ├── routes/         # API routes
│   └── utils/          # Backend utilities (SPACE integration)
├── src/                # Frontend (React, Vite, TypeScript)
│   ├── apps/           # App entry points
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React context providers
│   ├── data/           # Static data (JSON)
│   ├── lib/            # Frontend libraries/utilities
│   ├── pages/          # Page components
│   └── static/         # Static assets (CSS, sounds)
├── docker/
│   └── lab/            # SPHERE × SPACE × TomatoMeter lab (compose, bootstrap, nginx)
├── tests/              # Subscription synchronization tests
├── images/             # Project screenshots and images
├── tsconfig.json       # TypeScript configuration
├── package.json        # Project metadata and scripts
└── README.md           # This file
```

---

## Tech Stack

<div align="center">

| Frontend         | Backend         | Tooling & DevOps      | Other                |
|------------------|----------------|-----------------------|----------------------|
| ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white&style=for-the-badge) | ![Express](https://img.shields.io/badge/-Express-000?logo=express&logoColor=white&style=for-the-badge) | ![Docker](https://img.shields.io/badge/-Docker-2496ED?logo=docker&logoColor=white&style=for-the-badge) | ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white&style=for-the-badge) |
| ![Vite](https://img.shields.io/badge/-Vite-646CFF?logo=vite&logoColor=white&style=for-the-badge) | ![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white&style=for-the-badge) | ![pnpm](https://img.shields.io/badge/-pnpm-F69220?logo=pnpm&logoColor=white&style=for-the-badge) | ![TailwindCSS](https://img.shields.io/badge/-TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white&style=for-the-badge) |
| ![Framer Motion](https://img.shields.io/badge/-Framer%20Motion-EF008F?logo=framer&logoColor=white&style=for-the-badge) | ![Helmet](https://img.shields.io/badge/-Helmet-000?logo=helmet&logoColor=white&style=for-the-badge) | ![ESLint](https://img.shields.io/badge/-ESLint-4B32C3?logo=eslint&logoColor=white&style=for-the-badge) | ![Prettier](https://img.shields.io/badge/-Prettier-F7B93E?logo=prettier&logoColor=white&style=for-the-badge) |

</div>

---

## Disclaimer & License

> **License:**
> This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

> **Disclaimer:**
> This repository is developed and maintained in a controlled research environment by the [SCORE Lab](https://score.us.es) to demonstrate advances in pricing-driven self-adaptation solutions.
> The SCORE Lab is not responsible for any issues, damages, or consequences that may arise if this software is used in other projects or production environments.
> Use at your own risk.

If you have any questions or want to contribute, feel free to open an issue or contact the maintainers.
