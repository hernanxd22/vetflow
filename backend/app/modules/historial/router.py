from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.unit_of_work import UnitOfWork
from app.core.security import get_current_user, CurrentUser
from app.modules.historial.schemas import HistorialCreate, HistorialUpdate, HistorialResponse
from app.modules.historial.service import historial_service
from typing import List

router = APIRouter(tags=["Historial Médico"])


def get_uow(db: Session = Depends(get_db)) -> UnitOfWork:
    return UnitOfWork(db)


@router.get(
    "/mascotas/{mascota_id}/historial",
    response_model=List[HistorialResponse]
)
def listar_historial(mascota_id: int, uow: UnitOfWork = Depends(get_uow)):
    return historial_service.get_all(mascota_id, uow)


@router.post(
    "/mascotas/{mascota_id}/historial",
    response_model=HistorialResponse,
    status_code=201
)
def crear_historial(
    mascota_id: int,
    data: HistorialCreate,
    uow: UnitOfWork = Depends(get_uow),
    user: CurrentUser = Depends(get_current_user),
):
    if user.is_cliente:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tenés permiso para crear registros")
    return historial_service.create(mascota_id, data, uow)


@router.patch(
    "/historial/{historial_id}",
    response_model=HistorialResponse
)
def actualizar_historial(
    historial_id: int,
    data: HistorialUpdate,
    uow: UnitOfWork = Depends(get_uow),
    user: CurrentUser = Depends(get_current_user),
):
    if not user.puede_editar_historial:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo el admin puede editar registros")
    return historial_service.update(historial_id, data, uow)


@router.delete("/historial/{historial_id}")
def eliminar_historial(
    historial_id: int,
    uow: UnitOfWork = Depends(get_uow),
    user: CurrentUser = Depends(get_current_user),
):
    if not user.puede_editar_historial:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo el admin puede eliminar registros")
    return historial_service.delete(historial_id, uow)
