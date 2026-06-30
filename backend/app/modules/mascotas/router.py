from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.unit_of_work import UnitOfWork
from app.core.security import get_current_user, CurrentUser
from app.modules.mascotas.schemas import MascotaCreate, MascotaUpdate, MascotaResponse
from app.modules.mascotas.service import mascota_service
from typing import List

router = APIRouter(prefix="/mascotas", tags=["Mascotas"])

def get_uow(db: Session = Depends(get_db)) -> UnitOfWork:
    return UnitOfWork(db)

@router.get("/todas", response_model=List[MascotaResponse])
def get_todas_mascotas(uow: UnitOfWork = Depends(get_uow)):
    return mascota_service.get_all_mascotas(uow)

@router.post("/", response_model=MascotaResponse, status_code=201)
def create_mascota(cliente_id: int, data: MascotaCreate, uow: UnitOfWork = Depends(get_uow)):
    return mascota_service.create(cliente_id, data, uow)

@router.get("/", response_model=List[MascotaResponse])
def get_mascotas(cliente_id: int, uow: UnitOfWork = Depends(get_uow)):
    return mascota_service.get_all(cliente_id, uow)

@router.patch("/{mascota_id}", response_model=MascotaResponse)
def update_mascota(mascota_id: int, cliente_id: int, data: MascotaUpdate, uow: UnitOfWork = Depends(get_uow)):
    return mascota_service.update(mascota_id, cliente_id, data, uow)

@router.delete("/{mascota_id}")
def delete_mascota(mascota_id: int, cliente_id: int, uow: UnitOfWork = Depends(get_uow)):
    return mascota_service.delete(mascota_id, cliente_id, uow)