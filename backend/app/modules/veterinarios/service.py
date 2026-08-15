from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.modules.veterinarios.schemas import VeterinarioResponse, VeterinarioUpdate
from app.modules.veterinarios import repository


def list_veterinarios(db: Session, estado: Optional[str] = None):
    vets = repository.get_all_veterinarios(db, estado)
    return [
        VeterinarioResponse(
            id=v.id,
            nombre=v.nombre,
            apellido=v.apellido,
            dni=v.dni,
            telefono=v.telefono,
            username=v.username,
            estado=v.estado,
        )
        for v in vets
    ]


def update_veterinario(id: int, data: VeterinarioUpdate, db: Session):
    vet = repository.get_by_id(db, id)
    if not vet or vet.rol != "veterinario":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Veterinario no encontrado")

    vet = repository.update(db, vet, data.telefono, data.estado)
    db.commit()
    db.refresh(vet)
    return VeterinarioResponse(
        id=vet.id,
        nombre=vet.nombre,
        apellido=vet.apellido,
        dni=vet.dni,
        telefono=vet.telefono,
        username=vet.username,
        estado=vet.estado,
    )
