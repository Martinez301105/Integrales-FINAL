import math


MAX_ABS_ENTRADA = 1_000_000_000
MAX_ABS_RESULTADO = 1_000_000_000_000_000


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


def integral_constante_definida(k, a, b):
    """
    Calcula la integral definida de una constante.

    integral[a,b] k dx = k(b - a)
    """

    try:
        k = validar_numero_real(float(k), "constante k")
        a = validar_numero_real(float(a), "limite inferior a")
        b = validar_numero_real(float(b), "limite superior b")

        resultado = validar_resultado(k * (b - a))
        if a > b:
            signo = " El limite inferior es mayor que el superior, por eso b-a es negativo y el signo se invierte."
        else:
            signo = ""

        return {
            "formula": "integral k dx = kx | de a hasta b",
            "resultado": f"{resultado};{signo}" if signo else resultado
        }
    except (ValueError, OverflowError) as error:
        return {
            "formula": "integral k dx = kx | de a hasta b",
            "resultado": f"Error: {error}"
        }


def ejecutar_integral_constante_definida():
    print("\n--- Integral definida de una constante ---")

    k = pedir_float_seguro("Ingrese la constante k: ", "constante k")
    a = pedir_float_seguro("Ingrese el limite inferior a: ", "limite inferior a")
    b = pedir_float_seguro("Ingrese el limite superior b: ", "limite superior b")

    if a > b:
        print("Aviso: el limite inferior es mayor que el superior; el resultado tendra signo contrario.")

    resultado = integral_constante_definida(k, a, b)

    return resultado
