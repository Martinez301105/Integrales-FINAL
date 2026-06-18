import math


def integral_x_n_definida(n, a, b):
    """
    Calcula la integral definida de x^n.

    ∫[a,b] x^n dx = [x^(n+1)/(n+1)] de a hasta b
    """

    if n == -1:
        if min(a, b) <= 0 <= max(a, b):
            return {
                "formula": "∫ 1/x dx = log|x| | de a hasta b",
                "resultado": "Error: el intervalo no puede contener x = 0."
            }

        resultado = math.log(abs(b)) - math.log(abs(a))

        return {
            "formula": "∫ 1/x dx = log|x| | de a hasta b",
            "resultado": resultado
        }

    resultado = (b ** (n + 1)) / (n + 1) - (a ** (n + 1)) / (n + 1)

    return {
        "formula": "∫ x^n dx = x^(n+1)/(n+1) | de a hasta b",
        "resultado": resultado
    }


def ejecutar_integral_x_n_definida():
    print("\n--- Integral definida de x^n ---")

    n = float(input("Ingrese el exponente n: "))
    a = float(input("Ingrese el límite inferior a: "))
    b = float(input("Ingrese el límite superior b: "))

    resultado = integral_x_n_definida(n, a, b)

    return resultado
