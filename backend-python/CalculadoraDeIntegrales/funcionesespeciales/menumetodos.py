from indefinidas.metodosintegracion.cambiovariable.integralporcambiodevariable import ejecutarcambiovariable
from indefinidas.metodosintegracion.sustituciontrigonometrica.integralsustituciontrigonometrica import ejecutarsustituciontrigonometrica
from indefinidas.metodosintegracion.porpartes.integralporpartes import ejecutarporpartes
from indefinidas.metodosintegracion.fraccionesparciales.integralfraccionesparciales import ejecutarfraccionesparciales


def menumetodosintegracion():
    while True:
        print("\n" + "=" * 55)
        print("MÉTODOS DE INTEGRACIÓN")
        print("=" * 55)
        print("1. Cambio de variable")
        print("2. Sustitución trigonométrica")
        print("3. Por partes")
        print("4. Fracciones parciales")
        print("0. Regresar")

        opcion = input("Seleccione una opción: ").strip()

        try:
            if opcion == "1":
                ejecutarcambiovariable()

            elif opcion == "2":
                ejecutarsustituciontrigonometrica()

            elif opcion == "3":
                ejecutarporpartes()

            elif opcion == "4":
                ejecutarfraccionesparciales()

            elif opcion == "0":
                print("Regresando al menú principal...")
                break

            else:
                print("Opción no válida.")

        except ModuleNotFoundError as error:
            print("\nError de importación:", error)
            print("Solución: instala las dependencias con:")
            print("py -m pip install sympy numpy")

        except ValueError as error:
            print("Error:", error)

        except Exception as error:
            print("Error inesperado:", error)
