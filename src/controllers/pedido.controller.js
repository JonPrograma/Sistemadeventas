const { sql, getPool } = require("../database/connection");

async function listar(req, res, next) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT p.id_pedido, p.fecha_pedido, p.total, p.estado,
             v.nombre + ' ' + v.apellido AS vendedor
      FROM Pedidos p
      INNER JOIN Vendedores v ON v.id_vendedor=p.id_vendedor
      ORDER BY p.id_pedido DESC
    `);
    res.json({success:true,data:result.recordset});
  } catch (err) { next(err); }
}

async function obtener(req, res, next) {
  try {
    const pool = await getPool();
    const pedido = await pool.request()
      .input("id", sql.Int, Number(req.params.id))
      .query(`
        SELECT p.*, v.nombre + ' ' + v.apellido AS vendedor
        FROM Pedidos p
        INNER JOIN Vendedores v ON v.id_vendedor=p.id_vendedor
        WHERE p.id_pedido=@id
      `);
    if (!pedido.recordset.length) return res.status(404).json({success:false,message:"Pedido no encontrado"});
    const detalle = await pool.request()
      .input("id", sql.Int, Number(req.params.id))
      .query(`
        SELECT d.*, pr.nombre AS producto
        FROM Detalle_Pedido d
        INNER JOIN Productos pr ON pr.id_producto=d.id_producto
        WHERE d.id_pedido=@id
      `);
    res.json({success:true,data:{pedido:pedido.recordset[0],detalle:detalle.recordset}});
  } catch (err) { next(err); }
}

async function crear(req, res, next) {
  const transaction = new sql.Transaction();
  try {
    const { id_vendedor, items } = req.body;
    if (!id_vendedor || !Array.isArray(items) || !items.length)
      return res.status(400).json({success:false,message:"id_vendedor e items son obligatorios"});
    const pool = await getPool();
    await transaction.begin();
    const request = new sql.Request(transaction);
    const vendedor = await request.input("v", sql.Int, id_vendedor)
      .query("SELECT id_vendedor FROM Vendedores WHERE id_vendedor=@v AND estado=1");
    if (!vendedor.recordset.length) throw new Error("El vendedor no existe o está inactivo");

    const pedido = await new sql.Request(transaction)
      .input("v", sql.Int, id_vendedor)
      .query(`INSERT INTO Pedidos(id_vendedor,total) OUTPUT INSERTED.id_pedido VALUES(@v,0)`);
    const idPedido = pedido.recordset[0].id_pedido;
    let total = 0;

    for (const item of items) {
      const r = await new sql.Request(transaction)
        .input("p", sql.Int, item.id_producto)
        .query("SELECT id_producto,nombre,precio,stock FROM Productos WHERE id_producto=@p AND estado=1");
      if (!r.recordset.length) throw new Error(`Producto ${item.id_producto} no encontrado`);
      const prod = r.recordset[0];
      const cantidad = Number(item.cantidad);
      if (!Number.isInteger(cantidad) || cantidad <= 0) throw new Error("La cantidad debe ser un entero positivo");
      if (prod.stock < cantidad) throw new Error(`Stock insuficiente para ${prod.nombre}`);
      const subtotal = Number(prod.precio) * cantidad;
      total += subtotal;

      await new sql.Request(transaction)
        .input("idp", sql.Int, idPedido)
        .input("producto", sql.Int, prod.id_producto)
        .input("cantidad", sql.Int, cantidad)
        .input("precio", sql.Decimal(10,2), prod.precio)
        .input("subtotal", sql.Decimal(10,2), subtotal)
        .query(`
          INSERT INTO Detalle_Pedido(id_pedido,id_producto,cantidad,precio_unitario,subtotal)
          VALUES(@idp,@producto,@cantidad,@precio,@subtotal)
        `);

      await new sql.Request(transaction)
        .input("producto", sql.Int, prod.id_producto)
        .input("cantidad", sql.Int, cantidad)
        .query("UPDATE Productos SET stock=stock-@cantidad WHERE id_producto=@producto");
    }

    await new sql.Request(transaction)
      .input("id", sql.Int, idPedido)
      .input("total", sql.Decimal(10,2), total)
      .query("UPDATE Pedidos SET total=@total WHERE id_pedido=@id");

    await transaction.commit();
    res.status(201).json({success:true,message:"Pedido creado correctamente",id_pedido:idPedido,total});
  } catch (err) {
    try { await transaction.rollback(); } catch (_) {}
    next(err);
  }
}

async function actualizarEstado(req, res, next) {
  try {
    const estados = ["Pendiente","Procesado","Enviado","Entregado","Cancelado"];
    const { estado } = req.body;
    if (!estados.includes(estado)) return res.status(400).json({success:false,message:"Estado inválido"});
    const pool = await getPool();
    const result = await pool.request()
      .input("id", sql.Int, Number(req.params.id))
      .input("estado", sql.VarChar(30), estado)
      .query("UPDATE Pedidos SET estado=@estado WHERE id_pedido=@id");
    if (!result.rowsAffected[0]) return res.status(404).json({success:false,message:"Pedido no encontrado"});
    res.json({success:true,message:"Estado actualizado"});
  } catch (err) { next(err); }
}

module.exports = { listar, obtener, crear, actualizarEstado };