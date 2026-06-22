# Security Auditing, Triaging & Inactivity Tracking

This document explains the technical details of the `pkg-ct security` audit engine, production relevance triaging, and maintainer activity tracking.

---

## 1. Vulnerability Triaging Model

Many security scanners inundate developers with hundreds of CVE warnings, regardless of whether the affected code runs on production servers. `pkg-ct` addresses this alert fatigue by separating vulnerability assessments by **Production Exposure**:

```text
Vulnerability Scan
   │
   ├── Production Critical ➔ Trigger High-Priority Alerts (SLA Fix Required)
   │
   └── Development Only ➔ Triaged to Low-Priority (Safe to defer)
```

### Classification Rules

1. **`Production Critical`:**
   * Vulnerabilities residing in packages mapped to roles: `CORE_RUNTIME`, `FRAMEWORK`, `PRODUCTION_RUNTIME`.
   * These packages are compiled into client bundles or executed on production API servers.
2. **`Development Only`:**
   * Vulnerabilities in packages with roles like `DEVELOPMENT`, `TEST_TOOL`, `LINTER`.
   * Since this code only runs locally during testing or compilation, these issues present near-zero runtime exploit vectors on your production servers.

---

## 2. Inactivity & Abandonment Risks

Security is not just about documented CVEs; it is also about the health of the project's upstream maintainers. The security scanner flags package maintainer patterns to identify potential supply chain risks.

### Abandonment Indicators

The tool queries the NPM registry and flags packages with high **Abandonment Risks**:

* **Inactivity Timeframe:** A package has received no updates or releases for more than 4 years.
* **Bus Factor:** The package is managed by a single maintainer.
* **Download Trends:** Downloads have plummeted by more than 80% over the last year (indicating a dying community).
* **Deprecation Notice:** The author has explicitly marked the package as deprecated.

### Inactivity Actions
The doctor engine will surface **Abandonment Risks** as warnings and recommend alternative, active packages (e.g. replacing `request` with `axios` or `undici`).
