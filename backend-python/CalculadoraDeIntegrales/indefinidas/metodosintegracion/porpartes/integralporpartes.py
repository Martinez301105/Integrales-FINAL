import sympy as sp

from api_metodos import leer_expresion, resolver_por_partes

x = sp.symbols("x")


def integrar_por_partes_automatico(integrando_texto):
    """Resuelve por partes recibiendo solo el integrando.

    El usuario solo escribe el integrando. La identificación de f(x), g'(x),
    f'(x) y g(x) se hace automáticamente en api_metodos.py.
    """
    return resolver_por_partes(integrando_texto)


def ejecutarporpartes():
    print("\n" + "=" * 70)
    print("INTEGRACIÓN POR PARTES AUTOMÁTICA")
    print("=" * 70)
    print("Escribe solo el integrando. Ejemplos:")
    print("  x*exp(x)")
    print("  x*sen(x)")
    print("  log(x)")
    print()

    integrando_texto = input("Integral de f(x) = ").strip()

    try:
        data = resolver_por_partes(integrando_texto)
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
        return None


# Alias por si algún menú anterior usa este nombre.
def ejecutar_por_partes():
    return ejecutarporpartes()


if __name__ == "__main__":
    ejecutarporpartes()
