from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    Date,
    Enum,
    ForeignKey,
    Identity,
    Integer,
    Numeric,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
    text,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB

from database import Base


class TipoAssinatura(Base):
    __tablename__ = "tipo_assinatura"
    __table_args__ = (
        CheckConstraint("valor >= 0", name="ck_tipo_assinatura_valor"),
        CheckConstraint(
            "maximo_acessos > 0",
            name="ck_tipo_assinatura_maximo_acessos",
        ),
    )

    id_tipo_assinatura = Column(Integer, Identity(always=True), primary_key=True)
    nome = Column(String(50), nullable=False, unique=True)
    valor = Column(Numeric(10, 2), nullable=False)
    maximo_acessos = Column(Integer, nullable=False)


class Assinatura(Base):
    __tablename__ = "assinatura"

    id_assinatura = Column(Integer, Identity(always=True), primary_key=True)
    id_tipo_assinatura = Column(
        Integer,
        ForeignKey("tipo_assinatura.id_tipo_assinatura"),
        nullable=False,
    )
    email = Column(String(254), nullable=False, unique=True)
    senha_hash = Column(Text, nullable=False)


class Usuario(Base):
    __tablename__ = "usuario"
    __table_args__ = (
        CheckConstraint("idade BETWEEN 0 AND 120", name="ck_usuario_idade"),
    )

    id_usuario = Column(Integer, Identity(always=True), primary_key=True)
    id_assinatura = Column(
        Integer,
        ForeignKey("assinatura.id_assinatura"),
        nullable=False,
    )
    nome = Column(String(150), nullable=False)
    tipo = Column(
        Enum("administrador", "autor", "leitor", name="tipo_usuario"),
        nullable=False,
    )
    gostos = Column(ARRAY(Text), nullable=True)
    idade = Column(SmallInteger, nullable=True)
    estatisticas = Column(
        JSONB,
        nullable=False,
        server_default=text("'{}'::jsonb"),
    )


class Livro(Base):
    __tablename__ = "livros"
    __table_args__ = (
        CheckConstraint(
            "ano_de_publicacao >= 0",
            name="ck_livros_ano_de_publicacao",
        ),
        CheckConstraint(
            "restricao_de_idade >= 0",
            name="ck_livros_restricao_de_idade",
        ),
    )

    id_livro = Column(Integer, Identity(always=True), primary_key=True)
    autor = Column(String(150), nullable=False)
    ano_de_publicacao = Column(SmallInteger, nullable=True)
    pais = Column(String(100), nullable=True)
    linguagem = Column(String(100), nullable=True)
    sinopse = Column(Text, nullable=True)
    capa = Column(Text, nullable=True)
    titulo = Column(String(255), nullable=True)
    genero = Column(String(100), nullable=True)
    restricao_de_idade = Column(SmallInteger, nullable=True)


class Avaliacao(Base):
    __tablename__ = "avaliacao"
    __table_args__ = (
        CheckConstraint("estrelas BETWEEN 1 AND 5", name="ck_avaliacao_estrelas"),
    )

    id_avaliacao = Column(Integer, Identity(always=True), primary_key=True)
    id_usuario = Column(
        Integer,
        ForeignKey("usuario.id_usuario"),
        nullable=False,
    )
    id_livro = Column(Integer, ForeignKey("livros.id_livro"), nullable=False)
    comentario = Column(Text, nullable=True)
    estrelas = Column(SmallInteger, nullable=False)


class LivroUsuario(Base):
    __tablename__ = "livro_usuario"
    __table_args__ = (
        CheckConstraint("pagina_lendo >= 0", name="ck_livro_usuario_pagina_lendo"),
        UniqueConstraint("id_usuario", "id_livro", name="uq_livro_usuario_usuario_livro"),
    )

    id_livro_usuario = Column(Integer, Identity(always=True), primary_key=True)
    id_usuario = Column(
        Integer,
        ForeignKey("usuario.id_usuario"),
        nullable=False,
    )
    id_livro = Column(Integer, ForeignKey("livros.id_livro"), nullable=False)
    lido = Column(Boolean, nullable=False, server_default=text("false"))
    baixado = Column(Boolean, nullable=False, server_default=text("false"))
    data_lido = Column(Date, nullable=True)
    data_baixado = Column(Date, nullable=True)
    lendo = Column(Boolean, nullable=False, server_default=text("false"))
    pagina_lendo = Column(Integer, nullable=True)
    data_favoritado = Column(Date, nullable=True)
    favoritado = Column(Boolean, nullable=False, server_default=text("false"))
    visualizado = Column(Boolean, nullable=False, server_default=text("false"))
    data_visualizado = Column(Date, nullable=True)
