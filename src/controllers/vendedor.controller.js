const { sql, getPool } = require("../database/connection");

async function listar(req, res, next) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT id_vendedor, nombre, apellido, email, telefono, fecha_registro, estado
      FROM Vendedores ORDER BY id_vendedor DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (err) { next(err); }
}

async function obtener(req, res, next) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("id", sql.Int, Number(req.params.id))
      .query(`SELECT * FROM Vendedores WHERE id_vendedor = @id`);
    if (!result.recordset.length) return res.status(404).json({success:false,message:"Vendedor no encontrado"});
    res.json({success:true,data:result.recordset[0]});
  } catch (err) { next(err); }
}

async function crear(req, res, next) {
  try {
    const { nombre, apellido, email, telefono } = req.body;
    if (!nombre || !apellido || !email)
      return res.status(400).json({success:false,message:"nombre, apellido y email son obligatorios"});
    const pool = await getPool();
    const result = await pool.request()
      .input("nombre", sql.VarChar(100), nombre)
      .input("apellido", sql.VarChar(100), apellido)
      .input("email", sql.VarChar(150), email)
      .input("telefono", sql.VarChar(20), telefono || null)
      .query(`
        INSERT INTO Vendedores(nombre,apellido,email,telefono)
        OUTPUT INSERTED.*
        VALUES(@nombre,@apellido,@email,@telefono)
      `);
    res.status(201).json({success:true,data:result.recordset[0]});
  } catch (err) { next(err); }
}

async function actualizar(req, res, next) {
  try {
    const { nombre, apellido, email, telefono, estado } = req.body;
    const pool = await getPool();
    const result = await pool.request()
      .input("id", sql.Int, Number(req.params.id))
      .input("nombre", sql.VarChar(100), nombre)
      .input("apellido", sql.VarChar(100), apellido)
      .input("email", sql.VarChar(150), email)
      .input("telefono", sql.VarChar(20), telefono || null)
      .input("estado", sql.Bit, estado === undefined ? 1 : estado)
      .query(`
        UPDATE Vendedores
        SET nombre=@nombre, apellido=@apellido, email=@email,
            telefono=@telefono, estado=@estado
        OUTPUT INSERTED.*
        WHERE id_vendedor=@id
      `);
    if (!result.recordset.length) return res.status(404).json({success:false,message:"Vendedor no encontrado"});
    res.json({success:true,data:result.recordset[0]});
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("id", sql.Int, Number(req.params.id))
      .query(`UPDATE Vendedores SET estado=0 WHERE id_vendedor=@id`);
    if (!result.rowsAffected[0]) return res.status(404).json({success:false,message:"Vendedor no encontrado"});
    res.json({success:true,message:"Vendedor desactivado"});
  } catch (err) { next(err); }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };