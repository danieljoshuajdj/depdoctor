# Real-world Walkthrough Examples

This guide details example workflows of running `pkg-ct` in different project setups (React + Vite, Next.js, Node.js API, monorepo workspaces, and corporate offline environments).

---

## 1. Walkthrough 1: Small React + Vite App

### Scenario Setup
A frontend app using React 19, TailwindCSS, and ESLint.

### Execution
Run the diagnostic command:
```bash
npx @danijsrr/pkg-ct doctor
```

### Result Output
```text
[A] Health Score: 98/100 Grade: A
    124 packages · 1 findings

INVENTORY
  Packages: 124
  Duplicate families: 0
  Peer conflicts: 0

UNUSED DEPENDENCIES
  [!] eslint-config-prettier
    usage confidence: 90%
    safe removal probability: 95%
    Recommendation: Keep; eslint-config-prettier is a passive config package.
```

### Diagnosis
The project has excellent health (98/100). The single finding is a passive ESLint config package. Since it is loaded by ESLint (configuration evidence), `pkg-ct` correctly flags it with a high confidence score and recommends keeping it. No changes are required.

---

## 2. Walkthrough 2: Next.js Web App

### Scenario Setup
A production Next.js app with server-side components, PostgreSQL database driver, and TailwindCSS utility styling.

### Execution
Run doctor with package auditing:
```bash
npx @danijsrr/pkg-ct doctor --audit
```

### Result Output
```text
[C] Health Score: 68/100 Grade: C
    512 packages · 14 findings

🏆 TOP ACTIONS
  [1] Multiple major versions of semver installed (v6.3.1, v7.5.4)
      Impact: HIGH  Effort: LOW
      → Run npm dedupe
  [2] ip package has high-severity vulnerability
      Impact: CRITICAL  Effort: MEDIUM
      → Upgrade ip to >=2.0.1
```

### Diagnosis
1. Overlapping version bounds exist for `semver`. Run `npm dedupe` to align the dependency tree.
2. Upgrade `ip` or its parent library to patch the critical security vulnerability.
3. Re-run `doctor` to confirm the overall grade returns to `A`.

---

## 3. Walkthrough 3: Express Backend Node.js API

### Scenario Setup
A backend REST API server built using Express and Prisma.

### Execution
Run the security command:
```bash
npx @danijsrr/pkg-ct security
```

### Result Output
```text
VULNERABILITIES
  [CRITICAL] jsonwebtoken
    Production Relevance: Production Critical
    Priority: HIGH
  [LOW] mocha
    Production Relevance: Development Only
    Priority: LOW
```

### Diagnosis
Prioritize upgrading `jsonwebtoken` immediately because it is a `Production Critical` package used directly on the API auth paths. The `mocha` vulnerability is `Development Only`, meaning it can be safely deferred without exposing the running server to security risks.

---

## 4. Walkthrough 4: PNPM Monorepo Workspace

### Scenario Setup
A PNPM monorepo containing a web app, a mobile app, and a shared UI library packages folder.

### Execution
Run workspace alignment checks:
```bash
npx @danijsrr/pkg-ct workspace
```

### Result Output
```text
VERSION DRIFT (1 package)
  [MEDIUM] axios
    ^1.6.0 → apps/web
    ^1.7.2 → apps/mobile
```

### Diagnosis
Align `axios` dependency versions across monorepo packages by upgrading `apps/web/package.json` to require `^1.7.2`, eliminating duplicate package versions in the final bundles.

---

## 5. Walkthrough 5: Corporate Offline Environment

### Scenario Setup
A private corporate network environment without external internet access.

### Execution
Run the scan with offline flag to prevent network requests:
```bash
npx @danijsrr/pkg-ct doctor --offline
```

### Diagnosis
The tool skips calling external npm registries to query publish timestamps and deprecation notices, fallback-caching existing package-lock metadata to run structural graph audits locally and maintain network security compliance.
