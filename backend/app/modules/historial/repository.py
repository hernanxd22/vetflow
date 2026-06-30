from sqlalchemy.orm import Session
from app.modules.historial.models import HistorialMedico
from app.modules.historial.schemas import HistorialCreate, HistorialUpdate
from typing import List, Optional


class HistorialRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all_by_mascota(self, mascota_id: int) -> List[HistorialMedico]:
        return (
            self.db.query(HistorialMedico)
            .filter(HistorialMedico.mascota_id == mascota_id)
            .order_by(HistorialMedico.fecha.desc(), HistorialMedico.id.desc())
            .all()
        )

    def get_by_id(self, historial_id: int) -> Optional[HistorialMedico]:
        return self.db.query(HistorialMedico).filter(HistorialMedico.id == historial_id).first()

    def create(self, mascota_id: int, data: HistorialCreate) -> HistorialMedico:
        registro = HistorialMedico(mascota_id=mascota_id, **data.model_dump())
        self.db.add(registro)
        self.db.flush()
        return registro

    def update(self, registro: HistorialMedico, data: HistorialUpdate) -> HistorialMedico:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(registro, field, value)
        self.db.flush()
        return registro

    def delete(self, registro: HistorialMedico) -> None:
        self.db.delete(registro)
        self.db.flush()
