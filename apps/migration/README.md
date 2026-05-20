# DETI Maker Lab Migration Module

This module migrates legacy data from the PostgreSQL dump (`dump-1776931288`) into the current DETI Maker Lab system (PostgreSQL + Snipe-IT).

## Features

- **Idempotent migration**: Running multiple times produces no duplicates
- **Dry-run mode**: Test migrations without writing to databases
- **Incremental support**: Resume from checkpoints
- **Rate limiting**: 100ms delay between Snipe-IT API calls
- **Schema bootstrap**: Automatically adds `legacy_id` columns to track migrated records

## Installation

```bash
cd apps/migration
pip install -r requirements.txt
```

## Configuration

Set the following environment variables:

```bash
export POSTGRES_URL="postgresql://user:pass@host:port/dbname"
export SNIPEIT_BASE_URL="https://snipeit.example.com"
export SNIPEIT_API_TOKEN="your-api-token"
export MIGRATION_BATCH_SIZE="100"  # Optional, default 100
export SNIPEIT_API_DELAY_MS="100"  # Optional, default 100
```

## Usage

### Validate dump file (no DB operations)

```bash
python -m makerlab_migrate.cli --dump-path /path/to/dump-1776931288 --validate-only
```

### Test Postgres-only migration (skip Snipe-IT)

```bash
python -m makerlab_migrate.cli --dump-path /path/to/dump-1776931288 --skip-snipeit --limit 10
```

### Dry-run full migration (test Snipe-IT integration)

```bash
python -m makerlab_migrate.cli --dump-path /path/to/dump-1776931288 --dry-run
```

### Production migration

```bash
python -m makerlab_migrate.cli --dump-path /path/to/dump-1776931288
```

### Incremental migration (with checkpoint tracking)

```bash
python -m makerlab_migrate.cli --dump-path /path/to/dump-1776931288 --incremental
```

### Migrate specific entity type

```bash
python -m makerlab_migrate.cli --dump-path /path/to/dump-1776931288 --entity users
```

## CLI Arguments

- `--dump-path`: Path to PostgreSQL dump file (required)
- `--dry-run`: Log operations without writing to databases
- `--entity`: Entity type to migrate (`users|projects|equipment|all`, default: `all`)
- `--limit`: Limit number of entities to process (for testing)
- `--since-legacy-id`: Start migration from this legacy ID
- `--incremental`: Enable automatic checkpoint tracking
- `--batch-size`: Batch size for processing (default: 100)
- `--skip-snipeit`: Skip Snipe-IT synchronization
- `--validate-only`: Parse dump and validate without DB operations
- `--verbose`: Enable verbose logging

## Exit Codes

- `0`: Success
- `1`: Configuration error
- `2`: Database connection error
- `3`: Snipe-IT API error
- `4`: Dump parsing error
- `5`: Validation error

## Schema Changes

The migration automatically adds the following columns via schema bootstrap:

- `users.legacy_id` (BIGINT NULL UNIQUE)
- `projects.legacy_id` (BIGINT NULL UNIQUE)
- `equipment_models.legacy_id` (BIGINT NULL UNIQUE)
- `equipment_models.legacy_reference_code` (TEXT NULL)
- `equipment.legacy_id` (BIGINT NULL UNIQUE)

## Important Notes

- **Project status**: Always defaults to `"pending"` (not `"draft"` which violates CHECK constraint)
- **User roles**: `is_superuser=True` or `is_staff=True` → `"lab_technician"`, others → `"student"`
- **Equipment with empty Código**: Logged as warnings and skipped
- **Project membership**: XML `<owner>` → `"leader"`, `<member>` → `"member"`, `<mentor>` → `"advisor"`

## Docker Environment Notice

**CRITICAL**: If you are testing the migration module alongside the Docker infrastructure (e.g. running `docker-compose down -v` followed by `docker-compose up -d`), be aware of the following Docker trap:

1. When `docker-compose up -d` runs, the `makerlab-api` container starts and caches the environment variables from `apps/api/.env`.
2. When you initialize Snipe-IT and generate a **new** API token, you must paste it into both `apps/api/.env` and `apps/migration/.env`.
3. **You must restart the API container** for it to pick up the new token! Run `docker-compose up -d` again (or `docker restart makerlab-api`). If you skip this, the migration script will succeed (since it runs natively and reads `.env` directly), but the website will silently fail to authenticate with Snipe-IT because the API container is still using the old token.

## Testing Strategy

1. **Phase 0**: Run `--validate-only` to parse entire dump
2. **Phase 1**: Run `--skip-snipeit --limit 10` to test Postgres logic
3. **Phase 2**: Run `--dry-run` to test Snipe-IT integration
4. **Phase 3**: Run `--entity users` to migrate just users
5. **Phase 4**: Run without flags for full migration