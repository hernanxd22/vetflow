from fastapi import HTTPException, status
from app.core.unit_of_work import UnitOfWork
from app.modules.historial.schemas import HistorialCreate, HistorialUpdate, HistorialResponse, TIPOS_VALIDOS
from typing import List


class HistorialService:

    def get_all(self, mascota_id: int, uow: UnitOfWork) -> List[HistorialResponse]:
        registros = uow.historial.get_all_by_mascota(mascota_id)
        return [HistorialResponse.model_validate(r) for r in registros]

    def create(self, mascota_id: int, data: HistorialCreate, uow: UnitOfWork) -> HistorialResponse:
        if data.tipo not in TIPOS_VALIDOS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tipo inválido. Debe ser uno de: {', '.join(TIPOS_VALIDOS)}"
            )
        with uow:
            registro = uow.historial.create(mascota_id, data)
            return HistorialResponse.model_validate(registro)

    def update(self, historial_id: int, data: HistorialUpdate, uow: UnitOfWork) -> HistorialResponse:
        if data.tipo is not None and data.tipo not in TIPOS_VALIDOS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tipo inválido. Debe ser uno de: {', '.join(TIPOS_VALIDOS)}"
            )
        with uow:
            registro = uow.historial.get_by_id(historial_id)
            if not registro:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro no encontrado")
            registro = uow.historial.update(registro, data)
            return HistorialResponse.model_validate(registro)

    def delete(self, historial_id: int, uow: UnitOfWork) -> dict:
        with uow:
            registro = uow.historial.get_by_id(historial_id)
            if not registro:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro no encontrado")
            uow.historial.delete(registro)
            return {"message": "Registro eliminado correctamente"}


historial_service = HistorialService()
