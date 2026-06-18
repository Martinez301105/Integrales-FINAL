import math


MAX_ABS_ENTRADA = 1_000_000
MAX_SUBINTERVALOS = 100_000
MAX_MUESTRAS = 100_000
MAX_ITERACIONES = 1_000_000
MAX_TERMINOS_POLINOMIO = 10
MAX_ABS_EXPONENTE = 100


class ErrorDominioDarboux(ValueError):
    """Error con contexto del punto donde fallo la evaluacion."""


def validar_finito(valor, nombre="valor"):
    if not math.isfinite(valor):
        raise ValueError(f"{nombre} debe ser un numero real finito.")
    if abs(valor) > MAX_ABS_ENTRADA:
        raise ValueError(
            f"{nombre} es demasiado grande. Usa un valor entre "
            f"{-MAX_ABS_ENTRADA} y {MAX_ABS_ENTRADA}."
        )
    return valor


def validar_rango_real(valor, nombre, minimo=-MAX_ABS_ENTRADA, maximo=MAX_ABS_ENTRADA):
    validar_finito(valor, nombre)
    if valor < minimo or valor > maximo:
        raise ValueError(f"{nombre} debe estar entre {minimo} y {maximo}.")
    return valor


def validar_rango_entero(valor, nombre, minimo, maximo):
    if not isinstance(valor, int):
        raise ValueError(f"{nombre} debe ser un entero.")
    if valor < minimo or valor > maximo:
        raise ValueError(f"{nombre} debe estar entre {minimo} y {maximo}.")
    return valor


def pedir_float(mensaje, nombre="valor", minimo=-MAX_ABS_ENTRADA, maximo=MAX_ABS_ENTRADA):
    while True:
        texto = input(mensaje).strip()
        try:
            valor = float(texto)
            return validar_rango_real(valor, nombre, minimo, maximo)
        except (ValueError, OverflowError):
            print(
                f"Entrada invalida para {nombre}. Escribe un numero real entre "
                f"{minimo} y {maximo}; evita letras, simbolos y notacion cientifica extrema."
            )


def pedir_int(mensaje, nombre="valor", minimo=1, maximo=MAX_SUBINTERVALOS):
    while True:
        texto = input(mensaje).strip()
        try:
            if any(c in texto.lower() for c in (".", "e")):
                raise ValueError
            valor = int(texto)
            return validar_rango_entero(valor, nombre, minimo, maximo)
        except (ValueError, OverflowError):
            print(f"Entrada invalida para {nombre}. Escribe un entero entre {minimo} y {maximo}.")


def validar_carga_trabajo(n, muestras):
    validar_rango_entero(n, "subintervalos n", 1, MAX_SUBINTERVALOS)
    validar_rango_entero(muestras, "muestras", 1, MAX_MUESTRAS)

    total = n * muestras
    if total > MAX_ITERACIONES:
        raise ValueError(
            f"La carga de trabajo es demasiado alta: n*muestras={total:,}. "
            f"El maximo permitido es {MAX_ITERACIONES:,}. "
            "Usa menos subintervalos o menos muestras para evitar que el programa se congele."
        )
    return total


def evaluar_funcion_segura(funcion, punto):
    try:
        valor = funcion(punto)
    except (ValueError, ZeroDivisionError, OverflowError) as error:
        raise ErrorDominioDarboux(
            f"No se pudo evaluar la funcion en x={punto}. "
            f"Puede haber division por cero, raiz de numero negativo o desbordamiento. Detalle: {error}"
        ) from error
    except Exception as error:
        raise ErrorDominioDarboux(
            f"No se pudo evaluar la funcion en x={punto}. Detalle: {error}"
        ) from error

    if isinstance(valor, complex):
        raise ErrorDominioDarboux(
            f"La funcion produce un valor complejo en x={punto}; Darboux requiere valores reales."
        )
    try:
        valor = float(valor)
    except (TypeError, ValueError, OverflowError) as error:
        raise ErrorDominioDarboux(
            f"La funcion no produjo un numero real valido en x={punto}."
        ) from error
    if not math.isfinite(valor):
        raise ErrorDominioDarboux(
            f"La funcion no es finita en x={punto}; no se puede usar para esta aproximacion."
        )
    return valor


def potencia_real(x, n):
    try:
        valor = x ** n
    except (ValueError, OverflowError) as error:
        raise error
    return validar_finito(float(valor), "f(x)")


def seleccionarfuncion():
    print("\nSeleccione la funcion:")
    print("1. f(x) = x^n")
    print("2. f(x) = k")
    print("3. f(x) = A e^(kx)")
    print("4. f(x) = sen(x)")
    print("5. f(x) = cos(x)")
    print("6. f(x) = polinomio")

    opcion = input("Seleccione una opcion: ").strip()

    if opcion == "1":
        n = pedir_float("Ingrese el exponente n: ", "exponente n", -MAX_ABS_EXPONENTE, MAX_ABS_EXPONENTE)
        return lambda x: potencia_real(x, n), f"x^{n}"

    if opcion == "2":
        k = pedir_float("Ingrese la constante k: ", "constante k")
        return lambda _x: k, str(k)

    if opcion == "3":
        A = pedir_float("Ingrese A: ", "A")
        k = pedir_float("Ingrese k: ", "k", -MAX_ABS_EXPONENTE, MAX_ABS_EXPONENTE)

        def exponencial(x):
            return validar_finito(A * math.exp(k * x), "f(x)")

        return exponencial, f"{A}e^({k}x)"

    if opcion == "4":
        return math.sin, "sen(x)"

    if opcion == "5":
        return math.cos, "cos(x)"

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
            coeficiente = pedir_float("Coeficiente: ", "coeficiente")
            exponente = pedir_float(
                "Exponente: ",
                "exponente",
                -MAX_ABS_EXPONENTE,
                MAX_ABS_EXPONENTE,
            )
            polinomio.append((coeficiente, exponente))

        texto = " + ".join(f"{c}x^{e}" for c, e in polinomio)

        def evaluar_polinomio(x):
            total = 0.0
            for coeficiente, exponente in polinomio:
                total += coeficiente * potencia_real(x, exponente)
            return validar_finito(total, "f(x)")

        return evaluar_polinomio, texto

    raise ValueError("Opcion de funcion no valida. Elige un numero del 1 al 6.")


def integraldarbouxaproximada(funcion, a, b, n, muestras=20):
    validar_rango_real(a, "limite inferior a")
    validar_rango_real(b, "limite superior b")
    validar_carga_trabajo(n, muestras)

    if a == b:
        return 0.0, 0.0, 0.0, 0, a, b, b

    signo = 1
    inicio = a
    fin = b
    if a > b:
        signo = -1
        inicio, fin = b, a

    deltax = (fin - inicio) / n
    sumainferior = 0.0
    sumasuperior = 0.0
    total_evaluaciones = 0

    for i in range(n):
        izquierda = inicio + i * deltax
        derecha = inicio + (i + 1) * deltax
        valores = []

        for j in range(muestras):
            if muestras == 1:
                punto = (izquierda + derecha) / 2
            else:
                punto = izquierda + (derecha - izquierda) * j / (muestras - 1)
            valores.append(evaluar_funcion_segura(funcion, punto))
            total_evaluaciones += 1

        infimoaprox = min(valores)
        supremoaprox = max(valores)

        sumainferior += infimoaprox * deltax
        sumasuperior += supremoaprox * deltax

    if signo < 0:
        inferior_orientada = -sumasuperior
        superior_orientada = -sumainferior
        deltax_orientado = -deltax
    else:
        inferior_orientada = sumainferior
        superior_orientada = sumasuperior
        deltax_orientado = deltax

    return inferior_orientada, superior_orientada, deltax_orientado, total_evaluaciones, inicio, fin, signo


def pedir_parametros_darboux():
    while True:
        a = pedir_float("Ingrese el limite inferior a: ", "limite inferior a")
        b = pedir_float("Ingrese el limite superior b: ", "limite superior b")
        n = pedir_int("Ingrese la cantidad de subintervalos n: ", "subintervalos n", 1, MAX_SUBINTERVALOS)
        muestras = pedir_int("Ingrese muestras por subintervalo: ", "muestras", 1, MAX_MUESTRAS)
        try:
            validar_carga_trabajo(n, muestras)
            return a, b, n, muestras
        except ValueError as error:
            print(error)
            print("Intenta de nuevo con valores mas pequenos para n o muestras.")


def ejecutar_integral_darboux():
    print("\n--- Integral de Darboux ---")
    print("Esta version aproxima infimos y supremos usando varios puntos por subintervalo.")
    print(f"Para estabilidad, n*muestras no puede superar {MAX_ITERACIONES:,}.")

    try:
        funcion, texto = seleccionarfuncion()
        a, b, n, muestras = pedir_parametros_darboux()
        inferior, superior, deltax, evaluaciones, inicio, fin, signo = integraldarbouxaproximada(
            funcion,
            a,
            b,
            n,
            muestras,
        )
    except ErrorDominioDarboux as error:
        return {
            "metodo": "Integral de Darboux aproximada",
            "error": str(error),
            "resultado": "No se pudo completar el calculo porque la funcion no esta definida o no es finita en algun punto evaluado.",
            "pasos": [
                "Se intento evaluar la funcion en los puntos de muestra de cada subintervalo.",
                str(error),
                "Revisa el intervalo, evita puntos donde haya division por cero, raices no reales o desbordamientos.",
            ],
        }
    except ValueError as error:
        return {
            "metodo": "Integral de Darboux aproximada",
            "error": str(error),
            "resultado": "No se pudo completar el calculo por datos de entrada no validos.",
            "pasos": [
                "El programa valido la opcion de funcion, los limites, n, muestras y la carga total.",
                str(error),
                "Corrige los datos e intenta de nuevo.",
            ],
        }

    diferencia = superior - inferior
    orientacion = (
        "Como a>b, se calculo en el intervalo ordenado "
        f"[{inicio}, {fin}] y se cambio el signo de la integral."
        if signo < 0
        else "El intervalo ya estaba ordenado de menor a mayor."
    )

    return {
        "metodo": "Integral de Darboux aproximada",
        "formula": "f es Darboux integrable si para todo epsilon>0 existe una particion P tal que U(f,P)-L(f,P)<epsilon",
        "sustitucion": f"f(x) = {texto}, P divide [{a}, {b}] en {n} subintervalos",
        "anchura_subintervalo": deltax,
        "evaluaciones_realizadas": evaluaciones,
        "resultado": (
            f"L(f, P) aprox {inferior}; U(f, P) aprox {superior}; "
            f"U(f, P)-L(f, P) aprox {diferencia}."
        ),
        "nota": "Para funciones generales, el programa estima el valor mas pequeno y el valor mas grande de cada subintervalo usando muestras numericas.",
        "pasos": [
            f"Identificamos f(x) = {texto} en el intervalo [{a}, {b}].",
            orientacion,
            "Una particion es una lista ordenada de puntos que divide el intervalo en partes mas pequenas.",
            f"Con la particion elegida se forman {n} subintervalos consecutivos.",
            f"Cada subintervalo tiene anchura orientada {deltax}; el signo representa el sentido del intervalo original.",
            f"Se realizaron {evaluaciones} evaluaciones de la funcion, dentro del limite de seguridad.",
            "En cada subintervalo se busca el valor mas pequeno de la funcion. Ese valor sirve para la suma inferior.",
            "Tambien se busca el valor mas grande de la funcion. Ese valor sirve para la suma superior.",
            "La suma inferior se construye multiplicando cada minimo aproximado por la anchura del subintervalo y sumando todos esos productos.",
            "La suma superior se construye multiplicando cada maximo aproximado por la anchura del subintervalo y sumando todos esos productos.",
            f"Comparamos ambas sumas: U(f,P)-L(f,P) aprox {diferencia}.",
            "Si al refinar la particion esa diferencia puede hacerse menor que cualquier epsilon>0, entonces f es Darboux integrable.",
            "Cuando la integral inferior y la integral superior coinciden, se obtiene el valor de la integral definida.",
        ],
    }
