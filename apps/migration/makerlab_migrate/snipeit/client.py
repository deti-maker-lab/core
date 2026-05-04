# apps/migration/makerlab_migrate/snipeit/client.py

import time
import sys
import os
from typing import Optional, Dict, Any
from functools import wraps
from urllib.parse import urljoin
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Add the apps/api directory to the path to import exceptions
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../api"))
from services.snipeit.exceptions import SnipeITAPIError


class DryRunSnipeITClient:
    """Wrapper around Snipe-IT API that supports dry-run mode and uses migration settings."""

    def __init__(
        self,
        base_url: str,
        token: str,
        dry_run: bool = False,
        api_delay_ms: int = 100,
        timeout: int = 10,
        logger=None
    ):
        self.base_url = base_url.rstrip('/')
        self.token = token
        self.dry_run = dry_run
        self.api_delay_ms = api_delay_ms
        self.timeout = timeout
        self._mock_id_counter = -1  # Negative IDs for dry-run mode
        self.logger = logger

    def _get_session(self) -> requests.Session:
        """Create a requests session with retry logic."""
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
                raise SnipeITAPIError("Invalid or missing Snipe-IT API token.")

            if response.status_code == 404:
                raise SnipeITAPIError(f"Resource not found: {response.url}")

            response.raise_for_status()

            data = response.json()
            if isinstance(data, dict) and data.get("status") == "error":
                messages = data.get("messages", "Unknown Snipe-IT API error")
                raise SnipeITAPIError(f"Snipe-IT API Error: {messages}")

            return data

        except requests.exceptions.HTTPError as e:
            try:
                import json
                error_data = response.json()
                msg = error_data.get('messages', str(e))
                raise SnipeITAPIError(f"Snipe-IT API HTTP Error {response.status_code}: {msg}") from e
            except:
                raise SnipeITAPIError(f"Snipe-IT API HTTP Error {response.status_code}: {response.text}") from e
        except requests.exceptions.RequestException as e:
            raise SnipeITAPIError(f"Network error connecting to Snipe-IT: {str(e)}") from e

    def _delay(self) -> None:
        """Add delay between API calls for rate limiting."""
        if self.api_delay_ms > 0:
            time.sleep(self.api_delay_ms / 1000.0)

    def _get_mock_id(self) -> int:
        """Generate a mock ID for dry-run mode."""
        self._mock_id_counter -= 1
        return self._mock_id_counter

    def get(self, endpoint: str, params: Dict = None) -> Dict[str, Any]:
        """Perform GET request (always executed, even in dry-run)."""
        self._delay()
        session = self._get_session()
        url = urljoin(self.base_url, endpoint.lstrip('/'))
        resp = session.get(url, params=params, timeout=self.timeout, verify=False)
        return self._handle_response(resp)

    def post(self, endpoint: str, json_data: Dict = None) -> Dict[str, Any]:
        """Perform POST request (skipped in dry-run, returns mock response)."""
        if self.dry_run:
            if self.logger:
                self.logger.info(f"[DRY-RUN] POST {endpoint}", payload=json_data)
            else:
                print(f"[DRY-RUN] POST {endpoint} | Payload: {json_data}")
            return {"id": self._get_mock_id(), "status": "success"}

        self._delay()
        session = self._get_session()
        url = urljoin(self.base_url, endpoint.lstrip('/'))
        resp = session.post(url, json=json_data, timeout=self.timeout, verify=False)
        return self._handle_response(resp)

    def patch(self, endpoint: str, json_data: Dict = None) -> Dict[str, Any]:
        """Perform PATCH request (skipped in dry-run, returns mock response)."""
        if self.dry_run:
            if self.logger:
                self.logger.info(f"[DRY-RUN] PATCH {endpoint}", payload=json_data)
            else:
                print(f"[DRY-RUN] PATCH {endpoint} | Payload: {json_data}")
            return {"id": self._get_mock_id(), "status": "success"}

        self._delay()
        session = self._get_session()
        url = urljoin(self.base_url, endpoint.lstrip('/'))
        resp = session.patch(url, json=json_data, timeout=self.timeout, verify=False)
        return self._handle_response(resp)


def create_snipeit_gateway(
    base_url: str,
    token: str,
    dry_run: bool = False,
    api_delay_ms: int = 100,
    timeout: int = 10,
    logger=None
) -> DryRunSnipeITClient:
    """Create a Snipe-IT gateway with dry-run support using migration settings."""
    return DryRunSnipeITClient(
        base_url=base_url,
        token=token,
        dry_run=dry_run,
        api_delay_ms=api_delay_ms,
        timeout=timeout,
        logger=logger
    )
