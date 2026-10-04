IF DB_ID('SistemaVentas') IS NULL
    CREATE DATABASE SistemaVentas;
GO

USE SistemaVentas;
GO

IF OBJECT_ID('Detalle_Pedido','U') IS NOT NULL DROP TABLE Detalle_Pedido;
IF OBJECT_ID('Pedidos','U') IS NOT NULL DROP TABLE Pedidos;
IF OBJECT_ID('Productos','U') IS NOT NULL DROP TABLE Productos;
IF OBJECT_ID('Categorias','U') IS NOT NULL DROP TABLE Categorias;
IF OBJECT_ID('Vendedores','U') IS NOT NULL DROP TABLE Vendedores;
GO

CREATE TABLE Vendedores (
    id_vendedor INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(20) NULL,
    fecha_registro DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    estado BIT NOT NULL DEFAULT 1
);

CREATE TABLE Categorias (
    id_categoria INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255) NULL
);

CREATE TABLE Productos (
    id_producto INT IDENTITY(1,1) PRIMARY KEY,
    id_categoria INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion VARCHAR(255) NULL,
    precio DECIMAL(10,2) NOT NULL CHECK(precio >= 0),
    stock INT NOT NULL DEFAULT 0 CHECK(stock >= 0),
    estado BIT NOT NULL DEFAULT 1,
    CONSTRAINT FK_Productos_Categorias FOREIGN KEY(id_categoria)
        REFERENCES Categorias(id_categoria)
);

CREATE TABLE Pedidos (
    id_pedido INT IDENTITY(1,1) PRIMARY KEY,
    id_vendedor INT NOT NULL,
    fecha_pedido DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    total DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK(total >= 0),
    estado VARCHAR(30) NOT NULL DEFAULT 'Pendiente',
    CONSTRAINT CK_Pedidos_Estado CHECK(estado IN ('Pendiente','Procesado','Enviado','Entregado','Cancelado')),
    CONSTRAINT FK_Pedidos_Vendedores FOREIGN KEY(id_vendedor)
        REFERENCES Vendedores(id_vendedor)
);

CREATE TABLE Detalle_Pedido (
    id_detalle INT IDENTITY(1,1) PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL CHECK(cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL CHECK(precio_unitario >= 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK(subtotal >= 0),
    CONSTRAINT FK_Detalle_Pedido FOREIGN KEY(id_pedido)
        REFERENCES Pedidos(id_pedido),
    CONSTRAINT FK_Detalle_Producto FOREIGN KEY(id_producto)
        REFERENCES Productos(id_producto)
);

INSERT INTO Vendedores(nombre,apellido,email,telefono)
VALUES ('Juan','Pérez','juan.perez@example.com','6640000001'),
       ('María','López','maria.lopez@example.com','6640000002');

INSERT INTO Categorias(nombre,descripcion)
VALUES ('Electrónica','Productos electrónicos'),
       ('Accesorios','Accesorios para equipos');

INSERT INTO Productos(id_categoria,nombre,descripcion,precio,stock)
VALUES (1,'Teclado USB','Teclado alámbrico',350.00,20),
       (1,'Mouse USB','Mouse óptico',180.00,35),
       (2,'Cable HDMI','Cable HDMI de 2 metros',120.00,50);

CREATE INDEX IX_Productos_Categoria ON Productos(id_categoria);
CREATE INDEX IX_Pedidos_Vendedor ON Pedidos(id_vendedor);
CREATE INDEX IX_Detalle_Pedido ON Detalle_Pedido(id_pedido);
CREATE INDEX IX_Detalle_Producto ON Detalle_Pedido(id_producto);
GO