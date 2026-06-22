# Frequently Asked Questions (FAQ)

This FAQ compiles answers to common questions about `pkg-ct` (Package City Inspector), its scoring, security models, and configurations.

---

## FAQ Index

1. [Can I trust the safe removal probability?](#1-can-i-trust-the-safe-removal-probability)
2. [Why does the AI say EXTREME risk?](#2-why-does-the-ai-say-extreme-risk)
3. [Why is React protected from removal?](#3-why-is-react-protected-from-removal)
4. [What causes duplicate packages?](#4-what-causes-duplicate-packages)
5. [Why is my compatibility score low?](#5-why-is-my-compatibility-score-low)
6. [Does pkg-ct upload my code to external AI servers?](#6-does-pkg-ct-upload-my-code-to-external-ai-servers)
7. [How do I configure Ollama for local summaries?](#7-how-do-i-configure-ollama-for-local-summaries)
8. [How does the scoring engine weight categories?](#8-how-does-the-scoring-engine-weight-categories)
9. [What is "technical lag"?](#9-what-is-technical-lag)
10. [Can I run pkg-ct on monorepos with nested package.json files?](#10-can-i-run-pkg-ct-on-monorepos-with-nested-packagejson-files)
11. [How do I clear CLI spinner animations in CI logs?](#11-how-do-i-clear-cli-spinner-animations-in-ci-logs)
12. [Why does scan run so fast compared to doctor?](#12-why-does-scan-run-so-fast-compared-to-doctor)
13. [Does this tool support Yarn Plug'n'Play (PnP)?](#13-does-this-tool-support-yarn-plugnplay-pnp)
14. [What are package lifecycle scripts?](#14-what-are-package-lifecycle-scripts)
15. [How do I ignore warnings for a deprecated package I cannot replace?](#15-how-do-i-ignore-warnings-for-a-deprecated-package-i-cannot-replace)
16. [What does "Blast Radius Count" represent?](#16-what-does-blast-radius-count-represent)
17. [How is safe removal probability calculated?](#17-how-is-safe-removal-probability-calculated)
18. [Does this tool support TypeScript codebases?](#18-does-this-tool-support-typescript-codebases)
19. [Why does my score change when running offline vs online?](#19-why-does-my-score-change-when-running-offline-vs-online)
20. [What is "transitive bloat"?](#20-what-is-transitive-bloat)
21. [How do I automate fixes in a script?](#21-how-do-i-automate-fixes-in-a-script)
22. [What makes a fix "safe"?](#22-what-makes-a-fix-safe)
23. [Can I write custom analysis rules?](#23-can-i-write-custom-analysis-rules)
24. [How do I report a bug?](#24-how-do-i-report-a-bug)
25. [How do I check if a package manager is supported?](#25-how-do-i-check-if-a-package-manager-is-supported)
26. [What does "Production Reachable" mean?](#26-what-does-production-reachable-mean)
27. [Why does my build time increase with native modules?](#27-why-does-my-build-time-increase-with-native-modules)
28. [What is "Workspace Drift"?](#28-what-is-workspace-drift)
29. [Can I customize the scoring categories?](#29-can-i-customize-the-scoring-categories)
30. [How do I contribute code?](#30-how-do-i-contribute-code)

---

### 1. Can I trust the safe removal probability?
Yes. The probability is calculated using an evidence-based confidence formula. If a package is imported in code, its removal probability drops to `1%`. If it has config, script, or framework signatures, the probability stays low. It is only flagged as safe to remove when no evidence is found across any source files.

### 2. Why does the AI say EXTREME risk?
An EXTREME risk rating means a package has a massive blast radius. Removing it will break core runtime components (like React, Express, or Next.js) or break hundreds of downstream packages.

### 3. Why is React protected from removal?
`pkg-ct` includes built-in framework rules. React is recognized as a core framework package, so the scanner will never recommend removing it.

### 4. What causes duplicate packages?
Duplication happens when different packages in your project require different, incompatible version ranges of the same dependency. For example, package A wants `semver@^6` and package B wants `semver@^7`. NPM is forced to install both.

### 5. Why is my compatibility score low?
Your compatibility score drops when packages in your project have unsatisfied peer dependencies, or if they do not support your active Node.js version.

### 6. Does pkg-ct upload my code to external AI servers?
No. By default, the AI summary engine runs offline using local heuristic rule templates. If you configure a third-party AI provider (like OpenAI or Anthropic), `pkg-ct` only sends structured package data and dependency names, never your proprietary source code files.

### 7. How do I configure Ollama for local summaries?
Set the provider in `pkg-ct.config.ts` to `ollama`, and configure the API endpoint to point to your local port: `http://localhost:11434`.

### 8. How does the scoring engine weight categories?
The weights are defined in the configuration. The default weights are: Security (`1.8`), Compatibility (`1.4`), Maintainability (`1.2`), Duplication (`1.0`), Hygiene (`1.0`), Freshness (`0.8`), and Install Performance (`0.6`).

### 9. What is "technical lag"?
Technical lag measures the age difference and version distance between your installed packages and their latest available releases.

### 10. Can I run pkg-ct on monorepos with nested package.json files?
Yes. `pkg-ct` automatically searches for monorepo roots and scans all workspace directories configured in `pnpm-workspace.yaml` or npm workspace configurations.

### 11. How do I clear CLI spinner animations in CI logs?
Pass the `--ci` flag or configure options to write output directly to a file: `--output report.md`. This automatically disables spinner animations to keep your CI log files clean.

### 12. Why does scan run so fast compared to doctor?
The `scan` command only parses the lockfile and node tree structure. It skips scanning your source code files with AST and bypasses fetching metadata from the online npm registry.

### 13. Does this tool support Yarn Plug'n'Play (PnP)?
Currently, `pkg-ct` requires a physical `node_modules` tree to inspect directory structures, sizes, and file footprints.

### 14. What are package lifecycle scripts?
These are hooks (like `preinstall`, `postinstall`, `prepublish`) that packages run during installation or publishing. They are common vectors for supply chain attacks.

### 15. How do I ignore warnings for a deprecated package I cannot replace?
Add the package name to the `ignorePackages` array in your `pkg-ct.config.ts` file or `.ai-rules.json`.

### 16. What does "Blast Radius Count" represent?
It represents the total number of packages in your tree that depend on that specific package, either directly or transitively.

### 17. How is safe removal probability calculated?
It is calculated by checking the presence and strength of import statements, config references, package scripts, workflow actions, and workspace links.

### 18. Does this tool support TypeScript codebases?
Yes, it parses `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, and `.cjs` files.

### 19. Why does my score change when running offline vs online?
Online scans query the npm registry to detect deprecations, maintenance inactivity, and publish history. In offline mode, the freshness and maintainability scores are calculated using local lockfile estimates.

### 20. What is "transitive bloat"?
Transitive bloat occurs when a package brings in a massive cascade of nested dependencies, increasing your `node_modules` size and slowing down your builds.

### 21. How do I automate fixes in a script?
Run `pkg-ct fix --run` to execute safe fixes automatically.

### 22. What makes a fix "safe"?
Safe fixes are actions (like `npm dedupe` or removing unused direct dependencies) that do not break dependency version ranges.

### 23. Can I write custom analysis rules?
Yes. You can write custom rules using the programmatic API and include them via plugins.

### 24. How do I report a bug?
Please open an issue in the GitHub repository: `https://github.com/danieljoshuajdj/pkg-ct`.

### 25. How do I check if a package manager is supported?
`pkg-ct` supports npm, pnpm, and Yarn workspaces.

### 26. What does "Production Reachable" mean?
It means the package is imported in code that runs in production, or is listed in the production dependency tree, even if it is not directly imported in your server entry point.

### 27. Why does my build time increase with native modules?
Native modules require compilation on installation. If your CI runner doesn't cache `node_modules`, it compiles the C++ assets on every single build, slowing down deployments.

### 28. What is "Workspace Drift"?
Workspace drift happens in monorepos when different packages depend on different version ranges of the same dependency, leading to multiple versions being installed.

### 29. Can I customize the scoring categories?
Yes, you can edit the category weights in `pkg-ct.config.ts`.

### 30. How do I contribute code?
Review our Contributing Guide in `CONTRIBUTING.md` and read the reference sections in this README.
