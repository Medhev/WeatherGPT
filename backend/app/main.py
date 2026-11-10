import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.config import settings
from app.database import engine, Base
import app.models  # Ensures all SQLAlchemy models are registered
from app.api.v1 import (
    auth as auth_router,
    weather as weather_router,
    alerts as alerts_router,
    climate as climate_router,
    locations as locations_router,
    preferences as preferences_router,
    chat as chat_router,
    nwp as nwp_router
)

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("weathergpt")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist in SQLite / PostgreSQL
    logger.info("Initializing database schemas...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database schemas initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing database schemas: {e}")
    yield
    # Shutdown
    logger.info("WeatherGPT backend shutting down.")

app = FastAPI(
    title="WeatherGPT: Conversational AI for Weather Forecasting, Alerts, and Climate Information",
    description="MoES / IMD Theme: Disaster Management (Problem ID: 26068). Single unified platform integrating real-time weather APIs, conversational AI, disaster warning advisories, and historical climate analytics.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred while processing the meteorological request."}
    )

# Root Health Checks
@app.get("/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "WeatherGPT API",
        "version": "1.0.0",
        "organization": "Ministry of Earth Sciences (MoES) / IMD",
        "environment": settings.ENVIRONMENT
    }

# Register Versioned API Routers
api_v1_prefix = "/api/v1"
app.include_router(auth_router.router, prefix=api_v1_prefix)
app.include_router(weather_router.router, prefix=api_v1_prefix)
app.include_router(alerts_router.router, prefix=api_v1_prefix)
app.include_router(climate_router.router, prefix=api_v1_prefix)
app.include_router(locations_router.router, prefix=api_v1_prefix)
app.include_router(preferences_router.router, prefix=api_v1_prefix)
app.include_router(chat_router.router, prefix=api_v1_prefix)
app.include_router(nwp_router.router, prefix=api_v1_prefix)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
