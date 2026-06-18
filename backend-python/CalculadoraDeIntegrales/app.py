import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

try:
    from api_metodos import (
        resolver_cambio_variable,
        resolver_cambio_variable_por_factores,
        resolver_por_partes,
        resolver_fracciones_parciales,
        resolver_integral_automatica,
    )
except ImportError:  # Permite ejecutar también como paquete: python -m uvicorn CalculadoraDeIntegrales.app:app
    from .api_metodos import (
        resolver_cambio_variable,
        resolver_cambio_variable_por_factores,
        resolver_por_partes,
        resolver_fracciones_parciales,
        resolver_integral_automatica,
    )

app = FastAPI(title="Calculadora de Integrales MAC")

origins_config = os.getenv("FRONTEND_ORIGINS", "*").strip()
if origins_config == "*":
    allow_origins = ["*"]
else:
    allow_origins = [origen.strip() for origen in origins_config.split(",") if origen.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=allow_origins != ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class CambioVariableRequest(BaseModel):
    # Modo nuevo del formulario: el usuario escribe los dos factores del teorema.
    compuesta: Optional[str] = None
    derivada: Optional[str] = None

    # Modo anterior conservado para no romper compatibilidad.
    integrando: Optional[str] = None
    cambio: Optional[str] = None


class PorPartesRequest(BaseModel):
    integrando: str


class FraccionesParcialesRequest(BaseModel):
    expresion: str


class IntegralAutomaticaRequest(BaseModel):
    expresion: str
    limite_inferior: Optional[str] = None
    limite_superior: Optional[str] = None


@app.get("/")
def inicio():
    return {"ok": True, "mensaje": "API de la Calculadora de Integrales activa"}


@app.get("/api/salud")
def salud():
    return {"ok": True}


@app.post("/api/metodos/cambio_variable")
@app.post("/api/metodos/cambio-variable")
def cambio_variable(datos: CambioVariableRequest):
    try:
        if datos.compuesta and datos.derivada:
            return resolver_cambio_variable_por_factores(datos.compuesta, datos.derivada)

        if datos.integrando and datos.cambio:
            return resolver_cambio_variable(datos.integrando, datos.cambio)

        raise ValueError(
            "Faltan datos. Para cambio de variable escribe f(g(x)) y g'(x), "
            "por ejemplo: cos(x^2) y 2*x."
        )
    except Exception as error:
        raise HTTPException(status_code=400, detail=str(error))


@app.post("/api/metodos/por_partes")
@app.post("/api/metodos/por-partes")
def por_partes(datos: PorPartesRequest):
    try:
        return resolver_por_partes(datos.integrando)
    except Exception as error:
        raise HTTPException(status_code=400, detail=str(error))


@app.post("/api/metodos/fracciones_parciales")
@app.post("/api/metodos/fracciones-parciales")
def fracciones_parciales(datos: FraccionesParcialesRequest):
    try:
        return resolver_fracciones_parciales(datos.expresion)
    except Exception as error:
        raise HTTPException(status_code=400, detail=str(error))

@app.post("/api/integrales/automatica")
@app.post("/api/integrales/auto")
def integral_automatica(datos: IntegralAutomaticaRequest):
    try:
        return resolver_integral_automatica(
            datos.expresion,
            limite_inferior=datos.limite_inferior,
            limite_superior=datos.limite_superior,
        )
    except Exception as error:
        raise HTTPException(status_code=400, detail=str(error))
