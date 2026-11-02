from pydantic import BaseModel, EmailStr


class CreateAssinaturaInput(BaseModel):
    id_tipo_assinatura: int
    email: EmailStr  # EmailStr valida se o formato do e-mail é válido
    senha_hash: str

class ReplaceAssinaturaInput(BaseModel):
    id_assinatura: int
    id_tipo_assinatura: int
    email: EmailStr
    senha_hash: str

class UpdateAssinaturaTipoInput(BaseModel):
    id_assinatura: int
    id_tipo_assinatura: int

class UpdateAssinaturaEmailInput(BaseModel):
    id_assinatura: int
    email: EmailStr

class UpdateAssinaturaSenhaInput(BaseModel):
    id_assinatura: int
    senha_hash: str

class DeleteAssinaturaInput(BaseModel):
    id_assinatura: int


