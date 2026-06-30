from sqlalchemy.orm import Session
from app.modules.mascotas.models import Mascota
from app.modules.mascotas.schemas import MascotaCreate, MascotaUpdate
from typing import List, Optional

class MascotaRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all_by_cliente(self, cliente_id: int) -> List[Mascota]:
        return self.db.query(Mascota).filter(Mascota.cliente_id == cliente_id).all()

    def get_all(self) -> List[Mascota]:
        return self.db.query(Mascota).order_by(Mascota.nombre).all()

    def get_by_id(self, mascota_id: int, cliente_id: int) -> Optional[Mascota]:
        return self.db.query(Mascota).filter(
            Mascota.id == mascota_id,
            Mascota.cliente_id == cliente_id
        ).first()

    def create(self, cliente_id: int, data: MascotaCreate) -> Mascota:
        mascota = Mascota(cliente_id=cliente_id, **data.model_dump())
        self.db.add(mascota)
        self.db.flush()
        return mascota

    def update(self, mascota: Mascota, data: MascotaUpdate) -> Mascota:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(mascota, field, value)
        self.db.flush()
        return mascota

    def delete(self, mascota: Mascota) -> None:
        self.db.delete(mascota)
        self.db.flush()