# Contributing

Thanks for improving `node-modules-doctor`.

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```

## Rules

Rules must be deterministic, explainable, and safe in offline mode. AI providers may summarize findings but must not create new facts.

## Changesets

Every user-facing change should include a changeset:

```bash
npx changeset
```
