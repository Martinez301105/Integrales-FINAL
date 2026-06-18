import math
import re

MAX_DIGITOS_ENTRADA = 10

def validar_max_digitos(texto, nombre="entrada"):
    if len(re.findall(r"\d", str(texto or ""))) > MAX_DIGITOS_ENTRADA:
        raise ValueError(f"Error: {nombre} no puede exceder {MAX_DIGITOS_ENTRADA} dígitos.")

def pedir_float(mensaje, nombre="valor"):
    texto = input(mensaje)
    validar_max_digitos(texto, nombre)
    return float(texto)

def pedir_int(mensaje, nombre="valor"):
    texto = input(mensaje)
    validar_max_digitos(texto, nombre)
    return int(texto)


def seleccionarfuncion():
    print("\nSeleccione la función:")
    print("1. f(x) = x^n")
    print("2. f(x) = k")
    print("3. f(x) = A e^(kx)")
    print("4. f(x) = sen(x)")
    print("5. f(x) = cos(x)")
    print("6. f(x) = polinomio")

    opcion = input("Seleccione una opción: ").strip()

    if opcion == "1":
        n = pedir_float("Ingrese el exponente n: ", "exponente n")
        return lambda x: x ** n, f"x^{n}"

    if opcion == "2":
        k = pedir_float("Ingrese la constante k: ", "constante k")
        return lambda x: k, str(k)

    if opcion == "3":
        A = pedir_float("Ingrese A: ", "A")
        k = pedir_float("Ingrese k: ", "k")
        return lambda x: A * math.exp(k * x), f"{A}e^({k}x)"

    if opcion == "4":
        return math.sin, "sen(x)"

    if opcion == "5":
        return math.cos, "cos(x)"

    if opcion == "6":
        cantidad = pedir_int("Cantidad de términos: ", "cantidad de términos")
        if cantidad > 10:
            raise ValueError("Solo se permiten como máximo 10 términos en el polinomio.")
        polinomio = []

        for i in range(cantidad):
            coeficiente = pedir_float("Coeficiente: ", "coeficiente")
            exponente = pedir_float("Exponente: ", "exponente")
            polinomio.append((coeficiente, exponente))

        texto = " + ".join(f"{c}x^{e}" for c, e in polinomio)
        return lambda x: sum(c * (x ** e) for c, e in polinomio), texto

    raise ValueError("Opción de función no válida.")


def sumariemann(funcion, a, b, n, tipo):
    if n <= 0:
        raise ValueError("n debe ser mayor que 0.")

    deltax = (b - a) / n
    suma = 0
    particion = [a + i * deltax for i in range(n + 1)]
    seleccion = []
    terminos = []

    for i in range(1, n + 1):
        izquierda = particion[i - 1]
        derecha = particion[i]

        if tipo == "izquierda":
            punto = izquierda
        elif tipo == "derecha":
            punto = derecha
        elif tipo == "media":
            punto = (izquierda + derecha) / 2
        else:
            raise ValueError("El tipo debe ser izquierda, derecha o media.")

        valor = funcion(punto)
        parcial = valor * (derecha - izquierda)
        seleccion.append(punto)
        terminos.append((i, punto, izquierda, derecha, valor, parcial))
        suma += parcial

    return suma, deltax, particion, seleccion, terminos


def ejecutar_suma_riemann():
    print("\n--- Sumas de Riemann ---")
    funcion, texto = seleccionarfuncion()

    a = pedir_float("Ingrese el límite inferior a: ", "límite inferior a")
    b = pedir_float("Ingrese el límite superior b: ", "límite superior b")
    n = pedir_int("Ingrese la cantidad de subintervalos n: ", "subintervalos n")

    print("\nTipo de suma:")
    print("1. Izquierda")
    print("2. Derecha")
    print("3. Punto medio")
    opcion = input("Seleccione una opción: ").strip()

    if opcion == "1":
        tipo = "izquierda"
    elif opcion == "2":
        tipo = "derecha"
    elif opcion == "3":
        tipo = "media"
    else:
        raise ValueError("Opción no válida.")

    resultado, deltax, particion, seleccion, terminos = sumariemann(funcion, a, b, n, tipo)
    nombres = {"izquierda": "puntos izquierdos", "derecha": "puntos derechos", "media": "puntos medios"}
    seleccion_texto = nombres[tipo]

    return {
        "metodo": "Suma de Riemann",
        "formula": "S(f, P, A) = Σ f(sᵢ)(tᵢ - tᵢ₋₁)",
        "sustitucion": f"f(x) = {texto}, [a,b] = [{a},{b}], P = {particion}, A = {seleccion}, tipo = {seleccion_texto}",
        "delta_x": deltax,
        "resultado": f"S(f, P, A) ≈ {resultado}",
        "pasos": [
            "Identificamos la función f(x) que se va a evaluar.",
            f"Tomamos el intervalo [a,b] = [{a},{b}] y n = {n} subintervalos.",
            f"Como la partición es uniforme, Δx = (b-a)/n = ({b}-{a})/{n} = {deltax}.",
            f"La partición es P = {particion}.",
            f"La selección usada es A = {seleccion}, correspondiente a {seleccion_texto}.",
            "Cada término f(sᵢ)(tᵢ-tᵢ₋₁) representa el área aproximada de un rectángulo.",
            "En cada rectángulo, f(sᵢ) es la altura y tᵢ-tᵢ₋₁ es la base.",
            "Sumamos todos los rectángulos para obtener S(f, P, A).",
        ],
        "terminos": terminos
    }
