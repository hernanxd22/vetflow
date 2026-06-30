from sqlalchemy.orm import Session
from typing import Optional
from app.modules.auth.models import Cliente


def get_by_id(db: Session, id: int) -> Optional[Cliente]:
    return db.query(Cliente).filter(Cliente.id == id).first()


def get_all_veterinarios(db: Session, estado: Optional[str] = None):
    q = db.query(Cliente).filter(Cliente.rol == "veterinario")
    if estado:
        q = q.filter(Cliente.estado == estado)
    return q.order_by(Cliente.apellido, Cliente.nombre).all()


def update(db: Session, vet: Cliente, telefono: Optional[str], estado: Optional[str]) -> Cliente:
    if telefono is not None:
        vet.telefono = telefono
    if estado is not None:
        vet.estado = estado
    db.flush()
    db.refresh(vet)
    return vet
