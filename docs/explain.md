# Dependency Explainability & Blast Radius Modeling

This guide covers the technical implementation of the `pkg-ct explain <pkg>` command, usage analysis, and blast radius calculations.

---

## 1. Tracing Dependencies (Why is a package installed?)

A common issue in modern web development is a bloated `node_modules` folder full of packages of unknown origin. The `explain` command traces the exact chain of dependents that introduced a package to your workspace.

```text
Dependency Chain Example:
my-app ➔ express ➔ body-parser ➔ lodash
```

### Direct vs. Transitive Roles
* **`DIRECT`**: Explicitly declared in your project's `package.json` dependencies.
* **`TRANSITIVE`**: Installed because another dependency in the tree required it.
* **`DEVELOPMENT`**: Listed in `devDependencies` and used strictly for tooling or testing.

---

## 2. AST Usage Analysis (Usage Evidence)

To determine whether a package is safe to remove, `pkg-ct` runs a code scanning pass using an AST (Abstract Syntax Tree) scanner to collect evidence.

We rank evidence based on strength:

* **High Confidence (100%):** Literal imports like `import _ from 'lodash'` or `const express = require('express')`.
* **Configuration Context (90%):** Mentions in setup files like `webpack.config.js`, `postcss.config.js`, or `.eslintrc`.
* **Task Runners (80%):** Calls to the package's CLI bin scripts in the `package.json` scripts section.
* **Orchestration (70%):** Traced in GitHub Action steps or workflow files.

---

## 3. Blast Radius Modeling (BFS Graph Traversal)

The **Blast Radius** represents the total number of files and upstream packages that will break if you modify or remove a specific package.

To calculate this, the engine performs a **Breadth-First Search (BFS)** traversal up the dependency tree, tracking all parent dependents.

```text
    [Package X (Target)]
        ▲          ▲
        │          │
   [Package A]  [Package B]
        ▲          ▲
        │          │
    [File 1]    [File 2]
```

### Blast Radius Levels

| Count of Affected Nodes | Blast Radius Category | Upgrade Risk Level |
| :---: | :--- | :--- |
| `0` | `NONE` | Low Risk |
| `1 – 2` | `LOW` | Minor Risk |
| `3 – 10` | `MEDIUM` | Moderate Risk |
| `11 – 50` | `HIGH` | Significant Risk |
| `> 50` | `EXTREME` | High Risk (Core libraries) |

---

## 4. Safe Removal Probability

The removal probability evaluates how safely you can run `npm uninstall <pkg>`. 

For example:
* A package with a **Direct Source Import** will have a safe removal probability of **`1%`** (nearly guaranteed to break builds).
* A **Dev Dependency with No Usage Evidence** will have a probability of **`95%`** (completely safe to prune).
* A package listed as a **Core Runtime** framework (e.g. `react`) is protected by framework heuristics and capped at **`2%`** probability.
* Any package with active **transitive dependents** (other packages depending on it) is capped at a maximum of **`25%`** safe removal probability.
