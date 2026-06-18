import math


MAX_ABS_ENTRADA = 1_000_000
MAX_ABS_RESULTADO = 1_000_000_000_000_000
MAX_EXP_ARG = 700


def validar_numero_real(valor, nombre):
    if not math.isfinite(valor):
        raise ValueError(f"{nombre} debe ser un numero real finito.")
    if abs(valor) > MAX_ABS_ENTRADA:
        raise ValueError(
            f"{nombre} es demasiado grande. Usa un valor entre "
            f"{-MAX_ABS_ENTRADA} y {MAX_ABS_ENTRADA}."
        )
    return valor


def pedir_float_seguro(mensaje, nombre="valor"):
    while True:
        texto = input(mensaje).strip()
        if not texto:
            print(f"Entrada vacia. Escribe un numero para {nombre}.")
            continue

        try:
            return validar_numero_real(float(texto), nombre)
        except (ValueError, OverflowError) as error:
            print(f"Entrada invalida para {nombre}: {error}. Intenta de nuevo.")


def validar_resultado(valor):
    if not math.isfinite(valor):
        raise OverflowError("El resultado no es finito.")
    if abs(valor) > MAX_ABS_RESULTADO:
        raise OverflowError(
            f"El resultado es demasiado grande para mostrarse con seguridad: {valor}."
        )
    return valor


def exp_seguro(argumento, nombre):
    if argumento > MAX_EXP_ARG:
        raise OverflowError(
            f"{nombre}={argumento} es demasiado grande para calcular e^({nombre}) sin desbordamiento."
        )
    return math.exp(argumento)


def integral_exponencial_definida(coeficiente, constante, a, b):
    """
    Calcula la integral definida de A e^(kx).

    integral A e^(kx) dx = (A/k)e^(kx), si k != 0
    """

    try:
        coeficiente = validar_numero_real(float(coeficiente), "A")
        constante = validar_numero_real(float(constante), "k")
        a = validar_numero_real(float(a), "limite inferior a")
        b = validar_numero_real(float(b), "limite superior b")

        if constante == 0:
            resultado = validar_resultado(coeficiente * (b - a))
            formula = "integral A dx = A(x) | de a hasta b"
        else:
            exp_b = exp_seguro(constante * b, "k*b")
            exp_a = exp_seguro(constante * a, "k*a")
            resultado = validar_resultado((coeficiente / constante) * (exp_b - exp_a))
            formula = "integral A e^(kx) dx = (A/k)e^(kx) | de a hasta b"

        if a > b:
            signo = " El limite inferior es mayor que el superior; el resultado queda con el signo orientado del intervalo."
        else:
            signo = ""

        return {
            "formula": formula,
            "resultado": f"{resultado};{signo}" if signo else resultado
        }
    except (ValueError, OverflowError, ZeroDivisionError) as error:
        return {
            "formula": "integral A e^(kx) dx = (A/k)e^(kx) | de a hasta b",
            "resultado": f"Error: {error}"
        }


def ejecutar_integral_exponencial_definida():
    print("\n--- Integral definida exponencial ---")
    print("Forma: A e^(kx)")

    coeficiente = pedir_float_seguro("Ingrese A: ", "A")
    constante = pedir_float_seguro("Ingrese k: ", "k")

    a = pedir_float_seguro("Ingrese el limite inferior a: ", "limite inferior a")
    b = pedir_float_seguro("Ingrese el limite superior b: ", "limite superior b")

    if a > b:
        print("Aviso: el limite inferior es mayor que el superior; el resultado tendra signo orientado.")

    resultado = integral_exponencial_definida(coeficiente, constante, a, b)

    return resultado
