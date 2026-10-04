# Sistema de Ventas

Proyecto académico de un sistema de ventas construido con **Node.js + Express 5 + SQL Server Express**.

## Funcionalidades
- CRUD de vendedores.
- CRUD de productos.
- Consulta de categorías.
- Creación de pedidos con detalle.
- Validación de stock.
- Descuento automático de inventario.
- Actualización de estado de pedidos.
- API REST.

## Requisitos
- Node.js 18 o superior.
- SQL Server Express.
- Git.

## Instalación

```bash
npm install
```

Copia `.env.example` a `.env` y configura tus credenciales de SQL Server.

Ejecuta `database/database.sql` en SQL Server Management Studio.

Después inicia el servidor:

```bash
npm run dev
```

API:
- GET `/`
- GET `/api/health`
- GET/POST/PUT/DELETE `/api/vendedores`
- GET/POST/PUT/DELETE `/api/productos`
- GET/POST `/api/pedidos`
- PATCH `/api/pedidos/:id/estado`

## Ejemplo para crear un pedido

```json
{
  "id_vendedor": 1,
  "items": [
    { "id_producto": 1, "cantidad": 2 },
    { "id_producto": 3, "cantidad": 1 }
  ]
}
```

