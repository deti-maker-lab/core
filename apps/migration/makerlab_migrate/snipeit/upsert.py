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
        "password_confirmation": "ChangeMe123!",  # Password confirmation required by Snipe-IT API
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


def update_model(
    client: DryRunSnipeITClient,
    model_id: int,
    name: str,
    model_number: str,
    category_id: int,
    manufacturer_id: int,
    price: Optional[float] = None
) -> Optional[SnipeITModel]:
    """Update an existing model in Snipe-IT."""
    payload = {
        "name": name,
        "model_number": model_number,
        "category_id": category_id,
        "manufacturer_id": manufacturer_id,
    }
    
    if price is not None:
        payload["purchase_cost"] = str(price)
    
    response = client.patch(f"/api/v1/models/{model_id}", json_data=payload)
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
    location: Optional[str] = None,
    price: Optional[float] = None
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
    
    if price is not None:
        payload["purchase_cost"] = str(price)
    
    response = client.post("/api/v1/hardware", json_data=payload)
    if response and "id" in response:
        return SnipeITAsset(
            id=response["id"],
            asset_tag=asset_tag,
            name=name,
            last_checkout=None,
            last_checkin=None,
            expected_checkin=None
        )
    
    return None


def update_asset(
    client: DryRunSnipeITClient,
    asset_id: int,
    location: Optional[str] = None,
    price: Optional[float] = None
) -> Optional[SnipeITAsset]:
    """Update an existing asset in Snipe-IT."""
    payload = {}
    
    if location:
        payload["location"] = location
    
    if price is not None:
        payload["purchase_cost"] = str(price)
    
    if not payload:
        return None  # Nothing to update
    
    response = client.patch(f"/api/v1/hardware/{asset_id}", json_data=payload)
    if response and "id" in response:
        return SnipeITAsset(
            id=response["id"],
            asset_tag=response.get("asset_tag", ""),
            name=response.get("name"),
            last_checkout=None,
            last_checkin=None,
            expected_checkin=None
        )
    
    return None


def normalize_category_name(name: str) -> str:
    """Normalize category name by stripping whitespace and handling common variations."""
    if not name:
        return "Uncategorized"
    
    # Strip all whitespace including newlines and carriage returns
    normalized = name.strip()
    # Remove any remaining \r or \n characters (actual characters)
    normalized = normalized.replace('\r', '').replace('\n', '')
    # Also remove literal \r\n strings (escaped backslash-r-backslash-n)
    normalized = normalized.replace('\\r', '').replace('\\n', '')
    # Remove trailing special characters like -, *, etc.
    normalized = normalized.rstrip('-*').strip()
    
    # Handle empty after stripping
    if not normalized:
        return "Uncategorized"
    
    # Capitalize first letter
    normalized = normalized[0].upper() + normalized[1:] if len(normalized) > 1 else normalized.upper()
    
    return normalized


def normalize_manufacturer_name(name: str) -> str:
    """Normalize manufacturer name by stripping whitespace and handling common variations."""
    if not name:
        return "Unknown"
    
    # Strip all whitespace including newlines and carriage returns
    normalized = name.strip()
    # Remove any remaining \r or \n characters (actual characters)
    normalized = normalized.replace('\r', '').replace('\n', '')
    # Also remove literal \r\n strings (escaped backslash-r-backslash-n)
    normalized = normalized.replace('\\r', '').replace('\\n', '')
    # Remove trailing special characters like -, *, etc.
    normalized = normalized.rstrip('-*').strip()
    
    # Handle empty after stripping
    if not normalized:
        return "Unknown"
    
    # Capitalize first letter
    normalized = normalized[0].upper() + normalized[1:] if len(normalized) > 1 else normalized.upper()
    
    # Handle common variations
    variations = {
        "Farnell": "Farnell",
        "Digikey": "Digi-Key",
        "Digi Key": "Digi-Key",
        "Esite": "Esite",
        "ESITE": "Esite",
        "Beeverycreative": "BeeVeryCreative",
        "BeeVeryCreative": "BeeVeryCreative",
        "Mouser": "Mouser",
        "Mauser": "Mouser",
        "Robert Mauser": "Mouser",
        "SAR": "SAR",
    }
    
    # Case-insensitive lookup
    lower_normalized = normalized.lower()
    for key, value in variations.items():
        if key.lower() == lower_normalized:
            return value
    
    return normalized


# Simple in-memory caches for categories and manufacturers to avoid repeated API calls
_category_cache: Dict[str, Optional[int]] = {}
_manufacturer_cache: Dict[str, Optional[int]] = {}


def cleanup_categories_and_manufacturers(client: DryRunSnipeITClient) -> None:
    """Delete all categories (except default) and manufacturers to ensure clean migration."""
    if client.dry_run:
        return
    
    try:
        # Delete all categories except the default one (ID 1)
        response = client.get("/api/v1/categories")
        if "rows" in response:
            for category in response["rows"]:
                if category["id"] != 1:  # Keep the default category
                    try:
                        client.delete(f"/api/v1/categories/{category['id']}")
                    except Exception:
                        pass  # Ignore deletion errors
        
        # Delete all manufacturers
        response = client.get("/api/v1/manufacturers")
        if "rows" in response:
            for manufacturer in response["rows"]:
                try:
                    client.delete(f"/api/v1/manufacturers/{manufacturer['id']}")
                except Exception:
                    pass  # Ignore deletion errors
        
        # Clear caches
        _category_cache.clear()
        _manufacturer_cache.clear()
    except Exception:
        pass  # Ignore cleanup errors


def find_or_create_category(
    client: DryRunSnipeITClient,
    name: str,
    category_type: str = "asset"
) -> Optional[int]:
    """Find a category by name or create a new one in Snipe-IT. Returns category ID."""
    normalized_name = normalize_category_name(name)
    
    # Check cache first
    if normalized_name in _category_cache:
        return _category_cache[normalized_name]
    
    # Try to find existing category
    try:
        response = client.get("/api/v1/categories", params={"search": normalized_name, "limit": 10})
        
        if "rows" in response:
            for row in response["rows"]:
                # Normalize the existing category name for comparison
                existing_name = normalize_category_name(row.get("name", ""))
                if existing_name == normalized_name:
                    _category_cache[normalized_name] = row["id"]
                    return row["id"]
    except Exception as e:
        # Log but continue to create if lookup fails
        if client.logger:
            client.logger.warning(f"Category lookup failed for '{normalized_name}': {str(e)}")
    
    # Create new category
    payload = {
        "name": normalized_name,
        "category_type": category_type,
    }
    
    try:
        response = client.post("/api/v1/categories", json_data=payload)
        if response and "payload" in response and "id" in response["payload"]:
            _category_cache[normalized_name] = response["payload"]["id"]
            return response["payload"]["id"]
        elif response and "id" in response:
            _category_cache[normalized_name] = response["id"]
            return response["id"]
        else:
            if client.logger:
                client.logger.error(f"Category creation failed for '{normalized_name}': No ID in response: {response}")
    except Exception as e:
        # If creation failed due to "already exists", retry lookup
        error_str = str(e).lower()
        if "already been taken" in error_str or "must be unique" in error_str:
            if client.logger:
                client.logger.info(f"Category '{normalized_name}' already exists, retrying lookup")
            try:
                response = client.get("/api/v1/categories", params={"search": normalized_name, "limit": 10})
                if "rows" in response:
                    for row in response["rows"]:
                        # Normalize the existing category name for comparison
                        existing_name = normalize_category_name(row.get("name", ""))
                        if existing_name == normalized_name:
                            _category_cache[normalized_name] = row["id"]
                            return row["id"]
            except Exception:
                pass
        if client.logger:
            client.logger.error(f"Category creation failed for '{normalized_name}': {str(e)}")
    
    # Cache the failure to avoid repeated attempts
    _category_cache[normalized_name] = None
    return None


def find_or_create_manufacturer(
    client: DryRunSnipeITClient,
    name: str
) -> Optional[int]:
    """Find a manufacturer by name or create a new one in Snipe-IT. Returns manufacturer ID."""
    normalized_name = normalize_manufacturer_name(name)
    
    # Check cache first
    if normalized_name in _manufacturer_cache:
        return _manufacturer_cache[normalized_name]
    
    # Try to find existing manufacturer
    try:
        response = client.get("/api/v1/manufacturers", params={"search": normalized_name, "limit": 10})
        
        if "rows" in response:
            for row in response["rows"]:
                # Normalize the existing manufacturer name for comparison
                existing_name = normalize_manufacturer_name(row.get("name", ""))
                if existing_name == normalized_name:
                    _manufacturer_cache[normalized_name] = row["id"]
                    return row["id"]
    except Exception as e:
        # Log but continue to create if lookup fails
        if client.logger:
            client.logger.warning(f"Manufacturer lookup failed for '{normalized_name}': {str(e)}")
    
    # Create new manufacturer
    payload = {
        "name": normalized_name,
    }
    
    try:
        response = client.post("/api/v1/manufacturers", json_data=payload)
        if response and "payload" in response and "id" in response["payload"]:
            _manufacturer_cache[normalized_name] = response["payload"]["id"]
            return response["payload"]["id"]
        elif response and "id" in response:
            _manufacturer_cache[normalized_name] = response["id"]
            return response["id"]
        else:
            if client.logger:
                client.logger.error(f"Manufacturer creation failed for '{normalized_name}': No ID in response: {response}")
    except Exception as e:
        # If creation failed due to "already exists", retry lookup
        error_str = str(e).lower()
        if "already been taken" in error_str or "must be unique" in error_str:
            if client.logger:
                client.logger.info(f"Manufacturer '{normalized_name}' already exists, retrying lookup")
            try:
                response = client.get("/api/v1/manufacturers", params={"search": normalized_name, "limit": 10})
                if "rows" in response:
                    for row in response["rows"]:
                        # Normalize the existing manufacturer name for comparison
                        existing_name = normalize_manufacturer_name(row.get("name", ""))
                        if existing_name == normalized_name:
                            _manufacturer_cache[normalized_name] = row["id"]
                            return row["id"]
            except Exception:
                pass
        if client.logger:
            client.logger.error(f"Manufacturer creation failed for '{normalized_name}': {str(e)}")
    
    # Cache the failure to avoid repeated attempts
    _manufacturer_cache[normalized_name] = None
    return None
