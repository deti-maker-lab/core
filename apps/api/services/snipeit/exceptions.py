# apps/api/services/snipeit/exceptions.py

class SnipeITAPIError(Exception):
    """Base exception for Snipe-IT errors."""
    pass

class SnipeITAuthenticationError(SnipeITAPIError):
    """Raised when Snipe-IT returns a 401 Unauthorized."""
    pass

class SnipeITAssetUnavailableError(SnipeITAPIError):
    """Raised when attempting to check out an asset that is not deployable or already checked out."""
    pass

class SnipeITResourceNotFoundError(SnipeITAPIError):
    """Raised when a requested resource (user, asset, model) is not found (404)."""
    pass

class SnipeITConfigurationError(SnipeITAPIError):
    """Raised when there is a configuration issue preventing Snipe-IT communication."""
    pass
