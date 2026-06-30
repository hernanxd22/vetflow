from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from app.modules.citas.schemas import CitaClienteResponse, CitaAdminResponse


def get_citas_cliente(cliente_id: int, db: Session) -> List[CitaClienteResponse]:
    sql = text("""
        SELECT c.id, c.fecha::text, c.hora::text, c.estado, c.mascota_id, m.nombre AS mascota_nombre
        FROM citas c
        JOIN mascotas m ON c.mascota_id = m.id
        WHERE c.cliente_id = :cliente_id
        ORDER BY c.fecha DESC, c.hora DESC
    """)
    result = db.execute(sql, {"cliente_id": cliente_id})
    rows = result.fetchall()
    return [
        CitaClienteResponse(
            id=row[0], fecha=row[1], hora=row[2],
            estado=row[3], mascota_id=row[4], mascota_nombre=row[5]
        )
        for row in rows
    ]


def get_citas_admin(db: Session) -> List[CitaAdminResponse]:
    sql = text("""
        SELECT c.id, c.fecha::text, c.hora::text, c.estado, c.mascota_id,
               m.nombre AS mascota_nombre,
               c.cliente_id,
               cl.nombre || ' ' || cl.apellido AS cliente_nombre
        FROM citas c
        JOIN mascotas m ON c.mascota_id = m.id
        JOIN clientes cl ON c.cliente_id = cl.id
        ORDER BY c.fecha DESC, c.hora DESC
    """)
    result = db.execute(sql)
    rows = result.fetchall()
    return [
        CitaAdminResponse(
            id=row[0], fecha=row[1], hora=row[2],
            estado=row[3], mascota_id=row[4], mascota_nombre=row[5],
            cliente_id=row[6], cliente_nombre=row[7]
        )
        for row in rows
    ]
