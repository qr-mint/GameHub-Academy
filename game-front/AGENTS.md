# Frontend — AGENTS.md

## Purpose

This project contains the Frontend of a game platform.

The Frontend is responsible for:

* user interface;
* React components;
* Phaser game scenes;
* player interaction with the game;
* communication with the Backend;
* displaying data received from the Backend;
* wallet connection;
* displaying blockchain state;
* Telegram Mini App integration;
* client-side application state.

**Important:** the Frontend is an untrusted environment.

Any data coming from the user or existing only on the Frontend must not be considered trusted or final.

Critical business rules, financial operations, transaction verification, and other trusted operations must be handled by the Backend or Blockchain.

---

# 1. Architecture

The main architecture is:

```text
Player
  ↓
React / Frontend
  ↓
Game / Phaser
  ↓
Backend API
  ↓
QR Mint / Blockchain
```

The Frontend must not become the source of truth for financial or security-critical data.

For example:

```text
Frontend says:
"The player paid 10 TON."
```

This is **not proof of payment**.

The Backend must independently verify the transaction using a trusted source.

Similarly:

```text
Frontend says:
"The player finished 1st."
```

This must not automatically mean that the Backend should issue a reward.

---

# 2. Main Rule for AI Agents

Before modifying code, first understand the existing architecture.

**Do not create a new system if the project already contains a suitable system.**

Before implementing a new feature:

1. Find existing similar functionality.
2. Find the corresponding API.
3. Find the existing state/store.
4. Find existing React components.
5. Find existing hooks/providers.
6. Check how similar functionality is already implemented.
7. Only then modify the code.

Do not create:

* a new API client if `src/api/` already provides one;
* a new state manager if `src/store/` already exists;
* a new wallet provider if an existing provider is available;
* a new game system if the required functionality already exists in `src/game/`;
* duplicate helper functions if an existing implementation can be reused.

---

# 3. Project Structure

The main source code is located in:

```text
src/
```

Structure:

```text
src/
├── api/
├── audio/
├── components/
├── game/
├── helpers/
├── hooks/
├── pages/
├── providers/
├── store/
└── utils/
```

The project may also contain:

```text
nginx/
public/
scripts/
```

---

# 4. `src/api/`

## Purpose

Contains methods used by the Frontend to communicate with the Backend.

Main flow:

```text
React / Phaser
      ↓
src/api/
      ↓
Backend API
```

If you need to send or receive data from the Backend, first inspect the existing methods in `src/api/`.

Do not create direct `fetch` or HTTP requests inside random components if an API layer already exists for that functionality.

### Important

The API layer is responsible for communication.

It must not replace Backend business logic.

For example, if the Backend returns:

```text
balance
```

the Frontend should display the received value.

Do not independently calculate financial balances on the Frontend if the Backend is the source of truth.

---

# 5. `src/audio/`

Contains game music and sound functionality.

Before adding a new audio system, inspect existing:

* audio helpers;
* music managers;
* sound managers;
* manifests/configuration;
* hooks.

Do not create a second independent audio manager without a clear reason.

---

# 6. `src/components/`

Contains React UI components.

Examples:

* buttons;
* modals;
* menus;
* panels;
* cards;
* navigation;
* forms;
* UI elements.

Before creating a new component:

1. Find similar existing components.
2. Check whether an existing component can be reused.
3. Check existing UI patterns.
4. Follow the current project structure.

Do not create multiple components with the same responsibility.

---

# 7. `src/game/`

Contains the game portion of the Frontend.

This is where Phaser and gameplay logic are located.

It may include:

* Player;
* enemies;
* obstacles;
* levels;
* collisions;
* controls;
* joystick;
* checkpoints;
* game scenes;
* gameplay mechanics;
* level loading;
* game state;
* game-specific systems.

Main principle:

```text
React
  ↓
Game UI / configuration
  ↓
Phaser
  ↓
Gameplay
```

Do not move gameplay logic into React simply because React is already used by the project.

React is primarily responsible for application UI.

Phaser is responsible for the game environment and gameplay.

---

# 8. `src/helpers/`

Contains helper functions used across different parts of the project.

Before creating a new helper:

1. Search for an existing function with similar responsibility.
2. Check `helpers/`.
3. Check `utils/`.
4. Check local functions in the relevant module.

Do not create duplicate functions with the same logic.

---

# 9. `src/hooks/`

Contains custom React Hooks.

Hooks are used for reusable React logic.

For example:

```text
useWallet()
usePlayer()
useTournament()
useGame()
```

If similar logic already exists in a hook, reuse it.

Do not duplicate the same logic across:

```text
component
hook
helper
```

without a clear reason.

---

# 10. `src/pages/`

Contains application pages.

Examples:

```text
Home
Profile
Game
Achievements
Leaderboard
Tournament
```

Pages should primarily connect the required components and data.

Avoid putting large amounts of independent business logic directly inside page components when the logic can be placed in existing hooks, services, or appropriate layers.

---

# 11. `src/providers/`

Contains global React Providers and Contexts.

They may be responsible for:

* wallet;
* authentication;
* Telegram;
* blockchain;
* application configuration;
* global services.

Before creating a new Provider, inspect existing Providers.

Do not create a second Provider for the same responsibility.

---

# 12. `src/store/`

Contains global application state.

The store may contain:

* player data;
* wallet state;
* game state;
* settings;
* tournament state;
* application state;
* other data shared between multiple parts of the application.

Do not put everything into the global store.

If state is only required by one component or a small local area, first determine whether global state is actually necessary.

---

# 13. `src/utils/`

Contains additional reusable utility functions.

Before creating a new utility function, check:

```text
src/helpers/
src/utils/
```

Do not create duplicate implementations.

---

# 14. Environment Variables

The Frontend uses environment variables with the:

```text
VITE_
```

prefix.

For example:

```env
VITE_API_URL=
VITE_CONNECT_URL=
VITE_BLOCK_ID=
VITE_PUBLIC_KEY=
VITE_BOT_USERNAME=
VITE_NETWORK=testnet
VITE_PROJECT_ID=
```

## Critical Security Rule

All `VITE_*` variables should be considered potentially exposed to the client.

Therefore:

**Never put secrets inside `VITE_*` variables.**

For example, real:

```env
BOT_TOKEN
PRIVATE_KEY
SECRET_KEY
DATABASE_PASSWORD
API_SECRET
```

must never be exposed to Frontend code.

In particular, do not use:

```env
VITE_BOT_TOKEN=
```

for a real Telegram Bot Token.

If an operation requires a secret or privileged credential, it must be performed by the Backend.

Correct architecture:

```text
Frontend
   ↓
Backend
   ↓
Secret / privileged operation
```

Not:

```text
Frontend
   ↓
Secret
```

---

# 15. `.env.example`

When adding or changing required environment variables:

1. Update `.env.example`.
2. Never add real secrets.
3. Document the purpose of the variable clearly.
4. Verify that the variable is actually required by Frontend code.

Example:

```env
VITE_API_URL=
VITE_CONNECT_URL=
VITE_BLOCK_ID=
VITE_PUBLIC_KEY=
VITE_BOT_USERNAME=
VITE_NETWORK=testnet
VITE_PROJECT_ID=
```

---

# 16. Wallet

The Frontend may be responsible for:

* connecting a wallet;
* displaying the wallet address;
* requesting signatures;
* initiating user transactions;
* displaying transaction status.

However, the Frontend is not a trusted environment.

For example:

```text
Wallet connected
```

does not automatically mean:

```text
User owns the required asset
```

If ownership is important for a business operation, the Backend or Blockchain must verify it independently.

---

# 17. Blockchain

When working with blockchain functionality, first inspect existing:

* wallet providers;
* transaction helpers;
* network configuration;
* contract integrations;
* API methods;
* transaction status handling.

Do not create a new blockchain abstraction if the project already contains a suitable layer.

When modifying blockchain flows, handle all relevant states:

```text
idle
↓
pending
↓
success
```

as well as:

```text
failed
rejected
wrong network
insufficient balance
timeout
already processed
```

Do not assume that a transaction succeeded simply because the user clicked a button.

---

# 18. Backend Is the Trusted Source

The Frontend may display:

```text
balance
NFT ownership
tournament status
reward
transaction status
leaderboard
```

but Frontend data must not automatically be considered trusted.

Be especially careful with:

* wallet addresses;
* balances;
* token amounts;
* payment status;
* tournament results;
* rewards;
* ownership;
* authorization;
* user identity.

---

# 19. Game Results

The game client can be modified by the user.

Therefore:

```text
Game Client
```

is not a trusted source for financial results.

If a game result is used for:

* tournaments;
* rewards;
* NFTs;
* tokens;
* payouts;
* leaderboards;
* prize pools;

first determine where and how the result is verified.

Before changing such logic, inspect the Backend and the relevant documentation.

---

# 20. Modifying Existing Functionality

Before modifying a feature:

```text
1. Find the entry point.
2. Find related components.
3. Find the API.
4. Find the state.
5. Find Backend dependencies.
6. Find blockchain dependencies.
7. Check existing tests.
8. Only then modify the code.
```

After modifying the code, check:

```text
TypeScript
Lint
Build
Tests
```

when the corresponding commands are available.

---

# 21. When the Task Is Unclear

Do not invent an architecture.

First inspect:

```text
README
AGENTS.md
docs/
package.json
src/
```

Then find existing similar code.

If several architectural approaches remain possible, explain the alternatives internally and choose the one that best matches the existing architecture.

Do not rewrite a system simply because another approach appears cleaner.

---

# 22. Do Not Remove Existing Systems Without a Reason

Before removing:

* a component;
* a hook;
* an API method;
* a store;
* a provider;
* a helper;
* a game system;

search for its usages.

Use project-wide search.

Do not assume that something is unused simply because its usage is not immediately obvious.

---

# 23. Prefer Minimal Changes

Prefer the smallest change that solves the requested problem.

Do not:

```text
modify 20 files
rewrite the architecture
replace a library
create a new abstraction
```

if the task can be solved by modifying:

```text
1–3 existing components
```

Minimal changes reduce the risk of breaking existing functionality.

---

# 24. Do Not Duplicate Architecture

If the project already contains:

```text
API layer
State management
Wallet provider
Game manager
Authentication
NFT service
Tournament system
```

use the existing systems.

Do not create:

```text
NewApiService
NewWalletManager
NewTournamentManager
NewNFTService
```

just because it is convenient for a specific task.

First understand the existing architecture.

---

# 25. Financial Functionality

Be especially careful with functionality related to:

* payments;
* balances;
* tokens;
* NFTs;
* tournament entry fees;
* rewards;
* withdrawals;
* deposits;
* blockchain transactions.

Before modifying such functionality, understand the complete flow:

```text
Frontend
    ↓
Backend
    ↓
Blockchain
```

Identify where the source of truth is and where the actual verification happens.

Never implement financial logic based only on user-provided data.

---

# 26. Before Every Task

Before starting work, determine:

```text
1. What does the user want to achieve?
2. Where is the relevant functionality currently implemented?
3. What is the data flow?
4. What is the source of truth?
5. Which existing systems should be reused?
6. Does Frontend need to change?
7. Does Backend need to change?
8. Does Blockchain need to change?
9. What errors can occur?
10. What existing functionality could be affected?
```

Only then begin implementation.

---

# 27. After Making Changes

After implementation:

1. Review the changed code.
2. Review related code paths.
3. Run TypeScript checks.
4. Run lint/build/tests when available.
5. Check error states.
6. Check loading states.
7. Check blockchain transaction states when affected.
8. Verify that the existing architecture has not been violated.

If tests are unavailable, do not claim that the functionality has been fully tested.

---

# 28. Core Principles

This project already has an architecture.

Your job as an AI agent is to **understand the existing system first and modify it second**.

Do not start by writing code.

Start by investigating:

```text
Understand
   ↓
Locate
   ↓
Reuse
   ↓
Modify
   ↓
Test
```

The most important rule:

> **Do not create a new architecture until you have established that the existing architecture cannot be reused.**

Second:

> **The Frontend is a client. It is convenient for the user, but it is not a trusted environment.**

Third:

> **If a change involves money, ownership, rewards, authentication, or blockchain, understand the complete flow before modifying the Frontend code.**
