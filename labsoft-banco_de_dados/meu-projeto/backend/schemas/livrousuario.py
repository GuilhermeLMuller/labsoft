from typing import Optional
from pydantic import BaseModel, Field

class CreateLivroUsuarioInput(BaseModel):
    id_usuario: int
    id_livro: int
    lido: bool = False
    baixado: bool = False
    lendo: bool = False
    pagina_lendo: Optional[int] = Field(None, ge=0)
    favoritado: bool = False

class ReplaceLivroUsuarioInput(BaseModel):
    id_livro_usuario: int
    id_usuario: int
    id_livro: int
    lido: bool = False
    baixado: bool = False
    lendo: bool = False
    pagina_lendo: Optional[int] = Field(None, ge=0)
    favoritado: bool = False

class UpdateLidoInput(BaseModel):
    id_livro_usuario: int
    lido: bool

class UpdateBaixadoInput(BaseModel):
    id_livro_usuario: int
    baixado: bool

class UpdateFavoritadoInput(BaseModel):
    id_livro_usuario: int
    favoritado: bool

class UpdateLendoInput(BaseModel):
    id_livro_usuario: int
    lendo: bool

class UpdatePaginaLendoInput(BaseModel):
    id_livro_usuario: int
    pagina_lendo: int = Field(..., ge=0)

class DeleteLivroUsuarioInput(BaseModel):
    id_livro_usuario: int