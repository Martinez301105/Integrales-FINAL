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
        if expresion.startswith("-"):
            return expresion[1:]
        return f"-({expresion})"

    return f"{formatear_numero(k)}({expresion})"


def integral_sen(k=1):
    """
    Calcula:

        ∫ k sen(x) dx = -k cos(x) + C
    """
    base = "-cos(x)"
    resultado = multiplicar_por_constante(k, base)

    return {
        "tipo": "indefinida",
        "funcion": f"{formatear_numero(k)}sen(x)",
        "resultado": agregar_constante_integracion(resultado),
        "pasos": [
            "Usamos la regla: ∫ sen(x) dx = -cos(x) + C.",
            f"Multiplicamos por la constante {formatear_numero(k)}.",
            f"Resultado: {agregar_constante_integracion(resultado)}"
        ]
    }


def integral_cos(k=1):
    """
    Calcula:

        ∫ k cos(x) dx = k sen(x) + C
    """
    base = "sen(x)"
    resultado = multiplicar_por_constante(k, base)

    return {
        "tipo": "indefinida",
        "funcion": f"{formatear_numero(k)}cos(x)",
        "resultado": agregar_constante_integracion(resultado),
        "pasos": [
            "Usamos la regla: ∫ cos(x) dx = sen(x) + C.",
            f"Multiplicamos por la constante {formatear_numero(k)}.",
            f"Resultado: {agregar_constante_integracion(resultado)}"
        ]
    }


def integral_tan(k=1):
    """
    Calcula:

        ∫ k tan(x) dx = -k log(|cos(x)|) + C

    Usamos log.
    """
    base = "-log(|cos(x)|)"
    resultado = multiplicar_por_constante(k, base)

    return {
        "tipo": "indefinida",
        "funcion": f"{formatear_numero(k)}tan(x)",
        "resultado": agregar_constante_integracion(resultado),
        "pasos": [
            "Usamos la regla: ∫ tan(x) dx = -log(|cos(x)|) + C.",
            f"Multiplicamos por la constante {formatear_numero(k)}.",
            f"Resultado: {agregar_constante_integracion(resultado)}"
        ]
    }


def integral_arcsen(k=1):
    """
    Calcula:

        ∫ k arcsen(x) dx = k[x arcsen(x) + sqrt(1 - x^2)] + C
    """
    base = "x arcsen(x) + sqrt(1 - x^2)"
    resultado = multiplicar_por_constante(k, base)

    return {
        "tipo": "indefinida",
        "funcion": f"{formatear_numero(k)}arcsen(x)",
        "resultado": agregar_constante_integracion(resultado),
        "pasos": [
            "Usamos la regla: ∫ arcsen(x) dx = x arcsen(x) + sqrt(1 - x^2) + C.",
            f"Multiplicamos por la constante {formatear_numero(k)}.",
            f"Resultado: {agregar_constante_integracion(resultado)}"
        ]
    }


def integral_arccos(k=1):
    """
    Calcula:

        ∫ k arccos(x) dx = k[x arccos(x) - sqrt(1 - x^2)] + C
    """
    base = "x arccos(x) - sqrt(1 - x^2)"
    resultado = multiplicar_por_constante(k, base)

    return {
        "tipo": "indefinida",
        "funcion": f"{formatear_numero(k)}arccos(x)",
        "resultado": agregar_constante_integracion(resultado),
        "pasos": [
            "Usamos la regla: ∫ arccos(x) dx = x arccos(x) - sqrt(1 - x^2) + C.",
            f"Multiplicamos por la constante {formatear_numero(k)}.",
            f"Resultado: {agregar_constante_integracion(resultado)}"
        ]
    }


def integral_arctan(k=1):
    """
    Calcula:

        ∫ k arctan(x) dx = k[x arctan(x) - (1/2)log(1 + x^2)] + C

    Usamos log.
    """
    base = "x arctan(x) - (1/2)log(1 + x^2)"
    resultado = multiplicar_por_constante(k, base)

    return {
        "tipo": "indefinida",
        "funcion": f"{formatear_numero(k)}arctan(x)",
        "resultado": agregar_constante_integracion(resultado),
        "pasos": [
            "Usamos la regla: ∫ arctan(x) dx = x arctan(x) - (1/2)log(1 + x^2) + C.",
            f"Multiplicamos por la constante {formatear_numero(k)}.",
            f"Resultado: {agregar_constante_integracion(resultado)}"
        ]
    }


def menu_trigonometrica():
    """
    Menú sencillo para integrales trigonométricas indefinidas.
    """
    while True:
        print("\n--- Integrales trigonométricas ---")
        print("1.- Integral de sen(x)")
        print("2.- Integral de cos(x)")
        print("3.- Integral de tan(x)")
        print("4.- Integral de arcsen(x)")
        print("5.- Integral de arccos(x)")
        print("6.- Integral de arctan(x)")
        print("0.- Regresar")

        opcion = input("Seleccione una opción: ")

        if opcion == "0":
            return None

        try:
            k = float(input("Ingrese la constante que multiplica a la función: "))

            if opcion == "1":
                return integral_sen(k)
            elif opcion == "2":
                return integral_cos(k)
            elif opcion == "3":
                return integral_tan(k)
            elif opcion == "4":
                return integral_arcsen(k)
            elif opcion == "5":
                return integral_arccos(k)
            elif opcion == "6":
                return integral_arctan(k)
            else:
                print("Opción no válida.")

        except ValueError as error:
            print("Error:", error)
