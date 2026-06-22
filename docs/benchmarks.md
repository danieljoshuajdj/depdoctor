# Feature Comparison & Benchmarks

This document compares `pkg-ct` capabilities with other dependency tools and documents performance metrics.

---

## 1. Feature Capability Comparison

| Feature | `pkg-ct` | `depcheck` | `knip` | `npm audit` |
| :--- | :---: | :---: | :---: | :---: |
| **AST Source Code Scanning** | ✅ | ✅ | ✅ | ❌ |
| **Dependency Graph Tracing** | ✅ | ❌ | ✅ | ❌ |
| **Remediation Commands** | ✅ | ❌ | ❌ | ✅ |
| **Health Scoring (100-0)** | ✅ | ❌ | ❌ | ❌ |
| **AI Explainability Layer** | ✅ | ❌ | ❌ | ❌ |
| **Monorepo Version Drift** | ✅ | ❌ | ❌ | ❌ |
| **Blast Radius Modeling** | ✅ | ❌ | ❌ | ❌ |

---

## 2. Key Differentiators

1. **AST Usage Confidence Mapping:** `pkg-ct` evaluates confidence scores (`0-100`) based on how files, configuration, and scripts consume a library, preventing false-positive reports.
2. **Safe Removal Probability:** Calculates the likelihood that deleting a dependency is safe, capping it if transitive dependents rely on it.
3. **Logarithmic Deductions:** Prevents single findings from dragging the health score to zero, ensuring realistic and actionable grades.
4. **Triaged Security:** Separates production vulnerabilities from development or build vulnerabilities to resolve critical threats first.

---

## 3. Command Performance Benchmarks

* **`pkg-ct scan`** (Lockfile and directory scan): **~80-150ms** on moderate codebases. Bypasses AST parsing and network request pipelines.
* **`pkg-ct doctor`** (Complete scan, AST code parsing, offline/cached checks): **~300-600ms** depending on the source code volume.
* **Online Metadata Fetching** (with `fullMetadata: true`): Adds a network-bound overhead of **~1-3 seconds** depending on registry API speed.
