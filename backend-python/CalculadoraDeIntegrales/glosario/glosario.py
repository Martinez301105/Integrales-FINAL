from dataclasses import dataclass
from typing import List


@dataclass(frozen=True)
class Resultado:
    tipo: str
    titulo: str
    enunciado: str
    utilidad: str


RESULTADOS: List[Resultado] = [
    Resultado(
        "Definición", "Partición de un intervalo", 
        "Sea I = [a,b] ⊂ R. Una partición de I es un conjunto finito "
        "P = {t_0,t_1,...,t_n} tal que a = t_0 < t_1 < ... < t_n = b.",
        "Sirve para dividir el intervalo de integración y construir sumas inferiores, superiores y de Riemann."
    ),
    Resultado(
        "Definición", "Norma de una partición",
        "Para P = {t_0,...,t_n} partición de [a,b], se define "
        "||P|| = max{|t_i - t_{i-1}| : i = 1,...,n}.",
        "Mide el tamaño del subintervalo más grande; es clave para el límite de sumas de Riemann."
    ),
    Resultado(
        "Definición", "Partición regular",
        "Una partición P de [a,b] es regular si todos los subintervalos tienen la misma longitud; "
        "es decir, t_i - t_{i-1} = (b-a)/n para todo i.",
        "Permite aproximar integrales mediante subintervalos de igual tamaño."
    ),
    Resultado(
        "Definición", "Suma superior e inferior de Darboux",
        "Sea f:[a,b]→R acotada y P = {t_0,...,t_n}. Para cada subintervalo se toman "
        "M_i = sup{f(x): x∈[t_{i-1},t_i]} y m_i = inf{f(x): x∈[t_{i-1},t_i]}. "
        "La suma superior es S(f,P)=Σ M_i(t_i-t_{i-1}) y la suma inferior es s(f,P)=Σ m_i(t_i-t_{i-1}).",
        "Base formal para definir integrabilidad mediante Darboux."
    ),
    Resultado(
        "Teorema", "Orden en Q",
        "Para números racionales p/q y r/t con q,t positivos, el orden se compara mediante productos cruzados: "
        "p/q ≤ r/t si y sólo si pt ≤ rq.",
        "Aparece como apoyo formal para comparar cantidades en las construcciones de particiones."
    ),
    Resultado(
        "Proposición", "Refinamiento de particiones",
        "Si Q es un refinamiento de P, entonces la suma inferior no disminuye y la suma superior no aumenta: "
        "s(f,P) ≤ s(f,Q) ≤ S(f,Q) ≤ S(f,P).",
        "Explica por qué al refinar particiones se mejora la aproximación de la integral."
    ),
    Resultado(
        "Definición", "Integral inferior y superior",
        "La integral inferior se define como sup{s(f,P): P partición de [a,b]} y la integral superior como "
        "inf{S(f,P): P partición de [a,b]}.",
        "Permite definir la integral sin usar primitivas."
    ),
    Resultado(
        "Definición", "Integrabilidad de Darboux",
        "Una función acotada f:[a,b]→R es Darboux integrable si su integral inferior coincide con su integral superior. "
        "En ese caso, dicho valor común se denota por ∫_a^b f(x) dx.",
        "Es una definición formal de integral definida."
    ),
    Resultado(
        "Teorema", "Funciones monótonas son integrables",
        "Si f:[a,b]→R es una función monótona creciente o decreciente, entonces f es integrable.",
        "Da un criterio práctico para saber cuándo existe la integral definida."
    ),
    Resultado(
        "Teorema", "Propiedades básicas de la integral",
        "Si f es integrable en [a,b] y c∈[a,b], entonces ∫_a^b f = ∫_a^c f + ∫_c^b f. "
        "Además, si m≤f(x)≤M, entonces m(b-a)≤∫_a^b f≤M(b-a).",
        "Resume aditividad por intervalos y estimaciones de la integral."
    ),
    Resultado(
        "Definición", "Suma de Riemann",
        "Sea P={t_0,...,t_n} una partición de [a,b] y A={s_1,...,s_n} una selección con "
        "s_i∈[t_{i-1},t_i]. La suma de Riemann es Σ f(s_i)(t_i-t_{i-1}).",
        "Construye aproximaciones de la integral usando puntos elegidos en cada subintervalo."
    ),
    Resultado(
        "Corolario", "Cotas de las sumas de Riemann",
        "Si f:[a,b]→R es acotada, P es una partición y A una selección de P, entonces "
        "s(f,P) ≤ S(f,P,A) ≤ S(f,P).",
        "Conecta las sumas de Riemann con las sumas inferior y superior de Darboux."
    ),
    Resultado(
        "Definición", "Límite de sumas de Riemann", 
        "Diremos que L es el límite de las sumas de Riemann de f cuando ||P|| tiende a 0 si para todo ε>0 "
        "existe δ>0 tal que, si ||P||<δ, entonces |S(f,P,A)-L|<ε para toda selección A.",
        "Formaliza la integral como límite de aproximaciones."
    ),
    Resultado(
        "Teorema", "Equivalencia Darboux-Riemann",
        "Si f:[a,b]→R es acotada, entonces f es Darboux integrable en [a,b] si y sólo si "
        "existe el límite de sus sumas de Riemann cuando ||P||→0. En tal caso, ambos valores coinciden.",
        "Une las dos formas principales de definir la integral definida."
    ),
    Resultado(
        "Teorema", "Linealidad de la integral",
        "Si f y g son integrables en [a,b] y α,β∈R, entonces αf+βg es integrable y "
        "∫_a^b(αf+βg)=α∫_a^b f+β∫_a^b g.",
        "Permite separar constantes, sumas y restas dentro de una integral."
    ),
    Resultado(
        "Teorema", "Monotonía de la integral", 
        "Si f y g son integrables en [a,b] y f(x)≥g(x) para todo x∈[a,b], entonces "
        "∫_a^b f(x)dx ≥ ∫_a^b g(x)dx.",
        "Sirve para comparar áreas o acotar integrales."
    ),
    Resultado(
        "Teorema", "Desigualdad con valor absoluto",
        "Si f es integrable en [a,b], entonces |f| es integrable y "
        "|∫_a^b f(x)dx| ≤ ∫_a^b |f(x)|dx.",
        "Se usa para estimar integrales y controlar errores."
    ),
    Resultado(
        "Definición", "Función Lipschitziana",
        "Una función f:A⊆R→R es Lipschitziana si existe k>0 tal que "
        "|f(x)-f(y)|≤k|x-y| para todo x,y∈A.",
        "Ayuda a garantizar buen comportamiento de funciones relacionadas con integrabilidad y continuidad."
    ),
    Resultado(
        "Definición", "Función integral",
        "Si f:[a,b]→R es Riemann integrable, se define F:[a,b]→R por "
        "F(x)=∫_a^x f(t)dt.",
        "Es la función acumulada asociada a una integral."
    ),
    Resultado(
        "Teorema", "Teorema fundamental del cálculo",
        "Si f es continua en [a,b] y F(x)=∫_a^x f(t)dt, entonces F es derivable en (a,b) y F'(x)=f(x).",
        "Conecta derivadas con integrales."
    ),
    Resultado(
        "Teorema", "Regla de Barrow",
        "Si f es continua en [a,b] y G es una primitiva de f, entonces "
        "∫_a^b f(x)dx = G(b)-G(a).",
        "Permite calcular integrales definidas usando primitivas."
    ),
    Resultado(
        "Teorema", "Teorema del valor medio para integrales",
        "Si f es continua en [a,b], entonces existe c∈[a,b] tal que "
        "∫_a^b f(x)dx = f(c)(b-a).",
        "Interpreta la integral como valor promedio por longitud del intervalo."
    ),
    Resultado(
        "Teorema", "Propiedades de la integración indefinida",
        "Si f,g:I→R son continuas y c∈R, entonces ∫(f+g)=∫f+∫g y ∫cf=c∫f, considerando la constante de integración.",
        "Reglas algebraicas básicas para resolver integrales indefinidas."
    ),
    Resultado(
        "Teorema", "Primitivas de la función cero", 
        "Las únicas primitivas de la función cero en R son las funciones constantes.",
        "Justifica la aparición de la constante +C."
    ),
    Resultado(
        "Teorema", "Relación entre primitivas",
        "Si F es una primitiva de f en [a,b], entonces toda primitiva G de f en [a,b] satisface "
        "G(x)=F(x)+C para alguna constante C.",
        "Explica por qué una integral indefinida representa una familia de funciones."
    ),
    Resultado(
        "Teorema", "Cambio de variable",
        "Si g es derivable y f es continua, entonces ∫ f(g(x))g'(x)dx = F(g(x))+C, donde F' = f.",
        "Formaliza el método de sustitución."
    ),
    Resultado(
        "Teorema", "Integración por partes",
        "Si f y g son derivables, entonces ∫ f(x)g'(x)dx = f(x)g(x) - ∫ f'(x)g(x)dx.",
        "Método esencial para productos de funciones."
    ),
    Resultado(
        "Definición", "Parte fraccionaria de una función racional",
        "Si f(x)=P(x)/Q(x) con P,Q polinomios y Q≠0, la parte fraccionaria se obtiene al dividir P entre Q: "
        "f(x)=C(x)+R(x)/Q(x), donde grado(R)<grado(Q).",
        "Prepara el uso de fracciones parciales para integrar funciones racionales."
    ),
    Resultado(
        "Definición", "Discontinuidad interior",
        "Sea f:[a,b]\\{c}→R, con c∈(a,b), donde c es punto de discontinuidad o indefinición. "
        "Se consideran integrales en [a,d] y [m,b] con a≤d<c<m≤b.",
        "Permite definir integrales impropias cuando hay una singularidad dentro del intervalo."
    ),
    Resultado(
        "Definición", "Integral impropia izquierda", 
        "Si existe lim_{t→c^-} ∫_a^t f(x)dx, se define "
        "∫_a^c f(x)dx = lim_{t→c^-} ∫_a^t f(x)dx.",
        "Trata integrales con problema al acercarse al extremo derecho c."
    ),
    Resultado(
        "Definición", "Integral impropia derecha",
        "Si existe lim_{t→c^+} ∫_t^b f(x)dx, se define "
        "∫_c^b f(x)dx = lim_{t→c^+} ∫_t^b f(x)dx.",
        "Trata integrales con problema al acercarse al extremo izquierdo c."
    ),
    Resultado(
        "Definición",  "Integral impropia en (-∞,b]", 
        "Si f:(-∞,b]→R es integrable en cada [a,b], entonces, si existe el límite, "
        "∫_{-∞}^b f(x)dx = lim_{t→-∞} ∫_t^b f(x)dx.",
        "Define integrales sobre intervalos infinitos hacia la izquierda."
    ),
    Resultado(
        "Definición", "Integral impropia en [a,∞)", 
        "Si f:[a,∞)→R es integrable en cada [a,b], entonces, si existe el límite, "
        "∫_a^∞ f(x)dx = lim_{t→∞} ∫_a^t f(x)dx.",
        "Define integrales sobre intervalos infinitos hacia la derecha."
    ),
   
]


def imprimir_resultado(r: Resultado) -> None:
    print("=" * 90)
    print(f"{r.tipo} {r.titulo}")
    print("\nEnunciado formal:")
    print(r.enunciado)
    print("\nUtilidad:")
    print(r.utilidad)


def listar_todo() -> None:
    for i, r in enumerate(RESULTADOS, start=1):
        print(f"{i:02d}. {r.tipo} - {r.titulo}")


def filtrar_por_tipo(tipo: str) -> List[Resultado]:
    tipo = tipo.lower().strip()
    return [r for r in RESULTADOS if r.tipo.lower().startswith(tipo)]


def buscar(palabra: str) -> List[Resultado]:
    palabra = palabra.lower().strip()
    return [
        r for r in RESULTADOS
        if palabra in (r.tipo + "  " + r.titulo + "  " + r.enunciado + " " + r.utilidad).lower()
    ]



def menu() -> None:
    while True:
        print("\nFORMULARIO DE INTEGRALES - CÁLCULO II")
        print("1. Listar todos los resultados")
        print("2. Ver un resultado por número de lista")
        print("3. Buscar por palabra clave")
        print("4. Filtrar por tipo: Definición, Teorema, Corolario o Proposición")
        print("0. Salir")

        opcion = input("Elige una opción: ").strip()

        if opcion == "1":
            listar_todo()
        elif opcion == "2":
            listar_todo()
            try:
                indice = int(input("Número de resultado: "))
                if 1 <= indice <= len(RESULTADOS):
                    imprimir_resultado(RESULTADOS[indice - 1])
                else:
                    print("Número fuera de rango.")
            except ValueError:
                print("Entrada inválida. Escribe un número entero.")
        elif opcion == "3":
            palabra = input("Palabra clave: ")
            encontrados = buscar(palabra)
            if not encontrados:
                print("No se encontraron resultados.")
            else:
                for r in encontrados:
                    imprimir_resultado(r)
        elif opcion == "4":
            tipo = input("Tipo a filtrar: ")
            encontrados = filtrar_por_tipo(tipo)
            if not encontrados:
                print("No se encontraron resultados para ese tipo.")
            else:
                for r in encontrados:
                    imprimir_resultado(r)
        elif opcion == "0":
            print("Programa finalizado.")
            break
        else:
            print("Opción inválida.")


if __name__ == "__main__":
    menu()
