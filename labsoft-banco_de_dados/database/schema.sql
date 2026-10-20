CREATE TYPE tipo_usuario AS ENUM ('administrador', 'autor', 'leitor');

CREATE TABLE tipo_assinatura (
    id_tipo_assinatura INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    valor NUMERIC(10, 2) NOT NULL CHECK (valor >= 0),
    maximo_acessos integer NOT NULL CHECK (maximo_acessos > 0)
);

CREATE TABLE assinatura (
    id_assinatura INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_tipo_assinatura INTEGER NOT NULL REFERENCES tipo_assinatura (id_tipo_assinatura),
    email VARCHAR(254) NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL
);

CREATE TABLE usuario (
    id_usuario INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_assinatura INTEGER NOT NULL REFERENCES assinatura (id_assinatura),
    nome VARCHAR(150) NOT NULL,
    tipo tipo_usuario NOT NULL,
    gostos TEXT[],
    idade SMALLINT CHECK (idade BETWEEN 0 AND 120),
    estatisticas JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE livros (
    id_livro INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    autor VARCHAR(150) NOT NULL,
    ano_de_publicacao SMALLINT CHECK (ano_de_publicacao >= 0),
    pais VARCHAR(100),
    linguagem VARCHAR(100),
    sinopse TEXT,
    titulo VARCHAR(255),
    genero VARCHAR(100),
    restricao_de_idade SMALLINT CHECK (restricao_de_idade >= 0)
);

CREATE TABLE avaliacao (
    id_avaliacao INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuario (id_usuario),
    id_livro INTEGER NOT NULL REFERENCES livros (id_livro),
    comentario TEXT,
    estrelas SMALLINT NOT NULL CHECK (estrelas BETWEEN 1 AND 5)
);

CREATE TABLE livro_usuario (
    id_livro_usuario INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuario (id_usuario),
    id_livro INTEGER NOT NULL REFERENCES livros (id_livro),
    data_visualizado DATE,

    lido BOOLEAN NOT NULL DEFAULT FALSE,
    data_lido DATE,

    baixado BOOLEAN NOT NULL DEFAULT FALSE,
    data_baixado DATE,

    lendo BOOLEAN NOT NULL DEFAULT FALSE,

    pagina_lendo INTEGER CHECK (pagina_lendo >= 0),

    favoritado BOOLEAN NOT NULL DEFAULT FALSE,
    data_favoritado DATE,

    UNIQUE (id_usuario, id_livro)
);
