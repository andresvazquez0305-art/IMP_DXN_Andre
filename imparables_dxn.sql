-- ============================================================
--  IMPARABLES SA — BASE DE DATOS MAESTRA
--  Compatible con MySQL 8+ / phpMyAdmin
--  Incluye: operaciones, usuarios/correos, log de actividad
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `DXN`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_spanish_ci;

USE `DXN`;


-- ============================================================
--  SECCIÓN 1 — OPERACIONES
--  (vendedores, clientes, productos, ventas)
-- ============================================================

-- -------------------------------------------
--  1.1  VENDEDOR
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `vendedor` (
  `id_vendedor`      INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `nombre`           VARCHAR(100)     NOT NULL,
  `primer_apellido`  VARCHAR(100)     NOT NULL,
  `segundo_apellido` VARCHAR(100)         NULL DEFAULT NULL,
  `activo`           TINYINT(1)       NOT NULL DEFAULT 1
                     COMMENT '1 = activo, 0 = inactivo',
  `creado_en`        DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en`   DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP
                     ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_vendedor`),
  INDEX `idx_vendedor_nombre` (`nombre`, `primer_apellido`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci
  COMMENT='Vendedores registrados en el sistema';


-- -------------------------------------------
--  1.2  CLIENTE
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `cliente` (
  `id_cliente`       INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `nombre`           VARCHAR(100)     NOT NULL,
  `primer_apellido`  VARCHAR(100)     NOT NULL,
  `segundo_apellido` VARCHAR(100)         NULL DEFAULT NULL,
  `registrado`       ENUM('Si','No')  NOT NULL DEFAULT 'No'
                     COMMENT 'Si = cliente registrado oficialmente en DXN',
  `creado_en`        DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en`   DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP
                     ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_cliente`),
  INDEX `idx_cliente_nombre` (`nombre`, `primer_apellido`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci
  COMMENT='Clientes del negocio';


-- -------------------------------------------
--  1.3  DIRECCIÓN (1 por cliente)
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `direccion` (
  `id_direccion` INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `id_cliente`   INT UNSIGNED     NOT NULL,
  `calle`        VARCHAR(200)     NOT NULL,
  `numero`       VARCHAR(20)          NULL DEFAULT NULL,
  `colonia`      VARCHAR(150)         NULL DEFAULT NULL,
  `ciudad`       VARCHAR(150)     NOT NULL,
  `estado`       VARCHAR(100)         NULL DEFAULT NULL,
  `codigo_postal` VARCHAR(10)         NULL DEFAULT NULL,
  `latitud`      DECIMAL(10,7)        NULL DEFAULT NULL,
  `longitud`     DECIMAL(10,7)        NULL DEFAULT NULL,
  PRIMARY KEY (`id_direccion`),
  UNIQUE KEY `uq_direccion_cliente` (`id_cliente`),
  CONSTRAINT `fk_direccion_cliente`
    FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci
  COMMENT='Dirección de entrega por cliente';


-- -------------------------------------------
--  1.4  PRODUCTO
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `producto` (
  `id_producto`    INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  `nombre_producto` VARCHAR(200)     NOT NULL,
  `descripcion`    TEXT                  NULL DEFAULT NULL,
  `precio`         DECIMAL(10,2)    NOT NULL,
  `activo`         TINYINT(1)       NOT NULL DEFAULT 1,
  `creado_en`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP
                   ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_producto`),
  INDEX `idx_producto_nombre` (`nombre_producto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci
  COMMENT='Catálogo de productos DXN';


-- -------------------------------------------
--  1.5  VENTA (encabezado)
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `venta` (
  `id_venta`    INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `fecha`       DATE          NOT NULL,
  `id_vendedor` INT UNSIGNED  NOT NULL,
  `id_cliente`  INT UNSIGNED  NOT NULL,
  `total`       DECIMAL(12,2)     NULL DEFAULT NULL
                COMMENT 'Se actualiza por trigger al modificar detalle',
  `notas`       TEXT              NULL DEFAULT NULL,
  `creado_en`   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_venta`),
  INDEX `idx_venta_fecha`     (`fecha`),
  INDEX `idx_venta_vendedor`  (`id_vendedor`),
  INDEX `idx_venta_cliente`   (`id_cliente`),
  CONSTRAINT `fk_venta_vendedor`
    FOREIGN KEY (`id_vendedor`) REFERENCES `vendedor` (`id_vendedor`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_venta_cliente`
    FOREIGN KEY (`id_cliente`)  REFERENCES `cliente`  (`id_cliente`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci
  COMMENT='Encabezado de cada venta';


-- -------------------------------------------
--  1.6  DETALLE_VENTA (líneas de venta)
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `detalle_venta` (
  `id_detalle`  INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  `id_venta`    INT UNSIGNED   NOT NULL,
  `id_producto` INT UNSIGNED   NOT NULL,
  `cantidad`    INT UNSIGNED   NOT NULL DEFAULT 1,
  `precio_unit` DECIMAL(10,2)      NULL DEFAULT NULL
                COMMENT 'Precio en el momento de la venta',
  `subtotal`    DECIMAL(12,2)  NOT NULL,
  PRIMARY KEY (`id_detalle`),
  INDEX `idx_detalle_venta`    (`id_venta`),
  INDEX `idx_detalle_producto` (`id_producto`),
  CONSTRAINT `fk_detalle_venta`
    FOREIGN KEY (`id_venta`)    REFERENCES `venta`    (`id_venta`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_detalle_producto`
    FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci
  COMMENT='Líneas de producto de cada venta';


-- -------------------------------------------
--  TRIGGER: recalcular total de venta
-- -------------------------------------------
DELIMITER $$

CREATE TRIGGER `trg_recalcular_total_insert`
AFTER INSERT ON `detalle_venta`
FOR EACH ROW
BEGIN
  UPDATE `venta`
  SET `total` = (
    SELECT COALESCE(SUM(`subtotal`), 0)
    FROM `detalle_venta`
    WHERE `id_venta` = NEW.`id_venta`
  )
  WHERE `id_venta` = NEW.`id_venta`;
END$$

CREATE TRIGGER `trg_recalcular_total_update`
AFTER UPDATE ON `detalle_venta`
FOR EACH ROW
BEGIN
  UPDATE `venta`
  SET `total` = (
    SELECT COALESCE(SUM(`subtotal`), 0)
    FROM `detalle_venta`
    WHERE `id_venta` = NEW.`id_venta`
  )
  WHERE `id_venta` = NEW.`id_venta`;
END$$

CREATE TRIGGER `trg_recalcular_total_delete`
AFTER DELETE ON `detalle_venta`
FOR EACH ROW
BEGIN
  UPDATE `venta`
  SET `total` = (
    SELECT COALESCE(SUM(`subtotal`), 0)
    FROM `detalle_venta`
    WHERE `id_venta` = OLD.`id_venta`
  )
  WHERE `id_venta` = OLD.`id_venta`;
END$$

DELIMITER ;


-- ============================================================
--  SECCIÓN 2 — USUARIOS Y CORREOS (portal web Imparables SA)
-- ============================================================

-- -------------------------------------------
--  2.1  USUARIO_WEB
--  Sincronizado con Clerk Auth (sistema de login)
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `usuario_web` (
  `id_usuario`      INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `clerk_user_id`   VARCHAR(50)          NULL DEFAULT NULL
                    COMMENT 'ID de usuario en Clerk (user_XXXX)',
  `email`           VARCHAR(255)     NOT NULL,
  `nombre`          VARCHAR(200)         NULL DEFAULT NULL,
  `rol`             ENUM('admin','vendedor') NOT NULL DEFAULT 'vendedor',
  `activo`          TINYINT(1)       NOT NULL DEFAULT 1,
  `metodo_login`    SET('email','google','invitation')
                    NOT NULL DEFAULT 'email'
                    COMMENT 'Método(s) de autenticación utilizados',
  `creado_en`       DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ultimo_acceso`   DATETIME             NULL DEFAULT NULL,
  `notas`           VARCHAR(500)         NULL DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `uq_usuario_email`     (`email`),
  UNIQUE KEY `uq_usuario_clerk_id`  (`clerk_user_id`),
  INDEX `idx_usuario_rol`   (`rol`),
  INDEX `idx_usuario_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci
  COMMENT='Usuarios del portal web (sincronizados con Clerk Auth)';


-- -------------------------------------------
--  2.2  INVITACION
--  Registro de invitaciones enviadas por el admin
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `invitacion` (
  `id_invitacion`       INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `email`               VARCHAR(255)  NOT NULL,
  `clerk_invitation_id` VARCHAR(50)       NULL DEFAULT NULL
                        COMMENT 'ID devuelto por Clerk al crear la invitación',
  `enviado_por`         INT UNSIGNED  NOT NULL
                        COMMENT 'id_usuario del administrador que envió la invitación',
  `estado`              ENUM('pendiente','aceptada','revocada','expirada')
                        NOT NULL DEFAULT 'pendiente',
  `enviado_en`          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `aceptado_en`         DATETIME          NULL DEFAULT NULL,
  `revocado_en`         DATETIME          NULL DEFAULT NULL,
  PRIMARY KEY (`id_invitacion`),
  INDEX `idx_invitacion_email`   (`email`),
  INDEX `idx_invitacion_estado`  (`estado`),
  CONSTRAINT `fk_invitacion_enviado_por`
    FOREIGN KEY (`enviado_por`) REFERENCES `usuario_web` (`id_usuario`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci
  COMMENT='Invitaciones de acceso enviadas a nuevos usuarios';


-- -------------------------------------------
--  2.3  SESION
--  Registro de inicios de sesión
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `sesion` (
  `id_sesion`    INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `id_usuario`   INT UNSIGNED  NOT NULL,
  `inicio`       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fin`          DATETIME          NULL DEFAULT NULL,
  `ip_address`   VARCHAR(45)       NULL DEFAULT NULL,
  `user_agent`   VARCHAR(500)      NULL DEFAULT NULL,
  `exitosa`      TINYINT(1)    NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_sesion`),
  INDEX `idx_sesion_usuario` (`id_usuario`),
  INDEX `idx_sesion_inicio`  (`inicio`),
  CONSTRAINT `fk_sesion_usuario`
    FOREIGN KEY (`id_usuario`) REFERENCES `usuario_web` (`id_usuario`)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci
  COMMENT='Historial de sesiones de cada usuario';


-- ============================================================
--  SECCIÓN 3 — LOG DE OPERACIONES (auditoría)
-- ============================================================

-- -------------------------------------------
--  3.1  LOG_OPERACION
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS `log_operacion` (
  `id_log`         BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT,
  `id_usuario`     INT UNSIGNED          NULL DEFAULT NULL
                   COMMENT 'NULL si la operación fue del sistema',
  `tipo`           ENUM('INSERT','UPDATE','DELETE','LOGIN','LOGOUT',
                        'INVITE_SENT','INVITE_REVOKED','ERROR')
                   NOT NULL,
  `tabla`          VARCHAR(64)           NULL DEFAULT NULL
                   COMMENT 'Nombre de la tabla afectada',
  `id_registro`    INT UNSIGNED          NULL DEFAULT NULL
                   COMMENT 'PK del registro afectado',
  `descripcion`    TEXT                  NULL DEFAULT NULL
                   COMMENT 'Detalle legible de la operación',
  `datos_antes`    JSON                  NULL DEFAULT NULL
                   COMMENT 'Snapshot del registro antes del cambio',
  `datos_despues`  JSON                  NULL DEFAULT NULL
                   COMMENT 'Snapshot del registro después del cambio',
  `ip_address`     VARCHAR(45)           NULL DEFAULT NULL,
  `realizado_en`   DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_log`),
  INDEX `idx_log_usuario`   (`id_usuario`),
  INDEX `idx_log_tipo`      (`tipo`),
  INDEX `idx_log_tabla`     (`tabla`),
  INDEX `idx_log_fecha`     (`realizado_en`),
  CONSTRAINT `fk_log_usuario`
    FOREIGN KEY (`id_usuario`) REFERENCES `usuario_web` (`id_usuario`)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci
  COMMENT='Auditoría completa de todas las operaciones del sistema';


-- ============================================================
--  VISTAS ÚTILES PARA phpMyAdmin
-- ============================================================

-- Vista: ventas con nombre de vendedor y cliente
CREATE OR REPLACE VIEW `v_ventas_completas` AS
SELECT
  v.id_venta,
  v.fecha,
  v.total,
  CONCAT(ve.nombre, ' ', ve.primer_apellido) AS vendedor,
  CONCAT(c.nombre,  ' ', c.primer_apellido)  AS cliente,
  c.registrado                                AS cliente_registrado,
  COUNT(dv.id_detalle)                        AS num_productos
FROM venta v
LEFT JOIN vendedor    ve ON v.id_vendedor = ve.id_vendedor
LEFT JOIN cliente     c  ON v.id_cliente  = c.id_cliente
LEFT JOIN detalle_venta dv ON v.id_venta  = dv.id_venta
GROUP BY v.id_venta, v.fecha, v.total, vendedor, cliente, c.registrado;


-- Vista: resumen de ventas por vendedor (mes actual)
CREATE OR REPLACE VIEW `v_resumen_vendedor_mes` AS
SELECT
  ve.id_vendedor,
  CONCAT(ve.nombre, ' ', ve.primer_apellido) AS vendedor,
  COUNT(DISTINCT v.id_venta)                  AS num_ventas,
  COALESCE(SUM(dv.subtotal), 0)               AS total_mes
FROM vendedor ve
LEFT JOIN venta v
  ON ve.id_vendedor = v.id_vendedor
  AND MONTH(v.fecha) = MONTH(CURRENT_DATE())
  AND YEAR(v.fecha)  = YEAR(CURRENT_DATE())
LEFT JOIN detalle_venta dv ON v.id_venta = dv.id_venta
GROUP BY ve.id_vendedor, vendedor;


-- Vista: productos más vendidos
CREATE OR REPLACE VIEW `v_top_productos` AS
SELECT
  p.id_producto,
  p.nombre_producto,
  p.precio,
  COALESCE(SUM(dv.cantidad), 0)  AS total_piezas,
  COALESCE(SUM(dv.subtotal), 0)  AS total_ingresos
FROM producto p
LEFT JOIN detalle_venta dv ON p.id_producto = dv.id_producto
GROUP BY p.id_producto, p.nombre_producto, p.precio
ORDER BY total_ingresos DESC;


-- Vista: usuarios activos con última sesión
CREATE OR REPLACE VIEW `v_usuarios_activos` AS
SELECT
  u.id_usuario,
  u.email,
  u.nombre,
  u.rol,
  u.metodo_login,
  u.creado_en,
  MAX(s.inicio) AS ultima_sesion
FROM usuario_web u
LEFT JOIN sesion s ON u.id_usuario = s.id_usuario AND s.exitosa = 1
WHERE u.activo = 1
GROUP BY u.id_usuario, u.email, u.nombre, u.rol, u.metodo_login, u.creado_en;


-- Vista: log de operaciones con nombre de usuario
CREATE OR REPLACE VIEW `v_log_detallado` AS
SELECT
  l.id_log,
  l.realizado_en,
  u.email       AS usuario_email,
  u.rol         AS usuario_rol,
  l.tipo,
  l.tabla,
  l.id_registro,
  l.descripcion,
  l.ip_address
FROM log_operacion l
LEFT JOIN usuario_web u ON l.id_usuario = u.id_usuario
ORDER BY l.realizado_en DESC;


-- ============================================================
--  DATOS DE EJEMPLO (opcionales — comentar si no se necesitan)
-- ============================================================

INSERT INTO `vendedor` (nombre, primer_apellido, segundo_apellido) VALUES
  ('María',   'González', 'López'),
  ('Carlos',  'Ramírez',  'Torres'),
  ('Ana',     'Martínez', 'Ruiz');

INSERT INTO `cliente` (nombre, primer_apellido, segundo_apellido, registrado) VALUES
  ('Juan',    'Pérez',    'Sánchez', 'Si'),
  ('Laura',   'Hernández','Vega',    'No'),
  ('Roberto', 'Flores',   'Cruz',    'Si');

INSERT INTO `direccion` (id_cliente, calle, numero, colonia, ciudad) VALUES
  (1, 'Av. Juárez',   '120',  'Centro',   'Guadalajara'),
  (2, 'Calle Hidalgo','45-B', 'Del Valle', 'CDMX'),
  (3, 'Blvd. Morelos','301',  'Jardines',  'Monterrey');

INSERT INTO `producto` (nombre_producto, precio) VALUES
  ('Café Ganoderma RG 20 sobres',  280.00),
  ('Spirulina 120 tabletas',        350.00),
  ('Morinzhi 500 ml',               420.00),
  ('Lingzhi Black Coffee 20 sobres',310.00),
  ('Cordypine 500 ml',              580.00);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
--  FIN DEL SCHEMA — Imparables SA / DXN
--  Generado para uso con MySQL 8+ / phpMyAdmin
-- ============================================================
