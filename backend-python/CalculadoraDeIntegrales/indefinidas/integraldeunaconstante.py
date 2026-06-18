import math


def es_real(valor):
    """
    Verifica que el valor sea un número real válido en Python.
    Acepta int y float.
    Rechaza bool, infinito y NaN.
    """
    if isinstance(valor, bool):
        return False

    if not isinstance(valor, (int, float)):
        return False

    if isinstance(valor, float):
        return not (math.isinf(valor) or math.isnan(valor))

    return True


def validar_real(valor, nombre):

    """
    Lanza un error si el valor no es real.
    """
    if isinstance(valor, bool):
        raise ValueError(f"{nombre} debe ser un número real, no booleano.")

    if not isinstance(valor, (int, float)):
        raise ValueError(f"{nombre} debe ser un número real.")

    if isinstance(valor, float):
        if math.isnan(valor):
            raise ValueError(f"{nombre} no puede ser NaN.")
        if math.isinf(valor):
            raise ValueError(f"{nombre} no puede ser infinito.")


def integral_constante_indefinida(k):

    """
    Calcula la integral indefinida de una constante:

        ∫ k dx = kx + C
    """

    validar_real(k, "La constante")

    if k == 0:
        resultado = "C"
    elif k == 1:
        resultado = "x + C"
    elif k == -1:
        resultado = "-x + C"
    else:
        resultado = f"{k}x + C"

    pasos = [
        f"Tenemos la integral ∫ {k} dx.",
        "La regla para integrar una constante es:",
        "∫ k dx = kx + C",
        f"Por lo tanto, ∫ {k} dx = {resultado}."
    ]

    return {
        "tipo": "indefinida",
        "constante": k,
        "resultado": resultado,
        "pasos": pasos
    }
