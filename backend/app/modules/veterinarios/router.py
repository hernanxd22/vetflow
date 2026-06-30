from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.core.security import get_current_user, CurrentUser
from app.modules.veterinarios.schemas import VeterinarioResponse, VeterinarioUpdate
from app.modules.veterinarios.service import list_veterinarios, update_veterinario

router = APIRouter(tags=["Veterinarios"])


def _require_admin(user: CurrentUser):
    if not user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo el admin puede acceder")


@router.get("/veterinarios/", response_model=List[VeterinarioResponse])
def get_veterinarios(
    estado: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    _require_admin(user)
    return list_veterinarios(db, estado)


@router.patch("/veterinarios/{veterinario_id}", response_model=VeterinarioResponse)
def patch_veterinario(
    veterinario_id: int,
    data: VeterinarioUpdate,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    _require_admin(user)
    return update_veterinario(veterinario_id, data, db)
