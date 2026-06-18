def menugeneral():
    print("\n" + "=" * 55)
    print("CALCULADORA DE INTEGRALES")
    print("=" * 55)
    print("1. Integrales indefinidas")
    print("2. Integrales definidas")
    print("3. Métodos de integración")
    print("4. Cinemática")
    print("0. Salir")

    return input("Seleccione una opción: ").strip()


# Se deja este alias para que no falle código anterior que llamaba menu().
def menu():
    return menugeneral()
