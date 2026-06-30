from fastapi import Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.modules.auth.models import Cliente


class CurrentUser:
    def __init__(self, cliente_id: int, rol: str):
        self.cliente_id = cliente_id
        self.rol = rol

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


def get_current_user(
    cliente_id: int = Query(...),
    db: Session = Depends(get_db),
) -> CurrentUser:
    user = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado"
        )
    return CurrentUser(cliente_id=user.id, rol=user.rol)
