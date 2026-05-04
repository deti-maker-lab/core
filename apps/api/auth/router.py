import os
from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import RedirectResponse
from .service import (
    get_oauth1_session,
    save_request_token,
    get_access_token,
    get_user_data,
    get_or_create_user,
    create_jwt_for_user,
    is_mobile_login,
    get_web_redirect,
    REQUEST_TOKEN_URL,
    AUTHORIZATION_URL,
    FRONTEND_URL,
)
from .dependencies import get_current_user
from .schemas import UserRead 

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/sso/login")
def sso_login():
    oauth = get_oauth1_session()
    fetch_response = oauth.fetch_request_token(REQUEST_TOKEN_URL)
    resource_owner_key    = fetch_response.get("oauth_token")
    resource_owner_secret = fetch_response.get("oauth_token_secret")
    save_request_token(resource_owner_key, resource_owner_secret)
    authorization_url = oauth.authorization_url(AUTHORIZATION_URL)
    return RedirectResponse(authorization_url)


@router.get("/sso/callback")
def sso_callback(oauth_token: str, oauth_verifier: str):
    is_mobile     = is_mobile_login(oauth_token)
    web_redirect  = get_web_redirect(oauth_token)
    
    try:
        resource_owner_key, resource_owner_secret = get_access_token(oauth_token, oauth_verifier)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    user_data = get_user_data(resource_owner_key, resource_owner_secret)
    user      = get_or_create_user(user_data)
    token     = create_jwt_for_user(user)

    if web_redirect:
        # Mobile web — redireciona para o frontend mobile web
        return RedirectResponse(f"{web_redirect}?token={token}")
    if is_mobile:
        # Nativo — deep link
        return RedirectResponse(f"detimakerlab://auth?token={token}")
    # Web normal
    return RedirectResponse(f"{FRONTEND_URL}/auth/callback?token={token}")

@router.get("/me", response_model=UserRead)
def get_me(current_user = Depends(get_current_user)):
    return current_user

@router.get("/sso/callback/mobile")
def sso_callback_mobile(oauth_token: str, oauth_verifier: str):
    """Callback específico para mobile — redireciona para deep link."""
    try:
        resource_owner_key, resource_owner_secret = get_access_token(oauth_token, oauth_verifier)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    user_data = get_user_data(resource_owner_key, resource_owner_secret)
    user      = get_or_create_user(user_data)
    token     = create_jwt_for_user(user)
    return RedirectResponse(f"detimakerlab://auth?token={token}")

@router.get("/sso/login/mobile")
def sso_login_mobile(web_redirect: str = ""):
    oauth = get_oauth1_session()
    fetch_response = oauth.fetch_request_token(REQUEST_TOKEN_URL)
    resource_owner_key    = fetch_response.get("oauth_token")
    resource_owner_secret = fetch_response.get("oauth_token_secret")
    save_request_token(resource_owner_key, resource_owner_secret)
    # Guarda se tem web_redirect (mobile a correr no browser)
    if web_redirect:
        save_request_token(f"web_redirect_{resource_owner_key}", web_redirect)
    else:
        save_request_token(f"mobile_{resource_owner_key}", "1")
    authorization_url = oauth.authorization_url(AUTHORIZATION_URL)
    return RedirectResponse(authorization_url)