from .integraldeunexponente import es_real, formatear_numero


def agregar_constante_integracion(expresion):
    """
    Agrega la constante de integración C.
    """
    if expresion == "0":
        return "C"

    return expresion + " + C"


def multiplicar_por_constante(k, expresion):
    """
    Multiplica una antiderivada por una constante real.
    No calcula con sympy, solo arma la expresión.
    """
    if not es_real(k):
        raise ValueError("La constante debe ser un número real.")

    if k == 0:
        return "0"

    if k == 1:
        return expresion

    if k == -1:
        return f"-({expresion})"

    return f"{formatear_numero(k)}({expresion})"


def integral_uno_sobre_x(k=1):
    """
    Calcula:

        ∫ k/x dx = k log(|x|) + C

    Usamos log.
    """
    base = "log(|x|)"
    resultado = multiplicar_por_constante(k, base)

    return {
        "tipo": "indefinida",
        "funcion": f"{formatear_numero(k)}/x",
        "resultado": agregar_constante_integracion(resultado),
        "pasos": [
            "Usamos la regla: ∫ 1/x dx = log(|x|) + C.",
            f"Multiplicamos por la constante {formatear_numero(k)}.",
            f"Resultado: {agregar_constante_integracion(resultado)}"
        ]
    }


def integral_log_x(k=1):
    """
    Calcula:

        ∫ k log(x) dx = k[x log(x) - x] + C

    Usamos log.
    """
    base = "x log(x) - x"
    resultado = multiplicar_por_constante(k, base)

    return {
        "tipo": "indefinida",
        "funcion": f"{formatear_numero(k)}log(x)",
        "resultado": agregar_constante_integracion(resultado),
        "pasos": [
            "Usamos la regla: ∫ log(x) dx = x log(x) - x + C.",
            f"Multiplicamos por la constante {formatear_numero(k)}.",
            f"Resultado: {agregar_constante_integracion(resultado)}"
        ]
    }


def integral_log_ax(a, k=1):
    """
    Calcula:

        ∫ k log(ax) dx = k[x log(ax) - x] + C

    Restricción:
        a debe ser real y distinto de 0.

    Usamos log.
    """
    if not es_real(a):
        raise ValueError("El valor de a debe ser un número real.")

    if a == 0:
        raise ValueError("El valor de a debe ser distinto de 0.")

    base = f"x log({formatear_numero(a)}x) - x"
    resultado = multiplicar_por_constante(k, base)

    return {
        "tipo": "indefinida",
        "funcion": f"{formatear_numero(k)}log({formatear_numero(a)}x)",
        "resultado": agregar_constante_integracion(resultado),
        "pasos": [
            "Usamos la regla: ∫ log(ax) dx = x log(ax) - x + C.",
            "La constante a debe ser distinta de 0.",
            f"Multiplicamos por la constante {formatear_numero(k)}.",
            f"Resultado: {agregar_constante_integracion(resultado)}"
        ]
    }


def menu_logaritmica():
    """
    Menú sencillo para integrales logarítmicas indefinidas.
    """
    while True:
        print("\n--- Integrales logarítmicas ---")
        print("1.- Integral de 1/x")
        print("2.- Integral de k/x")
        print("3.- Integral de log(x)")
        print("4.- Integral de k log(x)")
        print("5.- Integral de log(ax)")
        print("0.- Regresar")

        opcion = input("Seleccione una opción: ")

        if opcion == "0":
            return None

        try:
            if opcion == "1":
                return integral_uno_sobre_x()

            elif opcion == "2":
                k = float(input("Ingrese la constante k: "))
                return integral_uno_sobre_x(k)

            elif opcion == "3":
                return integral_log_x()

            elif opcion == "4":
                k = float(input("Ingrese la constante k: "))
                return integral_log_x(k)

            elif opcion == "5":
                a = float(input("Ingrese el valor de a: "))
                return integral_log_ax(a)

            else:
                print("Opción no válida.")

        except ValueError as error:
            print("Error:", error)
