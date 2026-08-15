from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.core.security import get_current_user, CurrentUser
from app.modules.citas.schemas import CitaClienteResponse, CitaAdminResponse, CitaVetResponse
from app.modules.citas.service import get_citas_cliente, get_citas_admin, get_citas_veterinario

router = APIRouter(prefix="/citas", tags=["Citas"])


@router.get("/", response_model=List[CitaClienteResponse])
def citas_cliente(
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    return get_citas_cliente(user.cliente_id, db)


@router.get("/admin", response_model=List[CitaAdminResponse])
def citas_admin(
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el admin puede ver el calendario general",
        )
    return get_citas_admin(db)


@router.get("/mis-citas-vet", response_model=List[CitaVetResponse])
def citas_veterinario(
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    if not user.is_veterinario:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo veterinarios")
    return get_citas_veterinario(user.cliente_id, db)
