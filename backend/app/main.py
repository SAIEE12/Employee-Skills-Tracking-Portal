from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .db.base import engine
from .db import models
from .api.routes import auth, employees, trainers, skills, scores

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Employee Skills Tracking API",
    description="A comprehensive API for tracking employee skills and assessments",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    # allow_origins=[settings.frontend_url],
    allow_origins=["*"],  # or your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(employees.router, prefix="/api/v1")
app.include_router(trainers.router, prefix="/api/v1")
app.include_router(skills.router, prefix="/api/v1")
app.include_router(scores.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {
        "message": "Employee Skills Tracking API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"} 