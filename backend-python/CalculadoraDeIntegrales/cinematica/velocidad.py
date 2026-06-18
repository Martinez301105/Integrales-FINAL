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
            "Operación aplicada: acumular la aceleración para obtener velocidad.",
            explicacion,
            f"Resultado: {_resultado_en_t(resultado)}",
        ],
        "interpretacion": "La velocidad obtenida indica cómo queda expresado el movimiento después de acumular la aceleración.",
    }


def velocidad_desde_aceleracion():

    print("\n--- Obtener velocidad desde aceleración ---")

    print("1. Aceleración constante")
    print("2. Aceleración tipo potencia")
    print("3. Aceleración polinómica")

    opcion = input("Seleccione una opción: ")

    if opcion == "1":

        k = float(input("Ingrese la aceleración constante: "))

        resultado = integral_constante_indefinida(k)
        entrada = f"a(t) = {_formatear_numero(k)}"

        return _respuesta(
            "La velocidad se obtiene acumulando la aceleración a(t).",
            resultado["resultado"],
            entrada,
            "Una aceleración constante produce una velocidad lineal.",
        )

    elif opcion == "2":

        n = float(input("Ingrese el exponente n: "))

        resultado = integral_x_n(n)
        entrada = f"a(t) = t^{_formatear_numero(n)}"

        return _respuesta(
            "La velocidad se obtiene acumulando la aceleración a(t).",
            resultado,
            entrada,
            "Se aplica la regla de potencia para obtener la velocidad.",
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
        entrada = "a(t) = " + " + ".join(
            f"{_formatear_numero(coef)}t^{_formatear_numero(exp)}" for coef, exp in polinomio
        )

        return _respuesta(
            "La velocidad se obtiene acumulando término por término la aceleración polinómica.",
            resultado,
            entrada,
            "Cada término del polinomio se acumula por separado y luego se suman los resultados.",
        )

    print("Opción no válida.")
    return None
