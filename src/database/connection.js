const sql = require("mssql");

const config = {
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_DATABASE || "SistemaVentas",
  user: process.env.DB_USER || "sa",
  password: process.env.DB_PASSWORD || "",
  port: Number(process.env.DB_PORT || 1433),
  options: {
    encrypt: String(process.env.DB_ENCRYPT).toLowerCase() === "true",
    trustServerCertificate:
      String(process.env.DB_TRUST_SERVER_CERTIFICATE).toLowerCase() !== "false"
  }
};

let poolPromise;

async function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(config);
  }
  return poolPromise;
}

module.exports = { sql, getPool };