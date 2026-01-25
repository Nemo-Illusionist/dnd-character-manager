# Claude Code Instructions

## Documentation

All architecture documentation is in `.ai/`:

- **README.md** — project overview
- **ARCHITECTURE.md** — code structure, database, patterns
- **CONVENTIONS.md** — code and style conventions
- **CONTEXT.md** — AI context
- **ROADMAP.md** — development plans

**Read these files before starting work.**

## Migration Scripts

Migrations in `scripts/` are named with a timestamp prefix:

**Format**: `YYYYMMDDHHMMSS-<description>.ts`

```bash
# Dry run
npx ts-node --project scripts/tsconfig.json scripts/<file>.ts --dry-run

# Apply
npx ts-node --project scripts/tsconfig.json scripts/<file>.ts
```

Requires `serviceAccountKey.json` in project root.

## Rules

### D&D 2024 Rules

Verify all D&D 2024 rules with `@dnd-2024` agent before implementation.

### Git Commits

Only commit when **explicitly requested** by the user.
