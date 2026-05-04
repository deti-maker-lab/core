# apps/migration/makerlab_migrate/orchestration/state.py

import json
from pathlib import Path
from typing import Optional, Dict, Any
from datetime import datetime


class MigrationState:
    """Manages incremental migration state using a local JSON file."""
    
    def __init__(self, state_dir: Path = None):
        if state_dir is None:
            state_dir = Path(__file__).parent.parent.parent / ".state"
        
        self.state_dir = state_dir
        self.state_dir.mkdir(exist_ok=True)
        self.state_file = self.state_dir / "migration_state.json"
        self._state: Dict[str, Any] = self._load_state()
    
    def _load_state(self) -> Dict[str, Any]:
        """Load state from file."""
        if self.state_file.exists():
            try:
                with open(self.state_file, "r") as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError):
                return {}
        return {}
    
    def _save_state(self) -> None:
        """Save state to file."""
        with open(self.state_file, "w") as f:
            json.dump(self._state, f, indent=2, default=str)
    
    def get_last_legacy_id(self, entity_type: str) -> Optional[int]:
        """Get the last processed legacy ID for an entity type."""
        return self._state.get(entity_type, {}).get("last_legacy_id")
    
    def save_checkpoint(self, entity_type: str, last_legacy_id: int) -> None:
        """Save a checkpoint for an entity type."""
        if entity_type not in self._state:
            self._state[entity_type] = {}
        
        self._state[entity_type]["last_legacy_id"] = last_legacy_id
        self._state[entity_type]["updated_at"] = datetime.utcnow().isoformat()
        self._save_state()
    
    def reset_entity(self, entity_type: str) -> None:
        """Reset the checkpoint for an entity type."""
        if entity_type in self._state:
            del self._state[entity_type]
            self._save_state()
    
    def reset_all(self) -> None:
        """Reset all checkpoints."""
        self._state = {}
        self._save_state()
    
    def get_state(self) -> Dict[str, Any]:
        """Get the full state."""
        return self._state.copy()
