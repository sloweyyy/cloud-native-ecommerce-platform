# CI/CD Workflow Configuration

This directory contains GitHub Actions workflows for the ecommerce-micro-frontend monorepo.

## 📁 Workflows

### `ci.yml` - Main CI Pipeline

**Purpose:** Runs lint, tests, and builds for affected projects on every push and PR.

**Features:**
- ✅ **Nx Cloud Integration** - Remote caching for faster builds
- ✅ **Affected Commands** - Only runs on changed projects
- ✅ **Affected Graph** - Visualizes project dependencies (requires `fetch-depth: 0`)
- ✅ **Parallel Execution** - Runs tasks concurrently
- ✅ **E2E Tests** - Separate job for Playwright tests

**Key Configuration:**
- `fetch-depth: 0` - Required for affected graph visualization
- `nrwl/nx-set-shas@v4` - Helps Nx Cloud understand commit ranges
- Dynamic base SHA - Works for both PRs and direct pushes

**Environment Variables:**
- `NX_CLOUD_ACCESS_TOKEN` - Required for Nx Cloud (set in GitHub Secrets)

## 🚀 Setup

### 1. Connect to Nx Cloud

```bash
cd ecommerce-micro-frontend
npx nx connect
```

### 2. Add GitHub Secret

1. Go to GitHub repository → Settings → Secrets → Actions
2. Add secret: `NX_CLOUD_ACCESS_TOKEN`
3. Value: Token from Nx Cloud dashboard

See `docs/NX_CLOUD_SETUP.md` for detailed instructions.

## 📊 What Gets Run

### On Every Push/PR:
- ✅ Lint affected projects
- ✅ Type check affected projects (if available)
- ✅ Test affected projects
- ✅ Build affected apps

### E2E Tests:
- ✅ Run Playwright tests (separate job)
- ✅ Requires all apps to be built first

## 🔍 Troubleshooting

### Issue: Affected graph not showing

**Solution:** Ensure `fetch-depth: 0` is set in checkout step (already configured ✅)

### Issue: Nx Cloud not working

**Solution:**
1. Verify `NX_CLOUD_ACCESS_TOKEN` is set in GitHub Secrets
2. Check token hasn't expired
3. Verify workspace is connected: `npx nx connect`

### Issue: Type check failing

**Solution:** The workflow handles missing typecheck target gracefully with `|| echo "No typecheck target found, skipping"`

## 📚 Related Documentation

- `docs/NX_CLOUD_SETUP.md` - Nx Cloud setup guide
- `README.md` - Project overview

