# apps/migration/makerlab_migrate/orchestration/migrator.py

import sys
import os
import hashlib
from typing import Optional, Dict, Any
from collections import defaultdict

# Add the apps/api directory to the path to import models
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../api"))
from db.models import User

from ..dump.models import LegacyUser, LegacyProject, LegacyEquipment, LegacyProjectMember
from ..dump.dump_reader import DumpReader
from ..dump.wiki_extractors import normalize_codigo, extract_nmec_from_username
from ..postgres.engine import PostgresUnitOfWork
from ..postgres.repos import (
    upsert_user, upsert_project, upsert_project_member,
    upsert_equipment_model, upsert_equipment,
    find_user_by_legacy_id, save_checkpoint, load_checkpoint
)
from ..postgres.schema_bootstrap import ensure_schema_bootstrap
from ..snipeit.client import create_snipeit_gateway
from ..snipeit.upsert import (
    find_or_create_user, find_model_by_model_number,
    find_asset_by_asset_tag, create_model, create_asset
)
from ..settings import MigrationSettings
from ..logging import MigrationLogger


def _generate_model_legacy_id(codigo: str) -> int:
    """Generate a stable legacy_id for equipment models from codigo hash."""
    # Use MD5 hash of normalized codigo, convert to positive integer
    normalized = normalize_codigo(codigo).encode('utf-8')
    hash_val = hashlib.md5(normalized).hexdigest()
    # Convert hex to int, ensure positive by taking absolute value
    return abs(int(hash_val, 16))


class MigrationOrchestrator:
    """Orchestrates the migration process."""
    
    def __init__(
        self,
        settings: MigrationSettings,
        logger: MigrationLogger,
        dry_run: bool = False,
        skip_snipeit: bool = False,
        limit: Optional[int] = None,
        since_id: Optional[int] = None,
        entity: str = "all",
        incremental: bool = False
    ):
        self.settings = settings
        self.logger = logger
        self.dry_run = dry_run
        self.skip_snipeit = skip_snipeit
        self.limit = limit
        self.since_id = since_id
        self.entity = entity
        self.incremental = incremental
        
        # Initialize Snipe-IT gateway with migration settings
        self.snipeit = create_snipeit_gateway(
            base_url=settings.snipeit_url,
            token=settings.snipeit_token,
            dry_run=dry_run,
            api_delay_ms=settings.snipeit_api_delay_ms,
            timeout=settings.snipeit_timeout_seconds,
            logger=logger
        )
        
        # Statistics
        self.stats = {
            "users": {"inserted": 0, "updated": 0, "skipped": 0, "errors": 0},
            "projects": {"inserted": 0, "updated": 0, "skipped": 0, "errors": 0},
            "project_members": {"inserted": 0, "updated": 0, "skipped": 0, "errors": 0},
            "equipment_models": {"inserted": 0, "updated": 0, "skipped": 0, "errors": 0},
            "equipment": {"inserted": 0, "updated": 0, "skipped": 0, "errors": 0},
        }
    
    def run(self) -> int:
        """Run the full migration. Returns exit code."""
        try:
            # Schema bootstrap
            self.logger.info("Running schema bootstrap...")
            ensure_schema_bootstrap(self.settings.postgres_uri)
            self.logger.info("Schema bootstrap complete")
            
            # Load legacy data
            self.logger.info("Loading legacy data...")
            reader = DumpReader(self.settings.dump_path)
            legacy_data = reader.load_all(limit=self.limit, since_id=self.since_id)
            self.logger.info(
                f"Loaded {len(legacy_data.users)} users, "
                f"{len(legacy_data.projects)} projects, "
                f"{len(legacy_data.equipment)} equipment items"
            )
            
            # Migrate based on entity filter
            if self.entity in ("users", "all"):
                self._migrate_users(legacy_data.users)
            
            if self.entity in ("projects", "all"):
                self._migrate_projects(legacy_data.projects)
            
            if self.entity in ("equipment", "all"):
                self._migrate_equipment(legacy_data.equipment)
            
            # Print summary
            self._print_summary()
            
            return 0
            
        except Exception as e:
            self.logger.error(f"Migration failed: {str(e)}")
            return 2
    
    def _migrate_users(self, users: list[LegacyUser]) -> None:
        """Migrate users to Postgres and Snipe-IT."""
        self.logger.info("Starting user migration...")

        # Load checkpoint if incremental mode
        start_id = None
        if self.incremental:
            with PostgresUnitOfWork(self.settings.postgres_uri, False) as session:
                start_id = load_checkpoint(session, "users")
                if start_id:
                    self.logger.info(f"Resuming from checkpoint: users since legacy_id {start_id}")

        # Filter users based on checkpoint
        if start_id:
            users = [u for u in users if u.id > start_id]

        # Phase 1: Snipe-IT operations (outside Postgres transaction)
        if not self.skip_snipeit:
            self.logger.info("Syncing users to Snipe-IT...")
            batch_size = self.settings.batch_size
            for i in range(0, len(users), batch_size):
                batch = users[i:i + batch_size]
                for legacy_user in batch:
                    if legacy_user.email:
                        try:
                            find_or_create_user(
                                self.snipeit,
                                email=legacy_user.email,
                                name=legacy_user.name,
                                username=legacy_user.username
                            )
                        except Exception as e:
                            self.logger.warning(
                                f"Failed to sync user to Snipe-IT: {str(e)}",
                                user_id=legacy_user.id
                            )
                            self.stats["users"]["errors"] += 1

        # Phase 2: Postgres upserts (in single transaction)
        with PostgresUnitOfWork(self.settings.postgres_uri, self.dry_run) as session:
            batch_size = self.settings.batch_size
            for i in range(0, len(users), batch_size):
                batch = users[i:i + batch_size]
                for legacy_user in batch:
                    try:
                        # Extract nmec from username if available
                        nmec = extract_nmec_from_username(legacy_user.username) if legacy_user.username else None

                        # Upsert to Postgres
                        user, action = upsert_user(
                            session,
                            legacy_id=legacy_user.id,
                            name=legacy_user.name,
                            email=legacy_user.email or "",
                            role=legacy_user.role,
                            nmec=nmec,
                            course=None  # Not available in legacy data
                        )

                        self.stats["users"][action.lower()] += 1
                        self.logger.log_entity_action(
                            "user", legacy_user.id, action, user.id
                        )

                    except Exception as e:
                        self.logger.error(
                            f"Failed to migrate user {legacy_user.id}: {str(e)}",
                            user_id=legacy_user.id
                        )
                        self.stats["users"]["errors"] += 1

            # Save checkpoint if incremental and not dry-run
            if self.incremental and not self.dry_run and users:
                last_id = max(u.id for u in users)
                save_checkpoint(session, "users", last_id)
                self.logger.info(f"Saved checkpoint for users: {last_id}")

            self.logger.log_summary(
                "users",
                **self.stats["users"]
            )
    
    def _migrate_projects(self, projects: list[LegacyProject]) -> None:
        """Migrate projects and their members to Postgres."""
        self.logger.info("Starting project migration...")

        # Load checkpoint if incremental mode
        start_id = None
        if self.incremental:
            with PostgresUnitOfWork(self.settings.postgres_uri, False) as session:
                start_id = load_checkpoint(session, "projects")
                if start_id:
                    self.logger.info(f"Resuming from checkpoint: projects since legacy_id {start_id}")

        # Filter projects based on checkpoint
        if start_id:
            projects = [p for p in projects if p.id > start_id]

        with PostgresUnitOfWork(self.settings.postgres_uri, self.dry_run) as session:
            batch_size = self.settings.batch_size
            for i in range(0, len(projects), batch_size):
                batch = projects[i:i + batch_size]
                for legacy_project in batch:
                    try:
                        # Find owner user
                        if not legacy_project.owner_legacy_user_id:
                            self.logger.warning(
                                f"Skipping project {legacy_project.id}: no owner specified",
                                project_id=legacy_project.id
                            )
                            self.stats["projects"]["skipped"] += 1
                            continue

                        owner = find_user_by_legacy_id(session, legacy_project.owner_legacy_user_id)
                        if not owner:
                            self.logger.warning(
                                f"Skipping project {legacy_project.id}: owner user {legacy_project.owner_legacy_user_id} not found",
                                project_id=legacy_project.id
                            )
                            self.stats["projects"]["skipped"] += 1
                            continue

                        # Upsert project
                        project, action = upsert_project(
                            session,
                            legacy_id=legacy_project.id,
                            name=legacy_project.title,
                            created_by_user_id=owner.id,
                            status="pending",  # Always use pending (not draft)
                            description=legacy_project.description,
                            course=legacy_project.course,
                            academic_year=legacy_project.academic_year,
                            group_number=legacy_project.group_number
                        )

                        self.stats["projects"][action.lower()] += 1
                        self.logger.log_entity_action(
                            "project", legacy_project.id, action, project.id
                        )

                        # Add owner as leader
                        _, owner_action = upsert_project_member(
                            session,
                            project_id=project.id,
                            user_id=owner.id,
                            role="leader"
                        )
                        self.stats["project_members"][owner_action.lower()] += 1

                        # Add other members
                        for member in legacy_project.members:
                            member_user = find_user_by_legacy_id(session, member.legacy_user_id)
                            if not member_user:
                                self.logger.warning(
                                    f"Skipping member: user {member.legacy_user_id} not found",
                                    project_id=legacy_project.id
                                )
                                self.stats["project_members"]["skipped"] += 1
                                continue

                            # Map role: owner->leader, member->member, mentor->advisor
                            role_mapping = {
                                "owner": "leader",
                                "member": "member",
                                "mentor": "advisor"
                            }
                            mapped_role = role_mapping.get(member.role, member.role)

                            _, member_action = upsert_project_member(
                                session,
                                project_id=project.id,
                                user_id=member_user.id,
                                role=mapped_role
                            )
                            self.stats["project_members"][member_action.lower()] += 1

                    except Exception as e:
                        self.logger.error(
                            f"Failed to migrate project {legacy_project.id}: {str(e)}",
                            project_id=legacy_project.id
                        )
                        self.stats["projects"]["errors"] += 1

            # Save checkpoint if incremental and not dry-run
            if self.incremental and not self.dry_run and projects:
                last_id = max(p.id for p in projects)
                save_checkpoint(session, "projects", last_id)
                self.logger.info(f"Saved checkpoint for projects: {last_id}")

            self.logger.log_summary(
                "projects",
                **self.stats["projects"]
            )
            self.logger.log_summary(
                "project_members",
                **self.stats["project_members"]
            )
    
    def _migrate_equipment(self, equipment_list: list[LegacyEquipment]) -> None:
        """Migrate equipment models and assets to Postgres and Snipe-IT."""
        if self.skip_snipeit:
            self.logger.info("Starting equipment migration (Postgres only, --skip-snipeit)")
        else:
            self.logger.info("Starting equipment migration...")

        # Load checkpoint if incremental mode
        start_id = None
        if self.incremental:
            with PostgresUnitOfWork(self.settings.postgres_uri, False) as session:
                start_id = load_checkpoint(session, "equipment")
                if start_id:
                    self.logger.info(f"Resuming from checkpoint: equipment since article_id {start_id}")

        # Filter equipment based on checkpoint
        if start_id:
            equipment_list = [eq for eq in equipment_list if eq.article_id > start_id]

        # Group equipment by código
        equipment_by_codigo: Dict[str, list[LegacyEquipment]] = defaultdict(list)
        skipped_empty_codigo = []
        
        for eq in equipment_list:
            if not eq.codigo or not eq.codigo.strip():
                skipped_empty_codigo.append(eq)
                continue
            equipment_by_codigo[eq.codigo].append(eq)
        
        if skipped_empty_codigo:
            self.logger.warning(
                f"Skipping {len(skipped_empty_codigo)} equipment items with empty Código"
            )

        # Phase 1: Snipe-IT operations (outside Postgres transaction)
        # Collect Snipe-IT model and asset IDs for each codigo and equipment item
        snipeit_data: Dict[str, Dict] = {}  # codigo -> {model_id, assets: {article_id -> asset_id}}
        if not self.skip_snipeit:
            self.logger.info("Syncing equipment models and assets to Snipe-IT...")
            codigos_list = list(equipment_by_codigo.items())
            batch_size = self.settings.batch_size
            for i in range(0, len(codigos_list), batch_size):
                batch = codigos_list[i:i + batch_size]
                for codigo, equipment_group in batch:
                    try:
                        template = equipment_group[0]

                        # Get category and manufacturer IDs from settings
                        category_id = self.settings.snipeit_category_map.get(
                            template.family,
                            self.settings.snipeit_default_category_id
                        )
                        manufacturer_id = self.settings.snipeit_manufacturer_map.get(
                            template.supplier,
                            self.settings.snipeit_default_manufacturer_id
                        )

                        # Find or create model in Snipe-IT
                        snipeit_model = find_model_by_model_number(self.snipeit, codigo)
                        if not snipeit_model:
                            snipeit_model = create_model(
                                self.snipeit,
                                name=template.title,
                                model_number=codigo,
                                category_id=category_id,
                                manufacturer_id=manufacturer_id,
                                price=float(template.price) if template.price else None
                            )

                        if snipeit_model:
                            # Create assets for each equipment item
                            assets = {}
                            for idx, legacy_eq in enumerate(equipment_group):
                                quantity = legacy_eq.quantity if legacy_eq.quantity and legacy_eq.quantity > 0 else 1

                                for q in range(quantity):
                                    # Generate unique asset tag
                                    if len(equipment_group) > 1 or quantity > 1:
                                        asset_tag = f"{codigo}-{idx+1}-{q+1}"
                                    else:
                                        asset_tag = codigo

                                    # Find or create asset in Snipe-IT
                                    snipeit_asset = find_asset_by_asset_tag(self.snipeit, asset_tag)
                                    if not snipeit_asset:
                                        snipeit_asset = create_asset(
                                            self.snipeit,
                                            model_id=snipeit_model.id,
                                            asset_tag=asset_tag,
                                            name=legacy_eq.title,
                                            location=legacy_eq.location
                                        )

                                    if snipeit_asset:
                                        # Store asset ID for this equipment item
                                        assets[legacy_eq.article_id] = snipeit_asset.id

                            snipeit_data[codigo] = {
                                "model_id": snipeit_model.id,
                                "assets": assets
                            }

                    except Exception as e:
                        self.logger.error(
                            f"Failed to sync equipment with código {codigo} to Snipe-IT: {str(e)}"
                        )
                        self.stats["equipment_models"]["errors"] += 1

        # Phase 2: Postgres upserts (in single transaction)
        with PostgresUnitOfWork(self.settings.postgres_uri, self.dry_run) as session:
            codigos_list = list(equipment_by_codigo.items())
            batch_size = self.settings.batch_size
            for i in range(0, len(codigos_list), batch_size):
                batch = codigos_list[i:i + batch_size]
                for codigo, equipment_group in batch:
                    try:
                        # Use first equipment as template
                        template = equipment_group[0]

                        # Get Snipe-IT model ID if available
                        snipeit_model_id = None
                        if codigo in snipeit_data and not self.dry_run:
                            snipeit_model_id = snipeit_data[codigo]["model_id"]

                        # Upsert equipment model (use stable hash-based legacy_id)
                        model_legacy_id = _generate_model_legacy_id(codigo)
                        model, model_action = upsert_equipment_model(
                            session,
                            legacy_id=model_legacy_id,
                            name=template.title,
                            reference_code=normalize_codigo(codigo),
                            legacy_reference_code=codigo,
                            family=template.family,
                            sub_family=template.sub_family,
                            supplier=template.supplier,
                            price=float(template.price) if template.price else None
                        )

                        # Update with Snipe-IT model ID
                        if snipeit_model_id:
                            model.snipeit_model_id = snipeit_model_id

                        self.stats["equipment_models"][model_action.lower()] += 1
                        self.logger.log_entity_action(
                            "equipment_model", model_legacy_id, model_action, model.id
                        )

                        # Create equipment items in Postgres
                        for idx, legacy_eq in enumerate(equipment_group):
                            quantity = legacy_eq.quantity if legacy_eq.quantity and legacy_eq.quantity > 0 else 1

                            for q in range(quantity):
                                # Get Snipe-IT asset ID if available
                                snipeit_asset_id = None
                                if codigo in snipeit_data and not self.dry_run:
                                    snipeit_asset_id = snipeit_data[codigo]["assets"].get(legacy_eq.article_id)

                                # Upsert equipment in Postgres
                                equipment, eq_action = upsert_equipment(
                                    session,
                                    legacy_id=legacy_eq.article_id,
                                    model_id=model.id,
                                    snipeit_asset_id=snipeit_asset_id,
                                    location=legacy_eq.location,
                                    status="available"  # Default to available
                                )

                                self.stats["equipment"][eq_action.lower()] += 1
                                self.logger.log_entity_action(
                                    "equipment", legacy_eq.article_id, eq_action, equipment.id
                                )

                    except Exception as e:
                        self.logger.error(
                            f"Failed to migrate equipment with código {codigo}: {str(e)}"
                        )
                        self.stats["equipment_models"]["errors"] += 1

            # Save checkpoint if incremental and not dry-run
            if self.incremental and not self.dry_run and equipment_list:
                last_id = max(eq.article_id for eq in equipment_list)
                save_checkpoint(session, "equipment", last_id)
                self.logger.info(f"Saved checkpoint for equipment: {last_id}")

            self.logger.log_summary(
                "equipment_models",
                **self.stats["equipment_models"]
            )
            self.logger.log_summary(
                "equipment",
                **self.stats["equipment"]
            )
    
    def _print_summary(self) -> None:
        """Print migration summary."""
        self.logger.info("=" * 50)
        self.logger.info("MIGRATION SUMMARY")
        self.logger.info("=" * 50)
        
        for entity, stats in self.stats.items():
            self.logger.info(
                f"{entity.replace('_', ' ').title()}: "
                f"Inserted: {stats['inserted']}, "
                f"Updated: {stats['updated']}, "
                f"Skipped: {stats['skipped']}, "
                f"Errors: {stats['errors']}"
            )
        
        self.logger.info("=" * 50)
