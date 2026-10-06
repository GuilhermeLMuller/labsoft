from sqlalchemy import Boolean, Column, Integer, String, DateTime, JSON, Table, ForeignKey
from database import Base
class Usuario(Base):
    __tablename__ = "usuario"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    id_assinatura = Column(Integer, ForeignKey("assinatura.id_assinatura"), nullable=False)
    gostos = Column(String(500), nullable=True)
    idade = Column(Integer, nullable=False)
    estatisticas = Column(JSON, nullable=True)



class Assinatura(Base):
    __tablename__ = "assinatura"

    id_assinatura = Column(Integer, primary_key=True, index=True)
    email = Column(String(254), unique=True, index=True, nullable=False)
    senha_hash = Column(String, nullable=False)
    email_assinante = Column(String(254), nullable=False)
    tipo = Column(String(50), nullable=False, default="mensal")
    quantidade_de_usuarios = Column(Integer, nullable=False, default=1)
class livros(Base):
    __tablename__ = "livros"

    id_livro = Column(Integer, primary_key=True, index=True)
    #titulo = Column(String(150), nullable=False)  colocar título no db depois
    autor = Column(String(150), nullable=False)
    ano_de_publicacao = Column(Integer, nullable=False)
    genero = Column(String(50), nullable=False)
    pais = Column(String(50), nullable=False)
    linguagem = Column(String(50), nullable=False)
    sinopse = Column(String(500), nullable=False)
    restricao_de_idade = Column(Integer, nullable=False)
class avaliacao(Base):
    __tablename__ = "avaliacao"

    id_avaliacao = Column(Integer, primary_key=True, index=True)
    id_livro = Column(Integer, nullable=False)
    id_usuario = Column(Integer, nullable=False)
    estrelas = Column(Integer, nullable=False)
    comentario = Column(String(500), nullable=False)
class tipo_assinatura(Base):
    __tablename__ = "tipo_assinatura"

    id_tipo_assinatura = Column(Integer, primary_key=True, index=True)
    nome = Column(String(50), nullable=False)
    valor = Column(Integer, nullable=False)
    maximo_acessos = Column(Integer, nullable=False)
livro_usuario = Table(
    'livro_usuario', Base.metadata,
    Column('id_livro', Integer, ForeignKey('livros.id_livro')),
    Column('id_usuario', Integer, ForeignKey('usuario.id')),
    Column('id_livro_usuario', Integer, primary_key=True, index=True),
    Column('lido', Boolean, nullable=False, default=False),
    Column('baixado', Boolean, nullable=False, default=False),
    Column('lendo', Boolean, nullable=False, default=False),
    Column('visualizado', Boolean, nullable=False, default=False),
    Column('favoritado', Boolean, nullable=False, default=False),
    Column('data_lido', DateTime, nullable=True),
    Column('data_baixado', DateTime, nullable=True),
    Column('data_favoritado', DateTime, nullable=True),
    Column('data_visualizado', DateTime, nullable=True),
    Column('pagina_lendo', Integer, nullable=True),
)