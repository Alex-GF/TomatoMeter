# SPACE Demo

![Analytics View](images/analytics-view.png)

## Table of Contents

1. [Introduction](#introduction)
2. [Live Demo with Docker](#live-demo-with-docker)
3. [About the Demo Application & Pricing](#about-the-demo-application--pricing)
4. [Project Structure](#project-structure)
5. [Tech Stack](#tech-stack)
6. [Disclaimer & License](#disclaimer--license)

---

## Introduction

Welcome to the **SPACE Demo** project!  

This repository presents a Pomodoro timer application that integrates with [SPACE](https://github.com/Alex-GF/space) as its pricing-driven self-adaptation engine, enabling dynamic behavior based on variability induced by its pricing model.

Developed by the [ISA-Group](https://github.com/isa-group), this project is part of ongoing research into pricing-driven development and operation.

## Live Demo with Docker

You can launch the entire demo locally using Docker.

**Requirements:**  
- [Docker](https://www.docker.com/get-started) installed on your machine.

### Run a SPACE instance

Before running the demo, you need to have a SPACE instance running. You can do this by following these steps:

1. Clone the space repository and navigate to its folder:

```bash
git clone https://github.com/Alex-GF/space-demo.git
cd space-demo
```

2. Create a `.env` file with the minimum required variables and test data:

> For a quicker setup, we recommend running the following command to create a simple `.env` file.

```bash
cat <<EOF > .env
# ---------- CACHE CONFIGURATION (Redis) ----------

REDIS_URL=redis://localhost:6379

# ---------- JWT CONFIGURATION ----------

JWT_SECRET=test_secret
JWT_SALT='wgv~eb6v=VWwC9GIG1q6rZ]J.tUM(M'
JWT_EXPIRATION=1d

# ---------- DEFAULT USER CONFIGURATION ----------

ADMIN_USER=admin
ADMIN_PASSWORD=4dm1n
EOF
```

3. Run the SPACE instance using Docker Compose:

```bash
cd docker/production

docker compose up -d
```

Then wait for the SPACE instance to start. If everything is set up correctly, your space instance should be running at [http://localhost:5403](http://localhost:5403/api/v1/healthcheck).

### Run TomatoMeter (demo application)

Now that you have a SPACE instance running, you can launch the TomatoMeter demo application.

1. Clone the repository

```bash
git clone https://github.com/Alex-GF/space-demo.git
cd space-demo
```

2. Generate a `.env` file that sets the environment variable *SPACE_API_KEY*:

> For quiker setup, you can run the following command to create a `.env` file with the necessary configuration. This will run a script that rerieves the API key of an admin user from the SPACE instance you started earlier (considering that you used the configuration provided in this tutorial to do so).

```bash
chmod +x scripts/retrieve-space-api-key.sh
./scripts/retrieve-space-api-key.sh
```

3. Run TomatoMeter using Docker Compose:

```bash
cd docker
docker compose up -d
```

Wait for the space-demo-nginx instance to start. If everything is set up correctly, the TomatoMeter SPACE demo should be running at [http://localhost](http://localhost).

## About the Demo Application & Pricing

The SPACE Demo is a productivity and expense management app with a modular, feature-flagged architecture.  
**Key features include:**
- Pomodoro timer
- Daily and weekly productivity summaries
- Expense tracking and analytics
- Dynamic pricing plans with feature toggling

The pricing page (see image below) demonstrates how different features are enabled or disabled based on the selected plan, using a pricing-driven feature flag system.

![Pricing Plans](images/pricing-plans.png)

---

## Project Structure

The repository is organized as follows:

```
.
├── api/                # Backend (Express, TypeScript)
│   ├── config/         # Configuration files
│   ├── middlewares/    # Express middlewares
│   ├── resources/      # API resources (YAML, etc.)
│   ├── routes/         # API routes
│   └── utils/          # Backend utilities
├── src/                # Frontend (React, Vite, TypeScript)
│   ├── apps/           # App entry points
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React context providers
│   ├── data/           # Static data (JSON)
│   ├── lib/            # Frontend libraries/utilities
│   ├── pages/          # Page components
│   └── static/         # Static assets (CSS, sounds)
├── docker/             # Docker and Docker Compose files
├── nginx/              # Nginx configuration (if used)
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
> This repository is developed and maintained in a controlled research environment by the [ISA-Group](https://isa-group.es) to demonstrate advances in software engineering research.  
> The ISA-Group is not responsible for any issues, damages, or consequences that may arise if this software is used in other projects or production environments.  
> Use at your own risk.

---

If you have any questions or want to contribute, feel free to open an issue or contact the maintainers.

---

