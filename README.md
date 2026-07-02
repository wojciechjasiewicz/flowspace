# Flowspace

An Nx monorepo with three independent product apps that share a login, built with React, Vite, Vitest, Ant Design, NestJS and `node:sqlite`.

## Apps

| App            | Kind          | Port | Purpose                                   |
| -------------- | ------------- | ---- | ------------------------------------------ |
| `app-store`    | React/Vite    | 4200 | Landing page / launcher linking to the other apps |
| `task-manager` | React/Vite    | 4201 | Jira-like task board                       |
| `communicator` | React/Vite    | 4202 | Team chat                                  |
| `api-users`    | NestJS        | 3300 | Users, roles and login (issues auth tokens) |
| `api-tasks`    | NestJS        | 3301 | Tasks CRUD                                 |
| `api-chat`     | NestJS        | 3302 | Channels and messages                      |

Each backend owns its own SQLite database file under `packages/<app>/data/` (gitignored, created automatically on first run).

## Shared packages

- `packages/shared/models` — shared TypeScript types (`User`, `Task`, `Message`, ...)
- `packages/shared/auth` — HMAC-signed token creation/verification (`AUTH_SECRET` env var) and a Nest `AuthGuard` used by all three backends to verify tokens issued by `api-users`
- `packages/shared/nest-utils` — a Zod-based Nest `ValidationPipe`

## Getting started

```sh
npm install
npx nx run-many -t serve -p api-users api-tasks api-chat   # backends on 3300/3301/3302
npx nx run-many -t serve -p app-store task-manager communicator   # frontends on 4200/4201/4202
```

`api-users` seeds two demo accounts on first run: `ada@example.com` / `grace@example.com`, password `password123`.

Set `AUTH_SECRET` to the same value for all three backends in any environment where they don't share a default (the default `dev-secret-change-me` is fine for local dev).

## Common tasks

```sh
npx nx run-many -t test        # unit tests (Vitest) across all projects
npx nx run-many -t typecheck   # TypeScript project references build
npx nx run-many -t build       # production builds
npx nx sync                    # fix up TS project references after adding imports
```

[More about running tasks in Nx »](https://nx.dev/docs/features/run-tasks)
