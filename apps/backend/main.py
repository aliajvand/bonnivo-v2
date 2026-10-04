"""
Bonyo FastAPI Backend Entrypoint
Re-exports the FastAPI app from src.main for seamless local execution with:
    uv run uvicorn main:app --reload
    or
    uv run uvicorn src.main:app --reload
"""
from src.main import app

__all__ = ["app"]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
