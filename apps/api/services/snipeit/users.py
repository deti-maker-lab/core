# apps/api/services/snipeit/users.py

from typing import Optional
from services.snipeit.client import snipeit_client
from services.snipeit.mappers import SnipeITUser, SnipeITPaginatedResponse
import logging

logger = logging.getLogger(__name__)

def get_user_by_email(email: str) -> Optional[SnipeITUser]:
    """Finds a Snipe-IT user by their email address."""
    try:
        response = snipeit_client.get("/api/v1/users", params={"search": email, "limit": 1})
        paginated = SnipeITPaginatedResponse(**response)
        
        if paginated.total > 0 and len(paginated.rows) > 0:
            first_user = paginated.rows[0]
            # Verify it's an exact match
            if first_user.get("email", "").lower() == email.lower():
                return SnipeITUser(**first_user)
                
        return None
    except Exception as e:
        logger.error(f"Failed to fetch Snipe-IT user by email {email}: {str(e)}")
        raise
