from .integraldeunaconstante import integral_constante_indefinida
from .integraldeunexponente import integral_x_n, es_real, formatear_numero


def quitar_constante_integracion(expresion):
    """
    Quita la constante de integración para poder unir términos.
    """

    expresion = expresion.replace(" + C", "")
    expresion = expresion.replace(" + 0", "")

    return expresion


def unir_terminos(terminos):
    """
    Une los términos de la integral cuidando los signos.
    """

    if not terminos:
        return "C"

    resultado = terminos[0]

    for termino in terminos[1:]:
        if termino.startswith("-"):
            resultado += " - " + termino[1:]
        else:
            resultado += " + " + termino

    return resultado + " + C"


def integrar_polinomio(polinomio):
    """
    Calcula la integral indefinida de un polinomio.

    El polinomio debe estar en términos de una sola variable: x.

    Cada término tiene la forma:

        coeficiente * x^exponente

    Ejemplo:

        3x^2 - 5x + 7

    Se guarda como:

        [(3, 2), (-5, 1), (7, 0)]
    """

    terminos_integrados = []

    for coeficiente, exponente in polinomio:

        if exponente == -1:
            raise ValueError("El exponente debe ser distinto de -1.")

        if coeficiente == 0:
            continue

        # Caso 1: término constante
        # Ejemplo: 7 = 7x^0
        if exponente == 0:
            resultado_constante = integral_constante_indefinida(coeficiente)
            termino_integrado = quitar_constante_integracion(
                resultado_constante["resultado"]
            )

        # Caso 2: término con x
        # Ejemplo: 3x^2
        else:
            resultado_exponente = integral_x_n(exponente, constante=0)
            base_integrada = quitar_constante_integracion(resultado_exponente)

            if coeficiente == 1:
                termino_integrado = base_integrada
            elif coeficiente == -1:
                termino_integrado = f"-({base_integrada})"
            else:
                termino_integrado = f"{formatear_numero(coeficiente)}({base_integrada})"

        terminos_integrados.append(termino_integrado)

    return unir_terminos(terminos_integrados)


def menu_polinomio():
    """
    Menú tipo do while para ingresar un polinomio
    y después calcular su integral indefinida.
    """

    polinomio = []

    while True:
        print("\n--- Integral de un polinomio ---")
        print("1.- Ingrese polinomio")
        print("2.- Calcular integral")
        print("0.- Regresar")

        opcion = input("Seleccione una opción: ").strip()

        if opcion == "0":
            return None

        if opcion == "1":
            try:
                coeficiente = float(input("Ingrese el coeficiente: "))
                exponente = float(input("Ingrese el exponente: "))

                if not es_real(coeficiente):
                    raise ValueError("El coeficiente debe ser un número real.")

                if not es_real(exponente):
                    raise ValueError("El exponente debe ser un número real.")

                if exponente == -1:
                    raise ValueError("El exponente debe ser distinto de -1.")

                polinomio.append((coeficiente, exponente))

                print("Término agregado correctamente.")
                print("Polinomio actual:", polinomio)

            except ValueError as error:
                print("Error:", error)

        elif opcion == "2":
            try:
                resultado = integrar_polinomio(polinomio)

                print("\nResultado:")
                print(resultado)

                return {
                    "tipo": "indefinida",
                    "polinomio": polinomio,
                    "resultado": resultado
                }

            except ValueError as error:
                print("Error:", error)

        else:
            print("Opción no válida.")
            

# Aquí después me tienes que pedir que calcule la integral definida.