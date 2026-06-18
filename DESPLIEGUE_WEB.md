# Despliegue web estable

Esta guia deja la calculadora accesible por URL sin enviar toda la carpeta.

## 1. Subir el proyecto a GitHub

Sube la carpeta `integrales_web_final` a un repositorio de GitHub.

## 2. Backend en Render

1. Entra a Render y crea un servicio desde el repositorio.
2. Usa Blueprint si Render detecta `render.yaml`, o crea un Web Service manual.
3. Configuracion manual equivalente:
   - Root Directory: `backend-python/CalculadoraDeIntegrales`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app:app --host 0.0.0.0 --port $PORT`
   - Health Check Path: `/api/salud`
4. Al terminar, Render entregara una URL parecida a:
   `https://integrales-mac-api.onrender.com`
5. Comprueba que funciona abriendo:
   `https://integrales-mac-api.onrender.com/api/salud`

## 3. Frontend en Netlify

1. Crea un sitio en Netlify desde el mismo repositorio.
2. Netlify puede leer `netlify.toml`.
3. Si lo configuras manualmente:
   - Publish directory: `codigo html`
   - Build command: dejar vacio

## 4. Conectar frontend con backend

Cuando tengas la URL de Render, edita:

`codigo html/config.js`

y cambia:

```js
window.CALCULADORA_API_URL = "";
```

por:

```js
window.CALCULADORA_API_URL = "https://tu-backend.onrender.com";
```

Despues guarda, sube el cambio a GitHub y Netlify actualizara la pagina.

## 5. Prueba sin editar archivos

Tambien puedes probar la pagina agregando `?api=` a la URL del frontend:

```text
https://tu-sitio.netlify.app/calculadora-automatica.html?api=https://tu-backend.onrender.com
```

La pagina guardara esa URL en el navegador para futuras visitas.

## 6. Notas de estabilidad

- En planes gratuitos, Render puede dormir el servicio despues de inactividad.
- La primera peticion despues de dormir puede tardar un poco.
- Para una exposicion de varios dias, Render + Netlify es mucho mas estable que un tunel temporal.
