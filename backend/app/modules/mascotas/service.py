from fastapi import HTTPException, status
from app.core.unit_of_work import UnitOfWork
from app.modules.mascotas.schemas import MascotaCreate, MascotaUpdate, MascotaResponse
from typing import List

class MascotaService:

    def get_all(self, cliente_id: int, uow: UnitOfWork) -> List[MascotaResponse]:
        mascotas = uow.mascotas.get_all_by_cliente(cliente_id)
        return [MascotaResponse.model_validate(m) for m in mascotas]

    def create(self, cliente_id: int, data: MascotaCreate, uow: UnitOfWork) -> MascotaResponse:
        with uow:
            mascota = uow.mascotas.create(cliente_id, data)
            return MascotaResponse.model_validate(mascota)

    def update(self, mascota_id: int, cliente_id: int, data: MascotaUpdate, uow: UnitOfWork) -> MascotaResponse:
        with uow:
            mascota = uow.mascotas.get_by_id(mascota_id, cliente_id)
            if not mascota:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mascota no encontrada")
            mascota = uow.mascotas.update(mascota, data)
            return MascotaResponse.model_validate(mascota)

    def delete(self, mascota_id: int, cliente_id: int, uow: UnitOfWork) -> dict:
        with uow:
            mascota = uow.mascotas.get_by_id(mascota_id, cliente_id)
            if not mascota:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mascota no encontrada")
            uow.mascotas.delete(mascota)
            return {"message": "Mascota eliminada correctamente"}

mascota_service = MascotaService()