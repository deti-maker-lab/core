# apps/api/services/snipeit/client.py

import json
from urllib.parse import urljoin
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from core.config import settings
from services.snipeit.exceptions import (
    SnipeITAPIError,
    SnipeITAuthenticationError,
    SnipeITResourceNotFoundError,
    SnipeITConfigurationError
)

class SnipeITClient:
    """Synchronous HTTP Client for the Snipe-IT API."""
    
    def __init__(self):
        self.base_url = getattr(settings, 'SNIPEIT_BASE_URL', None)
        self.token = getattr(settings, 'SNIPEIT_API_TOKEN', None)
        self.timeout = getattr(settings, 'SNIPEIT_TIMEOUT_SECONDS', 10)
        
        if self.base_url:
            self.base_url = self.base_url.rstrip('/')
            
    def _get_session(self) -> requests.Session:
        if not self.base_url or not self.token:
            raise SnipeITConfigurationError("Snipe-IT URL or API Token is missing in configuration.")
            
        session = requests.Session()
        
        retry_strategy = Retry(
            total=3,
            backoff_factor=0.5,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        
        session.headers.update({
            "Authorization": f"Bearer {self.token}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        })
        return session
        
    def _handle_response(self, response: requests.Response) -> dict:
        """Parses the response and raises appropriate exceptions for errors."""
        try:
            if response.status_code == 401:
                raise SnipeITAuthenticationError("Invalid or missing Snipe-IT API token.")
            
            if response.status_code == 404:
                raise SnipeITResourceNotFoundError(f"Resource not found: {response.url}")
                
            response.raise_for_status()
            
            data = response.json()
            if isinstance(data, dict) and data.get("status") == "error":
                messages = data.get("messages", "Unknown Snipe-IT API error")
                raise SnipeITAPIError(f"Snipe-IT API Error: {messages}")
                
            return data
            
        except requests.exceptions.HTTPError as e:
            try:
                error_data = response.json()
                msg = error_data.get('messages', str(e))
                raise SnipeITAPIError(f"Snipe-IT API HTTP Error {response.status_code}: {msg}") from e
            except json.JSONDecodeError:
                raise SnipeITAPIError(f"Snipe-IT API HTTP Error {response.status_code}: {response.text}") from e
        except requests.exceptions.RequestException as e:
            raise SnipeITAPIError(f"Network error connecting to Snipe-IT: {str(e)}") from e

    def get(self, endpoint: str, params: dict = None) -> dict:
        session = self._get_session()
        url = urljoin(self.base_url, endpoint.lstrip('/'))
        resp = session.get(url, params=params, timeout=self.timeout, verify=False)
        return self._handle_response(resp)

    def post(self, endpoint: str, json_data: dict = None) -> dict:
        session = self._get_session()
        url = urljoin(self.base_url, endpoint.lstrip('/'))
        resp = session.post(url, json=json_data, timeout=self.timeout, verify=False)
        return self._handle_response(resp)
        
    def patch(self, endpoint: str, json_data: dict = None) -> dict:
        session = self._get_session()
        url = urljoin(self.base_url, endpoint.lstrip('/'))
        resp = session.patch(url, json=json_data, timeout=self.timeout, verify=False)
        return self._handle_response(resp)

# Global client singleton instance 
snipeit_client = SnipeITClient()
