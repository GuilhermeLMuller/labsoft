from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from database import engine
import models
from logic import list_subscription_types, login_account, register_account
from schemas.auth import LoginInput, RegisterInput
from schemas.usuario import CreateUserInput, ReplaceUserInput, UpdateUserNameInput, UpdateUserTipoInput, UpdateUserIdadeInput, DeleteUserInput 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/auth/plans")
async def subscription_types():
    return list_subscription_types()


@app.post("/auth/register")
async def register(new_account: RegisterInput):
    try:
        return register_account(new_account.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.post("/auth/login")
async def login(login_data: LoginInput):
    try:
        return login_account(login_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=401, content={"message": str(exc)})

## User ##

@app.post("/usuarios")
async def create_user_endpoint(user_data: CreateUserInput):
    try:
        return create_user(user_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.put("/usuarios")
async def replace_user_endpoint(user_data: ReplaceUserInput):
    try:
        return replace_user(user_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.patch("/usuarios/nome")
async def update_user_name_endpoint(user_data: UpdateUserNameInput):
    try:
        return update_user_name(user_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.patch("/usuarios/tipo")
async def update_user_tipo_endpoint(user_data: UpdateUserTipoInput):
    try:
        return update_user_tipo(user_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.patch("/usuarios/idade")
async def update_user_idade_endpoint(user_data: UpdateUserIdadeInput):
    try:
        return update_user_idade(user_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.delete("/usuarios")
async def delete_user_endpoint(user_data: DeleteUserInput):
    try:
        return delete_user(user_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


#@app.put      =>Substituir
#@app.patch    =>Atualizar parcialmente 
#@app.delete   =>DELETE
#@app.post     =>criar