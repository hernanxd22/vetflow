require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');
 
const app = express();
const PORT = process.env.PORT || 3000;
 
// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));
 
// Conexion a PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});
 
pool.connect()
  .then(() => console.log('✅ Conectado a PostgreSQL'))
  .catch(err => console.error('❌ Error conectando a PostgreSQL:', err.message));
 
// ─── RUTAS ────────────────────────────────────────────────────
 
// POST /api/registro → crea cliente + usuario con contraseña
app.post('/api/registro', async (req, res) => {
  const { nombre, apellido, dni, telefono, username, password } = req.body;
 
  if (!nombre || !apellido || !dni || !telefono || !username || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
 
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }
 
  try {
    // Verificar DNI duplicado
    const existeDni = await pool.query('SELECT id FROM clientes WHERE dni = $1', [dni]);
    if (existeDni.rows.length > 0) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese DNI' });
    }
 
    // Verificar username duplicado
    const existeUser = await pool.query('SELECT id FROM usuarios WHERE username = $1', [username]);
    if (existeUser.rows.length > 0) {
      return res.status(409).json({ error: 'Ese nombre de usuario ya está en uso' });
    }
 
    // Insertar cliente
    const clienteResult = await pool.query(
      `INSERT INTO clientes (nombre, apellido, dni, telefono)
       VALUES ($1, $2, $3, $4) RETURNING id, nombre, apellido`,
      [nombre, apellido, dni, telefono]
    );
    const cliente = clienteResult.rows[0];
 
    // Hashear contraseña e insertar usuario
    const password_hash = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO usuarios (cliente_id, username, password_hash)
       VALUES ($1, $2, $3)`,
      [cliente.id, username, password_hash]
    );
 
    res.status(201).json({
      mensaje: 'Registro exitoso',
      cliente_id: cliente.id,
      nombre: `${cliente.nombre} ${cliente.apellido}`
    });
 
  } catch (err) {
    console.error('Error en /api/registro:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
 
// POST /api/login → login con username y contraseña
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
 
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
  }
 
  try {
    const result = await pool.query(
      `SELECT u.id, u.password_hash, u.cliente_id,
              c.nombre, c.apellido, c.dni, c.telefono, c.telegram_chat_id
       FROM usuarios u
       JOIN clientes c ON c.id = u.cliente_id
       WHERE u.username = $1`,
      [username]
    );
 
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
 
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
 
    if (!match) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
 
    res.json({
      mensaje: 'Login exitoso',
      cliente_id: user.cliente_id,
      nombre: `${user.nombre} ${user.apellido}`,
      dni: user.dni,
      telefono: user.telefono,
      telegram_chat_id: user.telegram_chat_id
    });
 
  } catch (err) {
    console.error('Error en /api/login:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
 
// GET /api/cliente/:telegram_chat_id → busca cliente por chat_id de Telegram
app.get('/api/cliente/:telegram_chat_id', async (req, res) => {
  const { telegram_chat_id } = req.params;
 
  try {
    const result = await pool.query(
      'SELECT * FROM clientes WHERE telegram_chat_id = $1',
      [telegram_chat_id]
    );
 
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
 
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error en /api/cliente:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
 
// PATCH /api/cliente/vincular → vincula telegram_chat_id a un cliente por DNI
app.patch('/api/cliente/vincular', async (req, res) => {
  const { dni, telegram_chat_id } = req.body;
 
  if (!dni || !telegram_chat_id) {
    return res.status(400).json({ error: 'DNI y telegram_chat_id son obligatorios' });
  }
 
  try {
    const result = await pool.query(
      `UPDATE clientes SET telegram_chat_id = $1
       WHERE dni = $2
       RETURNING id, nombre, apellido`,
      [telegram_chat_id, dni]
    );
 
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No se encontró cliente con ese DNI' });
    }
 
    res.json({
      mensaje: 'Cuenta vinculada con Telegram',
      cliente: result.rows[0]
    });
  } catch (err) {
    console.error('Error en /api/cliente/vincular:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
 
// POST /api/mascotas → agrega mascota a un cliente
app.post('/api/mascotas', async (req, res) => {
  const { cliente_id, nombre, especie, raza, fecha_nacimiento, peso, notas_medicas } = req.body;
 
  if (!cliente_id || !nombre || !especie) {
    return res.status(400).json({ error: 'cliente_id, nombre y especie son obligatorios' });
  }
 
  try {
    const result = await pool.query(
      `INSERT INTO mascotas (cliente_id, nombre, especie, raza, fecha_nacimiento, peso, notas_medicas)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [cliente_id, nombre, especie, raza || null, fecha_nacimiento || null, peso || null, notas_medicas || null]
    );
 
    res.status(201).json({
      mensaje: 'Mascota registrada',
      mascota: result.rows[0]
    });
  } catch (err) {
    console.error('Error en /api/mascotas:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
 
// GET /api/mascotas/:cliente_id → lista mascotas de un cliente
app.get('/api/mascotas/:cliente_id', async (req, res) => {
  const { cliente_id } = req.params;
 
  try {
    const result = await pool.query(
      'SELECT * FROM mascotas WHERE cliente_id = $1 ORDER BY nombre',
      [cliente_id]
    );
 
    res.json(result.rows);
  } catch (err) {
    console.error('Error en /api/mascotas:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
 
// DELETE /api/mascotas/:id → elimina una mascota
app.delete('/api/mascotas/:id', async (req, res) => {
  const { id } = req.params;
 
  try {
    await pool.query('DELETE FROM mascotas WHERE id = $1', [id]);
    res.json({ mensaje: 'Mascota eliminada' });
  } catch (err) {
    console.error('Error en DELETE /api/mascotas:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
 
// ─── ARRANQUE ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 VetFlow backend corriendo en http://localhost:${PORT}`);
});