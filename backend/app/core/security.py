import logging
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database import get_db
from app.modules.auth.models import Cliente

logger = logging.getLogger(__name__)

# Fallback key so the API still starts when JWT_SECRET_KEY is missing.
# Tokens signed with it are invalidated on every restart, so it is only a
# development convenience: production must set JWT_SECRET_KEY.
_EPHEMERAL_SECRET = secrets.token_urlsafe(48)
if not settings.JWT_SECRET_KEY:
    logger.warning(
        "JWT_SECRET_KEY is not set. Using an ephemeral key: every restart will "
        "invalidate all active sessions. Set JWT_SECRET_KEY in the environment."
    )


def _signing_key() -> str:
    return settings.JWT_SECRET_KEY or _EPHEMERAL_SECRET


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login", auto_error=False)

_NOT_AUTHENTICATED = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="No autenticado",
    headers={"WWW-Authenticate": "Bearer"},
)


class CurrentUser:
    def __init__(self, cliente_id: int, rol: str, estado: str):
        self.cliente_id = cliente_id
        self.rol = rol
        self.estado = estado

    @property
    def is_admin(self) -> bool:
        return self.rol == "admin"

    @property
    def is_veterinario(self) -> bool:
        return self.rol == "veterinario"

    @property
    def is_cliente(self) -> bool:
        return self.rol == "cliente"

    @property
    def puede_editar_historial(self) -> bool:
        return self.rol == "admin"


def create_access_token(cliente_id: int) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(cliente_id),
        "iat": now,
        "exp": now + timedelta(minutes=settings.JWT_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, _signing_key(), algorithm=settings.JWT_ALGORITHM)


def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> CurrentUser:
    if not token:
        raise _NOT_AUTHENTICATED

    try:
        payload = jwt.decode(token, _signing_key(), algorithms=[settings.JWT_ALGORITHM])
        cliente_id = int(payload["sub"])
    except (jwt.PyJWTError, KeyError, TypeError, ValueError):
        raise _NOT_AUTHENTICATED

    # The role is read on every request instead of being trusted from the token,
    # so a role change in the database takes effect without a new login.
    user = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not user:
        raise _NOT_AUTHENTICATED

    if user.estado and user.estado != "activo":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="La cuenta está desactivada",
        )

    return CurrentUser(cliente_id=user.id, rol=user.rol, estado=user.estado)
