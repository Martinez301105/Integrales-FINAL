# Calculadora de Integrales MAC

Proyecto web para consultar y resolver temas de calculo integral: integrales indefinidas, integrales definidas, metodos de integracion, cinematica, tablas de apoyo y glosario.

## Estructura

- `codigo html/`: frontend estatico de la pagina.
- `backend-python/CalculadoraDeIntegrales/`: API en Python/FastAPI para los metodos de calculo.
- `netlify.toml`: configuracion para publicar el frontend.
- `render.yaml`: configuracion para publicar la API.

## Uso local

Para abrir la pagina estatica:

```bash
codigo html/index.html
```

Para ejecutar la API:

```bash
cd backend-python/CalculadoraDeIntegrales
pip install -r requirements.txt
uvicorn app:app --reload
```

La pagina usa MathJax desde CDN, por lo que algunas formulas requieren conexion a internet para renderizarse correctamente.
