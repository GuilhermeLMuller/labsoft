from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from database import engine
import models
from logic import list_subscription_types, login_account, register_account
from schemas.auth import LoginInput, RegisterInput
from schemas.usuario import CreateUserInput, ReplaceUserInput, UpdateUserNameInput, UpdateUserTipoInput, UpdateUserIdadeInput, DeleteUserInput 
import schemas.livros

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

#@app.put      =>Substituir
#@app.patch    =>Atualizar parcialmente 
#@app.delete   =>DELETE
#@app.post     =>criar