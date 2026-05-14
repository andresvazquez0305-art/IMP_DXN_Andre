CREATE TABLE direccion (
    id_direccion INT AUTO_INCREMENT PRIMARY KEY,
    calle VARCHAR(100),
    numero VARCHAR(100),
    colonia VARCHAR(100),
    ciudad VARCHAR(100),
    latitud DECIMAL(10,7),
    longitud DECIMAL(10,7),
    id_cliente INT NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
