from pydantic import BaseModel, EmailStr, Field
from typing import Dict, List, Optional

class CreateUserInput(BaseModel):
    id_assinatura: int
    nome: str
    tipo_usuario: str
    idade: int
    gostos: Optional[List[str]] = []
    estatisticas: Optional[Dict] = {}


class ReplaceUserInput(BaseModel):
    id_usuario: int
    id_assinatura: int
    nome: str
    tipo_usuario: str
    idade: int
    gostos: Optional[List[str]] = []
    estatisticas: Optional[Dict] = {}


class UpdateUserNameInput(BaseModel):
    id_usuario: int
    nome: str


class UpdateUserTipoInput(BaseModel):
    id_usuario: int
    tipo_usuario: str


class UpdateUserIdadeInput(BaseModel):
    id_usuario: int
    idade: int


class DeleteUserInput(BaseModel):
    id_usuario: int