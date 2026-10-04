require("dotenv").config();
const express = require("express");
const cors = require("cors");

const vendedorRoutes = require("./routes/vendedor.routes");
const productoRoutes = require("./routes/producto.routes");
const pedidoRoutes = require("./routes/pedido.routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    proyecto: "Sistema de Ventas",
    estado: "API funcionando",
    version: "1.0.0"
  });
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Servicio disponible" });
});

app.use("/api/vendedores", vendedorRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/pedidos", pedidoRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});