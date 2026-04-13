import os
import ssl
import jwt
from sqlmodel import select
from requests_oauthlib import OAuth1Session
from requests.adapters import HTTPAdapter
from urllib3.poolmanager import PoolManager
from db.models import User
from db.database import get_session
from dotenv import load_dotenv

load_dotenv()

REQUEST_TOKEN_URL = "https://identity.ua.pt/oauth/request_token"
AUTHORIZATION_URL = "https://identity.ua.pt/oauth/authorize"
ACCESS_TOKEN_URL  = "https://identity.ua.pt/oauth/access_token"
PROTECTED_URL     = "https://identity.ua.pt/oauth/get_data"

CLIENT_KEY   = os.getenv("DML_AUTH_KEY")
CLIENT_SECRET = os.getenv("DML_AUTH_SECRET")
SECRET_KEY   = os.getenv("JWT_SECRET_KEY")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://localhost:3000")

if not CLIENT_KEY or not CLIENT_SECRET or not SECRET_KEY:
    raise RuntimeError("DML_AUTH_KEY, DML_AUTH_SECRET e JWT_SECRET_KEY devem estar definidos no .env")

# Guarda oauth_token → oauth_token_secret durante o fluxo OAuth
__owner_resources: dict[str, str] = {}


class TLSAdapter(HTTPAdapter):
    def __init__(self, ssl_context=None, **kwargs):
        self.ssl_context = ssl_context
        super().__init__(**kwargs)

    def init_poolmanager(self, *args, **kwargs):
        kwargs["ssl_context"] = self.ssl_context
        self.poolmanager = PoolManager(*args, **kwargs)


def _make_ssl_context():
    ctx = ssl.create_default_context()
    ctx.set_ciphers("DEFAULT@SECLEVEL=1")
    return ctx


def get_oauth1_session(resource_owner_key=None, resource_owner_secret=None):
    oauth = OAuth1Session(
        client_key=CLIENT_KEY,
        client_secret=CLIENT_SECRET,
        resource_owner_key=resource_owner_key,
        resource_owner_secret=resource_owner_secret,
    )
    oauth.mount("https://", TLSAdapter(_make_ssl_context()))
    return oauth


def save_request_token(key: str, secret: str):
    __owner_resources[key] = secret


def get_access_token(oauth_token: str, oauth_verifier: str):
    resource_owner_secret = __owner_resources.pop(oauth_token, None)
    if resource_owner_secret is None:
        raise ValueError(f"Token desconhecido ou já usado: {oauth_token}")
    oauth = get_oauth1_session(oauth_token, resource_owner_secret)
    tokens = oauth.fetch_access_token(ACCESS_TOKEN_URL, verifier=oauth_verifier)
    return tokens["oauth_token"], tokens["oauth_token_secret"]


def get_user_data(resource_owner_key: str, resource_owner_secret: str):
    oauth = get_oauth1_session(resource_owner_key, resource_owner_secret)

    r_uu = oauth.get(f"{PROTECTED_URL}?scope=uu&format=json")
    r_uu.raise_for_status()
    data_uu = r_uu.json()

    r_name = oauth.get(f"{PROTECTED_URL}?scope=name&format=json")
    r_name.raise_for_status()
    data_name = r_name.json()

    r_student = oauth.get(f"{PROTECTED_URL}?scope=student_info&format=json")
    r_student.raise_for_status()
    student_info = r_student.json().get("NewDataSet", {}).get("ObterDadosAluno", {})

    return {
        "email":         data_uu.get("email", ""),
        "iupi":          data_uu.get("iupi", ""),
        "name":          data_name.get("name", ""),
        "surname":       data_name.get("surname", ""),
        "nmec":          student_info.get("NMec", ""),
        "course":        student_info.get("Curso", ""),
        "academic_year": student_info.get("AnoCurricular", ""),
    }


def get_or_create_user(user_data: dict):
    db = next(get_session())
    try:
        user = db.exec(select(User).where(User.email == user_data["email"])).first()
        if not user:
            full_name = f"{user_data.get('name', '')} {user_data.get('surname', '')}".strip()
            user = User(
                name=full_name or user_data["email"].split("@")[0],
                email=user_data["email"],
                role="student",
                nmec=user_data.get("nmec") or user_data.get("iupi"),
                course=user_data.get("course"),
                academic_year=user_data.get("academic_year"),
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        return user
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

def create_jwt_for_user(user: User) -> str:
    payload = {"sub": user.email}
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")