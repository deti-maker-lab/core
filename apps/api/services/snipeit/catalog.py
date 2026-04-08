# apps/api/services/snipeit/catalog.py

from typing import List, Dict, Optional
from services.snipeit.client import snipeit_client
from services.snipeit.mappers import SnipeITModel, SnipeITPaginatedResponse, SnipeITStatusLabel
from core.config import settings

def _get_deployable_status_labels() -> List[int]:
    """
    Fetches all status labels from Snipe-IT and resolves which IDs match the 
    names specified in SNIPEIT_DEPLOYABLE_STATUS_LABELS in config.
    """
    response = snipeit_client.get("/api/v1/statuslabels")
    paginated = SnipeITPaginatedResponse(**response)
    deployable_names = [name.strip().lower() for name in settings.SNIPEIT_DEPLOYABLE_STATUS_LABELS.split(",")]
    
    label_ids = []
    for row in paginated.rows:
        label = SnipeITStatusLabel(**row)
        if label.name.lower() in deployable_names or label.type == 'deployable':
             label_ids.append(label.id)
             
    return label_ids

def get_models(limit: int = 50, offset: int = 0) -> SnipeITPaginatedResponse:
    """Lists hardware models from Snipe-IT."""
    response = snipeit_client.get("/api/v1/models", params={"limit": limit, "offset": offset})
    return SnipeITPaginatedResponse(**response)

def get_model_details(model_id: int) -> SnipeITModel:
    """Gets details for a specific model."""
    response = snipeit_client.get(f"/api/v1/models/{model_id}")
    # Snipe-IT typically wraps single resource responses if there's no wrapper, it's just the dict
    return SnipeITModel(**response)

