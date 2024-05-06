from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from .api.router import router as api_router

current_file_path = Path(__file__)
static_files_path = current_file_path.parents[1] / 'static'

app = FastAPI(title="Hemophilia Tracker", version="0.0.1")

app.include_router(api_router)

app.mount("/static", StaticFiles(directory=str(static_files_path)), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, you might use '*'; specify domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", response_class=HTMLResponse)
def homepage():
    return FileResponse( static_files_path / 'index.html')
