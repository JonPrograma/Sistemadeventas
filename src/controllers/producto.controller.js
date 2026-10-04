const { sql, getPool } = require("../database/connection");

async function listar(req, res, next) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT p.*, c.nombre AS categoria
      FROM Productos p
      INNER JOIN Categorias c ON c.id_categoria=p.id_categoria
      ORDER BY p.id_producto DESC
    `);
    res.json({success:true,data:result.recordset});
  } catch (err) { next(err); }
}

async function obtener(req, res, next) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("id", sql.Int, Number(req.params.id))
      .query(`
        SELECT p.*, c.nombre AS categoria
        FROM Productos p
        INNER JOIN Categorias c ON c.id_categoria=p.id_categoria
        WHERE p.id_producto=@id
      `);
    if (!result.recordset.length) return res.status(404).json({success:false,message:"Producto no encontrado"});
    res.json({success:true,data:result.recordset[0]});
  } catch (err) { next(err); }
}

async function crear(req, res, next) {
  try {
    const { id_categoria, nombre, descripcion, precio, stock } = req.body;
    if (!id_categoria || !nombre || precio === undefined)
      return res.status(400).json({success:false,message:"id_categoria, nombre y precio son obligatorios"});
    const pool = await getPool();
    const result = await pool.request()
      .input("id_categoria", sql.Int, id_categoria)
      .input("nombre", sql.VarChar(150), nombre)
      .input("descripcion", sql.VarChar(255), descripcion || null)
      .input("precio", sql.Decimal(10,2), precio)
      .input("stock", sql.Int, stock || 0)
      .query(`
        INSERT INTO Productos(id_categoria,nombre,descripcion,precio,stock)
        OUTPUT INSERTED.*
        VALUES(@id_categoria,@nombre,@descripcion,@precio,@stock)
      `);
    res.status(201).json({success:true,data:result.recordset[0]});
  } catch (err) { next(err); }
}

async function actualizar(req, res, next) {
  try {
    const { id_categoria, nombre, descripcion, precio, stock, estado } = req.body;
    const pool = await getPool();
    const result = await pool.request()
      .input("id", sql.Int, Number(req.params.id))
      .input("id_categoria", sql.Int, id_categoria)
      .input("nombre", sql.VarChar(150), nombre)
      .input("descripcion", sql.VarChar(255), descripcion || null)
      .input("precio", sql.Decimal(10,2), precio)
      .input("stock", sql.Int, stock)
      .input("estado", sql.Bit, estado === undefined ? 1 : estado)
      .query(`
        UPDATE Productos
        SET id_categoria=@id_categoria, nombre=@nombre, descripcion=@descripcion,
            precio=@precio, stock=@stock, estado=@estado
        OUTPUT INSERTED.*
        WHERE id_producto=@id
      `);
    if (!result.recordset.length) return res.status(404).json({success:false,message:"Producto no encontrado"});
    res.json({success:true,data:result.recordset[0]});
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("id", sql.Int, Number(req.params.id))
      .query(`UPDATE Productos SET estado=0 WHERE id_producto=@id`);
    if (!result.rowsAffected[0]) return res.status(404).json({success:false,message:"Producto no encontrado"});
    res.json({success:true,message:"Producto desactivado"});
  } catch (err) { next(err); }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };