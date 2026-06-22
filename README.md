# 📦 PKG-CT: The Dependency Observability CLI & Maintenance Layer

[![npm version](https://img.shields.io/npm/v/@danijsrr/pkg-ct.svg)](https://www.npmjs.com/package/@danijsrr/pkg-ct)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**`pkg-ct` (Package City Inspector)** is a CLI-based dependency intelligence and self-healing maintenance layer for modern Node.js and TypeScript projects. It builds a realized dependency graph of your `node_modules` folder and code imports to diagnose technical debt, duplicate packages, missing imports, security issues, and upgrade risks.

---

## 🏛️ Why pkg-ct?

In the Node.js ecosystem, projects easily accumulate hundreds of direct and transitive dependencies. **`pkg-ct` acts as a City Inspector** for your codebase:

* **Hygiene Inspections:** Traces imports using an AST scanner to detect unused dependencies and flag phantom imports.
* **duplication Alignment:** Programmatically identifies duplicate package versions across your direct and transitive trees.
* **Security Relevance Triage:** Audits CVEs, separating production critical vulnerabilities from dev-only testing tool vulnerabilities to reduce alert fatigue.
* **Upgrade Risk Modeling:** Predicts compile-time and runtime compatibility issues *before* you run `npm install`.
* **Health Scoring:** Computes a weighted overall Health Score from `0` to `100` based on a logarithmic model so scores reflect actual developer impact.

---

## 📥 Installation

Install globally via `npm`:

```bash
npm install -g @danijsrr/pkg-ct
```

Or execute on the fly using `npx`:

```bash
npx @danijsrr/pkg-ct doctor
```

---

## 🗺️ Quick Start

### 1. Project Inventory Scan
To get a rapid overview of your installed tree, run:
```bash
pkg-ct scan
```

*Expected Output:*
```text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PKG-CT Scan Output
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Packages: 245
Duplicate package families: 3
Deprecated packages: 1
Peer dependency issues: 2
Install script packages: 4
Native build risks: 0
Lockfile: npm (package-lock.json)
Scanned in 142ms
```

### 2. Dependency Doctor Audit
To run the full diagnostics suite, calculate your Health Score, and generate a self-healing fix plan:
```bash
pkg-ct doctor
```

---

## 📖 CLI Command Reference

`pkg-ct` exposes 15 dedicated commands to audit, explain, and maintain dependencies.

| Command | Description | Link |
| :--- | :--- | :--- |
| `scan` | Quick inventory scan of nodes, duplicates, and lockfile | [commands.md](file:///d:/Worked%20Project/NPM%20projet/docs/commands.md#1-scan) |
| `health` | Calculates health score and category breakdowns | [commands.md](file:///d:/Worked%20Project/NPM%20projet/docs/commands.md#2-health) |
| `analyze` | Compiles full findings list and remediation plan | [commands.md](file:///d:/Worked%20Project/NPM%20projet/docs/commands.md#3-analyze) |
| `doctor` | Interactive audit displaying actions, fix plans, and gates | [commands.md](file:///d:/Worked%20Project/NPM%20projet/docs/commands.md#4-doctor) |
| `roast` | Light-hearted, technically accurate roast of dependencies | [commands.md](file:///d:/Worked%20Project/NPM%20projet/docs/commands.md#5-roast) |
| `missing` | Detects non-declared package imports in source code | [commands.md](file:///d:/Worked%20Project/NPM%20projet/docs/commands.md#6-missing) |
| `explain <pkg>` | Shows role, ancestry chains, AST usage, and removal risk | [commands.md](file:///d:/Worked%20Project/NPM%20projet/docs/commands.md#7-explain) |
| `blast <pkg>` | BFS traversal modeling files and nodes affected by removal | [commands.md](file:///d:/Worked%20Project/NPM%20projet/docs/commands.md#8-blast) |
| `risk <pkg>` | Pre-install verification of peer bounds and compatibility | [commands.md](file:///d:/Worked%20Project/NPM%20projet/docs/commands.md#9-risk) |
| `upgrade <pkg>` | Predicts breaking compile risk levels on version upgrades | [commands.md](file:///d:/Worked%20Project/NPM%20projet/docs/commands.md#10-upgrade) |
| `security` | Production-triage vulnerability audits and inactivity checks | [commands.md](file:///d:/Worked%20Project/NPM%20projet/docs/commands.md#11-security) |
| `production` | Classifies dependencies into runtime vs dev/build scopes | [commands.md](file:///d:/Worked%20Project/NPM%20projet/docs/commands.md#12-production) |
| `timeline` | Tracks average package age and overall technical lag | [commands.md](file:///d:/Worked%20Project/NPM%20projet/docs/commands.md#13-timeline) |
| `workspace` | Inspects pnpm/npm/yarn monorepos for version drift | [commands.md](file:///d:/Worked%20Project/NPM%20projet/docs/commands.md#14-workspace) |
| `ci` | Machine-readable exit codes based on gates thresholds | [commands.md](file:///d:/Worked%20Project/NPM%20projet/docs/commands.md#15-ci) |

*For complete usage options, examples, and CLI output snapshots, see the [Commands Reference](file:///d:/Worked%20Project/NPM%20projet/docs/commands.md).*

---

## 📊 Score & Classification Models

`pkg-ct` calculates grading based on a strict logarithmic deduction model. A single critical issue is prioritized, while repetitive minor duplication issues are normalized to preserve score readability.

```text
  Health Score (Overall)
  ├── Duplication Score (Weight: 1.0)
  ├── Compatibility Score (Weight: 1.4)
  ├── Security Score (Weight: 1.8)
  ├── Freshness Score (Weight: 0.8)
  ├── Maintainability Score (Weight: 1.2)
  ├── Install Performance Score (Weight: 0.6)
  └── Hygiene Score (Weight: 1.0)
```

Detailed documentation on calculations is available:
* **Logarithmic Formulas & Category Weights:** [Scoring Rules](file:///d:/Worked%20Project/NPM%20projet/docs/scoring.md)
* **AST Evidence Confidence Model:** [Explainability Engine](file:///d:/Worked%20Project/NPM%20projet/docs/explain.md)
* **Production vs Dev Vulnerability Splitting:** [Security Model](file:///d:/Worked%20Project/NPM%20projet/docs/security.md)

---

## 🛠️ Learning Rules & Customizations

You can override `pkg-ct` heuristics by adding an `.ai-rules.json` configuration file in your project's root:

```json
{
  "alwaysUsed": ["tslib", "eslint-config-next"],
  "neverSuggestRemoval": ["react", "react-dom"],
  "preferredVersions": { "lodash": "^4.17.21" },
  "customRiskOverrides": { "vite": "low" },
  "ignorePackages": ["some-internal-utility"]
}
```

* **`alwaysUsed`**: Prevents packages from being flagged as unused, even if they have no static source imports.
* **`neverSuggestRemoval`**: Instructs the self-healing advisor to never suggest uninstalling these packages.
* **`preferredVersions`**: Standardizes target versions to prevent monorepo drift.
* **`ignorePackages`**: Completely excludes specified packages from scan and health scores.

---

## 🗂️ Documentation Guides Directory

* [Getting Started Guide](file:///d:/Worked%20Project/NPM%20projet/docs/getting-started.md) — Metaphor details, child's guides, first scan tutorial.
* [CLI Commands Reference](file:///d:/Worked%20Project/NPM%20projet/docs/commands.md) — Detailed references, common mistakes, and command options.
* [Scoring & Weights Calibration](file:///d:/Worked%20Project/NPM%20projet/docs/scoring.md) — Information on logarithmic algorithms and scoring weights.
* [Doctor Diagnostics engine](file:///d:/Worked%20Project/NPM%20projet/docs/doctor.md) — How the doctor remediation and prioritized action plans run.
* [Dependency Explainability](file:///d:/Worked%20Project/NPM%20projet/docs/explain.md) — Tracing roles, AST evidence levels, and blast radius BFS.
* [Security Auditing Rules](file:///d:/Worked%20Project/NPM%20projet/docs/security.md) — Triaging production CVE vulnerabilities and inactivity checks.
* [Frequently Asked Questions](file:///d:/Worked%20Project/NPM%20projet/docs/faq.md) — Answers to 30 common questions.
* [Real-world Examples Guide](file:///d:/Worked%20Project/NPM%20projet/docs/examples.md) — Walkthrough scenarios for Next.js, monorepos, and offline execution.
* [Benchmarks & Comparison Matrix](file:///d:/Worked%20Project/NPM%20projet/docs/benchmarks.md) — Performance comparisons and comparison table against other CLI audit tools.
* [Architectural Design](file:///d:/Worked%20Project/NPM%20projet/docs/architecture.md) — Scanner parsing, Evidence mapping, and API routing.
* [Plugins Guide](file:///d:/Worked%20Project/NPM%20projet/docs/plugins.md) — Writing custom rules and adding custom reporters.

---

## 🤝 Contributing

We welcome community contributions! Please set up your local development environment using the guidelines in [CONTRIBUTING.md](file:///d:/Worked%20Project/NPM%20projet/CONTRIBUTING.md) and check [Architecture Design](file:///d:/Worked%20Project/NPM%20projet/docs/architecture.md) for more code flow information.

Before sending any Pull Request, ensure that all quality gates pass by running:
```bash
npm run release-gate
```

---

## 📄 License

MIT License. See [LICENSE](file:///d:/Worked%20Project/NPM%20projet/LICENSE) (if present) or package details.
