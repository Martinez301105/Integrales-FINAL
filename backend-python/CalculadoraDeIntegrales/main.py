import funcionesespeciales.menu as menu
import funcionesespeciales.menuindefinidas as menuindefinidas
import funcionesespeciales.menudefinidas as menudefinidas
import funcionesespeciales.menumetodos as menumetodos
import funcionesespeciales.menucinematica as menucinematica


def main():
    while True:
        opcion = menu.menugeneral()

        try:
            if opcion == "1":
                menuindefinidas.menuintegralesindefinidas()

            elif opcion == "2":
                menudefinidas.menu_integrales_definidas()

            elif opcion == "3":
                menumetodos.menumetodosintegracion()

            elif opcion == "4":
                menucinematica.menu_cinematica()

            elif opcion == "0":
                print("Saliendo del programa...")
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


if __name__ == "__main__":
    main()
