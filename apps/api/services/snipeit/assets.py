# apps/api/services/snipeit/assets.py

from typing import List, Optional
from services.snipeit.client import snipeit_client
from services.snipeit.mappers import SnipeITAsset, SnipeITPaginatedResponse
from services.snipeit.catalog import _get_deployable_status_labels

def get_available_assets_for_model(model_id: int) -> List[SnipeITAsset]:
    """Finds available (deployable) physical assets for a given Snipe-IT model ID."""
    deployable_ids = _get_deployable_status_labels()
    
    if not deployable_ids:
        # Fallback if no specific config matched, request those labeled 'deployable' 
        # (Though SnipeIT search by status type isn't always reliable without the ID)
        status_param = "deployable"
    else:
        # Note: SnipeIT allows filtering by status_id. If multiple, we might need multiple queries
        # or grab all for the model and filter in memory. We'll grab all for the model and filter.
        status_param = None
        
    response = snipeit_client.get("/api/v1/hardware", params={
        "model_id": model_id,
        "status": status_param,
        "limit": 200 # Arbitrary large number to find available ones
    })
    
    paginated = SnipeITPaginatedResponse(**response)
    assets = [SnipeITAsset(**row) for row in paginated.rows]
    
    # Filter only those that are deployable and not already checked out
    available_assets = []
    for asset in assets:
        is_deployable = False
        if asset.status_label:
            if asset.status_label.id in deployable_ids:
                is_deployable = True
                
        if is_deployable and not asset.assigned_to:
            available_assets.append(asset)
            
    return available_assets

def checkout_asset(asset_id: int, user_id: int, checkout_node: str = None) -> dict:
    """
    Checks out an asset to a specific Snipe-IT user.
    """
    payload = {
        "checkout_to_type": "user",
        "assigned_user": user_id,
        "note": checkout_node or "Checked out via DETI Maker Lab."
    }
    return snipeit_client.post(f"/api/v1/hardware/{asset_id}/checkout", json_data=payload)

def checkin_asset(asset_id: int, checkin_note: str = None) -> dict:
    """
    Checks an asset back in.
    """
    payload = {
        "note": checkin_note or "Checked in via DETI Maker Lab."
    }
    return snipeit_client.post(f"/api/v1/hardware/{asset_id}/checkin", json_data=payload)

def get_asset(asset_id: int) -> SnipeITAsset:
    """Gets details of a single Snipe-IT asset."""
    response = snipeit_client.get(f"/api/v1/hardware/{asset_id}")
    return SnipeITAsset(**response)

def list_assets(limit: int = 500, offset: int = 0) -> SnipeITPaginatedResponse:
    """Lists Snipe-IT hardware assets."""
    response = snipeit_client.get("/api/v1/hardware", params={
        "limit": limit,
        "offset": offset,
    })
    return SnipeITPaginatedResponse(**response)
