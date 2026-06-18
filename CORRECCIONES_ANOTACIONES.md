# Correcciones aplicadas a las anotaciones

## Archivos modificados

- `backend-python/CalculadoraDeIntegrales/api_metodos.py`
- `codigo html/calculadora.js`
- `codigo html/estilos-calculadora.css`
- `codigo html/metodos-integracion.html`
- `codigo html/integral-definida.html`
- `codigo html/cinematica.html`
- `codigo html/tabla-integrales.html`

## 1. Hipervínculos a LaTeX o a la página

Se agregaron enlaces de teoría en las respuestas del backend y en las páginas HTML. Ahora cambio de variable, por partes, fracciones parciales y trapecio muestran una hipervínculo local al archivo glosario.pdf.

## 2. Método del trapecio en LaTeX

En `calculadora.js` se agregó la función `formulaTrapecioLatex(...)`. El área entre curvas y la cinemática muestran la fórmula:

```latex
T_n=\frac{h}{2}\left[f(a)+2\sum_{i=1}^{n-1}f(x_i)+f(b)\right]
```

También se muestra el valor de `h`, el número de trapecios y el resultado aproximado.

## 3. Explicación en cinemática

No se agregó una grabación real porque el proyecto es HTML/JS/Python sin sistema de audio integrado. En su lugar, se añadió explicación textual guiada: qué son `t1`, `t2`, `v(t)`, `|v(t)|` y cómo se obtiene el resultado.

## 4. Instrucciones en los pasos

Cada paso importante ahora trae una explicación en lenguaje sencillo. Por ejemplo: primero mostrar la función, luego aplicar fórmula, luego resolver y finalmente verificar.

## 5. Atajos más claros

Se resaltó el teorema formal de integración por partes y el criterio `f(g(x))g'(x)` en cambio de variable. También se explica cuándo conviene usar el método del trapecio.

## 6. Aviso cuando se trunca o aproxima

Los cálculos numéricos con trapecio ahora muestran una advertencia clara: el resultado es aproximado, no exacto. Se indica el número de trapecios usado.

## 7. Demostración de la derivación

La verificación del backend ahora muestra explícitamente la derivada del resultado y la compara contra el integrando original.

## 8. Tomar f(x) y mostrarla

Cambio de variable, por partes y fracciones parciales ahora inician mostrando `f(x)=...` antes de resolver.

## 9. Reducción en fracciones parciales

En fracciones parciales se agregó el paso de división algebraica cuando el numerador tiene grado mayor o igual que el denominador.

## 10. Descomposición en fracciones parciales

El backend ahora muestra una forma general con constantes `A`, `B`, etc., antes de mostrar la descomposición calculada.

## 11. Descomposición en LaTeX

La función original, la forma general, la descomposición y el resultado final se devuelven en LaTeX.

## 12. Cambiar seno inglés por `sen`

La interfaz ahora usa `sen` para el usuario. Internamente Python y JavaScript conservan las funciones nativas de sus librerías, pero la salida visual muestra `sen` usando `\operatorname{sen}` para que MathJax/KaTeX lo rendericen bien.

## 13. Hipervínculos para teoría

Se agregaron enlaces para:

- Método del trapecio
- Cambio de variable
- Integración por partes
- Fracciones parciales
- Integrales impropias

## 14. Quitar LaTeX donde no es necesario

El texto explicativo se dejó como texto normal en `explicacion`. El LaTeX se usa solamente en fórmulas y resultados.

## 15. Operación inversa

Después de integrar, el backend deriva la respuesta para verificar si regresa al integrando original.

## 16. Comentarios a integrales impropias

Se añadió un panel en `integral-definida.html` explicando qué son, cuándo aparecen, y qué significa converger o diverger.

## Cómo probar

### Backend

Desde:

```bash
cd backend-python/CalculadoraDeIntegrales
uvicorn app:app --reload
```

Pruebas recomendadas:

- Cambio de variable: `2*x*cos(x^2)` con `g(x)=x^2`
- Por partes: `x*exp(x)`
- Fracciones parciales: `(3*x+5)/(x^2+x-2)`

### Frontend

Abre `codigo html/index.html` en el navegador y entra a:

- Métodos de integración
- Integral definida / Área entre curvas
- Cinemática

## Ejemplos esperados

### Cambio de variable

Entrada:

```text
2*x*cos(x^2)
g(x)=x^2
```

Salida esperada:

```text
sen(x^2)+C
```

Además debe mostrar la derivada para comprobar el resultado.

### Fracciones parciales

Entrada:

```text
(3*x+5)/(x^2+x-2)
```

Debe mostrar:

- f(x)
- P(x) y Q(x)
- denominador factorizado
- forma con A y B
- descomposición calculada
- resultado
- verificación derivando

### Trapecio

En área entre curvas o cinemática debe aparecer la fórmula del trapecio en LaTeX y una advertencia de aproximación.
