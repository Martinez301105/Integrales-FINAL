# Requerimientos avanzados de integración — versión técnica

## RQ-01. Integrales impropias y discontinuidades
- Detectar límites infinitos como impropias de primera especie.
- Detectar problemas en extremos finitos como impropias de segunda especie.
- Detectar discontinuidades internas por muestreo numérico del intervalo abierto.
- Si se detecta impropiedad, mostrar diagnóstico textual y graficar como “posible vista”.
- Si no existe valor numérico confiable, reportar “Sin resultado numérico”.

## RQ-02. Funciones no elementales
- Clasificar integrales sin primitiva elemental estándar: Gauss, Si/Ci, Ei/Li e integrales elípticas.
- No forzar métodos elementales cuando el detector automático no pueda justificar una técnica clásica.
- Estado: requerido para ampliación simbólica posterior.

## RQ-03. Funciones seccionadas, valores absolutos y saltos
- Admitir valores absolutos y funciones por tramos en futuras versiones.
- Particionar automáticamente el intervalo cuando existan raíces relevantes del argumento.
- Estado: requerido para ampliación posterior.

## RQ-04. Bucles recursivos en integración por partes
- Detectar ciclos en subintegrales de productos exponencial-trigonométricos.
- Guardar historial de subintegrales y resolver por despeje algebraico.
- Estado: requerido para ampliación posterior.

## RQ-05. Dominio complejo y cortes de rama
- Separar cálculo real de cálculo complejo.
- Evitar evaluar logaritmos complejos como si fueran reales.
- Estado: fuera del alcance de la interfaz actual; requerido solo para un módulo avanzado.

## RQ-06. Indeterminaciones directas
- Detectar 0/0, infinito/infinito, infinito menos infinito y 0 por infinito en evaluación numérica.
- Simplificar analíticamente antes de cuadratura numérica cuando sea posible.
- Estado: detección parcial por muestreo; simplificación avanzada pendiente.
