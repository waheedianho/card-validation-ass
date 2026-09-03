# Card Validation API

A NestJS REST API that validates payment card numbers using the **Luhn algorithm**, detects the **card network** (Visa, Mastercard, Amex, etc.), and returns a masked card number. Built with TypeScript, Vitest, and Swagger.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Project Architecture](#project-architecture)
- [Design Decisions](#design-decisions)

---

## Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 20 |
| pnpm | ≥ 9 |
| PostgreSQL | ≥ 14 (required by the infra layer, though not used by the validation endpoint itself) |

### Installation

```bash
pnpm install
```

---

## Environment Variables

Copy the `.env` file (already present in the repo) and adjust the values for your environment. The critical variables are:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | HTTP port the API listens on |
| `NODE_ENV` | `local` | Environment name (`local`, `development`, `production`) |
| `HOST` | `http://localhost:5000` | Public base URL |
| `POSTGRES_HOST` | `localhost` | PostgreSQL host |
| `POSTGRES_PORT` | `5433` | PostgreSQL port |
| `POSTGRES_USER` | `card-validation` | PostgreSQL user |
| `POSTGRES_PASSWORD` | `0987654321` | PostgreSQL password |
| `POSTGRES_DATABASE` | `card-validation` | PostgreSQL database name |
| `TZ` | `America/Sao_Paulo` | Process timezone |

> **Note:** The card validation endpoint itself is stateless and does not require a database connection to function. The PostgreSQL config is wired up for future persistence needs.

---

## Running the Project

### Development (watch mode)

```bash
pnpm start:dev
```

The server will start on `http://localhost:5000` by default, and reload automatically on file changes.

### Production

```bash
pnpm build
pnpm start:prod
```

### Debug mode

```bash
pnpm start:debug
```

---

## API Reference

### Swagger UI

When running in a non-production environment (`NODE_ENV` ≠ `production`), interactive Swagger docs are available at:

```
http://localhost:5000/api
```

---

### `POST /card` — Validate a card number

Validates the supplied card number and returns network information and a masked version.

**Request body**

```json
{
  "cardNo": "4532015112830366"
}
```

The `cardNo` field accepts digits, spaces, and dashes (e.g. `4532-0151-1283-0366` or `4532 0151 1283 0366`).

**Validation rules applied (in order)**

1. Must not be empty
2. Must be a string
3. Must contain only digits, spaces, or dashes
4. Must be between 13 and 23 characters long (including separators)
5. Must pass the **Luhn algorithm** check

**Success response — `200 OK`**

```json
{
  "status": 200,
  "message": "Card is valid",
  "data": {
    "cardNo": "4532015112830366",
    "isValid": true,
    "network": "Visa",
    "isValidLength": true,
    "maskedCardNo": "**** **** **** 0366"
  }
}
```

**Response fields**

| Field | Type | Description |
|-------|------|-------------|
| `cardNo` | `string` | The original (unsanitized) card number as supplied |
| `isValid` | `boolean` | Always `true` when the endpoint returns 200 (validation happens in the pipe) |
| `network` | `string` | Detected card network (see supported networks below) |
| `isValidLength` | `boolean` | Whether the digit count matches the network's specification |
| `maskedCardNo` | `string` | Card number with all but the last 4 digits replaced by `****` groups |

**Supported card networks**

| Network | Prefix | Length(s) |
|---------|--------|-----------|
| Visa | `4` | 13, 16, 19 |
| Mastercard | `51–55`, `2221–2720` | 16 |
| American Express | `34`, `37` | 15 |
| Discover | `6011`, `65xx`, `644–649`, `622126–622925` | 16, 19 |
| JCB | `3528–3589` | 16 |
| Diners Club | `300–305`, `36`, `38` | 14 |
| UnionPay | `62` | 16–19 |
| Maestro | `6304`, `6759`, `6761–6763` | 12–19 |
| Unknown | — | — |

**Error response — `422 Unprocessable Entity`** (validation failure)

```json
{
  "status": 422,
  "message": "cardNo must be a valid card number (Luhn check failed)"
}
```

---

## Testing

All tests are written with **Vitest** and the NestJS testing utilities.

### Run all unit tests

```bash
pnpm test
```

### Run in watch mode

```bash
pnpm test:watch
```

### Generate coverage report

```bash
pnpm test:cov
```

### Run end-to-end tests

```bash
pnpm test:e2e
```

### Test files

| File | What it covers |
|------|----------------|
| `src/application/card/service.spec.ts` | `IsLuhnValidConstraint`, `detectCardNetwork`, `CardService` |
| `src/api/card/endpoint.spec.ts` | `CardEndpoint` (controller), mocked service |

---

## Project Architecture

The project follows a **layered architecture** inspired by Clean Architecture / DDD:

```
src/
├── api/                  # Controllers (HTTP interface)
│   └── card/
│       ├── endpoint.ts           # POST /card controller
│       └── endpoint.spec.ts      # Unit tests for the controller
│
├── application/          # Use-case / business logic layer
│   └── card/
│       ├── dto.ts                # CardDto — request validation via class-validator
│       ├── service.ts            # CardService — core validation logic
│       ├── service.spec.ts       # Unit tests for service + validators
│       └── validators/
│           ├── luhn.validator.ts         # Custom @IsLuhnValid() decorator
│           └── card-network.util.ts      # Network detection utility
│
├── domain/               # Domain entities (currently a placeholder module)
│
├── infra/                # Infrastructure (Postgres, secrets)
│   ├── postgres/
│   └── secret/
│
├── middlewares/          # Global NestJS middleware
│   ├── exception-filter.ts       # Global error handler
│   ├── response-formatter.ts     # Wraps all responses in a standard envelope
│   └── validation-pipe.ts        # Runs class-validator on incoming DTOs
│
├── app.module.ts         # Root application module
└── main.ts               # Bootstrap — wires up Swagger, global middleware, and listens
```

---

## Design Decisions

### 1. Luhn algorithm as a custom `class-validator` decorator

Rather than running the Luhn check inside the service, validation is handled declaratively on the `CardDto` using a custom `@IsLuhnValid()` decorator. This keeps the service thin and ensures that invalid cards are rejected at the HTTP boundary before any business logic runs, consistent with how the other `class-validator` rules work.

### 2. Separator-tolerant input (`cardNo` accepts spaces and dashes)

Users commonly enter card numbers with spaces (`4532 0151 1283 0366`) or dashes. The `Matches` decorator allows these characters, and both the Luhn validator and `CardService` strip separators before processing — so the caller never needs to pre-format the number.

### 3. Length validation covers separator characters in the DTO

The `@Length(13, 23)` constraint is applied to the *raw* string (including spaces/dashes). The upper bound is 23 rather than 19 to accommodate a 19-digit card with 4 separator characters (`xxxx-xxxx-xxxx-xxxx-xxx` = 23 chars). The network-specific length check (`isValidLength`) in the service operates on the sanitized digit string.

### 4. `isValidLength` is informational, not a blocking error

The service always returns `isValid: true` when it reaches the service layer (the Luhn check in the DTO already blocked invalid numbers). `isValidLength` tells the caller whether the digit count matches the detected network's known lengths — useful for detecting unusual card variants — without breaking the response contract.

### 5. Response envelope via `ResponseFormatterMiddleware`

All responses are wrapped in a consistent `{ status, message, data }` envelope by the `ResponseFormatterMiddleware`, which attaches a `formatResponse` helper to the Express `Response` object. This avoids boilerplate in every controller.

### 6. Swagger only in non-production environments

The `DocumentBuilder` setup in `main.ts` is wrapped in an `if (!IS_PRODUCTION)` guard, so the API docs endpoint is never exposed in production. A `try/catch` around it ensures a Swagger bootstrap failure degrades gracefully with a warning log rather than crashing the server.

### 7. Vitest over Jest

Vitest was chosen as the test runner because it shares the same config file as Vite/esbuild and runs significantly faster than Jest for TypeScript projects. It is configured via `vitest.config.ts` with `vite-tsconfig-paths` so that TypeScript path aliases resolve correctly in tests without a separate build step.

### 8. `pnpm` as the package manager

`pnpm` is used for its strict dependency isolation and fast, disk-efficient installs. A `pnpm-workspace.yaml` is present for potential future monorepo expansion.
