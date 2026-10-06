from fastapi import FastAPI, Body
from fastapi.responses import JSONResponse

from database import engine
import models
from logic import register_user, login_user

app = FastAPI()
models.Base.metadata.create_all(bind=engine)


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.post("/auth/register")
async def register(new_user: dict = Body(...)):
    try:
        return register_user(new_user)
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.post("/auth/login")
async def login(login_data: dict = Body(...)):
    try:
        return login_user(login_data)
    except ValueError as exc:
        return JSONResponse(status_code=401, content={"message": str(exc)})