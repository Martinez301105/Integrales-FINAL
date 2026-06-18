import math


def formatear_numero(valor):
    if not isinstance(valor, (int, float)) or isinstance(valor, bool):
        return str(valor)
    if not math.isfinite(valor):
        return str(valor)
    if abs(valor) < 1e-12:
        return "0"
    texto = f"{valor:.6f}".rstrip("0").rstrip(".")
    return texto if texto else "0"


def integrar_trapecio(funcion, a, b, n=2000):
    if not math.isfinite(a) or not math.isfinite(b):
        raise ValueError("Los tiempos deben ser números finitos.")
    if b <= a:
        raise ValueError("El tiempo final debe ser mayor al inicial.")
    if not isinstance(n, int) or n <= 0:
        raise ValueError("n debe ser un entero positivo.")

    h = (b - a) / n
    fa = funcion(a)
    fb = funcion(b)
    if not math.isfinite(fa) or not math.isfinite(fb):
        raise ValueError("La función no se pudo evaluar correctamente en los extremos del intervalo.")

    suma = 0.5 * (fa + fb)
    for i in range(1, n):
        t = a + i * h
        valor = funcion(t)
        if not math.isfinite(valor):
            raise ValueError(f"La función no se pudo evaluar correctamente en t={formatear_numero(t)}.")
        suma += valor
    return suma * h


def pedir_funcion_velocidad():
    print("1. Velocidad constante")
    print("2. Velocidad tipo potencia")
    print("3. Velocidad polinómica")

    opcion = input("Seleccione una opción: ")

    if opcion == "1":
        k = float(input("Ingrese la velocidad constante: "))
        return lambda t: k, f"v(t) = {formatear_numero(k)}"

    if opcion == "2":
        n_exp = float(input("Ingrese el exponente n: "))
        return lambda t: t ** n_exp, f"v(t) = t^{formatear_numero(n_exp)}"

    if opcion == "3":
        cantidad = int(input("Cantidad de términos: "))
        if cantidad > 10:
            raise ValueError("Solo se permiten como máximo 10 términos en el polinomio.")
        polinomio = []
        for i in range(cantidad):
            coef = float(input("Coeficiente: "))
            exp = float(input("Exponente: "))
            polinomio.append((coef, exp))

        def velocidad_funcion(t):
            return sum(coef * (t ** exp) for coef, exp in polinomio)

        entrada = "v(t) = " + " + ".join(
            f"{formatear_numero(coef)}t^{formatear_numero(exp)}" for coef, exp in polinomio
        )
        return velocidad_funcion, entrada

    print("Opción no válida.")
    return None, None


def pedir_intervalo():
    t1 = float(input("Ingrese el tiempo inicial (t1): "))
    t2 = float(input("Ingrese el tiempo final (t2): "))
    if t2 <= t1:
        print("Error: El tiempo final debe ser mayor al inicial.")
        return None, None
    return t1, t2


def velocidad_media():
    print("\n--- Velocidad media ---")
    velocidad_funcion, entrada = pedir_funcion_velocidad()
    if velocidad_funcion is None:
        return None

    t1, t2 = pedir_intervalo()
    if t1 is None:
        return None

    desplazamiento = integrar_trapecio(velocidad_funcion, t1, t2)
    duracion = t2 - t1
    velocidad_media_resultado = desplazamiento / duracion

    return {
        "formula": "Velocidad media = desplazamiento dividido entre duración del intervalo.",
        "resultado": f"{formatear_numero(velocidad_media_resultado)} unidades/s",
        "pasos": [
            f"Función usada: {entrada}",
            f"Intervalo: desde t1={formatear_numero(t1)} hasta t2={formatear_numero(t2)}.",
            f"Desplazamiento aproximado: {formatear_numero(desplazamiento)} unidades.",
            f"Duración: {formatear_numero(duracion)} unidades de tiempo.",
            f"Velocidad media: {formatear_numero(velocidad_media_resultado)} unidades/s.",
        ],
        "interpretacion": "Es la velocidad constante que produciría el mismo cambio neto de posición en el mismo tiempo.",
    }
