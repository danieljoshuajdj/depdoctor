# CLI Command Reference Guide

This document provides a comprehensive reference for all commands available in the `pkg-ct` command-line utility.

---

## Command Directory

1. [`scan`](#1-scan)
2. [`health`](#2-health)
3. [`analyze`](#3-analyze)
4. [`doctor`](#4-doctor)
5. [`roast`](#5-roast)
6. [`missing`](#6-missing)
7. [`explain`](#7-explain)
8. [`blast`](#8-blast)
9. [`risk`](#9-risk)
10. [`upgrade`](#10-upgrade)
11. [`security`](#11-security)
12. [`production`](#12-production)
13. [`timeline`](#13-timeline)
14. [`workspace`](#14-workspace)
15. [`ci`](#15-ci)

---

### 1. `scan`
* **What it does:** Provides a rapid inventory of your dependency tree.
* **When to use it:** As a pre-commit hook or quick developer healthcheck to see numbers of packages, duplicates, and warnings.
* **Sample Output:**
  ```text
  pkg-ct scan
  Packages: 110
  Duplicate package families: 0
  Deprecated packages: 0
  Peer dependency issues: 0
  Install script packages: 2
  Native build risks: 1
  Lockfile: npm
  Scanned in 88ms
  ```
* **How to understand the output:** Focus on duplicates and peer conflicts. If these numbers are above zero, run `pkg-ct doctor` for a detailed diagnostic.
* **Common Mistakes:** Running it without installing dependencies first. `pkg-ct` reads the actual installed tree, not just the `package.json` file.
* **Real-world Example:** Checking a pull request branch to ensure the developer did not introduce new duplicate package versions.

---

### 2. `health`
* **What it does:** Calculates your project's overall Health Score and prints a category breakdown.
* **When to use it:** In CI pipelines or dashboards to track dependency health grades.
* **Sample Output:**
  ```text
  pkg-ct health
  [B] Project Health Score: 85/100 (B)
  Analyzed 245 packages in 320ms

  Score Breakdown
  ██████████  hygiene              100/100  No unused or legacy dependencies detected.
  ██████████  security             100/100  No active vulnerabilities.
  ██████████  freshness            100/100  All direct dependencies are up to date.
  ████████░░  duplication           80/100  3 duplicate package families.
  ███████░░░  compatibility         70/100  2 peer dependency conflicts.
  ```
* **How to understand the output:** The breakdown bars show which metrics are lowering your overall score.
* **Common Mistakes:** Thinking a low score means your code is broken. It means your dependency hygiene needs maintenance.
* **Real-world Example:** Enforcing a quality gate where branches must score at least 80/100 to merge.

---

### 3. `analyze`
* **What it does:** Computes the full dependency intelligence graph and prints details on top findings, breakdowns, and plans.
* **When to use it:** When you want a complete, single-screen summary of all findings without monorepo or security-specific extensions.
* **Sample Output:**
  ```text
  pkg-ct analyze
  [B] Project Health Score: 78/100 (B)
  
  Top Findings
  MEDIUM   Multiple major versions of lodash installed
  HIGH     eslint-plugin-react expects peer eslint@^8 but found eslint@9.1.0
  
  Health Breakdown
  ...
  Remediation Plan
  -> Deduplicate lodash (impact:MEDIUM difficulty:easy)
     $ npm dedupe
  ```
* **How to understand the output:** Review the "Top Findings" section first. Resolving these items will yield the largest score improvements.
* **Common Mistakes:** Reviewing transitive warnings that have very low severity.
* **Real-world Example:** Doing a bi-weekly codebase audit.

---

### 4. `doctor`
* **What it does:** The flagship senior-architect report. Aggregates inventory, health breakdowns, prioritized actions, root causes, AI fix plans, and release readiness.
* **When to use it:** The primary command for auditing any codebase. Recommended before major releases.
* **Sample Output:**
  ```text
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    PKG-CT DEPENDENCY DOCTOR
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [B] Health Score: 79/100 Grade: B
  
  INVENTORY
  ──────────────────────────────────────────────────
    Packages:           481
    Duplicate families: 3
  
  🏆 TOP ACTIONS
  ──────────────────────────────────────────────────
    [1] Multiple major versions of chalk installed
        Impact: HIGH  Effort: MEDIUM
        → Align version ranges in package.json
  
  🛠 AI FIX PLAN
  ──────────────────────────────────────────────────
    Step 1: Deduplicate packages
      $ npm dedupe
      Expected gain: +12 pts  ████████░░ 80%
  ```
* **How to understand the output:** Follow the "AI FIX PLAN" steps in order. They represent the optimal path to a healthy repository.
* **Common Mistakes:** Ignoring the "Release Readiness" section. A project can have a B grade but still be blocked due to critical peer conflicts.
* **Real-world Example:** Preparing an enterprise app for a production release.

---

### 5. `roast`
* **What it does:** Generates a humorous, light-hearted but technically accurate roast of your dependencies.
* **When to use it:** Sharing with your team, posting on social media, or injecting some fun into code audits.
* **Sample Output:**
  ```text
  Dependency Roast
  Your node_modules folder is so heavy it has its own gravitational pull (481 packages).
  3 duplicate families. A classic case of version hoarding.
  1 deprecated package. Running vintage code, are we?
  Health score: 79/100. Average, like your tests.
  ```
* **How to understand the output:** Read the jokes, but notice the underlying numbers—they highlight actual issues in your repository.
* **Common Mistakes:** Getting offended. The roast is based on real findings!
* **Real-world Example:** Sharing a screenshot in Slack to nudge developers to deduplicate packages.

---

### 6. `missing`
* **What it does:** Scans your source files to find packages you import in code but forgot to declare in your `package.json`.
* **When to use it:** When your code runs fine locally but crashes in production or CI with "Cannot find module".
* **Sample Output:**
  ```text
  Missing Dependencies
  Scanned 84 source files
  
  [HIGH] lodash
    Referenced in:
      - src/utils/format.ts
      - src/components/Table.tsx
  ```
* **How to understand the output:** Any package listed here must be added to your `package.json`.
* **Common Mistakes:** Assuming because it works locally, nothing is missing. Your local environment might have it globally installed or left over in `node_modules` from an old branch.
* **Real-world Example:** Fixing build crashes on Vercel/Netlify.

---

### 7. `explain`
* **What it does:** Tells you why a package was installed, who brought it in, its AST usage footprint, and what happens if you delete it.
* **When to use it:** When you see a weird package in your tree and want to know: *"Why is this here?"*
* **Sample Output:**
  ```text
  lodash
  Role:                 TRANSITIVE
  Why it exists:
    Referenced by 3 dependents.
  Dependency chain:
    my-app → express → body-parser → lodash
  Safe removal prob.:   2%
  
  🧠 AI Summary
    lodash is a utility library imported by 2 internal files and required by express.
    Impact: Removing lodash will break request parsing and routing.
    Risk: EXTREME
  ```
* **How to understand the output:** Look at the "Dependency chain". It traces the exact line of ancestry from your root app to the package.
* **Common Mistakes:** Trying to delete a transitive package from `package.json` directly. You must fix the parent package that introduced it.
* **Real-world Example:** Auditing a large security vulnerability in a deep transitive dependency.

---

### 8. `blast`
* **What it does:** Calculates the blast radius of a package—meaning, how many files and other packages will break if this package is modified or removed.
* **When to use it:** Before refactoring, removing, or making major updates to a package.
* **Sample Output:**
  ```text
  Dependency Blast Radius: rimraf
  Risk Level: MEDIUM
  
  Direct dependents (2):
    - ts-node
    - rimraf-cli
  
  Transitive dependents (12):
    - @types/node
    ...
  ```
* **How to understand the output:** A high blast radius count means you must be extremely careful when upgrading this package.
* **Common Mistakes:** Assuming a small package always has a low blast radius. Simple helper utilities often have the largest blast radii.
* **Real-world Example:** Determining the risk of upgrading a helper like `tslib` or `uuid`.

---

### 9. `risk`
* **What it does:** Evaluates peer dependency, lockfile, and engine conflicts *before* you run `npm install`.
* **When to use it:** When checking if a package is safe to add to your project.
* **Sample Output:**
  ```text
  UPGRADE RISK: HIGH  →  vite@latest
  
  POTENTIAL CONFLICTS
    [CONFLICT] vite
      Reason:    Peer dependency mismatch
      Peer:      react@^18
      Current:   react@19.0.0
      Expected:  ^18
      Confidence: 87%
      Chain:     my-app → vite
  ```
* **How to understand the output:** Check the "POTENTIAL CONFLICTS" section to see if the new package fits into your existing ecosystem.
* **Common Mistakes:** Running the command with a package that has no version specified, when you specifically wanted to test a beta/next version.
* **Real-world Example:** Verifying if a new component library is compatible with your React 19 app before installing it.

---

### 10. `upgrade`
* **What it does:** Predicts compile and runtime breakages if you bump a package to a specific version.
* **When to use it:** When planning dependency update cycles.
* **Sample Output:**
  ```text
  Upgrade Risk Advisor
  Package:  typescript
  Current:  4.9.5
  Target:   5.4.2
  Risk:     MEDIUM
  
  Reasons:
    - 2 direct dependents use strict compilation rules
    - Potential type mismatches in src/types/index.ts
  ```
* **How to understand the output:** Pay attention to the "Reasons" and "Potentially affected" lists. They point to the files most likely to experience type compiler errors.
* **Common Mistakes:** Upgrading multiple major versions without checking intermediate release changelogs.
* **Real-world Example:** Planning a TypeScript version bump across a large engineering team.

---

### 11. `security`
* **What it does:** Performs a deep security audit, classifying vulnerabilities by production reachability and identifying inactive or abandoned maintainer packages.
* **When to use it:** For security reviews and compliance reporting.
* **Sample Output:**
  ```text
  PKG-CT SECURITY REPORT
  
  VULNERABILITIES
    [HIGH] target-package
      Prototype Pollution in sub-dep
      Production Relevance: Production Critical
      Priority: HIGH
  
  ABANDONMENT RISK
    [RISK] old-json-parser (no release in 6 years, 1 maintainer)
  ```
* **How to understand the output:** Focus on "Production Critical" vulnerabilities. You can defer fixing "Development Only" issues if they are blocked by complex upgrade constraints.
* **Common Mistakes:** Treating all vulnerabilities as equally dangerous. A prototype pollution in a test framework runner is far less dangerous than one in your production web server.
* **Real-world Example:** Performing security triage for a SOC2 audit compliance check.

---

### 12. `production`
* **What it does:** Classifies all installed packages into production critical, build-only, dev-only, and unknown roles.
* **When to use it:** When auditing your production bundle size and server deployment footprints.
* **Sample Output:**
  ```text
  Package Production Relevance
  
  Production critical (12):
    - express@4.18.2 (role: CORE_RUNTIME)
    - pg@8.11.3 (role: CORE_RUNTIME)
  
  Build only (4):
    - vite@5.1.4 (role: BUILD_TOOL)
  ```
* **How to understand the output:** Production critical packages are shipped to your users or run on your servers. Keep this list as small and clean as possible.
* **Common Mistakes:** Finding build tools in the production critical section due to incorrect placements in `package.json` dependencies vs devDependencies.
* **Real-world Example:** Auditing Docker container image footprints.

---

### 13. `timeline`
* **What it does:** Evaluates package age and technical lag over the lifespan of your project.
* **When to use it:** To assess technical debt and plan refactoring roadmaps.
* **Sample Output:**
  ```text
  Dependency Health Timeline
  Average dependency age: 840 days (2.3 years)
  Technical lag score:    140 (HIGH LAG)
  Major versions behind:  14
  ```
* **How to understand the output:** A high technical lag score means your codebase is drifting far behind the active open-source ecosystem.
* **Common Mistakes:** Trying to fix all lag in one PR. This will cause massive merge conflicts and bugs.
* **Real-world Example:** Justifying a tech debt budget allocation to management.

---

### 14. `workspace`
* **What it does:** Audits monorepo workspaces to detect version drift—when different packages in the same repository use different version ranges of the same dependency.
* **When to use it:** In pnpm, Yarn, or npm monorepos.
* **Sample Output:**
  ```text
  PKG-CT WORKSPACE INTELLIGENCE
  
  VERSION DRIFT  (2 packages)
    [MEDIUM] chalk
      ^4.1.2            →  apps/web, packages/ui
      ^5.0.0            →  apps/server
  ```
* **How to understand the output:** Aligns version ranges to prevent multiple versions of the same package from being bundled into your monorepo outputs.
* **Common Mistakes:** Manually changing ranges instead of using workspace configuration commands.
* **Real-world Example:** Tidying up a Turborepo codebase.

---

### 15. `ci`
* **What it does:** Evaluates quality gates and emits machine-readable logs and status reports.
* **When to use it:** In GitHub Actions, GitLab CI, or Jenkins.
* **Sample Output:**
  ```text
  pkg-ct CI Quality Gates
  Status:     FAIL
  Score:      55/100 (min: 70) FAIL
  Severity:   fail-on=high VIOLATIONS FOUND
  ```
* **How to understand the output:** Returns an exit code of `0` on success and non-zero on failure, causing the CI pipeline to pass or fail.
* **Common Mistakes:** Setting the `min-score` threshold too high on day one, which blocks developer workflows. Start low and raise it gradually.
* **Real-world Example:** Preventing insecure code from being merged into your `main` branch.
