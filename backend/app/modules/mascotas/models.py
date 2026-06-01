from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Mascota(Base):
    __tablename__ = "mascotas"

    id               = Column(Integer, primary_key=True, index=True)
    cliente_id       = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    nombre           = Column(String(100), nullable=False)
    especie          = Column(String(50), nullable=False)
    raza             = Column(String(100), nullable=True)
    fecha_nacimiento = Column(Date, nullable=True)
    peso             = Column(Float, nullable=True)
    notas_medicas    = Column(String(500), nullable=True)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())

    cliente = relationship("Cliente", back_populates="mascotas")