# Update the Pricing, not the Code: A hands-on tutorial on pricing-driven self-adaptation

**ICSOC 2026**

![TomatoMeter](images/analytics-view.png)

In 2019, Salesforce's pricing offered around 10 subscription options; by 2024, over 12,000. The software must enforce each of them, even as subscriptions change through customer upgrades or provider updates. The latter are the real pain point: when pricing logic is hard-coded, every pricing update turns into code changes, redeployments and technical debt.

**Pricing-driven self-adaptation** removes this bottleneck: the service adapts its behavior to the user's subscription and to the pricing version it refers to. In this tutorial you will first change the pricing of a SaaS and watch it adapt on the fly, and then build that capability yourself.

This repository is everything you need during the session. It packages three applications in a reproducible lab:

- **TomatoMeter**, a fictitious productivity app whose features depend on its pricing.
- **[SPHERE](https://github.com/SCORELabUS/sphere)**, where the pricing is designed, versioned and published.
- **[SPACE](https://github.com/SCORELabUS/space)**, which operates that pricing at runtime: it follows its new versions, migrates the subscriptions and controls feature access.

**Organizers:** Alejandro García-Fernández, Francisco Javier Cavero, José Antonio Parejo and Antonio Ruiz-Cortés ([SCORE Lab](https://score.us.es), I3US Institute, Universidad de Sevilla).

▶️ **Prefer to watch first?** [Demo video](https://youtu.be/tQYkeKHu9qo)

## Contents

- [Before the tutorial](#before-the-tutorial)
- [Schedule](#schedule)
  1. [Welcome and introduction](#1--welcome-and-introduction-5-min)
  2. [First contact: the demo](#2--first-contact-the-demo-30-min)
  3. [Architecture](#3--architecture-10-min)
  4. [Hands-on development](#4--hands-on-development-45-min)
  5. [Conclusions, summary and Q&A](#5--conclusions-summary-and-qa-15-min)
- [Reference](#reference)
- [Disclaimer & License](#disclaimer--license)

---

## Before the tutorial

### Requirements

- **Git** and a code editor (VS Code or similar).
- **Docker** (Desktop or Engine) with Docker Compose, **running**.
- **Node.js** with npm, only to run the lab commands.
- Ports `5401`, `5402` and `5403` free on your machine.

Basic knowledge of web applications and REST APIs is enough. No prior experience with React is needed.

### Get the code

```bash
git clone https://github.com/SCORELabUS/TomatoMeter.git
```

```bash
cd TomatoMeter
```

> [!TIP]
> **Warm up the lab before the session.** The first start downloads the SPHERE and SPACE images and builds TomatoMeter, which takes a few minutes and a good connection. Run `npm run demo` once at home, wait until it prints the URLs, and stop it with `npm run down`. During the session everything will start in seconds.

---

## Schedule

The tutorial lasts **1h 45min**. All commands run from the repository root.

| Time | Slot | What you do | Command |
|------|------|-------------|---------|
| 0:00 – 0:05 | [1 · Welcome and introduction](#1--welcome-and-introduction-5-min) | Check your setup | — |
| 0:05 – 0:35 | [2 · First contact](#2--first-contact-the-demo-30-min) | Release a new pricing version and watch TomatoMeter adapt | `npm run demo` |
| 0:35 – 0:45 | [3 · Architecture](#3--architecture-10-min) | Follow how SPHERE, SPACE and TomatoMeter close the loop | — |
| 0:45 – 1:30 | [4 · Hands-on development](#4--hands-on-development-45-min) | Build the pricing-driven workflow from scratch, following the [Lab Manual](tutorial/MANUAL.md) | `npm run tutorial:1` |
| 0:45 – 1:00 | ↳ Stage 1 · Pricing design in SPHERE | | `npm run tutorial:1` |
| 1:00 – 1:15 | ↳ Stage 2 · Linking the pricing to SPACE | | `npm run tutorial:2` |
| 1:15 – 1:30 | ↳ Stage 3 · Integrating SPACE into TomatoMeter | | `npm run tutorial:3` |
| 1:30 – 1:45 | [5 · Conclusions, summary and Q&A](#5--conclusions-summary-and-qa-15-min) | Recap and questions | `npm run down` |

---

## 1 · Welcome and introduction (5 min)

We introduce pricing-driven self-adaptation and what it achieves. For the background, see [*Trends in industry support for pricing-driven DevOps in SaaS*](https://doi.org/10.1109/TSC.2025.3634801) (IEEE Transactions on Services Computing, 2026).

Meanwhile, check that your setup is ready. Each of these commands should print a version:

```bash
git --version
```

```bash
docker compose version
```

```bash
node --version
```

If you have not warmed up the lab yet, start the demo now (see the next slot): it will be downloading while we talk.

---

## 2 · First contact: the demo (30 min)

You run the complete TomatoMeter lab, release a new pricing version in SPHERE and watch subscriptions gain or lose features at runtime.

### Start the demo

```bash
npm run demo
```

The command resets SPHERE and SPACE, starts the lab and returns when everything is ready. It prints:

```text
  TomatoMeter  http://localhost:5401
  SPHERE       http://localhost:5402
  SPACE        http://localhost:5403
  Credentials  tomato_demo / tomato-demo  (SPHERE and SPACE)
```

| Service | Role | URL | Login |
|---------|------|-----|-------|
| **TomatoMeter** | The SaaS whose features depend on the pricing | [http://localhost:5401](http://localhost:5401) | None |
| **SPHERE** | Pricing design, versioning and publication | [http://localhost:5402](http://localhost:5402) | `tomato_demo` / `tomato-demo` |
| **SPACE** | Runtime pricing operation | [http://localhost:5403](http://localhost:5403) | `tomato_demo` / `tomato-demo` |

### Change the pricing and watch TomatoMeter adapt

1. **Check the starting point.** Open TomatoMeter at [http://localhost:5401](http://localhost:5401). The demo user is on the Basic plan: 3 pomodoros per day and no Daily summary. Start pomodoros until the limit blocks you.
2. **Edit the pricing.** Log in to SPHERE at [http://localhost:5402](http://localhost:5402) and open the TomatoMeter pricing in the editor. In the Basic plan, raise `maxPomodoroTimers` to `5` and enable `dailySummary`.
3. **Publish.** Publish the changes as a new public version.
4. **Watch SPACE work.** Within a minute, SPACE detects the version, imports it and migrates the contract. To follow it, log in to SPACE at [http://localhost:5403](http://localhost:5403) and open the `TomatoMeter` service: it shows the synchronization status, the applied version and the number of migrated contracts.
5. **See TomatoMeter adapt.** Go back to TomatoMeter. Your usage is kept and the limit is now 5, so you can start another session. The Daily summary is also unlocked. If the page was in the background, refresh it.

Repeat the cycle with other changes, such as removing a feature from a plan or lowering a limit, and watch TomatoMeter apply the new restrictions. No code change and no redeploy are involved.

---

## 3 · Architecture (10 min)

![Pricing update workflow across SPHERE, SPACE and TomatoMeter](images/pricing-workflow.webp)

Pricing-driven self-adaptation follows a **MAPE-K loop** ([Kephart & Chess, 2003](https://doi.org/10.1109/MC.2003.1160055)). SPHERE is the repository of pricing versions and the editor to release new ones; SPACE monitors those versions, updates the subscriptions and controls feature access; TomatoMeter is the managed system.

| MAPE-K | Who | In the lab |
|--------|-----|------------|
| **Monitor** | SPACE | A sync worker polls the manifest of the linked pricing in SPHERE. |
| **Analyze** | SPACE | It selects the target version according to the synchronization policy and validates it. |
| **Plan** | SPACE | It decides how every active contract moves to the new version. |
| **Execute** | SPACE → TomatoMeter | It migrates the contracts and notifies TomatoMeter, which re-renders and enforces the new rules. |
| **Knowledge** | SPHERE & SPACE | The pricing versions (SPHERE), and the contracts and usage of every user (SPACE). |

The figure follows a running example: John, a stakeholder, changes the Basic plan so that it allows **5 pomodoros per day** (instead of 3) and **includes the Daily summary**, as you did in the demo. John performs the first two steps in SPHERE; SPACE and TomatoMeter carry out the other five automatically.

**Pricing design and release (SPHERE)**

1. **Pricing editor.** John edits the TomatoMeter pricing in SPHERE, either visually or by modifying its YAML directly.
2. **Version history.** John publishes the changes as a new version (`v1.2`), which is stored next to the previous ones. SPHERE exposes every published version through a read-only **public API** behind the pricing's permanent link (`/p/{pricingId}`). The API returns a manifest of versions, each with a release date and a content hash, and lets clients download the YAML of any version.

**Runtime operation (SPACE)**

3. **Sync worker.** The `TomatoMeter` service in SPACE is *linked* to that permanent link instead of holding an uploaded pricing. A sync worker periodically polls the manifest (every minute in this lab; the SPACE default is five minutes) and selects the target version according to the synchronization policy. The lab uses `all_last`, which targets the latest published version.
4. **Snapshot import.** When a new target appears, SPACE downloads its YAML, checks that it matches the hash in the manifest, validates it, and stores it as an immutable version of the service.
5. **Contract migration.** SPACE migrates the active contracts to `v1.2`. It keeps their plan, add-ons, billing dates and usage whenever they are still valid, and it falls back to the cheapest valid plan otherwise. If any contract cannot be migrated, none is, and every migration is recorded in the contract history.
6. **Event service.** SPACE invalidates its cached pricings, contracts and feature evaluations, then broadcasts a *pricing activated* event over WebSockets.

**Adaptation (TomatoMeter)**

7. **Frontend and backend.** Both sides of TomatoMeter listen to these events through the SPACE SDKs. The frontend re-renders its components (the Daily summary unlocks and the counter now reads *3 of 5 pomodoros used*). The backend enforces the new business rules (`limit: 5 pomodoros / day`, `daily summary: enabled`).

> [!NOTE]
> Linking SPACE to SPHERE is a one-time configuration. From then on, SPHERE is the only source of truth: SPACE rejects manual uploads to a linked service, so every pricing change is made in SPHERE.

---

## 4 · Hands-on development (45 min)

Now you build that workflow yourself. You start from an incomplete TomatoMeter that knows nothing about its pricing, in [tutorial/tomatometer](tutorial/tomatometer), and make it pricing-driven.

### 👉 Follow the [Lab Manual](tutorial/MANUAL.md)

It walks you through every step with screenshots, and each step has its solution in a collapsible block in case you get stuck.

| Time | Stage | Lab Manual | Checkpoint |
|------|-------|------------|------------|
| — | Set up the lab and look at the starter | [Part 0](tutorial/MANUAL.md#part-0--set-up-the-lab) | `npm run tutorial:1` |
| 15 min | **Stage 1 · Pricing design in SPHERE.** Design TomatoMeter's pricing from scratch and publish it. | [Part 1](tutorial/MANUAL.md#part-1--design-the-pricing-in-sphere) | `npm run tutorial:1` |
| 15 min | **Stage 2 · Linking the pricing to SPACE.** Create the service linked to SPHERE, choose its update policy and give TomatoMeter an API key. | [Part 2](tutorial/MANUAL.md#part-2--operate-the-pricing-with-space) | `npm run tutorial:2` |
| 15 min | **Stage 3 · Integrating SPACE into TomatoMeter.** Complete the `TODO`s in the backend and frontend, then release a new pricing version and watch your code adapt. | [Part 3](tutorial/MANUAL.md#part-3--connect-tomatometer-to-space) and [Part 4](tutorial/MANUAL.md#part-4--change-the-pricing-and-watch-tomatometer-adapt) | `npm run tutorial:3` |

### Checkpoints

Each stage starts from a **checkpoint**: a version of the lab with all previous stages already solved. If you fall behind, run the next checkpoint and rejoin the group.

| Command | SPHERE | SPACE |
|---------|--------|-------|
| `npm run tutorial:1` | Only the `tomato_demo` user | Only the `tomato_demo` user |
| `npm run tutorial:2` | TomatoMeter pricing published | Only the `tomato_demo` user |
| `npm run tutorial:3` | TomatoMeter pricing published | Service linked to SPHERE, API key already in `tutorial/tomatometer/.env` |

All checkpoints run the **same TomatoMeter code**, in development mode: it reloads as soon as you save a file. URLs and credentials are the same as in the demo.

> [!NOTE]
> Starting a checkpoint resets SPHERE and SPACE, but **never touches your code** in `tutorial/tomatometer`. The command keeps showing TomatoMeter's logs; press `Ctrl+C` to stop following them (the lab keeps running).

The finished code is in [tutorial/solution](tutorial/solution), with the same paths as the starter. If something goes wrong, check the [Troubleshooting](tutorial/MANUAL.md#troubleshooting) section of the manual.

---

## 5 · Conclusions, summary and Q&A (15 min)

You closed the whole cycle of pricing-driven self-adaptation:

- **Design.** The pricing became a versioned, public artifact in SPHERE, with a permanent link.
- **Operation.** SPACE follows that link, imports every new version, migrates the contracts and notifies the apps.
- **Enforcement.** TomatoMeter evaluates features against SPACE in the backend and renders from a pricing token in the frontend.
- **Adaptation.** A new pricing version took effect without a code change or a redeploy.

The same integration works for your own services: SPACE offers SDKs for [Node.js](https://github.com/Alex-GF/space-node-client), [React](https://github.com/Alex-GF/space-react-client) and [Python](https://github.com/Alex-GF/space-python-client); but you can always integrate with its [REST API](https://sphere-docs.vercel.app/docs/2.0.1/api/space/space-api)

To stop the lab and delete all its data:

```bash
npm run down
```

---

## Reference

### Lab internals

The lab is a single Docker Compose project on a private network, started by [scripts/lab.mjs](scripts/lab.mjs). SPHERE and SPACE are defined in [infra/compose.base.yml](infra/compose.base.yml); TomatoMeter comes from an overlay: [infra/compose.demo.yml](infra/compose.demo.yml) builds the demo, and [infra/compose.tutorial.yml](infra/compose.tutorial.yml) runs the tutorial starter in development mode. Each application sits behind its own nginx proxy or dev server, which is the only container that publishes a port.

| Application | Containers | Image |
|-------------|------------|-------|
| SPHERE | `sphere-server`, `sphere-client`, `sphere-mongodb`, `sphere-redis`, `sphere-nginx` | `ghcr.io/scorelabus/sphere-{api,client}:2.6.0` |
| SPACE | `space-server`, `space-client`, `space-mongodb`, `space-redis`, `space-nginx`, `space-sphere-link` | `ghcr.io/scorelabus/space-{api,client}:1.7.1` |
| TomatoMeter (demo) | `tomatometer-server`, `tomatometer-client`, `tomatometer-nginx` | Built from [demo/](demo) |
| TomatoMeter (tutorial) | `tomatometer` (Vite + API in watch mode) | [tutorial/tomatometer](tutorial/tomatometer), mounted from your disk |

SPHERE and SPACE come as public images, so you do not need their repositories. To use other versions, set `SPHERE_VERSION` and `SPACE_VERSION` before starting the lab. SPACE links services to SPHERE with the same permanent links that the SPHERE UI copies (`http://localhost:5402/p/{pricingId}`). Inside the lab, the `space-sphere-link` proxy shares the SPACE container's network and forwards its `localhost:5402` to SPHERE, so those links work from SPACE too.

A one-shot `lab-bootstrap` service ([infra/bootstrap/bootstrap.mjs](infra/bootstrap/bootstrap.mjs)) provisions SPHERE and SPACE up to a stage chosen by the launcher. Each stage includes the previous ones:

| Stage | Used by | Provisions |
|-------|---------|------------|
| `empty` | `npm run tutorial:1` | The `tomato_demo` user in SPHERE (verified by `verify-sphere-demo-user`) and in SPACE, with its default `TomatoMeter Lab` organization. |
| `pricing` | `npm run tutorial:2` | + The reference pricing ([demo/api/resources/TomatoMeter.yml](demo/api/resources/TomatoMeter.yml)) published in SPHERE. |
| `linked` | `npm run tutorial:3` | + The SPACE `TomatoMeter` service linked to that pricing with the `all_last` policy, and the organization API key written to `tutorial/tomatometer/.env`. |
| `demo` | `npm run demo` | + The contracts used by the demo interface, and the SPACE configuration handed to the TomatoMeter server. |

TomatoMeter starts only after the bootstrap finishes successfully.

### TomatoMeter and its pricing

TomatoMeter is a productivity app based on the Pomodoro technique. It lets users track their work sessions, evaluate their productivity and review insights about their performance.

The reference pricing ([demo/api/resources/TomatoMeter.yml](demo/api/resources/TomatoMeter.yml)) defines three plans (BASIC, ADVANCED and PREMIUM) and two add-ons (*Extra Timers* and *Export as JSON*), over these features:

- **Pomodoro Timer:** A timer to manage work sessions based on the Pomodoro technique, subject to a daily **usage limit** (`maxPomodoroTimers`) on the number of timers that can be started.
- **Sound Notifications:** Sound notifications that signal the end of each pomodoro.
- **Basic Analytics:** Number of completed pomodoros, total time worked, and productivity score.
- **Motivational Quotes:** Motivational quotes shown above the timer.
- **Daily Summary:** Overview of completed pomodoros by day over the last month.
- **Dark Mode:** A dark color scheme for low-light environments.
- **Custom Pomodoro Duration:** Custom durations for pomodoros and breaks.
- **Advanced Analytics:** Productivity trends, pomodoro streaks, and more.
- **Export Data as JSON:** Export pomodoro data in JSON format for further analysis or backup.

The pricing page shows which features each subscription (the selected plan and, optionally, contracted add-ons) enables:

![Pricing Plans](images/pricing-plans.png)

### Project structure

```
.
├── README.md             # This file: the tutorial's entry point
├── package.json          # Lab commands: demo, tutorial:1|2|3, down
├── scripts/lab.mjs       # Launcher used by those commands
├── infra/                # Docker Compose files, bootstrap, nginx and MongoDB setup
├── demo/                 # TomatoMeter fully integrated with SPACE (slot 2)
│   ├── api/              # Backend (Express, TypeScript); resources/ holds the reference pricing
│   ├── src/              # Frontend (React, Vite, TypeScript)
│   ├── docker/           # Images used by the demo
│   └── tests/            # Subscription synchronization tests
├── tutorial/             # Hands-on development (slot 4)
│   ├── MANUAL.md         # Step-by-step Lab Manual with screenshots (manual/images)
│   ├── target-pricing.png# Pricing to design in stage 1
│   ├── tomatometer/      # Starter app, with the TODOs to connect it to SPACE
│   └── solution/         # The starter files that change, already solved
└── images/               # Figures used in this README
```

### Tech stack

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
