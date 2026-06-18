import indefinidas.integraldeunaconstante as integraldeunaconstante
import indefinidas.integraldeunexponente as integraldeunexponente
import indefinidas.integraldeunpolinomio as integraldeunpolinomio
import indefinidas.integralestrig as integralestrig
import indefinidas.integrallogaritmica as integrallogaritmica
import indefinidas.integralexponencial as integralexponencial


def imprimirresultado(resultado):
    if resultado is None:
        return

    if isinstance(resultado, dict):
        if "resultado" in resultado:
            print("\nResultado:", resultado["resultado"])

        if "pasos" in resultado:
            print("\nPasos:")
            for paso in resultado["pasos"]:
                print("-", paso)
    else:
        print("\nResultado:", resultado)


def ejecutarconstante():
    k = float(input("Ingrese la constante k: "))
    resultado = integraldeunaconstante.integral_constante_indefinida(k)
    imprimirresultado(resultado)


def ejecutarexponente():
    n = float(input("Ingrese el exponente n: "))
    resultado = integraldeunexponente.integral_x_n(n)
    imprimirresultado(resultado)


def menuintegralesindefinidas():
    while True:
        print("\n" + "=" * 55)
        print("INTEGRALES INDEFINIDAS")
        print("=" * 55)
        print("1. Integral de una constante")
        print("2. Integral de x^n")
        print("3. Integral de un polinomio")
        print("4. Integrales trigonométricas")
        print("5. Integrales logarítmicas")
        print("6. Integrales exponenciales")
        print("0. Regresar")

        opcion = input("Seleccione una opción: ").strip()

        try:
            if opcion == "1":
                ejecutarconstante()

            elif opcion == "2":
                ejecutarexponente()

            elif opcion == "3":
                resultado = integraldeunpolinomio.menu_polinomio()
                imprimirresultado(resultado)

            elif opcion == "4":
                resultado = integralestrig.menu_trigonometrica()
                imprimirresultado(resultado)

            elif opcion == "5":
                resultado = integrallogaritmica.menu_logaritmica()
                imprimirresultado(resultado)

            elif opcion == "6":
                integralexponencial.menu_integral_exponencial()

            elif opcion == "0":
                print("Regresando al menú principal...")
                break

            else:
                print("Opción no válida.")

        except ValueError as error:
            print("Error:", error)
