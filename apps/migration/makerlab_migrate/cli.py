#!/usr/bin/env python3
"""
apps/migration/makerlab_migrate/cli.py

Entry point for the DETI Maker Lab migration tool.
"""

import argparse
import sys
from pathlib import Path

from .settings import MigrationSettings
from .logging import setup_logging
from .orchestration.migrator import MigrationOrchestrator
from .dump.dump_reader import DumpReader
from .dump.models import LegacyData


def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Migrate legacy data from PostgreSQL dump to DETI Maker Lab system"
    )
    
    parser.add_argument(
        "--dump-path",
        required=True,
        type=str,
        help="Path to the PostgreSQL dump file"
    )
    
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Log intended operations without writing to databases"
    )
    
    parser.add_argument(
        "--entity",
        choices=["users", "projects", "equipment", "all"],
        default="all",
        help="Entity type to migrate (default: all)"
    )
    
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Limit number of entities to process (for testing)"
    )
    
    parser.add_argument(
        "--since-legacy-id",
        type=int,
        default=None,
        help="Start migration from this legacy ID (for incremental runs)"
    )
    
    parser.add_argument(
        "--incremental",
        action="store_true",
        help="Enable automatic checkpoint tracking via migration_state table"
    )
    
    parser.add_argument(
        "--batch-size",
        type=int,
        default=100,
        help="Batch size for processing (default: 100)"
    )
    
    parser.add_argument(
        "--skip-snipeit",
        action="store_true",
        help="Skip Snipe-IT synchronization (Postgres-only migration)"
    )
    
    parser.add_argument(
        "--validate-only",
        action="store_true",
        help="Parse dump and validate without any DB operations"
    )
    
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose logging"
    )
    
    return parser.parse_args()


def validate_dump(dump_path: Path, logger) -> int:
    """Validate the dump file by parsing it and checking for errors."""
    logger.info("Validating dump file...")
    
    try:
        reader = DumpReader(dump_path)
        legacy_data = reader.load_all()
        
        logger.info(
            f"Validation complete: {len(legacy_data.users)} users, "
            f"{len(legacy_data.projects)} projects, "
            f"{len(legacy_data.equipment)} equipment items"
        )
        
        # Check for empty Código equipment
        empty_codigo = [eq for eq in legacy_data.equipment if not eq.codigo or not eq.codigo.strip()]
        if empty_codigo:
            logger.warning(f"Found {len(empty_codigo)} equipment items with empty Código")
        
        # Check for projects without owners
        no_owner = [p for p in legacy_data.projects if not p.owner_legacy_user_id]
        if no_owner:
            logger.warning(f"Found {len(no_owner)} projects without owner")
        
        return 0
        
    except Exception as e:
        logger.error(f"Validation failed: {str(e)}")
        return 4


def main():
    """Main entry point."""
    args = parse_args()
    logger = setup_logging(verbose=args.verbose)
    
    # Load settings
    try:
        settings = MigrationSettings.from_env(args.dump_path)
    except Exception as e:
        logger.error(f"Failed to load settings: {str(e)}")
        return 1
    
    # Validate settings
    errors = settings.validate(skip_snipeit=args.skip_snipeit, skip_db_validation=args.validate_only)
    if errors:
        logger.error("Configuration errors:")
        for error in errors:
            logger.error(f"  - {error}")
        return 1
    
    # Validate-only mode
    if args.validate_only:
        return validate_dump(settings.dump_path, logger)
    
    # Run migration
    orchestrator = MigrationOrchestrator(
        settings=settings,
        logger=logger,
        dry_run=args.dry_run,
        skip_snipeit=args.skip_snipeit,
        limit=args.limit,
        since_id=args.since_legacy_id,
        entity=args.entity,
        incremental=args.incremental
    )
    
    exit_code = orchestrator.run()
    
    if args.dry_run:
        logger.info("DRY-RUN complete: no changes were written to databases")
    
    return exit_code


if __name__ == "__main__":
    sys.exit(main())
