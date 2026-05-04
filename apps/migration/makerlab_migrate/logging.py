# apps/migration/makerlab_migrate/logging.py

import logging
import sys
from typing import Any
from datetime import datetime


class MigrationLogger:
    """Structured logger for migration operations."""
    
    def __init__(self, name: str = "makerlab_migrate", verbose: bool = False):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.DEBUG if verbose else logging.INFO)
        
        # Clear existing handlers
        self.logger.handlers.clear()
        
        # Console handler
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(logging.DEBUG if verbose else logging.INFO)
        
        # Formatter
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
    
    def info(self, msg: str, **kwargs: Any) -> None:
        """Log info message with optional structured data."""
        if kwargs:
            self.logger.info(f"{msg} | {kwargs}")
        else:
            self.logger.info(msg)
    
    def warning(self, msg: str, **kwargs: Any) -> None:
        """Log warning message with optional structured data."""
        if kwargs:
            self.logger.warning(f"{msg} | {kwargs}")
        else:
            self.logger.warning(msg)
    
    def error(self, msg: str, **kwargs: Any) -> None:
        """Log error message with optional structured data."""
        if kwargs:
            self.logger.error(f"{msg} | {kwargs}")
        else:
            self.logger.error(msg)
    
    def debug(self, msg: str, **kwargs: Any) -> None:
        """Log debug message with optional structured data."""
        if kwargs:
            self.logger.debug(f"{msg} | {kwargs}")
        else:
            self.logger.debug(msg)
    
    def log_entity_action(
        self,
        entity_type: str,
        legacy_id: int,
        action: str,
        target_id: int = None,
        reason: str = None
    ) -> None:
        """Log a standardized entity action."""
        data = {
            "entity": entity_type,
            "legacy_id": legacy_id,
            "action": action,
        }
        if target_id:
            data["target_id"] = target_id
        if reason:
            data["reason"] = reason
        
        self.info(f"{entity_type.title()} {action}", **data)
    
    def log_summary(
        self,
        entity_type: str,
        inserted: int = 0,
        updated: int = 0,
        skipped: int = 0,
        errors: int = 0
    ) -> None:
        """Log a summary of operations for an entity type."""
        self.info(
            f"{entity_type.title()} migration summary",
            entity=entity_type,
            inserted=inserted,
            updated=updated,
            skipped=skipped,
            errors=errors
        )


def setup_logging(verbose: bool = False) -> MigrationLogger:
    """Set up and return a migration logger."""
    return MigrationLogger(verbose=verbose)
