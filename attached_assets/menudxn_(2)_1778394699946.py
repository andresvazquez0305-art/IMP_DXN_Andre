import mysql.connector


# CONEXIÓN

def conectar():
    return mysql.connector.connect(
        user='root',
        password='SQLACT',
        host='localhost',
        database='DXN',
        port='3306'
    )


# REGISTRAR VENDEDOR

def registrar_vendedor():
    conexion = conectar()
    cursor = conexion.cursor()

    try:
        print("\n=== REGISTRAR VENDEDOR ===")
        nombre = input("Nombre: ")
        primer_apellido = input("Primer apellido: ")
        segundo_apellido = input("Segundo apellido: ")

        sql = """
        INSERT INTO vendedor (nombre, primer_apellido, segundo_apellido)
        VALUES (%s, %s, %s)
        """
        cursor.execute(sql, (nombre, primer_apellido, segundo_apellido))
        conexion.commit()

        print("Vendedor registrado correctamente")

    except Exception as e:
        print("Error:", e)
        conexion.rollback()

    finally:
        cursor.close()
        conexion.close()


# REGISTRAR CLIENTE Y DIRECCIÓN

def registrar_cliente():
    conexion = conectar()
    cursor = conexion.cursor()

    try:
        print("\n=== REGISTRAR CLIENTE ===")
        nombre = input("Nombre: ")
        primer_apellido = input("Primer apellido: ")
        segundo_apellido = input("Segundo apellido: ")
        registrado = input("¿Registrado? (Si/No): ")

        calle = input("Calle: ")
        numero = input("Número: ")
        colonia = input("Colonia: ")
        ciudad = input("Ciudad: ")
        latitud = input("Latitud (vacío si no tienes): ")
        longitud = input("Longitud (vacío si no tienes): ")

        latitud = None if latitud == "" else float(latitud)
        longitud = None if longitud == "" else float(longitud)

        sql_cliente = """
        INSERT INTO cliente (nombre, primer_apellido, segundo_apellido, registrado)
        VALUES (%s, %s, %s, %s)
        """
        cursor.execute(sql_cliente, (nombre, primer_apellido, segundo_apellido, registrado))
        id_cliente = cursor.lastrowid

        sql_direccion = """
        INSERT INTO direccion (calle, numero, colonia, ciudad, latitud, longitud, id_cliente)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql_direccion, (calle, numero, colonia, ciudad, latitud, longitud, id_cliente))

        conexion.commit()
        print("Cliente y dirección registrados correctamente")

    except Exception as e:
        print("Error:", e)
        conexion.rollback()

    finally:
        cursor.close()
        conexion.close()


# REGISTRAR PRODUCTO

def registrar_producto():
    conexion = conectar()
    cursor = conexion.cursor()

    try:
        print("\n=== REGISTRAR PRODUCTO ===")
        nombre_producto = input("Nombre del producto: ")
        precio = float(input("Precio: "))

        sql = """
        INSERT INTO producto (nombre_producto, precio)
        VALUES (%s, %s)
        """
        cursor.execute(sql, (nombre_producto, precio))
        conexion.commit()

        print("Producto registrado correctamente")

    except Exception as e:
        print("Error:", e)
        conexion.rollback()

    finally:
        cursor.close()
        conexion.close()


# VER CLIENTES

def ver_clientes():
    conexion = conectar()
    cursor = conexion.cursor()

    try:
        print("\n=== CLIENTES ===")
        cursor.execute("""
            SELECT c.id_cliente, c.nombre, c.primer_apellido, c.segundo_apellido, c.registrado,
                   d.calle, d.numero, d.colonia, d.ciudad
            FROM cliente c
            LEFT JOIN direccion d ON c.id_cliente = d.id_cliente
            ORDER BY c.id_cliente
        """)
        resultados = cursor.fetchall()

        if resultados:
            for fila in resultados:
                print(fila)
        else:
            print("No hay clientes registrados")

    except Exception as e:
        print("Error:", e)

    finally:
        cursor.close()
        conexion.close()


# VER VENDEDORES

def ver_vendedores():
    conexion = conectar()
    cursor = conexion.cursor()

    try:
        print("\n=== VENDEDORES ===")
        cursor.execute("SELECT * FROM vendedor ORDER BY id_vendedor")
        resultados = cursor.fetchall()

        if resultados:
            for fila in resultados:
                print(fila)
        else:
            print("No hay vendedores registrados")

    except Exception as e:
        print("Error:", e)

    finally:
        cursor.close()
        conexion.close()


# VER PRODUCTOS

def ver_productos():
    conexion = conectar()
    cursor = conexion.cursor()

    try:
        print("\n=== PRODUCTOS ===")
        cursor.execute("SELECT * FROM producto ORDER BY id_producto")
        resultados = cursor.fetchall()

        if resultados:
            for fila in resultados:
                print(fila)
        else:
            print("No hay productos registrados")

    except Exception as e:
        print("Error:", e)

    finally:
        cursor.close()
        conexion.close()


# VER VENTAS

def ver_ventas():
    conexion = conectar()
    cursor = conexion.cursor()

    try:
        print("\n=== VENTAS ===")
        cursor.execute("""
            SELECT v.id_venta, v.fecha,
                   c.nombre, c.primer_apellido,
                   ve.nombre, ve.primer_apellido
            FROM venta v
            INNER JOIN cliente c ON v.id_cliente = c.id_cliente
            INNER JOIN vendedor ve ON v.id_vendedor = ve.id_vendedor
            ORDER BY v.id_venta
        """)
        ventas = cursor.fetchall()

        if not ventas:
            print("No hay ventas registradas")
            return

        for venta in ventas:
            print(venta)

    except Exception as e:
        print("Error:", e)

    finally:
        cursor.close()
        conexion.close()


# REGISTRAR VENTA

def registrar_venta():
    conexion = conectar()
    conexion.autocommit = False
    cursor = conexion.cursor()

    try:
        print("\n=== REGISTRAR VENTA ===")

        print("\nClientes disponibles:")
        cursor.execute("SELECT * FROM cliente ORDER BY id_cliente")
        for fila in cursor.fetchall():
            print(fila)

        id_cliente = int(input("\nID del cliente: "))

        print("\nVendedores disponibles:")
        cursor.execute("SELECT * FROM vendedor ORDER BY id_vendedor")
        for fila in cursor.fetchall():
            print(fila)

        id_vendedor = int(input("\nID del vendedor: "))

        sql_venta = """
        INSERT INTO venta (fecha, id_vendedor, id_cliente)
        VALUES (CURDATE(), %s, %s)
        """
        cursor.execute(sql_venta, (id_vendedor, id_cliente))
        id_venta = cursor.lastrowid

        print(f"\nVenta creada con ID: {id_venta}")

        total = 0

        while True:
            print("\nProductos disponibles:")
            cursor.execute("SELECT * FROM producto ORDER BY id_producto")
            for fila in cursor.fetchall():
                print(fila)

            id_producto = int(input("\nID del producto: "))
            cantidad = int(input("Cantidad: "))

            cursor.execute(
                "SELECT precio FROM producto WHERE id_producto = %s",
                (id_producto,)
            )
            resultado = cursor.fetchone()

            if resultado is None:
                print("Ese producto no existe")
                continue

            precio = float(resultado[0])
            subtotal = precio * cantidad
            total += subtotal

            sql_detalle = """
            INSERT INTO detalle_venta (id_venta, id_producto, cantidad, subtotal)
            VALUES (%s, %s, %s, %s)
            """
            cursor.execute(sql_detalle, (id_venta, id_producto, cantidad, subtotal))

            print(f"Producto agregado. Subtotal: ${subtotal:.2f}")

            seguir = input("¿Agregar otro producto? (s/n): ").lower()
            if seguir != "s":
                break

        print(f"\nTotal calculado de la venta: ${total:.2f}")

        decision = input("¿Guardar venta? (s/n): ").lower()
        if decision == "s":
            conexion.commit()
            print("Venta guardada correctamente")
        else:
            conexion.rollback()
            print("Venta cancelada")

    except Exception as e:
        print("Error:", e)
        conexion.rollback()

    finally:
        cursor.close()
        conexion.close()


# MODIFICAR CLIENTE

def modificar_cliente():
    conexion = conectar()
    cursor = conexion.cursor()

    try:
        ver_clientes()
        print("\n=== MODIFICAR CLIENTE ===")
        id_cliente = int(input("ID del cliente a modificar: "))

        nombre = input("Nuevo nombre: ")
        primer_apellido = input("Nuevo primer apellido: ")
        segundo_apellido = input("Nuevo segundo apellido: ")
        registrado = input("¿Registrado? (Si/No): ")

        calle = input("Nueva calle: ")
        numero = input("Nuevo número: ")
        colonia = input("Nueva colonia: ")
        ciudad = input("Nueva ciudad: ")

        cursor.execute("""
            UPDATE cliente
            SET nombre = %s, primer_apellido = %s, segundo_apellido = %s, registrado = %s
            WHERE id_cliente = %s
        """, (nombre, primer_apellido, segundo_apellido, registrado, id_cliente))

        cursor.execute("""
            UPDATE direccion
            SET calle = %s, numero = %s, colonia = %s, ciudad = %s
            WHERE id_cliente = %s
        """, (calle, numero, colonia, ciudad, id_cliente))

        conexion.commit()
        print("Cliente modificado correctamente")

    except Exception as e:
        print("Error:", e)
        conexion.rollback()

    finally:
        cursor.close()
        conexion.close()


# MODIFICAR VENDEDOR

def modificar_vendedor():
    conexion = conectar()
    cursor = conexion.cursor()

    try:
        ver_vendedores()
        print("\n=== MODIFICAR VENDEDOR ===")
        id_vendedor = int(input("ID del vendedor a modificar: "))

        nombre = input("Nuevo nombre: ")
        primer_apellido = input("Nuevo primer apellido: ")
        segundo_apellido = input("Nuevo segundo apellido: ")

        cursor.execute("""
            UPDATE vendedor
            SET nombre = %s, primer_apellido = %s, segundo_apellido = %s
            WHERE id_vendedor = %s
        """, (nombre, primer_apellido, segundo_apellido, id_vendedor))

        conexion.commit()
        print("Vendedor modificado correctamente")

    except Exception as e:
        print("Error:", e)
        conexion.rollback()

    finally:
        cursor.close()
        conexion.close()


# MODIFICAR PRODUCTO

def modificar_producto():
    conexion = conectar()
    cursor = conexion.cursor()

    try:
        ver_productos()
        print("\n=== MODIFICAR PRODUCTO ===")
        id_producto = int(input("ID del producto a modificar: "))

        nombre_producto = input("Nuevo nombre del producto: ")
        precio = float(input("Nuevo precio: "))

        cursor.execute("""
            UPDATE producto
            SET nombre_producto = %s, precio = %s
            WHERE id_producto = %s
        """, (nombre_producto, precio, id_producto))

        conexion.commit()
        print("Producto modificado correctamente")

    except Exception as e:
        print("Error:", e)
        conexion.rollback()

    finally:
        cursor.close()
        conexion.close()


# MODIFICAR VENTA

def modificar_venta():
    conexion = conectar()
    conexion.autocommit = False
    cursor = conexion.cursor()

    try:
        ver_ventas()
        print("\n=== MODIFICAR VENTA ===")
        id_venta = int(input("ID de la venta a modificar: "))

        print("\nClientes disponibles:")
        cursor.execute("SELECT * FROM cliente ORDER BY id_cliente")
        for fila in cursor.fetchall():
            print(fila)
        id_cliente = int(input("Nuevo ID del cliente: "))

        print("\nVendedores disponibles:")
        cursor.execute("SELECT * FROM vendedor ORDER BY id_vendedor")
        for fila in cursor.fetchall():
            print(fila)
        id_vendedor = int(input("Nuevo ID del vendedor: "))

        cursor.execute("""
            UPDATE venta
            SET id_cliente = %s, id_vendedor = %s
            WHERE id_venta = %s
        """, (id_cliente, id_vendedor, id_venta))

        cursor.execute("DELETE FROM detalle_venta WHERE id_venta = %s", (id_venta,))

        total = 0

        while True:
            print("\nProductos disponibles:")
            cursor.execute("SELECT * FROM producto ORDER BY id_producto")
            for fila in cursor.fetchall():
                print(fila)

            id_producto = int(input("\nID del producto: "))
            cantidad = int(input("Cantidad: "))

            cursor.execute("SELECT precio FROM producto WHERE id_producto = %s", (id_producto,))
            resultado = cursor.fetchone()

            if resultado is None:
                print("Ese producto no existe")
                continue

            precio = float(resultado[0])
            subtotal = precio * cantidad
            total += subtotal

            cursor.execute("""
                INSERT INTO detalle_venta (id_venta, id_producto, cantidad, subtotal)
                VALUES (%s, %s, %s, %s)
            """, (id_venta, id_producto, cantidad, subtotal))

            print(f"Producto agregado. Subtotal: ${subtotal:.2f}")

            seguir = input("¿Agregar otro producto? (s/n): ").lower()
            if seguir != "s":
                break

        print(f"\nNuevo total calculado: ${total:.2f}")

        decision = input("¿Guardar cambios de la venta? (s/n): ").lower()
        if decision == "s":
            conexion.commit()
            print("Venta modificada correctamente")
        else:
            conexion.rollback()
            print("Cambios cancelados")

    except Exception as e:
        print("Error:", e)
        conexion.rollback()

    finally:
        cursor.close()
        conexion.close()


# ELIMINAR CLIENTE

def eliminar_cliente():
    conexion = conectar()
    cursor = conexion.cursor()

    try:
        ver_clientes()
        print("\n=== ELIMINAR CLIENTE ===")
        id_cliente = int(input("ID del cliente a eliminar: "))

        confirmar = input("¿Seguro que deseas eliminar este cliente? (s/n): ").lower()
        if confirmar == "s":
            cursor.execute("DELETE FROM cliente WHERE id_cliente = %s", (id_cliente,))
            conexion.commit()
            print("Cliente eliminado correctamente")
        else:
            print("Operación cancelada")

    except Exception as e:
        print("Error:", e)
        conexion.rollback()

    finally:
        cursor.close()
        conexion.close()


# ELIMINAR VENDEDOR

def eliminar_vendedor():
    conexion = conectar()
    cursor = conexion.cursor()

    try:
        ver_vendedores()
        print("\n=== ELIMINAR VENDEDOR ===")
        id_vendedor = int(input("ID del vendedor a eliminar: "))

        confirmar = input("¿Seguro que deseas eliminar este vendedor? (s/n): ").lower()
        if confirmar == "s":
            cursor.execute("DELETE FROM vendedor WHERE id_vendedor = %s", (id_vendedor,))
            conexion.commit()
            print("Vendedor eliminado correctamente")
        else:
            print("Operación cancelada")

    except Exception as e:
        print("Error:", e)
        conexion.rollback()

    finally:
        cursor.close()
        conexion.close()


# ELIMINAR PRODUCTO

def eliminar_producto():
    conexion = conectar()
    cursor = conexion.cursor()

    try:
        ver_productos()
        print("\n=== ELIMINAR PRODUCTO ===")
        id_producto = int(input("ID del producto a eliminar: "))

        confirmar = input("¿Seguro que deseas eliminar este producto? (s/n): ").lower()
        if confirmar == "s":
            cursor.execute("DELETE FROM producto WHERE id_producto = %s", (id_producto,))
            conexion.commit()
            print("Producto eliminado correctamente")
        else:
            print("Operación cancelada")

    except Exception as e:
        print("Error:", e)
        conexion.rollback()

    finally:
        cursor.close()
        conexion.close()


# ELIMINAR VENTA

def eliminar_venta():
    conexion = conectar()
    cursor = conexion.cursor()

    try:
        ver_ventas()
        print("\n=== ELIMINAR VENTA ===")
        id_venta = int(input("ID de la venta a eliminar: "))

        confirmar = input("¿Seguro que deseas eliminar esta venta? (s/n): ").lower()
        if confirmar == "s":
            cursor.execute("DELETE FROM venta WHERE id_venta = %s", (id_venta,))
            conexion.commit()
            print("Venta eliminada correctamente")
        else:
            print("Operación cancelada")

    except Exception as e:
        print("Error:", e)
        conexion.rollback()

    finally:
        cursor.close()
        conexion.close()


# TOTAL DE VENTAS EN RANGO DE FECHAS

def ver_total_ventas_por_rango():
    conexion = conectar()
    cursor = conexion.cursor()

    try:
        print("\n=== TOTAL DE VENTAS EN RANGO DE FECHAS ===")
        fecha_inicio = input("Fecha inicial (YYYY-MM-DD): ")
        fecha_fin = input("Fecha final (YYYY-MM-DD): ")

        cursor.execute("""
            SELECT COALESCE(SUM(dv.subtotal), 0) AS total_ventas
            FROM venta v
            LEFT JOIN detalle_venta dv ON v.id_venta = dv.id_venta
            WHERE v.fecha BETWEEN %s AND %s
        """, (fecha_inicio, fecha_fin))

        resultado = cursor.fetchone()

        print(f"Rango: {fecha_inicio} a {fecha_fin}")
        print(f"Total vendido: ${resultado[0]:.2f}")

    except Exception as e:
        print("Error:", e)

    finally:
        cursor.close()
        conexion.close()


# TOTAL POR CLIENTE EN RANGO DE FECHAS

def ver_total_por_cliente_en_rango():
    conexion = conectar()
    cursor = conexion.cursor()

    try:
        print("\n=== TOTAL POR CLIENTE EN RANGO DE FECHAS ===")
        fecha_inicio = input("Fecha inicial (YYYY-MM-DD): ")
        fecha_fin = input("Fecha final (YYYY-MM-DD): ")

        cursor.execute("""
            SELECT c.id_cliente, c.nombre, c.primer_apellido, c.segundo_apellido,
                   COALESCE(SUM(dv.subtotal), 0) AS total_cliente
            FROM venta v
            INNER JOIN cliente c ON v.id_cliente = c.id_cliente
            LEFT JOIN detalle_venta dv ON v.id_venta = dv.id_venta
            WHERE v.fecha BETWEEN %s AND %s
            GROUP BY c.id_cliente, c.nombre, c.primer_apellido, c.segundo_apellido
            ORDER BY total_cliente DESC
        """, (fecha_inicio, fecha_fin))

        resultados = cursor.fetchall()

        if resultados:
            print(f"\nTotales por cliente del {fecha_inicio} al {fecha_fin}:")
            for fila in resultados:
                print(f"ID Cliente: {fila[0]} | {fila[1]} {fila[2]} {fila[3]} | Total: ${fila[4]:.2f}")
        else:
            print("No hay ventas registradas en ese rango de fechas")

    except Exception as e:
        print("Error:", e)

    finally:
        cursor.close()
        conexion.close()

# TOTAL POR VENDEDOR EN RANGO DE FECHAS

def ver_total_por_vendedor_en_rango():
    conexion = conectar()
    cursor = conexion.cursor()

    try:
        print("\n=== TOTAL POR VENDEDOR EN RANGO DE FECHAS ===")
        fecha_inicio = input("Fecha inicial (YYYY-MM-DD): ")
        fecha_fin = input("Fecha final (YYYY-MM-DD): ")

        cursor.execute("""
            SELECT ve.id_vendedor, ve.nombre, ve.primer_apellido, ve.segundo_apellido,
                   COALESCE(SUM(dv.subtotal), 0) AS total_vendedor
            FROM venta v
            INNER JOIN vendedor ve ON v.id_vendedor = ve.id_vendedor
            LEFT JOIN detalle_venta dv ON v.id_venta = dv.id_venta
            WHERE v.fecha BETWEEN %s AND %s
            GROUP BY ve.id_vendedor, ve.nombre, ve.primer_apellido, ve.segundo_apellido
            ORDER BY total_vendedor DESC
        """, (fecha_inicio, fecha_fin))

        resultados = cursor.fetchall()

        if resultados:
            print(f"\nTotales por vendedor del {fecha_inicio} al {fecha_fin}:")
            for fila in resultados:
                print(f"ID Vendedor: {fila[0]} | {fila[1]} {fila[2]} {fila[3]} | Total: ${fila[4]:.2f}")
        else:
            print("No hay ventas registradas en ese rango de fechas")

    except Exception as e:
        print("Error:", e)

    finally:
        cursor.close()
        conexion.close()


# TOTAL POR PRODUCTO EN RANGO DE FECHAS

def ver_total_por_producto_en_rango():
    conexion = conectar()
    cursor = conexion.cursor()

    try:
        print("\n=== TOTAL POR PRODUCTO EN RANGO DE FECHAS ===")
        fecha_inicio = input("Fecha inicial (YYYY-MM-DD): ")
        fecha_fin = input("Fecha final (YYYY-MM-DD): ")

        cursor.execute("""
            SELECT p.id_producto, p.nombre_producto,
                   COALESCE(SUM(dv.cantidad), 0) AS total_piezas,
                   COALESCE(SUM(dv.subtotal), 0) AS total_vendido
            FROM detalle_venta dv
            INNER JOIN venta v ON dv.id_venta = v.id_venta
            INNER JOIN producto p ON dv.id_producto = p.id_producto
            WHERE v.fecha BETWEEN %s AND %s
            GROUP BY p.id_producto, p.nombre_producto
            ORDER BY total_vendido DESC
        """, (fecha_inicio, fecha_fin))

        resultados = cursor.fetchall()

        if resultados:
            print(f"\nTotales por producto del {fecha_inicio} al {fecha_fin}:")
            for fila in resultados:
                print(
                    f"ID Producto: {fila[0]} | {fila[1]} | "
                    f"Piezas vendidas: {fila[2]} | Total vendido: ${fila[3]:.2f}"
                )
        else:
            print("No hay ventas registradas en ese rango de fechas")

    except Exception as e:
        print("Error:", e)

    finally:
        cursor.close()
        conexion.close()


# MENÚ PRINCIPAL

def menu():
    while True:
        print("\n======= MENÚ DXN =======")
        print("1. Registrar vendedor")
        print("2. Registrar cliente y dirección")
        print("3. Registrar producto")
        print("4. Registrar venta")
        print("5. Ver clientes")
        print("6. Ver vendedores")
        print("7. Ver productos")
        print("8. Ver ventas")
        print("9. Modificar cliente")
        print("10. Modificar vendedor")
        print("11. Modificar producto")
        print("12. Modificar venta")
        print("13. Eliminar cliente")
        print("14. Eliminar vendedor")
        print("15. Eliminar producto")
        print("16. Eliminar venta")
        print("17. Ver total de ventas en rango de fechas")
        print("18. Ver total por cliente en rango de fechas")
        print("19. Ver total por vendedor en rango de fechas")
        print("20. Ver total por producto en rango de fechas")
        print("21. Salir")

        opcion = input("Elige una opción: ")

        if opcion == "1":
            registrar_vendedor()
        elif opcion == "2":
            registrar_cliente()
        elif opcion == "3":
            registrar_producto()
        elif opcion == "4":
            registrar_venta()
        elif opcion == "5":
            ver_clientes()
        elif opcion == "6":
            ver_vendedores()
        elif opcion == "7":
            ver_productos()
        elif opcion == "8":
            ver_ventas()
        elif opcion == "9":
            modificar_cliente()
        elif opcion == "10":
            modificar_vendedor()
        elif opcion == "11":
            modificar_producto()
        elif opcion == "12":
            modificar_venta()
        elif opcion == "13":
            eliminar_cliente()
        elif opcion == "14":
            eliminar_vendedor()
        elif opcion == "15":
            eliminar_producto()
        elif opcion == "16":
            eliminar_venta()
        elif opcion == "17":
            ver_total_ventas_por_rango()
        elif opcion == "18":
            ver_total_por_cliente_en_rango()
        elif opcion == "19":
            ver_total_por_vendedor_en_rango()
        elif opcion == "20":
            ver_total_por_producto_en_rango()
        elif opcion == "21":
            print("Saliendo del sistema...")
            break
        else:
            print("Opción no válida")


# INICIO DEL PROGRAMA

menu() 