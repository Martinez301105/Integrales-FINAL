import sympy as sp

from api_metodos import leer_expresion, resolver_fracciones_parciales

x = sp.symbols("x")


def integrar_por_fracciones_parciales(expresion_texto):
    """Resuelve fracciones parciales aceptando muchas formas de entrada.

    Ejemplos válidos:
    - (3*x+5)/(x^2+x-2)
    - 3/(x-2)+5/(x+1)
    - x^2/(x+1)
    - \frac{3*x+5}{x^2+x-2}
    """
    return resolver_fracciones_parciales(expresion_texto)


def ejecutarfraccionesparciales():
    print("\n" + "=" * 70)
    print("INTEGRAL POR FRACCIONES PARCIALES")
    print("=" * 70)
    print("Escribe una función racional en x. Puede estar original o ya separada.")
    print("Ejemplo 1: (3*x + 5)/(x^2 + x - 2)")
    print("Ejemplo 2: 3/(x-2)+5/(x+1)")
    print("Ejemplo 3: x^2/(x+1)")
    print()

    entrada = input("Integral de f(x) = ").strip()

    try:
        data = resolver_fracciones_parciales(entrada)
        print("\nPROCEDIMIENTO")
        print("-" * 70)
        for i, paso in enumerate(data["pasos"], start=1):
            print(f"{i}. {paso}")
        print("\nResultado:")
        print(data["resultado"])
        print("=" * 70)
        return data
    except Exception as error:
        print("Error:", error)
        print("Revisa que sea una función racional y que uses x como variable.")
        return None


# Alias por si algún menú anterior usa este nombre.
def ejecutar_fracciones_parciales():
    return ejecutarfraccionesparciales()


if __name__ == "__main__":
    ejecutarfraccionesparciales()
