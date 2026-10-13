from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Optional
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
async def get_assinaturas(    
    email: Optional[str] = Query(None, description="Filtrar por email"),
    id_tipo_assinatura: Optional[int] = Query(None, description="Filtrar por tipo de assinatura"),
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),):
    # Implement your logic to retrieve assinaturas here
    return list_assinaturas(email=email, id_tipo_assinatura=id_tipo_assinatura, offset=offset, limit=limit)  # Placeholder response

@app.get("/data/usuarios")
async def get_usuarios(
    nome: Optional[str] = Query(None, description="Filtrar por nome"),
    tipo: Optional[str] = Query(None, description="Filtrar por tipo"),
    idade: Optional[int] = Query(None, description="Filtrar por idade"),
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    # Implement your logic to retrieve usuarios here
    return list_usuarios(nome=nome, tipo=tipo, idade=idade, offset=offset, limit=limit)  # Placeholder response

@app.get("/data/livros")
async def get_livros(
    genero: str | None = None,
    autor: str | None = None,
    pais: str | None = None,
    linguagem: str | None = None,
    titulo: str | None = None,
    ano_publicacao: int | None = None,
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    # Implement your logic to retrieve livros here
     return list_livros(genero=genero, autor=autor, pais=pais, linguagem=linguagem, titulo=titulo, ano_publicacao=ano_publicacao, offset=offset, limit=limit)

@app.get("/data/avaliacoes")
async def get_avaliacoes(
    id_usuario: Optional[int] = Query(None, description="Filtrar por ID do usuário"),
    id_livro: Optional[int] = Query(None, description="Filtrar por ID do livro"),
    estrelas: Optional[int] = Query(None, description="Filtrar por número de estrelas"),
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    # Implement your logic to retrieve avaliacoes here
    return list_avaliacoes(id_usuario=id_usuario, id_livro=id_livro, estrelas=estrelas, offset=offset, limit=limit)  # Placeholder response

@app.get("/data/livro_usuario")
async def get_livro_usuario(
    id_usuario: Optional[int] = Query(None),
    id_livro: Optional[int] = Query(None),
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    # Implement your logic to retrieve livro_usuario here
    return list_livro_usuario(id_usuario=id_usuario, id_livro=id_livro, offset=offset, limit=limit)  # Placeholder response
