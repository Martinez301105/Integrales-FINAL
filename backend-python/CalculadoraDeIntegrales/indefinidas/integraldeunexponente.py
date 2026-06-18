from numbers import Real
import math


def es_real(numero):
    """
    Verifica que un número sea real y finito.
    """
    return isinstance(numero, Real) and not isinstance(numero, bool) and math.isfinite(numero)


def formatear_numero(numero):
   
    if numero == int(numero):
        return str(int(numero))
    return str(numero)


def integral_x_n(n, constante=None):
    """
    Restricción:
        n != -1

    Parámetros:
        n: exponente real
        constante: constante de integración real.
                   Si no se da, se usa C simbólica.

    Retorna:
        Una cadena con la integral indefinida.
    """

    if not es_real(n):
        raise ValueError("El exponente n debe ser un número real.")

    if n == -1:
        raise ValueError("La regla de potencia no aplica cuando n = -1.")

    if constante is not None and not es_real(constante):
        raise ValueError("La constante de integración debe ser real.")

    nuevo_exponente = n + 1

    nuevo_exponente_txt = formatear_numero(nuevo_exponente)

    if constante is None:
        constante_txt = "C"
    else:
        constante_txt = formatear_numero(constante)

    resultado = f"x^{nuevo_exponente_txt} / {nuevo_exponente_txt} + {constante_txt}"

    return resultado