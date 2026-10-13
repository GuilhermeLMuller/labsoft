from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from database import engine
import models
from logic import list_subscription_types, login_account, register_account, list_assinaturas, list_usuarios, list_livros, list_avaliacoes, list_livro_usuario
from schemas.auth import LoginInput, RegisterInput

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

@app.get("/data/assinaturas")
async def get_assinaturas():
    # Implement your logic to retrieve assinaturas here
    return list_assinaturas()  # Placeholder response

@app.get("/data/usuarios")
async def get_usuarios():
    # Implement your logic to retrieve usuarios here
    return list_usuarios()  # Placeholder response

@app.get("/data/livros")
async def get_livros():
    # Implement your logic to retrieve livros here
    return list_livros()  # Placeholder response

@app.get("/data/avaliacoes")
async def get_avaliacoes():
    # Implement your logic to retrieve avaliacoes here
    return list_avaliacoes()  # Placeholder response

@app.get("/data/livro_usuario")
async def get_livro_usuario():
    # Implement your logic to retrieve livro_usuario here
    return list_livro_usuario()  # Placeholder response
