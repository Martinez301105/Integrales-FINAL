"""API interna para los métodos de integración de la página web.

Este archivo está pensado para recibir cadenas desde el HTML y regresar
resultado + pasos en LaTeX. El usuario NO debe escribir derivadas.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any

import sympy as sp
from sympy.parsing.sympy_parser import (
    parse_expr,
    standard_transformations,
    implicit_multiplication_application,
    convert_xor,
    function_exponentiation,
)

x = sp.symbols("x")
u = sp.symbols("u")
z = sp.symbols("z")


MAX_DIGITOS_ENTRADA = 10


def validar_max_digitos(texto: str, nombre: str = "entrada") -> None:
    digitos = re.findall(r"\d", str(texto or ""))
    if len(digitos) > MAX_DIGITOS_ENTRADA:
        raise ValueError(f"Error: {nombre} no puede exceder {MAX_DIGITOS_ENTRADA} dígitos.")

TRANSFORMACIONES = standard_transformations + (
    implicit_multiplication_application,
    convert_xor,
    function_exponentiation,
)

FUNCIONES_PERMITIDAS = {
    "x": x,
    "u": u,
    "sin": sp.sin,
    "sen": sp.sin,
    "cos": sp.cos,
    "tan": sp.tan,
    "sec": sp.sec,
    "csc": sp.csc,
    "cot": sp.cot,
    "asin": sp.asin,
    "arcsin": sp.asin,
    "arcsen": sp.asin,
    "acos": sp.acos,
    "arccos": sp.acos,
    "atan": sp.atan,
    "arctan": sp.atan,
    "exp": sp.exp,
    "log": sp.log,
    "sqrt": sp.sqrt,
    "pi": sp.pi,
    "e": sp.E,
    "E": sp.E,
    "phi": (1 + sp.sqrt(5)) / 2,
    "fi": (1 + sp.sqrt(5)) / 2,
}


def _quitar_integral_y_dx(texto: str) -> str:
    s = str(texto or "").strip()
    s = s.replace("−", "-").replace("–", "-").replace("—", "-")
    s = re.sub(r"^\\?int\s*", "", s, flags=re.IGNORECASE)
    s = re.sub(r"^∫\s*", "", s)
    s = re.sub(r"\s*d\s*x\s*$", "", s, flags=re.IGNORECASE)
    return s.strip()


def _latex_frac_a_texto(s: str) -> str:
    """Convierte casos simples de LaTeX \frac{A}{B} a ((A)/(B))."""
    patron = re.compile(r"\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}")
    anterior = None
    while anterior != s:
        anterior = s
        s = patron.sub(r"((\1)/(\2))", s)
    return s


def normalizar_entrada(texto: str) -> str:
    """Acepta notación común de usuario: ^, sen, log, e^x, \frac, etc.

    Las funciones completas no se limitan a 10 cifras porque pueden contener
    polinomios o expresiones racionales largas. El límite de 10 cifras se
    reserva para constantes, límites e índices numéricos en la interfaz.
    """
    s = _quitar_integral_y_dx(texto)
    s = _latex_frac_a_texto(s)
    reemplazos = {
        "π": "pi",
        "φ": "phi",
        "ϕ": "phi",
        "\\sen": "sin",
        "\\sin": "sin",
        "\\cos": "cos",
        "\\tan": "tan",
        "\\log": "log",
        "\\sqrt": "sqrt",
        "\\cdot": "*",
        "\\left": "",
        "\\right": "",
        "{": "(",
        "}": ")",
        "|": "",
    }
    for a, b in reemplazos.items():
        s = s.replace(a, b)
    s = s.replace("sen", "sin")
    return s.strip()


def leer_expresion(texto: str, simplificar: bool = True) -> sp.Expr:
    s = normalizar_entrada(texto)
    if not s:
        raise ValueError("La expresión no puede estar vacía.")
    try:
        expr = parse_expr(
            s,
            local_dict=FUNCIONES_PERMITIDAS,
            transformations=TRANSFORMACIONES,
            evaluate=simplificar,
        )
    except Exception as error:
        raise ValueError(
            "No pude leer la expresión. Usa ejemplos como: 2*x*cos(x^2), x*exp(x), "
            "(3*x+5)/(x^2+x-2), sen(x), log(x)."
        ) from error
    if expr.free_symbols - {x, u}:
        raise ValueError("Solo se permite usar la variable x en la integral.")
    return sp.simplify(expr) if simplificar else expr


def latex(expr: Any) -> str:
    r"""Devuelve LaTeX en español para la interfaz.

    SymPy usa nombre interno inglés para seno. En español queremos mostrar sen(x).
    Para que KaTeX/MathJax lo entiendan, usamos \operatorname{sen}.
    """
    salida = sp.latex(sp.simplify(expr))
    reemplazos = {
        r"\operatorname{asin}": r"\operatorname{arcsen}",
        r"\asin": r"\operatorname{arcsen}",
        r"\arcsin": r"\operatorname{arcsen}",
        r"\sin": r"\operatorname{sen}",
    }
    for original, nuevo in reemplazos.items():
        salida = salida.replace(original, nuevo)
    return salida


TEORIA_ENLACES = {
    "automatica": {
        "titulo": "Glosario del proyecto",
        "url": "glosario.pdf",
        "descripcion": "Referencia principal: archivo glosario.pdf incluido en la página.",
    },
    "constante": {
        "titulo": "Glosario del proyecto",
        "url": "glosario.pdf",
        "descripcion": "Referencia principal: archivo glosario.pdf incluido en la página.",
    },
    "potencia": {
        "titulo": "Glosario del proyecto",
        "url": "glosario.pdf",
        "descripcion": "Referencia principal: archivo glosario.pdf incluido en la página.",
    },
    "polinomio": {
        "titulo": "Glosario del proyecto",
        "url": "glosario.pdf",
        "descripcion": "Referencia principal: archivo glosario.pdf incluido en la página.",
    },
    "trigonometrica": {
        "titulo": "Glosario del proyecto",
        "url": "glosario.pdf",
        "descripcion": "Referencia principal: archivo glosario.pdf incluido en la página.",
    },
    "logaritmica": {
        "titulo": "Glosario del proyecto",
        "url": "glosario.pdf",
        "descripcion": "Referencia principal: archivo glosario.pdf incluido en la página.",
    },
    "exponencial": {
        "titulo": "Glosario del proyecto",
        "url": "glosario.pdf",
        "descripcion": "Referencia principal: archivo glosario.pdf incluido en la página.",
    },
    "cambio_variable": {
        "titulo": "Glosario del proyecto",
        "url": "glosario.pdf",
        "descripcion": "Referencia principal: archivo glosario.pdf incluido en la página.",
    },
    "por_partes": {
        "titulo": "Glosario del proyecto",
        "url": "glosario.pdf",
        "descripcion": "Referencia principal: archivo glosario.pdf incluido en la página.",
    },
    "fracciones_parciales": {
        "titulo": "Glosario del proyecto",
        "url": "glosario.pdf",
        "descripcion": "Referencia principal: archivo glosario.pdf incluido en la página.",
    },
    "sustitucion_trigonometrica": {
        "titulo": "Glosario del proyecto",
        "url": "glosario.pdf",
        "descripcion": "Referencia principal: archivo glosario.pdf incluido en la página.",
    },
    "integral_general": {
        "titulo": "Glosario del proyecto",
        "url": "glosario.pdf",
        "descripcion": "Referencia principal: archivo glosario.pdf incluido en la página.",
    },
}


def paso(titulo: str, expresion_latex: str, explicacion: str = "", tipo: str = "calculo") -> dict[str, str]:
    """Crea un paso renderizable por el frontend.

    La clave principal es ``latex``: debe contener solo LaTeX matemático,
    sin HTML. ``explicacion`` puede usarse para texto corto que acompañe
    el paso en la interfaz.
    """
    return {
        "tipo": tipo,
        "titulo": titulo,
        "latex": expresion_latex,
        "explicacion": explicacion,
    }


def construir_respuesta(
    metodo: str,
    entrada: dict[str, str],
    resultado_latex: str,
    pasos_detallados: list[dict[str, str]],
    advertencias: list[str] | None = None,
) -> dict[str, Any]:
    """Estructura estándar backend -> frontend estilo Symbolab.

    Se conservan ``resultado`` y ``pasos`` para que el frontend anterior no
    se rompa, pero también se agrega ``pasos_detallados`` para una interfaz
    con tarjetas desplegables, títulos y explicaciones.
    """
    return {
        "ok": True,
        "metodo": metodo,
        "entrada": entrada,
        "resultado": resultado_latex,
        "resultado_latex": resultado_latex,
        "pasos": [p["latex"] for p in pasos_detallados],
        "pasos_detallados": pasos_detallados,
        "ui": {
            "render": "katex",
            "modo": "paso_a_paso",
            "mostrar_resultado_principal": True,
        },
        "advertencias": advertencias or [],
        "teoria": TEORIA_ENLACES.get(metodo),
        "enlaces": [TEORIA_ENLACES[metodo]] if metodo in TEORIA_ENLACES else [],
    }

def verificar_resultado(resultado: sp.Expr, integrando: sp.Expr) -> str:
    """Muestra siempre la operación inversa: derivar la primitiva."""
    derivada = sp.simplify(sp.diff(resultado, x))
    diferencia = sp.simplify(derivada - integrando)
    estado = r"\text{correcto}" if diferencia == 0 else r"\text{revisar simplificación}"
    return (
        f"\\frac{{d}}{{dx}}\\left({latex(resultado)}\\right)={latex(derivada)}"
        f",\\quad {latex(derivada)}-{latex(integrando)}={latex(diferencia)}"
        f",\\quad {estado}"
    )



def _diferencia_verificacion(derivada: sp.Expr, integrando: sp.Expr) -> sp.Expr:
    """Simplifica la diferencia F'(x)-f(x) con varias estrategias.

    La verificacion no consiste solo en derivar: tambien hay que comprobar
    que lo obtenido sea algebraicamente igual al integrando original.
    """
    diferencia = sp.simplify(derivada - integrando)
    diferencia = sp.together(diferencia)
    diferencia = sp.cancel(diferencia)
    diferencia = sp.trigsimp(diferencia)
    return sp.simplify(diferencia)


def verificar_resultado(resultado: sp.Expr, integrando: sp.Expr) -> str:
    """Muestra la operacion inversa y explica el criterio de verificacion."""
    derivada = sp.simplify(sp.diff(resultado, x))
    diferencia = _diferencia_verificacion(derivada, integrando)

    if diferencia == 0:
        estado = r"\text{verificacion correcta}"
        conclusion = (
            r"\text{Como }F'(x)-f(x)=0\text{, la derivada coincide exactamente "
            r"con la funcion original.}"
        )
    else:
        estado = r"\text{revisar resultado o simplificacion}"
        conclusion = (
            r"\text{Como la diferencia no dio 0, no se puede confirmar la igualdad. "
            r"Puede faltar simplificacion algebraica o la primitiva puede no corresponder "
            r"al integrando original.}"
        )

    return (
        r"\begin{aligned}"
        rf"&F(x)={latex(resultado)}\\"
        rf"&\text{{Derivamos la respuesta: }}F'(x)={latex(derivada)}\\"
        rf"&\text{{Funcion original: }}f(x)={latex(integrando)}\\"
        rf"&\text{{Comparamos restando: }}F'(x)-f(x)={latex(derivada)}-{latex(integrando)}={latex(diferencia)}\\"
        rf"&\text{{La diferencia debe ser 0 porque dos funciones iguales tienen resta igual a 0.}}\\"
        rf"&{conclusion}\\"
        rf"&{estado}"
        r"\end{aligned}"
    )


# ==================================================
# CAMBIO DE VARIABLE
# ==================================================


def _extraer_funcion_externa(expresion_en_x: sp.Expr, cambio: sp.Expr) -> sp.Expr | None:
    """Reconoce si una expresión puede escribirse como f(g(x)).

    Se usa un símbolo temporal interno solo para la verificación algebraica.
    En la respuesta al usuario se muestra directamente la función externa f(x),
    sin presentar una sustitución auxiliar ni despejar x.
    """
    temporal = sp.Dummy("composicion")
    try:
        expresion_temporal = sp.simplify(expresion_en_x.subs(cambio, temporal))
    except Exception:
        return None

    if x in expresion_temporal.free_symbols:
        return None

    return sp.simplify(expresion_temporal.subs(temporal, x))


def _candidatos_funcion_interna(expresion: sp.Expr) -> list[sp.Expr]:
    """Busca posibles funciones internas dentro de una función compuesta.

    Esto permite que el formulario pida los dos factores reales del teorema:
    f(g(x)) y g'(x). Por ejemplo, de cos(x^2) se obtiene como candidato
    g(x)=x^2, sin usar símbolos auxiliares ni despejar x.
    """
    candidatos: list[sp.Expr] = []

    def agregar(candidato: sp.Expr) -> None:
        candidato = sp.simplify(candidato)
        if candidato == x or not candidato.has(x):
            return
        if candidato not in candidatos:
            candidatos.append(candidato)

    for nodo in sp.preorder_traversal(expresion):
        if not isinstance(nodo, sp.Basic) or not nodo.has(x):
            continue

        # Casos como sen(x^2), cos(x^2), exp(x^3), log(x^2+1).
        if isinstance(nodo, sp.Function):
            for argumento in nodo.args:
                agregar(argumento)

        # Casos como sqrt(x^2+1) o (x^2+1)^5.
        if isinstance(nodo, sp.Pow):
            base, _exponente = nodo.as_base_exp()
            agregar(base)

    return candidatos


def _es_constante_respecto_x(expresion: sp.Expr) -> bool:
    return not sp.simplify(expresion).has(x)


def _integral_cambio_por_factores(
    compuesta: sp.Expr,
    factor_derivada: sp.Expr,
) -> tuple[sp.Expr, sp.Expr, sp.Expr, sp.Expr, sp.Expr, sp.Expr] | None:
    """Resuelve cuando el usuario ingresa f(g(x)) y el factor g'(x).

    El integrando completo se construye como f(g(x))*g'(x). Si el factor es
    una constante por g'(x), también se acepta:
        k*f(g(x))*g'(x) = k*F(g(x)) + C.
    """
    candidatos = _candidatos_funcion_interna(compuesta)

    # Respaldo: si el usuario da el factor g'(x), su primitiva puede revelar g(x).
    try:
        primitiva_factor = sp.simplify(sp.integrate(factor_derivada, x))
        if primitiva_factor.has(x):
            candidatos.append(primitiva_factor)
    except Exception:
        pass

    candidatos_unicos: list[sp.Expr] = []
    for candidato in candidatos:
        candidato = sp.simplify(candidato)
        if candidato != x and candidato.has(x) and candidato not in candidatos_unicos:
            candidatos_unicos.append(candidato)

    for cambio in candidatos_unicos:
        derivada_cambio = sp.simplify(sp.diff(cambio, x))
        if derivada_cambio == 0:
            continue

        constante_factor = sp.simplify(factor_derivada / derivada_cambio)
        if not _es_constante_respecto_x(constante_factor):
            continue

        funcion_externa = _extraer_funcion_externa(compuesta, cambio)
        if funcion_externa is None:
            continue

        primitiva_externa = sp.integrate(funcion_externa, x)
        if isinstance(primitiva_externa, sp.Integral):
            continue

        resultado = sp.simplify(constante_factor * primitiva_externa.subs(x, cambio))
        integrando_generado = sp.simplify(compuesta * factor_derivada)
        if sp.simplify(sp.diff(resultado, x) - integrando_generado) != 0:
            continue

        return (
            cambio,
            derivada_cambio,
            constante_factor,
            funcion_externa,
            primitiva_externa,
            resultado,
        )

    return None


def _integral_cambio_por_composicion(
    integrando: sp.Expr,
    cambio: sp.Expr,
) -> tuple[sp.Expr, sp.Expr, sp.Expr, sp.Expr] | None:
    """Caso permitido por el proyecto: integrando = f(g(x))*g'(x)."""
    derivada_cambio = sp.simplify(sp.diff(cambio, x))
    if derivada_cambio == 0:
        return None

    cociente = sp.simplify(integrando / derivada_cambio)
    funcion_externa = _extraer_funcion_externa(cociente, cambio)
    if funcion_externa is None:
        return None

    primitiva_externa = sp.integrate(funcion_externa, x)
    if isinstance(primitiva_externa, sp.Integral):
        return None

    resultado = sp.simplify(primitiva_externa.subs(x, cambio))
    if sp.simplify(sp.diff(resultado, x) - integrando) != 0:
        return None

    return funcion_externa, primitiva_externa, resultado, cociente


def resolver_cambio_variable(integrando_texto: str, cambio_texto: str) -> dict[str, Any]:
    integrando = leer_expresion(integrando_texto)
    cambio = leer_expresion(cambio_texto)

    if u in integrando.free_symbols or u in cambio.free_symbols:
        raise ValueError("Escribe todo con x. Ingresa solamente el integrando y la función interna g(x).")

    derivada_cambio = sp.simplify(sp.diff(cambio, x))
    if derivada_cambio == 0:
        raise ValueError("La función interna g(x) no puede ser constante, porque g'(x)=0.")

    directo = _integral_cambio_por_composicion(integrando, cambio)
    if directo is None:
        cociente = sp.simplify(integrando / derivada_cambio)
        raise ValueError(
            "No se puede resolver por el criterio de cambio de variable por composición. "
            "Para usar este método, la integral debe tener la forma f(g(x))g'(x). "
            f"Con g(x)={latex(cambio)} se obtiene g'(x)={latex(derivada_cambio)}; "
            f"al dividir el integrando entre g'(x) queda {latex(cociente)}, "
            "que todavía no puede reconocerse solo como una función de g(x). "
            "No se despejará x ni se forzará una sustitución general."
        )

    funcion_externa, primitiva_externa, resultado, cociente = directo
    pasos_detallados = [
        paso(
            "1. Integral original",
            rf"\int {latex(integrando)}\,dx",
            "Primero se muestra la integral ingresada."
        ),
        paso(
            "2. Identificar la función interna",
            rf"g(x)={latex(cambio)}",
            "La función interna es la expresión que aparece dentro de la composición."
        ),
        paso(
            "3. Calcular la derivada de la función interna",
            rf"g'(x)={latex(derivada_cambio)}",
            "Esta derivada debe aparecer multiplicando a la función compuesta."
        ),
        paso(
            "4. Verificar el criterio de composición",
            rf"\frac{{{latex(integrando)}}}{{{latex(derivada_cambio)}}}={latex(cociente)}=f(g(x))",
            "Al dividir el integrando entre g'(x), lo que queda se reconoce como una función de g(x)."
        ),
        paso(
            "5. Identificar la función externa",
            rf"f(x)={latex(funcion_externa)}",
            "Esta es la función externa antes de componerla con g(x)."
        ),
        paso(
            "6. Integrar la función externa",
            rf"F(x)=\int {latex(funcion_externa)}\,dx={latex(primitiva_externa)}",
            "Se busca una primitiva F(x) tal que F'(x)=f(x)."
        ),
        paso(
            "7. Aplicar el teorema",
            rf"\int f(g(x))g'(x)\,dx=F(g(x))+C",
            "Como el integrando cumple el criterio, se compone la primitiva externa con g(x)."
        ),
        paso(
            "8. Resultado final",
            rf"F(g(x))+C={latex(resultado)}+C",
            "Este es el resultado en la variable original x."
        ),
        paso(
            "9. Verificación",
            verificar_resultado(resultado, integrando),
            "Operación inversa: derivar la respuesta debe devolver la función original.",
            "verificacion"
        ),
    ]
    return construir_respuesta(
        metodo="cambio_variable",
        entrada={"integrando": integrando_texto, "cambio": cambio_texto, "variable": "x"},
        resultado_latex=latex(resultado) + " + C",
        pasos_detallados=pasos_detallados,
    )

def resolver_cambio_variable_por_factores(compuesta_texto: str, derivada_texto: str) -> dict[str, Any]:
    """Formulario guiado para el teorema de composición.

    En lugar de pedir al usuario un integrando completo y una g(x), se piden
    los dos factores que realmente se necesitan en el teorema:
        f(g(x))  y  g'(x)

    Así se evita que el usuario escriba cos(x^2) como integrando incompleto o
    que coloque 2x en el campo equivocado.
    """
    compuesta = leer_expresion(compuesta_texto)
    factor_derivada = leer_expresion(derivada_texto)

    if u in compuesta.free_symbols or u in factor_derivada.free_symbols:
        raise ValueError("Escribe todo con x. No uses u ni despejes x.")

    directo = _integral_cambio_por_factores(compuesta, factor_derivada)
    if directo is None:
        integrando_intentado = sp.simplify(compuesta * factor_derivada)
        return construir_respuesta(
            metodo="cambio_variable",
            entrada={
                "compuesta": compuesta_texto,
                "derivada": derivada_texto,
                "integrando_generado": latex(integrando_intentado),
                "variable": "x",
            },
            resultado_latex=r"\text{No se pudo aplicar directamente el criterio de composición}",
            pasos_detallados=[
                paso(
                    "1. Datos ingresados",
                    rf"f(g(x))={latex(compuesta)},\quad g'(x)={latex(factor_derivada)}",
                    "Se intentó construir el integrando como el producto f(g(x))g'(x).",
                ),
                paso(
                    "2. Integral construida",
                    rf"\int {latex(integrando_intentado)}\,dx",
                    "Esta es la integral que se forma con los datos ingresados.",
                ),
                paso(
                    "3. Criterio no reconocido",
                    r"\int f(g(x))g'(x)\,dx=F(g(x))+C",
                    "No se encontró una función interna compatible con el factor escrito. Revisa que el segundo campo sea realmente la derivada de lo que está dentro de la función compuesta.",
                    "advertencia",
                ),
            ],
            advertencias=[
                "No se despejó x ni se usó sustitución con u. Solo se revisó el criterio de composición."
            ],
        )

    cambio, derivada_cambio, constante_factor, funcion_externa, primitiva_externa, resultado = directo
    integrando_generado = sp.simplify(compuesta * factor_derivada)

    if constante_factor == 1:
        relacion_derivada = rf"g'(x)={latex(derivada_cambio)}"
        explicacion_factor = "El factor escrito coincide exactamente con la derivada de la función interna."
        teorema_latex = rf"\int f(g(x))g'(x)\,dx=F(g(x))+C"
    else:
        relacion_derivada = rf"{latex(factor_derivada)}={latex(constante_factor)}\,g'(x),\quad g'(x)={latex(derivada_cambio)}"
        explicacion_factor = "El factor escrito es una constante multiplicando a la derivada de la función interna. Esa constante se conserva en el resultado."
        teorema_latex = rf"\int {latex(constante_factor)}f(g(x))g'(x)\,dx={latex(constante_factor)}F(g(x))+C"

    pasos_detallados = [
        paso(
            "1. Integral original construida",
            rf"\int {latex(integrando_generado)}\,dx",
            "El integrando completo se forma multiplicando la función compuesta por el factor derivada.",
        ),
        paso(
            "2. Identificar la función compuesta",
            rf"f(g(x))={latex(compuesta)}",
            "Esta es la parte de la integral donde una función contiene otra expresión en x.",
        ),
        paso(
            "3. Identificar la función interna",
            rf"g(x)={latex(cambio)}",
            "La función interna es lo que aparece dentro de la función compuesta.",
        ),
        paso(
            "4. Revisar el factor derivada",
            relacion_derivada,
            explicacion_factor,
        ),
        paso(
            "5. Identificar la función externa",
            rf"f(x)={latex(funcion_externa)}",
            "Al quitar la composición, queda la función externa escrita en términos de x.",
        ),
        paso(
            "6. Integrar la función externa",
            rf"F(x)=\int {latex(funcion_externa)}\,dx={latex(primitiva_externa)}",
            "Se busca una primitiva de la función externa.",
        ),
        paso(
            "7. Aplicar el teorema de composición",
            teorema_latex,
            "No se usa u, no se despeja x y no se fuerza una sustitución general.",
        ),
        paso(
            "8. Resultado final",
            rf"{latex(resultado)}+C",
            "Se sustituye la función interna dentro de la primitiva externa.",
            "resultado",
        ),
        paso(
            "9. Verificación",
            verificar_resultado(resultado, integrando_generado),
            "Al derivar el resultado se recupera el integrando construido.",
            "verificacion",
        ),
    ]

    return construir_respuesta(
        metodo="cambio_variable",
        entrada={
            "compuesta": compuesta_texto,
            "derivada": derivada_texto,
            "integrando_generado": latex(integrando_generado),
            "variable": "x",
        },
        resultado_latex=latex(resultado) + " + C",
        pasos_detallados=pasos_detallados,
    )


# ==================================================
# POR PARTES
# ==================================================


def _puntaje_factor_por_partes(factor: sp.Expr) -> int:
    """Mayor puntaje = mejor candidato para el factor que se deriva."""
    if factor.has(sp.log, sp.asin, sp.acos, sp.atan):
        return 50
    if factor.is_Pow and factor.base == x:
        return 40
    if factor == x or factor.is_polynomial(x):
        return 40
    if factor.has(sp.sin, sp.cos, sp.tan):
        return 30
    if factor.has(sp.exp):
        return 20
    return 10


def _separar_para_partes(integrando: sp.Expr) -> tuple[sp.Expr, sp.Expr]:
    factores = list(sp.Mul.make_args(sp.factor(integrando)))

    # Si no hay producto claro, casos típicos como ∫log(x)dx o ∫atan(x)dx.
    if len(factores) == 1:
        unico = factores[0]
        return unico, sp.Integer(1)

    # Evita tomar constantes como factor principal del producto.
    candidatos = [f for f in factores if x in f.free_symbols]
    if not candidatos:
        return integrando, sp.Integer(1)

    factor_para_derivar = max(candidatos, key=_puntaje_factor_por_partes)
    factor_derivada_de_g = sp.simplify(integrando / factor_para_derivar)
    return sp.simplify(factor_para_derivar), sp.simplify(factor_derivada_de_g)


def resolver_por_partes(integrando_texto: str) -> dict[str, Any]:
    integrando = leer_expresion(integrando_texto)
    if u in integrando.free_symbols:
        raise ValueError("Escribe la integral usando solamente la variable x.")

    f, g_prima = _separar_para_partes(integrando)
    f_prima = sp.simplify(sp.diff(f, x))
    g = sp.integrate(g_prima, x)

    if isinstance(g, sp.Integral):
        raise ValueError("No pude encontrar una primitiva para el factor g'(x) identificado automáticamente.")

    integral_restante = sp.simplify(f_prima * g)
    integral_restante_resuelta = sp.integrate(integral_restante, x)

    if isinstance(integral_restante_resuelta, sp.Integral):
        raise ValueError(
            "Pude separar la integral, pero no pude resolver la integral restante por partes."
        )

    resultado = sp.simplify(f * g - integral_restante_resuelta)

    pasos_detallados = [
        paso(
            "1. Integral original",
            rf"I=\int {latex(integrando)}\,dx",
            "Se parte del producto que se quiere resolver mediante integración por partes.",
        ),
        paso(
            "2. Identificar los factores del teorema",
            rf"f(x)={latex(f)},\quad g'(x)={latex(g_prima)}",
            "Se escribe el integrando con la forma f(x)g'(x).",
        ),
        paso(
            "3. Calcular derivada y primitiva",
            rf"f'(x)={latex(f_prima)},\quad g(x)={latex(g)}",
            "Se deriva f(x) y se encuentra una primitiva de g'(x).",
        ),
        paso(
            "4. Aplicar el teorema",
            r"\int f(x)g'(x)\,dx=f(x)g(x)-\int f'(x)g(x)\,dx",
            "Para una integral indefinida se usa la identidad equivalente del teorema formal y al final se agrega la constante de integración.",
        ),
        paso(
            "5. Sustituir los factores",
            rf"\int {latex(integrando)}\,dx=\left({latex(f)}\right)\left({latex(g)}\right)-\int \left({latex(f_prima)}\right)\left({latex(g)}\right)\,dx",
            "El primer término es el producto f(x)g(x) y el segundo es la integral restante.",
        ),
        paso(
            "6. Resolver la integral restante",
            rf"\int \left({latex(f_prima)}\right)\left({latex(g)}\right)\,dx={latex(integral_restante_resuelta)}",
            "Se calcula la integral restante que aparece después de aplicar el teorema.",
        ),
        paso(
            "7. Resultado final",
            rf"{latex(resultado)}+C",
            "Se simplifica el producto menos la integral restante.",
            "resultado",
        ),
        paso(
            "8. Verificación",
            verificar_resultado(resultado, integrando),
            "Al derivar el resultado se recupera el integrando original.",
            "verificacion",
        ),
    ]

    return construir_respuesta(
        metodo="por_partes",
        entrada={"integrando": integrando_texto, "variable": "x"},
        resultado_latex=latex(resultado) + " + C",
        pasos_detallados=pasos_detallados,
    )


# ==================================================
# FRACCIONES PARCIALES
# ==================================================


def _es_racional_en_x(expr: sp.Expr) -> bool:
    num, den = sp.fraction(sp.cancel(expr))
    return bool(num.is_polynomial(x) and den.is_polynomial(x))



def _latex_directo(expr: Any) -> str:
    """Devuelve LaTeX sin simplificar previamente la expresión.

    Esto es importante para fracciones parciales porque permite mostrar la
    expresión original del usuario antes de cancelarla o reducirla.
    """
    salida = sp.latex(expr)
    reemplazos = {
        r"\operatorname{asin}": r"\operatorname{arcsen}",
        r"\asin": r"\operatorname{arcsen}",
        r"\arcsin": r"\operatorname{arcsen}",
        r"\sin": r"\operatorname{sen}",
    }
    for original, nuevo in reemplazos.items():
        salida = salida.replace(original, nuevo)
    return salida


def _nombres_constantes(cantidad: int) -> list[sp.Symbol]:
    letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    nombres = []
    for i in range(cantidad):
        if i < len(letras):
            nombres.append(letras[i])
        else:
            nombres.append(f"A_{{{i - len(letras) + 1}}}")
    return [sp.Symbol(nombre) for nombre in nombres]


def _sistema_fracciones_parciales(numerador: sp.Expr, denominador: sp.Expr) -> dict[str, str] | None:
    """Construye la forma general y el sistema de constantes.

    Esta lógica viene del ZIP "copia": después de simplificar la fracción,
    factoriza el denominador, propone constantes A, B, C, elimina
    denominadores y resuelve el sistema comparando coeficientes.
    """
    if denominador == 1 or numerador == 0:
        return None

    factores = sp.factor_list(denominador, x)[1]
    total_constantes = sum(sp.degree(factor, x) * multiplicidad for factor, multiplicidad in factores)
    constantes = _nombres_constantes(total_constantes)
    indice = 0
    terminos = []
    parciales = []
    explicaciones = []

    for factor, multiplicidad in factores:
        grado = sp.degree(factor, x)
        for potencia in range(1, multiplicidad + 1):
            actuales = constantes[indice: indice + grado]
            indice += grado
            if grado == 1:
                numerador_parcial = actuales[0]
                explicaciones.append(
                    f"{_latex_directo(actuales[0])}:\\text{{ numerador constante de }}\\ \\frac{{{_latex_directo(actuales[0])}}}{{\\left({_latex_directo(factor)}\\right)^{{{potencia}}}}}"
                )
            else:
                numerador_parcial = sum(actuales[j] * x ** (grado - 1 - j) for j in range(grado))
                explicaciones.append(
                    f"{_latex_directo(numerador_parcial)}:\\text{{ numerador de grado menor que }}\\ {_latex_directo(factor)}"
                )
            denominador_parcial = factor ** potencia
            terminos.append(numerador_parcial / denominador_parcial)
            parciales.append((numerador_parcial, denominador_parcial))

    forma_general = sum(terminos)
    identidad = sp.Eq(numerador / denominador, forma_general)
    identidad_sin_denominadores = sp.Eq(
        sp.expand(numerador),
        sp.expand(sum(num * sp.cancel(denominador / den) for num, den in parciales))
    )
    polinomio = sp.Poly(sp.expand(identidad_sin_denominadores.lhs - identidad_sin_denominadores.rhs), x)
    ecuaciones = [
        sp.Eq(coeficiente, 0)
        for coeficiente in polinomio.all_coeffs()
        if sp.simplify(coeficiente) != 0
    ]
    solucion = sp.solve(ecuaciones, constantes, dict=True)

    sistema_latex = "\\begin{cases}" + "\\\\".join(_latex_directo(ec) for ec in ecuaciones) + "\\end{cases}"
    if solucion:
        valores_latex = ",\\quad ".join(
            f"{_latex_directo(c)}={latex(solucion[0].get(c, c))}"
            for c in constantes
        )
    else:
        valores_latex = "\\text{El sistema no tiene una solucion unica inmediata.}"

    return {
        "explicacion_constantes": "\\begin{aligned}" + "\\\\".join(explicaciones) + "\\end{aligned}",
        "forma_general": _latex_directo(identidad),
        "identidad_sin_denominadores": _latex_directo(identidad_sin_denominadores),
        "sistema": sistema_latex,
        "valores": valores_latex,
    }


def resolver_fracciones_parciales(expresion_texto: str) -> dict[str, Any]:
    expresion_original = leer_expresion(expresion_texto, simplificar=False)
    if u in expresion_original.free_symbols:
        raise ValueError("Escribe la función racional usando x.")

    expresion = sp.cancel(expresion_original)
    if not _es_racional_en_x(expresion):
        raise ValueError(
            "Fracciones parciales solo aplica a funciones racionales: polinomio entre polinomio."
        )

    numerador, denominador = sp.fraction(expresion)
    cociente, residuo = sp.div(numerador, denominador, domain="QQ") if denominador != 1 else (numerador, 0)
    descomposicion = sp.apart(expresion, x, full=False)
    sistema_info = _sistema_fracciones_parciales(residuo, denominador)
    resultado = sp.integrate(descomposicion, x)

    if isinstance(resultado, sp.Integral):
        raise ValueError("No pude integrar la descomposición obtenida.")

    pasos_detallados = [
        paso("Integral original", f"\\int {_latex_directo(expresion_original)}\\,dx"),
    ]

    expresion_original_latex = _latex_directo(expresion_original)
    expresion_simplificada_latex = latex(expresion)
    if (
        sp.simplify(expresion_original - expresion) == 0
        and expresion_original_latex != expresion_simplificada_latex
    ):
        pasos_detallados.append(
            paso(
                "Simplificar expresión",
                f"{expresion_original_latex}={expresion_simplificada_latex}",
                "Antes de descomponer en fracciones parciales, el programa cancela factores comunes y trabaja con la forma equivalente más simple."
            )
        )

    pasos_detallados.append(
        paso("Identificar numerador y denominador", f"P(x)={latex(numerador)},\\quad Q(x)={latex(denominador)}")
    )

    if denominador == 1:
        pasos_detallados.append(paso("Caso polinomial", "\\text{La expresión es un polinomio; no necesita descomposición.}"))
    else:
        pasos_detallados.append(paso("Factorizar denominador", f"Q(x)={latex(sp.factor(denominador))}"))
        if residuo != 0 and cociente != 0:
            pasos_detallados.append(paso("División algebraica", f"{latex(expresion)}={latex(cociente)}+\\frac{{{latex(residuo)}}}{{{latex(denominador)}}}"))
        if sistema_info:
            pasos_detallados.extend([
                paso(
                    "Definir constantes",
                    sistema_info["explicacion_constantes"],
                    "A, B, C, etc. son constantes desconocidas: una por cada fracción parcial necesaria."
                ),
                paso(
                    "Forma general",
                    sistema_info["forma_general"],
                    "Se propone una fracción parcial por cada factor del denominador."
                ),
                paso(
                    "Eliminar denominadores",
                    sistema_info["identidad_sin_denominadores"],
                    "Se multiplica toda la igualdad por el denominador común para comparar polinomios."
                ),
                paso(
                    "Sistema de ecuaciones",
                    sistema_info["sistema"],
                    "Se igualan los coeficientes de las mismas potencias de x."
                ),
                paso(
                    "Resolver constantes",
                    sistema_info["valores"],
                    "Estos valores se sustituyen en la descomposición."
                ),
            ])
        pasos_detallados.append(paso("Descomposición", f"{latex(expresion)}={latex(descomposicion)}", "Se acepta una función racional original o una suma ya separada."))

    pasos_detallados.extend([
        paso("Integrar término a término", f"\\int {latex(descomposicion)}\\,dx"),
        paso("Resultado", f"{latex(resultado)}+C"),
        paso("Operación inversa", verificar_resultado(resultado, expresion), "Derivar el resultado debe regresar a la función racional simplificada.", "verificacion"),
    ])

    return construir_respuesta(
        metodo="fracciones_parciales",
        entrada={"expresion": expresion_texto, "variable": "x"},
        resultado_latex=latex(resultado) + " + C",
        pasos_detallados=pasos_detallados,
    )



# ==================================================
# CALCULADORA AUTOMÁTICA
# ==================================================

NOMBRES_METODOS = {
    "constante": "Integral de una constante",
    "potencia": "Regla de potencia",
    "polinomio": "Integral de un polinomio",
    "trigonometrica": "Integral trigonométrica",
    "logaritmica": "Integral logarítmica",
    "exponencial": "Integral exponencial",
    "cambio_variable": "Cambio de variable por composición",
    "por_partes": "Integración por partes",
    "fracciones_parciales": "Fracciones parciales",
    "sustitucion_trigonometrica": "Sustitución trigonométrica",
    "integral_general": "Integración general",
}


def _con_detector(respuesta: dict[str, Any], metodo_detectado: str, razon: str) -> dict[str, Any]:
    """Agrega una tarjeta inicial explicando por qué se eligió el método."""
    nombre = NOMBRES_METODOS.get(metodo_detectado, metodo_detectado)
    pasos = respuesta.setdefault("pasos_detallados", [])
    pasos.insert(
        0,
        paso(
            "Detección automática",
            rf"\text{{Método detectado: }}\ {nombre}",
            razon,
            "deteccion",
        ),
    )
    respuesta["metodo_detectado"] = metodo_detectado
    respuesta["metodo_nombre"] = nombre
    respuesta["detector"] = {"metodo": metodo_detectado, "nombre": nombre, "razon": razon}
    # Regenera la lista simple para compatibilidad con el frontend viejo.
    respuesta["pasos"] = [p.get("latex", "") for p in pasos]
    return respuesta


def _respuesta_simple(
    metodo: str,
    integrando_texto: str,
    integrando: sp.Expr,
    resultado: sp.Expr,
    pasos_extra: list[dict[str, str]],
    razon: str,
    advertencias: list[str] | None = None,
) -> dict[str, Any]:
    pasos_detallados = [
        paso(
            "Integral original",
            rf"\int {latex(integrando)}\,dx",
            "El usuario escribe una sola integral y el sistema decide qué regla aplicar.",
        ),
        *pasos_extra,
        paso(
            "Resultado final",
            rf"{latex(resultado)}+C",
            "Se agrega la constante de integración porque es una integral indefinida.",
            "resultado",
        ),
        paso(
            "Verificación",
            verificar_resultado(resultado, integrando),
            "Al derivar el resultado se debe recuperar el integrando original.",
            "verificacion",
        ),
    ]
    respuesta = construir_respuesta(
        metodo=metodo,
        entrada={"expresion": integrando_texto, "variable": "x"},
        resultado_latex=latex(resultado) + " + C",
        pasos_detallados=pasos_detallados,
        advertencias=advertencias,
    )
    return _con_detector(respuesta, metodo, razon)


def _monomio_potencia(expr: sp.Expr) -> tuple[sp.Expr, sp.Expr] | None:
    """Regresa coeficiente k y exponente n si expr = k*x^n."""
    expr = sp.simplify(expr)
    coeficiente, resto = expr.as_independent(x, as_Add=False)
    if resto == x:
        return sp.simplify(coeficiente), sp.Integer(1)
    if isinstance(resto, sp.Pow) and resto.base == x and resto.exp.is_number:
        return sp.simplify(coeficiente), sp.simplify(resto.exp)
    if expr == x:
        return sp.Integer(1), sp.Integer(1)
    return None


def _resolver_auto_cambio_variable(integrando: sp.Expr) -> tuple[sp.Expr, sp.Expr, sp.Expr, sp.Expr, sp.Expr, sp.Expr] | None:
    """Busca automáticamente una forma f(g(x))g'(x)."""
    candidatos: list[sp.Expr] = []

    def agregar(candidato: sp.Expr) -> None:
        candidato = sp.simplify(candidato)
        if candidato == x or not candidato.has(x):
            return
        if candidato not in candidatos:
            candidatos.append(candidato)

    # Candidatos de funciones compuestas, bases de potencias y denominadores.
    for candidato in _candidatos_funcion_interna(integrando):
        agregar(candidato)
    for factor in sp.Mul.make_args(sp.factor(integrando)):
        for candidato in _candidatos_funcion_interna(factor):
            agregar(candidato)
        if isinstance(factor, sp.Pow):
            base, _expo = factor.as_base_exp()
            agregar(base)

    # También revisa subexpresiones del integrando completo.
    for nodo in sp.preorder_traversal(integrando):
        if isinstance(nodo, sp.Pow):
            base, _expo = nodo.as_base_exp()
            agregar(base)

    for cambio in candidatos:
        derivada_cambio = sp.simplify(sp.diff(cambio, x))
        if derivada_cambio == 0:
            continue
        cociente = sp.simplify(integrando / derivada_cambio)
        funcion_externa = _extraer_funcion_externa(cociente, cambio)
        if funcion_externa is None:
            continue
        primitiva_externa = sp.integrate(funcion_externa, x)
        if isinstance(primitiva_externa, sp.Integral):
            continue
        resultado = sp.simplify(primitiva_externa.subs(x, cambio))
        if sp.simplify(sp.diff(resultado, x) - integrando) == 0:
            return cambio, derivada_cambio, cociente, funcion_externa, primitiva_externa, resultado
    return None


def _respuesta_auto_cambio(integrando_texto: str, integrando: sp.Expr, datos: tuple[sp.Expr, sp.Expr, sp.Expr, sp.Expr, sp.Expr, sp.Expr]) -> dict[str, Any]:
    cambio, derivada_cambio, cociente, funcion_externa, primitiva_externa, resultado = datos
    pasos_detallados = [
        paso("Integral original", rf"\int {latex(integrando)}\,dx"),
        paso(
            "Función interna detectada",
            rf"g(x)={latex(cambio)},\quad g'(x)={latex(derivada_cambio)}",
            "El detector encontró una expresión interna cuya derivada aparece multiplicando al resto de la integral.",
        ),
        paso(
            "Verificar composición",
            rf"\frac{{{latex(integrando)}}}{{{latex(derivada_cambio)}}}={latex(cociente)}=f(g(x))",
            "Al dividir entre g'(x), lo restante se reconoce como una función de g(x).",
        ),
        paso(
            "Función externa",
            rf"f(x)={latex(funcion_externa)}",
            "Se escribe la función externa antes de componerla con g(x).",
        ),
        paso(
            "Integrar la función externa",
            rf"F(x)=\int {latex(funcion_externa)}\,dx={latex(primitiva_externa)}",
        ),
        paso(
            "Resultado final",
            rf"F(g(x))+C={latex(resultado)}+C",
            "Se compone la primitiva externa con la función interna detectada.",
            "resultado",
        ),
        paso("Verificación", verificar_resultado(resultado, integrando), "Se deriva el resultado para comprobarlo.", "verificacion"),
    ]
    respuesta = construir_respuesta(
        metodo="cambio_variable",
        entrada={"expresion": integrando_texto, "variable": "x", "cambio_detectado": latex(cambio)},
        resultado_latex=latex(resultado) + " + C",
        pasos_detallados=pasos_detallados,
    )
    return _con_detector(
        respuesta,
        "cambio_variable",
        "La integral contiene una composición f(g(x)) y también aparece la derivada de la función interna g'(x).",
    )


def _detectar_sustitucion_trigonometrica(integrando: sp.Expr) -> tuple[str, str] | None:
    """Detecta formas clásicas con raíces cuadradas cuadráticas."""
    for potencia in integrando.atoms(sp.Pow):
        base, exponente = potencia.as_base_exp()
        if exponente not in (sp.Rational(1, 2), sp.Rational(-1, 2)):
            continue
        base = sp.expand(base)
        if not base.is_polynomial(x) or sp.degree(base, x) != 2:
            continue
        poly = sp.Poly(base, x)
        a2 = poly.coeff_monomial(x**2)
        a1 = poly.coeff_monomial(x)
        a0 = poly.coeff_monomial(1)
        if a1 != 0:
            continue
        if a2 < 0 and a0 > 0:
            return "Forma a^2-x^2", r"x=a\operatorname{sen}(\theta)"
        if a2 > 0 and a0 > 0:
            return "Forma x^2+a^2", r"x=a\tan(\theta)"
        if a2 > 0 and a0 < 0:
            return "Forma x^2-a^2", r"x=a\sec(\theta)"
    return None


def _tiene_funcion_trigonometrica_anidada(integrando: sp.Expr) -> bool:
    funciones_trig = (sp.sin, sp.cos, sp.tan, sp.sec, sp.csc, sp.cot)
    for nodo in sp.preorder_traversal(integrando):
        if isinstance(nodo, sp.Function) and nodo.func in funciones_trig:
            if any(arg.has(*funciones_trig) for arg in nodo.args):
                return True
    return False


def _respuesta_sust_trig(integrando_texto: str, integrando: sp.Expr, patron: tuple[str, str]) -> dict[str, Any]:
    resultado = sp.integrate(integrando, x)
    if isinstance(resultado, sp.Integral):
        raise ValueError("Se detectó una forma de sustitución trigonométrica, pero no se pudo integrar automáticamente.")
    nombre_patron, cambio = patron
    return _respuesta_simple(
        "sustitucion_trigonometrica",
        integrando_texto,
        integrando,
        sp.simplify(resultado),
        [
            paso(
                "Patrón detectado",
                rf"\text{{{nombre_patron}}},\quad {cambio}",
                "La raíz cuadrática coincide con una de las formas clásicas de sustitución trigonométrica.",
            ),
            paso(
                "Integrar con el cambio trigonométrico",
                rf"\int {latex(integrando)}\,dx={latex(resultado)}",
                "Después del cambio trigonométrico se simplifica y se regresa a la variable x.",
            ),
        ],
        "Aparece una raíz cuadrada con una forma cuadrática clásica: a²-x², x²+a² o x²-a².",
    )


def _resolver_basica_o_general(integrando_texto: str, integrando: sp.Expr) -> dict[str, Any]:
    """Resuelve casos directos y, si no hay otra opción, usa integración general."""
    if not integrando.has(x):
        resultado = sp.simplify(integrando * x)
        return _respuesta_simple(
            "constante",
            integrando_texto,
            integrando,
            resultado,
            [
                paso(
                    "Regla de constante",
                    rf"\int k\,dx=kx+C,\quad k={latex(integrando)}",
                    "La expresión no depende de x, por eso se trata como constante.",
                )
            ],
            "El integrando no contiene la variable x; por eso se reconoce como una constante.",
        )

    mono = _monomio_potencia(integrando)
    if mono is not None:
        k, n = mono
        if sp.simplify(n + 1) == 0:
            resultado = sp.simplify(k * sp.log(x))
            metodo = "logaritmica"
            regla = rf"\int \frac{{1}}{{x}}\,dx=\log|x|+C"
            razon = "La integral contiene x^{-1}, que se resuelve con la regla logarítmica."
        else:
            resultado = sp.simplify(k * x ** (n + 1) / (n + 1))
            metodo = "potencia"
            regla = rf"\int kx^n\,dx=\frac{{k x^{{n+1}}}}{{n+1}}+C,\quad n\ne -1"
            razon = "El integrando tiene la forma k·x^n, así que se aplica la regla de potencia."
        return _respuesta_simple(
            metodo,
            integrando_texto,
            integrando,
            resultado,
            [paso("Regla aplicada", regla), paso("Sustitución en la regla", rf"k={latex(k)},\quad n={latex(n)}")],
            razon,
        )

    if integrando.is_polynomial(x):
        resultado = sp.integrate(integrando, x)
        terminos = sp.Add.make_args(sp.expand(integrando))
        pasos = [
            paso(
                "Separar términos",
                rf"\int \left({latex(integrando)}\right)dx=" + "+".join(rf"\int {latex(t)}\,dx" for t in terminos),
                "Un polinomio se integra término a término.",
            ),
            paso("Aplicar regla de potencia", rf"\int \left({latex(integrando)}\right)dx={latex(resultado)}+C"),
        ]
        return _respuesta_simple(
            "polinomio",
            integrando_texto,
            integrando,
            sp.simplify(resultado),
            pasos,
            "El integrando es un polinomio; cada término se integra con la regla de potencia.",
        )

    if integrando.has(sp.exp):
        resultado = sp.integrate(integrando, x)
        if not isinstance(resultado, sp.Integral):
            return _respuesta_simple(
                "exponencial",
                integrando_texto,
                integrando,
                sp.simplify(resultado),
                [paso("Regla exponencial", rf"\int {latex(integrando)}\,dx={latex(resultado)}+C")],
                "El integrando contiene una función exponencial reconocible.",
            )

    if integrando.has(sp.sin, sp.cos, sp.tan, sp.sec, sp.csc, sp.cot):
        resultado = sp.integrate(integrando, x)
        if not isinstance(resultado, sp.Integral):
            return _respuesta_simple(
                "trigonometrica",
                integrando_texto,
                integrando,
                sp.simplify(resultado),
                [paso("Regla trigonométrica", rf"\int {latex(integrando)}\,dx={latex(resultado)}+C")],
                "El integrando contiene una función trigonométrica directa.",
            )

    if integrando.has(sp.log) or sp.simplify(integrando - 1 / x) == 0:
        resultado = sp.integrate(integrando, x)
        if not isinstance(resultado, sp.Integral):
            metodo = "por_partes" if integrando.has(sp.log) else "logaritmica"
            return _respuesta_simple(
                metodo,
                integrando_texto,
                integrando,
                sp.simplify(resultado),
                [paso("Regla logarítmica", rf"\int {latex(integrando)}\,dx={latex(resultado)}+C")],
                "El integrando contiene logaritmos o la forma 1/x.",
            )

    resultado = sp.integrate(integrando, x)
    if isinstance(resultado, sp.Integral):
        if _tiene_funcion_trigonometrica_anidada(integrando):
            raise ValueError(
                "La expresion si se pudo leer como funcion trigonometrica compuesta, "
                "pero esta integral no tiene una primitiva elemental implementada. "
                "Si corresponde a cambio de variable, escribe tambien el factor derivada interna; "
                "por ejemplo: sen(cos(x))*(-sen(x)) o, en Metodos, f(g(x))=sen(cos(x)) y g'(x)=-sen(x)."
            )
        raise ValueError(
            "No pude detectar un método implementado para esta integral. Prueba reescribirla con *, ^, paréntesis y la variable x."
        )
    return _respuesta_simple(
        "integral_general",
        integrando_texto,
        integrando,
        sp.simplify(resultado),
        [
            paso(
                "Integración general",
                rf"\int {latex(integrando)}\,dx={latex(resultado)}+C",
                "No se detectó un método especial de los módulos, así que se usó integración simbólica general como respaldo.",
            )
        ],
        "No coincidió con los patrones principales; se usó integración general como respaldo.",
        advertencias=["El detector automático es una ayuda: si necesitas forzar un método específico, usa el módulo correspondiente del menú."],
    )


def _resolver_indefinida_automatica(expresion_texto: str) -> dict[str, Any]:
    integrando = leer_expresion(expresion_texto)
    if u in integrando.free_symbols:
        raise ValueError("Usa solamente la variable x en la integral.")

    # 1) Cambio de variable antes que fracciones parciales para casos como x/(x^2+1).
    cambio = _resolver_auto_cambio_variable(integrando)
    if cambio is not None:
        return _respuesta_auto_cambio(expresion_texto, integrando, cambio)

    # 2) Fracciones parciales para funciones racionales no polinomiales.
    if _es_racional_en_x(integrando):
        _num, den = sp.fraction(sp.cancel(integrando))
        if den != 1:
            respuesta = resolver_fracciones_parciales(expresion_texto)
            return _con_detector(
                respuesta,
                "fracciones_parciales",
                "El integrando es una función racional: un polinomio dividido entre otro polinomio.",
            )

    # 3) Sustitución trigonométrica para raíces cuadráticas clásicas.
    patron_sust_trig = _detectar_sustitucion_trigonometrica(integrando)
    if patron_sust_trig is not None:
        return _respuesta_sust_trig(expresion_texto, integrando, patron_sust_trig)

    # 4) Por partes para productos o logaritmos no racionales.
    factores_variables = [f for f in sp.Mul.make_args(sp.factor(integrando)) if f.has(x)]
    if len(factores_variables) >= 2 or integrando.has(sp.log, sp.atan, sp.asin, sp.acos):
        try:
            respuesta = resolver_por_partes(expresion_texto)
            return _con_detector(
                respuesta,
                "por_partes",
                "El integrando es un producto de funciones o contiene una función que normalmente se resuelve por partes.",
            )
        except Exception:
            pass

    # 5) Reglas básicas y respaldo general.
    return _resolver_basica_o_general(expresion_texto, integrando)


def _leer_limite_constante(texto: str, nombre: str) -> sp.Expr:
    validar_max_digitos(texto, nombre)
    limite = leer_expresion(texto)
    if limite.has(x) or limite.has(u):
        raise ValueError(f"El {nombre} debe ser una constante, no una función de x.")
    return sp.simplify(limite)


def _resolver_definida_automatica(expresion_texto: str, limite_inferior: str, limite_superior: str) -> dict[str, Any]:
    integrando = leer_expresion(expresion_texto)
    a = _leer_limite_constante(limite_inferior, "límite inferior")
    b = _leer_limite_constante(limite_superior, "límite superior")

    # Detecta el método indefinido para explicar la primitiva, pero evalúa como integral definida.
    respuesta_indef = _resolver_indefinida_automatica(expresion_texto)
    metodo_detectado = respuesta_indef.get("metodo_detectado", "integral_general")
    nombre = NOMBRES_METODOS.get(metodo_detectado, metodo_detectado)

    primitiva = sp.integrate(integrando, x)
    if isinstance(primitiva, sp.Integral):
        raise ValueError("No pude encontrar una primitiva para evaluar la integral definida.")
    valor = sp.simplify(primitiva.subs(x, b) - primitiva.subs(x, a))

    pasos_detallados = [
        paso(
            "Integral definida original",
            rf"\int_{{{latex(a)}}}^{{{latex(b)}}} {latex(integrando)}\,dx",
            "El sistema detecta primero una primitiva y luego evalúa en los límites.",
        ),
        paso(
            "Método detectado para la primitiva",
            rf"\text{{{nombre}}}",
            respuesta_indef.get("detector", {}).get("razon", "Se seleccionó el método más compatible con la forma del integrando."),
            "deteccion",
        ),
        paso(
            "Primitiva",
            rf"F(x)={latex(primitiva)}",
            "Esta función se evalúa en los límites de integración.",
        ),
        paso(
            "Teorema fundamental del cálculo",
            rf"\int_{{{latex(a)}}}^{{{latex(b)}}} {latex(integrando)}\,dx=F({latex(b)})-F({latex(a)})",
        ),
        paso(
            "Evaluación",
            rf"F({latex(b)})-F({latex(a)})={latex(valor)}",
            "Este es el valor exacto de la integral definida.",
            "resultado",
        ),
    ]
    respuesta = construir_respuesta(
        metodo="automatica",
        entrada={"expresion": expresion_texto, "limite_inferior": limite_inferior, "limite_superior": limite_superior, "variable": "x"},
        resultado_latex=latex(valor),
        pasos_detallados=pasos_detallados,
    )
    respuesta["metodo_detectado"] = metodo_detectado
    respuesta["metodo_nombre"] = f"Integral definida + {nombre}"
    respuesta["detector"] = {"metodo": metodo_detectado, "nombre": nombre, "razon": respuesta_indef.get("detector", {}).get("razon", "")}
    return respuesta


def resolver_integral_automatica(
    expresion_texto: str,
    limite_inferior: str | None = None,
    limite_superior: str | None = None,
) -> dict[str, Any]:
    """Entrada única: el usuario escribe una integral y el sistema elige el método."""
    if limite_inferior not in (None, "") or limite_superior not in (None, ""):
        if limite_inferior in (None, "") or limite_superior in (None, ""):
            raise ValueError("Para integral definida escribe ambos límites: inferior y superior.")
        return _resolver_definida_automatica(expresion_texto, str(limite_inferior), str(limite_superior))
    return _resolver_indefinida_automatica(expresion_texto)
