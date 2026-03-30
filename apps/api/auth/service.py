# core/apps/api/auth/service.py

import datetime
import requests
from requests import Session
from requests_oauthlib import OAuth1Session
from requests.adapters import HTTPAdapter
from urllib3.poolmanager import PoolManager
from db.models import User
from db.database import get_session
from dotenv import load_dotenv
import jwt
import os
import ssl

load_dotenv()

REQUEST_TOKEN_URL = "https://identity.ua.pt/oauth/request_token"
AUTHORIZATION_URL = "https://identity.ua.pt/oauth/authorize"
ACCESS_TOKEN_URL = "https://identity.ua.pt/oauth/access_token"
PROTECTED_URL = "https://identity.ua.pt/oauth/get_data"

CLIENT_KEY = os.getenv("DML_AUTH_KEY")
CLIENT_SECRET = os.getenv("DML_AUTH_SECRET")
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

if not CLIENT_KEY or not CLIENT_SECRET or not SECRET_KEY:
    raise RuntimeError("DML_AUTH_KEY, DML_AUTH_SECRET e JWT_SECRET_KEY devem estar definidos no .env")

__owner_resources = {}

class TLSAdapter(HTTPAdapter):
    def __init__(self, ssl_context=None, **kwargs):
        self.ssl_context = ssl_context
        super().__init__(**kwargs)

    def init_poolmanager(self, *args, **kwargs):
        kwargs["ssl_context"] = self.ssl_context
        self.poolmanager = PoolManager(*args, **kwargs)

def get_oauth1_session(resource_owner_key=None, resource_owner_secret=None):
    ssl_context = ssl.create_default_context()
    ssl_context.set_ciphers("DEFAULT@SECLEVEL=1")

    oauth = OAuth1Session(
        client_key=CLIENT_KEY,
        client_secret=CLIENT_SECRET,
        resource_owner_key=resource_owner_key,
        resource_owner_secret=resource_owner_secret,
        callback_uri="http://localhost:8000/auth/sso/callback"
    )

    adapter = TLSAdapter(ssl_context)
    oauth.mount("https://", adapter)

    return oauth

def save_request_token(key, secret):
    now = datetime.datetime.now()
    __owner_resources[key] = (now, secret) 

def get_access_token(oauth_token, oauth_verifier):
    resource_owner_key, resource_owner_secret = __owner_resources.pop(oauth_token)
    oauth = get_oauth1_session(resource_owner_key, resource_owner_secret)
    tokens = oauth.fetch_access_token(ACCESS_TOKEN_URL, verifier=oauth_verifier)
    return tokens["oauth_token"], tokens["oauth_token_secret"]

def get_user_data(resource_owner_key, resource_owner_secret):
    oauth = get_oauth1_session(resource_owner_key, resource_owner_secret)
    r = oauth.get(f"{PROTECTED_URL}?scope=uu&format=json")
    r.raise_for_status()
    data = r.json()
    return {
        "email": data["email"],
        "first_name": data.get("first_name", ""),
        "last_name": data.get("last_name", "")
    }

def get_or_create_user(user_data):
    db = get_session()
    try:
        user = db.query(User).filter_by(email=user_data["email"]).first()
        if not user:
            user = User(
                username=user_data["email"].split("@")[0],
                email=user_data["email"],
                first_name=user_data["first_name"],
                last_name=user_data["last_name"],
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        return user
    finally:
        db.close()

def create_jwt_for_user(user):
    payload = {"sub": user.username}
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token