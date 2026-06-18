# Corrección final: método de cambio de variable por composición

Se corrigió únicamente el método de cambio de variable para que no use el procedimiento con una sustitución auxiliar ni despeje x en términos de otra variable.

## Archivos modificados

- `backend-python/CalculadoraDeIntegrales/api_metodos.py`
- `backend-python/CalculadoraDeIntegrales/indefinidas/metodosintegracion/cambiovariable/integralporcambiodevariable.py`
- `codigo html/calculadora.js`
- `codigo html/cambio-variable.html`

## Qué se corrigió

### `backend-python/CalculadoraDeIntegrales/api_metodos.py`

- Se eliminó el uso de la sustitución general como salida del endpoint web.
- El método ahora acepta únicamente el criterio:

  `∫ f(g(x))g'(x) dx = F(g(x)) + C`

- Si la integral no cumple la forma `f(g(x))g'(x)`, el backend devuelve un mensaje claro y no intenta despejar `x`.
- La explicación paso a paso ahora muestra:
  1. Integral original.
  2. Función interna `g(x)`.
  3. Derivada `g'(x)`.
  4. Verificación del criterio de composición.
  5. Función externa `f(x)`.
  6. Primitiva externa `F(x)`.
  7. Aplicación del teorema.
  8. Resultado final.
  9. Verificación por derivación.

### `codigo html/calculadora.js`

- Se actualizó la regla mostrada en el frontend para que use:

  `∫ f(g(x))g'(x) dx = F(g(x)) + C`

- Se eliminó la explicación visual que decía que se cambiaba a una variable auxiliar.
- Actualización posterior: las visualizaciones de Riemann, Darboux y área en integrales fueron retiradas para integrar la nueva sección de cinemática.

### `codigo html/cambio-variable.html`

- Se actualizó la página teórica del método para explicar el criterio por composición.
- Se quitó el procedimiento basado en una variable auxiliar.
- El ejemplo ahora se explica mediante `g(x)`, `g'(x)`, `f(x)` y `F(g(x)) + C`.

### `backend-python/CalculadoraDeIntegrales/indefinidas/metodosintegracion/cambiovariable/integralporcambiodevariable.py`

- Se actualizó el módulo de consola del mismo método para mantener coherencia con el criterio solicitado.
- Ya no fuerza una sustitución general ni despeja `x`.

## Pruebas realizadas

Se verificó sintaxis con:

```bash
node --check "codigo html/calculadora.js"
python -m py_compile app.py api_metodos.py indefinidas/metodosintegracion/cambiovariable/integralporcambiodevariable.py
```

Se probaron casos del endpoint web con FastAPI/TestClient:

- `2*x*cos(x^2)` con `g(x)=x^2` → resultado correcto: `sen(x^2)+C`.
- `3*x^2*exp(x^3)` con `g(x)=x^3` → resultado correcto: `e^(x^3)+C`.
- `2*x*(x^2+1)^3` con `g(x)=x^2+1` → resultado correcto: `(x^2+1)^4/4 + C`.
- `cos(x^2)` con `g(x)=x^2` → rechazo correcto porque falta el factor `g'(x)=2x`.

## Instrucciones de ejecución

Backend:

```bash
cd backend-python/CalculadoraDeIntegrales
python -m pip install -r requirements.txt
python -m uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

Frontend:

Abrir en navegador:

```text
codigo html/metodos-integracion.html
```
