from pathlib import Path

from fastapi import FastAPI, Depends, HTTPException, Form, APIRouter
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates

from starlette.requests import Request
from starlette.responses import JSONResponse

from sqlalchemy.orm import Session
from sqlalchemy import text

from passlib.context import CryptContext

from .api.router import router as api_router
from . import models, schemas, crud
from .database import SessionLocal, engine
from .schemas import UserSignup

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

router = APIRouter()

templates = Jinja2Templates(directory=str(TEMPLATES_PATH))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


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
def signup(user: UserSignup, db: Session = Depends(get_db)):
    try:
        db_user = crud.get_user_by_username(db, username=user.username)
        if db_user:
            raise HTTPException(status_code=400, detail="Username already registered")
        if user.email:
            db_user = crud.get_user_by_email(db, email=user.email)
            if db_user:
                raise HTTPException(status_code=400, detail="Email already registered")

        user.weekly_infusions = ", ".join(user.weekly_infusions)
        new_user = schemas.UserCreate(
            username=user.username,
            password=user.password,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            peak_level=user.peak_level,
            time_elapsed=user.time_elapsed,
            second_level_measurement=user.second_level_measurement,
            weekly_infusions=user.weekly_infusions,
        )
        crud.create_user(db=db, user=new_user)
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


app.include_router(router)
