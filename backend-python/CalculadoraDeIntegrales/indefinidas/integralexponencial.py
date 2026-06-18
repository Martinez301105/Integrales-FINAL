def es_real(numero):
    """
    Verifica si un número es real.
    """
    try:
        float(numero)
        return True
    except ValueError:
        return False


def formatear_numero(numero):
    """
    Quita el .0 cuando el número es entero.
    """
    numero = float(numero)

    if numero.is_integer():
        return str(int(numero))

    return str(numero)


def integral_e_x(k=1):
    """
    Calcula la integral indefinida de k*e^x.

    Regla:
    ∫ k e^x dx = k e^x + C
    """

    if not es_real(k):
        raise ValueError("La constante k debe ser un número real.")

    k = float(k)

    if k == 0:
        resultado = "0 + C"
    elif k == 1:
        resultado = "e^x + C"
    elif k == -1:
        resultado = "-e^x + C"
    else:
        resultado = formatear_numero(k) + "e^x + C"

    pasos = [
        "Integral a resolver: ∫ " + formatear_numero(k) + "e^x dx",
        "Usamos la regla: ∫ e^x dx = e^x + C",
        "Como " + formatear_numero(k) + " es constante, queda: " + resultado
    ]

    return {
        "resultado": resultado,
        "pasos": pasos
    }


def menu_integral_exponencial():
    """
    Menú para integrales exponenciales.
    """

    print("\n--- Integral exponencial ---")
    print("1. Integral de e^x")
    print("2. Integral de k e^x")

    opcion = input("Seleccione una opción: ")

    if opcion == "1":
        resultado = integral_e_x(1)

    elif opcion == "2":
        k = input("Ingrese la constante k: ")
        resultado = integral_e_x(k)

    else:
        print("Opción no válida.")
        return

    print("\nResultado:", resultado["resultado"])

    print("\nPasos:")
    for paso in resultado["pasos"]:
        print("-", paso)