# API

## `analyzeProject(options)`

Runs the full deterministic analysis engine and returns `AnalysisResult`.

## `explainPackage(result, packageName)`

Traces why a package exists, its dependency chains, duplicate versions, install footprint, risks, and removal probability.

## `predictInstallRisk(packageSpec, context, graph, findings)`

Predicts likely conflicts before adding a new dependency.

## `runFixes(result, options)`

Builds or executes a fix plan. Use `dryRun: true` for CI and PR checks.
