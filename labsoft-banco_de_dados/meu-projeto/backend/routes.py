from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Optional
from database import engine
import models
from logic import *
from schemas.auth import LoginInput, RegisterInput
from schemas.usuario import *
from schemas.livros import *
from schemas.assinatura import *
from schemas.avaliacao import *
from schemas.livrousuario import *

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

@app.post("/data/usuarios")
async def create_user_endpoint(user_data: CreateUserInput):
    try:
        return create_user(user_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.put("/data/usuarios")
async def replace_user_endpoint(user_data: ReplaceUserInput):
    try:
        return replace_user(user_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.patch("/data/usuarios/nome")
async def update_user_name_endpoint(user_data: UpdateUserNameInput):
    try:
        return update_user_name(user_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.patch("/data/usuarios/tipo")
async def update_user_tipo_endpoint(user_data: UpdateUserTipoInput):
    try:
        return update_user_tipo(user_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.patch("/data/usuarios/idade")
async def update_user_idade_endpoint(user_data: UpdateUserIdadeInput):
    try:
        return update_user_idade(user_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.delete("/data/usuarios")
async def delete_user_endpoint(user_data: DeleteUserInput):
    try:
        return delete_user(user_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


## livros ##
@app.post("/data/livros")
async def create_book_endpoint(book_data: CreateBookInput):
    try:
        return create_book(book_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.put("/data/livros")
async def replace_book_endpoint(book_data: ReplaceBookInput):
    try:
        return replace_book(book_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.patch("/data/livros/autor")
async def update_book_autor_endpoint(book_data: UpdateBookAutorInput):
    try:
        return update_book_autor(book_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.patch("/data/livros/ano")
async def update_book_ano_endpoint(book_data: UpdateBookAnoInput):
    try:
        return update_book_ano(book_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.patch("/data/livros/pais")
async def update_book_pais_endpoint(book_data: UpdateBookPaisInput):
    try:
        return update_book_pais(book_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.patch("/data/livros/linguagem")
async def update_book_linguagem_endpoint(book_data: UpdateBookLinguagemInput):
    try:
        return update_book_linguagem(book_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.patch("/data/livros/sinopse")
async def update_book_sinopse_endpoint(book_data: UpdateBookSinopseInput):
    try:
        return update_book_sinopse(book_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.patch("/data/livros/capa")
async def update_book_capa_endpoint(book_data: UpdateBookCapaInput):
    try:
        return update_book_capa(book_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.patch("/data/livros/idade")
async def update_book_idade_endpoint(book_data: UpdateBookIdadeInput):
    try:
        return update_book_idade(book_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.patch("/data/livros/titulo")
async def update_book_titulo_endpoint(book_data: UpdateBookTituloInput):
    try:
        return update_book_titulo(book_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.patch("/data/livros/genero")
async def update_book_genero_endpoint(book_data: UpdateBookGeneroInput):
    try:
        return update_book_genero(book_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.delete("/data/livros")
async def delete_book_endpoint(book_data: DeleteBookInput):
    try:
        return delete_book(book_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})

## Assinatura ##

@app.post("/data/assinaturas")
async def create_assinatura_endpoint(assinatura_data: CreateAssinaturaInput):
    try:
        return create_assinatura(assinatura_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.put("/data/assinaturas")
async def replace_assinatura_endpoint(assinatura_data: ReplaceAssinaturaInput):
    try:
        return replace_assinatura(assinatura_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.patch("/data/assinaturas/tipo")
async def update_assinatura_tipo_endpoint(assinatura_data: UpdateAssinaturaTipoInput):
    try:
        return update_assinatura_tipo(assinatura_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.patch("/data/assinaturas/email")
async def update_assinatura_email_endpoint(assinatura_data: UpdateAssinaturaEmailInput):
    try:
        return update_assinatura_email(assinatura_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.patch("/data/assinaturas/senha")
async def update_assinatura_senha_endpoint(assinatura_data: UpdateAssinaturaSenhaInput):
    try:
        return update_assinatura_senha(assinatura_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.delete("/data/assinaturas")
async def delete_assinatura_endpoint(assinatura_data: DeleteAssinaturaInput):
    try:
        return delete_assinatura(assinatura_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})

## Avaliacoes ##

@app.post("/data/avaliacoes")
async def create_avaliacao_endpoint(avaliacao_data: CreateAvaliacaoInput):
    try:
        return create_avaliacao(avaliacao_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.put("/data/avaliacoes")
async def replace_avaliacao_endpoint(avaliacao_data: ReplaceAvaliacaoInput):
    try:
        return replace_avaliacao(avaliacao_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.patch("/data/avaliacoes/comentario")
async def update_avaliacao_comentario_endpoint(avaliacao_data: UpdateAvaliacaoComentarioInput):
    try:
        return update_avaliacao_comentario(avaliacao_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.patch("/data/avaliacoes/estrelas")
async def update_avaliacao_estrelas_endpoint(avaliacao_data: UpdateAvaliacaoEstrelasInput):
    try:
        return update_avaliacao_estrelas(avaliacao_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.delete("/data/avaliacoes")
async def delete_avaliacao_endpoint(avaliacao_data: DeleteAvaliacaoInput):
    try:
        return delete_avaliacao(avaliacao_data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


## livrousuario ##
@app.post("/data/livros_usuario")
async def create_livro_usuario_endpoint(data: CreateLivroUsuarioInput):
    try:
        return create_livro_usuario(data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.put("/data/livros_usuario")
async def replace_livro_usuario_endpoint(data: ReplaceLivroUsuarioInput):
    try:
        return replace_livro_usuario(data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.patch("/data/livros_usuario/lido")
async def update_livro_usuario_lido_endpoint(data: UpdateLidoInput):
    try:
        return update_livro_usuario_lido(data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.patch("/data/livros_usuario/baixado")
async def update_livro_usuario_baixado_endpoint(data: UpdateBaixadoInput):
    try:
        return update_livro_usuario_baixado(data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.patch("/data/livros_usuario/favoritado")
async def update_livro_usuario_favoritado_endpoint(data: UpdateFavoritadoInput):
    try:
        return update_livro_usuario_favoritado(data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.patch("/data/livros_usuario/lendo")
async def update_livro_usuario_lendo_endpoint(data: UpdateLendoInput):
    try:
        return update_livro_usuario_lendo(data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.patch("/data/livros_usuario/pagina")
async def update_livro_usuario_pagina_endpoint(data: UpdatePaginaLendoInput):
    try:
        return update_livro_usuario_pagina(data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})


@app.delete("/data/livros_usuario")
async def delete_livro_usuario_endpoint(data: DeleteLivroUsuarioInput):
    try:
        return delete_livro_usuario(data.model_dump())
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"message": str(exc)})



#@app.put      =>Substituir
#@app.patch    =>Atualizar parcialmente 
#@app.delete   =>DELETE
#@app.post     =>criar

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

