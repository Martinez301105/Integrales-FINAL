def validara(a):
    if a == 0:
        raise ValueError("a debe ser distinto de 0.")
    return abs(a)


def ejecutarsustituciontrigonometrica():
    print("\n" + "=" * 70)
    print("SUSTITUCIÓN TRIGONOMÉTRICA")
    print("=" * 70)
    print("1. ∫ sqrt(a^2 - x^2) dx")
    print("2. ∫ 1/sqrt(a^2 - x^2) dx")
    print("3. ∫ sqrt(a^2 + x^2) dx")
    print("4. ∫ 1/sqrt(a^2 + x^2) dx")
    print("5. ∫ sqrt(x^2 - a^2) dx")
    print("0. Regresar")

    opcion = input("Seleccione una opción: ").strip()

    if opcion == "0":
        return None

    a = validara(float(input("Ingrese el valor de a: ")))

    if opcion == "1":
        print("\nCambio usado: x = a sen(theta)")
        print("Entonces sqrt(a^2 - x^2) = a cos(theta).")
        resultado = f"(x/2)sqrt({a ** 2} - x^2) + ({a ** 2}/2)arcsen(x/{a}) + C"

    elif opcion == "2":
        print("\nCambio usado: x = a sen(theta)")
        print("Esta es la forma directa de arcsen.")
        resultado = f"arcsen(x/{a}) + C"

    elif opcion == "3":
        print("\nCambio usado: x = a tan(theta)")
        print("Entonces sqrt(a^2 + x^2) = a sec(theta).")
        resultado = f"(x/2)sqrt(x^2 + {a ** 2}) + ({a ** 2}/2)log|x + sqrt(x^2 + {a ** 2})| + C"

    elif opcion == "4":
        print("\nCambio usado: x = a tan(theta)")
        print("Esta forma lleva a una expresión logarítmica.")
        resultado = f"log|x + sqrt(x^2 + {a ** 2})| + C"

    elif opcion == "5":
        print("\nCambio usado: x = a sec(theta)")
        print("Entonces sqrt(x^2 - a^2) = a tan(theta).")
        resultado = f"(x/2)sqrt(x^2 - {a ** 2}) - ({a ** 2}/2)log|x + sqrt(x^2 - {a ** 2})| + C"

    else:
        print("Opción no válida.")
        return None

    print("\nResultado:")
    print(resultado)
    print("=" * 70)

    return resultado


# Alias por si algún menú anterior usa este nombre.
def ejecutar_sustitucion_trigonometrica():
    return ejecutarsustituciontrigonometrica()


if __name__ == "__main__":
    ejecutarsustituciontrigonometrica()
