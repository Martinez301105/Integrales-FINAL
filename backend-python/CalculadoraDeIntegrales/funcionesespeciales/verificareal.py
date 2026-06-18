

def es_real(numero):
     # Rechazar booleanos
    if type(numero) == bool:
        return False

    # Aceptar solamente int y float
    if type(numero) != int and type(numero) != float:
        return False

    # Rechazar NaN
    # NaN es el único valor que no es igual a sí mismo
    if numero != numero:
        return False

    # Rechazar infinito positivo y negativo
    if numero == float("inf") or numero == float("-inf"):
        return False

    return True