import sympy as sp
import numpy as np
import math

from sympy.parsing.sympy_parser import (
    parse_expr,
    standard_transformations,
    implicit_multiplication_application,
    convert_xor,
    function_exponentiation,
)

# --------------------------------------------------
# Configuración para leer expresiones tipo:
# 2x, x^2, sen(x), cos(x), exp(x), log(x), sqrt(x)
# --------------------------------------------------

transformaciones = (
    standard_transformations
    + (implicit_multiplication_application, convert_xor, function_exponentiation)
)

x = sp.Symbol("x")
u = sp.Symbol("u")

funciones_permitidas = {
    "x": x,
    "u": u,
    "sin": sp.sin,
    "sen": sp.sin,
    "cos": sp.cos,
    "tan": sp.tan,
    "sec": sp.sec,
    "csc": sp.csc,
    "cot": sp.cot,
    "asin": sp.asin,
    "arcsin": sp.asin,
    "arcsen": sp.asin,
    "acos": sp.acos,
    "arccos": sp.acos,
    "atan": sp.atan,
    "arctan": sp.atan,
    "exp": sp.exp,
    "log": sp.log,
    "sqrt": sp.sqrt,
    "pi": sp.pi,
    "e": sp.E
}


def leer_expresion(texto):
    """
    Convierte texto del usuario en una expresión de SymPy.
    """
    return parse_expr(
        texto,
        local_dict=funciones_permitidas,
        transformations=transformaciones
    )


def es_numero_real(valor):
    """
    Verifica con math si un valor numérico es real y finito.
    """
    try:
        valor_float = float(valor)
        return math.isfinite(valor_float)
    except:
        return False


def _funcion_externa_por_composicion(expr, cambio):
    """Devuelve f(x) si expr puede escribirse como f(g(x))."""
    temporal = sp.Dummy("composicion")
    expr_temp = sp.simplify(expr.subs(cambio, temporal))
    if x in expr_temp.free_symbols:
        return None
    return sp.simplify(expr_temp.subs(temporal, x))


def cambio_variable_indefinida(integrando, cambio):
    """
    Calcula una integral indefinida usando solamente el criterio:

        si F'(x)=f(x), entonces integral de f(g(x))*g'(x) dx = F(g(x)) + C

    No despeja x ni fuerza una sustitución general.
    """

    pasos = []
    pasos.append("INTEGRAL ORIGINAL")
    pasos.append(f"∫ {sp.pretty(integrando)} dx")

    pasos.append("\nFUNCIÓN INTERNA")
    pasos.append(f"g(x) = {sp.pretty(cambio)}")

    derivada_cambio = sp.simplify(sp.diff(cambio, x))
    pasos.append("\nDERIVADA DE LA FUNCIÓN INTERNA")
    pasos.append(f"g'(x) = {sp.pretty(derivada_cambio)}")

    if derivada_cambio == 0:
        pasos.append("\nERROR: g(x) es constante, por lo tanto g'(x)=0.")
        return None, pasos

    cociente = sp.simplify(integrando / derivada_cambio)
    funcion_externa = _funcion_externa_por_composicion(cociente, cambio)

    pasos.append("\nVERIFICACIÓN DEL CRITERIO")
    pasos.append("Buscamos que el integrando tenga la forma f(g(x))*g'(x).")
    pasos.append(f"integrando / g'(x) = {sp.pretty(cociente)}")

    if funcion_externa is None:
        pasos.append("\nERROR: no se reconoce una función externa que dependa solamente de g(x).")
        pasos.append("La integral no se resolverá por despeje de x ni por una sustitución general.")
        return None, pasos

    pasos.append("\nFUNCIÓN EXTERNA")
    pasos.append(f"f(x) = {sp.pretty(funcion_externa)}")

    primitiva_externa = sp.integrate(funcion_externa, x)
    if isinstance(primitiva_externa, sp.Integral):
        pasos.append("\nERROR: no se pudo encontrar una primitiva elemental para f(x).")
        return None, pasos

    pasos.append("\nPRIMITIVA DE LA FUNCIÓN EXTERNA")
    pasos.append(f"F(x) = {sp.pretty(primitiva_externa)}")

    resultado = sp.simplify(primitiva_externa.subs(x, cambio))

    pasos.append("\nAPLICAMOS EL TEOREMA")
    pasos.append("∫ f(g(x))*g'(x) dx = F(g(x)) + C")
    pasos.append(f"Resultado = {sp.pretty(resultado)} + C")

    verificacion = sp.simplify(sp.diff(resultado, x))
    pasos.append("\nVERIFICACIÓN")
    pasos.append(f"d/dx [{sp.pretty(resultado)}] = {sp.pretty(verificacion)}")

    if sp.simplify(verificacion - integrando) == 0:
        pasos.append("La verificación fue correcta.")
    else:
        pasos.append("Advertencia: SymPy no pudo verificar completamente la igualdad.")

    return resultado, pasos


def cambio_variable_definida(integrando, cambio, a, b):
    """
    Calcula una integral definida usando el mismo criterio de composición:

        integral de a a b de f(g(x))*g'(x) dx = F(g(b)) - F(g(a))
    """

    pasos = []
    pasos.append("INTEGRAL DEFINIDA ORIGINAL")
    pasos.append(f"∫ desde {a} hasta {b} de {sp.pretty(integrando)} dx")

    pasos.append("\nFUNCIÓN INTERNA")
    pasos.append(f"g(x) = {sp.pretty(cambio)}")

    derivada_cambio = sp.simplify(sp.diff(cambio, x))
    pasos.append("\nDERIVADA DE LA FUNCIÓN INTERNA")
    pasos.append(f"g'(x) = {sp.pretty(derivada_cambio)}")

    if derivada_cambio == 0:
        pasos.append("\nERROR: g(x) es constante.")
        return None, pasos

    cociente = sp.simplify(integrando / derivada_cambio)
    funcion_externa = _funcion_externa_por_composicion(cociente, cambio)

    pasos.append("\nVERIFICACIÓN DEL CRITERIO")
    pasos.append(f"integrando / g'(x) = {sp.pretty(cociente)}")

    if funcion_externa is None:
        pasos.append("\nERROR: la integral no cumple la forma f(g(x))*g'(x).")
        pasos.append("No se despejará x ni se forzará una sustitución general.")
        return None, pasos

    pasos.append("\nFUNCIÓN EXTERNA")
    pasos.append(f"f(x) = {sp.pretty(funcion_externa)}")

    primitiva_externa = sp.integrate(funcion_externa, x)
    if isinstance(primitiva_externa, sp.Integral):
        pasos.append("\nERROR: no se pudo encontrar una primitiva elemental para f(x).")
        return None, pasos

    pasos.append("\nPRIMITIVA DE LA FUNCIÓN EXTERNA")
    pasos.append(f"F(x) = {sp.pretty(primitiva_externa)}")

    g_a = sp.simplify(cambio.subs(x, a))
    g_b = sp.simplify(cambio.subs(x, b))
    resultado = sp.simplify(primitiva_externa.subs(x, g_b) - primitiva_externa.subs(x, g_a))

    pasos.append("\nAPLICAMOS EL TEOREMA EN EL INTERVALO")
    pasos.append("∫ de a a b f(g(x))*g'(x) dx = F(g(b)) - F(g(a))")
    pasos.append(f"g(a) = {sp.pretty(g_a)}")
    pasos.append(f"g(b) = {sp.pretty(g_b)}")
    pasos.append(f"Resultado exacto = {sp.pretty(resultado)}")

    resultado_decimal = np.float64(sp.N(resultado))
    if es_numero_real(resultado_decimal):
        pasos.append(f"Resultado decimal ≈ {resultado_decimal}")

    return resultado, pasos


def main():
    print("CALCULADORA DE INTEGRALES POR CAMBIO DE VARIABLE")
    print("Criterio usado: composición")
    print("Forma esperada: f(g(x)) * g'(x)")
    print()

    integrando_txt = input("Ingrese el integrando en x: ")
    cambio_txt = input("Ingrese la función interna g(x): ")

    integrando = leer_expresion(integrando_txt)
    cambio = leer_expresion(cambio_txt)

    tipo = input("¿La integral es definida? (s/n): ").lower()

    if tipo == "s":
        a_txt = input("Ingrese el límite inferior a: ")
        b_txt = input("Ingrese el límite superior b: ")

        a = leer_expresion(a_txt)
        b = leer_expresion(b_txt)

        resultado, pasos = cambio_variable_definida(integrando, cambio, a, b)

    else:
        resultado, pasos = cambio_variable_indefinida(integrando, cambio)

    print("\n" + "=" * 50)
    print("PROCEDIMIENTO")
    print("=" * 50)

    for paso in pasos:
        print(paso)

    print("=" * 50)




def ejecutarcambiovariable():
    return main()


# Alias por si algún menú anterior usa este nombre.
def ejecutar_cambio_variable():
    return ejecutarcambiovariable()


if __name__ == "__main__":
    main()
