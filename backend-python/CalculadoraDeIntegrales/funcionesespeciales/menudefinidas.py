from definidas.integraldefinidadeunaconstante import ejecutar_integral_constante_definida
from definidas.integraldefinidaexponente import ejecutar_integral_x_n_definida
from definidas.integraldefinidadepolinomio import ejecutar_integral_polinomio_definida
from definidas.integraldefinidaexponencial import ejecutar_integral_exponencial_definida
from definidas.integraldefinidalogaritmica import ejecutar_integral_logaritmica_definida
from definidas.integraldefinidaareaentrecurvas import ejecutar_area_entre_curvas
from definidas.sumasriemann import ejecutar_suma_riemann
from definidas.integraldarboux import ejecutar_integral_darboux


def imprimir_resultado(resultado):
    if resultado is None:
        return

    if isinstance(resultado, dict):
        if "metodo" in resultado:
            print("\nMétodo:", resultado["metodo"])

        if "formula" in resultado:
            print("Fórmula:", resultado["formula"])

        if "sustitucion" in resultado:
            print("Sustitución:", resultado["sustitucion"])

        if "resultado" in resultado:
            print("Resultado:", resultado["resultado"])

        if "delta_x" in resultado:
            print("Δx:", resultado["delta_x"])

        if "anchura_subintervalo" in resultado:
            print("Anchura de cada subintervalo:", resultado["anchura_subintervalo"])

        if "nota" in resultado:
            print("Nota:", resultado["nota"])

        if "pasos" in resultado:
            print("\n--- Pasos ---")
            for paso in resultado["pasos"]:
                print("-", paso)

    else:
        print("Resultado:", resultado)


def menu_integrales_definidas():
    while True:
        print("\n===== INTEGRALES DEFINIDAS =====")
        print("1. Integral definida de una constante")
        print("2. Integral definida de x^n")
        print("3. Integral definida de un polinomio")
        print("4. Integral definida exponencial")
        print("5. Integral definida logarítmica")
        print("6. Área entre curvas")
        print("7. Sumas de Riemann")
        print("8. Integral de Darboux")
        print("0. Regresar")

        opcion = input("Seleccione una opción: ").strip()

        try:
            if opcion == "1":
                resultado = ejecutar_integral_constante_definida()
                imprimir_resultado(resultado)

            elif opcion == "2":
                resultado = ejecutar_integral_x_n_definida()
                imprimir_resultado(resultado)

            elif opcion == "3":
                resultado = ejecutar_integral_polinomio_definida()
                imprimir_resultado(resultado)

            elif opcion == "4":
                resultado = ejecutar_integral_exponencial_definida()
                imprimir_resultado(resultado)

            elif opcion == "5":
                resultado = ejecutar_integral_logaritmica_definida()
                imprimir_resultado(resultado)

            elif opcion == "6":
                resultado = ejecutar_area_entre_curvas()
                imprimir_resultado(resultado)

            elif opcion == "7":
                resultado = ejecutar_suma_riemann()
                imprimir_resultado(resultado)

            elif opcion == "8":
                resultado = ejecutar_integral_darboux()
                imprimir_resultado(resultado)

            elif opcion == "0":
                print("Regresando al menú principal...")
                break

            else:
                print("Opción no válida.")

        except ValueError as error:
            print("Error:", error)

        except Exception as error:
            print("Error inesperado:", error)
