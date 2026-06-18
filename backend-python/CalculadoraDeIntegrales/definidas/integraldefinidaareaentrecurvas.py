import math


MAX_SUBINTERVALOS = 500_000
MAX_ABS_ENTRADA = 1_000_000
MAX_ABS_EXPONENTE = 100
MAX_TERMINOS_POLINOMIO = 10


class ErrorCalculoArea(ValueError):
    pass


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


def pedir_int(mensaje, nombre="valor", minimo=1, maximo=MAX_SUBINTERVALOS, limitar=False):
    while True:
        texto = input(mensaje).strip()
        try:
            if any(c in texto.lower() for c in (".", "e")):
                raise ValueError(f"{nombre} debe ser un entero.")
            valor = int(texto)
            if valor < minimo:
                raise ValueError(f"{nombre} debe ser mayor o igual que {minimo}.")
            if valor > maximo:
                if limitar:
                    print(f"{nombre} supera {maximo}. Se usara automaticamente {maximo}.")
                    return maximo
                raise ValueError(f"{nombre} debe ser menor o igual que {maximo}.")
            return valor
        except (ValueError, OverflowError) as error:
            print(f"Entrada invalida para {nombre}: {error}. Intenta de nuevo.")


def evaluar_seguro(funcion, x, nombre_funcion="funcion"):
    try:
        valor = funcion(x)
    except ErrorCalculoArea:
        raise
    except (OverflowError, ValueError, ZeroDivisionError) as error:
        raise ErrorCalculoArea(
            f"No se pudo evaluar {nombre_funcion} en x={x}. "
            f"El intervalo puede causar desbordamiento, raiz no real, potencia invalida o division por cero. Detalle: {error}"
        ) from error
    except Exception as error:
        raise ErrorCalculoArea(f"No se pudo evaluar {nombre_funcion} en x={x}. Detalle: {error}") from error

    if isinstance(valor, complex):
        raise ErrorCalculoArea(f"{nombre_funcion} produjo un valor complejo en x={x}.")
    try:
        valor = float(valor)
    except (TypeError, ValueError, OverflowError) as error:
        raise ErrorCalculoArea(f"{nombre_funcion} no produjo un numero real en x={x}.") from error
    if not math.isfinite(valor):
        raise ErrorCalculoArea(f"{nombre_funcion} no es finita en x={x}.")
    return valor


def potencia_segura(x, exponente):
    valor = x ** exponente
    return validar_numero_real(float(valor), "f(x)")


def integrar_trapecio(funcion, a, b, n=1000):
    if n <= 0:
        raise ValueError("n debe ser mayor que 0.")
    if n > MAX_SUBINTERVALOS:
        n = MAX_SUBINTERVALOS

    h = (b - a) / n
    suma = 0.5 * (evaluar_seguro(funcion, a) + evaluar_seguro(funcion, b))

    for i in range(1, n):
        x = a + i * h
        suma += evaluar_seguro(funcion, x)

    return suma * h


def seleccionar_funcion(nombre):
    while True:
        print(f"\nSeleccione la funcion {nombre}:")
        print("1. f(x) = x^n")
        print("2. f(x) = k")
        print("3. f(x) = A e^(kx)")
        print("4. f(x) = sen(x)")
        print("5. f(x) = cos(x)")
        print("6. f(x) = polinomio")

        opcion = input("Seleccione una opcion: ").strip()

        if opcion == "1":
            n = pedir_float("Ingrese el exponente n: ", "exponente n", -MAX_ABS_EXPONENTE, MAX_ABS_EXPONENTE)
            return lambda x: potencia_segura(x, n)

        if opcion == "2":
            k = pedir_float("Ingrese la constante k: ", "constante k")
            return lambda _x: k

        if opcion == "3":
            A = pedir_float("Ingrese A: ", "A")
            k = pedir_float("Ingrese k: ", "k", -MAX_ABS_EXPONENTE, MAX_ABS_EXPONENTE)

            def exponencial(x):
                return validar_numero_real(A * math.exp(k * x), "f(x)")

            return exponencial

        if opcion == "4":
            return math.sin

        if opcion == "5":
            return math.cos

        if opcion == "6":
            cantidad = pedir_int(
                "Cantidad de terminos: ",
                "cantidad de terminos",
                1,
                MAX_TERMINOS_POLINOMIO,
            )
            polinomio = []

            for i in range(cantidad):
                print(f"Termino {i + 1}:")
                coef = pedir_float("Coeficiente: ", "coeficiente")
                exp = pedir_float("Exponente: ", "exponente", -MAX_ABS_EXPONENTE, MAX_ABS_EXPONENTE)
                polinomio.append((coef, exp))

            def evaluar_polinomio(x):
                return validar_numero_real(sum(coef * potencia_segura(x, exp) for coef, exp in polinomio), "f(x)")

            return evaluar_polinomio

        print("Opcion no valida. Elige un numero del 1 al 6.")


def area_entre_curvas(funcion_1, funcion_2, a, b, n=1000):
    """
    Calcula el area entre dos curvas.

    A = integral[a,b] |f(x) - g(x)| dx
    """

    if n > MAX_SUBINTERVALOS:
        n = MAX_SUBINTERVALOS

    def diferencia_absoluta(x):
        y1 = evaluar_seguro(funcion_1, x, "funcion 1")
        y2 = evaluar_seguro(funcion_2, x, "funcion 2")
        return abs(y1 - y2)

    resultado = integrar_trapecio(diferencia_absoluta, a, b, n)

    return abs(resultado)


def ejecutar_area_entre_curvas():
    print("\n--- Area entre curvas ---")

    try:
        funcion_1 = seleccionar_funcion("1")
        funcion_2 = seleccionar_funcion("2")

        a = pedir_float("Ingrese el limite inferior a: ", "limite inferior a")
        b = pedir_float("Ingrese el limite superior b: ", "limite superior b")
        n = pedir_int(
            "Ingrese la cantidad de subintervalos n: ",
            "subintervalos n",
            1,
            MAX_SUBINTERVALOS,
            limitar=True,
        )

        resultado = area_entre_curvas(funcion_1, funcion_2, a, b, n)

        return {
            "formula": "A = integral |f(x) - g(x)| dx",
            "resultado": resultado
        }
    except (ValueError, ErrorCalculoArea) as error:
        return {
            "formula": "A = integral |f(x) - g(x)| dx",
            "resultado": f"Error: {error}"
        }
