const router = require("express").Router();
const c = require("../controllers/pedido.controller");
router.get("/", c.listar);
router.get("/:id", c.obtener);
router.post("/", c.crear);
router.patch("/:id/estado", c.actualizarEstado);
module.exports = router;