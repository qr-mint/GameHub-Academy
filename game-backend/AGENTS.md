# Backend — AGENTS.md

## Purpose

This project contains the Backend template for a GameFi application.

The Backend is responsible for:

* API endpoints;
* authentication and authorization;
* user management;
* game business logic;
* database operations;
* Telegram Bot integration;
* QR Mint integration;
* blockchain operations;
* transaction verification;
* rewards and game economy;
* trusted server-side state.

The Backend is a **trusted part of the application architecture**.

However, data received from the Frontend must still be treated as **untrusted input** and must be validated before it is used.

---

# 1. Main Architecture

The main application flow is:

```text
Player
   ↓
Frontend / Game
   ↓
Backend API
   ↓
Business Logic
   ↓
Database
   ↓
QR Mint
   ↓
Blockchain
```

The Backend is responsible for coordinating the application's trusted business logic.

The Frontend is not trusted.

For example:

```text
Frontend:
"Player has 100 tokens."
```

Do not automatically trust this value.

The Backend must obtain the authoritative value from the appropriate trusted source.

Similarly:

```text
Frontend:
"Player won the tournament."
```

This must not automatically trigger a reward.

The Backend must verify the required conditions before performing a privileged operation.

---

# 2. Main Rule for AI Agents

Before modifying Backend code, **understand the existing architecture first**.

Do not immediately start writing code.

Follow this process:

```text
Understand
   ↓
Locate
   ↓
Reuse
   ↓
Modify
   ↓
Validate
   ↓
Test
```

Before implementing a new feature:

1. Read `README.md`.
2. Read `AGENTS.md`.
3. Read the relevant documentation in `docs/`.
4. Inspect the existing implementation.
5. Find existing similar functionality.
6. Find the related routes.
7. Find the middleware.
8. Find the relevant module.
9. Find database models and queries.
10. Check external integrations.
11. Only then modify the code.

---

# 3. Do Not Duplicate Existing Systems

If the project already contains a system for:

```text
Authentication
Authorization
Users
Database
Telegram
QR Mint
Blockchain
NFTs
Tournaments
Rewards
Transactions
```

reuse it.

Do not create a second implementation simply because it is easier for the current task.

For example, do not create:

```text
NewAuthService
NewUserService
NewBlockchainService
NewTournamentService
```

without first checking whether an existing implementation already provides the required functionality.

---

# 4. Environment Variables and Secrets

The Backend uses environment variables for configuration and secrets.

Examples:

```env
DATABASE_URL=
DIRECT_URL=

MODE=dev

CORE_PORT=
CORE_HOSTNAME=
CORE_PATH=
CORE_NAME=

API_BASE_HOST=
GAME_APP_URL=

GAME_BOT_TOKEN=
GAME_PRIVATE_KEY=

TON_PARTNER_COLLECTION_KEY=
BOTCHAIN_PARTNER_COLLECTION_KEY=

GAME_TON_ADDRESS=
GAME_EVM_ADDRESS=
```

## Critical Security Rule

Backend secrets must never be committed to Git.

Never expose:

```text
Private Keys
Bot Tokens
Database Passwords
API Secrets
JWT Secrets
Service Credentials
```

Do not print secrets into logs.

Do not return secrets through API responses.

Do not move Backend secrets into Frontend environment variables.

Correct architecture:

```text
Frontend
   ↓
Backend
   ↓
Secret
   ↓
Privileged operation
```

---

# 5. Database

The project uses PostgreSQL and Prisma.

Database configuration is controlled through environment variables such as:

```env
DATABASE_URL=
DIRECT_URL=
```

Before changing database logic:

1. Inspect the Prisma schema.
2. Find the existing model.
3. Check relations.
4. Check indexes and constraints.
5. Check existing queries.
6. Check migrations/schema workflow.
7. Check how the model is used elsewhere.

Do not create a new database model when an existing model can represent the required data.

Do not duplicate the same data in multiple tables unless there is a clear architectural reason.

---

# 6. Prisma

The project uses Prisma for database access.

Common commands include:

```bash
npx prisma generate
```

and:

```bash
npx prisma db push
```

Before changing Prisma models, understan
