from pydantic import BaseModel, EmailStr, Field

class CreateBookInput(BaseModel):
    autor: str
    titulo: Optional[str] = None
    ano_de_publicacao: Optional[int] = None
    pais: Optional[str] = None
    linguagem: Optional[str] = None
    sinopse: Optional[str] = None
    genero: Optional[str] = None
    restricao_de_idade: Optional[int] = None

class ReplaceBookInput(BaseModel):
    id_livro: int
    autor: str
    titulo: Optional[str] = None
    ano_de_publicacao: Optional[int] = None
    pais: Optional[str] = None
    linguagem: Optional[str] = None
    sinopse: Optional[str] = None
    genero: Optional[str] = None
    restricao_de_idade: Optional[int] = None

class UpdateBookAutorInput(BaseModel):
    id_livro: int
    autor: str

class UpdateBookAnoInput(BaseModel):
    id_livro: int
    ano_de_publicacao: int

class UpdateBookPaisInput(BaseModel):
    id_livro: int
    pais: str

class UpdateBookLinguagemInput(BaseModel):
    id_livro: int
    linguagem: str

class UpdateBookSinopseInput(BaseModel):
    id_livro: int
    sinopse: str

class UpdateBookCapaInput(BaseModel):
    id_livro: int
    capa: str

class UpdateBookIdadeInput(BaseModel):
    id_livro: int
    restricao_de_idade: int

class UpdateBookTituloInput(BaseModel):
    id_livro: int
    titulo: str

class UpdateBookGeneroInput(BaseModel):
    id_livro: int
    genero: str

class DeleteBookInput(BaseModel):
    id_livro: int