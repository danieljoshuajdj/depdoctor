# Scoring Engine & Calibration Rules

This document describes the scoring algorithms, grade thresholds, calibration decisions, category weights, and confidence logic used in `@danijsrr/pkg-ct`.

---

## 1. Overall Health Score

The overall health score is a value ranging from `5` to `100` representing the dependency posture of the repository. It is mapped to a letter grade:

| Grade | Range | Label |
| :---: | :---: | :--- |
| **A** | 90–100 | Excellent |
| **B** | 75–89 | Good |
| **C** | 60–74 | Fair |
| **D** | 40–59 | Needs Attention |
| **F** | 5–39 | High Risk / Fragile |

> [!NOTE]
> **Scoring Floor Principle:** A score of `0` is never emitted. Even highly problematic directories will clamp at a minimum score of `5`. Surfacing a `0/100` score destroys user trust, so a baseline floor is programmatically enforced.

---

## 2. Logarithmic Deduction Model

Rather than using basic linear subtractions which yield disproportionate penalties on medium-sized trees, `pkg-ct` uses a **logarithmic normalization model** to evaluate deductions.

### Formula

```
rawSignal         = Σ (severityDeduction(finding) × finding.confidence)
logDeduction      = ln(1 + rawSignal) × SENSITIVITY
weightedDeduction = logDeduction × min(1, categoryWeight)
score             = max(floor, round(100 - weightedDeduction))
```

* **`SENSITIVITY`** is defaulted to `6.5` (tuned so 1 high-severity finding with confidence=1.0 ≈ 15-point deduction).
* **`floor`** is dynamically adjusted based on critical issues:
  * Default floor: `15`
  * If $\ge$ 2 critical findings: `10`
  * If $\ge$ 5 critical findings: `5`

### Severity Base Signals

| Finding Severity | Raw Signal Points |
| :--- | :---: |
| `info` | 1 |
| `low` | 3 |
| `medium` | 7 |
| `high` | 14 |
| `critical` | 24 |

### Logarithmic vs Linear Calibration Scenarios

| Scenario Description | Finding Count | Linear Score (Old) | Logarithmic Score (Current) |
| :--- | :---: | :---: | :---: |
| 22 duplicate families (medium severity) | 22 | 0 | **~54 (D)** |
| 34 compatibility issues (high severity) | 34 | 0 | **~40 (D)** |
| 1 critical security vulnerability | 1 | ~76 | **~72 (C)** |
| Clean scan (0 findings) | 0 | 100 | **100 (A)** |

> [!TIP]
> **Why Logarithmic?** The function $y = \ln(1+x)$ grows quickly for small $x$ and flattens out as $x$ increases. This ensures that the *first* duplicate package is heavily penalized (alerting developers), while the 30th duplicate package does not single-handedly sink the entire score to zero.

---

## 3. Score Categories & Weights

The overall score is a weighted average of individual category scores.

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

| Category | Default Weight | Description / Calculation Factors |
| :--- | :---: | :--- |
| **`security`** | `1.8` | Checks for vulnerabilities (CVEs) and triages prod vs dev-only relevance. |
| **`compatibility`** | `1.4` | Assesses unsatisfied peer dependencies and Node engine constraints. |
| **`maintainability`** | `1.2` | Checks for deprecated packages and long-term unmaintained libraries. |
| **`hygiene`** | `1.0` | Deducts for unused direct dependencies or phantom/undeclared imports. |
| **`duplication`** | `1.0` | Deducts for duplicate package versions sitting in the tree. |
| **`install-performance`** | `0.6` | Weighs native modules requiring compiling and deep transitive depths. |
| **`freshness`** | `0.8` | Evaluates direct dependencies that fall behind the latest releases. |

---

## 4. Package Usage Confidence Model

To calculate if a declared dependency is actually used, `pkg-ct` builds an AST and script evidence graph to score usage confidence from `0` to `100`:

| Evidence Source | Confidence Score | Description |
| :--- | :---: | :--- |
| **Direct source import** | `100` | Literal `import` or `require()` statements found in code. |
| **Config file reference** | `90` | Package name listed in framework configs (e.g. `tailwind.config.js`). |
| **package.json scripts** | `80` | Executable command invoked inside a scripts runner command. |
| **CI workflow reference** | `70` | Reference found in `.github/workflows` or CI action YAML files. |
| **Known framework package** | `60` | Recognized framework core dependencies (e.g. `react`, `next`, `vue`). |
| **Weak evidence** | `40` | Plugin names (e.g. `eslint-plugin-*`) or TypeScript declaration types. |
| **No evidence found** | `20` | Zero references found anywhere in the workspace directory. |

---

## 5. Safe Removal Probability

Safe removal probability calculations determine the likelihood that deleting a package from `package.json` will not cause runtime or compilation crashes:

| Condition / Evidence Level | Probability | Action Recommendation |
| :--- | :---: | :--- |
| **Direct import** (confidence=100) | `1%` | Do not remove. |
| **Config reference** (confidence=90) | `5%` | Deleting will break configuration files. |
| **Script reference** (confidence=80) | `8%` | Deleting will break build/dev task commands. |
| **CI reference** (confidence=70) | `12%` | Deleting will break CI deployment jobs. |
| **Known framework** (confidence=60) | `15%` | Do not remove framework orchestrators. |
| **Transitive dependents** (has children) | `≤25%` | Removal is capped since downstream modules require it. |
| **Core runtime** (react, react-dom) | `2%` | Hard-coded protection; never suggest removal. |
| **Prod dependency, no evidence** | `50%` | Moderate risk. Verify dynamic imports before removal. |
| **Dev dependency, no evidence** | `95%` | Safe to remove. |
