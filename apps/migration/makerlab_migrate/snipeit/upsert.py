# apps/migration/makerlab_migrate/snipeit/upsert.py

import sys
import os
from typing import Optional, Dict, Any

# Add the apps/api directory to the path to import mappers
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../api"))
from services.snipeit.mappers import SnipeITUser, SnipeITModel, SnipeITAsset
from .client import DryRunSnipeITClient


def find_or_create_user(
    client: DryRunSnipeITClient,
    email: str,
    name: str,
    username: Optional[str] = None
) -> Optional[SnipeITUser]:
    """Find a user by email or create a new one in Snipe-IT."""
    if not email:
        return None

    # Try to find existing user via the wrapper (respects rate limiting)
    try:
        response = client.get("/api/v1/users", params={"search": email, "limit": 1})
        if "rows" in response and len(response["rows"]) > 0:
            first_user = response["rows"][0]
            # Verify it's an exact match
            if first_user.get("email", "").lower() == email.lower():
                return SnipeITUser(**first_user)
    except Exception:
        pass  # Continue to create if lookup fails

    # Create new user
    payload = {
        "first_name": name.split()[0] if name else "",
        "last_name": " ".join(name.split()[1:]) if name and len(name.split()) > 1 else "",
        "email": email,
        "username": username or email.split("@")[0],
        "password": "ChangeMe123!",  # Default password, user should change on first login
        "activated": True
    }

    response = client.post("/api/v1/users", json_data=payload)
    if response and "id" in response:
        return SnipeITUser(
            id=response["id"],
            username=payload["username"],
            name=name,
            email=email
        )

    return None


def find_model_by_model_number(client: DryRunSnipeITClient, model_number: str) -> Optional[SnipeITModel]:
    """Find a Snipe-IT model by model number."""
    try:
        response = client.get("/api/v1/models", params={"search": model_number, "limit": 10})
        
        if "rows" in response:
            for row in response["rows"]:
                if row.get("model_number", "").lower() == model_number.lower():
                    return SnipeITModel(**row)
        
        return None
    except Exception:
        return None


def find_asset_by_asset_tag(client: DryRunSnipeITClient, asset_tag: str) -> Optional[SnipeITAsset]:
    """Find a Snipe-IT asset by asset tag."""
    try:
        response = client.get("/api/v1/hardware", params={"search": asset_tag, "limit": 10})
        
        if "rows" in response:
            for row in response["rows"]:
                if row.get("asset_tag", "").lower() == asset_tag.lower():
                    return SnipeITAsset(**row)
        
        return None
    except Exception:
        return None


def create_model(
    client: DryRunSnipeITClient,
    name: str,
    model_number: str,
    category_id: int,
    manufacturer_id: int,
    price: Optional[float] = None
) -> Optional[SnipeITModel]:
    """Create a new model in Snipe-IT."""
    payload = {
        "name": name,
        "model_number": model_number,
        "category_id": category_id,
        "manufacturer_id": manufacturer_id,
    }
    
    if price is not None:
        payload["purchase_cost"] = str(price)
    
    response = client.post("/api/v1/models", json_data=payload)
    if response and "id" in response:
        return SnipeITModel(
            id=response["id"],
            name=name,
            model_number=model_number
        )
    
    return None


def create_asset(
    client: DryRunSnipeITClient,
    model_id: int,
    asset_tag: str,
    name: Optional[str] = None,
    location: Optional[str] = None
) -> Optional[SnipeITAsset]:
    """Create a new asset in Snipe-IT."""
    payload = {
        "model_id": model_id,
        "asset_tag": asset_tag,
        "status_id": 1,  # Default to "Ready to Deploy" or similar
    }
    
    if name:
        payload["name"] = name
    
    if location:
        payload["location"] = location
    
    response = client.post("/api/v1/hardware", json_data=payload)
    if response and "id" in response:
        return SnipeITAsset(
            id=response["id"],
            asset_tag=asset_tag,
            name=name
        )
    
    return None
