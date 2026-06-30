from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class HistorialMedico(Base):
    __tablename__ = "historial_medico"

    id          = Column(Integer, primary_key=True, index=True)
    mascota_id  = Column(Integer, ForeignKey("mascotas.id", ondelete="CASCADE"), nullable=False)
    fecha       = Column(Date, nullable=False, default=func.current_date())
    tipo        = Column(String(30), nullable=False)
    descripcion = Column(Text, nullable=False)
    diagnostico = Column(Text, nullable=True)
    tratamiento = Column(Text, nullable=True)
    notas       = Column(Text, nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    mascota = relationship("Mascota", back_populates="historial")
