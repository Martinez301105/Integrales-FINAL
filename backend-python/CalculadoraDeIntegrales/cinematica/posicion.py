from indefinidas.integraldeunaconstante import integral_constante_indefinida
from indefinidas.integraldeunexponente import integral_x_n
from indefinidas.integraldeunpolinomio import integrar_polinomio


def _resultado_en_t(resultado):
    return str(resultado).replace("x", "t")


def _formatear_numero(valor):
    try:
        numero = float(valor)
        if abs(numero) < 1e-12:
            return "0"
        texto = f"{numero:.6f}".rstrip("0").rstrip(".")
        return texto if texto else "0"
    except (TypeError, ValueError):
        return str(valor)


def _respuesta(formula, resultado, entrada, explicacion):
    return {
        "formula": formula,
        "resultado": _resultado_en_t(resultado),
        "pasos": [
            f"Función usada: {entrada}",
            "Operación aplicada: acumular la velocidad para obtener posición.",
            explicacion,
            f"Resultado: {_resultado_en_t(resultado)}",
        ],
        "interpretacion": "La posición obtenida describe el cambio de ubicación producido por la velocidad.",
    }


def posicion_desde_velocidad():

    print("\n--- Obtener posición desde velocidad ---")

    print("1. Velocidad constante")
    print("2. Velocidad tipo potencia")
    print("3. Velocidad polinómica")

    opcion = input("Seleccione una opción: ")

    if opcion == "1":

        k = float(input("Ingrese la velocidad constante: "))

        resultado = integral_constante_indefinida(k)
        entrada = f"v(t) = {_formatear_numero(k)}"

        return _respuesta(
            "La posición se obtiene acumulando la velocidad v(t).",
            resultado["resultado"],
            entrada,
            "Una velocidad constante produce una posición lineal.",
        )

    elif opcion == "2":

        n = float(input("Ingrese el exponente n: "))

        resultado = integral_x_n(n)
        entrada = f"v(t) = t^{_formatear_numero(n)}"

        return _respuesta(
            "La posición se obtiene acumulando la velocidad v(t).",
            resultado,
            entrada,
            "Se aplica la regla de potencia para obtener la posición.",
        )

    elif opcion == "3":

        cantidad = int(input("Cantidad de términos: "))
        if cantidad > 10:
            raise ValueError("Solo se permiten como máximo 10 términos en el polinomio.")

        polinomio = []

        for i in range(cantidad):

            coef = float(input("Coeficiente: "))
            exp = float(input("Exponente: "))

            polinomio.append((coef, exp))

        resultado = integrar_polinomio(polinomio)
        entrada = "v(t) = " + " + ".join(
            f"{_formatear_numero(coef)}t^{_formatear_numero(exp)}" for coef, exp in polinomio
        )

        return _respuesta(
            "La posición se obtiene acumulando término por término la velocidad polinómica.",
            resultado,
            entrada,
            "Cada término del polinomio se acumula por separado y luego se suman los resultados.",
        )

    print("Opción no válida.")
    return None
