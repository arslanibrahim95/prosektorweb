# Dependency Diet Plan 📦

**Goal:** Reduce attack surface, improve install speed, and enforce hygiene.

## 1. Inventory
- **Current Manager:** npm
- **Direct Dependencies:** ~57
- **Heaviest Packages:**
  1. `@sentry/nextjs` (Observability)
  2. `@prisma/client` + Engines (Database)
  3. `next` (Framework)
  4. `lucide-react` (Icons)
  5. `framer-motion` (Animations)

## 2. Risk & Hygiene Audit
| Dependency | Status | Found Usage? | Verdict |
| :--- | :--- | :--- | :--- |
| `gsap` | ⚠️ Duplicate Cap | **No** (Redundant with Framer Motion) | **REMOVE** |
| `dotenv` | ℹ️ Script Utils | **Yes** (`scripts/`, `prisma/seed.ts`) | **KEEP** |
| `pino-pretty` | ⚠️ Dev Dep in Prod | **Yes** (Logging) | **MOVE to devDeps** |
| `ogl` | ✅ Visuals | **Yes** (`Particles.tsx`) | **KEEP** |

## 3. Cut Plan
Run these commands to trim the fat:

```bash
# 1. Remove unused animation library
npm uninstall gsap

# 2. Move pretty printer to dev (Prod should log JSON)
npm install -D pino-pretty
```

## 4. pnpm Migration (The Upgrade)
Switching to `pnpm` will save disk space and enforce stricter boundaries (preventing phantom dependencies).

**Migration Steps:**
1.  **Enable Corepack:**
    ```bash
    corepack enable
    ```
2.  **Update `package.json`:**
    ```json
    {
      "packageManager": "pnpm@9.x"
    }
    ```
3.  **Import Lockfile:**
    ```bash
    pnpm import # Converts package-lock.json to pnpm-lock.yaml
    ```
4.  **Install & Prune:**
    ```bash
    rm -rf node_modules package-lock.json
    pnpm install
    ```
5.  **Fix CI:** Update GitHub Actions / Vercel settings to use `pnpm`.

## 5. Enforcement (Guardrails)
Add these scripts to `package.json`:

```json
"scripts": {
  "deps:audit": "npm audit",
  "deps:clean": "rm -rf node_modules .next",
  "deps:check": "npx depcheck" 
}
```

*Note: `depcheck` requires installing it globally or via npx.*
