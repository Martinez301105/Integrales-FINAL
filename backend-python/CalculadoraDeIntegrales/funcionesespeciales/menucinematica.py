from cinematica.velocidad import velocidad_desde_aceleracion
from cinematica.posicion import posicion_desde_velocidad
from cinematica.desplazamiento import desplazamiento
from cinematica.distancia import distancia_recorrida
from cinematica.velocidadmedia import velocidad_media
from cinematica.rapidezmedia import rapidez_media


def imprimir_resultado(resultado):
    if resultado is not None:
        print("\nFórmula:", resultado["formula"])
        print("Resultado:", resultado["resultado"])


def menu_cinematica():
    while True:
        print("\n===== CINEMÁTICA DEL AUTOMÓVIL =====")
        print("1. Obtener velocidad desde aceleración")
        print("2. Obtener posición desde velocidad")
        print("3. Obtener desplazamiento")
        print("4. Obtener distancia recorrida")
        print("5. Obtener velocidad media")
        print("6. Obtener rapidez media")
        print("0. Regresar")

        opcion = input("Seleccione una opción: ")

        if opcion == "1":
            resultado = velocidad_desde_aceleracion()
            imprimir_resultado(resultado)

        elif opcion == "2":
            resultado = posicion_desde_velocidad()
            imprimir_resultado(resultado)

        elif opcion == "3":
            resultado = desplazamiento()
            imprimir_resultado(resultado)

        elif opcion == "4":
            resultado = distancia_recorrida()
            imprimir_resultado(resultado)

        elif opcion == "5":
            resultado = velocidad_media()
            imprimir_resultado(resultado)

        elif opcion == "6":
            resultado = rapidez_media()
            imprimir_resultado(resultado)

        elif opcion == "0":
            print("Regresando al menú principal...")
            break

        else:
            print("Opción no válida.")