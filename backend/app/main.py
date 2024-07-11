from pathlib import Path

from fastapi import FastAPI, Depends, HTTPException, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates

from sqlalchemy.orm import Session
from sqlalchemy import text

from passlib.context import CryptContext

from .api.router import router as api_router
from . import models, schemas, crud
from .database import SessionLocal, engine

import hashlib
import time
from fastapi.responses import Response
from user_agents import parse
from .models import UserLog
from .database import SessionLocal
from .utils import generate_user_id

STATIC_PATH = Path(__file__).parents[1] / 'static'
TEMPLATES_PATH = Path(__file__).parents[1] / 'templates'

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Hemophilia Tracker", version="0.0.1")

app.include_router(api_router)

app.mount("/static", StaticFiles(directory=str(STATIC_PATH)), name="static")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, you might use '*'; specify domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory=str(TEMPLATES_PATH))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Middleware to log user data
@app.middleware("http")
async def log_user_data(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time

    if app.config.get("Use_DB") == "True":
        user_agent = parse(request.headers.get("User-Agent", ""))
        user_id = generate_user_id(request.client.host, str(user_agent))
        ip_address = request.headers.get("X-Forwarded-For", request.client.host)
        browser = user_agent.browser.family
        operating_system = user_agent.os.family
        language_preferences = request.headers.get("Accept-Language", "")
        time_zone = request.headers.get("timezone", "")
        referrer = request.headers.get("Referer", "")
        cookies = request.headers.get("cookie", "")
        route_accessed = request.url.path
        number_of_pictures = None

        if route_accessed == "/uploader" and request.method == "POST":
            form = await request.form()
            number_of_pictures = len(form.getlist("files"))

        elif route_accessed == "/solver" and request.method == "POST":
            json_body = await request.json()
            if "images" in json_body:
                number_of_pictures = len(json_body["images"])

        log_entry = UserLog(
            user_id=user_id,
            ip_address=ip_address,
            browser=browser,
            operating_system=operating_system,
            language_preferences=language_preferences,
            time_zone=time_zone,
            referrer=referrer,
            cookies=cookies,
            route_accessed=route_accessed,
            number_of_pictures=number_of_pictures,
        )

        db = SessionLocal()
        try:
            db.add(log_entry)
            db.commit()
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()

    return response

def generate_user_id(ip_address: str, user_agent: str) -> str:
    unique_string = f"{ip_address}-{user_agent}"
    return hashlib.md5(unique_string.encode()).hexdigest()

@app.get("/test-db-connection")
def test_db_connection(db: Session = Depends(get_db)):
    try:
        # Attempt to execute a simple query
        result = db.execute(text("SELECT 1"))
        return {"status": "success", "result": result.fetchall()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/login", response_class=HTMLResponse)
def get_login_form(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})


@app.post("/login")
def login(
        username: str = Form(...),
        password: str = Form(...),
        db: Session = Depends(get_db)
):
    db_user = crud.get_user_by_username(db, username=username)
    if db_user is None:
        raise HTTPException(status_code=400, detail="Invalid username or password")
    if not crud.verify_password(password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid username or password")
    return RedirectResponse(url=f"/users/{username}", status_code=303)


@app.get("/users/", response_class=HTMLResponse)
def read_user(email: str, request: Request, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=email)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return templates.TemplateResponse("user.html", {"request": request, "user": db_user})


@app.get("/signup", response_class=HTMLResponse)
def get_signup_form(request: Request):
    return templates.TemplateResponse("signup.html", {"request": request})


@app.post("/signup")
def signup(
        username: str = Form(...),
        password: str = Form(...),
        email: str = Form(None),
        first_name: str = Form(""),
        last_name: str = Form(""),
        peak_level: float = Form(None),
        time_elapsed: float = Form(None),
        second_level_measurement: float = Form(None),
        weekly_infusions: str = Form(None),
        db: Session = Depends(get_db)
):
    try:
        user = schemas.UserCreate(
            username=username,
            password=password,
            email=email,
            first_name=first_name,
            last_name=last_name,
            peak_level=peak_level,
            time_elapsed=time_elapsed,
            second_level_measurement=second_level_measurement,
            weekly_infusions=weekly_infusions,
        )
        db_user = crud.get_user_by_username(db, username=user.username)
        if db_user:
            raise HTTPException(status_code=400, detail="Username already registered")
        if user.email:
            db_user = crud.get_user_by_email(db, email=user.email)
            if db_user:
                raise HTTPException(status_code=400, detail="Email already registered")
        crud.create_user(db=db, user=user)
        return RedirectResponse(url="/", status_code=303)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/users/")
def read_user(email: str, request: Request, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=email)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return templates.TemplateResponse("user.html", {"request": request, "user": db_user})


@app.get("/users/{username}", response_class=HTMLResponse)
def read_user_by_username(username: str, request: Request, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=username)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return templates.TemplateResponse("user.html", {"request": request, "user": db_user})


@app.delete("/users/{username}", response_class=HTMLResponse)
def delete_user_by_username(username: str, db: Session = Depends(get_db)):
    success = crud.delete_user_by_username(db, username)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"detail": "User deleted"}


@app.delete("/users/")
def delete_user_by_email(email: str, db: Session = Depends(get_db)):
    success = crud.delete_user_by_email(db, email)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"detail": "User deleted"}


@app.get("/", response_class=HTMLResponse)
def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})
