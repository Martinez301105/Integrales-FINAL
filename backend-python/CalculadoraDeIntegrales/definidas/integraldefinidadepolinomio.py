import math


MAX_TERMINOS = 10
MAX_ABS_ENTRADA = 1_000_000
MAX_ABS_EXPONENTE = 100


def validar_numero_real(valor, nombre):
    if not math.isfinite(valor):
        raise ValueError(f"{nombre} debe ser un numero real finito.")
    if abs(valor) > MAX_ABS_ENTRADA:
        raise ValueError(f"{nombre} debe estar entre {-MAX_ABS_ENTRADA} y {MAX_ABS_ENTRADA}.")
    return valor


def pedir_float(mensaje, nombre="valor", minimo=-MAX_ABS_ENTRADA, maximo=MAX_ABS_ENTRADA):
    while True:
        texto = input(mensaje).strip()
        try:
            valor = float(texto)
            validar_numero_real(valor, nombre)
            if valor < minimo or valor > maximo:
                raise ValueError(f"{nombre} debe estar entre {minimo} y {maximo}.")
            return valor
        except (ValueError, OverflowError) as error:
            print(f"Entrada invalida para {nombre}: {error}. Intenta de nuevo.")


def pedir_int(mensaje, nombre="valor", minimo=1, maximo=MAX_TERMINOS):
    while True:
        texto = input(mensaje).strip()
        try:
            if any(c in texto.lower() for c in (".", "e")):
                raise ValueError(f"{nombre} debe ser un entero.")
            valor = int(texto)
            if valor < minimo or valor > maximo:
                raise ValueError(f"{nombre} debe estar entre {minimo} y {maximo}.")
            return valor
        except (ValueError, OverflowError) as error:
            print(f"Entrada invalida para {nombre}: {error}. Intenta de nuevo.")


def intervalo_contiene_cero(a, b):
    return min(a, b) <= 0 <= max(a, b)


def potencia_segura(base, exponente):
    valor = base ** exponente
    return validar_numero_real(float(valor), "potencia")


def integrar_polinomio_definido(polinomio, a, b):
    """
    Calcula la integral definida de un polinomio.

    El polinomio se recibe como una lista de tuplas:
    [(coeficiente, exponente), ...]
    """

    try:
        validar_numero_real(a, "limite inferior a")
        validar_numero_real(b, "limite superior b")

        resultado = 0

        for coef, exp in polinomio:
            validar_numero_real(coef, "coeficiente")
            validar_numero_real(exp, "exponente")

            if exp < 0 and intervalo_contiene_cero(a, b):
                return {
                    "formula": "integral coef*x^exp dx",
                    "resultado": "Error: el intervalo no puede contener x = 0 cuando hay exponentes negativos."
                }

            if exp == -1:
                resultado += coef * (math.log(abs(b)) - math.log(abs(a)))
            else:
                nuevo_exp = exp + 1
                termino_b = potencia_segura(b, nuevo_exp) / nuevo_exp
                termino_a = potencia_segura(a, nuevo_exp) / nuevo_exp
                resultado += coef * (termino_b - termino_a)

        validar_numero_real(resultado, "resultado")

        return {
            "formula": "integral P(x) dx = F(b) - F(a)",
            "resultado": resultado
        }
    except (OverflowError, ValueError, ZeroDivisionError) as error:
        return {
            "formula": "integral P(x) dx = F(b) - F(a)",
            "resultado": f"Error de calculo: {error}"
        }


def ejecutar_integral_polinomio_definida():
    print("\n--- Integral definida de un polinomio ---")

    cantidad = pedir_int("Cantidad de terminos: ", "cantidad de terminos", 1, MAX_TERMINOS)

    polinomio = []

    for i in range(cantidad):
        print(f"Termino {i + 1}:")
        coef = pedir_float("Coeficiente: ", "coeficiente")
        exp = pedir_float("Exponente: ", "exponente", -MAX_ABS_EXPONENTE, MAX_ABS_EXPONENTE)

        polinomio.append((coef, exp))

    a = pedir_float("Ingrese el limite inferior a: ", "limite inferior a")
    b = pedir_float("Ingrese el limite superior b: ", "limite superior b")

    resultado = integrar_polinomio_definido(polinomio, a, b)

    return resultado
