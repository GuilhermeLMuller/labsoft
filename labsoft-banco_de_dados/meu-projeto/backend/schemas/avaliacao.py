from typing import Optional
from pydantic import BaseModel, Field


class CreateAvaliacaoInput(BaseModel):
    id_usuario: int
    id_livro: int
    comentario: Optional[str] = None
    # Usando o Field do Pydantic para validar as estrelas já na entrada da API
    estrelas: int = Field(..., ge=1, le=5, description="Deve ser entre 1 e 5")

class ReplaceAvaliacaoInput(BaseModel):
    id_avaliacao: int
    id_usuario: int
    id_livro: int
    comentario: Optional[str] = None
    estrelas: int = Field(..., ge=1, le=5)

class UpdateAvaliacaoComentarioInput(BaseModel):
    id_avaliacao: int
    comentario: Optional[str] = None

class UpdateAvaliacaoEstrelasInput(BaseModel):
    id_avaliacao: int
    estrelas: int = Field(..., ge=1, le=5)

class DeleteAvaliacaoInput(BaseModel):
    id_avaliacao: int