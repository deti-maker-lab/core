# apps/migration/makerlab_migrate/settings.py

import os
from pathlib import Path
from typing import Dict, Optional
from pydantic_settings import BaseSettings


class MigrationSettings(BaseSettings):
    """Configuration for the migration module."""
    
    # Dump file path
    dump_path: Path
    
    # PostgreSQL connection
    postgres_uri: str
    
    # Snipe-IT configuration
    snipeit_url: str
    snipeit_token: str
    snipeit_timeout_seconds: int = 10
    
    # Snipe-IT category and manufacturer mappings
    snipeit_category_map: Dict[str, int] = {}
    snipeit_manufacturer_map: Dict[str, int] = {}
    snipeit_default_category_id: int = 1
    snipeit_default_manufacturer_id: int = 1
    
    # Rate limiting
    snipeit_api_delay_ms: int = 100
    
    # Batch size for processing
    batch_size: int = 100
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"
    
    @classmethod
    def from_env(cls, dump_path: str) -> "MigrationSettings":
        """Load settings from environment variables."""
        # Parse category and manufacturer maps from JSON strings
        category_map_str = os.getenv("SNIPEIT_CATEGORY_MAP", "{}")
        manufacturer_map_str = os.getenv("SNIPEIT_MANUFACTURER_MAP", "{}")
        
        try:
            import json
            category_map = json.loads(category_map_str)
            manufacturer_map = json.loads(manufacturer_map_str)
        except json.JSONDecodeError:
            category_map = {}
            manufacturer_map = {}
        
        return cls(
            dump_path=Path(dump_path),
            postgres_uri=os.getenv("POSTGRES_URI", os.getenv("DATABASE_URL", "")),
            snipeit_url=os.getenv("SNIPEIT_BASE_URL", ""),
            snipeit_token=os.getenv("SNIPEIT_API_TOKEN", ""),
            snipeit_timeout_seconds=int(os.getenv("SNIPEIT_TIMEOUT_SECONDS", "10")),
            snipeit_api_delay_ms=int(os.getenv("SNIPEIT_API_DELAY_MS", "100")),
            batch_size=int(os.getenv("MIGRATION_BATCH_SIZE", "100")),
            snipeit_category_map=category_map,
            snipeit_manufacturer_map=manufacturer_map,
            snipeit_default_category_id=int(os.getenv("SNIPEIT_DEFAULT_CATEGORY_ID", "1")),
            snipeit_default_manufacturer_id=int(os.getenv("SNIPEIT_DEFAULT_MANUFACTURER_ID", "1")),
        )
    
    def validate(self, skip_snipeit: bool = False, skip_db_validation: bool = False) -> list[str]:
        """Validate required settings and return list of errors."""
        errors = []

        if not self.dump_path.exists():
            errors.append(f"Dump file does not exist: {self.dump_path}")

        # Only validate database settings if not skipping
        if not skip_db_validation:
            if not self.postgres_uri:
                errors.append("POSTGRES_URI or DATABASE_URL environment variable is required")

        # Only validate Snipe-IT settings if not skipping
        if not skip_snipeit and not skip_db_validation:
            if not self.snipeit_url:
                errors.append("SNIPEIT_BASE_URL environment variable is required")

            if not self.snipeit_token:
                errors.append("SNIPEIT_API_TOKEN environment variable is required")

        return errors
