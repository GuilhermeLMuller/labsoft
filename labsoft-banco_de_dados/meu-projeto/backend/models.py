from sqlalchemy import Column, Integer, String
from database import Base


class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    email = Column(String(254), unique=True, index=True, nullable=False)
    senha_hash = Column(String, nullable=False)


class Assinatura(Base):
    __tablename__ = "assinatura"

    id_assinatura = Column(Integer, primary_key=True, index=True)
    email = Column(String(254), unique=True, index=True, nullable=False)
    senha_hash = Column(String, nullable=False)
    email_assinante = Column(String(254), nullable=False)
    tipo = Column(String(50), nullable=False)
    quantidade_de_usuarios = Column(Integer, nullable=False)
    