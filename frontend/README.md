# Frontend

This folder contains the platform's two web applications. **New work goes into `web/`.**

| Folder | Status | Stack | What it is |
|---|---|---|---|
| [`web/`](web/) | ✅ Current | React 18, Nx, Webpack Module Federation, Ant Design | The storefront and admin dashboard, split into independently deployable micro-frontends |
| [`legacy-angular/`](legacy-angular/) | 🗄️ Deprecated | Angular | The original single-page app. Kept as a reference for the migration to micro-frontends; not actively developed |

## `web/`: micro-frontends

A host shell loads remote apps at runtime through Module Federation:

| App | Port | Responsibility |
|---|---|---|
| `host` | 4200 | Shell: routing, authentication, layout, loads the remotes |
| `store` | 4201 | Product browsing and search |
| `checkout` | 4202 | Cart and checkout |
| `account` | 4203 | User profile and order history |
| `admin` | 4204 | Product management, analytics, activity log |

Shared libraries live in `web/packages/` (`app-injector`, `auth-provider`, `shared-layout`).

```bash
cd frontend/web
npm ci
npx nx serve host   # starts the shell; remotes are served alongside it
```

All apps call the backend through the Ocelot API gateway (`src/ApiGateways/Ocelot.ApiGateway`, port 8010 by default). See [`web/README.md`](web/README.md) for details.

## `legacy-angular/`

```bash
cd frontend/legacy-angular
npm install
npm start           # http://localhost:4200
```
