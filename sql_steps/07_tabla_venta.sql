CREATE TABLE venta (
    id_venta INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    id_vendedor INT NOT NULL,
    id_cliente INT NOT NULL,
    FOREIGN KEY (id_vendedor) REFERENCES vendedor(id_vendedor)
        ON UPDATE CASCADE,
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
        ON UPDATE CASCADE
);
