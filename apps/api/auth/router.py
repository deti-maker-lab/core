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
    try:
        resource_owner_key, resource_owner_secret = get_access_token(oauth_token, oauth_verifier)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    user_data = get_user_data(resource_owner_key, resource_owner_secret)
    user      = get_or_create_user(user_data)
    token     = create_jwt_for_user(user)

    return RedirectResponse(f"{FRONTEND_URL}/auth/callback?token={token}")

@router.get("/me", response_model=UserRead)
def get_me(current_user = Depends(get_current_user)):
    return current_user