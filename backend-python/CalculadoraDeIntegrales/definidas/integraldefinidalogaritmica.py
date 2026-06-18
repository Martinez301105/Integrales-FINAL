import math


def integral_logaritmica_definida(coeficiente, a, b):
    """
    Calcula la integral definida de A/x.

    ∫ A/x dx = A log|x|
    """

    if min(a, b) <= 0 <= max(a, b):
        return {
            "formula": "∫ A/x dx = A log|x| | de a hasta b",
            "resultado": "Error: el intervalo no puede contener x = 0."
        }

    resultado = coeficiente * (math.log(abs(b)) - math.log(abs(a)))

    return {
        "formula": "∫ A/x dx = A log|x| | de a hasta b",
        "resultado": resultado
    }


def ejecutar_integral_logaritmica_definida():
    print("\n--- Integral definida logarítmica ---")
    print("Forma: A/x")

    coeficiente = float(input("Ingrese A: "))

    a = float(input("Ingrese el límite inferior a: "))
    b = float(input("Ingrese el límite superior b: "))

    resultado = integral_logaritmica_definida(coeficiente, a, b)

    return resultado
