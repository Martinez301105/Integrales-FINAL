# Rediseño tipo Symbolab para la calculadora de integrales

Este proyecto ya tenía una arquitectura correcta: frontend en `codigo html/` y backend FastAPI en `backend-python/CalculadoraDeIntegrales/`. La mejora aplicada agrega una capa visual y lógica tipo Symbolab sin romper las funciones anteriores.

## 1. Esquema JSON recomendado backend -> frontend

Todas las rutas nuevas o refactorizadas deben regresar esta estructura:

```json
{
  "ok": true,
  "metodo": "cambio_variable",
  "entrada": {
    "integrando": "2*x*cos(x^2)",
    "cambio": "x^2",
    "variable": "x"
  },
  "resultado": "\\operatorname{sen}{\\left(x^{2} \\right)} + C",
  "resultado_latex": "\\operatorname{sen}{\\left(x^{2} \\right)} + C",
  "pasos": [
    "\\int 2 x \\cos{\\left(x^{2} \\right)}\\,dx",
    "u=x^{2}"
  ],
  "pasos_detallados": [
    {
      "tipo": "calculo",
      "titulo": "Integral original",
      "latex": "\\int 2 x \\cos{\\left(x^{2} \\right)}\\,dx",
      "explicacion": "El usuario escribe únicamente el integrando; no escribe derivadas."
    },
    {
      "tipo": "calculo",
      "titulo": "Elegir el cambio",
      "latex": "u=x^{2}",
      "explicacion": "El cambio se propone como una composición interna g(x)."
    }
  ],
  "ui": {
    "render": "katex",
    "modo": "paso_a_paso",
    "mostrar_resultado_principal": true
  },
  "advertencias": []
}
```

### Por qué se conservan `resultado` y `pasos`

`resultado` y `pasos` se mantienen para no romper el frontend anterior. La interfaz nueva debe usar preferentemente:

- `resultado_latex`
- `pasos_detallados`

## 2. Archivos modificados

### Backend

Archivo principal:

```txt
backend-python/CalculadoraDeIntegrales/api_metodos.py
```

Se agregaron estas funciones auxiliares:

```python
def paso(titulo: str, expresion_latex: str, explicacion: str = "", tipo: str = "calculo") -> dict[str, str]:
    return {
        "tipo": tipo,
        "titulo": titulo,
        "latex": expresion_latex,
        "explicacion": explicacion,
    }


def construir_respuesta(metodo, entrada, resultado_latex, pasos_detallados, advertencias=None):
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
    }
```

Los métodos refactorizados son:

- `resolver_cambio_variable`
- `resolver_por_partes`
- `resolver_fracciones_parciales`

## 3. JavaScript para renderizar LaTeX con KaTeX

Archivo:

```txt
codigo html/calculadora.js
```

Se agregó renderizado con KaTeX y fallback a MathJax:

```javascript
function renderMath(root=document.body){
    if(window.renderMathInElement){
        renderMathInElement(root || document.body, {
            delimiters: [
                {left: "\\[", right: "\\]", display: true},
                {left: "\\(", right: "\\)", display: false},
                {left: "$$", right: "$$", display: true},
                {left: "$", right: "$", display: false}
            ],
            throwOnError: false
        });
    }else if(window.MathJax && MathJax.typesetPromise){
        MathJax.typesetPromise(root ? [root] : undefined);
    }
}
```

También se agregó:

- `mostrarRespuestaAPI(id, titulo, data)` para leer `pasos_detallados`.
- `inputMath(...)` para crear campos con vista previa matemática.
- `tecladoMath(...)` para insertar símbolos matemáticos.
- `insertarMath(...)` para colocar el símbolo en la posición del cursor.
- `actualizarVistaLatex(...)` para previsualizar la expresión mientras el usuario escribe.

## 4. KaTeX en el HTML

Archivo:

```txt
codigo html/metodos-integracion.html
```

Se reemplazó la carga de MathJax por KaTeX en esta página:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"></script>
```

## 5. Cómo probarlo

Desde esta carpeta:

```txt
backend-python/CalculadoraDeIntegrales
```

Ejecuta:

```bash
uvicorn app:app --reload
```

Luego abre:

```txt
codigo html/metodos-integracion.html
```

Pruebas recomendadas:

### Cambio de variable

Integrando:

```txt
2*x*cos(x^2)
```

Cambio:

```txt
x^2
```

### Por partes

```txt
x*exp(x)
```

### Fracciones parciales

```txt
(3*x+5)/(x^2+x-2)
```

## 6. Regla para el equipo

Cada integrante debe devolver pasos con la misma estructura. No regresen texto plano largo. Regresen objetos separados:

```python
paso("Título del paso", "latex puro", "explicación corta")
```

Así el frontend puede mostrar tarjetas, botones de ocultar/mostrar y renderizado limpio.
