# Dependency Management & CI Policy

How automated dependency updates and the related CI workflows are configured in
this repository, and the few manual procedures you need when something drifts
out of sync.

## Automated updates (Dependabot)

`.github/dependabot.yml` manages five ecosystems on a weekly (Monday) schedule:
NuGet, npm (`/client` and `/micro-frontends`), Docker, and GitHub Actions.

- **Grouping** — non-major bumps are batched into a single `minor-and-patch` PR
  per ecosystem (Docker and GitHub Actions each group into one PR) to cut review
  noise instead of opening one PR per package.
- **Auto-merge** — `.github/workflows/dependabot-auto-merge.yml` auto-approves and
  enables auto-merge for **patch/minor** Dependabot PRs. **Major** bumps are left
  for manual review.

## Nx is upgraded manually, not by Dependabot

Dependabot **ignores** `nx`, `@nx/*`, and `@nrwl/*` (see the `ignore:` block in
`dependabot.yml`).

Nx must be upgraded as a **coordinated set** — `nx` core and every `@nx/*` plugin
have to move together. Piecemeal bumps (e.g. a single `@nx/*` patch inside an
already-declared `^22` range) leave the toolchain split across versions and
generate a `micro-frontends/package-lock.json` that `npm ci` rejects with errors
like `Missing @nx/jest@<v> from lock file`, which breaks the `frontend-quality`
CI job. This happened repeatedly before nx was pinned out of Dependabot.

To upgrade Nx, run the official migration instead:

```bash
cd micro-frontends
npx nx migrate latest
npx nx migrate --run-migrations
```

Then commit the regenerated `package.json` + `package-lock.json` together.

## Regenerating the micro-frontends lockfile

CI runs `npm ci` in `micro-frontends/` under **Node 20.x / npm 10.x**. If the
lockfile ever falls out of sync with `package.json`, regenerate it with the same
npm major CI uses (a newer npm can produce a lock that npm 10's `npm ci`
rejects):

```bash
cd micro-frontends
npx -y npm@10 install --package-lock-only --no-audit --no-fund
# verify it is in sync the way CI will see it:
npx -y npm@10 ci --dry-run
```

Commit only `package-lock.json`. Verify locally with
`npx nx run-many --target=lint,test,build --all` before pushing.

## Performance tests are on-demand

`.github/workflows/performance-test.yml` (K6) runs via **`workflow_dispatch`
only** — there is no schedule. The full-stack smoke test needs an environment
this workflow does not yet provision (the `MONGODB_URL` / `REDIS_URL` /
`SQLSERVER_URL` connection-string env vars, a SQL Server container for the
Ordering service, and the Discount service running). Re-add the weekly cron once
that wiring exists; until then a scheduled run would only fail.

Run it manually from the **Actions** tab → *Performance Testing (K6)* → *Run
workflow*, choosing a `test_type` (`smoke`, `stress`, `spike`, or `soak`).
